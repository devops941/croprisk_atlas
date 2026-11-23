import io
from pathlib import Path
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.seed_data import init_db
from app.db.session import SessionLocal

@pytest.fixture(scope="module")
def client():
    db = SessionLocal()
    try:
        init_db(db)
    finally:
        db.close()
    with TestClient(app) as test_client:
        yield test_client

def test_complete_surveillance_pipeline_e2e(client):
    """
    End-to-End Integration Test:
    CSV Upload -> PIP Spatial Mapping -> Epidemiological Rule Execution -> 
    ML Spatial Training -> Choropleth Map Layer Generation -> Area-wise CSV Report Export
    """
    # 1. Ingest Weather Dataset from template
    weather_csv_path = Path(__file__).resolve().parent.parent.parent / "data" / "templates" / "weather_data_template.csv"
    assert weather_csv_path.exists()
    
    with open(weather_csv_path, "rb") as f:
        weather_bytes = f.read()

    upload_weather_res = client.post(
        "/api/v1/data/upload-weather",
        files={"file": ("weather_data_template.csv", weather_bytes, "text/csv")},
        data={"provenance": "PUBLIC_HISTORICAL_REANALYSIS"}
    )
    assert upload_weather_res.status_code == 200
    w_summary = upload_weather_res.json()
    assert w_summary["status"] == "SUCCESS"
    assert w_summary["valid_rows"] == 11
    assert w_summary["rejected_rows"] == 0

    # 2. Ingest Field Scouting Observations from template
    obs_csv_path = Path(__file__).resolve().parent.parent.parent / "data" / "templates" / "field_observations_template.csv"
    assert obs_csv_path.exists()

    with open(obs_csv_path, "rb") as f:
        obs_bytes = f.read()

    upload_obs_res = client.post(
        "/api/v1/data/upload-observations",
        files={"file": ("field_observations_template.csv", obs_bytes, "text/csv")},
        data={"provenance": "REAL_FIELD_SURVEY"}
    )
    assert upload_obs_res.status_code == 200
    o_summary = upload_obs_res.json()
    assert o_summary["status"] == "SUCCESS"
    assert o_summary["valid_rows"] == 5

    # 3. Train Machine Learning Model with Spatial GroupKFold Cross-Validation
    train_res = client.post("/api/v1/risk/train-ml?disease_id=1")
    assert train_res.status_code == 200
    train_metrics = train_res.json()
    assert train_metrics["status"] == "SUCCESS"
    assert "spatial_validation" in train_metrics
    assert train_metrics["spatial_validation"]["mean_pr_auc"] >= 0.0

    # 4. Generate Enriched Choropleth GeoJSON Map Layer
    map_res = client.get("/api/v1/risk/map-layer?disease_id=1&assessment_date=2026-10-15")
    assert map_res.status_code == 200
    map_layer = map_res.json()
    assert map_layer["type"] == "FeatureCollection"
    assert len(map_layer["features"]) == 11

    # Verify each taluk feature contains both deterministic rule scores and styling
    for feat in map_layer["features"]:
        props = feat["properties"]
        assert "taluk_name" in props
        assert "risk_score" in props
        assert "risk_level" in props
        assert props["risk_level"] in ("LOW", "MEDIUM", "HIGH")
        assert props["fill_color"] in ("#28a745", "#ffc107", "#dc3545")
        assert "primary_risk_factor" in props

    # 5. Retrieve District Area-wise Summary Report
    summary_res = client.get("/api/v1/reports/taluk-summary?disease_id=1&assessment_date=2026-10-15")
    assert summary_res.status_code == 200
    summary = summary_res.json()
    assert summary["total_taluks_evaluated"] == 11
    assert summary["high_risk_taluks_count"] + summary["medium_risk_taluks_count"] + summary["low_risk_taluks_count"] == 11
    assert len(summary["taluk_breakdown"]) == 11

    # 6. Export Downloadable CSV Dossier
    export_csv_res = client.get("/api/v1/reports/export-csv?disease_id=1&assessment_date=2026-10-15")
    assert export_csv_res.status_code == 200
    assert export_csv_res.headers["content-type"].startswith("text/csv")
    csv_content = export_csv_res.text
    assert "Taluk Name,Assessment Date,Disease" in csv_content
    assert "Madurai North" in csv_content
    assert "Melur" in csv_content
    assert "Vadipatti" in csv_content
