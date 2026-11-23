import json
import pytest
from datetime import date, timedelta
from app.db.seed_data import init_db
from app.services.risk_engine import risk_engine
from app.models import Region, Crop, Disease, WeatherRecord, RiskAssessment

def test_blast_ideal_conditions_produce_high_risk():
    """Verify Rice Blast produces index 1.0 under ideal TNAU/IRRI meteorological conditions"""
    daily_idx, rules = risk_engine.calculate_daily_blast_index(
        temp_min=22.0,            # Ideal: 20-24°C
        rh_avg=93.0,              # Ideal: >= 90%
        leaf_wetness_hours=12.0,  # Ideal: >= 12h
        growth_stage="Tillering"  # Highly vulnerable stage
    )
    assert daily_idx == 1.0
    assert len(rules) >= 3
    assert any("Optimal minimum temperature" in r for r in rules)
    assert any("High relative humidity" in r for r in rules)

def test_blast_unfavorable_conditions_produce_zero_risk():
    """Verify Rice Blast produces index 0.0 under dry hot weather"""
    daily_idx, rules = risk_engine.calculate_daily_blast_index(
        temp_min=32.0,            # Too hot (> 28°C)
        rh_avg=55.0,              # Too dry (< 80%)
        leaf_wetness_hours=1.0,   # Negligible wetness
        growth_stage="Tillering"
    )
    assert daily_idx == 0.0

def test_brown_spot_ideal_conditions_produce_high_risk():
    """Verify Brown Spot produces high infection index at 28°C and high humidity"""
    daily_idx, rules = risk_engine.calculate_daily_brown_spot_index(
        temp_avg=28.0,            # Optimum: 26-30°C
        rh_avg=90.0,              # Conducive: >= 88%
        leaf_wetness_hours=10.0,  # Conducive: >= 10h
        growth_stage="Tillering"
    )
    assert daily_idx == 1.0
    assert len(rules) >= 3
    assert any("Optimal average temperature" in r for r in rules)
    assert any("relative humidity" in r for r in rules)

def test_cumulative_temporal_decay_weighting():
    """Verify recent weather has stronger weighting than older days"""
    # 5 days: Day 0 (today) is high, Day 4 (oldest) is low
    indices_recent_high = [1.0, 0.0, 0.0, 0.0, 0.0]
    score_recent = risk_engine.calculate_cumulative_risk(indices_recent_high)

    # Day 0 (today) is low, Day 4 (oldest) is high
    indices_old_high = [0.0, 0.0, 0.0, 0.0, 1.0]
    score_old = risk_engine.calculate_cumulative_risk(indices_old_high)

    assert score_recent > score_old
    assert score_recent == 0.35
    assert score_old == 0.10

def test_risk_band_classification():
    """Verify continuous scores map accurately to LOW, MEDIUM, HIGH bands"""
    assert risk_engine.classify_risk_band(0.0) == "LOW"
    assert risk_engine.classify_risk_band(0.34) == "LOW"
    assert risk_engine.classify_risk_band(0.35) == "MEDIUM"
    assert risk_engine.classify_risk_band(0.69) == "MEDIUM"
    assert risk_engine.classify_risk_band(0.70) == "HIGH"
    assert risk_engine.classify_risk_band(1.0) == "HIGH"

def test_evaluate_region_risk_db_integration(db_session):
    """Test full database integration: rolling weather window evaluation and persistence"""
    init_db(db_session)
    
    region = db_session.query(Region).filter(Region.taluk_name == "Melur").first()
    crop = db_session.query(Crop).filter(Crop.common_name == "Rice (Paddy)").first()
    disease = db_session.query(Disease).filter(Disease.name == "Rice Blast").first()

    today = date(2026, 11, 23)

    # Seed 5 consecutive days of conducive weather in Melur
    for i in range(5):
        w_date = today - timedelta(days=i)
        w = WeatherRecord(
            region_id=region.id,
            record_date=w_date,
            temp_max=30.0,
            temp_min=22.0,            # 22°C is optimal for blast
            temp_avg=26.0,
            rh_morning=94.0,          # 94% morning RH
            rh_evening=70.0,
            rh_avg=88.0,
            rainfall_mm=2.5,
            leaf_wetness_hours_est=11.5,
            data_provenance="PUBLIC_HISTORICAL_REANALYSIS"
        )
        db_session.add(w)
    db_session.commit()

    assessment = risk_engine.evaluate_region_risk(
        db=db_session,
        region_id=region.id,
        crop_id=crop.id,
        disease_id=disease.id,
        assessment_date=today
    )

    assert assessment is not None
    assert assessment.region_id == region.id
    assert assessment.disease_id == disease.id
    assert assessment.rule_based_score >= 0.60
    assert assessment.rule_based_level in ("MEDIUM", "HIGH")
    assert assessment.avg_temp_min_window == 22.0
    assert assessment.consecutive_conducive_days == 5
    
    # Check triggered rules JSON
    rules = json.loads(assessment.triggered_rules_json)
    assert len(rules) > 0

def test_evaluate_all_regions_for_date(db_session):
    """Test multi-taluk evaluation across all 11 Madurai taluks"""
    init_db(db_session)
    
    disease = db_session.query(Disease).filter(Disease.name == "Rice Blast").first()
    today = date(2026, 11, 23)

    results = risk_engine.evaluate_all_regions_for_date(
        db=db_session,
        disease_id=disease.id,
        assessment_date=today
    )

    assert len(results) == 11
    assert "Melur" in results
    assert "Madurai North" in results
    assert "Vadipatti" in results

    for taluk_name, res in results.items():
        assert "rule_based_score" in res
        assert "rule_based_level" in res
        assert "primary_risk_factor" in res
        assert res["rule_based_level"] in ("LOW", "MEDIUM", "HIGH")
