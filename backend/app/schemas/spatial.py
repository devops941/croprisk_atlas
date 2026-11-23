from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List

class PointValidationRequest(BaseModel):
    latitude: float = Field(..., ge=-90.0, le=90.0, description="Latitude in decimal degrees")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="Longitude in decimal degrees")

class PointValidationResponse(BaseModel):
    is_valid: bool
    latitude: float
    longitude: float
    taluk_name: Optional[str] = None
    region_id: Optional[int] = None
    district: str = "Madurai"
    error_message: Optional[str] = None

class RegionResponse(BaseModel):
    id: int
    name: str
    taluk_name: str
    district_name: str
    state_name: str
    centroid_lat: float
    centroid_lon: float
    agricultural_area_ha: Optional[float] = 0.0

    class Config:
        from_attributes = True

class GeoJSONFeature(BaseModel):
    type: str = "Feature"
    geometry: Dict[str, Any]
    properties: Dict[str, Any]

class GeoJSONFeatureCollection(BaseModel):
    type: str = "FeatureCollection"
    features: List[GeoJSONFeature]
