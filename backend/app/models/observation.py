from sqlalchemy import Column, Integer, Float, Date, String, Boolean, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.db.base import Base

class FieldObservation(Base):
    __tablename__ = "field_observations"

    id = Column(Integer, primary_key=True, index=True)
    region_id = Column(Integer, ForeignKey("regions.id"), nullable=False, index=True)
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=False, index=True)
    disease_id = Column(Integer, ForeignKey("diseases.id"), nullable=False, index=True)
    observation_date = Column(Date, nullable=False, index=True)
    
    # Spatial Point Coordinates
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    
    # Agronomic & Epidemiological attributes
    growth_stage = Column(String(50), nullable=False) # e.g. "Tillering", "Panicle Initiation"
    disease_present = Column(Boolean, nullable=False, default=False)
    severity_score_ses = Column(Integer, default=0) # IRRI Standard Evaluation System 0-9 scale
    incidence_percentage = Column(Float, default=0.0) # Field incidence % (0 - 100)
    
    # Observer details & Notes
    observer_name = Column(String(100), default="Field Extension Officer")
    notes = Column(Text, nullable=True)
    
    # Data Provenance
    # Allowed: 'REAL_FIELD_SURVEY', 'USER_SCOUTED', 'SYNTHETIC_DEMO'
    data_provenance = Column(String(50), nullable=False, default="USER_SCOUTED")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    region = relationship("Region", back_populates="field_observations")
    crop = relationship("Crop", back_populates="field_observations")
    disease = relationship("Disease", back_populates="field_observations")
