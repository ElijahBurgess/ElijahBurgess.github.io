#!/usr/bin/env bash
set -euo pipefail

export PATH="$HOME/.local/bin:$HOME/.nvm/versions/node/v24.18.0/bin:$PATH"

exec 9>/tmp/website-homelab-sync.lock
flock -w 30 9

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_DIR"

VM102_HOST="agent@192.168.0.106"
CT104_HOST="root@192.168.0.108"

echo "==> [0/4] Running Pre-Push Build Gate (npm run build)..."
npm run build

if git remote get-url origin >/dev/null 2>&1; then
  echo "==> [1/4] Pushing to GitHub origin (triggers Cloudflare Workers deploy)..."
  git push origin main || echo "Warning: origin push skipped or requires auth."
fi

echo "==> [2/4] Syncing Forgejo (CT 107) & live workspace on VM 102 (/home/agent/workspace/Website)..."
if GIT_TERMINAL_PROMPT=0 GIT_SSH_COMMAND="ssh -o BatchMode=yes -o ConnectTimeout=3" git push forgejo main 2>/dev/null; then
  ssh -o BatchMode=yes "$VM102_HOST" "cd /home/agent/workspace/Website && git fetch forgejo && git reset --hard forgejo/main && npm install --no-audit --no-fund && sudo -n systemctl restart website-dev.service"
else
  # Relay bundle to VM 102 and push canonical main to Forgejo from VM 102
  BUNDLE_TMP="/tmp/website-sync-$$.bundle"
  git bundle create "$BUNDLE_TMP" HEAD main
  scp -q "$BUNDLE_TMP" "${VM102_HOST}:/tmp/website-sync.bundle"
  rm -f "$BUNDLE_TMP"
  ssh -o BatchMode=yes "$VM102_HOST" "cd /home/agent/workspace/Website && git fetch /tmp/website-sync.bundle main:refs/remotes/sync/main && git checkout -B main refs/remotes/sync/main && rm -f /tmp/website-sync.bundle && git push forgejo main && npm install --no-audit --no-fund && sudo -n systemctl restart website-dev.service"
fi

SHARED_PROJECTS_DIR="${HOME}/Shared/Projects"
if [ ! -d "$SHARED_PROJECTS_DIR" ] && [ -d "/home/elib/Shared/Projects" ]; then
  SHARED_PROJECTS_DIR="/home/elib/Shared/Projects"
fi

echo "==> [3/4] Updating SMB Shared Drive copy (${SHARED_PROJECTS_DIR}/Website)..."
if [ -d "$SHARED_PROJECTS_DIR" ]; then
  mkdir -p "${SHARED_PROJECTS_DIR}/Website"
  rsync -rt --inplace --modify-window=2 --delete --exclude 'node_modules' --exclude '.git' --exclude 'dist' "$REPO_DIR/" "${SHARED_PROJECTS_DIR}/Website/" || echo "Warning: SMB sync skipped or had non-fatal permission differences."
fi

echo "==> [4/4] Syncing FastAPI backend to CT 104 (/opt/apps/website-api)..."
scp -q "$REPO_DIR/backend/main.py" "${CT104_HOST}:/opt/apps/website-api/main.py"
ssh -o BatchMode=yes "$CT104_HOST" "systemctl restart website-api.service"

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

echo "✅ Homelab + Cloud sync complete! Live preview at http://192.168.0.106:4321 and API at http://192.168.0.108:8006/api/health"
