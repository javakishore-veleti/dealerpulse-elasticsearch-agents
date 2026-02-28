"""
DealerPulse — Elasticsearch Index Mappings
Defines the schema for all 6 dealer operations indices.
"""

MAPPINGS = {
    "dealer-inventory": {
        "mappings": {
            "properties": {
                "vin": {"type": "keyword"},
                "stock_number": {"type": "keyword"},
                "year": {"type": "integer"},
                "make": {"type": "keyword"},
                "model": {"type": "text", "fields": {"keyword": {"type": "keyword"}}},
                "trim": {"type": "text", "fields": {"keyword": {"type": "keyword"}}},
                "body_style": {"type": "text", "fields": {"keyword": {"type": "keyword"}}},
                "exterior_color": {"type": "text", "fields": {"keyword": {"type": "keyword"}}},
                "msrp": {"type": "float"},
                "dealer_price": {"type": "float"},
                "invoice_price": {"type": "float"},
                "status": {"type": "keyword"},
                "days_on_lot": {"type": "integer"},
                "vdp_views": {"type": "integer"},
                "lead_count": {"type": "integer"},
                "features": {"type": "text"},
                "added_date": {"type": "date"},
            }
        }
    },
    "dealer-leads": {
        "mappings": {
            "properties": {
                "lead_id": {"type": "keyword"},
                "customer_name": {"type": "text", "fields": {"keyword": {"type": "keyword"}}},
                "email": {"type": "keyword"},
                "phone": {"type": "keyword"},
                "zip_code": {"type": "keyword"},
                "preferred_vehicle": {"type": "text", "fields": {"keyword": {"type": "keyword"}}},
                "preferred_features": {"type": "text"},
                "budget_min": {"type": "float"},
                "budget_max": {"type": "float"},
                "trade_in_vehicle": {"type": "text"},
                "trade_in_value": {"type": "float"},
                "channel": {"type": "keyword"},
                "status": {"type": "keyword"},
                "submitted_at": {"type": "date"},
                "notes": {"type": "text"},
            }
        }
    },
    "dealer-service-orders": {
        "mappings": {
            "properties": {
                "ro_number": {"type": "keyword"},
                "vin": {"type": "keyword"},
                "year": {"type": "integer"},
                "make": {"type": "keyword"},
                "model": {"type": "text", "fields": {"keyword": {"type": "keyword"}}},
                "customer_name": {"type": "text", "fields": {"keyword": {"type": "keyword"}}},
                "customer_phone": {"type": "keyword"},
                "dtc_codes": {"type": "keyword"},
                "complaint_text": {"type": "text"},
                "cause_text": {"type": "text"},
                "correction_text": {"type": "text"},
                "technician_name": {"type": "text", "fields": {"keyword": {"type": "keyword"}}},
                "status": {"type": "keyword"},
                "repair_type": {"type": "keyword"},
                "estimated_hours": {"type": "float"},
                "actual_hours": {"type": "float"},
                "parts_cost": {"type": "float"},
                "labor_cost": {"type": "float"},
                "total_cost": {"type": "float"},
                "created_at": {"type": "date"},
                "completed_at": {"type": "date"},
            }
        }
    },
    "dealer-incentives": {
        "mappings": {
            "properties": {
                "program_id": {"type": "keyword"},
                "program_name": {"type": "text", "fields": {"keyword": {"type": "keyword"}}},
                "eligible_models": {"type": "text", "fields": {"keyword": {"type": "keyword"}}},
                "incentive_type": {"type": "keyword"},
                "amount": {"type": "float"},
                "stackable": {"type": "boolean"},
                "stacking_rules": {"type": "text"},
                "start_date": {"type": "date", "format": "yyyy-MM-dd"},
                "end_date": {"type": "date", "format": "yyyy-MM-dd"},
                "region": {"type": "keyword"},
                "requirements": {"type": "text"},
            }
        }
    },
    "dealer-pricing-alerts": {
        "mappings": {
            "properties": {
                "alert_id": {"type": "keyword"},
                "year": {"type": "integer"},
                "model": {"type": "text", "fields": {"keyword": {"type": "keyword"}}},
                "trim": {"type": "text", "fields": {"keyword": {"type": "keyword"}}},
                "body_style": {"type": "keyword"},
                "our_price": {"type": "float"},
                "competitor_price": {"type": "float"},
                "competitor_dealer": {"type": "text", "fields": {"keyword": {"type": "keyword"}}},
                "market_average": {"type": "float"},
                "price_delta": {"type": "float"},
                "days_since_update": {"type": "integer"},
                "zip_code": {"type": "keyword"},
            }
        }
    },
    "dealer-tsb-recalls": {
        "mappings": {
            "properties": {
                "bulletin_id": {"type": "keyword"},
                "bulletin_type": {"type": "keyword"},
                "bulletin_title": {"type": "text", "fields": {"keyword": {"type": "keyword"}}},
                "affected_models": {"type": "text", "fields": {"keyword": {"type": "keyword"}}},
                "affected_years": {"type": "keyword"},
                "dtc_codes": {"type": "keyword"},
                "symptom_keywords": {"type": "text", "fields": {"keyword": {"type": "keyword"}}},
                "complaint_description": {"type": "text"},
                "fix_description": {"type": "text"},
                "parts_required": {"type": "text", "fields": {"keyword": {"type": "keyword"}}},
                "labor_hours": {"type": "float"},
                "severity": {"type": "keyword"},
                "published_date": {"type": "date"},
            }
        }
    },
}
