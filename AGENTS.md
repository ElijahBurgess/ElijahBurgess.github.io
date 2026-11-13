# Website Project (`eliburgessconsulting.com`) — Architecture & Orchestrator Guide

> **Multi-Agent & Homelab Sync Rule:**  
> Always inspect `git status` before overwriting files, keep prose centralized in [`src/data/site-content.ts`](file:///home/elib_fedora/Antigravity/Dashmanager/Website/src/data/site-content.ts), and run `bash scripts/sync-homelab.sh` after committing so Forgejo (`CT 107`), GitHub/Cloudflare (`origin`), `VM 102` live preview, `CT 106` SMB share, and `CT 104` FastAPI stay synchronized.

---

## 1. Hybrid Edge + Homelab Topology

| Component | Host / Location | Address / URL | Details |
| :--- | :--- | :--- | :--- |
| **Fedora Workstation** | `pc.internal` (`192.168.0.117`) | `/home/elib_fedora/Antigravity/Dashmanager/Website` | Node v24, direct SSH to `vm102`, `ct104`, and GitHub (`origin`). |
| **Laptop Workspace** | `elib-G5-5590` (`192.168.0.149`) | `/home/elib/Documents/Pi4/Website` | Secondary local checkout (`~/.nvm/versions/node/v24.18.0/bin`). |
| **Canonical Homelab Git** | **CT 107 (`research-hub` / `git.internal`)** | Web: `http://192.168.0.111:3000/elib/website`<br>SSH: `ssh://git@git.internal:2222/elib/website.git` | Forgejo 10 canonical repository (`forgejo` remote). |
| **24/7 Live Dev Preview** | **VM 102 (`antigravity-vm`)** | Preview: **`http://192.168.0.106:4321`**<br>Path: `/home/agent/workspace/Website` | Runs `website-dev.service` (`npm run dev -- --host 0.0.0.0 --port 4321`). |
| **Cross-Device SMB3 Share** | **CT 106 (`fileshare`)** | `~/Shared/Projects/Website` | Synced via `scripts/sync-homelab.sh` (`rsync` excluding `.git`, `node_modules`, `dist`). |
| **Homelab FastAPI Backend** | **CT 104 (`apps-hub`)** | Public: **`https://api.eliburgessconsulting.com`**<br>LAN: **`http://192.168.0.108:8006`**<br>Path: `/opt/apps/website-api` | `website-api.service` + `cloudflared.service`. SQLite WAL (`inquiries.db`), honeypot, rate limiting, Pushover + optional `ntfy`/`Discord` alerts, and sanitized project telemetry. |
| **Public Cloud Edge** | **Cloudflare Workers Static Assets** | **`https://eliburgessconsulting.com`**<br>**`https://www.eliburgessconsulting.com`** | Auto-deploys from GitHub `ElijahBurgess/ElijahBurgess.github.io` via [`wrangler.jsonc`](file:///home/elib_fedora/Antigravity/Dashmanager/Website/wrangler.jsonc). |

---

## 2. Sleek Technical Studio UI & Anti-Bloat Rules

1. **Single Source of Homepage Copy (`<= 450` words):**
   - All homepage headlines, project summaries, service descriptions, and bio copy live in [`src/data/site-content.ts`](file:///home/elib_fedora/Antigravity/Dashmanager/Website/src/data/site-content.ts).
   - `.astro` homepage components (`Hero`, `ProjectsGrid`, `ServicesLedger`, `BioSection`, `IntakeSection`) MUST NOT contain hardcoded marketing prose.
2. **Contrasting Structural Treatments (Never "All Cards"):**
   - **Design Tokens:** Defined in [`src/styles/tokens.css`](file:///home/elib_fedora/Antigravity/Dashmanager/Website/src/styles/tokens.css) (`--bg-canvas: #090b0f`, `--bg-elevated: #111620`, `--border-hairline`).
   - **Elevated Studio Cards (`--bg-elevated`)** are reserved **exclusively** for `#projects` (`ProjectsGrid.astro`) and the `#contact` form panel (`IntakeSection.astro`).
   - **`#services` (`ServicesLedger.astro`)** uses a transparent architectural `1px` hairline 3-column grid (zero rounded boxes).
   - **`#bio` (`BioSection.astro`)** uses an unboxed editorial 2-column split with `Eliheadshot.jpg` and hairline `<dl>` facts.
   - **Project Subpages (`src/pages/projects/*.astro`)** inherit [`src/layouts/ProjectLayout.astro`](file:///home/elib_fedora/Antigravity/Dashmanager/Website/src/layouts/ProjectLayout.astro) (`<= 250` words of architectural prose + interactive explorer/launchers).
3. **Untouchable Production Routes:**
   - `/toddler-touch-screen-lock-privacy/` (`public/toddler-touch-screen-lock-privacy/index.html`) — required for Google Play Store compliance (`com.burgessmeditation.touchguard`). Never rename or remove.
   - `https://arena.eliburgessconsulting.com` (`CT 105`) & `/projects/deal-hunter` interactive explorer.

---

## 3. Thinking-Agent Orchestrator Pipeline

When extending or redesigning sections:
1. **Thinking Orchestrator (Parent Frontier Model)** updates `src/data/site-content.ts` and `src/styles/tokens.css` first.
2. **Disjoint Single-Tier Subagents (`<= 4` parallel, `EnableSubagentTools: false`)** implement isolated components (`[tier:heavy]` for complex multi-file UI/JS; `flash` for webhooks, copy checks, and QA).
3. **Verification Gate:** Run `npm run build`, verify word/card budgets and compliance routes on `dist/`, inspect desktop + mobile Playwright screenshots visually, then deploy via `bash scripts/sync-homelab.sh`.
