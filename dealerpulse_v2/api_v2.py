"""
DealerPulse v2 API — Agent Builder endpoints.
This is a FastAPI Router. Mount it in your main app alongside existing api.py.

Usage in your main app (e.g., main.py or wherever you create the FastAPI app):
    from dealerpulse_v2.api_v2 import router as v2_router
    app.include_router(v2_router)
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from . import kibana_client, registry_loader


router = APIRouter(prefix="/api/v2", tags=["Agent Builder v2"])


# ─── Request Models ─────────────────────────────

class ChatRequest(BaseModel):
    agent_id: str
    input: str
    conversation_id: Optional[str] = None


# ─── Health ─────────────────────────────────────

@router.get("/status")
def agent_builder_status():
    """Check Kibana Agent Builder connection status."""
    return kibana_client.check_connection()


# ─── Tools ──────────────────────────────────────

@router.get("/tools")
def list_tools():
    """List all tools with local + remote registration status."""
    if not kibana_client.is_configured():
        tools = registry_loader.get_all_tools()
        return [{"id": t["id"], "label": t["meta"]["label"], "type": t["type"], "registered": False} for t in tools]
    return kibana_client.list_tools_with_status()


@router.post("/tools/register-all")
def register_all_tools():
    """Register all 7 tools in Agent Builder."""
    if not kibana_client.is_configured():
        return {"success": False, "error": "Kibana not configured"}
    return kibana_client.register_all_tools()


@router.post("/tools/register/{tool_id}")
def register_tool(tool_id: str):
    """Register a single tool in Agent Builder."""
    if not kibana_client.is_configured():
        return {"success": False, "error": "Kibana not configured"}
    return kibana_client.register_tool(tool_id)


@router.delete("/tools/{tool_id}")
def delete_tool(tool_id: str):
    """Delete a tool from Agent Builder."""
    if not kibana_client.is_configured():
        return {"success": False, "error": "Kibana not configured"}
    return kibana_client.delete_tool(tool_id)


@router.delete("/tools")
def delete_all_tools():
    """Delete all DealerPulse tools from Agent Builder."""
    if not kibana_client.is_configured():
        return {"success": False, "error": "Kibana not configured"}
    return kibana_client.delete_all_tools()


# ─── Agents ─────────────────────────────────────

@router.get("/agents")
def list_agents():
    """List all agents with local + remote registration status."""
    if not kibana_client.is_configured():
        agents = registry_loader.get_all_agents()
        return [{"id": a["id"], "name": a["name"], "persona": a["meta"]["persona"], "registered": False} for a in agents]
    return kibana_client.list_agents_with_status()


@router.post("/agents/register-all")
def register_all_agents():
    """Register all 5 agents in Agent Builder."""
    if not kibana_client.is_configured():
        return {"success": False, "error": "Kibana not configured"}
    return kibana_client.register_all_agents()


@router.post("/agents/register/{agent_id}")
def register_agent(agent_id: str):
    """Register a single agent in Agent Builder."""
    if not kibana_client.is_configured():
        return {"success": False, "error": "Kibana not configured"}
    return kibana_client.register_agent(agent_id)


@router.delete("/agents/{agent_id}")
def delete_agent(agent_id: str):
    """Delete an agent from Agent Builder."""
    if not kibana_client.is_configured():
        return {"success": False, "error": "Kibana not configured"}
    return kibana_client.delete_agent(agent_id)


@router.delete("/agents")
def delete_all_agents():
    """Delete all DealerPulse agents from Agent Builder."""
    if not kibana_client.is_configured():
        return {"success": False, "error": "Kibana not configured"}
    return kibana_client.delete_all_agents()


# ─── Scenarios ──────────────────────────────────

@router.get("/scenarios")
def list_scenarios():
    """List all scenario definitions from registry."""
    return registry_loader.get_all_scenarios()


@router.post("/scenarios/run/{scenario_id}")
def run_scenario(scenario_id: int):
    """Run a scenario via Agent Builder converse API."""
    scenario = registry_loader.get_scenario(scenario_id)
    if not scenario:
        return {"success": False, "error": f"Scenario {scenario_id} not found"}
    if not kibana_client.is_configured():
        return {"success": False, "error": "Kibana not configured", "scenario": scenario["name"]}
    return kibana_client.converse(scenario["agent_id"], scenario["input"])


# ─── Chat ───────────────────────────────────────

@router.post("/chat")
def chat(req: ChatRequest):
    """Freeform chat with any agent via Agent Builder."""
    if not kibana_client.is_configured():
        return {"success": False, "error": "Kibana not configured"}
    return kibana_client.converse(req.agent_id, req.input, req.conversation_id)


# ─── Registry Info ──────────────────────────────

@router.get("/registry/summary")
def registry_summary():
    """Summary of everything loaded from the registry folder."""
    return {
        "tools": len(registry_loader.get_all_tools()),
        "agents": len(registry_loader.get_all_agents()),
        "scenarios": len(registry_loader.get_all_scenarios()),
        "workflows": len(registry_loader.get_all_workflows()),
    }


@router.get("/workflows")
def list_workflows():
    """List all workflow definitions from registry."""
    return registry_loader.get_all_workflows()