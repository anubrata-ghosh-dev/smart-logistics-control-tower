"""
api/shipments.py — GET /shipments

Returns every shipment with its latest risk assessment, priority,
AI decision, and confidence score.
"""

from fastapi import APIRouter
from typing import List, Dict, Any

from app.services.simulation  import update_shipment_position
from app.services.prediction   import predict_risk
from app.services.allocation   import assign_priority
from app.services.decisions    import make_decision
from app.data.seed             import SEED_SHIPMENTS

router = APIRouter()


@router.get("/shipments", tags=["Shipments"])
def get_all_shipments() -> List[Dict[str, Any]]:
    """
    Simulate one movement tick for every shipment, then run the full
    risk → priority → decision pipeline.
    """
    results = []

    for raw in SEED_SHIPMENTS:
        # 1. Simulate position update
        shipment = update_shipment_position(raw)

        # 2. Predict risk
        risk = predict_risk(shipment)

        # 3. Assign priority
        priority = assign_priority(shipment.cargo_type)

        # 4. Generate decision
        decision = make_decision(risk.total_risk, priority, risk.confidence)

        results.append({
            "id":           shipment.id,
            "origin":       shipment.origin,
            "destination":  shipment.destination,
            "cargo_type":   shipment.cargo_type,
            "latitude":     round(shipment.latitude, 4),
            "longitude":    round(shipment.longitude, 4),
            "speed":        round(shipment.speed, 1),
            "status":       risk.status,
            "risk_score":   risk.total_risk,
            "priority":     priority,
            "decision":     decision,
            "confidence":   risk.confidence,
        })

    return results
