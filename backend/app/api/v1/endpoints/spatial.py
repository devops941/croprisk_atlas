from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.db.session import get_db
from app.models import Region
from app.schemas.spatial import PointValidationRequest, PointValidationResponse, RegionResponse
from app.services.geospatial import geospatial_service

router = APIRouter()

@router.get("/madurai-taluks", response_model=Dict[str, Any])
def get_madurai_taluks_geojson():
    """Returns the base GeoJSON FeatureCollection of the 11 Madurai Taluks"""
    return geospatial_service.raw_geojson

@router.post("/validate-point", response_model=PointValidationResponse)
def validate_coordinate_point(payload: PointValidationRequest, db: Session = Depends(get_db)):
    """
    Validates whether a GPS point (lat, lon) falls within Madurai District
    and assigns it to the enclosing Taluk.
    """
    match = geospatial_service.find_taluk_for_point(payload.latitude, payload.longitude)
    if not match:
        return PointValidationResponse(
            is_valid=False,
            latitude=payload.latitude,
            longitude=payload.longitude,
            error_message="Coordinates fall outside the administrative boundaries of Madurai District."
        )

    # Query region ID
    region = db.query(Region).filter(Region.taluk_name == match["taluk_name"]).first()
    region_id = region.id if region else match.get("taluk_id")

    return PointValidationResponse(
        is_valid=True,
        latitude=payload.latitude,
        longitude=payload.longitude,
        taluk_name=match["taluk_name"],
        region_id=region_id,
        district=match["district"]
    )

@router.get("/regions", response_model=List[RegionResponse])
def list_regions(db: Session = Depends(get_db)):
    """Lists all registered regions / taluks in Madurai"""
    return db.query(Region).all()
