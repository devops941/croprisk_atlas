from sqlalchemy import Column, Integer, Float, Date, String, ForeignKey, UniqueConstraint, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.db.base import Base

class WeatherRecord(Base):
    __tablename__ = "weather_records"

    id = Column(Integer, primary_key=True, index=True)
    region_id = Column(Integer, ForeignKey("regions.id"), nullable=False, index=True)
    record_date = Column(Date, nullable=False, index=True)
    
    # Meteorological variables
    temp_max = Column(Float, nullable=False)
    temp_min = Column(Float, nullable=False)
    temp_avg = Column(Float, nullable=False)
    rh_morning = Column(Float, nullable=True)     # RH at 07:00 / 08:30 IST (crucial for dew/blast)
    rh_evening = Column(Float, nullable=True)     # RH at 14:00 / 17:30 IST
    rh_avg = Column(Float, nullable=False)         # 24h Average Relative Humidity (%)
    rainfall_mm = Column(Float, default=0.0)       # Daily total precipitation (mm)
    wind_speed_kmh = Column(Float, default=0.0)    # Wind speed
    leaf_wetness_hours_est = Column(Float, default=0.0) # Estimated or recorded leaf wetness (hrs)
    solar_radiation_mj = Column(Float, nullable=True)    # Insolation (MJ/m^2/day)
    
    # Provenance Tracking
    # Allowed: 'REAL_STATION', 'PUBLIC_HISTORICAL_REANALYSIS', 'OPEN_METEO_API', 'SYNTHETIC_DEMO'
    data_provenance = Column(String(50), nullable=False, default="PUBLIC_HISTORICAL_REANALYSIS")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        UniqueConstraint("region_id", "record_date", "data_provenance", name="uq_region_date_provenance"),
    )

    # Relationships
    region = relationship("Region", back_populates="weather_records")
