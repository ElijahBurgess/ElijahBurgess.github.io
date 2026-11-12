# Website Project — Multi-Agent & Homelab Architecture Guide

> **Multi-Agent Coordination Note:**  
> Multiple Antigravity agents may work on this project concurrently (e.g., one managing homelab infrastructure/workspace sync and another managing Cloudflare Pages, Cloudflare Tunnel, and UI design). Always check `git status` and recent file modifications before overwriting files, and run `npm run sync:homelab` (or `bash scripts/sync-homelab.sh`) after committing changes so all homelab nodes stay in sync.

---

## 1. Hybrid Architecture Overview (Option 1)

| Component | Host / Location | Address / URL | Details |
| :--- | :--- | :--- | :--- |
| **Local Laptop Workspace** | `elib-G5-5590` (`192.168.0.149`) | `/home/elib/Documents/Pi4/Website` | Primary local checkout. Node v24 (`~/.nvm/versions/node/v24.18.0/bin`), Git (`~/.local/bin/git`), `cloudflared` (`~/.local/bin/cloudflared`). |
| **Canonical Homelab Git Repo** | **CT 107 (`research-hub` / `git.internal`)** | Web: `http://192.168.0.111:3000/elib/website`<br>SSH: `ssh://git@git.internal:2222/elib/website.git` | Self-hosted **Forgejo 10** Git server. Configured as the `forgejo` Git remote across all workspaces. Admin login: `elib` / `great123`. |
| **24/7 Cloud IDE & Live Dev Preview** | **VM 102 (`antigravity-vm`)** | Preview: **`http://192.168.0.106:4321`**<br>Path: `/home/agent/workspace/Website`<br>Webtop GUI: `https://192.168.0.106:3001`<br>Mobile Gateway: `http://192.168.0.148:5000/v2` | Runs `website-dev.service` (systemd user/system unit serving `npm run dev -- --host 0.0.0.0 --port 4321`). Accessible from all LAN & Tailscale devices (`102.fw` allows `:4321`). |
| **Cross-Device SMB3 Shared Copy** | **CT 106 (`fileshare`)** | SMB: `//192.168.0.110/Shared/Projects/Website`<br>Laptop: `/home/elib/Shared/Projects/Website`<br>Fedora PC: `~/Antigravity/Shared/Projects/Website`<br>VM 102: `/home/agent/workspace/Shared/Projects/Website` | Automatically mounted across your Ubuntu laptop, Fedora desktop (`192.168.0.117`), and `VM 102`. |
| **Proxmox Homelab API Backend** | **CT 104 (`apps-hub`)** | Public: **`https://api.eliburgessconsulting.com`**<br>LAN: **`http://192.168.0.108:8006`**<br>Path: `/opt/apps/website-api` | Managed by `website-api.service` (FastAPI + SQLite + `uv`) and `cloudflared.service` (`proxmox-website-api` tunnel -> `http://127.0.0.1:8006`). |
| **Public Cloud Edge (Frontend)** | **Cloudflare Workers + GitHub** | **`https://eliburgessconsulting.com`**<br>**`https://www.eliburgessconsulting.com`**<br>GitHub: `git@github.com:ElijahBurgess/ElijahBurgess.github.io.git` | Auto-builds Astro static/edge site via [wrangler.jsonc](file:///home/elib/Documents/Pi4/Website/wrangler.jsonc) on `git push` to GitHub (`origin` remote). |

---

## 2. Pre-Configured SSH Shortcuts (`~/.ssh/config`)

Passwordless `ed25519` SSH is configured from this laptop (`192.168.0.149`) to all homelab nodes:
* `ssh vm102` (or `ssh antigravity-vm`) $\rightarrow$ `agent@192.168.0.106`
* `ssh ct104` (or `ssh apps-hub`) $\rightarrow$ `root@192.168.0.108`
* `ssh ct105` (or `ssh boredgamer-arena`) $\rightarrow$ `root@192.168.0.109`
* `ssh ct107` (or `ssh research-hub`) $\rightarrow$ `root@192.168.0.111`
* `ssh pve` $\rightarrow$ `root@192.168.0.2`
* `ssh pi` $\rightarrow$ `elib@192.168.0.88`
* `ssh git.internal` $\rightarrow$ Forgejo SSH (`git@192.168.0.111:2222`)

---

## 3. Daily & Multi-Device Workflow

1. **Sync & Deploy Across All Home Server Nodes:**
   ```bash
   bash scripts/sync-homelab.sh
   ```
   *(Or simply `git commit` & `git push forgejo main` — a Forgejo server hook & local post-commit hook keep `VM 102` and `CT 104` updated).*
2. **Add GitHub Remote (for Cloudflare Pages Auto-Deploy):**
   ```bash
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   git push -u origin main
   ```
3. **Wire Cloudflare Tunnel on `CT 104` (`192.168.0.108`):**
   `cloudflared` is already installed on `ct104` (`/usr/local/bin/cloudflared`). Point your tunnel ingress for `api.<yourdomain>` to `http://127.0.0.1:8006`.
4. **Adding & Migrating Projects (SOP & Backlog for Future Agents):**
   * Read **[PROJECT_WORKFLOW.md](file:///home/elib/Documents/Pi4/Website/PROJECT_WORKFLOW.md)** for the 3 hosting patterns and standard deployment steps.
   * Read **[PROJECTS_TODO.md](file:///home/elib/Documents/Pi4/Website/PROJECTS_TODO.md)** for the step-by-step implementation backlog and database/API schemas for `Toddler Touch Screen Lock`, `BoredGamer Arena` (Kingdomino & Pinochle AI), `eBay Deal Hunter`, and secondary homelab projects.
