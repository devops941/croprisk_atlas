import io
import csv
from datetime import date
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import Region, Disease, RiskAssessment
from app.services.risk_engine import risk_engine

router = APIRouter()

@router.get("/taluk-summary", response_model=Dict[str, Any])
def get_taluk_summary(
    disease_id: int = Query(...),
    assessment_date: date = Query(...),
    db: Session = Depends(get_db)
):
    """
    Generates a structured analytical summary across all 11 Madurai Taluks
    for surveillance prioritization: counts of HIGH, MEDIUM, LOW risk zones,
    and average district risk score.
    """
    disease = db.get(Disease, disease_id)
    if not disease:
        raise HTTPException(status_code=404, detail="Disease not found.")

    results_by_taluk = risk_engine.evaluate_all_regions_for_date(
        db=db,
        disease_id=disease_id,
        assessment_date=assessment_date
    )

    high_count = sum(1 for r in results_by_taluk.values() if r["rule_based_level"] == "HIGH")
    med_count = sum(1 for r in results_by_taluk.values() if r["rule_based_level"] == "MEDIUM")
    low_count = sum(1 for r in results_by_taluk.values() if r["rule_based_level"] == "LOW")
    
    total_score = sum(r["rule_based_score"] for r in results_by_taluk.values())
    avg_score = round(total_score / len(results_by_taluk), 3) if results_by_taluk else 0.0

    return {
        "assessment_date": assessment_date.isoformat(),
        "disease_id": disease_id,
        "disease_name": disease.name,
        "total_taluks_evaluated": len(results_by_taluk),
        "high_risk_taluks_count": high_count,
        "medium_risk_taluks_count": med_count,
        "low_risk_taluks_count": low_count,
        "district_average_score": avg_score,
        "taluk_breakdown": list(results_by_taluk.values())
    }

@router.get("/export-csv")
def export_risk_csv(
    disease_id: int = Query(...),
    assessment_date: date = Query(...),
    db: Session = Depends(get_db)
):
    """Streams a formatted CSV report of the multi-taluk risk assessment"""
    disease = db.get(Disease, disease_id)
    if not disease:
        raise HTTPException(status_code=404, detail="Disease not found.")

    summary = get_taluk_summary(disease_id=disease_id, assessment_date=assessment_date, db=db)
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Taluk Name", "Assessment Date", "Disease", "Risk Score (0-1)",
        "Risk Level", "Consecutive Conducive Days", "Avg Min Temp (°C)", "Avg RH (%)", "Primary Driving Factor"
    ])

    for row in summary["taluk_breakdown"]:
        writer.writerow([
            row["taluk_name"],
            summary["assessment_date"],
            disease.name,
            row["rule_based_score"],
            row["rule_based_level"],
            row["consecutive_conducive_days"],
            row["avg_temp_min"] or "N/A",
            row["avg_rh"] or "N/A",
            row["primary_risk_factor"]
        ])

    csv_data = output.getvalue()
    filename = f"CropRisk_Atlas_{disease.name.replace(' ', '_')}_{assessment_date}.csv"
    
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
