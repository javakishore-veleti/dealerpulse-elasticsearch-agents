"""
DealerPulse — FastAPI Web Interface
Browser-based interface for running scenarios and freeform queries.
"""
import sys
sys.path.insert(0, "/app" if __name__ != "__main__" else ".")

from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dealerpulse_v2.api_v2 import router as v2_router
app = FastAPI(title="DealerPulse", description="Multi-Agent Dealer Operations Intelligence")
app.include_router(v2_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class QueryRequest(BaseModel):
    query: str
    agent: str = "orchestrator"  # consumer, sales, service, inventory, orchestrator


class ScenarioRequest(BaseModel):
    scenario_id: int


@app.get("/", response_class=HTMLResponse)
async def home():
    """Serve the DealerPulse web UI."""
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>DealerPulse — Dealer Operations Intelligence</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
                   background: #0f172a; color: #e2e8f0; }
            .container { max-width: 1000px; margin: 0 auto; padding: 24px; }
            h1 { color: #60a5fa; margin-bottom: 8px; }
            .subtitle { color: #94a3b8; margin-bottom: 24px; }
            .scenarios { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
            .scenario-btn { background: #1e293b; border: 1px solid #334155; border-radius: 8px;
                           padding: 16px; cursor: pointer; text-align: left; color: #e2e8f0;
                           transition: all 0.2s; }
            .scenario-btn:hover { border-color: #60a5fa; background: #1e3a5f; }
            .scenario-btn .num { color: #60a5fa; font-weight: bold; }
            .scenario-btn .name { font-weight: 600; margin: 4px 0; }
            .scenario-btn .desc { color: #94a3b8; font-size: 0.85em; }
            .scenario-btn .agent { display: inline-block; padding: 2px 8px; border-radius: 4px;
                                  font-size: 0.75em; margin-top: 4px; }
            .agent-consumer { background: #065f46; color: #6ee7b7; }
            .agent-sales { background: #713f12; color: #fcd34d; }
            .agent-service { background: #7f1d1d; color: #fca5a5; }
            .agent-inventory { background: #1e3a5f; color: #93c5fd; }
            .agent-orchestrator { background: #581c87; color: #d8b4fe; }
            .query-box { display: flex; gap: 8px; margin-bottom: 24px; }
            .query-box input { flex: 1; background: #1e293b; border: 1px solid #334155;
                              border-radius: 8px; padding: 12px 16px; color: #e2e8f0;
                              font-size: 1em; }
            .query-box input:focus { outline: none; border-color: #60a5fa; }
            .query-box button { background: #2563eb; color: white; border: none; 
                               border-radius: 8px; padding: 12px 24px; cursor: pointer;
                               font-weight: 600; }
            .query-box button:hover { background: #1d4ed8; }
            .query-box button:disabled { background: #475569; cursor: wait; }
            .response { background: #1e293b; border: 1px solid #334155; border-radius: 8px;
                       padding: 20px; white-space: pre-wrap; line-height: 1.6;
                       min-height: 100px; display: none; }
            .response.active { display: block; }
            .loading { color: #60a5fa; animation: pulse 1.5s infinite; }
            @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚗 DealerPulse</h1>
            <p class="subtitle">Multi-Agent Dealer Operations Intelligence</p>
            
            <div class="scenarios">
                <button class="scenario-btn" onclick="runScenario(1)">
                    <span class="num">#1</span>
                    <div class="name">Instant Lead Response</div>
                    <div class="desc">Sarah submits a lead at 9:47 PM for a mid-size SUV</div>
                    <span class="agent agent-consumer">CONSUMER</span>
                </button>
                <button class="scenario-btn" onclick="runScenario(2)">
                    <span class="num">#2</span>
                    <div class="name">Morning Sales Brief</div>
                    <div class="desc">BDC prep with full customer intelligence</div>
                    <span class="agent agent-sales">SALES</span>
                </button>
                <button class="scenario-btn" onclick="runScenario(3)">
                    <span class="num">#3</span>
                    <div class="name">Diagnose Before Hood Opens</div>
                    <div class="desc">DTC P0300 + P0301: rough idle at cold start</div>
                    <span class="agent agent-service">SERVICE</span>
                </button>
                <button class="scenario-btn" onclick="runScenario(4)">
                    <span class="num">#4</span>
                    <div class="name">Aging Stock Alert</div>
                    <div class="desc">$385K exposure on 60+ day inventory</div>
                    <span class="agent agent-inventory">INVENTORY</span>
                </button>
                <button class="scenario-btn" onclick="runScenario(5)">
                    <span class="num">#5</span>
                    <div class="name">Lead + Inventory Match</div>
                    <div class="desc">EV leads overnight match aging Atlas EVs</div>
                    <span class="agent agent-orchestrator">MULTI-AGENT</span>
                </button>
                <button class="scenario-btn" onclick="runScenario(6)">
                    <span class="num">#6</span>
                    <div class="name">Service → Sales Opportunity</div>
                    <div class="desc">Repeat repair triggers trade-up conversation</div>
                    <span class="agent agent-orchestrator">MULTI-AGENT</span>
                </button>
                <button class="scenario-btn" onclick="runScenario(7)">
                    <span class="num">#7</span>
                    <div class="name">Full Morning Briefing</div>
                    <div class="desc">All 4 agents coordinate for dealer principal</div>
                    <span class="agent agent-orchestrator">ALL AGENTS</span>
                </button>
            </div>
            
            <div class="query-box">
                <input type="text" id="query" placeholder="Or ask anything... e.g. 'What aging stock should I reprice?'" 
                       onkeypress="if(event.key==='Enter')askQuestion()">
                <button id="askBtn" onclick="askQuestion()">Ask DealerPulse</button>
            </div>
            
            <div id="response" class="response"></div>
        </div>
        
        <script>
            async function runScenario(id) {
                const resp = document.getElementById('response');
                const btn = document.getElementById('askBtn');
                resp.className = 'response active';
                resp.innerHTML = '<span class="loading">Running Scenario ' + id + '...</span>';
                btn.disabled = true;
                
                try {
                    const res = await fetch('/api/scenario', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({scenario_id: id})
                    });
                    const data = await res.json();
                    resp.textContent = data.response;
                } catch(e) {
                    resp.textContent = 'Error: ' + e.message;
                }
                btn.disabled = false;
            }
            
            async function askQuestion() {
                const query = document.getElementById('query').value.trim();
                if (!query) return;
                
                const resp = document.getElementById('response');
                const btn = document.getElementById('askBtn');
                resp.className = 'response active';
                resp.innerHTML = '<span class="loading">Thinking...</span>';
                btn.disabled = true;
                
                try {
                    const res = await fetch('/api/query', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({query: query})
                    });
                    const data = await res.json();
                    resp.textContent = data.response;
                } catch(e) {
                    resp.textContent = 'Error: ' + e.message;
                }
                btn.disabled = false;
            }
        </script>
    </body>
    </html>
    """


@app.post("/api/scenario")
async def run_scenario(request: ScenarioRequest):
    """Run a pre-built scenario."""
    from dealerpulse.scenarios import get_scenario
    
    scenario = get_scenario(request.scenario_id)
    if not scenario:
        raise HTTPException(status_code=404, detail=f"Scenario {request.scenario_id} not found")
    
    from dealerpulse.cli import get_agent
    agent = get_agent(scenario["agent"])
    result = agent.run(scenario["prompt"])
    
    return {"scenario": scenario["name"], "agent": scenario["agent"], "response": result}


@app.post("/api/query")
async def run_query(request: QueryRequest):
    """Run a freeform query through an agent."""
    from dealerpulse.cli import get_agent
    agent = get_agent(request.agent)
    result = agent.run(request.query)
    
    return {"agent": request.agent, "response": result}


@app.get("/api/health")
async def health():
    """Health check."""
    from config.es_config import check_es_health
    try:
        es_health = check_es_health()
        return {"status": "ok", "elasticsearch": es_health.get("status")}
    except Exception as e:
        return {"status": "degraded", "error": str(e)}


# ═══════════════════════════════════════════════
# Data Management Endpoints (Hackathon Console)
# ═══════════════════════════════════════════════

@app.get("/api/indices")
async def list_indices():
    """List all dealer indices with doc counts"""
    try:
        from config.es_config import get_es_client
        es = get_es_client()
        expected = [
            "dealer-inventory", "dealer-leads", "dealer-service-orders",
            "dealer-incentives", "dealer-pricing-alerts", "dealer-tsb-recalls"
        ]
        results = []
        for idx in expected:
            try:
                count = es.count(index=idx)["count"]
                results.append({"index": idx, "exists": True, "doc_count": count})
            except Exception:
                results.append({"index": idx, "exists": False, "doc_count": 0})
        return {"indices": results}
    except Exception as e:
        return {"indices": [], "error": str(e)}


@app.post("/api/data/load")
async def load_all_data():
    """Load all synthetic data into ES"""
    try:
        import subprocess
        result = subprocess.run(
            ["python", "scripts/load_data.py"],
            capture_output=True, text=True, timeout=120
        )
        return {
            "success": result.returncode == 0,
            "output": result.stdout,
            "error": result.stderr if result.returncode != 0 else None
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.post("/api/data/load/{index_name}")
async def load_index_data(index_name: str):
    """Load synthetic data for a specific index"""
    index_to_script = {
        "dealer-inventory": "data/synthetic/generate_inventory.py",
        "dealer-leads": "data/synthetic/generate_leads.py",
        "dealer-service-orders": "data/synthetic/generate_service_orders.py",
        "dealer-incentives": "data/synthetic/generate_incentives.py",
        "dealer-pricing-alerts": "data/synthetic/generate_pricing_alerts.py",
        "dealer-tsb-recalls": "data/synthetic/generate_tsb_recalls.py",
    }
    if index_name not in index_to_script:
        return {"success": False, "error": f"Unknown index: {index_name}"}
    try:
        import subprocess
        result = subprocess.run(
            ["python", index_to_script[index_name]],
            capture_output=True, text=True, timeout=60
        )
        return {
            "success": result.returncode == 0,
            "output": result.stdout,
            "error": result.stderr if result.returncode != 0 else None
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.delete("/api/data/reset")
async def reset_all_data():
    """Delete all dealer indices"""
    try:
        from config.es_config import get_es_client
        es = get_es_client()
        deleted = []
        for idx in ["dealer-inventory", "dealer-leads", "dealer-service-orders",
                     "dealer-incentives", "dealer-pricing-alerts", "dealer-tsb-recalls"]:
            try:
                es.indices.delete(index=idx, ignore_unavailable=True)
                deleted.append(idx)
            except Exception:
                pass
        return {"success": True, "deleted": deleted}
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.delete("/api/data/reset/{index_name}")
async def reset_index(index_name: str):
    """Delete a specific index"""
    try:
        from config.es_config import get_es_client
        es = get_es_client()
        es.indices.delete(index=index_name, ignore_unavailable=True)
        return {"success": True, "deleted": index_name}
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.post("/api/scenario/test/{scenario_id}")
async def test_scenario(scenario_id: int):
    """Run a scenario and return full debug output"""
    try:
        from dealerpulse.scenarios import run_scenario
        result = run_scenario(scenario_id)
        return {
            "success": True,
            "scenario_id": scenario_id,
            "response": result
        }
    except Exception as e:
        return {"success": False, "scenario_id": scenario_id, "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
