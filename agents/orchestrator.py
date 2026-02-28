"""
DealerPulse — Orchestrator Agent
Routes queries to specialist agents and coordinates multi-agent workflows.
Handles Scenarios 5-7 (cross-agent coordination).
"""
from typing import Dict
from langchain_core.messages import HumanMessage, SystemMessage
from config.llm_config import get_llm
from config.settings import settings
from agents.consumer_agent import ConsumerAgent
from agents.sales_agent import SalesAgent
from agents.service_agent import ServiceAgent
from agents.inventory_agent import InventoryAgent


ORCHESTRATOR_SYSTEM_PROMPT = """You are the DealerPulse Orchestrator — the master coordinator 
for a multi-agent dealer operations intelligence system.

You have 4 specialist agents at your disposal:

1. CONSUMER AGENT — Handles customer lead response, vehicle matching, instant engagement.
   Use for: new leads, customer preferences, vehicle recommendations, personalized responses.

2. SALES AGENT — Prepares sales briefs, deal structures, customer intelligence packages.
   Use for: BDC preparation, deal analysis, trade-in evaluation, incentive stacking.

3. SERVICE AGENT — Diagnoses vehicles, matches TSBs, generates 3C documentation.
   Use for: DTC codes, repair recommendations, service history, warranty claims.

4. INVENTORY AGENT — Monitors aging stock, competitive pricing, demand-supply matching.
   Use for: pricing decisions, aging alerts, market positioning, inventory turn optimization.

YOUR JOB:
1. Analyze the user's question to determine which agent(s) should handle it.
2. Route to the appropriate agent(s) — you may engage MULTIPLE agents for complex queries.
3. Synthesize responses from multiple agents into a coherent, actionable briefing.
4. Identify cross-functional opportunities that no single agent would catch.

CROSS-AGENT PATTERNS YOU SHOULD RECOGNIZE:
- Lead comes in + matching inventory is aging → Consumer + Inventory (Scenario 5)
- Repeat repair vehicle → Service + Sales + Inventory for trade-up (Scenario 6)  
- Morning briefing request → All 4 agents (Scenario 7)
- "How should we price..." → Inventory + Consumer (demand signals)
- "Customer is unhappy about..." → Service + Sales (retention play)

RESPONSE FORMAT FOR MULTI-AGENT QUERIES:
Clearly label which agent provided which intelligence, then synthesize a unified recommendation.

Always think about the BUSINESS IMPACT of your recommendations — revenue gained, 
cost avoided, customers retained, inventory turned.
"""


class OrchestratorAgent:
    """Multi-agent coordinator for cross-functional dealer intelligence."""

    def __init__(self):
        self.llm = get_llm(temperature=0.1)
        self.agents: Dict[str, object] = {
            "consumer": ConsumerAgent(),
            "sales": SalesAgent(),
            "service": ServiceAgent(),
            "inventory": InventoryAgent(),
        }

    def run(self, user_input: str) -> str:
        """
        Process a user query by routing to appropriate agent(s).
        """
        # Step 1: Determine which agents to engage
        routing = self._route_query(user_input)
        
        # Step 2: Execute each agent
        agent_results = {}
        for agent_key in routing["agents"]:
            agent = self.agents.get(agent_key)
            if agent:
                try:
                    result = agent.run(routing.get("refined_query", user_input))
                    agent_results[agent_key] = result
                except Exception as e:
                    agent_results[agent_key] = f"Agent error: {str(e)}"

        # Step 3: If only one agent, return directly
        if len(agent_results) == 1:
            return list(agent_results.values())[0]

        # Step 4: Synthesize multi-agent results
        return self._synthesize(user_input, agent_results)

    def _route_query(self, user_input: str) -> dict:
        """Determine which agents should handle this query."""
        routing_prompt = f"""Analyze this dealer operations query and determine which specialist agents should handle it.

Available agents: consumer, sales, service, inventory

Query: "{user_input}"

Respond in this exact format (no other text):
AGENTS: agent1, agent2
QUERY: refined query for the agents

Rules:
- For lead/customer questions → consumer
- For deal prep/sales briefing → sales  
- For diagnostic/repair/DTC → service
- For pricing/aging/inventory → inventory
- For morning briefing or "how are we doing" → ALL agents: consumer, sales, service, inventory
- For trade-up opportunities → service, sales, inventory
- For "match leads to stock" → consumer, inventory
- Use multiple agents when the query spans departments
"""

        response = self.llm.invoke([
            SystemMessage(content="You are a query router. Respond only in the specified format."),
            HumanMessage(content=routing_prompt),
        ])

        # Parse routing response
        text = response.content.strip()
        agents = []
        refined_query = user_input

        for line in text.split("\n"):
            line = line.strip()
            if line.upper().startswith("AGENTS:"):
                agent_str = line.split(":", 1)[1].strip()
                agents = [a.strip().lower() for a in agent_str.split(",")]
            elif line.upper().startswith("QUERY:"):
                refined_query = line.split(":", 1)[1].strip()

        # Fallback: if parsing failed, use all agents
        if not agents:
            agents = ["consumer", "sales", "service", "inventory"]

        # Validate agent names
        valid_agents = [a for a in agents if a in self.agents]
        if not valid_agents:
            valid_agents = ["consumer"]  # Default fallback

        return {"agents": valid_agents, "refined_query": refined_query}

    def _synthesize(self, user_input: str, agent_results: Dict[str, str]) -> str:
        """Synthesize results from multiple agents into a unified briefing."""
        results_text = ""
        for agent_key, result in agent_results.items():
            agent_label = {
                "consumer": "Consumer Intelligence",
                "sales": "Sales Intelligence",
                "service": "Service Intelligence",
                "inventory": "Inventory Intelligence",
            }.get(agent_key, agent_key)
            results_text += f"\n\n═══ {agent_label.upper()} ═══\n{result}"

        synthesis_prompt = f"""You are the DealerPulse Orchestrator synthesizing intelligence from multiple agents.

Original question: "{user_input}"

Agent reports:
{results_text}

Your job:
1. Synthesize these reports into a unified, actionable briefing
2. Identify CROSS-FUNCTIONAL OPPORTUNITIES that no single agent would catch
   (e.g., aging inventory that matches active leads, service customers who are trade-up candidates)
3. Provide a prioritized action list with estimated business impact
4. Keep it scannable — a dealer principal should get the key points in 60 seconds

Format your response as a professional dealer operations briefing.
"""

        response = self.llm.invoke([
            SystemMessage(content=ORCHESTRATOR_SYSTEM_PROMPT),
            HumanMessage(content=synthesis_prompt),
        ])

        return response.content
