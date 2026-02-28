"""
Registry Loader — reads JSON config files from the registry/ folder.
Provides clean access to tools, agents, scenarios, and workflows.
Strips 'meta' before sending payloads to Kibana API.
"""

import os
import json
import glob


# Registry folder path (relative to project root)
REGISTRY_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "registry")


def _load_folder(subfolder):
    """Load all JSON files from a registry subfolder, sorted by filename."""
    folder = os.path.join(REGISTRY_DIR, subfolder)
    items = []
    for filepath in sorted(glob.glob(os.path.join(folder, "*.json"))):
        with open(filepath, "r") as f:
            items.append(json.load(f))
    return items


def _strip_meta(item):
    """Return a copy without the 'meta' key (meta is for UI only, not sent to Kibana)."""
    return {k: v for k, v in item.items() if k != "meta"}


# ─── Tools ──────────────────────────────────────

def get_all_tools():
    """Load all tool definitions with meta included (for UI display)."""
    return _load_folder("tools")


def get_tool(tool_id):
    """Get a single tool by ID, or None."""
    for tool in get_all_tools():
        if tool["id"] == tool_id:
            return tool
    return None


def get_tool_payload(tool_id):
    """Get tool payload ready for Kibana API (meta stripped)."""
    tool = get_tool(tool_id)
    return _strip_meta(tool) if tool else None


def get_all_tool_payloads():
    """Get all tool payloads ready for Kibana API."""
    return [_strip_meta(t) for t in get_all_tools()]


# ─── Agents ─────────────────────────────────────

def get_all_agents():
    """Load all agent definitions with meta included (for UI display)."""
    return _load_folder("agents")


def get_agent(agent_id):
    """Get a single agent by ID, or None."""
    for agent in get_all_agents():
        if agent["id"] == agent_id:
            return agent
    return None


def get_agent_payload(agent_id):
    """
    Get agent payload ready for Kibana API.
    Assembles tools array from meta.custom_tools + meta.builtin_tools.
    Strips meta.
    """
    agent = get_agent(agent_id)
    if not agent:
        return None

    payload = _strip_meta(agent)

    # Assemble tools from meta
    custom = agent.get("meta", {}).get("custom_tools", [])
    builtin = agent.get("meta", {}).get("builtin_tools", [])
    payload["configuration"]["tools"] = [{"tool_ids": custom + builtin}]

    return payload


def get_all_agent_payloads():
    """Get all agent payloads ready for Kibana API."""
    return [get_agent_payload(a["id"]) for a in get_all_agents()]


# ─── Scenarios ──────────────────────────────────

def get_all_scenarios():
    """Load all scenario definitions."""
    return _load_folder("scenarios")


def get_scenario(scenario_id):
    """Get a single scenario by numeric ID, or None."""
    for s in get_all_scenarios():
        if s["id"] == scenario_id:
            return s
    return None


# ─── Workflows ──────────────────────────────────

def get_all_workflows():
    """Load all workflow definitions."""
    return _load_folder("workflows")


def get_workflow(workflow_id):
    """Get a single workflow by ID, or None."""
    for w in get_all_workflows():
        if w["id"] == workflow_id:
            return w
    return None