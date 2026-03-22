"""
api/alerts.py — GET /alerts

Returns only high-risk shipments (risk_score >= 0.60),
sorted by priority (high → medium → low).
"""

from fastapi import APIRouter
from typing import List, Dict, Any

from app.services.simulation  import update_shipment_position
from app.services.prediction   import predict_risk
from app.services.allocation   import assign_priority
from app.services.decisions    import make_decision
from app.data.seed             import SEED_SHIPMENTS

router = APIRouter()

PRIORITY_ORDER = {"high": 0, "medium": 1, "low": 2}
ALERT_THRESHOLD = 0.60  # Shipments above this score trigger an alert


@router.get("/alerts", tags=["Alerts"])
def get_alerts() -> List[Dict[str, Any]]:
    """Return all shipments whose composite risk exceeds the alert threshold."""
    alerts = []

    for raw in SEED_SHIPMENTS:
        shipment = update_shipment_position(raw)
        risk     = predict_risk(shipment)
        priority = assign_priority(shipment.cargo_type)

        if risk.total_risk >= ALERT_THRESHOLD:
            decision = make_decision(risk.total_risk, priority, risk.confidence)
            alerts.append({
                "id":         shipment.id,
                "origin":     shipment.origin,
                "destination": shipment.destination,
                "cargo_type": shipment.cargo_type,
                "risk_score": risk.total_risk,
                "status":     risk.status,
                "priority":   priority,
                "decision":   decision,
                "confidence": risk.confidence,
            })

    # Sort: high-priority critical shipments appear first
    alerts.sort(key=lambda x: (PRIORITY_ORDER[x["priority"]], -x["risk_score"]))
    return alerts
