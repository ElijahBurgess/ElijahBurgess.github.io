#!/usr/bin/env bash
set -euo pipefail

export PATH="$HOME/.local/bin:$HOME/.nvm/versions/node/v24.18.0/bin:$PATH"

exec 9>/tmp/website-homelab-sync.lock
flock -w 30 9

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_DIR"

echo "==> [0/4] Running Pre-Push Build Gate (npm run build)..."
npm run build

echo "==> [1/4] Pushing to Forgejo Git Server on CT 107 (ssh://git@git.internal:2222/elib/website.git)..."
git push forgejo main

if git remote get-url origin >/dev/null 2>&1; then
  echo "==> [1b/4] Pushing to origin remote..."
  git push origin main || echo "Warning: origin push skipped or requires auth."
fi

echo "==> [2/4] Updating live workspace on VM 102 (/home/agent/workspace/Website)..."
ssh -o BatchMode=yes vm102 "cd /home/agent/workspace/Website && git fetch forgejo && git reset --hard forgejo/main && npm install --no-audit --no-fund"

echo "==> [3/4] Updating SMB Shared Drive copy (/home/elib/Shared/Projects/Website)..."
if [ -d "/home/elib/Shared/Projects" ]; then
  mkdir -p /home/elib/Shared/Projects/Website
  rsync -a --delete --exclude 'node_modules' --exclude '.git' --exclude 'dist' "$REPO_DIR/" /home/elib/Shared/Projects/Website/
fi

echo "==> [4/4] Syncing FastAPI backend to CT 104 (/opt/apps/website-api)..."
scp -q "$REPO_DIR/backend/main.py" ct104:/opt/apps/website-api/main.py
ssh -o BatchMode=yes ct104 "systemctl restart website-api.service"

echo "==> [4b/4] Running Post-Deploy API Health Gate on CT 104..."
HEALTH_URL="http://192.168.0.108:8006/api/health"
MAX_ATTEMPTS=6
ATTEMPT=1
HEALTHY=0

while [ "$ATTEMPT" -le "$MAX_ATTEMPTS" ]; do
  if curl -fsS --max-time 3 "$HEALTH_URL" >/dev/null 2>&1; then
    HEALTHY=1
    echo "    Backend is healthy! ($HEALTH_URL returned HTTP 200)"
    break
  fi
  echo "    Waiting for website-api service (attempt $ATTEMPT/$MAX_ATTEMPTS)..."
  sleep 1
  ATTEMPT=$((ATTEMPT + 1))
done

if [ "$HEALTHY" -ne 1 ]; then
  echo "❌ Error: FastAPI backend on CT 104 failed health check after $MAX_ATTEMPTS attempts." >&2
  exit 1
fi

echo "✅ Homelab sync complete! Live preview running at http://192.168.0.106:4321 and API at http://192.168.0.108:8006/api/health"
