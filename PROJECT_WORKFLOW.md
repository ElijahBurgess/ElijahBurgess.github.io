# Project Onboarding, Hosting & Migration Guide (`eliburgessconsulting.com`)

> **Purpose for Future AI Agents:**  
> This document defines the standard operating procedure (SOP) for hosting existing homelab projects and implementing new projects on **`https://eliburgessconsulting.com`**, backed by the **Proxmox Homelab API & Cloudflare Tunnel (`CT 104` @ `192.168.0.108`)**.

---

## 1. The 3 Hosting Patterns (Choosing the Right Pattern)

Every project hosted under `eliburgessconsulting.com` uses one of three architectural patterns depending on whether it needs static content, a REST/JSON backend, or persistent real-time WebSockets:

| Pattern | Best For | Frontend Location | Backend / Compute Location | Public URL Structure |
| :--- | :--- | :--- | :--- | :--- |
| **Pattern A: Static / Client-Side** | Mobile app showcases, privacy policies, client-side JS/WASM tools, case studies | Astro page (`src/pages/projects/<slug>.astro`) or `public/<slug>/` | None (100% Cloudflare Edge CDN) | `https://eliburgessconsulting.com/projects/<slug>` |
| **Pattern B: Hybrid Edge UI + Homelab REST API** | Data dashboards, SQLite/DuckDB readers, AI inference demos, lead forms | Astro page (`src/pages/projects/<slug>.astro`) fetching from `resolvedApi` | `backend/main.py` on **CT 104 (`192.168.0.108:8006`)** (`website-api.service`) | UI: `https://eliburgessconsulting.com/projects/<slug>`<br>API: `https://api.eliburgessconsulting.com/api/<slug>/...` |
| **Pattern C: Full Interactive App via Subdomain Tunnel** | Multiplayer WebSocket games, full-screen React/FastAPI apps running in their own Proxmox LXC/VM | Existing app UI inside its own Proxmox container (or embedded/linked from Astro) | Dedicated Proxmox LXC/VM (e.g., **CT 105 `192.168.0.109:8400`**) | `https://<app>.eliburgessconsulting.com` (routed via `cloudflared` on `CT 104`) |

---

## 2. Standard Workflow for Implementing Any New Project

When the user asks an agent to add or build a new project for the website, follow these exact 5 steps:

### Step 1: Classify & Scaffold the Project
1. Decide whether the project is **Pattern A** (Static), **Pattern B** (Hybrid UI + `website-api`), or **Pattern C** (Subdomain Tunnel to a Proxmox container).
2. Create a dedicated Astro showcase/interactive page at:
   ```text
   src/pages/projects/<slug>.astro
   ```
   *(If the project has downloadable static assets, images, or standalone HTML policies, place them in `public/<slug>/`).*

### Step 2: Add Backend Routes (Pattern B) or Subdomain Ingress (Pattern C)
* **For Pattern B (REST API on `CT 104`):**
  1. Add your FastAPI routes under `/api/<slug>/...` in [`backend/main.py`](file:///home/elib/Documents/Pi4/Website/backend/main.py).
  2. **Security Rule:** Public endpoints on `api.eliburgessconsulting.com` are reachable by anyone on the internet.
     * Open local SQLite/DuckDB databases in **read-only mode** (`sqlite3.connect("file:/path/to/db?mode=ro", uri=True)`) whenever exposing telemetry or datasets.
     * Never expose unauthenticated shell execution, file writes outside a dedicated table, or paid external API triggers (e.g., paid LLM calls or eBay scan triggers) without rate-limiting or auth.
* **For Pattern C (Subdomain Tunnel via `CT 104`):**
  1. Edit `/etc/cloudflared/config.yml` on `CT 104` (`ssh ct104`) and add the hostname **above** the catch-all `- service: http_status:404` line:
     ```yaml
     ingress:
       - hostname: api.eliburgessconsulting.com
         service: http://127.0.0.1:8006
       - hostname: <app>.eliburgessconsulting.com
         service: http://192.168.0.<container_ip>:<port>
       - service: http_status:404
     ```
  2. Register the DNS CNAME and restart `cloudflared` on `CT 104`:
     ```bash
     ssh ct104 "/usr/local/bin/cloudflared tunnel route dns -f proxmox-website-api <app>.eliburgessconsulting.com && systemctl restart cloudflared"
     ```

### Step 3: Register the Project Card on the Main Portfolio
Add the project metadata entry to:
1. `defaultProjects` in [`src/pages/index.astro`](file:///home/elib/Documents/Pi4/Website/src/pages/index.astro) (including a link to `/projects/<slug>` or `https://<app>.eliburgessconsulting.com`).
2. `list_projects()` (`/api/projects`) in [`backend/main.py`](file:///home/elib/Documents/Pi4/Website/backend/main.py).

### Step 4: Verify Build & Live LAN Preview
Run a local production build check before committing:
```bash
export PATH="$HOME/.local/bin:$HOME/.nvm/versions/node/v24.18.0/bin:$PATH"
npm run build
```

### Step 5: Commit & Run Unified Homelab + Cloud Sync
```bash
git add -A
git commit -m "Add <Project Name> showcase and API endpoints"
bash scripts/sync-homelab.sh
```
This single command:
1. Pushes to **Forgejo (`CT 107`)** (`ssh://git@git.internal:2222/elib/website.git`).
2. Pushes to **GitHub (`origin`)** (`git@github.com:ElijahBurgess/ElijahBurgess.github.io.git`), which triggers **Cloudflare Workers Builds** to deploy `https://eliburgessconsulting.com` globally.
3. Updates the 24/7 live preview workspace on **`VM 102` (`http://192.168.0.106:4321`)**.
4. Updates the cross-device SMB3 share on **`CT 106` (`/home/elib/Shared/Projects/Website`)**.
5. Deploys `backend/main.py` to **`CT 104` (`/opt/apps/website-api/main.py`)** and restarts `website-api.service` (`https://api.eliburgessconsulting.com`).

---

## 3. Migration Playbooks for Current Homelab Projects

### A. Toddler Touch Screen Lock (`com.burgessmeditation.touchguard`)
* **Current State:**
  * Google Play privacy policy is already live at [`public/toddler-touch-screen-lock-privacy/index.html`](file:///home/elib/Documents/Pi4/Website/public/toddler-touch-screen-lock-privacy/index.html) (`https://eliburgessconsulting.com/toddler-touch-screen-lock-privacy/`).
  * Listed on the main portfolio grid in [`src/pages/index.astro`](file:///home/elib/Documents/Pi4/Website/src/pages/index.astro).
* **Hosting Pattern:** **Pattern A (Static Product Showcase + Compliance Page)**
* **Migration Steps:**
  1. **Never move or rename** `public/toddler-touch-screen-lock-privacy/index.html` (required by Google Play Store compliance).
  2. Create `src/pages/projects/toddler-touch-screen-lock.astro` as a dedicated product landing page featuring:
     * Interactive diagram of the hardware unlock sequence (`Volume Down ×3` $\rightarrow$ `Volume Up ×3`) and USB charger failsafe.
     * Privacy & security architecture breakdown (`TYPE_ACCESSIBILITY_OVERLAY`, `canRetrieveWindowContent="false"`, zero `INTERNET` permission).
     * Screenshots, Google Play badge, and direct link to `/toddler-touch-screen-lock-privacy/`.

---

### B. Kingdomino & Partnership Pinochle AI (`BoredGamer Arena`)
* **Current State on Homelab:**
  * Running 24/7 on **Proxmox `CT 105` (`192.168.0.109:8400`)** at `/opt/boredgamer` via `boredgamer-arena.service` (`ssh ct105`).
  * Serves a unified FastAPI + WebSocket + React SPA mounting:
    * **Kingdomino (`/kingdomino/`)**: Rust `kingdomino_py` engine + 12 ONNX neural bots (`baron_*`).
    * **Partnership Pinochle (`/pinochle/`)**: Rust `pinochle_py` engine + 5 bots (`master_4p.onnx` & `Grandmaster` IS-MCTS).
    * **Health & Lobby Telemetry (`http://192.168.0.109:8400/api/health`)**: Returns `games_count`, `active_tables`, `playing_tables`, `active_players`, `kingdomino_bots`, and `pinochle_bots`.
* **Hosting Pattern:** **Pattern C (`arena.eliburgessconsulting.com` Subdomain Tunnel) + Pattern B (Live Telemetry Badge)**
* **Migration Steps:**
  1. **Expose the Live Game Lounge via `CT 104` Cloudflare Tunnel:**
     * Add `arena.eliburgessconsulting.com` $\rightarrow$ `http://192.168.0.109:8400` to `/etc/cloudflared/config.yml` on `CT 104`.
     * Run:
       ```bash
       ssh ct104 "/usr/local/bin/cloudflared tunnel route dns -f proxmox-website-api arena.eliburgessconsulting.com && systemctl restart cloudflared"
       ```
     * Cloudflare Tunnel natively proxies both HTTPS and WebSockets (`wss://`), so friends can play Kingdomino and Pinochle live in their browser at `https://arena.eliburgessconsulting.com` with zero port forwarding!
  2. **Add Live Telemetry Proxy in `backend/main.py` (`CT 104`):**
     * Add `GET /api/arena/status` in [`backend/main.py`](file:///home/elib/Documents/Pi4/Website/backend/main.py) that queries `http://192.168.0.109:8400/api/health` over the Proxmox LAN and returns live active table/bot counts for the portfolio card on `eliburgessconsulting.com`.
  3. **Create Case Study Page (`src/pages/projects/boredgamer-arena.astro`):**
     * Explain the Rust + PyO3 zero-copy state engine, self-play reinforcement learning pipeline, ONNX CPU inference on LXC, and IS-MCTS search, with **"Play Kingdomino Live"** and **"Play Pinochle Live"** buttons linking to `https://arena.eliburgessconsulting.com`.

---

### C. eBay Homelab Deal Hunter (`deal-hunter`)
* **Current State on Homelab:**
  * Installed on **Proxmox `CT 104` (`192.168.0.108`)** at `/opt/apps/deal-hunter` (`deal-hunter.service`, port `8004`).
  * Stores a **116 MB SQLite database** on the same container at `/opt/apps/deal-hunter-data/deal_hunter.db` containing scanned eBay listings, hardware spec extractions (CPU gen, RAM, storage), and valuation discounts.
* **Hosting Pattern:** **Pattern B (Read-Only SQLite API via `website-api` + Interactive Astro Showcase)**
* **Why Pattern B instead of exposing port `8004` directly:**
  * Deal Hunter's internal server (`:8004`) has write/admin endpoints (`/api/scan`, rule edits) that consume your eBay API quota and send Pushover alerts. Exposing read-only endpoints through `backend/main.py` (`:8006`) keeps your scanner and API keys 100% protected.
* **Migration Steps:**
  1. **Add Read-Only SQLite Endpoints in [`backend/main.py`](file:///home/elib/Documents/Pi4/Website/backend/main.py) on `CT 104`:**
     * Query `file:/opt/apps/deal-hunter-data/deal_hunter.db?mode=ro` directly from `website-api` (since both live on `CT 104`!) and expose:
       * `GET /api/deal-hunter/summary` — total tracked listings, active deals, top discount %, and category breakdown.
       * `GET /api/deal-hunter/deals?category=...&limit=24` — curated top homelab hardware deals with eBay links, parsed specs, and target valuation scores.
  2. **Build Interactive Deal Explorer Page (`src/pages/projects/deal-hunter.astro`):**
     * Render live summary metrics and a filterable table/grid of real eBay hardware deals fetched from `https://api.eliburgessconsulting.com/api/deal-hunter/deals`.
  3. **Optional Background Scanner Activation on `CT 104`:**
     * Whenever you want live eBay scanning active, run `ssh ct104 "systemctl enable --now deal-hunter.service"`. Even when the background scanner service is stopped, `deal_hunter.db` remains readable by `website-api.service` so the public portfolio demo works 24/7.
