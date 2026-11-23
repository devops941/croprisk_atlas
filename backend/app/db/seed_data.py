import json
from pathlib import Path
from sqlalchemy.orm import Session
from app.db.session import engine, SessionLocal
from app.db.base import Base
from app.models import Region, Crop, Disease, WeatherRecord, FieldObservation, RiskAssessment, UploadBatch, UploadError
from app.core.config import settings

def init_db(db: Session) -> None:
    """Create tables and seed reference data idempotently"""
    print("[Seed] Creating database tables...")
    Base.metadata.create_all(bind=engine)
    
    # 1. Seed Regions from Madurai Taluks GeoJSON
    geojson_path = settings.MADURAI_GEOJSON_PATH
    if geojson_path.exists():
        with open(geojson_path, "r", encoding="utf-8") as f:
            geojson_data = json.load(f)
            
        print(f"[Seed] Loading {len(geojson_data.get('features', []))} Taluks from GeoJSON...")
        for feature in geojson_data.get("features", []):
            props = feature.get("properties", {})
            taluk_name = props.get("taluk_name")
            
            existing = db.query(Region).filter(Region.taluk_name == taluk_name).first()
            if not existing:
                region = Region(
                    name=f"Madurai - {taluk_name}",
                    taluk_name=taluk_name,
                    district_name=props.get("district", "Madurai"),
                    state_name=props.get("state", "Tamil Nadu"),
                    boundary_geojson=json.dumps(feature.get("geometry")),
                    centroid_lat=props.get("centroid_lat"),
                    centroid_lon=props.get("centroid_lon"),
                    agricultural_area_ha=props.get("agri_area_ha", 0.0)
                )
                db.add(region)
        db.commit()
    else:
        print(f"[Warning] GeoJSON file not found at {geojson_path}")

    # 2. Seed Crop: Rice (Paddy)
    rice_crop = db.query(Crop).filter(Crop.common_name == "Rice (Paddy)").first()
    if not rice_crop:
        print("[Seed] Seeding Crop: Rice (Paddy)...")
        rice_crop = Crop(
            common_name="Rice (Paddy)",
            scientific_name="Oryza sativa",
            standard_growth_stages="Seedling/Nursery, Tillering, Stem Elongation, Panicle Initiation, Heading/Flowering, Milk/Dough, Maturity"
        )
        db.add(rice_crop)
        db.commit()
        db.refresh(rice_crop)

    # 3. Seed Target Diseases for Rice
    # 3.1 Rice Blast (Magnaporthe oryzae)
    rice_blast = db.query(Disease).filter(Disease.name == "Rice Blast", Disease.crop_id == rice_crop.id).first()
    if not rice_blast:
        print("[Seed] Seeding Disease: Rice Blast...")
        rice_blast = Disease(
            crop_id=rice_crop.id,
            name="Rice Blast",
            scientific_name="Magnaporthe oryzae",
            pathogen_type="Fungus (Ascomycete)",
            optimal_temp_min=20.0,
            optimal_temp_max=24.0,
            min_conducive_rh=90.0,
            min_conducive_wetness_hours=10.0,
            scientific_reference="TNAU Agritech Portal: Crop Protection (Paddy Blast); IRRI Standard Evaluation System for Rice (SES)."
        )
        db.add(rice_blast)

    # 3.2 Brown Spot (Bipolaris oryzae)
    brown_spot = db.query(Disease).filter(Disease.name == "Brown Spot", Disease.crop_id == rice_crop.id).first()
    if not brown_spot:
        print("[Seed] Seeding Disease: Brown Spot...")
        brown_spot = Disease(
            crop_id=rice_crop.id,
            name="Brown Spot",
            scientific_name="Bipolaris oryzae",
            pathogen_type="Fungus (Ascomycete)",
            optimal_temp_min=25.0,
            optimal_temp_max=32.0,
            min_conducive_rh=85.0,
            min_conducive_wetness_hours=8.0,
            scientific_reference="TNAU Agritech Portal: Crop Protection (Paddy Brown Spot); ICAR-IIRR AICRP Surveillance Guidelines."
        )
        db.add(brown_spot)

    db.commit()
    print("[Seed] Database initialization and reference seeding completed successfully.")

if __name__ == "__main__":
    db = SessionLocal()
    try:
        init_db(db)
    finally:
        db.close()
