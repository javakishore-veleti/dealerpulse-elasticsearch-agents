#!/bin/bash
# ═══════════════════════════════════════════════
# DealerPulse — Stop All Services
# Stops containers but preserves data volumes.
# Usage:
#   ./docker-all-down.sh           # Stop everything
#   ./docker-all-down.sh kafka     # Stop only kafka
# ═══════════════════════════════════════════════

set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/.env"

# Reverse order — stop dependents first
SERVICE_ORDER=(
  "n8n"
  "observability"
  "vector-dbs/chromadb"
  "vector-dbs/milvus"
  "vector-dbs/weaviate"
  "vector-dbs/qdrant"
  "kafka"
  "elasticsearch"
  "postgres"
)

# ── Determine which services to stop ──
if [ $# -gt 0 ]; then
  TARGETS=()
  for arg in "$@"; do
    for svc in "${SERVICE_ORDER[@]}"; do
      folder_name=$(basename "$svc")
      if [[ "$folder_name" == "$arg" || "$svc" == "$arg" ]]; then
        TARGETS+=("$svc")
      fi
    done
  done
else
  TARGETS=("${SERVICE_ORDER[@]}")
fi

echo ""
echo "═══════════════════════════════════════"
echo "  DealerPulse — Stopping Services"
echo "  (Data volumes preserved)"
echo "═══════════════════════════════════════"
echo ""

for svc in "${TARGETS[@]}"; do
  compose_file="$SCRIPT_DIR/$svc/docker-compose.yml"
  
  if [ ! -f "$compose_file" ]; then
    continue
  fi
  
  echo "🛑 Stopping $svc..."
  docker compose -f "$compose_file" --env-file "$SCRIPT_DIR/.env" down
  echo "   ✓ $svc stopped"
done

echo ""
echo "✓ Services stopped. Data volumes intact."
echo "  Run ./docker-all-up.sh to restart."
