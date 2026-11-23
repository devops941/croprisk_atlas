from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models import Crop, Disease
from app.schemas.crop_disease import CropResponse, DiseaseResponse

router = APIRouter()

@router.get("/crops", response_model=List[CropResponse])
def list_crops(db: Session = Depends(get_db)):
    """Lists supported crops with standard growth stages and associated diseases"""
    return db.query(Crop).all()

@router.get("/diseases", response_model=List[DiseaseResponse])
def list_diseases(db: Session = Depends(get_db)):
    """Lists supported pathogens with their TNAU/IRRI scientific threshold parameters"""
    return db.query(Disease).all()
