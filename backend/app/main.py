from fastapi import FastAPI
from app.api import shipments

app = FastAPI()

app.include_router(shipments.router)

@app.get("/")
def root():
    return {"message": "Smart Logistics Control Tower Running"}
