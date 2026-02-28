"""
Kibana Agent Builder API client.
All communication with Elastic Agent Builder goes through here.
"""

import os
import requests
from . import registry_loader


KIBANA_URL = os.getenv("KIBANA_URL", "")
ELASTIC_API_KEY = os.getenv("ELASTIC_API_KEY", "")
TIMEOUT = 120


def _headers():
    return {
        "Content-Type": "application/json",
        "kbn-xsrf": "true",
        "Authorization": f"ApiKey {ELASTIC_API_KEY}",
    }


def _url(path):
    return f"{KIBANA_URL}/api/agent_builder/{path}"


def is_configured():
    """Check if Kibana credentials are set in environment."""
    return bool(KIBANA_URL) and bool(ELASTIC_API_KEY)


# ─── Health ─────────────────────────────────────

def check_connection():
    """Check if Kibana is reachable."""
    if not is_configured():
        return {"connected": False, "reason": "KIBANA_URL or ELASTIC_API_KEY not set"}
    try:
        resp = requests.get(
            f"{KIBANA_URL}/api/status",
            headers=_headers(),
            timeout=30,
        )
        if resp.status_code == 200:
            return {"connected": True, "kibana_url": KIBANA_URL}
        return {"connected": False, "reason": f"HTTP {resp.status_code}"}
    except Exception as e:
        return {"connected": False, "reason": str(e)}


# ─── Tools ──────────────────────────────────────

def list_remote_tools():
    """List tools currently registered in Agent Builder."""
    try:
        resp = requests.get(_url("tools"), headers=_headers(), timeout=TIMEOUT)
        return resp.json().get("results", [])
    except Exception as e:
        return []


def list_tools_with_status():
    """
    Merge local registry definitions with remote registration status.
    Returns list of tools with 'registered' boolean.
    """
    remote = list_remote_tools()
    remote_ids = {t["id"] for t in remote}
    local = registry_loader.get_all_tools()

    results = []
    for tool in local:
        results.append({
            "id": tool["id"],
            "label": tool["meta"]["label"],
            "icon": tool["meta"]["icon"],
            "type": tool["type"],
            "used_by": tool["meta"]["used_by"],
            "category": tool["meta"]["category"],
            "registered": tool["id"] in remote_ids,
        })
    return results


def register_tool(tool_id):
    """Register a single tool in Agent Builder."""
    payload = registry_loader.get_tool_payload(tool_id)
    if not payload:
        return {"success": False, "error": f"Tool {tool_id} not found in registry"}
    try:
        resp = requests.post(_url("tools"), headers=_headers(), json=payload, timeout=TIMEOUT)
        if resp.status_code in (200, 201):
            return {"success": True, "id": tool_id, "action": "created"}
        if resp.status_code == 409:
            resp2 = requests.put(_url(f"tools/{tool_id}"), headers=_headers(), json=payload, timeout=TIMEOUT)
            return {"success": True, "id": tool_id, "action": "updated"}
        return {"success": False, "id": tool_id, "error": f"HTTP {resp.status_code}: {resp.text}"}
    except Exception as e:
        return {"success": False, "id": tool_id, "error": str(e)}


def register_all_tools():
    """Register all tools from registry."""
    results = []
    for tool in registry_loader.get_all_tools():
        results.append(register_tool(tool["id"]))
    return results


def delete_tool(tool_id):
    """Delete a tool from Agent Builder."""
    try:
        resp = requests.delete(_url(f"tools/{tool_id}"), headers=_headers(), timeout=TIMEOUT)
        return {"success": resp.status_code in (200, 204), "id": tool_id}
    except Exception as e:
        return {"success": False, "id": tool_id, "error": str(e)}


def delete_all_tools():
    """Delete all DealerPulse tools from Agent Builder."""
    results = []
    for tool in registry_loader.get_all_tools():
        results.append(delete_tool(tool["id"]))
    return results


# ─── Agents ─────────────────────────────────────

def list_remote_agents():
    """List agents currently registered in Agent Builder."""
    try:
        resp = requests.get(_url("agents"), headers=_headers(), timeout=TIMEOUT)
        return resp.json().get("results", [])
    except Exception as e:
        return []


def list_agents_with_status():
    """
    Merge local registry definitions with remote registration status.
    Returns list of agents with 'registered' boolean.
    """
    remote = list_remote_agents()
    remote_ids = {a["id"] for a in remote}
    local = registry_loader.get_all_agents()

    results = []
    for agent in local:
        meta = agent.get("meta", {})
        results.append({
            "id": agent["id"],
            "name": agent["name"],
            "persona": meta.get("persona", ""),
            "patterns": meta.get("patterns", []),
            "color": meta.get("color", ""),
            "custom_tool_count": len(meta.get("custom_tools", [])),
            "builtin_tool_count": len(meta.get("builtin_tools", [])),
            "used_by_pages": meta.get("used_by_pages", []),
            "registered": agent["id"] in remote_ids,
        })
    return results


def register_agent(agent_id):
    """Register a single agent in Agent Builder (assembles tools from meta)."""
    payload = registry_loader.get_agent_payload(agent_id)
    if not payload:
        return {"success": False, "error": f"Agent {agent_id} not found in registry"}
    try:
        resp = requests.post(_url("agents"), headers=_headers(), json=payload, timeout=TIMEOUT)
        if resp.status_code in (200, 201):
            return {"success": True, "id": agent_id, "action": "created"}
        if resp.status_code == 409:
            resp2 = requests.put(_url(f"agents/{agent_id}"), headers=_headers(), json=payload, timeout=TIMEOUT)
            return {"success": True, "id": agent_id, "action": "updated"}
        return {"success": False, "id": agent_id, "error": f"HTTP {resp.status_code}: {resp.text}"}
    except Exception as e:
        return {"success": False, "id": agent_id, "error": str(e)}


def register_all_agents():
    """Register all agents from registry."""
    results = []
    for agent in registry_loader.get_all_agents():
        results.append(register_agent(agent["id"]))
    return results


def delete_agent(agent_id):
    """Delete an agent from Agent Builder."""
    try:
        resp = requests.delete(_url(f"agents/{agent_id}"), headers=_headers(), timeout=TIMEOUT)
        return {"success": resp.status_code in (200, 204), "id": agent_id}
    except Exception as e:
        return {"success": False, "id": agent_id, "error": str(e)}


def delete_all_agents():
    """Delete all DealerPulse agents from Agent Builder."""
    results = []
    for agent in registry_loader.get_all_agents():
        results.append(delete_agent(agent["id"]))
    return results


# ─── Converse (Chat) ────────────────────────────

def converse(agent_id, user_input, conversation_id=None):
    """
    Send a message to an agent via Agent Builder converse API.
    This is the main runtime call used by all functional pages.
    """
    payload = {
        "input": user_input,
        "agent_id": agent_id,
    }
    if conversation_id:
        payload["conversation_id"] = conversation_id

    try:
        resp = requests.post(
            _url("converse"),
            headers=_headers(),
            json=payload,
            timeout=TIMEOUT,
        )
        data = resp.json()
        return {
            "success": True,
            "engine": "agent-builder",
            "agent_id": agent_id,
            "response": data.get("response", {}).get("message", ""),
            "steps": data.get("steps", []),
            "token_usage": data.get("model_usage", {}),
            "conversation_id": data.get("conversation_id"),
        }
    except Exception as e:
        return {
            "success": False,
            "engine": "agent-builder",
            "agent_id": agent_id,
            "error": str(e),
        }