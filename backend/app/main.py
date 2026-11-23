from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.session import engine, SessionLocal
from app.db.base import Base
from app.db.seed_data import init_db
from app.api.v1.router import api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize DB and ensure seed reference data is present
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        init_db(db)
    finally:
        db.close()
    yield
    # Shutdown logic if any

app = FastAPI(
    title="CropRisk Atlas Intelligence API",
    description="Weather and Field-Based Crop Disease Risk Mapping Intelligence for Field Surveillance Prioritization.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 Router
app.include_router(api_router, prefix=settings.API_V1_PREFIX)

@app.get("/", tags=["Root"])
def root_status():
    return {
        "service": "CropRisk Atlas Intelligence Backend",
        "version": settings.VERSION,
        "geographical_scope": "Madurai District, Tamil Nadu, India",
        "target_crops": ["Rice (Paddy)"],
        "target_diseases": ["Rice Blast", "Brown Spot"],
        "api_docs": "/docs"
    }

@app.get(f"{settings.API_V1_PREFIX}/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION
    }
