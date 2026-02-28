"""
DealerPulse — Pre-built Scenario Definitions
Each scenario demonstrates a specific agent capability.
"""

SCENARIOS = {
    1: {
        "name": "Instant Lead Response",
        "agent": "consumer",
        "description": "Sarah submits a lead at 9:47 PM for a mid-size SUV, budget $42K, wants AWD.",
        "prompt": (
            "A new customer lead just came in:\n\n"
            "Name: Sarah Martinez\n"
            "Submitted: 9:47 PM (after hours)\n"
            "Preferred Vehicle: Mid-size SUV with AWD\n"
            "Budget: $38,000 - $45,000\n"
            "Key Features: AWD, heated seats, safety package, Apple CarPlay\n"
            "Trade-in: 2021 Chevrolet Malibu LT (estimated $18,000)\n"
            "Channel: Website\n\n"
            "Generate an instant personalized response for Sarah. Search our current inventory "
            "for matching vehicles, check applicable incentives, and draft a response "
            "that makes her feel valued and gives her specific options with pricing."
        ),
    },
    2: {
        "name": "Morning Sales Brief",
        "agent": "sales",
        "description": "BDC agent arrives at 8 AM. Prepare a full sales brief for Sarah's lead.",
        "prompt": (
            "It's 8:00 AM. I'm a BDC agent and I need to call Sarah Martinez back about her "
            "lead from last night. She wants a mid-size SUV with AWD, budget around $42K, "
            "and has a 2021 Malibu to trade in.\n\n"
            "Prepare my complete sales brief:\n"
            "1. Search for her lead details\n"
            "2. Find the best inventory matches\n"
            "3. Check what incentives I can offer\n"
            "4. Check if her trade-in Malibu has any open recalls or TSBs (good conversation starter)\n"
            "5. Give me a suggested opening for the call"
        ),
    },
    3: {
        "name": "Diagnose Before Hood Opens",
        "agent": "service",
        "description": "2022 Silverado arrives with DTC P0300 + P0301, complaint: rough idle at cold start.",
        "prompt": (
            "Vehicle just arrived in the service drive:\n\n"
            "Vehicle: 2022 Chevrolet Silverado 1500 LT\n"
            "VIN: 1G1YY22G045N25032\n"
            "Mileage: 47,250\n"
            "DTC Codes: P0300, P0301\n"
            "Customer Complaint: 'Rough idle at cold start, goes away after warm up. "
            "Check engine light came on last week.'\n\n"
            "Run a full diagnostic analysis:\n"
            "1. Search TSBs for these DTCs on this model\n"
            "2. Check historical fix patterns for P0300/P0301\n"
            "3. Pull this vehicle's service history\n"
            "4. Recommend the most likely fix with parts and labor\n"
            "5. Generate the 3C documentation"
        ),
    },
    4: {
        "name": "Aging Stock Alert",
        "agent": "inventory",
        "description": "Josh asks: what's my exposure on aging stock this week?",
        "prompt": (
            "I'm the inventory manager. Give me a full aging stock report:\n\n"
            "1. What vehicles have been on the lot over 60 days? What's our capital exposure?\n"
            "2. Where are we overpriced vs. the market?\n"
            "3. Are there any new incentive programs that could help move aging stock?\n"
            "4. Do we have active leads that match any of our aging inventory?\n"
            "5. Give me specific price adjustment recommendations with priority ranking."
        ),
    },
    5: {
        "name": "Lead + Inventory Match (Cross-Agent)",
        "agent": "orchestrator",
        "description": "5 EV leads overnight while 3 Blazer EVs sit aging. Connect the dots.",
        "prompt": (
            "We got a burst of overnight leads — several customers asking about EV SUVs "
            "under $45K. At the same time, I know we have some Blazer EVs and Equinox EVs "
            "that have been sitting on the lot.\n\n"
            "Connect the dots for me:\n"
            "1. How many EV-interested leads do we have right now?\n"
            "2. What EV inventory do we have, and how long has it been sitting?\n"
            "3. What incentives apply to our EV models?\n"
            "4. Give me a specific action plan to match these leads to our aging EV stock."
        ),
    },
    6: {
        "name": "Service → Sales Opportunity (Cross-Agent)",
        "agent": "orchestrator",
        "description": "Repeat repair vehicle should trigger a trade-up conversation.",
        "prompt": (
            "I want to find customers who keep coming back for expensive repairs on older vehicles. "
            "These are potential trade-up candidates — instead of spending more on repairs, "
            "they should be looking at a new vehicle.\n\n"
            "1. Find vehicles with multiple service visits or high cumulative repair costs\n"
            "2. For each candidate, what new vehicle would be a natural upgrade?\n"
            "3. What incentives could sweeten the deal?\n"
            "4. Draft a proactive outreach message for the best candidate"
        ),
    },
    7: {
        "name": "Full Dealer Morning Briefing (All Agents)",
        "agent": "orchestrator",
        "description": "Dealer principal asks: How did we do and what should we focus on today?",
        "prompt": (
            "Good morning. I'm the dealer principal and I need my morning briefing. "
            "Give me a complete status across all departments:\n\n"
            "1. LEADS: How many new leads came in? What are they looking for? Any hot prospects?\n"
            "2. SALES: What deals are in the pipeline? Any at risk of going cold?\n"
            "3. SERVICE: How many open ROs? Any warranty flags or repeat repair concerns?\n"
            "4. INVENTORY: What's our aging situation? Any pricing actions needed?\n\n"
            "Most importantly — what are the CROSS-DEPARTMENT OPPORTUNITIES I should know about? "
            "Things like aging stock that matches active leads, or service customers who should "
            "be talking to sales. Give me the top 3 actions for today."
        ),
    },
}


def get_scenario(scenario_id: int) -> dict:
    """Get a scenario by ID."""
    return SCENARIOS.get(scenario_id)


def list_scenarios() -> list:
    """List all available scenarios."""
    return [
        {"id": k, "name": v["name"], "description": v["description"], "agent": v["agent"]}
        for k, v in SCENARIOS.items()
    ]
