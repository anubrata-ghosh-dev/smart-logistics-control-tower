"""
config.py — Central configuration using environment variables.
Load .env file with python-dotenv so secrets are never hardcoded.
"""

import os
from dotenv import load_dotenv

# Explicitly locate .env relative to this file so it works from any CWD
_env_path = os.path.join(os.path.dirname(__file__), "..", "..", "..", ".env")
load_dotenv(dotenv_path=_env_path, override=False)

# OpenWeatherMap free-tier API key
OPENWEATHER_API_KEY: str = os.getenv("OPENWEATHER_API_KEY", "your_api_key_here")

# Risk thresholds (tuneable)
SPEED_THRESHOLD_KNOTS: float = float(os.getenv("SPEED_THRESHOLD", "5.0"))

# Geopolitical chokepoint proximity radius in degrees (~111 km per degree)
CHOKEPOINT_RADIUS_DEG: float = float(os.getenv("CHOKEPOINT_RADIUS_DEG", "2.0"))
