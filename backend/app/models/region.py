from sqlalchemy import Column, Integer, String, Float, Text, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.db.base import Base

class Region(Base):
    __tablename__ = "regions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True, index=True) # e.g. "Madurai North"
    taluk_name = Column(String(100), nullable=False, index=True)
    district_name = Column(String(100), nullable=False, default="Madurai")
    state_name = Column(String(100), nullable=False, default="Tamil Nadu")
    boundary_geojson = Column(Text, nullable=True) # GeoJSON geometry
    centroid_lat = Column(Float, nullable=False)
    centroid_lon = Column(Float, nullable=False)
    agricultural_area_ha = Column(Float, nullable=True, default=0.0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    weather_records = relationship("WeatherRecord", back_populates="region", cascade="all, delete-orphan")
    field_observations = relationship("FieldObservation", back_populates="region", cascade="all, delete-orphan")
    risk_assessments = relationship("RiskAssessment", back_populates="region", cascade="all, delete-orphan")
