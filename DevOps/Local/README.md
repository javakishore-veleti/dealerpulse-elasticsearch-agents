# DealerPulse — Local DevOps Stack

A modular, service-by-service Docker infrastructure for local development.
Each service has its own `docker-compose.yml` so you can start only what you need.

## Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                        dealerpulse-net (shared Docker network)       │
│                                                                      │
│  ┌─────────────┐  ┌───────────────┐  ┌─────────────┐                │
│  │ PostgreSQL   │  │ Elasticsearch │  │   Kafka     │                │
│  │ + pgVector   │  │ + Kibana      │  │ + Kafka UI  │                │
│  │ :5432        │  │ :9200 / :5601 │  │ :9092/:8080 │                │
│  └──────┬───────┘  └───────┬───────┘  └──────┬──────┘                │
│         │                  │                  │                       │
│  ┌──────▼──────────────────▼──────────────────▼──────┐               │
│  │                    n8n (:5678)                     │               │
│  │           Workflow automation engine               │               │
│  └───────────────────────────────────────────────────┘               │
│                                                                      │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐           │
│  │  Qdrant   │ │ Weaviate  │ │  Milvus   │ │ ChromaDB  │           │
│  │  :6333    │ │  :8081    │ │  :19530   │ │  :8082    │           │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘           │
│                                                                      │
│  ┌───────────────────────────────────────────────────┐               │
│  │         Observability Stack                        │               │
│  │  Prometheus :9090 → Grafana :3000                  │               │
│  │  OpenTelemetry Collector :4317/:4318               │               │
│  └───────────────────────────────────────────────────┘               │
└──────────────────────────────────────────────────────────────────────┘
```

## Quick Start

```bash
# Start everything
./docker-all-up.sh

# Start only what you need
./docker-all-up.sh elasticsearch postgres
./docker-all-up.sh kafka

# Check what's running
./docker-all-status.sh

# Stop (preserves data)
./docker-all-down.sh

# Nuclear — destroy everything including data
./docker-all-destroy.sh
```

## Services & Ports

| Service         | Port(s)       | UI URL                        | Purpose                        |
|-----------------|---------------|-------------------------------|--------------------------------|
| PostgreSQL      | 5432          | —                             | Relational DB + pgVector       |
| Elasticsearch   | 9200          | —                             | Search + analytics engine      |
| Kibana          | 5601          | http://localhost:5601         | ES visualization + Agent Builder |
| Kafka           | 9092          | —                             | Event streaming                |
| Kafka UI        | 8080          | http://localhost:8080         | Kafka topic browser            |
| Qdrant          | 6333 / 6334   | http://localhost:6333/dashboard | Vector DB (Rust)             |
| Weaviate        | 8081          | —                             | Vector DB (GraphQL)            |
| Milvus          | 19530         | —                             | Vector DB (distributed)        |
| ChromaDB        | 8082          | —                             | Vector DB (Python-native)      |
| n8n             | 5678          | http://localhost:5678         | Workflow automation            |
| Prometheus      | 9090          | http://localhost:9090         | Metrics collection             |
| Grafana         | 3000          | http://localhost:3000         | Dashboards (admin/admin)       |
| OTel Collector  | 4317 / 4318   | —                             | Telemetry pipeline             |

## Design Decisions

**Why separate compose files?** So you can run `./docker-all-up.sh elasticsearch postgres` during 
development and not burn 16 GB of RAM on services you're not using. Each compose file is 
self-contained — it declares its own volumes and joins the shared network.

**Why a shared network?** So any service can reach any other service by container name. 
For example, n8n connects to PostgreSQL at `postgres:5432` and Kafka at `kafka:9092` — 
no host networking tricks needed.

**Why separate volumes per service?** So `./docker-all-destroy.sh kafka` only deletes Kafka 
data, not your Elasticsearch indices.
