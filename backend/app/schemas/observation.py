from pydantic import BaseModel, Field
from datetime import date
from typing import Optional

class FieldObservationCreate(BaseModel):
    region_id: Optional[int] = None  # Auto-resolved via spatial Point-in-Polygon if None
    crop_id: int
    disease_id: int
    observation_date: date
    latitude: float = Field(..., ge=9.4, le=10.5, description="Latitude within Madurai region")
    longitude: float = Field(..., ge=77.6, le=78.6, description="Longitude within Madurai region")
    growth_stage: str
    disease_present: bool = False
    severity_score_ses: int = Field(0, ge=0, le=9, description="IRRI SES 0-9 scale")
    incidence_percentage: float = Field(0.0, ge=0.0, le=100.0)
    observer_name: str = "Field Extension Officer"
    notes: Optional[str] = None
    data_provenance: str = "USER_SCOUTED"

class FieldObservationResponse(FieldObservationCreate):
    id: int
    taluk_name: Optional[str] = None
    crop_name: Optional[str] = None
    disease_name: Optional[str] = None

    class Config:
        from_attributes = True

class ObservationFilterParams(BaseModel):
    region_id: Optional[int] = None
    crop_id: Optional[int] = None
    disease_id: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    disease_present_only: Optional[bool] = None
