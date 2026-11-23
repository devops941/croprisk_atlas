from pydantic import BaseModel, Field
from datetime import date
from typing import Optional

class WeatherRecordCreate(BaseModel):
    region_id: int
    record_date: date
    temp_max: float = Field(..., ge=-10.0, le=60.0)
    temp_min: float = Field(..., ge=-10.0, le=60.0)
    temp_avg: float = Field(..., ge=-10.0, le=60.0)
    rh_morning: Optional[float] = Field(None, ge=0.0, le=100.0)
    rh_evening: Optional[float] = Field(None, ge=0.0, le=100.0)
    rh_avg: float = Field(..., ge=0.0, le=100.0)
    rainfall_mm: float = Field(0.0, ge=0.0, le=1000.0)
    wind_speed_kmh: Optional[float] = Field(0.0, ge=0.0, le=300.0)
    leaf_wetness_hours_est: Optional[float] = Field(0.0, ge=0.0, le=24.0)
    solar_radiation_mj: Optional[float] = Field(None, ge=0.0, le=50.0)
    data_provenance: str = "USER_SCOUTED"

class WeatherRecordResponse(WeatherRecordCreate):
    id: int

    class Config:
        from_attributes = True

class WeatherFilterParams(BaseModel):
    region_id: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    data_provenance: Optional[str] = None
