import pytest
from datetime import date, timedelta
from app.db.seed_data import init_db
from app.models import Region, WeatherRecord, Disease
from app.services.ml_engine import ml_risk_engine

def test_environmental_feature_extraction(db_session):
    """Test extracting multi-day rolling environmental features"""
    init_db(db_session)
    region = db_session.query(Region).first()

    today = date(2026, 11, 23)
    records = []
    for i in range(5):
        w = WeatherRecord(
            region_id=region.id,
            record_date=today - timedelta(days=i),
            temp_max=31.0 + i * 0.2,
            temp_min=21.0 - i * 0.1,
            temp_avg=26.0,
            rh_morning=92.0,
            rh_avg=88.0,
            rainfall_mm=3.0,
            leaf_wetness_hours_est=11.0,
            data_provenance="PUBLIC_HISTORICAL_REANALYSIS"
        )
        records.append(w)

    features = ml_risk_engine.extract_environmental_features(records, growth_stage="Tillering")
    assert features is not None
    assert "temp_min_mean_3d" in features
    assert "rh_avg_mean_3d" in features
    assert "diurnal_range_3d" in features
    assert "consecutive_conducive_days" in features
    assert "thermal_humidity_index" in features
    assert features["stage_susceptibility"] == 1.0
    assert features["consecutive_conducive_days"] >= 3

def test_spatial_cross_validation_and_training(db_session):
    """Test Spatial GroupKFold cross-validation across Madurai Taluks"""
    init_db(db_session)
    disease = db_session.query(Disease).filter(Disease.name == "Rice Blast").first()

    results = ml_risk_engine.train_and_evaluate(db=db_session, disease_id=disease.id)

    assert results["status"] == "SUCCESS"
    assert results["model_type"] == "RandomForestClassifier"
    
    spatial_val = results["spatial_validation"]
    assert "Spatial GroupKFold" in spatial_val["validation_protocol"]
    assert spatial_val["n_splits"] >= 2
    assert 0.0 <= spatial_val["mean_f1_score"] <= 1.0
    assert 0.0 <= spatial_val["mean_pr_auc"] <= 1.0
    assert 0.0 <= spatial_val["mean_brier_score"] <= 1.0
    assert len(spatial_val["fold_f1_scores"]) == spatial_val["n_splits"]

    # Verify feature importance ranking
    fi = results["feature_importance"]
    assert len(fi) == len(ml_risk_engine.FEATURE_NAMES)
    top_feature = list(fi.keys())[0]
    assert fi[top_feature] > 0.0

def test_ml_inference_prediction(db_session):
    """Test model probability inference and calibration"""
    init_db(db_session)
    disease = db_session.query(Disease).first()
    ml_risk_engine.train_and_evaluate(db=db_session, disease_id=disease.id)

    # Conducive features (blast outbreak scenario)
    conducive_feats = {
        "temp_min_mean_3d": 21.5,
        "temp_max_mean_3d": 30.5,
        "temp_avg_mean_3d": 26.0,
        "diurnal_range_3d": 9.0,
        "rh_avg_mean_3d": 92.0,
        "rh_morning_mean_3d": 95.0,
        "rainfall_sum_5d": 18.0,
        "leaf_wetness_mean_3d": 12.0,
        "consecutive_conducive_days": 4.0,
        "thermal_humidity_index": 76.5,
        "stage_susceptibility": 1.0
    }

    pred_high = ml_risk_engine.predict_risk(conducive_feats)
    assert pred_high["status"] == "PREDICTION_COMPLETED"
    assert 0.0 <= pred_high["ml_predicted_score"] <= 1.0
    assert pred_high["ml_predicted_level"] in ("MEDIUM", "HIGH")

    # Dry suppressive scenario
    dry_feats = {
        "temp_min_mean_3d": 29.0,
        "temp_max_mean_3d": 38.0,
        "temp_avg_mean_3d": 33.5,
        "diurnal_range_3d": 9.0,
        "rh_avg_mean_3d": 55.0,
        "rh_morning_mean_3d": 62.0,
        "rainfall_sum_5d": 0.0,
        "leaf_wetness_mean_3d": 1.0,
        "consecutive_conducive_days": 0.0,
        "thermal_humidity_index": 82.0,
        "stage_susceptibility": 0.5
    }

    pred_low = ml_risk_engine.predict_risk(dry_feats)
    assert pred_low["status"] == "PREDICTION_COMPLETED"
    assert pred_low["ml_predicted_score"] < pred_high["ml_predicted_score"]
    assert pred_low["ml_predicted_level"] == "LOW"
