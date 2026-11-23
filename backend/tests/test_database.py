import json
import pytest
from datetime import date
from sqlalchemy.exc import IntegrityError
from app.models import Region, Crop, Disease, WeatherRecord, FieldObservation, RiskAssessment
from app.db.seed_data import init_db

def test_database_seeding_madurai_taluks(db_session):
    """Verify that all 11 Taluks of Madurai are seeded with valid coordinates and boundaries"""
    init_db(db_session)
    
    regions = db_session.query(Region).all()
    assert len(regions) == 11, f"Expected 11 taluks for Madurai, got {len(regions)}"
    
    taluk_names = {r.taluk_name for r in regions}
    expected_taluks = {
        "Madurai North", "Madurai South", "Melur", "Vadipatti",
        "Thirumangalam", "Usilampatti", "Peraiyur", "Thirupparankundram",
        "Sedapatti", "Kalligudi", "T. Kallupatti"
    }
    assert expected_taluks == taluk_names
    
    for r in regions:
        assert 9.50 <= r.centroid_lat <= 10.35, f"Latitude {r.centroid_lat} outside Madurai range for {r.taluk_name}"
        assert 77.65 <= r.centroid_lon <= 78.50, f"Longitude {r.centroid_lon} outside Madurai range for {r.taluk_name}"
        assert r.boundary_geojson is not None
        geom = json.loads(r.boundary_geojson)
        assert geom["type"] == "Polygon"
        assert len(geom["coordinates"][0]) >= 4

def test_database_seeding_crops_and_diseases(db_session):
    """Verify that Rice and the initial two target diseases are seeded with scientific thresholds"""
    init_db(db_session)
    
    crop = db_session.query(Crop).filter(Crop.common_name == "Rice (Paddy)").first()
    assert crop is not None
    assert crop.scientific_name == "Oryza sativa"
    assert "Tillering" in crop.standard_growth_stages
    assert "Heading/Flowering" in crop.standard_growth_stages
    
    diseases = db_session.query(Disease).filter(Disease.crop_id == crop.id).all()
    assert len(diseases) == 2
    
    disease_map = {d.name: d for d in diseases}
    assert "Rice Blast" in disease_map
    assert "Brown Spot" in disease_map
    
    # Blast thresholds (TNAU / IRRI)
    blast = disease_map["Rice Blast"]
    assert blast.scientific_name == "Magnaporthe oryzae"
    assert blast.optimal_temp_min == 20.0
    assert blast.optimal_temp_max == 24.0
    assert blast.min_conducive_rh == 90.0
    
    # Brown spot thresholds (TNAU / IRRI)
    brown_spot = disease_map["Brown Spot"]
    assert brown_spot.scientific_name == "Bipolaris oryzae"
    assert brown_spot.optimal_temp_min == 25.0
    assert brown_spot.optimal_temp_max == 32.0
    assert brown_spot.min_conducive_rh == 85.0

def test_weather_record_unique_constraint(db_session):
    """Verify that weather records enforce uniqueness across region, date, and provenance"""
    init_db(db_session)
    region = db_session.query(Region).first()
    
    w1 = WeatherRecord(
        region_id=region.id,
        record_date=date(2026, 11, 23),
        temp_max=31.5,
        temp_min=22.0,
        temp_avg=26.5,
        rh_avg=88.0,
        rainfall_mm=2.5,
        data_provenance="PUBLIC_HISTORICAL_REANALYSIS"
    )
    db_session.add(w1)
    db_session.commit()
    
    # Attempting to insert duplicate for same region, date, and provenance should raise IntegrityError
    w2 = WeatherRecord(
        region_id=region.id,
        record_date=date(2026, 11, 23),
        temp_max=32.0,
        temp_min=21.5,
        temp_avg=26.0,
        rh_avg=85.0,
        rainfall_mm=0.0,
        data_provenance="PUBLIC_HISTORICAL_REANALYSIS"
    )
    db_session.add(w2)
    with pytest.raises(IntegrityError):
        db_session.commit()
    db_session.rollback()
