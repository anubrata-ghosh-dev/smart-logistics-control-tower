"""
decisions.py — Decision Engine.

Combines risk score, shipment priority, and prediction confidence to
output one of three actionable recommendations:
  • "Reroute immediately"
  • "Delay shipment"
  • "Monitor closely"

The matrix below encodes the business rules:

  Priority │ Risk   │ Confidence │ Decision
  ─────────┼────────┼────────────┼──────────────────────
  high     │ high   │ any        │ Reroute immediately
  high     │ medium │ high       │ Delay shipment
  high     │ medium │ low        │ Monitor closely
  medium   │ high   │ high       │ Reroute immediately
  medium   │ high   │ low        │ Delay shipment
  medium   │ medium │ any        │ Monitor closely
  low      │ any    │ any        │ Monitor closely
"""


def make_decision(risk_score: float, priority: str, confidence: float) -> str:
    """
    Return a decision string.

    Parameters
    ----------
    risk_score  : 0.0 – 1.0   (from prediction engine)
    priority    : "high" | "medium" | "low"
    confidence  : 0.0 – 1.0   (how reliable the prediction is)
    """

    high_risk   = risk_score >= 0.65
    medium_risk = 0.35 <= risk_score < 0.65
    high_conf   = confidence >= 0.75

    if priority == "high":
        if high_risk:
            return "Reroute immediately"
        if medium_risk and high_conf:
            return "Delay shipment"
        return "Monitor closely"

    if priority == "medium":
        if high_risk and high_conf:
            return "Reroute immediately"
        if high_risk and not high_conf:
            return "Delay shipment"
        if medium_risk:
            return "Monitor closely"
        return "Monitor closely"

    # priority == "low"
    return "Monitor closely"
