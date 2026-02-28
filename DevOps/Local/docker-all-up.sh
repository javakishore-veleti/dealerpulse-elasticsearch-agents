#!/bin/bash
# ═══════════════════════════════════════════════
# DealerPulse — Start All Services
# Starts services in dependency order.
# Usage:
#   ./docker-all-up.sh           # Start everything
#   ./docker-all-up.sh es        # Start only elasticsearch
#   ./docker-all-up.sh es kafka  # Start specific services
# ═══════════════════════════════════════════════

set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/.env"

# Service startup order matters:
# 1. Infra (postgres, elasticsearch) — no dependencies
# 2. Messaging (kafka) — no dependencies
# 3. Vector DBs — no dependencies
# 4. Observability — scrapes the others
# 5. n8n — connects to postgres, kafka, etc.
SERVICE_ORDER=(
  "postgres"
  "elasticsearch"
  "kafka"
  "vector-dbs/qdrant"
  "vector-dbs/weaviate"
  "vector-dbs/milvus"
  "vector-dbs/chromadb"
  "observability"
  "n8n"
)

# ── Create shared network if it doesn't exist ──
docker network inspect "$NETWORK_NAME" >/dev/null 2>&1 || {
  echo "🔗 Creating shared network: $NETWORK_NAME"
  docker network create "$NETWORK_NAME"
}

# ── Determine which services to start ──
if [ $# -gt 0 ]; then
  # User specified services — match by folder name
  TARGETS=()
  for arg in "$@"; do
    for svc in "${SERVICE_ORDER[@]}"; do
      # Match on full path or just the folder name
      folder_name=$(basename "$svc")
      if [[ "$folder_name" == "$arg" || "$svc" == "$arg" ]]; then
        TARGETS+=("$svc")
      fi
    done
  done
  if [ ${#TARGETS[@]} -eq 0 ]; then
    echo "❌ No matching services found. Available:"
    for svc in "${SERVICE_ORDER[@]}"; do
      echo "   $(basename $svc)"
    done
    exit 1
  fi
else
  TARGETS=("${SERVICE_ORDER[@]}")
fi

# ── Start each service ──
echo ""
echo "═══════════════════════════════════════"
echo "  DealerPulse — Starting Services"
echo "═══════════════════════════════════════"
echo ""

for svc in "${TARGETS[@]}"; do
  compose_file="$SCRIPT_DIR/$svc/docker-compose.yml"
  
  if [ ! -f "$compose_file" ]; then
    echo "⏭️  $svc — no docker-compose.yml yet, skipping"
    continue
  fi
  
  echo "🚀 Starting $svc..."
  docker compose -f "$compose_file" --env-file "$SCRIPT_DIR/.env" up -d
  echo "   ✓ $svc started"
  echo ""
done

echo "═══════════════════════════════════════"
echo "  ✓ Done. Run ./docker-all-status.sh"
echo "═══════════════════════════════════════"
