from pydantic import BaseModel
from datetime import date
from typing import Optional, List, Dict, Any

class RiskEvaluateRequest(BaseModel):
    region_id: int
    crop_id: int
    disease_id: int
    assessment_date: date

class RiskAssessmentResponse(BaseModel):
    id: Optional[int] = None
    region_id: int
    taluk_name: str
    crop_id: int
    crop_name: str
    disease_id: int
    disease_name: str
    assessment_date: date
    rule_based_score: float # 0.0 to 1.0
    rule_based_level: str   # LOW, MEDIUM, HIGH
    primary_risk_factor: Optional[str] = None
    triggered_rules: List[str] = []
    
    # ML Outputs
    ml_predicted_score: Optional[float] = None
    ml_predicted_level: Optional[str] = None
    ml_confidence: Optional[float] = None
    
    # Environmental factors
    avg_temp_min_window: Optional[float] = None
    avg_rh_window: Optional[float] = None
    consecutive_conducive_days: int = 0

    class Config:
        from_attributes = True

class RiskMapLayerResponse(BaseModel):
    type: str = "FeatureCollection"
    assessment_date: date
    crop_name: str
    disease_name: str
    features: List[Dict[str, Any]]
