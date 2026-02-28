#!/bin/bash
# ═══════════════════════════════════════════════
# DealerPulse — Start UI + Backend together
#
# Starts:
#   1. Python FastAPI backend on :8000
#   2. Angular admin portal on :4200 (with proxy to backend)
#   3. Angular customer portal on :4201 (future)
#
# Usage:
#   ./start-all.sh           # Start backend + admin UI
#   ./start-all.sh --backend # Backend only
#   ./start-all.sh --ui      # UI only (assumes backend running)
# ═══════════════════════════════════════════════

set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

VENV_PREFIX="$HOME/runtime_data/python_venvs/hackathons/elastic_search_agents/dealerpulse-elastic-agents"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

stop_all() {
  echo -e "\n${GREEN}Shutting down...${NC}"
  kill $(jobs -p) 2>/dev/null
  exit 0
}
trap stop_all SIGINT SIGTERM

start_backend() {
  echo -e "${BLUE}🐍 Starting Python backend on :8000${NC}"
  conda run --prefix "$VENV_PREFIX" \
    uvicorn dealerpulse.api:app --host 0.0.0.0 --port 8000 --reload \
    --app-dir "$SCRIPT_DIR" &
  sleep 2
  echo -e "${GREEN}   ✓ Backend running at http://localhost:8000${NC}"
}

start_admin_ui() {
  echo -e "${BLUE}🅰️  Starting Admin UI on :4200${NC}"
  cd "$SCRIPT_DIR/portals/dealersense-admin"
  if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules/.package-lock.json" ]; then
    echo "   📦 Installing/updating admin dependencies..."
    npm install --silent
  fi
  npm start &
  sleep 3
  echo -e "${GREEN}   ✓ Admin UI at http://localhost:4200${NC}"
}

start_customer_ui() {
  echo -e "${BLUE}👤 Starting Customer UI on :4201${NC}"
  cd "$SCRIPT_DIR/portals/dealersense-app"
  if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules/.package-lock.json" ]; then
    echo "   📦 Installing/updating customer dependencies..."
    npm install --silent
  fi
  npm start &
  sleep 3
  echo -e "${GREEN}   ✓ Customer UI at http://localhost:4201${NC}"
}

# Parse args
case "${1:-}" in
  --backend)
    start_backend
    ;;
  --ui)
    start_admin_ui
    ;;
  *)
    start_backend
    start_admin_ui
    echo ""
    echo "═══════════════════════════════════════"
    echo "  DealerSense is running!"
    echo ""
    echo "  Admin UI:  http://localhost:4200"
    echo "  API:       http://localhost:8000"
    echo "  API Docs:  http://localhost:8000/docs"
    echo ""
    echo "  Press Ctrl+C to stop all"
    echo "═══════════════════════════════════════"
    start_customer_ui
    echo "  Customer: http://localhost:4201"
    ;;
esac

# Keep script alive until Ctrl+C
wait