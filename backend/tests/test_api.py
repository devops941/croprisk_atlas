import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as test_client:
        yield test_client

def test_health_check_endpoint(client):
    """Test health check returns healthy status"""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data

def test_spatial_geojson_taluks(client):
    """Test fetching Madurai Taluks GeoJSON"""
    response = client.get("/api/v1/spatial/madurai-taluks")
    assert response.status_code == 200
    geojson = response.json()
    assert geojson["type"] == "FeatureCollection"
    assert len(geojson["features"]) == 11
    
    first_feat = geojson["features"][0]
    assert "taluk_name" in first_feat["properties"]
    assert "centroid_lat" in first_feat["properties"]

def test_spatial_point_validation_endpoint(client):
    """Test GPS point validation endpoint"""
    # Valid point in Madurai North
    res_valid = client.post("/api/v1/spatial/validate-point", json={"latitude": 9.985, "longitude": 78.145})
    assert res_valid.status_code == 200
    data_valid = res_valid.json()
    assert data_valid["is_valid"] is True
    assert data_valid["taluk_name"] == "Madurai North"

    # Invalid point outside Madurai (Chennai)
    res_invalid = client.post("/api/v1/spatial/validate-point", json={"latitude": 13.0827, "longitude": 80.2707})
    assert res_invalid.status_code == 200
    data_invalid = res_invalid.json()
    assert data_invalid["is_valid"] is False
    assert "error_message" in data_invalid

def test_crops_and_diseases_endpoints(client):
    """Test query of crops and biological disease thresholds"""
    crops_res = client.get("/api/v1/crops")
    assert crops_res.status_code == 200
    crops = crops_res.json()
    assert len(crops) >= 1
    assert crops[0]["common_name"] == "Rice (Paddy)"

    diseases_res = client.get("/api/v1/diseases")
    assert diseases_res.status_code == 200
    diseases = diseases_res.json()
    assert len(diseases) == 2
    d_names = {d["name"] for d in diseases}
    assert "Rice Blast" in d_names
    assert "Brown Spot" in d_names

def test_create_and_query_observation_endpoint(client):
    """Test single observation submission with auto-PIP taluk resolution"""
    crops_res = client.get("/api/v1/crops").json()
    crop_id = crops_res[0]["id"]
    diseases_res = client.get("/api/v1/diseases").json()
    disease_id = diseases_res[0]["id"]

    payload = {
        "crop_id": crop_id,
        "disease_id": disease_id,
        "observation_date": "2026-11-23",
        "latitude": 10.035,   # In Melur
        "longitude": 78.335,
        "growth_stage": "Tillering",
        "disease_present": True,
        "severity_score_ses": 4,
        "incidence_percentage": 22.5,
        "observer_name": "Dr. K. Sundaram",
        "notes": "Spindle-shaped blast lesions noted in nursery plots.",
        "data_provenance": "REAL_FIELD_SURVEY"
    }

    create_res = client.post("/api/v1/data/observations", json=payload)
    assert create_res.status_code == 200
    obs_data = create_res.json()
    assert obs_data["id"] is not None
    assert obs_data["taluk_name"] == "Melur"
    assert obs_data["severity_score_ses"] == 4

    # Query observations
    query_res = client.get(f"/api/v1/data/observations?disease_id={disease_id}")
    assert query_res.status_code == 200
    obs_list = query_res.json()
    assert len(obs_list) >= 1
    assert any(o["id"] == obs_data["id"] for o in obs_list)

def test_risk_evaluate_and_map_layer_endpoints(client):
    """Test on-demand risk evaluation and Leaflet choropleth GeoJSON generation"""
    diseases_res = client.get("/api/v1/diseases").json()
    blast_id = [d["id"] for d in diseases_res if "Blast" in d["name"]][0]

    eval_payload = {
        "region_id": 1,
        "crop_id": 1,
        "disease_id": blast_id,
        "assessment_date": "2026-11-23"
    }

    eval_res = client.post("/api/v1/risk/evaluate", json=eval_payload)
    assert eval_res.status_code == 200
    eval_data = eval_res.json()
    assert "rule_based_score" in eval_data
    assert eval_data["rule_based_level"] in ("LOW", "MEDIUM", "HIGH")
    assert "triggered_rules" in eval_data

    # Map layer endpoint
    map_res = client.get(f"/api/v1/risk/map-layer?disease_id={blast_id}&assessment_date=2026-11-23")
    assert map_res.status_code == 200
    map_layer = map_res.json()
    assert map_layer["type"] == "FeatureCollection"
    assert len(map_layer["features"]) == 11
    for feat in map_layer["features"]:
        assert "risk_score" in feat["properties"]
        assert "risk_level" in feat["properties"]
        assert "fill_color" in feat["properties"]

def test_reports_summary_and_export_csv(client):
    """Test summary reports generation and CSV file streaming"""
    diseases_res = client.get("/api/v1/diseases").json()
    blast_id = diseases_res[0]["id"]

    # Summary JSON
    summary_res = client.get(f"/api/v1/reports/taluk-summary?disease_id={blast_id}&assessment_date=2026-11-23")
    assert summary_res.status_code == 200
    summary = summary_res.json()
    assert summary["total_taluks_evaluated"] == 11
    assert "district_average_score" in summary
    assert len(summary["taluk_breakdown"]) == 11

    # CSV Download
    csv_res = client.get(f"/api/v1/reports/export-csv?disease_id={blast_id}&assessment_date=2026-11-23")
    assert csv_res.status_code == 200
    assert csv_res.headers["content-type"].startswith("text/csv")
    csv_text = csv_res.text
    assert "Taluk Name,Assessment Date,Disease" in csv_text
    assert "Melur" in csv_text
    assert "Vadipatti" in csv_text
