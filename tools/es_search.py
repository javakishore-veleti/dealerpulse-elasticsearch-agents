"""
DealerPulse — Elasticsearch Search Tool
Provides semantic and keyword search across dealer indices.
"""
import json
from typing import Optional
from langchain_core.tools import tool
from config.es_config import get_es_client


@tool
def search_inventory(query: str, filters: Optional[str] = None, size: int = 5) -> str:
    """
    Search dealer vehicle inventory using text matching.
    
    Args:
        query: Natural language search (e.g., "mid-size SUV AWD under 45000")
        filters: Optional JSON filter object (e.g., '{"status": "in_stock"}')
        size: Number of results to return (default 5)
    
    Returns:
        Matching vehicles with details including price, incentives, and days on lot.
    """
    es = get_es_client()
    
    must_clauses = [
        {
            "multi_match": {
                "query": query,
                "fields": ["make^2", "model^3", "trim", "body_style^2", "features", "exterior_color"],
                "type": "best_fields",
                "fuzziness": "AUTO"
            }
        }
    ]
    
    filter_clauses = []
    if filters:
        try:
            filter_dict = json.loads(filters)
            for key, value in filter_dict.items():
                if isinstance(value, dict) and any(k in value for k in ["gte", "lte", "gt", "lt"]):
                    filter_clauses.append({"range": {key: value}})
                else:
                    filter_clauses.append({"term": {key: value}})
        except json.JSONDecodeError:
            pass
    
    body = {
        "query": {
            "bool": {
                "must": must_clauses,
                "filter": filter_clauses
            }
        },
        "size": size,
        "sort": [{"_score": "desc"}, {"days_on_lot": "desc"}],
    }
    
    result = es.search(index="dealer-inventory", body=body)
    
    hits = result.get("hits", {}).get("hits", [])
    if not hits:
        return "No matching vehicles found in inventory."
    
    vehicles = []
    for hit in hits:
        v = hit["_source"]
        vehicles.append(
            f"• {v['year']} {v['make']} {v['model']} {v['trim']} "
            f"({v['exterior_color']}) — Stock #{v['stock_number']}\n"
            f"  MSRP: ${v['msrp']:,.0f} | Dealer Price: ${v['dealer_price']:,.0f} | "
            f"Status: {v['status']} | Days on Lot: {v['days_on_lot']}\n"
            f"  Features: {', '.join(v.get('features', [])[:5])}\n"
            f"  VIN: {v['vin']}"
        )
    
    return f"Found {len(hits)} matching vehicles:\n\n" + "\n\n".join(vehicles)


@tool
def search_leads(query: str, status: Optional[str] = None, size: int = 10) -> str:
    """
    Search customer leads by name, vehicle preference, or status.
    
    Args:
        query: Search text (customer name, vehicle preference, etc.)
        status: Filter by status (new, contacted, test_drive, negotiation, closed_won, closed_lost)
        size: Number of results (default 10)
    
    Returns:
        Matching leads with customer details and preferences.
    """
    es = get_es_client()
    
    must_clauses = [
        {
            "multi_match": {
                "query": query,
                "fields": ["customer_name^2", "preferred_vehicle", "preferred_features", "notes"],
                "fuzziness": "AUTO"
            }
        }
    ]
    
    filter_clauses = []
    if status:
        filter_clauses.append({"term": {"status": status}})
    
    body = {
        "query": {"bool": {"must": must_clauses, "filter": filter_clauses}},
        "size": size,
        "sort": [{"submitted_at": "desc"}],
    }
    
    result = es.search(index="dealer-leads", body=body)
    hits = result.get("hits", {}).get("hits", [])
    
    if not hits:
        return "No matching leads found."
    
    leads = []
    for hit in hits:
        l = hit["_source"]
        leads.append(
            f"• {l['customer_name']} — {l['status'].upper()}\n"
            f"  Wants: {l['preferred_vehicle']} | Budget: ${l.get('budget_min', 0):,.0f}-${l.get('budget_max', 0):,.0f}\n"
            f"  Trade-in: {l.get('trade_in_vehicle', 'None')} (Est: ${l.get('trade_in_value', 0):,.0f})\n"
            f"  Channel: {l['channel']} | Submitted: {l['submitted_at']}"
        )
    
    return f"Found {len(hits)} leads:\n\n" + "\n\n".join(leads)


@tool
def search_tsb_recalls(query: str, size: int = 5) -> str:
    """
    Search Technical Service Bulletins (TSBs) and recall notices.
    Matches on symptoms, DTC codes, affected models, and fix descriptions.
    
    Args:
        query: Symptom description, DTC code, or vehicle info (e.g., "P0300 rough idle Silverado")
        size: Number of results (default 5)
    
    Returns:
        Matching TSBs/recalls with fix details and labor estimates.
    """
    es = get_es_client()
    
    body = {
        "query": {
            "multi_match": {
                "query": query,
                "fields": [
                    "symptom_keywords^3",
                    "dtc_codes^3",
                    "affected_models^2",
                    "fix_description",
                    "bulletin_title",
                    "complaint_description"
                ],
                "type": "best_fields",
                "fuzziness": "AUTO"
            }
        },
        "size": size,
    }
    
    result = es.search(index="dealer-tsb-recalls", body=body)
    hits = result.get("hits", {}).get("hits", [])
    
    if not hits:
        return "No matching TSBs or recalls found."
    
    bulletins = []
    for hit in hits:
        b = hit["_source"]
        score = hit.get("_score", 0)
        bulletins.append(
            f"• [{b['bulletin_type'].upper()}] {b['bulletin_id']} — {b['bulletin_title']} "
            f"(Relevance: {score:.1f})\n"
            f"  Models: {', '.join(b['affected_models'])} ({b['affected_years']})\n"
            f"  DTCs: {', '.join(b.get('dtc_codes', ['N/A']))}\n"
            f"  Symptoms: {', '.join(b['symptom_keywords'])}\n"
            f"  Fix: {b['fix_description']}\n"
            f"  Parts: {', '.join(b.get('parts_required', ['N/A']))} | "
            f"Labor: {b['labor_hours']} hrs"
        )
    
    return f"Found {len(hits)} matching bulletins:\n\n" + "\n\n".join(bulletins)


@tool
def search_service_history(vin: str) -> str:
    """
    Retrieve complete service history for a specific vehicle by VIN.
    
    Args:
        vin: Vehicle Identification Number
    
    Returns:
        Service order history for this vehicle.
    """
    es = get_es_client()
    
    body = {
        "query": {"term": {"vin": vin}},
        "size": 20,
        "sort": [{"created_at": "desc"}],
    }
    
    result = es.search(index="dealer-service-orders", body=body)
    hits = result.get("hits", {}).get("hits", [])
    
    if not hits:
        return f"No service history found for VIN {vin}."
    
    orders = []
    for hit in hits:
        o = hit["_source"]
        orders.append(
            f"• RO#{o['ro_number']} — {o['status'].upper()} ({o['created_at']})\n"
            f"  Complaint: {o['complaint_text']}\n"
            f"  DTCs: {', '.join(o.get('dtc_codes', ['None']))}\n"
            f"  Cause: {o.get('cause_text', 'Pending')}\n"
            f"  Correction: {o.get('correction_text', 'Pending')}\n"
            f"  Tech: {o['technician_name']} | Hours: {o.get('actual_hours', 'N/A')}"
        )
    
    return f"Service history for VIN {vin} ({len(hits)} records):\n\n" + "\n\n".join(orders)
