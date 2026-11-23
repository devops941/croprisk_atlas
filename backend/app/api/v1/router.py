from fastapi import APIRouter
from app.api.v1.endpoints import spatial, crops, data, weather, risk, reports

api_router = APIRouter()

api_router.include_router(spatial.router, prefix="/spatial", tags=["Spatial & GeoJSON"])
api_router.include_router(crops.router, tags=["Crops & Pathogens"])
api_router.include_router(data.router, prefix="/data", tags=["Data Ingestion & Observations"])
api_router.include_router(weather.router, prefix="/weather", tags=["Meteorology"])
api_router.include_router(risk.router, prefix="/risk", tags=["Epidemiological Risk Evaluation"])
api_router.include_router(reports.router, prefix="/reports", tags=["Analytical Reports & Export"])
