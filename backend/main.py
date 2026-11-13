"""
Proxmox Homelab API Backend for Personal AI Portfolio & Coaching Website
Deployed on CT 104 (192.168.0.108:8006) at /opt/apps/website-api/main.py
"""
import os
import time
import sqlite3
from pathlib import Path
from typing import Optional, List, Dict, Any
from collections import defaultdict

import httpx
from fastapi import FastAPI, HTTPException, Request, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator

app = FastAPI(
    title="Elijah Burgess — Portfolio & Coaching Homelab API",
    version="1.1.0",
)

# Hardened CORS policy: specific public origins + regex for local dev & tailscale
ALLOWED_ORIGINS = [
    "https://eliburgessconsulting.com",
    "https://www.eliburgessconsulting.com",
    "https://arena.eliburgessconsulting.com",
    "http://localhost:4321",
    "http://127.0.0.1:4321",
    "http://192.168.0.106:4321",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|100\.\d+\.\d+\.\d+)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = Path(os.environ.get("WEBSITE_DB_PATH", "/opt/apps/website-api/inquiries.db"))
DEAL_HUNTER_DB = Path(os.environ.get("DEAL_HUNTER_DB_PATH", "/opt/apps/deal-hunter-data/deal_hunter.db"))

# Lightweight in-memory rate limiting: max 5 requests per 600s window per client IP
_inquiry_rate_limits: Dict[str, List[float]] = defaultdict(list)
RATE_LIMIT_WINDOW = 600.0
RATE_LIMIT_MAX_REQUESTS = 5


def _check_rate_limit(client_ip: str) -> bool:
    now = time.time()
    # Opportunistically drop IPs whose whole window has expired so the dict can't grow unbounded
    if len(_inquiry_rate_limits) > 1000:
        for ip in [k for k, v in _inquiry_rate_limits.items() if not v or now - v[-1] >= RATE_LIMIT_WINDOW]:
            _inquiry_rate_limits.pop(ip, None)
    timestamps = _inquiry_rate_limits[client_ip]
    valid_timestamps = [t for t in timestamps if now - t < RATE_LIMIT_WINDOW]
    _inquiry_rate_limits[client_ip] = valid_timestamps
    if len(valid_timestamps) >= RATE_LIMIT_MAX_REQUESTS:
        return False
    _inquiry_rate_limits[client_ip].append(now)
    return True


def _load_pushover_creds() -> tuple[Optional[str], Optional[str]]:
    """
    Safely retrieves Pushover credentials without ever logging or exposing values.
    Checks environment variables first, then reads .env files on CT 104 if present.
    """
    user_key = os.environ.get("PUSHOVER_USER_KEY")
    api_token = os.environ.get("PUSHOVER_API_TOKEN")
    if user_key and api_token:
        return user_key, api_token

    env_paths = [
        Path("/opt/apps/website-api/.env"),
        Path("/opt/apps/deal-hunter/.env"),
    ]
    for env_path in env_paths:
        if not env_path.is_file():
            continue
        try:
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith("#") or "=" not in line:
                        continue
                    k, v = line.split("=", 1)
                    k = k.strip()
                    v = v.strip().strip("'\"")
                    if not user_key and k == "PUSHOVER_USER_KEY":
                        user_key = v
                    elif not api_token and k == "PUSHOVER_API_TOKEN":
                        api_token = v
        except Exception:
            pass
        if user_key and api_token:
            break

    return user_key, api_token


def _load_fanout_endpoints() -> tuple[Optional[str], Optional[str]]:
    """
    Safely retrieves optional NTFY_URL and DISCORD_WEBHOOK_URL.
    Checks environment variables first, then reads .env files on CT 104 if present.
    """
    ntfy_url = os.environ.get("NTFY_URL")
    discord_webhook = os.environ.get("DISCORD_WEBHOOK_URL")
    if ntfy_url and discord_webhook:
        return ntfy_url, discord_webhook

    env_paths = [
        Path("/opt/apps/website-api/.env"),
        Path("/opt/apps/deal-hunter/.env"),
    ]
    for env_path in env_paths:
        if not env_path.is_file():
            continue
        try:
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith("#") or "=" not in line:
                        continue
                    k, v = line.split("=", 1)
                    k = k.strip()
                    v = v.strip().strip("'\"")
                    if not ntfy_url and k == "NTFY_URL":
                        ntfy_url = v
                    elif not discord_webhook and k == "DISCORD_WEBHOOK_URL":
                        discord_webhook = v
        except Exception:
            pass
        if ntfy_url and discord_webhook:
            break

    return ntfy_url, discord_webhook


def init_db():
    try:
        DB_PATH.parent.mkdir(parents=True, exist_ok=True)
        with sqlite3.connect(DB_PATH) as conn:
            conn.execute("PRAGMA journal_mode=WAL;")
            conn.execute("PRAGMA busy_timeout=5000;")
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS inquiries (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    created_at REAL NOT NULL,
                    name TEXT NOT NULL,
                    email TEXT NOT NULL,
                    service_tier TEXT NOT NULL,
                    message TEXT NOT NULL
                )
                """
            )
    except Exception:
        # Avoid crashing during module import if running in dev environment without /opt/apps permissions
        pass


init_db()


class InquiryRequest(BaseModel):
    name: str
    email: str
    service_tier: Optional[str] = "General Consulting / Coaching"
    message: str
    website_url: Optional[str] = ""

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        s = v.strip()
        if not (1 <= len(s) <= 200):
            raise ValueError("Name must be between 1 and 200 characters.")
        return s

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        s = v.strip()
        if not ("@" in s and len(s) <= 254):
            raise ValueError("A valid email address is required (max 254 characters).")
        return s

    @field_validator("service_tier")
    @classmethod
    def validate_service_tier(cls, v: Optional[str]) -> str:
        if not v:
            return "General Consulting / Coaching"
        s = v.strip()
        if len(s) > 120:
            s = s[:120]
        return s

    @field_validator("message")
    @classmethod
    def validate_message(cls, v: str) -> str:
        s = v.strip()
        if not (1 <= len(s) <= 5000):
            raise ValueError("Message must be between 1 and 5000 characters.")
        return s


@app.get("/api/health")
async def health():
    """Sanitized health check endpoint returning no internal IP or port information."""
    return {
        "status": "online",
        "service": "website-api",
        "cluster": "proxmox-homelab",
        "timestamp": time.time(),
    }


@app.get("/api/projects")
async def list_projects():
    """Returns the 6 portfolio projects showcased on the site."""
    return {
        "projects": [
            {
                "id": "boredgamer-arena",
                "title": "BoredGamer Arena — Multi-Agent AI Board Game Engine",
                "category": "Reinforcement Learning & Game AI",
                "stack": ["Rust", "PyO3", "ONNX Runtime", "IS-MCTS", "FastAPI", "React"],
                "summary": "24/7 multiplayer & AI board game lounge hosting neural Kingdomino and Partnership Pinochle agents trained via self-play.",
                "live_demo_available": True,
                "project_url": "/projects/boredgamer-arena",
                "external_url": "https://arena.eliburgessconsulting.com",
            },
            {
                "id": "research-bioinfo-hub",
                "title": "Local-First AI Research & Bioinformatics Knowledge Engine",
                "category": "RAG, Search & Bioinformatics",
                "stack": ["DuckDB BM25", "Zoekt", "FastMCP", "BLAST+", "FastAPI"],
                "summary": "Sub-10ms code search across 59 repositories, 2.6M arXiv papers, and viral genomics databases exposed via Model Context Protocol (MCP).",
                "live_demo_available": True,
                "project_url": "/projects/research-hub",
                "external_url": None,
            },
            {
                "id": "deal-hunter",
                "title": "eBay Homelab Deal Hunter — Autonomous Price Arbitrage & Scraper",
                "category": "Autonomous Scraping & Market Intelligence",
                "stack": ["Python", "FastAPI", "SQLite WAL", "Playwright", "Pushover API", "Docker"],
                "summary": "Autonomous eBay scraper & valuation engine tracking enterprise server gear, minipc clusters, and calculating live market benchmarks.",
                "live_demo_available": True,
                "project_url": "/projects/deal-hunter",
                "external_url": None,
            },
            {
                "id": "coaching-payment-tracker",
                "title": "Automated Coaching Sync & Square Billing Pipeline",
                "category": "Business Automation",
                "stack": ["Python", "Google Calendar API", "Square API", "SQLite"],
                "summary": "Self-hosted billing pipeline that extracts coaching sessions from Google Calendar, stages client reviews, and automates Square invoicing.",
                "live_demo_available": False,
                "project_url": "/projects/coaching-payment-tracker",
                "external_url": None,
            },
            {
                "id": "toddler-touch-screen-lock",
                "title": "Toddler Touch Screen Lock — Mobile Utility App",
                "category": "Android & Consumer Apps",
                "stack": ["Android", "Kotlin", "Accessibility Overlay", "Google Play"],
                "summary": "Published Android utility (Burgess Meditation LLC) that locks screen inputs during video playback so toddlers can watch without accidental taps.",
                "live_demo_available": False,
                "project_url": "/projects/toddler-touch-screen-lock",
                "external_url": None,
            },
            {
                "id": "antigravity-mobile-gateway",
                "title": "Antigravity Remote Agent Orchestrator & Mobile Gateway",
                "category": "Agentic Systems & Infrastructure",
                "stack": ["Python", "FastAPI", "WebSockets", "WebAuthn Passkeys", "Tailscale"],
                "summary": "Passkey-authenticated mobile command center for dispatching and monitoring autonomous coding agents across Proxmox VMs and workstations.",
                "live_demo_available": False,
                "project_url": "/#projects",
                "external_url": None,
            },
        ]
    }


@app.post("/api/coaching/inquiry")
async def submit_inquiry(req: InquiryRequest, request: Request):
    """
    Submits a coaching inquiry with honeypot detection, per-IP rate limiting,
    WAL-mode SQLite persistence, and instant asynchronous Pushover notification.
    """
    # 1. Honeypot check: If website_url is filled out by automated bots, silently drop
    if req.website_url and req.website_url.strip():
        return {"ok": True, "inquiry_id": 0, "message": "Inquiry received."}

    # 2. In-memory per-IP rate limiting
    client_ip = (
        request.headers.get("CF-Connecting-IP")
        or request.headers.get("X-Forwarded-For", "").split(",")[0].strip()
        or (request.client.host if request.client else "unknown")
    )
    if not _check_rate_limit(client_ip):
        raise HTTPException(
            status_code=429,
            detail="Too many inquiries submitted from this network. Please try again later.",
        )

    # 3. WAL-mode SQLite insertion
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("PRAGMA journal_mode=WAL;")
        conn.execute("PRAGMA busy_timeout=5000;")
        cur = conn.execute(
            "INSERT INTO inquiries (created_at, name, email, service_tier, message) VALUES (?, ?, ?, ?, ?)",
            (time.time(), req.name, req.email, req.service_tier or "General", req.message),
        )
        inquiry_id = cur.lastrowid

    # 4. Instant Pushover Notification (failures never break the response)
    user_key, api_token = _load_pushover_creds()
    if user_key and api_token:
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                await client.post(
                    "https://api.pushover.net/1/messages.json",
                    data={
                        "token": api_token,
                        "user": user_key,
                        "title": f"New Website Inquiry: {req.service_tier}",
                        "message": f"{req.name} <{req.email}>\n\n{req.message[:400]}",
                    },
                )
        except Exception:
            pass

    # 5. Optional Notification Fan-Out: NTFY and Discord Webhook (failures never break the response)
    ntfy_url, discord_webhook = _load_fanout_endpoints()
    if ntfy_url:
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                tier_label = req.service_tier or "General"
                body_text = f"From: {req.name} <{req.email}>\nTopic: {tier_label}\n\n{req.message}"
                await client.post(
                    ntfy_url,
                    content=body_text.encode("utf-8"),
                    headers={
                        "Title": f"New Website Inquiry ({tier_label})",
                        "Content-Type": "text/plain; charset=utf-8",
                    },
                )
        except Exception:
            pass

    if discord_webhook:
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                tier_label = req.service_tier or "General"
                discord_payload = {
                    "content": f"**New Website Inquiry ({tier_label})**\nFrom: {req.name} <{req.email}>\n\n{req.message[:1800]}"
                }
                await client.post(discord_webhook, json=discord_payload)
        except Exception:
            pass

    return {
        "ok": True,
        "inquiry_id": inquiry_id,
        "message": "Inquiry received and stored on homelab.",
    }


@app.get("/api/arena/status")
async def arena_status():
    """
    Proxies live telemetry from BoredGamer Arena game server (CT 105).
    Sanitizes response (no internal port/IP) and provides graceful degradation on timeout.
    """
    fallback = {
        "online": False,
        "status": "offline",
        "games_count": 2,
        "active_tables": 0,
        "playing_tables": 0,
        "active_players": 0,
        "seated_humans": 0,
        "spectators": 0,
        "kingdomino_bots": 12,
        "pinochle_bots": 5,
        "arena_url": "https://arena.eliburgessconsulting.com",
    }
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.get("http://192.168.0.109:8400/api/health")
            if resp.status_code == 200:
                data = resp.json()
                return {
                    "online": True,
                    "status": data.get("status", "ok"),
                    "games_count": data.get("games_count", 2),
                    "active_tables": data.get("active_tables", 0),
                    "playing_tables": data.get("playing_tables", 0),
                    "active_players": data.get("active_players", 0),
                    "seated_humans": data.get("seated_humans", 0),
                    "spectators": data.get("spectators", 0),
                    "kingdomino_bots": data.get("kingdomino_bots", 12),
                    "pinochle_bots": data.get("pinochle_bots", 5),
                    "arena_url": "https://arena.eliburgessconsulting.com",
                }
    except Exception:
        pass
    return fallback


@app.get("/api/deal-hunter/summary")
async def deal_hunter_summary():
    """
    Reads summary statistics and market benchmarks from eBay Deal Hunter SQLite DB in read-only mode.
    """
    if not DEAL_HUNTER_DB.is_file():
        return {
            "available": False,
            "total_tracked_items": 0,
            "active_deals_count": 0,
            "top_discount_pct": 0.0,
            "rule_names": [],
            "benchmarks": [],
        }

    try:
        with sqlite3.connect(f"file:{DEAL_HUNTER_DB}?mode=ro", uri=True) as conn:
            conn.row_factory = sqlite3.Row
            total_items = conn.execute("SELECT COUNT(*) FROM items").fetchone()[0]
            active_deals = conn.execute(
                "SELECT COUNT(*) FROM items WHERE status='ACTIVE' AND savings_pct > 0"
            ).fetchone()[0]
            top_discount = conn.execute(
                "SELECT ROUND(COALESCE(MAX(savings_pct), 0), 1) FROM items WHERE status='ACTIVE'"
            ).fetchone()[0] or 0.0
            rule_rows = conn.execute(
                "SELECT DISTINCT rule_name FROM items WHERE status='ACTIVE' AND savings_pct > 0 ORDER BY rule_name"
            ).fetchall()
            rule_names = [r["rule_name"] for r in rule_rows if r["rule_name"]]

            bench_rows = conn.execute(
                """
                SELECT id, rule_name, config_tier, sample_count, median_price, p20_price, min_price, max_price, avg_price, last_updated_at
                FROM market_benchmarks
                ORDER BY sample_count DESC
                LIMIT 40
                """
            ).fetchall()
            benchmarks = [dict(r) for r in bench_rows]

            return {
                "available": True,
                "total_tracked_items": total_items,
                "active_deals_count": active_deals,
                "top_discount_pct": float(top_discount),
                "rule_names": rule_names,
                "benchmarks": benchmarks,
            }
    except Exception:
        return {
            "available": False,
            "total_tracked_items": 0,
            "active_deals_count": 0,
            "top_discount_pct": 0.0,
            "rule_names": [],
            "benchmarks": [],
        }


@app.get("/api/deal-hunter/deals")
async def deal_hunter_deals(
    rule_name: Optional[str] = None,
    min_ram_gb: Optional[int] = None,
    max_price: Optional[float] = None,
    config_tier: Optional[str] = None,
    q: Optional[str] = None,
    limit: int = Query(default=150, ge=1, le=250),
):
    """
    Queries active deals with positive savings from eBay Deal Hunter SQLite DB in read-only mode.
    Uses parameterized SQL exclusively to prevent any injection.
    """
    if not DEAL_HUNTER_DB.is_file():
        return {"available": False, "count": 0, "deals": []}

    try:
        conditions = ["status = 'ACTIVE'", "savings_pct > 0"]
        params: List[Any] = []

        if rule_name:
            conditions.append("rule_name = ?")
            params.append(rule_name)

        if min_ram_gb is not None:
            conditions.append("COALESCE(detected_ram_gb, 0) >= ?")
            params.append(min_ram_gb)

        if max_price is not None:
            conditions.append("total_price <= ?")
            params.append(max_price)

        if config_tier:
            conditions.append("config_tier = ?")
            params.append(config_tier)

        if q:
            conditions.append("title LIKE ?")
            params.append(f"%{q}%")

        where_clause = " AND ".join(conditions)
        sql = f"""
            SELECT item_id, rule_name, title, price, shipping_cost, total_price,
                   currency, buying_format, condition_name, item_url, image_url,
                   seller_feedback_score, seller_positive_percent, config_tier,
                   detected_cpu, detected_ram_gb, detected_storage, effective_ceiling,
                   savings_dollars, savings_pct, last_seen_at
            FROM items
            WHERE {where_clause}
            ORDER BY savings_pct DESC
            LIMIT ?
        """
        params.append(limit)

        with sqlite3.connect(f"file:{DEAL_HUNTER_DB}?mode=ro", uri=True) as conn:
            conn.row_factory = sqlite3.Row
            rows = conn.execute(sql, params).fetchall()
            deals = [dict(r) for r in rows]

            return {
                "available": True,
                "count": len(deals),
                "deals": deals,
            }
    except Exception:
        return {"available": False, "count": 0, "deals": []}


@app.get("/api/research/status")
async def research_status():
    """
    Proxies health & index telemetry from Research & Bioinformatics Hub (CT 107).
    Strictly whitelists counts and sanitized job statuses, discarding internal paths/errors.
    """
    fallback = {
        "online": False,
        "status": "offline",
        "arxiv_papers": 71500,
        "viral_records": 19625,
        "pmc_articles": 0,
        "zoekt_shards": 65,
        "zim_count": 4,
        "zim_archives": [],
        "repositories_indexed": 59,
        "jobs_status": {},
    }
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.get("http://192.168.0.111:8080/api/health")
            if resp.status_code == 200:
                data = resp.json()
                counts = data.get("counts") or {}
                jobs = data.get("jobs") or {}
                zoekt_sync = jobs.get("zoekt_sync") if isinstance(jobs.get("zoekt_sync"), dict) else {}

                jobs_status = {
                    k: v.get("status", "unknown")
                    for k, v in jobs.items()
                    if isinstance(v, dict)
                }

                return {
                    "online": True,
                    "status": data.get("status", "ok"),
                    "arxiv_papers": counts.get("arxiv_papers", data.get("arxiv_papers", 0)),
                    "viral_records": counts.get("viral_records", data.get("viral_records", 0)),
                    "pmc_articles": counts.get("pmc_articles", data.get("pmc_articles", 0)),
                    "zoekt_shards": data.get("zoekt_shards", 0),
                    "zim_count": data.get("zim_count", 0),
                    "zim_archives": data.get("zim_archives", []),
                    "repositories_indexed": zoekt_sync.get("repositories_indexed", 0),
                    "jobs_status": jobs_status,
                }
    except Exception:
        pass
    return fallback


@app.get("/api/valheim/status")
async def valheim_status():
    """
    Retrieves Valheim dedicated server telemetry (CT 105).
    Enforces a strict security whitelist: NEVER exposes server password, IP addresses, join code, or player list.
    """
    fallback = {
        "online": False,
        "status": "Offline",
        "player_count": 0,
        "world": "",
        "server_name": "",
        "uptime": "",
        "active_mods": [],
    }
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.get("http://192.168.0.105:8088/api/status")
            if resp.status_code == 200:
                data = resp.json()
                # Never advertise access-control details (e.g. a "NoServerPassword" mod) publicly
                mods = [
                    str(m)
                    for m in (data.get("active_mods") or [])
                    if "password" not in str(m).lower()
                ]
                return {
                    "online": True,
                    "status": data.get("status", "Online"),
                    "player_count": data.get("player_count", 0),
                    "world": data.get("world", ""),
                    "server_name": data.get("server_name", ""),
                    "uptime": data.get("uptime", ""),
                    "active_mods": mods,
                }
    except Exception:
        pass
    return fallback
