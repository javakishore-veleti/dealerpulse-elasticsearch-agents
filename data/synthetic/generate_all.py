"""
DealerPulse — Synthetic Data Generator
Generates realistic Prestige dealership operations data for all 6 indices.
All data is synthetic — no real customer or dealer information.
"""
import json
import random
import hashlib
from datetime import datetime, timedelta

# ═══════════════════════════════════════════════
# Shared reference data
# ═══════════════════════════════════════════════

PRESTIGE_VEHICLES = [
    {"model": "Summit 1500", "body_style": "Truck", "base_msrp": 38500, "trims": ["WT", "Custom", "LT", "RST", "LTZ", "High Country"]},
    {"model": "Summit 2500HD", "body_style": "Truck", "base_msrp": 46200, "trims": ["WT", "Custom", "LT", "LTZ", "High Country"]},
    {"model": "Crestline", "body_style": "Truck", "base_msrp": 31900, "trims": ["WT", "LT", "Z71", "ZR2", "Trail Boss"]},
    {"model": "Horizon", "body_style": "SUV", "base_msrp": 30500, "trims": ["LS", "LT", "RS", "Premier"]},
    {"model": "Horizon EV", "body_style": "SUV", "base_msrp": 34900, "trims": ["1LT", "2LT", "2RS", "3RS"]},
    {"model": "Atlas EV", "body_style": "SUV", "base_msrp": 42000, "trims": ["1LT", "2LT", "RS", "SS"]},
    {"model": "Voyager", "body_style": "SUV", "base_msrp": 36900, "trims": ["LS", "LT", "RS", "Z71", "Premier", "High Country"]},
    {"model": "Pinnacle", "body_style": "SUV", "base_msrp": 58200, "trims": ["LS", "LT", "RST", "Z71", "Premier", "High Country"]},
    {"model": "Commander", "body_style": "SUV", "base_msrp": 61200, "trims": ["LS", "LT", "RST", "Z71", "Premier", "High Country"]},
    {"model": "Scout", "body_style": "SUV", "base_msrp": 21900, "trims": ["LS", "1RS", "LT", "2RS", "ACTIV"]},
    {"model": "Meridian", "body_style": "Sedan", "base_msrp": 26600, "trims": ["LS", "RS", "LT", "Premier"]},
    {"model": "Phantom", "body_style": "Coupe", "base_msrp": 32900, "trims": ["1LS", "1LT", "LT1", "2SS", "ZL1"]},
    {"model": "Spectra", "body_style": "Coupe", "base_msrp": 68300, "trims": ["1LT", "2LT", "3LT", "Z06", "E-Ray"]},
    {"model": "Nova EV", "body_style": "SUV", "base_msrp": 28900, "trims": ["LT", "Premier", "Redline"]},
]

COLORS = ["Summit White", "Black", "Silver Ice Metallic", "Red Hot", "Northsky Blue Metallic",
          "Harvest Bronze Metallic", "Shadow Gray Metallic", "Iridescent Pearl Tricoat",
          "Radiant Red Tintcoat", "Empire Beige Metallic", "Evergreen Grey Metallic"]

FEATURES = [
    "AWD", "4WD", "Leather Seats", "Heated Seats", "Sunroof", "Navigation",
    "Bose Audio", "Trailering Package", "Technology Package", "Safety Package",
    "Adaptive Cruise Control", "Lane Keep Assist", "Blind Spot Monitor",
    "360 Camera", "Wireless Charging", "Head-Up Display", "Power Liftgate",
    "Remote Start", "Apple CarPlay", "Android Auto", "Wi-Fi Hotspot",
    "Ventilated Seats", "Heated Steering Wheel", "Power Sunroof",
    "Max Trailering Package", "Z71 Off-Road Package", "Midnight Edition",
]

FIRST_NAMES = ["Sarah", "Mike", "Jennifer", "David", "Ashley", "James", "Emily", "Robert",
               "Maria", "Chris", "Amanda", "Kevin", "Rachel", "Brian", "Nicole", "Steve",
               "Lisa", "Tom", "Angela", "Dan", "Kristen", "Josh", "Megan", "Andrew",
               "Lauren", "Tyler", "Samantha", "Derek", "Katie", "Marcus"]

LAST_NAMES = ["Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
              "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson",
              "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee",
              "Thompson", "White", "Harris", "Clark", "Robinson", "Walker", "Hall"]

TECHNICIANS = ["Ron Mitchell", "Carlos Reyes", "Dave Thompson", "Marcus Johnson",
               "Tony Vasquez", "Steve Chen", "Brandon Lee", "Mike O'Brien"]

COMPETITOR_DEALERS = ["Hendrick Prestige", "City Prestige", "Parks Prestige",
                      "Keith Hawthorne Prestige", "Classic Prestige", "Rick Hendrick Prestige",
                      "Lake Norman Prestige", "Gastonia Prestige"]

NC_ZIPS = ["28202", "28203", "28205", "28207", "28208", "28209", "28210", "28211",
           "28212", "28213", "28214", "28215", "28216", "28217", "28226", "28227",
           "28269", "28270", "28273", "28277", "28278", "28105", "28031", "28078"]


def _make_vin(seed: int) -> str:
    """Generate a realistic-looking VIN."""
    chars = "ABCDEFGHJKLMNPRSTUVWXYZ0123456789"
    h = hashlib.md5(str(seed).encode()).hexdigest()
    vin = "1G1"
    for i in range(14):
        vin += chars[int(h[i], 16) % len(chars)]
    return vin[:17]


def _random_date(start_days_ago: int, end_days_ago: int = 0) -> str:
    """Generate a random date between start and end days ago."""
    days = random.randint(end_days_ago, start_days_ago)
    dt = datetime.now() - timedelta(days=days)
    return dt.strftime("%Y-%m-%dT%H:%M:%S")


# ═══════════════════════════════════════════════
# Index 1: dealer-inventory (500 vehicles)
# ═══════════════════════════════════════════════

def generate_inventory(count: int = 500) -> list:
    """Generate synthetic vehicle inventory records."""
    records = []
    statuses = ["in_stock"] * 60 + ["in_transit"] * 20 + ["sold"] * 15 + ["service_hold"] * 5

    for i in range(count):
        vehicle = random.choice(PRESTIGE_VEHICLES)
        trim = random.choice(vehicle["trims"])
        year = random.choice([2024, 2024, 2025, 2025, 2025, 2026])
        
        # Price varies by trim position
        trim_idx = vehicle["trims"].index(trim)
        trim_markup = trim_idx * random.randint(2000, 5000)
        msrp = vehicle["base_msrp"] + trim_markup + random.randint(-500, 2000)
        
        status = random.choice(statuses)
        days_on_lot = random.choices(
            [random.randint(1, 15), random.randint(16, 30), random.randint(31, 45),
             random.randint(46, 60), random.randint(61, 90), random.randint(91, 120)],
            weights=[30, 25, 20, 12, 8, 5]
        )[0]
        
        if status in ["sold", "in_transit"]:
            days_on_lot = random.randint(0, 10) if status == "in_transit" else random.randint(1, 45)

        # Dealer price: slight discount for aging stock
        discount_pct = min(days_on_lot * 0.05, 8) / 100
        dealer_price = msrp * (1 - discount_pct) + random.randint(-300, 300)

        num_features = random.randint(3, 8)
        vehicle_features = random.sample(FEATURES, min(num_features, len(FEATURES)))

        records.append({
            "vin": _make_vin(i + 1000),
            "stock_number": f"N{25000 + i}",
            "year": year,
            "make": "Prestige",
            "model": vehicle["model"],
            "trim": trim,
            "body_style": vehicle["body_style"],
            "exterior_color": random.choice(COLORS),
            "msrp": round(msrp, 0),
            "dealer_price": round(dealer_price, 0),
            "invoice_price": round(msrp * 0.92, 0),
            "status": status,
            "days_on_lot": days_on_lot,
            "vdp_views": random.randint(5, 500),
            "lead_count": random.randint(0, 15),
            "features": vehicle_features,
            "added_date": _random_date(days_on_lot, days_on_lot),
        })

    return records


# ═══════════════════════════════════════════════
# Index 2: dealer-leads (200 customer leads)
# ═══════════════════════════════════════════════

def generate_leads(count: int = 200) -> list:
    """Generate synthetic customer lead records."""
    records = []
    channels = ["web"] * 50 + ["phone"] * 25 + ["walk_in"] * 15 + ["chat"] * 10
    statuses = ["new"] * 30 + ["contacted"] * 25 + ["test_drive"] * 15 + \
               ["negotiation"] * 12 + ["closed_won"] * 10 + ["closed_lost"] * 8

    trade_in_vehicles = [
        "2021 Prestige Meridian", "2020 Toyota Camry", "2019 Honda CR-V",
        "2022 Ford F-150", "2020 Prestige Horizon", "2018 Nissan Altima",
        "2021 Hyundai Tucson", "2019 Prestige Summit 1500",
        "2020 Toyota RAV4", "2022 Honda Civic", "2021 Jeep Grand Cherokee",
        "2019 GMC Sierra 1500", "2020 Subaru Outback", "2018 Ford Escape",
        "2021 Kia Telluride", None, None, None, None, None,  # 25% no trade
    ]

    preferred_vehicles = [
        "Summit 1500", "Horizon", "Horizon EV", "Atlas EV", "Voyager",
        "Pinnacle", "Crestline", "Scout", "Commander", "Spectra", "Meridian",
        "mid-size SUV", "full-size truck", "EV SUV under 45K", "family SUV with AWD",
    ]

    preferred_features_options = [
        "AWD", "leather seats", "towing package", "good fuel economy",
        "EV tax credit eligible", "third row seating", "navigation",
        "heated seats", "sunroof", "safety package", "Bose audio",
    ]

    for i in range(count):
        first = random.choice(FIRST_NAMES)
        last = random.choice(LAST_NAMES)
        pref_vehicle = random.choice(preferred_vehicles)
        
        # Budget varies by vehicle preference
        if "Spectra" in pref_vehicle or "Pinnacle" in pref_vehicle or "Commander" in pref_vehicle:
            budget_min = random.randint(50000, 65000)
            budget_max = random.randint(70000, 95000)
        elif "EV" in pref_vehicle or "Blazer" in pref_vehicle:
            budget_min = random.randint(30000, 38000)
            budget_max = random.randint(40000, 55000)
        elif "Scout" in pref_vehicle:
            budget_min = random.randint(18000, 22000)
            budget_max = random.randint(24000, 30000)
        else:
            budget_min = random.randint(25000, 35000)
            budget_max = random.randint(38000, 55000)

        trade_in = random.choice(trade_in_vehicles)
        trade_value = random.randint(8000, 28000) if trade_in else 0

        num_features = random.randint(1, 4)
        pref_features = random.sample(preferred_features_options, num_features)

        records.append({
            "lead_id": f"L-{10000 + i}",
            "customer_name": f"{first} {last}",
            "email": f"{first.lower()}.{last.lower()}@email.com",
            "phone": f"704-{random.randint(200,999)}-{random.randint(1000,9999)}",
            "zip_code": random.choice(NC_ZIPS),
            "preferred_vehicle": pref_vehicle,
            "preferred_features": pref_features,
            "budget_min": budget_min,
            "budget_max": budget_max,
            "trade_in_vehicle": trade_in,
            "trade_in_value": trade_value,
            "channel": random.choice(channels),
            "status": random.choice(statuses),
            "submitted_at": _random_date(30),
            "notes": "",
        })

    return records


# ═══════════════════════════════════════════════
# Index 3: dealer-service-orders (300 repair orders)
# ═══════════════════════════════════════════════

DTC_CODES = {
    "P0300": "Random/Multiple Cylinder Misfire",
    "P0301": "Cylinder 1 Misfire",
    "P0302": "Cylinder 2 Misfire",
    "P0171": "System Too Lean (Bank 1)",
    "P0420": "Catalyst System Efficiency Below Threshold",
    "P0442": "EVAP System Leak (Small)",
    "P0455": "EVAP System Leak (Large)",
    "P0128": "Coolant Thermostat Below Regulating Temperature",
    "P0507": "Idle Air Control RPM Higher Than Expected",
    "P0700": "Transmission Control System Malfunction",
    "P0730": "Incorrect Gear Ratio",
    "P0741": "Torque Converter Clutch Solenoid Performance",
    "P2096": "Post Catalyst Fuel Trim System Too Lean",
    "P2138": "Throttle/Pedal Position Sensor Correlation",
    "P0011": "Camshaft Position Timing Over-Advanced",
    "U0100": "Lost Communication with ECM/PCM",
    "U0140": "Lost Communication with Body Control Module",
    "C0561": "ABS System Disabled",
    "B0083": "Driver Seat Belt Tension Sensor",
}

COMPLAINTS = [
    "Rough idle at cold start, goes away after warm up",
    "Check engine light on, no noticeable performance issues",
    "Transmission slipping between 2nd and 3rd gear",
    "Strange noise from front suspension when turning left",
    "AC blowing warm air intermittently",
    "Infotainment screen goes black randomly while driving",
    "Brake pedal feels soft, ABS light on",
    "Oil consumption higher than normal between changes",
    "Vibration at highway speeds (65-75 mph)",
    "Battery draining overnight, car won't start in morning",
    "Rear camera not displaying when in reverse",
    "Power windows not responding to switch intermittently",
    "Coolant leak noticed under vehicle after parking",
    "Steering wheel shimmy at low speeds",
    "Exhaust smell in cabin when heater is on",
    "Customer states vehicle hesitates on acceleration",
    "Clunking noise from rear when going over bumps",
    "Windshield washer fluid not spraying",
    "Key fob not being detected, push button start fails",
    "Tire pressure warning light stays on after tire rotation",
]


def generate_service_orders(count: int = 300) -> list:
    """Generate synthetic service repair order records."""
    records = []
    statuses = ["open"] * 20 + ["diagnosed"] * 15 + ["parts_ordered"] * 10 + \
               ["in_progress"] * 15 + ["complete"] * 40
    repair_types = ["warranty"] * 35 + ["customer_pay"] * 50 + ["internal"] * 15

    # Create a pool of VINs that some will share (repeat customers)
    vin_pool = [_make_vin(i + 5000) for i in range(180)]
    # Some VINs appear multiple times (repeat repairs)
    vin_pool += random.choices(vin_pool[:30], k=40)
    random.shuffle(vin_pool)

    for i in range(count):
        vehicle = random.choice(PRESTIGE_VEHICLES)
        year = random.choice([2019, 2020, 2021, 2022, 2023, 2024])
        status = random.choice(statuses)
        repair_type = random.choice(repair_types)

        num_dtcs = random.randint(0, 3)
        dtc_list = random.sample(list(DTC_CODES.keys()), num_dtcs) if num_dtcs else []

        estimated_hours = round(random.uniform(0.5, 8.0), 1)
        actual_hours = round(estimated_hours * random.uniform(0.7, 1.5), 1) if status == "complete" else None
        
        labor_rate = 165  # $/hour
        parts_cost = random.randint(0, 1200) if status in ["in_progress", "complete"] else 0
        total_cost = round((actual_hours or estimated_hours) * labor_rate + parts_cost, 2)

        complaint = random.choice(COMPLAINTS)
        
        cause_text = None
        correction_text = None
        if status in ["diagnosed", "parts_ordered", "in_progress", "complete"]:
            cause_text = f"Inspection revealed {'DTC ' + dtc_list[0] + ': ' + DTC_CODES.get(dtc_list[0], '') if dtc_list else 'wear and tear'}"
        if status == "complete":
            correction_text = f"Replaced/repaired affected components. Road tested. All systems nominal."

        records.append({
            "ro_number": f"RO-{60000 + i}",
            "vin": vin_pool[i % len(vin_pool)],
            "year": year,
            "make": "Prestige",
            "model": vehicle["model"],
            "customer_name": f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}",
            "customer_phone": f"704-{random.randint(200,999)}-{random.randint(1000,9999)}",
            "dtc_codes": dtc_list,
            "complaint_text": complaint,
            "cause_text": cause_text,
            "correction_text": correction_text,
            "technician_name": random.choice(TECHNICIANS),
            "status": status,
            "repair_type": repair_type,
            "estimated_hours": estimated_hours,
            "actual_hours": actual_hours,
            "parts_cost": parts_cost,
            "labor_cost": round((actual_hours or estimated_hours) * labor_rate, 2),
            "total_cost": total_cost,
            "created_at": _random_date(90),
            "completed_at": _random_date(30) if status == "complete" else None,
        })

    return records


# ═══════════════════════════════════════════════
# Index 4: dealer-incentives (50 programs)
# ═══════════════════════════════════════════════

def generate_incentives(count: int = 50) -> list:
    """Generate synthetic OEM incentive program records."""
    records = []
    
    program_templates = [
        {"name": "Prestige Loyalty Cash", "type": "rebate", "amount_range": (1000, 3500), "stackable": True},
        {"name": "Conquest Bonus Cash", "type": "rebate", "amount_range": (1500, 3000), "stackable": True},
        {"name": "EV Tax Credit", "type": "rebate", "amount_range": (3750, 7500), "stackable": True},
        {"name": "Prestige Consumer Cash", "type": "rebate", "amount_range": (500, 4000), "stackable": True},
        {"name": "Dealer Cash Allowance", "type": "rebate", "amount_range": (1000, 3000), "stackable": False},
        {"name": "0% APR Financing", "type": "financing", "amount_range": (0, 0), "stackable": False},
        {"name": "1.9% APR Financing", "type": "financing", "amount_range": (0, 0), "stackable": True},
        {"name": "Lease Special", "type": "lease", "amount_range": (2000, 4000), "stackable": False},
        {"name": "First Responder Discount", "type": "rebate", "amount_range": (500, 1000), "stackable": True},
        {"name": "Military Appreciation", "type": "rebate", "amount_range": (500, 1000), "stackable": True},
        {"name": "College Grad Program", "type": "rebate", "amount_range": (400, 750), "stackable": True},
        {"name": "EV Charging Credit", "type": "rebate", "amount_range": (500, 1500), "stackable": True},
        {"name": "Truck Month Bonus", "type": "rebate", "amount_range": (2000, 5000), "stackable": True},
        {"name": "Year-End Clearance", "type": "rebate", "amount_range": (3000, 6000), "stackable": False},
    ]

    models_list = [v["model"] for v in PRESTIGE_VEHICLES]

    for i in range(count):
        template = random.choice(program_templates)
        
        # Select eligible models (1-5 models per program)
        num_models = random.randint(1, 5)
        eligible = random.sample(models_list, min(num_models, len(models_list)))
        
        # EV-specific programs only for EV models
        if "EV" in template["name"]:
            eligible = [m for m in models_list if "EV" in m or "Bolt" in m]
            if not eligible:
                eligible = ["Horizon EV", "Atlas EV", "Nova EV"]
        
        # Truck programs only for trucks
        if "Truck" in template["name"]:
            eligible = ["Summit 1500", "Summit 2500HD", "Crestline"]

        amount = random.randint(*template["amount_range"]) if template["amount_range"][1] > 0 else 0
        
        start_date = datetime.now() - timedelta(days=random.randint(0, 30))
        end_date = start_date + timedelta(days=random.randint(30, 90))

        records.append({
            "program_id": f"INC-{2026}{i:03d}",
            "program_name": f"{template['name']} — {'/'.join(eligible[:2])}",
            "eligible_models": eligible,
            "incentive_type": template["type"],
            "amount": amount,
            "stackable": template["stackable"],
            "stacking_rules": "Can combine with other stackable programs" if template["stackable"] else "Cannot combine with other incentives",
            "start_date": start_date.strftime("%Y-%m-%d"),
            "end_date": end_date.strftime("%Y-%m-%d"),
            "region": random.choice(["National", "Southeast", "North Carolina", "Charlotte Metro"]),
            "requirements": template["name"],
        })

    return records


# ═══════════════════════════════════════════════
# Index 5: dealer-pricing-alerts (100 entries)
# ═══════════════════════════════════════════════

def generate_pricing_alerts(count: int = 100) -> list:
    """Generate synthetic competitive pricing data."""
    records = []

    for i in range(count):
        vehicle = random.choice(PRESTIGE_VEHICLES)
        trim = random.choice(vehicle["trims"])
        year = random.choice([2025, 2026])
        
        base = vehicle["base_msrp"] + vehicle["trims"].index(trim) * 3000
        our_price = base + random.randint(-1000, 3000)
        competitor_price = base + random.randint(-3000, 2000)
        market_average = base + random.randint(-2000, 1000)

        records.append({
            "alert_id": f"PA-{i+1:04d}",
            "year": year,
            "model": vehicle["model"],
            "trim": trim,
            "body_style": vehicle["body_style"],
            "our_price": round(our_price, 0),
            "competitor_price": round(competitor_price, 0),
            "competitor_dealer": random.choice(COMPETITOR_DEALERS),
            "market_average": round(market_average, 0),
            "price_delta": round(our_price - market_average, 0),
            "days_since_update": random.randint(1, 14),
            "zip_code": random.choice(NC_ZIPS),
        })

    return records


# ═══════════════════════════════════════════════
# Index 6: dealer-tsb-recalls (80 bulletins)
# ═══════════════════════════════════════════════

TSB_TEMPLATES = [
    {
        "title": "Intake Valve Carbon Deposit Buildup",
        "dtcs": ["P0300", "P0301", "P0302"],
        "symptoms": ["rough idle", "cold start misfire", "hesitation", "reduced power"],
        "fix": "Perform intake valve cleaning per GM procedure. Replace PCV valve if damaged. Reprogram ECM with latest calibration.",
        "parts": ["Intake Valve Cleaning Kit", "PCV Valve", "Gasket Set"],
        "hours": 2.5,
        "models": ["Summit 1500", "Crestline", "Voyager"],
    },
    {
        "title": "Transmission Torque Converter Shudder",
        "dtcs": ["P0741", "P0700"],
        "symptoms": ["transmission shudder", "vibration at 40-60 mph", "slipping", "harsh shift"],
        "fix": "Drain and refill transmission fluid with updated Mobil 1 Synthetic LV ATF. Perform transmission adaptive learn procedure.",
        "parts": ["Mobil 1 Synthetic LV ATF (12 qt)", "Transmission Filter"],
        "hours": 3.0,
        "models": ["Summit 1500", "Pinnacle", "Commander", "Crestline"],
    },
    {
        "title": "Infotainment System Black Screen / Reboot Loop",
        "dtcs": ["U0100", "U0140"],
        "symptoms": ["black screen", "screen reboot", "infotainment freeze", "no display"],
        "fix": "Update infotainment software to latest version. If issue persists, replace IPC (Infotainment Projection Control) module.",
        "parts": ["IPC Module (if needed)", "Software Update USB"],
        "hours": 1.5,
        "models": ["Horizon", "Atlas EV", "Voyager", "Horizon EV", "Scout"],
    },
    {
        "title": "EVAP System Small Leak — Purge Valve",
        "dtcs": ["P0442", "P0455"],
        "symptoms": ["check engine light", "fuel smell", "hard start after refueling"],
        "fix": "Replace EVAP canister purge solenoid valve. Inspect EVAP lines for cracks or damage.",
        "parts": ["EVAP Canister Purge Valve", "EVAP Line Clamps"],
        "hours": 1.2,
        "models": ["Horizon", "Meridian", "Scout", "Crestline"],
    },
    {
        "title": "Battery Parasitic Drain — Body Control Module Update",
        "dtcs": ["U0140"],
        "symptoms": ["dead battery", "battery drain overnight", "no start", "electrical issues"],
        "fix": "Reprogram Body Control Module (BCM) with latest calibration file. Check for aftermarket accessories drawing excessive current.",
        "parts": ["BCM Software Update"],
        "hours": 0.8,
        "models": ["Summit 1500", "Horizon", "Voyager", "Pinnacle"],
    },
    {
        "title": "Front Strut Mount Bearing Noise",
        "dtcs": [],
        "symptoms": ["clunking noise", "front suspension noise", "noise when turning", "creaking"],
        "fix": "Replace front strut mount bearing assemblies. Perform wheel alignment after replacement.",
        "parts": ["Front Strut Mount Assembly LH", "Front Strut Mount Assembly RH", "Alignment"],
        "hours": 3.5,
        "models": ["Horizon", "Voyager", "Atlas EV", "Scout"],
    },
    {
        "title": "Throttle Position Sensor Correlation Error",
        "dtcs": ["P2138"],
        "symptoms": ["reduced power warning", "limp mode", "check engine light", "poor acceleration"],
        "fix": "Replace electronic throttle body assembly. Perform throttle position learn procedure with scan tool.",
        "parts": ["Electronic Throttle Body Assembly", "Throttle Body Gasket"],
        "hours": 1.8,
        "models": ["Summit 1500", "Pinnacle", "Commander", "Summit 2500HD"],
    },
    {
        "title": "EV High Voltage Battery Coolant Leak",
        "dtcs": [],
        "symptoms": ["coolant loss", "battery temperature warning", "reduced EV range", "service EV system message"],
        "fix": "Inspect HV battery coolant lines and connections. Replace coolant line fitting if leaking. Top off coolant and bleed system.",
        "parts": ["HV Battery Coolant Line Fitting", "EV Coolant (2 gal)", "O-Ring Kit"],
        "hours": 2.0,
        "models": ["Horizon EV", "Atlas EV", "Nova EV"],
    },
    {
        "title": "Rear Camera Intermittent Display Failure",
        "dtcs": ["U0100"],
        "symptoms": ["rear camera blank", "no backup camera", "camera intermittent", "camera shows black screen"],
        "fix": "Check rear camera harness connector for corrosion. Clean and reseat connector. Replace camera module if connector is clean.",
        "parts": ["Rear Camera Module (if needed)", "Connector Cleaning Kit"],
        "hours": 1.0,
        "models": ["Summit 1500", "Crestline", "Horizon", "Voyager"],
    },
    {
        "title": "ABS Module Communication Failure",
        "dtcs": ["C0561"],
        "symptoms": ["ABS light on", "traction control light", "stabilitrak message", "brake warning"],
        "fix": "Inspect ABS module connector for water intrusion. Clean connector pins and apply dielectric grease. Replace ABS module if internal failure confirmed.",
        "parts": ["ABS Module (if needed)", "Dielectric Grease", "Connector Pin Kit"],
        "hours": 2.2,
        "models": ["Summit 1500", "Pinnacle", "Commander", "Summit 2500HD"],
    },
]


def generate_tsb_recalls(count: int = 80) -> list:
    """Generate synthetic TSB and recall bulletin records."""
    records = []

    for i in range(count):
        template = TSB_TEMPLATES[i % len(TSB_TEMPLATES)]
        bulletin_type = random.choices(["tsb", "recall"], weights=[75, 25])[0]
        
        year_range = f"{random.choice([2019, 2020, 2021])}-{random.choice([2024, 2025])}"
        
        # Vary the template slightly for uniqueness
        variation = random.choice(["", " (Updated)", " — Revised Procedure", " (Supplement)"])

        records.append({
            "bulletin_id": f"{'TSB' if bulletin_type == 'tsb' else 'RCL'}-{22 + i // 20}-NA-{i:03d}",
            "bulletin_type": bulletin_type,
            "bulletin_title": template["title"] + variation,
            "affected_models": template["models"],
            "affected_years": year_range,
            "dtc_codes": template["dtcs"],
            "symptom_keywords": template["symptoms"],
            "complaint_description": f"Customer may report {' or '.join(template['symptoms'][:2])}.",
            "fix_description": template["fix"],
            "parts_required": template["parts"],
            "labor_hours": template["hours"] + round(random.uniform(-0.3, 0.5), 1),
            "severity": random.choice(["low", "medium", "high"]),
            "published_date": _random_date(365, 30),
        })

    return records


# ═══════════════════════════════════════════════
# Master generator
# ═══════════════════════════════════════════════

def generate_all() -> dict:
    """Generate all synthetic datasets."""
    return {
        "dealer-inventory": generate_inventory(500),
        "dealer-leads": generate_leads(200),
        "dealer-service-orders": generate_service_orders(300),
        "dealer-incentives": generate_incentives(50),
        "dealer-pricing-alerts": generate_pricing_alerts(100),
        "dealer-tsb-recalls": generate_tsb_recalls(80),
    }


if __name__ == "__main__":
    data = generate_all()
    for index_name, records in data.items():
        print(f"{index_name}: {len(records)} records")
        # Save to JSON for inspection
        with open(f"data/synthetic/{index_name}.json", "w") as f:
            json.dump(records, f, indent=2, default=str)
    print(f"\nTotal: {sum(len(r) for r in data.values())} records")
