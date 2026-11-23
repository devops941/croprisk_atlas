from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class Crop(Base):
    __tablename__ = "crops"

    id = Column(Integer, primary_key=True, index=True)
    common_name = Column(String(100), nullable=False, unique=True) # e.g. "Rice (Paddy)"
    scientific_name = Column(String(150), nullable=False) # e.g. "Oryza sativa"
    standard_growth_stages = Column(Text, nullable=True) # JSON or comma-separated stages

    # Relationships
    diseases = relationship("Disease", back_populates="crop", cascade="all, delete-orphan")
    field_observations = relationship("FieldObservation", back_populates="crop")
    risk_assessments = relationship("RiskAssessment", back_populates="crop")


class Disease(Base):
    __tablename__ = "diseases"

    id = Column(Integer, primary_key=True, index=True)
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=False, index=True)
    name = Column(String(100), nullable=False, index=True) # e.g. "Rice Blast"
    scientific_name = Column(String(150), nullable=False) # e.g. "Magnaporthe oryzae"
    pathogen_type = Column(String(50), default="Fungus")
    
    # Scientific Conducive Weather Thresholds (TNAU / IRRI)
    optimal_temp_min = Column(Float, nullable=False)
    optimal_temp_max = Column(Float, nullable=False)
    min_conducive_rh = Column(Float, nullable=False)
    min_conducive_wetness_hours = Column(Float, default=10.0)
    scientific_reference = Column(Text, nullable=True)

    # Relationships
    crop = relationship("Crop", back_populates="diseases")
    field_observations = relationship("FieldObservation", back_populates="disease")
    risk_assessments = relationship("RiskAssessment", back_populates="disease")
