#!/bin/bash
# ═══════════════════════════════════════════════
# DealerPulse — Service Status & Health Check
# Shows container status, ports, and health for all services.
# ═══════════════════════════════════════════════

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/.env"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  DealerPulse — Service Status"
echo "═══════════════════════════════════════════════════════════"
echo ""

# ── Service definitions: name, port, health URL ──
declare -A SERVICES=(
  ["Elasticsearch"]="$ES_PORT|http://localhost:$ES_PORT/_cluster/health"
  ["Kibana"]="$KIBANA_PORT|http://localhost:$KIBANA_PORT/api/status"
  ["PostgreSQL"]="$POSTGRES_PORT|"
  ["Kafka"]="$KAFKA_PORT|"
  ["Kafka UI"]="$KAFKA_UI_PORT|http://localhost:$KAFKA_UI_PORT"
  ["Qdrant"]="$QDRANT_PORT|http://localhost:$QDRANT_PORT/dashboard"
  ["Weaviate"]="$WEAVIATE_PORT|http://localhost:$WEAVIATE_PORT/v1/.well-known/ready"
  ["Milvus"]="$MILVUS_PORT|"
  ["ChromaDB"]="$CHROMADB_PORT|http://localhost:$CHROMADB_PORT/api/v1/heartbeat"
  ["n8n"]="$N8N_PORT|http://localhost:$N8N_PORT/healthz"
  ["Prometheus"]="$PROMETHEUS_PORT|http://localhost:$PROMETHEUS_PORT/-/healthy"
  ["Grafana"]="$GRAFANA_PORT|http://localhost:$GRAFANA_PORT/api/health"
  ["OTel Collector"]="$OTEL_COLLECTOR_PORT|"
)

# Column header
printf "  %-18s %-8s %-10s %s\n" "SERVICE" "PORT" "STATUS" "URL"
printf "  %-18s %-8s %-10s %s\n" "──────────────────" "────────" "──────────" "────────────────────────────"

for name in "Elasticsearch" "Kibana" "PostgreSQL" "Kafka" "Kafka UI" \
            "Qdrant" "Weaviate" "Milvus" "ChromaDB" \
            "n8n" "Prometheus" "Grafana" "OTel Collector"; do
  
  IFS='|' read -r port health_url <<< "${SERVICES[$name]}"
  
  # Check if port is listening
  if nc -z localhost "$port" 2>/dev/null; then
    status="✅ UP"
  else
    status="⬚ DOWN"
  fi
  
  # Show URL
  if [ -n "$health_url" ]; then
    display_url="localhost:$port"
  else
    display_url="localhost:$port"
  fi
  
  printf "  %-18s %-8s %-10s %s\n" "$name" "$port" "$status" "$display_url"
done

echo ""

# ── Docker network status ──
if docker network inspect "$NETWORK_NAME" >/dev/null 2>&1; then
  container_count=$(docker network inspect "$NETWORK_NAME" --format '{{len .Containers}}')
  echo "  🔗 Network '$NETWORK_NAME': $container_count containers connected"
else
  echo "  🔗 Network '$NETWORK_NAME': not created"
fi

# ── Disk usage ──
echo ""
echo "  💾 Volume disk usage:"
docker system df --format '{{.Type}}\t{{.Size}}\t{{.Reclaimable}}' 2>/dev/null | \
  while IFS=$'\t' read -r type size reclaim; do
    printf "     %-15s Size: %-10s Reclaimable: %s\n" "$type" "$size" "$reclaim"
  done

echo ""
echo "═══════════════════════════════════════════════════════════"
