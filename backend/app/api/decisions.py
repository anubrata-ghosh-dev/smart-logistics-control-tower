"""
api/decisions.py

GET /decisions/{id}  — Full decision card for a specific shipment.
GET /simulate/{id}   — What-if alternate route simulation.
"""

from fastapi import APIRouter, HTTPException
from app.models.shipment import DecisionResponse, SimulationResponse
from app.services.prediction import predict_risk
from app.services.allocation import assign_priority
from app.services.decisions  import make_decision
from app.services.simulation import simulate_alternate_route
from app.data.seed import SEED_SHIPMENTS

router = APIRouter()


def _find_shipment(shipment_id: str):
    """Helper — raise 404 if shipment_id not in seed data."""
    for s in SEED_SHIPMENTS:
        if s.id == shipment_id:
            return s
    raise HTTPException(status_code=404, detail=f"Shipment '{shipment_id}' not found.")


@router.get("/decisions/{shipment_id}", response_model=DecisionResponse, tags=["Decisions"])
def get_decision(shipment_id: str) -> DecisionResponse:
    """
    Return a detailed decision card including:
    - Risk breakdown
    - Priority
    - Recommended action
    - Human-readable explanation of every contributing factor
    """
    shipment = _find_shipment(shipment_id)
    risk     = predict_risk(shipment)
    priority = assign_priority(shipment.cargo_type)
    decision = make_decision(risk.total_risk, priority, risk.confidence)

    return DecisionResponse(
        shipment_id=shipment.id,
        decision=decision,
        priority=priority,
        risk_score=risk.total_risk,
        confidence=risk.confidence,
        explanation=risk.explanation,
    )


@router.get("/simulate/{shipment_id}", response_model=SimulationResponse, tags=["Simulation"])
def simulate_route(shipment_id: str) -> SimulationResponse:
    """
    Run a what-if analysis: propose an alternate shipping route and
    estimate the delay reduction vs. extra cost trade-off.
    """
    shipment = _find_shipment(shipment_id)
    return simulate_alternate_route(shipment)
