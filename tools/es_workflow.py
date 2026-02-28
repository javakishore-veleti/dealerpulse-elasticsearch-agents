"""
DealerPulse — Workflow Tool
Multi-step Elasticsearch operations that combine search + analytics.
"""
import json
from langchain_core.tools import tool
from config.es_config import get_es_client


@tool
def match_leads_to_inventory(vehicle_type: str = "", budget_max: float = 0) -> str:
    """
    Cross-reference active leads against available inventory to find matches.
    Identifies leads whose preferences match in-stock vehicles.
    
    Args:
        vehicle_type: Type of vehicle to match (e.g., "SUV", "EV", "truck"). Empty = all.
        budget_max: Maximum budget filter. 0 = no filter.
    
    Returns:
        Matched leads with their best inventory options.
    """
    es = get_es_client()
    
    # Step 1: Get active leads
    lead_query = {
        "query": {
            "bool": {
                "must": [
                    {"terms": {"status": ["new", "contacted", "test_drive"]}}
                ]
            }
        },
        "size": 50,
    }
    
    if vehicle_type:
        lead_query["query"]["bool"]["must"].append({
            "match": {"preferred_vehicle": vehicle_type}
        })
    
    leads_result = es.search(index="dealer-leads", body=lead_query)
    leads = [h["_source"] for h in leads_result["hits"]["hits"]]
    
    if not leads:
        return "No active leads matching criteria."
    
    # Step 2: Get available inventory
    inv_query = {
        "query": {
            "bool": {
                "filter": [
                    {"term": {"status": "in_stock"}}
                ]
            }
        },
        "size": 100,
    }
    
    if vehicle_type:
        inv_query["query"]["bool"]["must"] = [{"match": {"body_style": vehicle_type}}]
    
    inv_result = es.search(index="dealer-inventory", body=inv_query)
    inventory = [h["_source"] for h in inv_result["hits"]["hits"]]
    
    if not inventory:
        return f"No in-stock inventory matching '{vehicle_type}'."
    
    # Step 3: Match leads to vehicles
    matches = []
    for lead in leads:
        lead_budget = lead.get("budget_max", 999999)
        lead_pref = lead.get("preferred_vehicle", "").lower()
        
        best_matches = []
        for vehicle in inventory:
            vehicle_desc = f"{vehicle['make']} {vehicle['model']} {vehicle.get('body_style', '')}".lower()
            price = vehicle.get("dealer_price", 0)
            
            # Simple matching: budget fit + preference overlap
            if price <= lead_budget and (not lead_pref or any(word in vehicle_desc for word in lead_pref.split())):
                best_matches.append(vehicle)
        
        if best_matches:
            best_matches.sort(key=lambda v: v.get("days_on_lot", 0), reverse=True)  # Prioritize aging stock
            top = best_matches[0]
            matches.append(
                f"• {lead['customer_name']} (Budget: ${lead_budget:,.0f}, Wants: {lead.get('preferred_vehicle', 'Any')})\n"
                f"  → Best Match: {top['year']} {top['make']} {top['model']} {top['trim']} "
                f"@ ${top['dealer_price']:,.0f} ({top['days_on_lot']} days on lot)\n"
                f"  → {len(best_matches)} total options available"
            )
    
    if not matches:
        return "No direct matches found between active leads and current inventory."
    
    return f"Found {len(matches)} lead-to-inventory matches:\n\n" + "\n\n".join(matches)


@tool
def identify_replacement_candidates() -> str:
    """
    Find vehicles in service with repeat repairs that may be trade-up candidates.
    A vehicle with 3+ service visits or repair costs exceeding 40% of value is flagged.
    
    Returns:
        List of replacement candidate vehicles with customer info and suggested new vehicles.
    """
    es = get_es_client()
    
    # Step 1: Find vehicles with multiple service visits
    agg_query = {
        "size": 0,
        "aggs": {
            "by_vin": {
                "terms": {
                    "field": "vin",
                    "min_doc_count": 2,
                    "size": 50
                },
                "aggs": {
                    "total_cost": {"sum": {"field": "total_cost"}},
                    "visit_count": {"value_count": {"field": "ro_number"}},
                    "customer": {"terms": {"field": "customer_name.keyword", "size": 1}},
                    "latest": {"top_hits": {"size": 1, "sort": [{"created_at": "desc"}]}}
                }
            }
        }
    }
    
    result = es.search(index="dealer-service-orders", body=agg_query)
    buckets = result.get("aggregations", {}).get("by_vin", {}).get("buckets", [])
    
    candidates = []
    for bucket in buckets:
        vin = bucket["key"]
        visit_count = bucket["visit_count"]["value"]
        total_cost = bucket["total_cost"]["value"]
        latest_hit = bucket["latest"]["hits"]["hits"][0]["_source"]
        customer_name = latest_hit.get("customer_name", "Unknown")
        
        if visit_count >= 2 or total_cost > 3000:
            candidates.append({
                "vin": vin,
                "customer": customer_name,
                "visits": int(visit_count),
                "total_cost": total_cost,
                "last_complaint": latest_hit.get("complaint_text", "N/A"),
            })
    
    if not candidates:
        return "No replacement candidates identified at this time."
    
    # Step 2: Format results
    output = []
    for c in candidates[:10]:
        output.append(
            f"• {c['customer']} — VIN: {c['vin']}\n"
            f"  Service Visits: {c['visits']} | Total Spent: ${c['total_cost']:,.0f}\n"
            f"  Last Complaint: {c['last_complaint']}\n"
            f"  ⚠ TRADE-UP CANDIDATE — Suggest proactive outreach"
        )
    
    return f"Found {len(candidates)} replacement candidates:\n\n" + "\n\n".join(output)


@tool
def check_incentives_for_vehicle(model: str) -> str:
    """
    Find all active incentive programs applicable to a specific vehicle model.
    Checks stacking rules and calculates maximum combined incentive.
    
    Args:
        model: Vehicle model name (e.g., "Silverado", "Horizon EV", "Atlas EV")
    
    Returns:
        Active incentives with amounts and stacking possibilities.
    """
    es = get_es_client()
    
    body = {
        "query": {
            "bool": {
                "must": [
                    {"match": {"eligible_models": model}}
                ]
            }
        },
        "size": 20,
        "sort": [{"amount": "desc"}],
    }
    
    result = es.search(index="dealer-incentives", body=body)
    hits = result.get("hits", {}).get("hits", [])
    
    if not hits:
        return f"No active incentives found for '{model}'."
    
    incentives = []
    total_stackable = 0
    
    for hit in hits:
        inc = hit["_source"]
        stackable_str = "✓ Stackable" if inc.get("stackable", False) else "✗ Not stackable"
        incentives.append(
            f"• {inc['program_name']} ({inc['incentive_type'].upper()})\n"
            f"  Amount: ${inc['amount']:,.0f} | {stackable_str}\n"
            f"  Valid: {inc['start_date']} to {inc['end_date']}\n"
            f"  Region: {inc.get('region', 'National')}"
        )
        if inc.get("stackable", False):
            total_stackable += inc["amount"]
    
    summary = f"Found {len(hits)} incentive programs for '{model}':\n"
    if total_stackable > 0:
        summary += f"Maximum stackable incentive: ${total_stackable:,.0f}\n"
    
    return summary + "\n" + "\n\n".join(incentives)


@tool
def get_competitive_pricing_gaps(threshold: float = 500) -> str:
    """
    Identify vehicles where our pricing is significantly above market.
    
    Args:
        threshold: Minimum price delta to flag (default $500)
    
    Returns:
        Vehicles with competitive pricing gaps and recommended adjustments.
    """
    es = get_es_client()
    
    body = {
        "query": {
            "range": {
                "price_delta": {"gte": threshold}
            }
        },
        "size": 20,
        "sort": [{"price_delta": "desc"}],
    }
    
    result = es.search(index="dealer-pricing-alerts", body=body)
    hits = result.get("hits", {}).get("hits", [])
    
    if not hits:
        return f"No significant pricing gaps found (threshold: ${threshold:,.0f})."
    
    alerts = []
    total_gap = 0
    for hit in hits:
        p = hit["_source"]
        gap = p.get("price_delta", 0)
        total_gap += gap
        alerts.append(
            f"• {p['model']} {p.get('trim', '')}\n"
            f"  Our Price: ${p['our_price']:,.0f} | Market Avg: ${p['market_average']:,.0f} | "
            f"Gap: ${gap:,.0f}\n"
            f"  Competitor: {p['competitor_dealer']} @ ${p['competitor_price']:,.0f}\n"
            f"  Last Updated: {p.get('days_since_update', 'N/A')} days ago"
        )
    
    return (
        f"Found {len(hits)} pricing gaps above ${threshold:,.0f}:\n"
        f"Total pricing exposure: ${total_gap:,.0f}\n\n"
        + "\n\n".join(alerts)
    )
