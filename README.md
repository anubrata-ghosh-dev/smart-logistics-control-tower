# AI-Powered Supply Chain Decision Intelligence — Backend

## Quick Start

```bash
# 1. Clone / download this folder
cd supply-chain-backend

# 2. Create a virtual environment
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment variables
cp .env.example .env
# Open .env and paste your OpenWeatherMap API key

# 5. Run the server
uvicorn app.main:app --reload
```

Open **http://127.0.0.1:8000/docs** for the interactive Swagger UI.

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/shipments` | All shipments with risk + decision |
| GET | `/api/v1/alerts` | High-risk shipments only (risk ≥ 0.60) |
| GET | `/api/v1/decisions/{id}` | Detailed decision card for one shipment |
| GET | `/api/v1/simulate/{id}` | What-if alternate route analysis |

---

## Architecture

```
backend/app/
├── core/config.py          ← Environment variables + thresholds
├── models/shipment.py      ← Pydantic data models
├── data/seed.py            ← Simulated shipment fleet (demo data)
├── services/
│   ├── weather.py          ← OpenWeatherMap API integration
│   ├── geopolitical.py     ← Chokepoint proximity risk
│   ├── prediction.py       ← Composite risk engine (weighted sum)
│   ├── allocation.py       ← Priority assignment by cargo type
│   ├── decisions.py        ← Decision matrix (reroute/delay/monitor)
│   └── simulation.py       ← Movement simulator + what-if analyser
└── api/
    ├── shipments.py        ← GET /shipments
    ├── alerts.py           ← GET /alerts
    └── decisions.py        ← GET /decisions/{id}  GET /simulate/{id}
```
