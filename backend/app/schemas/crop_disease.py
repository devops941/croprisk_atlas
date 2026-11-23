from pydantic import BaseModel
from typing import Optional, List

class DiseaseBase(BaseModel):
    name: str
    scientific_name: str
    pathogen_type: str = "Fungus"
    optimal_temp_min: float
    optimal_temp_max: float
    min_conducive_rh: float
    min_conducive_wetness_hours: float = 10.0
    scientific_reference: Optional[str] = None

class DiseaseResponse(DiseaseBase):
    id: int
    crop_id: int

    class Config:
        from_attributes = True

class CropBase(BaseModel):
    common_name: str
    scientific_name: str
    standard_growth_stages: Optional[str] = None

class CropResponse(CropBase):
    id: int
    diseases: List[DiseaseResponse] = []

    class Config:
        from_attributes = True
