"""
main.py — FastAPI application entry point.

Registers all routers and adds CORS so the React frontend can call the API.
Run with:   uvicorn app.main:app --reload
Docs at:    http://127.0.0.1:8000/docs
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import shipments, alerts, decisions

app = FastAPI(
    title="AI Supply Chain Decision Intelligence",
    description=(
        "A logistics control tower that predicts shipment risk using "
        "speed anomalies, live weather data, and geopolitical chokepoint analysis. "
        "Returns actionable decisions with confidence scores."
    ),
    version="1.0.0",
)

# ── CORS — allow the React dashboard (Lovable preview) to call this API ───────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # Tighten this in production
    allow_methods=["GET"],
    allow_headers=["*"],
)

# ── Register routers ──────────────────────────────────────────────────────────
app.include_router(shipments.router, prefix="/api/v1")
app.include_router(alerts.router,    prefix="/api/v1")
app.include_router(decisions.router, prefix="/api/v1")


@app.get("/", tags=["Health"])
def root():
    """Health check — confirms the API is running."""
    return {
        "status": "online",
        "system": "AI Supply Chain Decision Intelligence",
        "docs":   "/docs",
    }
