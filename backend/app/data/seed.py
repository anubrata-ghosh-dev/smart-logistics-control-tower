"""
seed.py — Simulated shipment fleet used as the in-memory data store.

In production this would be replaced by a database query (e.g. SQLAlchemy
or Supabase).  Keeping it here makes the code runnable without any DB setup.

Positions are deliberately placed near/around maritime chokepoints so that
the geopolitical risk engine has interesting data to demonstrate.
"""

from app.models.shipment import Shipment

SEED_SHIPMENTS = [
    Shipment(
        id="SHP-001",
        origin="Dubai",
        destination="Rotterdam",
        cargo_type="Medical Supplies",
        latitude=26.4,        # Near Strait of Hormuz
        longitude=56.1,
        speed=4.2,            # Below threshold → speed risk
    ),
    Shipment(
        id="SHP-002",
        origin="Shanghai",
        destination="Los Angeles",
        cargo_type="Electronics",
        latitude=2.4,         # Near Strait of Malacca
        longitude=101.5,
        speed=14.0,
    ),
    Shipment(
        id="SHP-003",
        origin="Mumbai",
        destination="Hamburg",
        cargo_type="Food Grains",
        latitude=12.6,        # Near Bab-el-Mandeb
        longitude=43.5,
        speed=9.5,
    ),
    Shipment(
        id="SHP-004",
        origin="Singapore",
        destination="New York",
        cargo_type="Automobile Parts",
        latitude=-10.0,       # Open Indian Ocean — low geopolitical risk
        longitude=80.0,
        speed=17.2,
    ),
    Shipment(
        id="SHP-005",
        origin="Cape Town",
        destination="London",
        cargo_type="Pharmaceutical",
        latitude=30.3,        # Near Suez Canal entry
        longitude=32.4,
        speed=3.8,            # Slow speed + Suez proximity = high risk
    ),
    Shipment(
        id="SHP-006",
        origin="Houston",
        destination="Tokyo",
        cargo_type="Fuel / LNG",
        latitude=35.8,        # Near Strait of Gibraltar
        longitude=-5.7,
        speed=12.0,
    ),
]
