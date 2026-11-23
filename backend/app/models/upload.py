from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.db.base import Base

class UploadBatch(Base):
    __tablename__ = "upload_batches"

    id = Column(Integer, primary_key=True, index=True)
    file_name = Column(String(255), nullable=False)
    batch_type = Column(String(50), nullable=False) # 'WEATHER_CSV', 'OBSERVATION_CSV'
    total_records = Column(Integer, default=0)
    accepted_records = Column(Integer, default=0)
    rejected_records = Column(Integer, default=0)
    data_provenance = Column(String(50), nullable=False, default="USER_SCOUTED")
    uploaded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    errors = relationship("UploadError", back_populates="batch", cascade="all, delete-orphan")


class UploadError(Base):
    __tablename__ = "upload_errors"

    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(Integer, ForeignKey("upload_batches.id"), nullable=False, index=True)
    row_index = Column(Integer, nullable=False)
    field_name = Column(String(100), nullable=True)
    invalid_value = Column(String(255), nullable=True)
    rejection_reason = Column(Text, nullable=False)

    batch = relationship("UploadBatch", back_populates="errors")
