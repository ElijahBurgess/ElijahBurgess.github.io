#!/usr/bin/env bash
set -euo pipefail

export PATH="$HOME/.local/bin:$HOME/.nvm/versions/node/$(ls $HOME/.nvm/versions/node 2>/dev/null | tail -n 1)/bin:/usr/local/bin:/usr/bin:/bin"

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_DIR"

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

echo "✅ Homelab sync complete! Live preview running at http://192.168.0.106:4321 and API at http://192.168.0.108:8006/api/health"
