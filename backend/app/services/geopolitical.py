"""
geopolitical.py — Checks whether a shipment is near a known maritime chokepoint.

Chokepoints are critical narrow passages where a disruption (military conflict,
piracy, blockade) would significantly delay global shipping.

Risk is computed based on straight-line proximity using latitude/longitude
distance (Euclidean approximation — good enough for this use-case).
"""

import math
from app.core.config import CHOKEPOINT_RADIUS_DEG

# Each chokepoint: name, (lat, lon), current_alert_level (0–1)
CHOKEPOINTS = [
    {
        "name": "Strait of Hormuz",
        "lat": 26.5667,
        "lon": 56.2500,
        "risk_level": 0.75,  # Elevated due to regional tensions
        "description": "Critical Persian Gulf exit — 20 % of global oil passes here.",
    },
    {
        "name": "Suez Canal",
        "lat": 30.4550,
        "lon": 32.5498,
        "risk_level": 0.60,  # Moderate — recent Houthi-related diversions
        "description": "Connects Red Sea to Mediterranean — ~12 % of world trade.",
    },
    {
        "name": "Strait of Malacca",
        "lat": 2.5000,
        "lon": 101.4000,
        "risk_level": 0.45,
        "description": "Busiest chokepoint in Asia — piracy and congestion risk.",
    },
    {
        "name": "Bab-el-Mandeb",
        "lat": 12.5800,
        "lon": 43.4500,
        "risk_level": 0.70,
        "description": "Yemen conflict zone — significant Houthi threat.",
    },
    {
        "name": "Strait of Gibraltar",
        "lat": 35.9333,
        "lon": -5.5833,
        "risk_level": 0.20,
        "description": "Gateway between Atlantic and Mediterranean — generally stable.",
    },
]


def _distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Euclidean distance in degrees (fast approximation for proximity checks)."""
    return math.sqrt((lat1 - lat2) ** 2 + (lon1 - lon2) ** 2)


def get_geopolitical_risk(lat: float, lon: float) -> dict:
    """
    Scan all chokepoints and return the highest-risk one within the radius.

    Returns
    -------
    {
        "risk": float,           # 0.0 – 1.0
        "chokepoint": str | None,
        "description": str
    }
    """
    max_risk = 0.0
    closest_name = None
    closest_desc = ""

    for cp in CHOKEPOINTS:
        dist = _distance(lat, lon, cp["lat"], cp["lon"])
        if dist <= CHOKEPOINT_RADIUS_DEG:
            # Scale risk by proximity: closer = full risk, edge = half risk
            proximity_factor = 1.0 - (dist / CHOKEPOINT_RADIUS_DEG) * 0.5
            effective_risk = cp["risk_level"] * proximity_factor

            if effective_risk > max_risk:
                max_risk = effective_risk
                closest_name = cp["name"]
                closest_desc = cp["description"]

    return {
        "risk": round(max_risk, 2),
        "chokepoint": closest_name,
        "description": closest_desc if closest_name else "No critical chokepoints nearby.",
    }
