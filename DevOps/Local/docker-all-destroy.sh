#!/bin/bash
# ═══════════════════════════════════════════════
# DealerPulse — Destroy All Services
# ⚠️  DESTRUCTIVE: Stops containers AND deletes all data volumes.
# Use this for a clean slate. There is no undo.
# ═══════════════════════════════════════════════

set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/.env"

echo ""
echo "⚠️  WARNING: This will destroy ALL containers AND data volumes."
echo "   All indexed data, database records, and configs will be lost."
echo ""
read -p "   Type 'yes' to confirm: " confirm

if [ "$confirm" != "yes" ]; then
  echo "   Cancelled."
  exit 0
fi

echo ""
echo "═══════════════════════════════════════"
echo "  DealerPulse — Destroying Everything"
echo "═══════════════════════════════════════"
echo ""

# Stop and remove containers + volumes for each service
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

for svc in "${SERVICE_ORDER[@]}"; do
  compose_file="$SCRIPT_DIR/$svc/docker-compose.yml"
  
  if [ ! -f "$compose_file" ]; then
    continue
  fi
  
  echo "💥 Destroying $svc (containers + volumes)..."
  docker compose -f "$compose_file" --env-file "$SCRIPT_DIR/.env" down -v --remove-orphans
  echo "   ✓ $svc destroyed"
done

# Remove shared network
if docker network inspect "$NETWORK_NAME" >/dev/null 2>&1; then
  echo ""
  echo "🔗 Removing network: $NETWORK_NAME"
  docker network rm "$NETWORK_NAME"
fi

echo ""
echo "═══════════════════════════════════════"
echo "  ✓ Clean slate. Run ./docker-all-up.sh"
echo "    to rebuild from scratch."
echo "═══════════════════════════════════════"
