import pytest
from app.services.geospatial import geospatial_service

def test_madurai_bbox_filter():
    """Verify bounding box filter correctly classifies points inside/outside Madurai"""
    # Inside Madurai (Madurai City / Melur / Vadipatti)
    assert geospatial_service.is_within_madurai_bbox(9.925, 78.119) is True
    assert geospatial_service.is_within_madurai_bbox(10.035, 78.335) is True
    assert geospatial_service.is_within_madurai_bbox(9.715, 77.795) is True

    # Outside Madurai (Chennai, Bangalore, Coimbatore, Kanyakumari)
    assert geospatial_service.is_within_madurai_bbox(13.082, 80.270) is False  # Chennai
    assert geospatial_service.is_within_madurai_bbox(12.971, 77.594) is False  # Bangalore
    assert geospatial_service.is_within_madurai_bbox(11.016, 76.955) is False  # Coimbatore
    assert geospatial_service.is_within_madurai_bbox(8.088, 77.538) is False   # Kanyakumari

def test_point_in_polygon_taluk_assignment():
    """Verify Point-in-Polygon accurately assigns GPS coordinates to correct Madurai Taluk"""
    # 1. Melur coordinates: lat ~ 10.035, lon ~ 78.335
    match_melur = geospatial_service.find_taluk_for_point(10.035, 78.335)
    assert match_melur is not None
    assert match_melur["taluk_name"] == "Melur"
    assert match_melur["district"] == "Madurai"

    # 2. Vadipatti coordinates: lat ~ 10.065, lon ~ 77.965
    match_vadi = geospatial_service.find_taluk_for_point(10.065, 77.965)
    assert match_vadi is not None
    assert match_vadi["taluk_name"] == "Vadipatti"

    # 3. Madurai North coordinates: lat ~ 9.985, lon ~ 78.145
    match_north = geospatial_service.find_taluk_for_point(9.985, 78.145)
    assert match_north is not None
    assert match_north["taluk_name"] == "Madurai North"

def test_point_outside_madurai_returns_none():
    """Verify that coordinates outside Madurai fail spatial containment"""
    match_out = geospatial_service.find_taluk_for_point(11.5, 78.0) # Salem region
    assert match_out is None

def test_idw_interpolation_mathematical_precision():
    """Verify Inverse Distance Weighting interpolation precision and edge cases"""
    stations = [
        {"lat": 10.0, "lon": 78.0, "temp": 20.0},
        {"lat": 10.0, "lon": 78.2, "temp": 30.0}
    ]

    # Exact location match at Station 1
    val_at_s1 = geospatial_service.calculate_idw_interpolation(stations, 10.0, 78.0, "temp")
    assert val_at_s1 == 20.0

    # Exact location match at Station 2
    val_at_s2 = geospatial_service.calculate_idw_interpolation(stations, 10.0, 78.2, "temp")
    assert val_at_s2 == 30.0

    # Midpoint (10.0, 78.1) equidistant from both stations should equal 25.0
    val_mid = geospatial_service.calculate_idw_interpolation(stations, 10.0, 78.1, "temp")
    assert val_mid == 25.0

    # Point closer to Station 1 (10.0, 78.02) should be weighted closer to 20.0
    val_near_s1 = geospatial_service.calculate_idw_interpolation(stations, 10.0, 78.02, "temp")
    assert val_near_s1 < 22.0

def test_risk_choropleth_geojson_generation():
    """Verify that the GeoJSON FeatureCollection is enriched with risk scores and styling colors"""
    sample_risk = {
        "Melur": {
            "rule_based_score": 0.85,
            "rule_based_level": "HIGH",
            "primary_risk_factor": "Optimal night temperature and prolonged high humidity"
        },
        "Vadipatti": {
            "rule_based_score": 0.20,
            "rule_based_level": "LOW",
            "primary_risk_factor": "Dry atmosphere and high diurnal range"
        }
    }

    enriched_geojson = geospatial_service.generate_risk_choropleth_geojson(
        risk_by_taluk=sample_risk,
        assessment_date_str="2026-11-23",
        disease_name="Rice Blast"
    )

    assert enriched_geojson["type"] == "FeatureCollection"
    assert len(enriched_geojson["features"]) == 11

    features_by_name = {f["properties"]["taluk_name"]: f["properties"] for f in enriched_geojson["features"]}
    
    # Melur check
    melur_props = features_by_name["Melur"]
    assert melur_props["risk_score"] == 0.85
    assert melur_props["risk_level"] == "HIGH"
    assert melur_props["fill_color"] == "#dc3545" # Alert red

    # Vadipatti check
    vadi_props = features_by_name["Vadipatti"]
    assert vadi_props["risk_score"] == 0.20
    assert vadi_props["risk_level"] == "LOW"
    assert vadi_props["fill_color"] == "#28a745" # Safe green

    # Unrecorded taluk check
    unrecorded = features_by_name["Sedapatti"]
    assert unrecorded["risk_level"] == "NO_DATA"
    assert unrecorded["fill_color"] == "#6c757d"
