"""
CropRisk Atlas - MongoDB Synchronization Utility
Syncs all SQLite tabular data and Madurai GeoJSON spatial features into MongoDB collections
with standard GeoJSON geometries and 2dsphere spatial indexing.
"""

import sys
import json
from pathlib import Path
from pymongo import MongoClient, ASCENDING, GEOSPHERE

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.db.session import SessionLocal
from app.models.region import Region
from app.models.crop_disease import Crop, Disease
from app.models.weather import WeatherRecord
from app.models.observation import FieldObservation
from app.models.risk import RiskAssessment

def sync_to_mongodb(mongo_uri: str = "mongodb://localhost:27017/"):
    print("=" * 60)
    print("      CropRisk Atlas -> MongoDB Synchronization")
    print("=" * 60)
    print(f"Connecting to MongoDB at: {mongo_uri} ...")

    try:
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
        # Verify connection
        client.admin.command('ping')
        print(" Connected to MongoDB successfully!")
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {e}")
        print("Please ensure MongoDB Server is running on port 27017.")
        return False

    db = client["croprisk_atlas"]
    sqlite_db = SessionLocal()

    # Load GeoJSON features for Taluk polygons
    geojson_path = backend_dir / "static" / "geojson" / "madurai_taluks.geojson"
    taluk_polygons = {}
    if geojson_path.exists():
        with open(geojson_path, "r", encoding="utf-8") as f:
            gj = json.load(f)
            for feat in gj.get("features", []):
                tname = feat.get("properties", {}).get("taluk_name")
                if tname:
                    taluk_polygons[tname] = feat.get("geometry")

    try:
        # 1. Sync Taluks
        print("\n1. Syncing Taluks Collection...")
        taluks = sqlite_db.query(Region).all()
        taluk_docs = []
        for t in taluks:
            doc = {
                "taluk_id": t.id,
                "taluk_name": t.name,
                "district": t.district_name,
                "state": t.state_name,
                "agri_area_ha": t.agricultural_area_ha,
                "centroid": {
                    "type": "Point",
                    "coordinates": [t.centroid_lon, t.centroid_lat]
                } if t.centroid_lon and t.centroid_lat else None,
                "geometry": taluk_polygons.get(t.name)
            }
            taluk_docs.append(doc)

        db.taluks.drop()
        if taluk_docs:
            db.taluks.insert_many(taluk_docs)
            db.taluks.create_index([("taluk_name", ASCENDING)], unique=True)
            print(f"    Synced {len(taluk_docs)} Taluks into 'taluks' collection.")

        # 2. Sync Crops & Diseases
        print("\n2. Syncing Crops and Pathogens...")
        crops = sqlite_db.query(Crop).all()
        crop_docs = [{"crop_id": c.id, "common_name": c.common_name, "scientific_name": c.scientific_name, "standard_growth_stages": c.standard_growth_stages} for c in crops]
        db.crops.drop()
        if crop_docs:
            db.crops.insert_many(crop_docs)
            print(f"    Synced {len(crop_docs)} Crops into 'crops' collection.")

        diseases = sqlite_db.query(Disease).all()
        disease_docs = [{
            "disease_id": d.id,
            "crop_id": d.crop_id,
            "name": d.name,
            "scientific_name": d.scientific_name,
            "pathogen_type": d.pathogen_type,
            "optimal_temp_min": d.optimal_temp_min,
            "optimal_temp_max": d.optimal_temp_max,
            "min_conducive_rh": d.min_conducive_rh,
            "min_conducive_wetness_hours": d.min_conducive_wetness_hours
        } for d in diseases]
        db.diseases.drop()
        if disease_docs:
            db.diseases.insert_many(disease_docs)
            print(f"    Synced {len(disease_docs)} Diseases into 'diseases' collection.")

        # 3. Sync Weather Records
        print("\n3. Syncing Weather Records...")
        weather_records = sqlite_db.query(WeatherRecord).all()
        weather_docs = []
        for w in weather_records:
            tname = next((t.name for t in taluks if t.id == w.region_id), "Unknown")
            doc = {
                "record_id": w.id,
                "taluk_id": w.region_id,
                "taluk_name": tname,
                "record_date": w.record_date.isoformat() if hasattr(w.record_date, 'isoformat') else str(w.record_date),
                "temp_max": w.temp_max,
                "temp_min": w.temp_min,
                "temp_avg": w.temp_avg,
                "rh_morning": w.rh_morning,
                "rh_evening": w.rh_evening,
                "rh_avg": w.rh_avg,
                "rainfall_mm": w.rainfall_mm,
                "leaf_wetness_hours": w.leaf_wetness_hours_est,
                "solar_radiation": w.solar_radiation_mj,
                "data_provenance": w.data_provenance
            }
            weather_docs.append(doc)

        db.weather_records.drop()
        if weather_docs:
            db.weather_records.insert_many(weather_docs)
            db.weather_records.create_index([("taluk_name", ASCENDING), ("record_date", ASCENDING)])
            print(f"    Synced {len(weather_docs)} Weather Records into 'weather_records' collection.")

        # 4. Sync Field Scouting Observations with GeoJSON Point & 2dsphere Index
        print("\n4. Syncing Field Scouting Observations (with GeoJSON 2dsphere)...")
        observations = sqlite_db.query(FieldObservation).all()
        obs_docs = []
        for o in observations:
            tname = next((t.name for t in taluks if t.id == o.region_id), "Unknown")
            cname = next((c.common_name for c in crops if c.id == o.crop_id), "Rice")
            dname = next((d.name for d in diseases if d.id == o.disease_id), "Rice Blast")

            doc = {
                "observation_id": o.id,
                "taluk_id": o.region_id,
                "taluk_name": tname,
                "crop_id": o.crop_id,
                "crop_name": cname,
                "disease_id": o.disease_id,
                "disease_name": dname,
                "observation_date": o.observation_date.isoformat() if hasattr(o.observation_date, 'isoformat') else str(o.observation_date),
                "location": {
                    "type": "Point",
                    "coordinates": [round(float(o.longitude), 5), round(float(o.latitude), 5)]  # GeoJSON is [lon, lat]
                },
                "latitude": float(o.latitude),
                "longitude": float(o.longitude),
                "growth_stage": o.growth_stage,
                "disease_present": o.disease_present,
                "severity_score_ses": o.severity_score_ses,
                "incidence_percentage": o.incidence_percentage,
                "observer_name": o.observer_name,
                "notes": o.notes,
                "data_provenance": o.data_provenance
            }
            obs_docs.append(doc)

        db.observations.drop()
        if obs_docs:
            db.observations.insert_many(obs_docs)
            # Create 2dsphere spatial index for geospatial queries and MongoDB Compass visual map
            db.observations.create_index([("location", GEOSPHERE)])
            db.observations.create_index([("observation_date", ASCENDING)])
            print(f"    Synced {len(obs_docs)} Observations into 'observations' collection (2dsphere index created).")

        # 5. Sync Daily Risk Assessments
        print("\n5. Syncing Daily Epidemiological Risk Indices...")
        risks = sqlite_db.query(RiskAssessment).all()
        risk_docs = []
        for r in risks:
            tname = next((t.name for t in taluks if t.id == r.region_id), "Unknown")
            dname = next((d.name for d in diseases if d.id == r.disease_id), "Unknown")
            doc = {
                "assessment_id": r.id,
                "taluk_id": r.region_id,
                "taluk_name": tname,
                "crop_id": r.crop_id,
                "disease_id": r.disease_id,
                "disease_name": dname,
                "assessment_date": r.assessment_date.isoformat() if hasattr(r.assessment_date, 'isoformat') else str(r.assessment_date),
                "rule_based_score": r.rule_based_score,
                "rule_based_level": r.rule_based_level,
                "consecutive_conducive_days": r.consecutive_conducive_days,
                "primary_risk_factor": r.primary_risk_factor
            }
            risk_docs.append(doc)

        db.daily_risk_indices.drop()
        if risk_docs:
            db.daily_risk_indices.insert_many(risk_docs)
            db.daily_risk_indices.create_index([("assessment_date", ASCENDING), ("taluk_name", ASCENDING)])
            print(f"    Synced {len(risk_docs)} Risk Indices into 'daily_risk_indices' collection.")

        print("\n" + "=" * 60)
        print(" SUCCESS: Database 'croprisk_atlas' populated in MongoDB!")
        print("Collections now live in MongoDB Compass:")
        print("  - taluks              (11 administrative polygons)")
        print("  - crops               (Crop taxonomy)")
        print("  - diseases            (Pathogen thresholds)")
        print("  - weather_records     (Daily agro-meteorological feeds)")
        print("  - observations        (Ground truth GPS points + 2dsphere)")
        print("  - daily_risk_indices  (TNAU/IRRI calculated risk indices)")
        print("=" * 60)
        return True

    except Exception as e:
        print(f"❌ Error during sync: {e}")
        return False
    finally:
        sqlite_db.close()
        client.close()

if __name__ == "__main__":
    sync_to_mongodb()
