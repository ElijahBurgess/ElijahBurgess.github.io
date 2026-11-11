"""
Proxmox Homelab API Backend for Personal AI Portfolio & Coaching Website
Deployed on CT 104 (192.168.0.108:8006) at /opt/apps/website-api/main.py
"""
import time
import sqlite3
from pathlib import Path
from typing import Optional
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(
    title="Elijah Burgess — Portfolio & Coaching Homelab API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = Path("/opt/apps/website-api/inquiries.db")


def init_db():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(DB_PATH) as conn:
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


init_db()


class InquiryRequest(BaseModel):
    name: str
    email: str
    service_tier: Optional[str] = "General Consulting / Coaching"
    message: str


@app.get("/api/health")
async def health():
    return {
        "status": "online",
        "node": "ct104-apps-hub",
        "host_ip": "192.168.0.108",
        "port": 8006,
        "timestamp": time.time(),
    }


@app.get("/api/projects")
async def list_projects():
    return {
        "projects": [
            {
                "id": "boredgamer-arena",
                "title": "BoredGamer Arena — Multi-Agent AI Board Game Engine",
                "category": "Reinforcement Learning & Game AI",
                "stack": ["Rust", "PyO3", "ONNX Runtime", "IS-MCTS", "FastAPI", "React"],
                "summary": "24/7 multiplayer & AI board game lounge hosting neural Kingdomino and Partnership Pinochle agents trained via self-play.",
                "live_demo_available": True,
            },
            {
                "id": "research-bioinfo-hub",
                "title": "Local-First AI Research & Bioinformatics Knowledge Engine",
                "category": "RAG, Search & Bioinformatics",
                "stack": ["DuckDB BM25", "Zoekt", "FastMCP", "BLAST+", "FastAPI"],
                "summary": "Sub-10ms code search across 59 repositories, 2.6M arXiv papers, and viral genomics databases exposed via Model Context Protocol (MCP).",
                "live_demo_available": True,
            },
            {
                "id": "antigravity-mobile-gateway",
                "title": "Antigravity Remote Agent Orchestrator & Mobile Gateway",
                "category": "Agentic Systems & Infrastructure",
                "stack": ["Python", "FastAPI", "WebSockets", "WebAuthn Passkeys", "Tailscale"],
                "summary": "Passkey-authenticated mobile command center for dispatching and monitoring autonomous coding agents across Proxmox VMs and workstations.",
                "live_demo_available": False,
            },
            {
                "id": "coaching-payment-tracker",
                "title": "Automated Coaching Sync & Square Billing Pipeline",
                "category": "Business Automation",
                "stack": ["Python", "Google Calendar API", "Square API", "SQLite"],
                "summary": "Self-hosted billing pipeline that extracts coaching sessions from Google Calendar, stages client reviews, and automates Square invoicing.",
                "live_demo_available": False,
            },
            {
                "id": "toddler-touch-screen-lock",
                "title": "Toddler Touch Screen Lock — Mobile Utility App",
                "category": "Android & Consumer Apps",
                "stack": ["Android", "Kotlin", "Accessibility Overlay", "Google Play"],
                "summary": "Published Android utility (Burgess Meditation LLC) that locks screen inputs during video playback so toddlers can watch without accidental taps.",
                "live_demo_available": False,
            },
        ]
    }


@app.post("/api/coaching/inquiry")
async def submit_inquiry(req: InquiryRequest):
    with sqlite3.connect(DB_PATH) as conn:
        cur = conn.execute(
            "INSERT INTO inquiries (created_at, name, email, service_tier, message) VALUES (?, ?, ?, ?, ?)",
            (time.time(), req.name, req.email, req.service_tier or "General", req.message),
        )
        inquiry_id = cur.lastrowid
    return {"ok": True, "inquiry_id": inquiry_id, "message": "Inquiry received and stored on homelab."}
