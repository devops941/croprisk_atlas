from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
from pathlib import Path

class Settings(BaseSettings):
    PROJECT_NAME: str = "CropRisk Atlas"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    
    # Base directories
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    STATIC_GEOJSON_DIR: Path = BASE_DIR / "static" / "geojson"
    MADURAI_GEOJSON_PATH: Path = STATIC_GEOJSON_DIR / "madurai_taluks.geojson"
    
    # Database
    DATABASE_URL: str = f"sqlite:///{BASE_DIR}/crop_risk.db"
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]
    
    # Madurai District Bounding Box (Lat/Lon) for Geospatial Validation
    # Madurai geographic span roughly 9.50°N to 10.35°N, 77.75°E to 78.50°E
    MADURAI_BBOX: dict = {
        "min_lat": 9.50,
        "max_lat": 10.35,
        "min_lon": 77.75,
        "max_lon": 78.50,
    }
    
    # Default Coordinate Reference Systems
    CRS_STORAGE: str = "EPSG:4326"  # WGS84
    CRS_METRIC: str = "EPSG:32644"   # UTM Zone 44N (Southern India)

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

settings = Settings()

