"""
DealerPulse — ES|QL Query Tool
Enables agents to run ES|QL analytics queries against dealer data.
"""
import json
from langchain_core.tools import tool
from config.es_config import get_es_client


@tool
def run_esql_query(query: str) -> str:
    """
    Execute an ES|QL query against Elasticsearch for analytics and aggregations.
    
    Available indices and key fields:
    
    - dealer-inventory: vin, make, model, trim, year, body_style, msrp, dealer_price, 
      status (in_stock/in_transit/sold/service_hold), days_on_lot, vdp_views, lead_count,
      exterior_color, features
    
    - dealer-leads: customer_name, preferred_vehicle, budget_min, budget_max,
      trade_in_vehicle, trade_in_value, channel (web/phone/walk_in), status
      (new/contacted/test_drive/negotiation/closed_won/closed_lost), submitted_at
    
    - dealer-service-orders: ro_number, vin, customer_name, dtc_codes, complaint_text,
      cause_text, correction_text, technician_name, status
      (open/diagnosed/parts_ordered/in_progress/complete), estimated_hours, actual_hours,
      repair_type (warranty/customer_pay/internal), total_cost, created_at
    
    - dealer-incentives: program_name, eligible_models, incentive_type
      (rebate/financing/lease), amount, start_date, end_date, stackable,
      region, stacking_rules
    
    - dealer-pricing-alerts: model, trim, competitor_dealer, competitor_price,
      our_price, price_delta, market_average, days_since_update
    
    - dealer-tsb-recalls: bulletin_id, bulletin_type (tsb/recall), bulletin_title,
      affected_models, affected_years, dtc_codes, symptom_keywords, fix_description,
      parts_required, labor_hours
    
    ES|QL query examples:
    - FROM dealer-inventory | WHERE status == "in_stock" AND days_on_lot > 60 | STATS count = COUNT(*), total_value = SUM(dealer_price) BY model | SORT total_value DESC
    - FROM dealer-leads | WHERE status == "new" | STATS lead_count = COUNT(*) BY preferred_vehicle | SORT lead_count DESC
    - FROM dealer-service-orders | WHERE status != "complete" | STATS open_ros = COUNT(*), avg_hours = AVG(estimated_hours) BY technician_name
    
    Args:
        query: A valid ES|QL query string
    
    Returns:
        Query results as formatted text.
    """
    es = get_es_client()
    
    try:
        result = es.esql.query(query=query, format="json")
        
        columns = result.get("columns", [])
        values = result.get("values", [])
        
        if not values:
            return "Query returned no results."
        
        # Format as readable table
        col_names = [c["name"] for c in columns]
        header = " | ".join(col_names)
        separator = "-+-".join("-" * max(len(name), 12) for name in col_names)
        
        rows = []
        for row in values:
            formatted = []
            for val in row:
                if isinstance(val, float):
                    formatted.append(f"{val:,.2f}")
                elif val is None:
                    formatted.append("N/A")
                else:
                    formatted.append(str(val))
            rows.append(" | ".join(formatted))
        
        table = f"{header}\n{separator}\n" + "\n".join(rows)
        return f"ES|QL Results ({len(values)} rows):\n\n{table}"
    
    except Exception as e:
        error_msg = str(e)
        return f"ES|QL query error: {error_msg}\n\nQuery attempted: {query}"


@tool
def get_aging_inventory_report() -> str:
    """
    Get a pre-built aging inventory analysis report.
    Shows vehicles grouped by aging brackets with financial exposure.
    
    Returns:
        Aging inventory report with recommendations.
    """
    es = get_es_client()
    
    queries = {
        "30-45 days": 'FROM dealer-inventory | WHERE status == "in_stock" AND days_on_lot >= 30 AND days_on_lot < 45 | STATS count = COUNT(*), total_value = SUM(dealer_price), avg_price = AVG(dealer_price) BY model | SORT total_value DESC',
        "45-60 days": 'FROM dealer-inventory | WHERE status == "in_stock" AND days_on_lot >= 45 AND days_on_lot < 60 | STATS count = COUNT(*), total_value = SUM(dealer_price), avg_price = AVG(dealer_price) BY model | SORT total_value DESC',
        "60+ days (CRITICAL)": 'FROM dealer-inventory | WHERE status == "in_stock" AND days_on_lot >= 60 | STATS count = COUNT(*), total_value = SUM(dealer_price), avg_price = AVG(dealer_price) BY model | SORT total_value DESC',
    }
    
    report_parts = ["═══ AGING INVENTORY REPORT ═══\n"]
    
    for bracket, query in queries.items():
        try:
            result = es.esql.query(query=query, format="json")
            values = result.get("values", [])
            
            if values:
                total_units = sum(row[0] for row in values)
                total_exposure = sum(row[1] for row in values)
                report_parts.append(f"\n── {bracket} ──")
                report_parts.append(f"   Units: {total_units} | Capital Exposure: ${total_exposure:,.0f}")
                for row in values:
                    report_parts.append(f"   • {row[3]}: {row[0]} units (${row[1]:,.0f})")
            else:
                report_parts.append(f"\n── {bracket} ──")
                report_parts.append("   No vehicles in this bracket. ✓")
        except Exception as e:
            report_parts.append(f"\n── {bracket} ──")
            report_parts.append(f"   Query error: {str(e)}")
    
    return "\n".join(report_parts)


@tool
def get_lead_pipeline_report() -> str:
    """
    Get a pre-built lead pipeline analysis showing conversion funnel.
    
    Returns:
        Lead pipeline report with counts by status and channel.
    """
    es = get_es_client()
    
    report_parts = ["═══ LEAD PIPELINE REPORT ═══\n"]
    
    # By status
    try:
        result = es.esql.query(
            query='FROM dealer-leads | STATS count = COUNT(*) BY status | SORT count DESC',
            format="json"
        )
        values = result.get("values", [])
        if values:
            report_parts.append("── By Status ──")
            total = sum(row[0] for row in values)
            for row in values:
                pct = (row[0] / total * 100) if total > 0 else 0
                report_parts.append(f"   {row[1]}: {row[0]} ({pct:.0f}%)")
    except Exception as e:
        report_parts.append(f"Status query error: {e}")
    
    # By channel
    try:
        result = es.esql.query(
            query='FROM dealer-leads | STATS count = COUNT(*) BY channel | SORT count DESC',
            format="json"
        )
        values = result.get("values", [])
        if values:
            report_parts.append("\n── By Channel ──")
            for row in values:
                report_parts.append(f"   {row[1]}: {row[0]}")
    except Exception as e:
        report_parts.append(f"Channel query error: {e}")
    
    # New leads (last 24 hours approximation)
    try:
        result = es.esql.query(
            query='FROM dealer-leads | WHERE status == "new" | STATS count = COUNT(*), avg_budget = AVG(budget_max) BY preferred_vehicle | SORT count DESC | LIMIT 5',
            format="json"
        )
        values = result.get("values", [])
        if values:
            report_parts.append("\n── Top Requested Vehicles (New Leads) ──")
            for row in values:
                report_parts.append(f"   {row[2]}: {row[0]} leads (avg budget: ${row[1]:,.0f})")
    except Exception as e:
        report_parts.append(f"New leads query error: {e}")
    
    return "\n".join(report_parts)


@tool
def get_service_workload_report() -> str:
    """
    Get a pre-built service department workload report.
    
    Returns:
        Open ROs, technician utilization, and warranty vs customer pay split.
    """
    es = get_es_client()
    
    report_parts = ["═══ SERVICE WORKLOAD REPORT ═══\n"]
    
    # Open ROs by status
    try:
        result = es.esql.query(
            query='FROM dealer-service-orders | WHERE status != "complete" | STATS count = COUNT(*), total_hours = SUM(estimated_hours) BY status | SORT count DESC',
            format="json"
        )
        values = result.get("values", [])
        if values:
            total_open = sum(row[0] for row in values)
            total_hours = sum(row[1] for row in values)
            report_parts.append(f"── Open ROs: {total_open} | Pending Hours: {total_hours:.1f} ──")
            for row in values:
                report_parts.append(f"   {row[2]}: {row[0]} ROs ({row[1]:.1f} hours)")
    except Exception as e:
        report_parts.append(f"Open ROs error: {e}")
    
    # By technician
    try:
        result = es.esql.query(
            query='FROM dealer-service-orders | WHERE status != "complete" | STATS count = COUNT(*), hours = SUM(estimated_hours) BY technician_name | SORT hours DESC',
            format="json"
        )
        values = result.get("values", [])
        if values:
            report_parts.append("\n── Technician Load ──")
            for row in values:
                report_parts.append(f"   {row[2]}: {row[0]} ROs ({row[1]:.1f} hours)")
    except Exception as e:
        report_parts.append(f"Technician query error: {e}")
    
    # Repair type split
    try:
        result = es.esql.query(
            query='FROM dealer-service-orders | STATS count = COUNT(*), revenue = SUM(total_cost) BY repair_type | SORT revenue DESC',
            format="json"
        )
        values = result.get("values", [])
        if values:
            report_parts.append("\n── Revenue by Repair Type ──")
            for row in values:
                report_parts.append(f"   {row[2]}: {row[0]} ROs (${row[1]:,.0f})")
    except Exception as e:
        report_parts.append(f"Repair type error: {e}")
    
    return "\n".join(report_parts)
