import pytest
from pathlib import Path
from app.db.seed_data import init_db
from app.services.ingestion import ingestion_service
from app.models import WeatherRecord, FieldObservation, UploadBatch, UploadError

def test_weather_csv_ingestion_valid(db_session):
    """Test ingestion of standard validated weather data from template"""
    init_db(db_session)
    
    template_path = Path(__file__).resolve().parent.parent.parent / "data" / "templates" / "weather_data_template.csv"
    assert template_path.exists(), f"Template CSV missing at {template_path}"
    
    with open(template_path, "rb") as f:
        content = f.read()
        
    summary = ingestion_service.ingest_weather_csv(
        db=db_session,
        file_content=content,
        file_name="weather_data_template.csv",
        default_provenance="PUBLIC_HISTORICAL_REANALYSIS"
    )
    
    assert summary.status == "SUCCESS"
    assert summary.valid_rows == 11
    assert summary.rejected_rows == 0
    assert len(summary.errors) == 0
    
    # Verify in DB
    records = db_session.query(WeatherRecord).all()
    assert len(records) == 11
    
    # Check one record values
    sample = records[0]
    assert sample.temp_max >= sample.temp_min
    assert sample.rh_avg > 0
    assert sample.data_provenance == "PUBLIC_HISTORICAL_REANALYSIS"

def test_weather_csv_ingestion_with_invalid_rows(db_session):
    """Test rejection of corrupted rows: invalid taluk, min_temp > max_temp, out-of-range RH"""
    init_db(db_session)
    
    bad_csv_content = (
        "taluk_name,record_date,temp_max,temp_min,temp_avg,rh_morning,rh_evening,rh_avg,rainfall_mm\n"
        "Madurai North,2026-10-15,31.2,21.5,25.8,92.0,68.0,84.5,1.2\n"  # Valid row
        "Atlantis Unknown,2026-10-15,30.0,22.0,26.0,90.0,70.0,80.0,0.0\n"  # Invalid taluk
        "Melur,2026-10-15,20.0,28.0,24.0,90.0,70.0,80.0,0.0\n"            # temp_min > temp_max
        "Vadipatti,2026-10-15,32.0,22.0,27.0,150.0,80.0,120.0,0.0\n"      # rh_avg > 100%
    ).encode("utf-8")
    
    summary = ingestion_service.ingest_weather_csv(
        db=db_session,
        file_content=bad_csv_content,
        file_name="bad_weather.csv"
    )
    
    assert summary.status == "PARTIAL"
    assert summary.total_rows == 4
    assert summary.valid_rows == 1
    assert summary.rejected_rows == 3
    assert len(summary.errors) >= 3
    
    # Verify error logs in DB
    errors = db_session.query(UploadError).all()
    assert len(errors) >= 3
    error_texts = [e.rejection_reason for e in errors]
    assert any("not recognized among the 11 Madurai Taluks" in t for t in error_texts)
    assert any("cannot exceed temp_max" in t for t in error_texts)
    assert any("must be between 0 and 100" in t for t in error_texts)

def test_observation_csv_ingestion_valid(db_session):
    """Test ingestion of field scouting observations with spatial point-in-polygon matching"""
    init_db(db_session)
    
    template_path = Path(__file__).resolve().parent.parent.parent / "data" / "templates" / "field_observations_template.csv"
    assert template_path.exists()
    
    with open(template_path, "rb") as f:
        content = f.read()
        
    summary = ingestion_service.ingest_observation_csv(
        db=db_session,
        file_content=content,
        file_name="field_observations_template.csv",
        default_provenance="USER_SCOUTED"
    )
    
    assert summary.status == "SUCCESS"
    assert summary.valid_rows == 5
    assert summary.rejected_rows == 0
    
    # Verify records stored and spatial region_id assigned
    obs_list = db_session.query(FieldObservation).all()
    assert len(obs_list) == 5
    for obs in obs_list:
        assert obs.region_id is not None
        assert obs.crop_id is not None
        assert obs.disease_id is not None
        assert 0 <= obs.severity_score_ses <= 9
        assert 0.0 <= obs.incidence_percentage <= 100.0

def test_observation_csv_rejection_outside_madurai(db_session):
    """Test that field observations with coordinates outside Madurai District boundary are rejected"""
    init_db(db_session)
    
    out_of_bounds_csv = (
        "taluk_name,observation_date,latitude,longitude,crop_name,disease_name,growth_stage,disease_present,severity_score_ses\n"
        "Madurai North,2026-10-18,9.985,78.145,Rice (Paddy),Rice Blast,Tillering,True,3\n" # Valid inside Madurai North
        "Chennai,2026-10-18,13.0827,80.2707,Rice (Paddy),Rice Blast,Tillering,True,4\n"     # In Chennai (Outside)
        "Coimbatore,2026-10-18,11.0168,76.9558,Rice (Paddy),Rice Blast,Tillering,True,2\n"  # In Coimbatore (Outside)
    ).encode("utf-8")
    
    summary = ingestion_service.ingest_observation_csv(
        db=db_session,
        file_content=out_of_bounds_csv,
        file_name="out_of_bounds.csv"
    )
    
    assert summary.status == "PARTIAL"
    assert summary.total_rows == 3
    assert summary.valid_rows == 1
    assert summary.rejected_rows == 2
    assert len(summary.errors) == 2
    for err in summary.errors:
        assert "outside Madurai District boundary" in err.rejection_reason
