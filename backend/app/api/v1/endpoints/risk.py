import json
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
from datetime import date

from app.db.session import get_db
from app.models import Region, Crop, Disease, RiskAssessment
from app.schemas.risk import RiskEvaluateRequest, RiskAssessmentResponse
from app.services.risk_engine import risk_engine
from app.services.geospatial import geospatial_service

router = APIRouter()

@router.post("/evaluate", response_model=RiskAssessmentResponse)
def evaluate_risk(payload: RiskEvaluateRequest, db: Session = Depends(get_db)):
    """
    On-demand risk assessment execution for a specific region, crop, disease, and date.
    Calculates rule-based score, risk level, and explainable driving factors.
    """
    assessment = risk_engine.evaluate_region_risk(
        db=db,
        region_id=payload.region_id,
        crop_id=payload.crop_id,
        disease_id=payload.disease_id,
        assessment_date=payload.assessment_date
    )

    region = db.get(Region, payload.region_id)
    crop = db.get(Crop, payload.crop_id)
    disease = db.get(Disease, payload.disease_id)

    res = RiskAssessmentResponse(
        id=assessment.id,
        region_id=assessment.region_id,
        taluk_name=region.taluk_name if region else "",
        crop_id=assessment.crop_id,
        crop_name=crop.common_name if crop else "",
        disease_id=assessment.disease_id,
        disease_name=disease.name if disease else "",
        assessment_date=assessment.assessment_date,
        rule_based_score=assessment.rule_based_score,
        rule_based_level=assessment.rule_based_level,
        primary_risk_factor=assessment.primary_risk_factor,
        triggered_rules=json.loads(assessment.triggered_rules_json or "[]"),
        ml_predicted_score=assessment.ml_predicted_score,
        ml_predicted_level=assessment.ml_predicted_level,
        ml_confidence=assessment.ml_confidence,
        avg_temp_min_window=assessment.avg_temp_min_window,
        avg_rh_window=assessment.avg_rh_window,
        consecutive_conducive_days=assessment.consecutive_conducive_days
    )
    return res

@router.get("/map-layer", response_model=Dict[str, Any])
def get_risk_map_layer(
    disease_id: int = Query(...),
    assessment_date: date = Query(...),
    crop_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Returns the enriched GeoJSON choropleth layer for Leaflet mapping.
    Calculates or fetches the risk levels for all 11 Madurai taluks on the given date,
    embedding risk scores, risk levels, and color styling directly in the properties.
    """
    disease = db.get(Disease, disease_id)
    if not disease:
        raise HTTPException(status_code=404, detail="Disease not found.")

    # Multi-taluk evaluation
    risk_by_taluk = risk_engine.evaluate_all_regions_for_date(
        db=db,
        disease_id=disease_id,
        assessment_date=assessment_date,
        crop_id=crop_id
    )

    enriched_geojson = geospatial_service.generate_risk_choropleth_geojson(
        risk_by_taluk=risk_by_taluk,
        assessment_date_str=assessment_date.isoformat(),
        disease_name=disease.name
    )
    return enriched_geojson

@router.get("/history", response_model=List[RiskAssessmentResponse])
def get_risk_history(
    region_id: Optional[int] = Query(None),
    disease_id: Optional[int] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db)
):
    """Queries historical risk assessments for time-series trend analysis"""
    q = db.query(RiskAssessment)
    if region_id:
        q = q.filter(RiskAssessment.region_id == region_id)
    if disease_id:
        q = q.filter(RiskAssessment.disease_id == disease_id)
    if start_date:
        q = q.filter(RiskAssessment.assessment_date >= start_date)
    if end_date:
        q = q.filter(RiskAssessment.assessment_date <= end_date)

    assessments = q.order_by(RiskAssessment.assessment_date.desc()).all()
    
    regions = {r.id: r.taluk_name for r in db.query(Region).all()}
    crops = {c.id: c.common_name for c in db.query(Crop).all()}
    diseases = {d.id: d.name for d in db.query(Disease).all()}

    results = []
    for a in assessments:
        results.append(RiskAssessmentResponse(
            id=a.id,
            region_id=a.region_id,
            taluk_name=regions.get(a.region_id, ""),
            crop_id=a.crop_id,
            crop_name=crops.get(a.crop_id, ""),
            disease_id=a.disease_id,
            disease_name=diseases.get(a.disease_id, ""),
            assessment_date=a.assessment_date,
            rule_based_score=a.rule_based_score,
            rule_based_level=a.rule_based_level,
            primary_risk_factor=a.primary_risk_factor,
            triggered_rules=json.loads(a.triggered_rules_json or "[]"),
            ml_predicted_score=a.ml_predicted_score,
            ml_predicted_level=a.ml_predicted_level,
            ml_confidence=a.ml_confidence,
            avg_temp_min_window=a.avg_temp_min_window,
            avg_rh_window=a.avg_rh_window,
            consecutive_conducive_days=a.consecutive_conducive_days
        ))
    return results
