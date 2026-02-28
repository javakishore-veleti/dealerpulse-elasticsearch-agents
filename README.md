# DealerPulse - Multi-Agent Dealer Operations Intelligence

> A multi-agent AI system that connects the four disconnected pillars of dealership operations - consumer engagement, sales execution, service diagnostics, and inventory management - using Elasticsearch as the unified intelligence layer.

![Architecture](docs/architecture.png)

## The Problem

At a typical dealership today:

- A customer submits a lead online at 9 PM. **Nobody responds until morning.**
- The BDC agent calls back but **doesn't know what inventory matches** the customer's budget *after* incentives.
- The customer's trade-in arrives in service. The technician **doesn't know there's an open TSB** for the exact symptom.
- The inventory manager **doesn't know** that 3 units of the same model are aging past 60 days while 12 active leads want exactly that vehicle.

Four separate systems. Four separate teams. **Zero coordination.**

DealerPulse fixes that with AI agents that share context through Elasticsearch.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│              DealerPulse Orchestrator Agent              │
│     Routes queries · Coordinates multi-agent work       │
│     Synthesizes cross-functional intelligence           │
└──────────┬───────────┬───────────┬───────────┬──────────┘
           │           │           │           │
    ┌──────▼───┐ ┌─────▼────┐ ┌───▼──────┐ ┌──▼────────┐
    │ CONSUMER │ │  SALES   │ │ SERVICE  │ │ INVENTORY │
    │  Agent   │ │  Agent   │ │  Agent   │ │   Agent   │
    │          │ │          │ │          │ │           │
    │ Lead     │ │ Deal     │ │ DTC/TSB  │ │ Pricing/  │
    │ Response │ │ Prep     │ │ Diagnose │ │ Aging     │
    │ Matching │ │ Briefing │ │ 3C Docs  │ │ Analytics │
    └──────────┘ └──────────┘ └──────────┘ └───────────┘
           │           │           │           │
    ┌──────▼───────────▼───────────▼───────────▼──────────┐
    │              Elasticsearch Indices                    │
    │                                                      │
    │  dealer-inventory    dealer-leads                     │
    │  dealer-service-orders    dealer-incentives           │
    │  dealer-pricing-alerts    dealer-tsb-recalls          │
    └──────────────────────────────────────────────────────┘
```

### Agents & Capabilities

| Agent | Persona | ES Tools Used | Key Capability |
|-------|---------|---------------|----------------|
| Consumer | Sarah (Online Buyer) | Search, ES\|QL | Instant lead response with inventory + incentive matching |
| Sales | BDC Agent | Search, ES\|QL, Workflow | Deal preparation briefings with full customer intelligence |
| Service | Ron (Technician) | Search, ES\|QL | DTC → TSB → Fix recommendation with 3C auto-documentation |
| Inventory | Josh (Inventory Mgr) | ES\|QL, Workflow | Aging stock alerts, pricing anomalies, competitive positioning |
| Orchestrator | Dealer Principal | All (via delegation) | Cross-agent coordination and daily briefings |

## 7 Demo Scenarios

| # | Scenario | Agents | Complexity |
|---|----------|--------|------------|
| 1 | Instant Lead Response — Customer submits lead at 9:47 PM | Consumer | Single |
| 2 | Morning Sales Brief — BDC prep before first call | Sales | Single |
| 3 | Diagnose Before Hood Opens — DTC + TSB + fix recommendation | Service | Single |
| 4 | Aging Stock Alert — $385K exposure on 60+ day inventory | Inventory | Single |
| 5 | Lead + Inventory Match — Overnight EV leads match aging stock | Consumer → Inventory | Multi |
| 6 | Service → Sales Opportunity — Repeat repair triggers trade-up | Service → Sales → Inventory | Multi |
| 7 | Full Dealer Morning Briefing — All agents coordinate | All 4 Agents | Full |

## Quick Start

### Prerequisites

- Docker & Docker Compose
- One of: OpenAI API key **or** Ollama installed locally (for fully offline operation)

### 1. Clone & Configure

```bash
git clone https://github.com/YOUR_USERNAME/dealerpulse-elasticsearch-agents.git
cd dealerpulse-elasticsearch-agents
cp .env.example .env
```

Edit `.env` to set your LLM backend:

```bash
# Option A: OpenAI
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-your-key-here

# Option B: Ollama (fully offline, no cost)
LLM_PROVIDER=ollama
OLLAMA_MODEL=llama3.1:8b
```

### 2. Start Infrastructure

```bash
docker compose up -d
```

This starts:
- **Elasticsearch** (port 9200) — data & search layer
- **Kibana** (port 5601) — visualization & Agent Builder UI
- **Ollama** (port 11434) — local LLM (if using Ollama backend)

### 3. Load Synthetic Data

```bash
docker compose exec app python scripts/load_data.py
```

Loads 1,230+ synthetic records across 6 indices with realistic dealer operations data.

### 4. Run Scenarios

```bash
# Interactive mode — choose scenarios from menu
docker compose exec app python -m dealerpulse.cli

# Run a specific scenario
docker compose exec app python -m dealerpulse.cli --scenario 1

# Run all scenarios sequentially
docker compose exec app python -m dealerpulse.cli --all

# Ask a freeform question
docker compose exec app python -m dealerpulse.cli --ask "What aging stock should I reprice this week?"
```

### 5. Web UI (Optional)

```bash
# Access at http://localhost:8000
docker compose exec app python -m dealerpulse.api
```

## Project Structure

```
dealerpulse-elasticsearch-agents/
├── docker-compose.yml          # ES + Kibana + Ollama + App
├── Dockerfile                  # Python app container
├── .env.example                # Configuration template
├── requirements.txt            # Python dependencies
├── README.md
│
├── config/
│   ├── settings.py             # Centralized configuration
│   ├── llm_config.py           # LLM provider abstraction (OpenAI/Ollama)
│   └── es_config.py            # Elasticsearch connection settings
│
├── agents/
│   ├── __init__.py
│   ├── base_agent.py           # Base agent class with ES tools
│   ├── consumer_agent.py       # Scenario 1: Lead response + matching
│   ├── sales_agent.py          # Scenario 2: Deal prep briefings
│   ├── service_agent.py        # Scenario 3: DTC diagnosis + 3C docs
│   ├── inventory_agent.py      # Scenario 4: Aging stock + pricing
│   └── orchestrator.py         # Scenarios 5-7: Multi-agent coordination
│
├── tools/
│   ├── __init__.py
│   ├── es_search.py            # Elasticsearch search tool
│   ├── es_esql.py              # ES|QL query tool
│   └── es_workflow.py          # Workflow tool (multi-step ES operations)
│
├── data/
│   ├── synthetic/
│   │   ├── generate_inventory.py
│   │   ├── generate_leads.py
│   │   ├── generate_service_orders.py
│   │   ├── generate_incentives.py
│   │   ├── generate_pricing_alerts.py
│   │   └── generate_tsb_recalls.py
│   └── mappings/
│       ├── dealer-inventory.json
│       ├── dealer-leads.json
│       ├── dealer-service-orders.json
│       ├── dealer-incentives.json
│       ├── dealer-pricing-alerts.json
│       └── dealer-tsb-recalls.json
│
├── scripts/
│   ├── load_data.py            # Index creation + data loading
│   ├── verify_data.py          # Verify indices and counts
│   └── reset_data.py           # Clean and reload all data
│
├── dealerpulse/
│   ├── __init__.py
│   ├── cli.py                  # Command-line interface
│   ├── api.py                  # FastAPI web interface
│   └── scenarios.py            # Pre-built scenario definitions
│
├── docs/
│   ├── architecture.md         # Detailed architecture documentation
│   ├── scenarios.md            # Scenario walkthroughs
│   └── business_value.md       # ROI and business impact analysis
│
├── tests/
│   ├── test_agents.py
│   ├── test_tools.py
│   └── test_scenarios.py
│
└── LICENSE                     # MIT
```

## Business Value

| Metric | Current State | With DealerPulse | Impact |
|--------|--------------|------------------|--------|
| Lead response time | 8-12 hours (next morning) | < 60 seconds | 78% higher close rate on < 5 min response |
| Sales prep time | 15-20 min per lead | < 30 seconds | BDC handles 3x more leads per day |
| Diagnostic time | 30-60 min per vehicle | 2-5 minutes | 40% more cars through service bay |
| Inventory aging detection | Weekly spreadsheet review | Real-time alerts | $50K-200K reduced carrying cost/month |
| Cross-department coordination | Doesn't happen | Automatic | Prevents $385K+ in aging stock scenarios |

## Inspired By

- [Cox Automotive: How AI Helps Your People Win](https://www.coxautoinc.com/) — Four dealer personas with AI-transformed workflows (NADA 2026)
- [J.D. Power CSI Study](https://www.jdpower.com/) — 12% first-visit fix failure rate
- [NADA Annual Financial Profile](https://www.nada.org/) — Fixed ops = 50%+ gross profit

## Tech Stack

- **Elasticsearch 8.x** — Search, analytics, vector embeddings
- **Python 3.11+** — Agent framework
- **LangChain** — Agent orchestration with tool binding
- **OpenAI GPT-4o / Ollama Llama 3.1** — Configurable LLM backend
- **FastAPI** — Optional web interface
- **Docker Compose** — Local development environment

## License

MIT — See [LICENSE](LICENSE)
