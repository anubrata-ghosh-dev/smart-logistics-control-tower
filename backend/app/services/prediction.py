"""
prediction.py — The core risk prediction engine.

Combines three independent risk signals:
  1. Speed anomaly          (25 % weight)
  2. Weather severity        (35 % weight)
  3. Geopolitical proximity  (40 % weight)

Confidence is derived from data availability — if weather API fails,
confidence drops proportionally.
"""

from app.models.shipment import Shipment, RiskDetail
from app.services.weather import get_weather_risk
from app.services.geopolitical import get_geopolitical_risk
from app.core.config import SPEED_THRESHOLD_KNOTS

# Weights must sum to 1.0
WEIGHT_SPEED        = 0.25
WEIGHT_WEATHER      = 0.35
WEIGHT_GEOPOLITICAL = 0.40


def predict_risk(shipment: Shipment) -> RiskDetail:
    """
    Evaluate all risk factors for a shipment and return a RiskDetail.

    Parameters
    ----------
    shipment : Shipment
        Current shipment snapshot (position, speed, etc.)

    Returns
    -------
    RiskDetail — full breakdown with explanation list and final status.
    """
    explanations = []
    confidence_penalty = 0.0  # Increases when data sources are unavailable

    # ── 1. Speed risk ────────────────────────────────────────────────────────
    if shipment.speed < SPEED_THRESHOLD_KNOTS:
        speed_risk = 0.8
        explanations.append(
            f"⚠️  Speed anomaly: {shipment.speed} knots is below the "
            f"{SPEED_THRESHOLD_KNOTS}-knot threshold — possible mechanical issue or port congestion."
        )
    elif shipment.speed < SPEED_THRESHOLD_KNOTS * 1.5:
        speed_risk = 0.4
        explanations.append(
            f"🔶 Reduced speed: {shipment.speed} knots — slightly below optimal cruising speed."
        )
    else:
        speed_risk = 0.1
        explanations.append(f"✅ Speed normal: {shipment.speed} knots.")

    # ── 2. Weather risk ──────────────────────────────────────────────────────
    weather = get_weather_risk(shipment.latitude, shipment.longitude)
    weather_risk = weather["risk"]
    if "unavailable" in weather["description"].lower():
        confidence_penalty += 0.15
    if weather_risk >= 0.6:
        explanations.append(f"⛈️  Severe weather: {weather['description']}.")
    elif weather_risk >= 0.3:
        explanations.append(f"🌧️  Adverse weather: {weather['description']}.")
    else:
        explanations.append(f"☀️  Weather favourable: {weather['description']}.")

    # ── 3. Geopolitical risk ─────────────────────────────────────────────────
    geo = get_geopolitical_risk(shipment.latitude, shipment.longitude)
    geo_risk = geo["risk"]
    if geo["chokepoint"]:
        explanations.append(
            f"🚨 Near {geo['chokepoint']}: {geo['description']} (risk {geo_risk:.0%})."
        )
    else:
        explanations.append("🟢 No critical geopolitical chokepoints detected.")

    # ── Composite score (weighted sum) ───────────────────────────────────────
    total_risk = (
        speed_risk * WEIGHT_SPEED
        + weather_risk * WEIGHT_WEATHER
        + geo_risk * WEIGHT_GEOPOLITICAL
    )
    total_risk = round(min(total_risk, 1.0), 3)

    # ── Status label ─────────────────────────────────────────────────────────
    if total_risk >= 0.65:
        status = "delayed"
    elif total_risk >= 0.35:
        status = "at-risk"
    else:
        status = "on-time"

    # ── Confidence ───────────────────────────────────────────────────────────
    # Full confidence if all sources responded; reduced for missing data.
    confidence = round(max(0.5, 0.95 - confidence_penalty), 2)

    return RiskDetail(
        speed_risk=round(speed_risk, 2),
        weather_risk=round(weather_risk, 2),
        geopolitical_risk=round(geo_risk, 2),
        total_risk=total_risk,
        confidence=confidence,
        status=status,
        explanation=explanations,
    )
