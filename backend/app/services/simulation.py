"""
simulation.py — Two separate responsibilities:

1. Real-time movement simulator  → update_shipment_position()
   Randomly nudges GPS position and speed to mimic live vessel movement.

2. What-if route analyser        → simulate_alternate_route()
   Proposes an alternative route and estimates trade-offs.
"""

import random
from app.models.shipment import Shipment, SimulationResponse

# Alternate routes keyed by (origin, destination) pairs.
# In a production system this would be fetched from a routing API.
ALTERNATE_ROUTES = {
    ("Dubai", "Rotterdam"):         ("Cape of Good Hope bypass",    36, 180_000),
    ("Shanghai", "Los Angeles"):    ("Northern Pacific corridor",   18,  95_000),
    ("Mumbai", "Hamburg"):          ("Suez bypass via Cape Route",  42, 210_000),
    ("Singapore", "New York"):      ("Trans-Pacific + Panama canal", 24, 130_000),
}

DEFAULT_ALTERNATE = ("Coastal waypoint re-route", 12, 50_000)


def update_shipment_position(shipment: Shipment) -> Shipment:
    """
    Simulate one time-step of vessel movement.

    - Latitude drifts ±0.05°  (~5.5 km)
    - Longitude drifts ±0.07° (~6 km at equator)
    - Speed changes ±1.5 knots (capped between 3 and 25 knots)

    Returns a new Shipment instance (original unchanged).
    """
    updated = shipment.model_copy(update={
        "latitude":  shipment.latitude  + random.uniform(-0.05, 0.05),
        "longitude": shipment.longitude + random.uniform(-0.07, 0.07),
        "speed":     max(3.0, min(25.0, shipment.speed + random.uniform(-1.5, 1.5))),
    })
    return updated


def simulate_alternate_route(shipment: Shipment) -> SimulationResponse:
    """
    Suggest an alternative route for a high-risk shipment.

    Looks up known alternate corridors first; falls back to a generic
    coastal re-route if the pair is not in the database.

    Returns delay reduction (hours) and estimated extra cost (USD).
    """
    key = (shipment.origin, shipment.destination)
    route_name, delay_hrs, cost_usd = ALTERNATE_ROUTES.get(key, DEFAULT_ALTERNATE)

    # Vary slightly so repeated calls feel dynamic
    delay_hrs_jitter = delay_hrs + random.randint(-3, 3)
    cost_jitter      = cost_usd  + random.randint(-5000, 5000)

    recommendation = (
        f"Switch to '{route_name}' to avoid current risk zone. "
        f"Expected delay reduction: ~{delay_hrs_jitter} hours. "
        f"Additional cost: ~${cost_jitter:,} USD."
    )

    return SimulationResponse(
        shipment_id=shipment.id,
        current_route=f"{shipment.origin} → {shipment.destination}",
        alternate_route=route_name,
        delay_reduction_hours=float(delay_hrs_jitter),
        cost_increase_usd=float(cost_jitter),
        recommendation=recommendation,
    )
