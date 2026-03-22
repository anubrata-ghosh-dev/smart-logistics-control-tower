"""
weather.py — Fetches live weather data for a given GPS coordinate.
Uses the OpenWeatherMap Current Weather API (free tier).
Returns a normalised risk score between 0.0 and 1.0.
"""

import requests
from app.core.config import OPENWEATHER_API_KEY

# Weather condition codes that indicate high maritime risk
HIGH_RISK_CODES = {
    # Thunderstorm family
    200, 201, 202, 210, 211, 212, 221, 230, 231, 232,
    # Heavy rain
    502, 503, 504, 511,
    # Snow / sleet (relevant for northern routes)
    600, 601, 602, 611, 612, 613, 615, 616, 620, 621, 622,
    # Extreme
    900, 901, 902, 906,
}

MEDIUM_RISK_CODES = {
    # Light rain / drizzle
    300, 301, 302, 310, 311, 312, 313, 314, 321,
    500, 501,
    # Fog / haze
    701, 711, 721, 731, 741, 751, 761, 762,
}


def get_weather_risk(lat: float, lon: float) -> dict:
    """
    Call OpenWeatherMap and return a risk score + description.

    Parameters
    ----------
    lat, lon : GPS coordinates of the shipment

    Returns
    -------
    {
        "risk": float,       # 0.0 low … 1.0 extreme
        "description": str   # Human-readable weather summary
    }
    """
    if OPENWEATHER_API_KEY == "your_api_key_here":
        # No real key → return a safe simulated value so the rest of the
        # system still works during development / demo.
        return {"risk": 0.1, "description": "Weather API key not configured (demo mode)"}

    url = "https://api.openweathermap.org/data/2.5/weather"
    params = {
        "lat": lat,
        "lon": lon,
        "appid": OPENWEATHER_API_KEY,
        "units": "metric",
    }

    try:
        resp = requests.get(url, params=params, timeout=5)
        resp.raise_for_status()
        data = resp.json()

        condition_id = data["weather"][0]["id"]
        description  = data["weather"][0]["description"].capitalize()

        if condition_id in HIGH_RISK_CODES:
            risk = 0.8
        elif condition_id in MEDIUM_RISK_CODES:
            risk = 0.45
        else:
            risk = 0.1   # Clear / partly cloudy

        return {"risk": round(risk, 2), "description": description}

    except requests.RequestException as exc:
        # Network error — fail safely, don't crash the whole request
        return {"risk": 0.0, "description": f"Weather data unavailable: {exc}"}
