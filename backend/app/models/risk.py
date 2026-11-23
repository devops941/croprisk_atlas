from sqlalchemy import Column, Integer, Float, Date, String, ForeignKey, Text, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.db.base import Base

class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id = Column(Integer, primary_key=True, index=True)
    region_id = Column(Integer, ForeignKey("regions.id"), nullable=False, index=True)
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=False, index=True)
    disease_id = Column(Integer, ForeignKey("diseases.id"), nullable=False, index=True)
    assessment_date = Column(Date, nullable=False, index=True)
    
    # Deterministic Rule-Based Assessment
    rule_based_score = Column(Float, nullable=False)  # 0.0 to 1.0 continuous score
    rule_based_level = Column(String(20), nullable=False) # 'LOW', 'MEDIUM', 'HIGH'
    triggered_rules_json = Column(Text, nullable=True) # Serialized list of triggered agronomic rules
    primary_risk_factor = Column(String(100), nullable=True) # e.g. "Prolonged High Humidity > 90% and Optimal Temp"
    
    # Machine Learning Assessment (when trained model is active)
    ml_predicted_score = Column(Float, nullable=True) # 0.0 to 1.0 predicted probability
    ml_predicted_level = Column(String(20), nullable=True) # 'LOW', 'MEDIUM', 'HIGH'
    ml_confidence = Column(Float, nullable=True)
    
    # Aggregated environmental drivers snapshot (for auditing and explainability)
    avg_temp_min_window = Column(Float, nullable=True)
    avg_rh_window = Column(Float, nullable=True)
    consecutive_conducive_days = Column(Integer, default=0)
    
    generated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        UniqueConstraint("region_id", "crop_id", "disease_id", "assessment_date", name="uq_risk_assessment_tuple"),
    )

    # Relationships
    region = relationship("Region", back_populates="risk_assessments")
    crop = relationship("Crop", back_populates="risk_assessments")
    disease = relationship("Disease", back_populates="risk_assessments")
