from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from app.db.session import get_db
from app.models import FieldObservation, UploadBatch, UploadError, Region, Crop, Disease
from app.schemas.observation import FieldObservationCreate, FieldObservationResponse
from app.schemas.upload import UploadSummary, UploadBatchResponse
from app.services.ingestion import ingestion_service
from app.services.geospatial import geospatial_service

router = APIRouter()

@router.post("/upload-weather", response_model=UploadSummary)
async def upload_weather_csv(
    file: UploadFile = File(...),
    provenance: str = Form("PUBLIC_HISTORICAL_REANALYSIS"),
    db: Session = Depends(get_db)
):
    """
    Ingests and validates a meteorological CSV dataset.
    Detects invalid rows, maintains row-level error logs, and tags data provenance.
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted.")
    
    content = await file.read()
    summary = ingestion_service.ingest_weather_csv(
        db=db,
        file_content=content,
        file_name=file.filename,
        default_provenance=provenance
    )
    return summary

@router.post("/upload-observations", response_model=UploadSummary)
async def upload_observations_csv(
    file: UploadFile = File(...),
    provenance: str = Form("USER_SCOUTED"),
    db: Session = Depends(get_db)
):
    """
    Ingests and validates a field scouting observations CSV.
    Validates GPS points, maps to enclosing Taluk via PIP, and checks IRRI SES scores.
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted.")
        
    content = await file.read()
    summary = ingestion_service.ingest_observation_csv(
        db=db,
        file_content=content,
        file_name=file.filename,
        default_provenance=provenance
    )
    return summary

@router.post("/observations", response_model=FieldObservationResponse)
def create_single_observation(payload: FieldObservationCreate, db: Session = Depends(get_db)):
    """
    Records a single field observation from scouting personnel.
    Automatically assigns region_id using Point-in-Polygon spatial mapping.
    """
    region_id = payload.region_id
    if not region_id:
        taluk_match = geospatial_service.find_taluk_for_point(payload.latitude, payload.longitude)
        if not taluk_match:
            raise HTTPException(
                status_code=400,
                detail=f"Coordinates ({payload.latitude:.4f}, {payload.longitude:.4f}) fall outside Madurai District boundaries. Only field points within Madurai's 11 taluks can be ingested."
            )
        region = db.query(Region).filter(Region.taluk_name == taluk_match["taluk_name"]).first()
        region_id = region.id if region else taluk_match["taluk_id"]

    obs = FieldObservation(
        region_id=region_id,
        crop_id=payload.crop_id,
        disease_id=payload.disease_id,
        observation_date=payload.observation_date,
        latitude=payload.latitude,
        longitude=payload.longitude,
        growth_stage=payload.growth_stage,
        disease_present=payload.disease_present,
        severity_score_ses=payload.severity_score_ses,
        incidence_percentage=payload.incidence_percentage,
        observer_name=payload.observer_name,
        notes=payload.notes,
        data_provenance=payload.data_provenance
    )
    db.add(obs)
    db.commit()
    db.refresh(obs)

    # Format response with names
    region_obj = db.get(Region, region_id)
    crop_obj = db.get(Crop, payload.crop_id)
    disease_obj = db.get(Disease, payload.disease_id)

    res = FieldObservationResponse.model_validate(obs)
    res.taluk_name = region_obj.taluk_name if region_obj else None
    res.crop_name = crop_obj.common_name if crop_obj else None
    res.disease_name = disease_obj.name if disease_obj else None
    return res

@router.get("/observations", response_model=List[FieldObservationResponse])
def list_observations(
    region_id: Optional[int] = Query(None),
    disease_id: Optional[int] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db)
):
    """Filters field observations by region, disease, or date range"""
    q = db.query(FieldObservation)
    if region_id:
        q = q.filter(FieldObservation.region_id == region_id)
    if disease_id:
        q = q.filter(FieldObservation.disease_id == disease_id)
    if start_date:
        q = q.filter(FieldObservation.observation_date >= start_date)
    if end_date:
        q = q.filter(FieldObservation.observation_date <= end_date)

    obs_list = q.order_by(FieldObservation.observation_date.desc()).all()
    results: List[FieldObservationResponse] = []
    
    # Preload lookups
    regions = {r.id: r.taluk_name for r in db.query(Region).all()}
    crops = {c.id: c.common_name for c in db.query(Crop).all()}
    diseases = {d.id: d.name for d in db.query(Disease).all()}

    for o in obs_list:
        item = FieldObservationResponse.model_validate(o)
        item.taluk_name = regions.get(o.region_id)
        item.crop_name = crops.get(o.crop_id)
        item.disease_name = diseases.get(o.disease_id)
        results.append(item)

    return results

@router.get("/upload-batches", response_model=List[UploadBatchResponse])
def list_upload_batches(db: Session = Depends(get_db)):
    """Returns dataset upload history with audit statistics"""
    return db.query(UploadBatch).order_by(UploadBatch.uploaded_at.desc()).all()
