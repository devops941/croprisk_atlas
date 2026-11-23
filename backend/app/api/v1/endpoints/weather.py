from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from app.db.session import get_db
from app.models import WeatherRecord, Region
from app.schemas.weather import WeatherRecordCreate, WeatherRecordResponse

router = APIRouter()

@router.get("/records", response_model=List[WeatherRecordResponse])
def get_weather_records(
    region_id: Optional[int] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    provenance: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Queries meteorological records with filtering by region and date"""
    q = db.query(WeatherRecord)
    if region_id:
        q = q.filter(WeatherRecord.region_id == region_id)
    if start_date:
        q = q.filter(WeatherRecord.record_date >= start_date)
    if end_date:
        q = q.filter(WeatherRecord.record_date <= end_date)
    if provenance:
        q = q.filter(WeatherRecord.data_provenance == provenance)

    return q.order_by(WeatherRecord.record_date.desc()).all()

@router.post("/records", response_model=WeatherRecordResponse)
def create_weather_record(payload: WeatherRecordCreate, db: Session = Depends(get_db)):
    """Inserts or updates a single daily weather record"""
    region = db.get(Region, payload.region_id)
    if not region:
        raise HTTPException(status_code=404, detail="Region not found.")

    existing = db.query(WeatherRecord).filter(
        WeatherRecord.region_id == payload.region_id,
        WeatherRecord.record_date == payload.record_date,
        WeatherRecord.data_provenance == payload.data_provenance
    ).first()

    if existing:
        for k, v in payload.model_dump().items():
            setattr(existing, k, v)
        db.commit()
        db.refresh(existing)
        return existing

    rec = WeatherRecord(**payload.model_dump())
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return rec
