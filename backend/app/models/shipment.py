"""
shipment.py — Pydantic data models for shipments and API responses.
Pydantic validates and serialises all data automatically.
"""

from pydantic import BaseModel, Field
from typing import Optional, List


class Shipment(BaseModel):
    """Represents a single cargo shipment in the system."""
    id: str                             # Unique identifier  e.g. "SHP-001"
    origin: str                         # Port of departure
    destination: str                    # Port of arrival
    cargo_type: str                     # "medical" | "food" | "electronics" | etc.
    latitude: float                     # Current GPS latitude
    longitude: float                    # Current GPS longitude
    speed: float                        # Current speed in knots
    status: str = "on-time"             # "on-time" | "at-risk" | "delayed"
    risk_score: float = 0.0             # 0.0 – 1.0
    priority: str = "low"               # "high" | "medium" | "low"
    confidence: float = 0.0            # Prediction confidence  0.0 – 1.0


class RiskDetail(BaseModel):
    """Granular breakdown returned by the prediction engine."""
    speed_risk: float
    weather_risk: float
    geopolitical_risk: float
    total_risk: float
    confidence: float
    status: str
    explanation: List[str]              # Human-readable list of reasons


class DecisionResponse(BaseModel):
    """Full decision card for GET /decisions/{id}."""
    shipment_id: str
    decision: str                       # e.g. "Reroute immediately"
    priority: str
    risk_score: float
    confidence: float
    explanation: List[str]


class SimulationResponse(BaseModel):
    """What-if simulation result for GET /simulate/{id}."""
    shipment_id: str
    current_route: str
    alternate_route: str
    delay_reduction_hours: float
    cost_increase_usd: float
    recommendation: str
