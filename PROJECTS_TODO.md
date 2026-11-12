# Portfolio Projects Implementation & Migration Backlog (`PROJECTS_TODO.md`)

> **Instructions for Executing Agents:**  
> Read **[AGENTS.md](file:///home/elib/Documents/Pi4/Website/AGENTS.md)** and **[PROJECT_WORKFLOW.md](file:///home/elib/Documents/Pi4/Website/PROJECT_WORKFLOW.md)** first.  
> Check off (`[x]`) each task below as you complete it, verify with `npm run build`, commit your changes, and run `bash scripts/sync-homelab.sh` so Forgejo (`CT 107`), GitHub (`origin`), the live preview on `VM 102` (`http://192.168.0.106:4321`), and `CT 104` (`https://api.eliburgessconsulting.com`) all stay in sync.

---

## Priority 1 — Core Portfolio Migrations (Immediate Queue)

### 1. Toddler Touch Screen Lock (`Pattern A — Static Edge Showcase`)
* **Current Status:**
  * [x] Google Play compliance privacy policy live at [`public/toddler-touch-screen-lock-privacy/index.html`](file:///home/elib/Documents/Pi4/Website/public/toddler-touch-screen-lock-privacy/index.html) (`https://eliburgessconsulting.com/toddler-touch-screen-lock-privacy/`).
  * [x] Project card listed on homepage ([`src/pages/index.astro`](file:///home/elib/Documents/Pi4/Website/src/pages/index.astro)).
  * [x] Dedicated interactive product showcase page (`/projects/toddler-touch-screen-lock`).
* **Steps to Perform:**
  1. [x] **Keep Privacy URL Intact:** Do **not** move or rename `public/toddler-touch-screen-lock-privacy/index.html`.
  2. [x] **Create Showcase Page:** Create `src/pages/projects/toddler-touch-screen-lock.astro` featuring:
     * Hero header with app badge (`com.burgessmeditation.touchguard` • Burgess Meditation LLC • `100% Offline • Zero Internet Permission`).
     * Interactive visual explainer demonstrating the **Hardware Volume Unlock Combo (`Volume Down ×3` $\rightarrow$ `Volume Up ×3`)** and the **USB Charging Cable Failsafe Unlock**.
     * Technical & Privacy Architecture card explaining how `TYPE_ACCESSIBILITY_OVERLAY` blocks stray toddler touches while `canRetrieveWindowContent="false"` and `canPerformGestures="false"` guarantee zero screen reading.
     * Direct links to the Google Play Store listing and `/toddler-touch-screen-lock-privacy/`.
  3. [x] **Link from Homepage:** Update the `toddler-touch-screen-lock` card in [`src/pages/index.astro`](file:///home/elib/Documents/Pi4/Website/src/pages/index.astro) and [`backend/main.py`](file:///home/elib/Documents/Pi4/Website/backend/main.py) with a button linking to `/projects/toddler-touch-screen-lock`.
  4. [x] **Deploy:** Run `npm run build`, `git commit`, and `bash scripts/sync-homelab.sh`.

---

### 2. Kingdomino & Partnership Pinochle AI — BoredGamer Arena (`Pattern C Subdomain Tunnel + Pattern B Telemetry`)
* **Current Status:**
  * [x] Running 24/7 on **Proxmox `CT 105` (`192.168.0.109:8400`)** at `/opt/boredgamer` (`boredgamer-arena.service`, reachable via `ssh ct105`).
  * [x] Hosts 12 Kingdomino ONNX bots (`kingdomino_py`) at `/kingdomino/` and 5 Partnership Pinochle IS-MCTS/ONNX bots (`pinochle_py`) at `/pinochle/`.
  * [x] Public Cloudflare Tunnel route (`https://arena.eliburgessconsulting.com`).
  * [x] Live lobby status proxy (`/api/arena/status`) & dedicated project page (`/projects/boredgamer-arena`).
* **Steps to Perform:**
  1. [x] **Expose `arena.eliburgessconsulting.com` via `CT 104` Tunnel:**
     * Edit `/etc/cloudflared/config.yml` on `CT 104` (`ssh ct104`) to add `arena.eliburgessconsulting.com` above the catch-all `http_status:404` rule:
       ```yaml
       tunnel: 18985919-f22d-406c-8f45-7fe31b8cfc8a
       credentials-file: /root/.cloudflared/18985919-f22d-406c-8f45-7fe31b8cfc8a.json

       ingress:
         - hostname: api.eliburgessconsulting.com
           service: http://127.0.0.1:8006
         - hostname: arena.eliburgessconsulting.com
           service: http://192.168.0.109:8400
         - service: http_status:404
       ```
     * Register the DNS route and restart `cloudflared` on `CT 104`:
       ```bash
       ssh ct104 "/usr/local/bin/cloudflared tunnel route dns -f proxmox-website-api arena.eliburgessconsulting.com && systemctl restart cloudflared"
       ```
     * Verify with `curl -sS https://arena.eliburgessconsulting.com/api/health`.
  2. [x] **Add Live Telemetry Route in [`backend/main.py`](file:///home/elib/Documents/Pi4/Website/backend/main.py) (`CT 104`):**
     * Add `GET /api/arena/status` using `httpx.AsyncClient(timeout=3.0)` to fetch `http://192.168.0.109:8400/api/health` and return `games_count`, `active_tables`, `playing_tables`, `active_players`, `kingdomino_bots`, and `pinochle_bots`.
  3. [x] **Create Case Study & Launch Page (`src/pages/projects/boredgamer-arena.astro`):**
     * Detail the Rust + PyO3 zero-copy game engines, self-play reinforcement learning pipeline, ONNX Runtime CPU inference, and IS-MCTS search.
     * Include live lobby counters (polling `/api/arena/status`) and prominent **"Play Kingdomino vs. AI"** (`https://arena.eliburgessconsulting.com/kingdomino/`) and **"Play Pinochle vs. AI"** (`https://arena.eliburgessconsulting.com/pinochle/`) launch buttons.
  4. [x] **Deploy:** Run `npm run build`, `git commit`, and `bash scripts/sync-homelab.sh`.

---

### 3. eBay Homelab Deal Hunter (`Pattern B — Edge UI + Read-Only SQLite API`)
* **Current Status:**
  * [x] Installed on **Proxmox `CT 104` (`192.168.0.108:8004`)** at `/opt/apps/deal-hunter` with a **116 MB SQLite database** at `/opt/apps/deal-hunter-data/deal_hunter.db` (on the same container as `website-api.service`).
  * [x] Read-only SQLite endpoints in [`backend/main.py`](file:///home/elib/Documents/Pi4/Website/backend/main.py) (`/api/deal-hunter/summary` & `/api/deal-hunter/deals`).
  * [x] Interactive Deal Explorer page (`/projects/deal-hunter`).
* **Database Schema Reference (`/opt/apps/deal-hunter-data/deal_hunter.db` on `CT 104`):**
  * Table `items`: `item_id`, `rule_name`, `title`, `price`, `shipping_cost`, `total_price`, `currency`, `buying_format`, `condition_name`, `item_url`, `image_url`, `seller_username`, `seller_feedback_score`, `seller_positive_percent`, `first_seen_at`, `last_seen_at`, `status`, `alerted`, `end_date`, `config_tier`, `detected_cpu`, `detected_ram_gb`, `detected_storage`, `effective_ceiling`, `savings_dollars`, `savings_pct`, `missing_scans`
  * Table `market_benchmarks`: `id`, `rule_name`, `config_tier`, `sample_count`, `median_price`, `p20_price`, `min_price`, `max_price`, `avg_price`, `last_updated_at`
* **Steps to Perform:**
  1. [x] **Add Read-Only SQLite Routes in [`backend/main.py`](file:///home/elib/Documents/Pi4/Website/backend/main.py):**
     * **Security Guardrail:** Do **not** expose port `8004` publicly (it contains unauthenticated `/api/scan` and rule-mutation endpoints). Instead, open `file:/opt/apps/deal-hunter-data/deal_hunter.db?mode=ro` (`uri=True`) inside [`backend/main.py`](file:///home/elib/Documents/Pi4/Website/backend/main.py):
       * `GET /api/deal-hunter/summary`: Return total tracked items, active deals count (`status='ACTIVE'` and `savings_pct > 0`), top discount percentage (`MAX(savings_pct)`), and market benchmarks from `market_benchmarks`.
       * `GET /api/deal-hunter/deals`: Accept optional query params (`rule_name`, `min_ram_gb`, `max_price`, `limit=30`), returning active deals ordered by `savings_pct DESC` with `title`, `total_price`, `effective_ceiling`, `savings_dollars`, `savings_pct`, `detected_cpu`, `detected_ram_gb`, `detected_storage`, `condition_name`, `item_url`, and `image_url`.
  2. [x] **Create Interactive Deal Explorer (`src/pages/projects/deal-hunter.astro`):**
     * Build a client-side filterable dashboard fetching from `${resolvedApi}/api/deal-hunter/deals` and `${resolvedApi}/api/deal-hunter/summary`.
     * Display summary KPI cards (Tracked Listings, Active Below-Market Deals, Highest Discount %, Market Benchmarks) and a filterable grid of hardware deals with spec badges (CPU, RAM, Storage), savings % pills, and external eBay listing links.
  3. [x] **Optional Background Scanner Service:**
     * To resume periodic eBay scanning on `CT 104`, run `ssh ct104 "systemctl enable --now deal-hunter.service"`.
  4. [x] **Deploy:** Run `npm run build`, `git commit`, and `bash scripts/sync-homelab.sh`.

---

## Priority 2 — Secondary Homelab Showcase Integrations

### 4. Local-First AI Research & Bioinformatics Hub (`Pattern B — Edge UI + Proxied Search API`)
* **Homelab Node:** **Proxmox `CT 107` (`192.168.0.111:8080`)** (`ssh ct107`).
* **Steps to Perform:**
  1. [x] Add `GET /api/research/status` in [`backend/main.py`](file:///home/elib/Documents/Pi4/Website/backend/main.py) proxying `http://192.168.0.111:8080/api/health` (returning indexed `arxiv_papers`, `viral_records`, `zoekt_shards`, and `zim_archives`, while stripping internal `jobs.zoekt_sync.errors`).
  2. [x] Create `src/pages/projects/research-hub.astro` showcasing the DuckDB BM25 + Zoekt + BLAST+ + FastMCP architecture with live index counters.

### 5. Automated Coaching Sync & Square Billing Pipeline (`Pattern A — Case Study & Architecture Page`)
* **Homelab Node:** **Raspberry Pi 4 (`192.168.0.148:8000`)** (`/home/elib/Payment_tracker`, mirrored locally at [`/home/elib/Documents/Pi4/Payment_tracker`](file:///home/elib/Documents/Pi4/Payment_tracker)).
* **Steps to Perform:**
  1. [x] **Security Guardrail:** Never expose client names, emails, or invoice amounts from `payment_tracker.db` publicly.
  2. [x] Create a static architecture & workflow case study at `src/pages/projects/coaching-payment-tracker.astro` illustrating the regex session parser, manual staging review gate, and automated Square Orders/Invoices state machine—doubling as social proof for the **AI Workflow & Automation Consulting** section.

### 6. Valheim Dedicated Server Live Status Widget (`Pattern B — Sanitized Status Proxy`)
* **Homelab Node:** **Proxmox `CT 101` (`192.168.0.105:8088`)**.
* **Steps to Perform:**
  1. [x] Add `GET /api/valheim/status` in [`backend/main.py`](file:///home/elib/Documents/Pi4/Website/backend/main.py) fetching `http://192.168.0.105:8088/api/status`.
  2. [x] **Security Guardrail:** Explicitly whitelist only `{"status", "player_count", "world", "server_name", "uptime", "active_mods"}`—**strip** `"password"`, `"public_ip"`, and `"lan_ip"` before returning the JSON response.
