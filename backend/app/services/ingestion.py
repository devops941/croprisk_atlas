import io
import re
from datetime import datetime, date
from typing import Dict, Any, List, Optional
import pandas as pd
from sqlalchemy.orm import Session

from app.models import Region, Crop, Disease, WeatherRecord, FieldObservation, UploadBatch, UploadError
from app.services.geospatial import geospatial_service
from app.schemas.upload import UploadSummary, UploadErrorItem

class IngestionService:
    def __init__(self):
        self.geo = geospatial_service

    def _normalize_string(self, text: Optional[str]) -> str:
        if not text or pd.isna(text):
            return ""
        return str(text).strip()

    def _parse_date(self, val: Any) -> Optional[date]:
        if pd.isna(val) or val is None:
            return None
        if isinstance(val, date):
            return val
        if isinstance(val, datetime):
            return val.date()
        date_str = str(val).strip()
        for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y", "%Y/%m/%d"):
            try:
                return datetime.strptime(date_str, fmt).date()
            except ValueError:
                continue
        return None

    def _parse_bool(self, val: Any) -> bool:
        if pd.isna(val) or val is None:
            return False
        if isinstance(val, bool):
            return val
        val_str = str(val).strip().lower()
        return val_str in ("true", "1", "yes", "t", "y", "positive")

    # =========================================================================
    # 1. WEATHER CSV INGESTION
    # =========================================================================
    def ingest_weather_csv(
        self,
        db: Session,
        file_content: bytes,
        file_name: str,
        default_provenance: str = "PUBLIC_HISTORICAL_REANALYSIS"
    ) -> UploadSummary:
        """
        Parses, validates, and stores weather records from CSV.
        Maintains row-level error logs for any invalid rows.
        """
        batch = UploadBatch(
            file_name=file_name,
            batch_type="WEATHER_CSV",
            total_records=0,
            accepted_records=0,
            rejected_records=0,
            data_provenance=default_provenance
        )
        db.add(batch)
        db.commit()
        db.refresh(batch)

        try:
            df = pd.read_csv(io.BytesIO(file_content))
        except Exception as e:
            err = UploadError(
                batch_id=batch.id,
                row_index=0,
                field_name="file",
                invalid_value=file_name,
                rejection_reason=f"Failed to parse CSV file: {str(e)}"
            )
            db.add(err)
            batch.rejected_records = 1
            db.commit()
            return UploadSummary(
                batch_id=batch.id,
                status="FAILED",
                total_rows=0,
                valid_rows=0,
                rejected_rows=1,
                errors=[UploadErrorItem(row_index=0, field_name="file", invalid_value=file_name, rejection_reason=str(e))]
            )

        # Clean column headers
        df.columns = [str(c).strip().lower() for c in df.columns]
        required_cols = {"taluk_name", "record_date", "temp_max", "temp_min", "temp_avg", "rh_avg"}
        missing_cols = required_cols - set(df.columns)
        if missing_cols:
            err = UploadError(
                batch_id=batch.id,
                row_index=0,
                field_name="headers",
                invalid_value=", ".join(missing_cols),
                rejection_reason=f"Missing required columns in CSV header: {', '.join(missing_cols)}"
            )
            db.add(err)
            batch.rejected_records = len(df)
            db.commit()
            return UploadSummary(
                batch_id=batch.id,
                status="FAILED",
                total_rows=len(df),
                valid_rows=0,
                rejected_rows=len(df),
                errors=[UploadErrorItem(row_index=0, field_name="headers", rejection_reason=f"Missing columns: {missing_cols}")]
            )

        # Region cache
        regions = {r.taluk_name.lower(): r.id for r in db.query(Region).all()}

        accepted = 0
        rejected = 0
        collected_errors: List[UploadErrorItem] = []

        for idx, row in df.iterrows():
            row_num = idx + 2 # Accounting for 1-based index and header line
            row_errors: List[str] = []

            # 1. Taluk Resolution
            raw_taluk = self._normalize_string(row.get("taluk_name"))
            region_id = regions.get(raw_taluk.lower())
            if not region_id:
                row_errors.append(f"Taluk '{raw_taluk}' is not recognized among the 11 Madurai Taluks.")

            # 2. Date Validation
            rec_date = self._parse_date(row.get("record_date"))
            if not rec_date:
                row_errors.append(f"Invalid record_date '{row.get('record_date')}'. Must be YYYY-MM-DD.")

            # 3. Numeric Ranges Validation
            try:
                temp_max = float(row.get("temp_max"))
                temp_min = float(row.get("temp_min"))
                temp_avg = float(row.get("temp_avg"))
                rh_avg = float(row.get("rh_avg"))

                if temp_min > temp_max:
                    row_errors.append(f"temp_min ({temp_min}°C) cannot exceed temp_max ({temp_max}°C).")
                if not (-5.0 <= temp_min <= 55.0) or not (-5.0 <= temp_max <= 55.0):
                    row_errors.append("Temperatures outside plausible Tamil Nadu range (-5°C to 55°C).")
                if not (0.0 <= rh_avg <= 100.0):
                    row_errors.append(f"rh_avg ({rh_avg}%) must be between 0 and 100.")
            except (ValueError, TypeError) as e:
                row_errors.append(f"Invalid numerical temperature/humidity values: {str(e)}")
                temp_max, temp_min, temp_avg, rh_avg = 0.0, 0.0, 0.0, 0.0

            # Optional fields
            def safe_float(val: Any, default: float = 0.0, min_val: float = None, max_val: float = None) -> Optional[float]:
                if pd.isna(val) or val is None or val == "":
                    return default
                try:
                    f = float(val)
                    if min_val is not None and f < min_val:
                        return min_val
                    if max_val is not None and f > max_val:
                        return max_val
                    return f
                except (ValueError, TypeError):
                    return default

            rh_morning = safe_float(row.get("rh_morning"), None, 0.0, 100.0)
            rh_evening = safe_float(row.get("rh_evening"), None, 0.0, 100.0)
            rainfall_mm = safe_float(row.get("rainfall_mm"), 0.0, 0.0, 1000.0)
            wind_speed = safe_float(row.get("wind_speed_kmh"), 0.0, 0.0, 250.0)
            leaf_wetness = safe_float(row.get("leaf_wetness_hours_est"), 0.0, 0.0, 24.0)
            solar_rad = safe_float(row.get("solar_radiation_mj"), None, 0.0, 50.0)
            provenance = self._normalize_string(row.get("data_provenance")) or default_provenance

            if row_errors:
                rejected += 1
                for re_text in row_errors:
                    err = UploadError(
                        batch_id=batch.id,
                        row_index=row_num,
                        field_name="row",
                        invalid_value=str(raw_taluk),
                        rejection_reason=re_text
                    )
                    db.add(err)
                    collected_errors.append(UploadErrorItem(
                        row_index=row_num,
                        field_name="row",
                        invalid_value=str(raw_taluk),
                        rejection_reason=re_text
                    ))
                continue

            # Update or Insert Weather Record
            existing = db.query(WeatherRecord).filter(
                WeatherRecord.region_id == region_id,
                WeatherRecord.record_date == rec_date,
                WeatherRecord.data_provenance == provenance
            ).first()

            if existing:
                existing.temp_max = temp_max
                existing.temp_min = temp_min
                existing.temp_avg = temp_avg
                existing.rh_morning = rh_morning
                existing.rh_evening = rh_evening
                existing.rh_avg = rh_avg
                existing.rainfall_mm = rainfall_mm
                existing.wind_speed_kmh = wind_speed
                existing.leaf_wetness_hours_est = leaf_wetness
                existing.solar_radiation_mj = solar_rad
            else:
                new_rec = WeatherRecord(
                    region_id=region_id,
                    record_date=rec_date,
                    temp_max=temp_max,
                    temp_min=temp_min,
                    temp_avg=temp_avg,
                    rh_morning=rh_morning,
                    rh_evening=rh_evening,
                    rh_avg=rh_avg,
                    rainfall_mm=rainfall_mm,
                    wind_speed_kmh=wind_speed,
                    leaf_wetness_hours_est=leaf_wetness,
                    solar_radiation_mj=solar_rad,
                    data_provenance=provenance
                )
                db.add(new_rec)
            accepted += 1

        batch.total_records = len(df)
        batch.accepted_records = accepted
        batch.rejected_records = rejected
        db.commit()

        return UploadSummary(
            batch_id=batch.id,
            status="SUCCESS" if rejected == 0 else ("PARTIAL" if accepted > 0 else "FAILED"),
            total_rows=len(df),
            valid_rows=accepted,
            rejected_rows=rejected,
            errors=collected_errors
        )

    # =========================================================================
    # 2. FIELD OBSERVATION CSV INGESTION
    # =========================================================================
    def ingest_observation_csv(
        self,
        db: Session,
        file_content: bytes,
        file_name: str,
        default_provenance: str = "USER_SCOUTED"
    ) -> UploadSummary:
        """
        Parses, validates, coordinates-checks, and stores field scouting records from CSV.
        Auto-associates coordinates with enclosing Madurai Taluks via Point-in-Polygon.
        """
        batch = UploadBatch(
            file_name=file_name,
            batch_type="OBSERVATION_CSV",
            total_records=0,
            accepted_records=0,
            rejected_records=0,
            data_provenance=default_provenance
        )
        db.add(batch)
        db.commit()
        db.refresh(batch)

        try:
            df = pd.read_csv(io.BytesIO(file_content))
        except Exception as e:
            err = UploadError(
                batch_id=batch.id,
                row_index=0,
                field_name="file",
                invalid_value=file_name,
                rejection_reason=f"Failed to parse CSV file: {str(e)}"
            )
            db.add(err)
            batch.rejected_records = 1
            db.commit()
            return UploadSummary(
                batch_id=batch.id,
                status="FAILED",
                total_rows=0,
                valid_rows=0,
                rejected_rows=1,
                errors=[UploadErrorItem(row_index=0, field_name="file", rejection_reason=str(e))]
            )

        df.columns = [str(c).strip().lower() for c in df.columns]
        required_cols = {"observation_date", "latitude", "longitude", "crop_name", "disease_name", "growth_stage"}
        missing_cols = required_cols - set(df.columns)
        if missing_cols:
            err = UploadError(
                batch_id=batch.id,
                row_index=0,
                field_name="headers",
                invalid_value=", ".join(missing_cols),
                rejection_reason=f"Missing required columns in CSV header: {', '.join(missing_cols)}"
            )
            db.add(err)
            batch.rejected_records = len(df)
            db.commit()
            return UploadSummary(
                batch_id=batch.id,
                status="FAILED",
                total_rows=len(df),
                valid_rows=0,
                rejected_rows=len(df),
                errors=[UploadErrorItem(row_index=0, field_name="headers", rejection_reason=f"Missing columns: {missing_cols}")]
            )

        # Cache lookups
        crops = {c.common_name.lower(): c.id for c in db.query(Crop).all()}
        diseases = {d.name.lower(): (d.id, d.crop_id) for d in db.query(Disease).all()}
        regions_by_name = {r.taluk_name.lower(): r.id for r in db.query(Region).all()}

        accepted = 0
        rejected = 0
        collected_errors: List[UploadErrorItem] = []

        for idx, row in df.iterrows():
            row_num = idx + 2
            row_errors: List[str] = []

            # 1. Date
            obs_date = self._parse_date(row.get("observation_date"))
            if not obs_date:
                row_errors.append(f"Invalid observation_date '{row.get('observation_date')}'.")

            # 2. Coordinates & Spatial Assignment
            try:
                lat = float(row.get("latitude"))
                lon = float(row.get("longitude"))
                
                taluk_match = self.geo.find_taluk_for_point(lat, lon)
                if not taluk_match:
                    row_errors.append(f"Coordinates ({lat}, {lon}) are outside Madurai District boundary.")
                    region_id = None
                else:
                    region_id = regions_by_name.get(taluk_match["taluk_name"].lower())
            except (ValueError, TypeError):
                row_errors.append(f"Invalid latitude/longitude: '{row.get('latitude')}', '{row.get('longitude')}'.")
                region_id = None

            # 3. Crop & Disease Resolution
            raw_crop = self._normalize_string(row.get("crop_name"))
            crop_id = crops.get(raw_crop.lower())
            if not crop_id:
                # Default fallback or error
                crop_id = crops.get("rice (paddy)")
                if not crop_id:
                    row_errors.append(f"Crop '{raw_crop}' not recognized in knowledge base.")

            raw_disease = self._normalize_string(row.get("disease_name"))
            disease_entry = diseases.get(raw_disease.lower())
            if not disease_entry:
                row_errors.append(f"Disease '{raw_disease}' not recognized in database.")
                disease_id = None
            else:
                disease_id, expected_crop_id = disease_entry
                if crop_id and expected_crop_id != crop_id:
                    row_errors.append(f"Disease '{raw_disease}' does not infect crop '{raw_crop}'.")

            # 4. Severity & Growth Stage
            growth_stage = self._normalize_string(row.get("growth_stage")) or "Tillering"
            disease_present = self._parse_bool(row.get("disease_present"))
            
            try:
                ses_score = int(row.get("severity_score_ses", 0))
                if not (0 <= ses_score <= 9):
                    row_errors.append(f"IRRI SES severity_score ({ses_score}) must be between 0 and 9.")
            except (ValueError, TypeError):
                ses_score = 0
                row_errors.append(f"Invalid severity_score_ses: '{row.get('severity_score_ses')}'.")

            try:
                incidence_pct = float(row.get("incidence_percentage", 0.0))
                if not (0.0 <= incidence_pct <= 100.0):
                    row_errors.append(f"Incidence percentage ({incidence_pct}%) must be between 0 and 100.")
            except (ValueError, TypeError):
                incidence_pct = 0.0

            observer_name = self._normalize_string(row.get("observer_name")) or "Field Extension Officer"
            notes = self._normalize_string(row.get("notes")) or None
            provenance = self._normalize_string(row.get("data_provenance")) or default_provenance

            if row_errors or not region_id or not disease_id or not crop_id:
                rejected += 1
                for re_text in row_errors:
                    err = UploadError(
                        batch_id=batch.id,
                        row_index=row_num,
                        field_name="observation_row",
                        invalid_value=f"{raw_crop} / {raw_disease}",
                        rejection_reason=re_text
                    )
                    db.add(err)
                    collected_errors.append(UploadErrorItem(
                        row_index=row_num,
                        field_name="observation_row",
                        invalid_value=f"{raw_crop} / {raw_disease}",
                        rejection_reason=re_text
                    ))
                continue

            # Persist observation
            obs = FieldObservation(
                region_id=region_id,
                crop_id=crop_id,
                disease_id=disease_id,
                observation_date=obs_date,
                latitude=lat,
                longitude=lon,
                growth_stage=growth_stage,
                disease_present=disease_present,
                severity_score_ses=ses_score,
                incidence_percentage=incidence_pct,
                observer_name=observer_name,
                notes=notes,
                data_provenance=provenance
            )
            db.add(obs)
            accepted += 1

        batch.total_records = len(df)
        batch.accepted_records = accepted
        batch.rejected_records = rejected
        db.commit()

        return UploadSummary(
            batch_id=batch.id,
            status="SUCCESS" if rejected == 0 else ("PARTIAL" if accepted > 0 else "FAILED"),
            total_rows=len(df),
            valid_rows=accepted,
            rejected_rows=rejected,
            errors=collected_errors
        )

# Singleton instance
ingestion_service = IngestionService()
