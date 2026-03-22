from fastapi import APIRouter

router = APIRouter(prefix="/shipments", tags=["Shipments"])

shipments_db = [
    {"id": 1, "status": "on-time"},
    {"id": 2, "status": "delayed"}
]

@router.get("/")
def get_shipments():
    return shipments_db
