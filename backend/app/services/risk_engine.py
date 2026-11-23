import json
from datetime import date, timedelta
from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models import Region, Crop, Disease, WeatherRecord, FieldObservation, RiskAssessment

class EpidemiologicalRiskEngine:
    """
    Scientific Rule-Based Disease Risk Calculation Engine
    Implements published agronomic thresholds from Tamil Nadu Agricultural University (TNAU)
    and International Rice Research Institute (IRRI) for Rice Blast and Brown Spot.
    """

    # Stage susceptibility weights for Rice Blast (Tillering & Heading/Panicle Initiation are most vulnerable)
    BLAST_STAGE_FACTORS = {
        "tillering": 1.0,           # Highly vulnerable to Leaf Blast
        "heading/flowering": 1.0,   # Highly vulnerable to Neck/Panicle Blast
        "panicle initiation": 0.95, # Highly vulnerable to Panicle Blast
        "booting": 0.90,
        "stem elongation": 0.80,
        "milk/dough": 0.50,
        "seedling/nursery": 0.40,
        "maturity": 0.10,
    }

    # Stage susceptibility weights for Brown Spot (Maximum tillering through grain filling)
    BROWN_SPOT_STAGE_FACTORS = {
        "tillering": 1.0,
        "stem elongation": 0.95,
        "panicle initiation": 0.95,
        "heading/flowering": 0.90,
        "milk/dough": 0.85,
        "seedling/nursery": 0.40,
        "maturity": 0.20,
    }

    # 5-day rolling weights with higher decay priority on recent weather (t, t-1, t-2, t-3, t-4)
    ROLLING_WEIGHTS = [0.35, 0.25, 0.20, 0.10, 0.10]

    # =========================================================================
    # LEAF WETNESS DURATION (LWD) PROXY ESTIMATOR
    # =========================================================================
    @staticmethod
    def estimate_leaf_wetness_hours(
        rh_morning: Optional[float],
        rh_avg: float,
        rainfall_mm: float,
        temp_min: float
    ) -> float:
        """
        Estimates daily leaf wetness duration (hours) from agro-climatic proxies
        when direct sensor measurements are unavailable.
        """
        effective_rh = rh_morning if rh_morning is not None and rh_morning > 0 else rh_avg
        lwd = 0.0

        if effective_rh >= 95.0:
            lwd += 11.0
        elif effective_rh >= 90.0:
            lwd += 9.0
        elif effective_rh >= 85.0:
            lwd += 6.0
        elif effective_rh >= 80.0:
            lwd += 3.0

        # Rain contribution: rainfall sustains moisture film on leaves
        if rainfall_mm >= 10.0:
            lwd += 4.0
        elif rainfall_mm >= 2.0:
            lwd += 2.5
        elif rainfall_mm > 0.0:
            lwd += 1.0

        # Cool night temperature promotes dew condensation
        if temp_min <= 22.0 and effective_rh >= 85.0:
            lwd += 2.0

        return min(24.0, round(lwd, 1))

    # =========================================================================
    # 1. RICE BLAST (Magnaporthe oryzae) DAILY INFECTION INDEX
    # =========================================================================
    def calculate_daily_blast_index(
        self,
        temp_min: float,
        rh_avg: float,
        rh_morning: Optional[float] = None,
        leaf_wetness_hours: Optional[float] = None,
        rainfall_mm: float = 0.0,
        growth_stage: str = "Tillering"
    ) -> Tuple[float, List[str]]:
        """
        Computes Daily Blast Infection Index (DBII) in [0.0, 1.0].
        
        Agronomic Rules (TNAU / IRRI):
        - Optimal Night Temperature (T_min): 20°C - 24°C (conducive: 18°C - 26°C)
        - Relative Humidity (RH): >= 90% (critical for sporulation & appressorium formation)
        - Leaf Wetness Duration (LWD): >= 10 hours
        """
        triggered_rules: List[str] = []

        # Temperature Factor f_T
        if 20.0 <= temp_min <= 24.0:
            f_temp = 1.0
            triggered_rules.append(f"Optimal minimum temperature ({temp_min}°C) for blast spore germination and appressoria.")
        elif (18.0 <= temp_min < 20.0) or (24.0 < temp_min <= 26.0):
            f_temp = 0.7
            triggered_rules.append(f"Permissible minimum temperature ({temp_min}°C) moderately conducive to blast.")
        elif (16.0 <= temp_min < 18.0) or (26.0 < temp_min <= 28.0):
            f_temp = 0.2
            triggered_rules.append(f"Sub-optimal minimum temperature ({temp_min}°C) minimally conducive to blast.")
        else:
            f_temp = 0.0

        # Humidity Factor f_H (prefer morning RH if available)
        rh_val = rh_morning if rh_morning is not None and rh_morning > 0 else rh_avg
        if rh_val >= 90.0:
            f_rh = 1.0
            triggered_rules.append(f"High relative humidity ({rh_val}%) conducive to blast conidial discharge.")
        elif 85.0 <= rh_val < 90.0:
            f_rh = 0.6
            triggered_rules.append(f"Moderate-high relative humidity ({rh_val}%) partially conducive to blast.")
        elif 80.0 <= rh_val < 85.0:
            f_rh = 0.2
        else:
            f_rh = 0.0

        # Leaf Wetness Duration Factor f_W
        lwd = leaf_wetness_hours if (leaf_wetness_hours is not None and leaf_wetness_hours > 0) else self.estimate_leaf_wetness_hours(rh_morning, rh_avg, rainfall_mm, temp_min)
        if lwd >= 12.0:
            f_wet = 1.0
            triggered_rules.append(f"Prolonged leaf wetness ({lwd} hrs >= 12 hrs) ensures complete mycelial penetration.")
        elif 10.0 <= lwd < 12.0:
            f_wet = 0.7
            triggered_rules.append(f"Adequate leaf wetness ({lwd} hrs >= 10 hrs) satisfies minimum blast infection threshold.")
        elif 6.0 <= lwd < 10.0:
            f_wet = 0.3
        else:
            f_wet = 0.0

        # Crop Stage Factor C_s
        stage_key = str(growth_stage).strip().lower()
        stage_factor = self.BLAST_STAGE_FACTORS.get(stage_key, 0.8)

        # Composite Daily Index
        daily_index = f_temp * f_rh * f_wet * stage_factor
        return round(daily_index, 4), triggered_rules

    # =========================================================================
    # 2. BROWN SPOT (Bipolaris oryzae) DAILY INFECTION INDEX
    # =========================================================================
    def calculate_daily_brown_spot_index(
        self,
        temp_avg: float,
        rh_avg: float,
        leaf_wetness_hours: Optional[float] = None,
        rh_morning: Optional[float] = None,
        rainfall_mm: float = 0.0,
        temp_min: float = 24.0,
        growth_stage: str = "Tillering"
    ) -> Tuple[float, List[str]]:
        """
        Computes Daily Brown Spot Infection Index (DBSII) in [0.0, 1.0].
        
        Agronomic Rules (TNAU / IRRI):
        - Optimal Average Temperature (T_avg): 26°C - 30°C (conducive: 24°C - 32°C)
        - Relative Humidity (RH): >= 85%
        - Leaf Wetness Duration (LWD): >= 8 hours
        """
        triggered_rules: List[str] = []

        # Temperature Factor g_T
        if 26.0 <= temp_avg <= 30.0:
            g_temp = 1.0
            triggered_rules.append(f"Optimal average temperature ({temp_avg}°C) for Bipolaris oryzae germination.")
        elif (24.0 <= temp_avg < 26.0) or (30.0 < temp_avg <= 32.0):
            g_temp = 0.8
            triggered_rules.append(f"Favorable temperature ({temp_avg}°C) for brown spot lesion expansion.")
        elif (22.0 <= temp_avg < 24.0) or (32.0 < temp_avg <= 34.0):
            g_temp = 0.3
        else:
            g_temp = 0.0

        # Humidity Factor g_H
        if rh_avg >= 88.0:
            g_rh = 1.0
            triggered_rules.append(f"High relative humidity ({rh_avg}%) provides ideal moisture for spore germination.")
        elif 82.0 <= rh_avg < 88.0:
            g_rh = 0.7
            triggered_rules.append(f"Moderate relative humidity ({rh_avg}%) supports brown spot development.")
        elif 75.0 <= rh_avg < 82.0:
            g_rh = 0.3
        else:
            g_rh = 0.0

        # Wetness Factor g_W
        lwd = leaf_wetness_hours if (leaf_wetness_hours is not None and leaf_wetness_hours > 0) else self.estimate_leaf_wetness_hours(rh_morning, rh_avg, rainfall_mm, temp_min)
        if lwd >= 10.0:
            g_wet = 1.0
            triggered_rules.append(f"Leaf wetness duration ({lwd} hrs) exceeds brown spot critical threshold.")
        elif 8.0 <= lwd < 10.0:
            g_wet = 0.7
            triggered_rules.append(f"Sufficient leaf wetness ({lwd} hrs) for spore germination.")
        elif 5.0 <= lwd < 8.0:
            g_wet = 0.3
        else:
            g_wet = 0.0

        # Crop Stage Factor C_s
        stage_key = str(growth_stage).strip().lower()
        stage_factor = self.BROWN_SPOT_STAGE_FACTORS.get(stage_key, 0.9)

        daily_index = g_temp * g_rh * g_wet * stage_factor
        return round(daily_index, 4), triggered_rules

    # =========================================================================
    # 3. CUMULATIVE MULTI-DAY EPIDEMIOLOGICAL AGGREGATION
    # =========================================================================
    def calculate_cumulative_risk(
        self,
        daily_indices: List[float]
    ) -> float:
        """
        Aggregates daily disease indices across the rolling window using
        temporal decay weights: [0.35, 0.25, 0.20, 0.10, 0.10].
        Dynamically normalizes if fewer than 5 days are present.
        """
        if not daily_indices:
            return 0.0

        n = min(len(daily_indices), len(self.ROLLING_WEIGHTS))
        weights = self.ROLLING_WEIGHTS[:n]
        indices = daily_indices[:n]

        norm_factor = sum(weights)
        if norm_factor == 0.0:
            return 0.0

        cumulative_score = sum(w * idx for w, idx in zip(weights, indices)) / norm_factor
        return round(min(1.0, max(0.0, cumulative_score)), 4)

    @staticmethod
    def classify_risk_band(score: float) -> str:
        """
        Maps continuous score [0.0, 1.0] to surveillance priority band.
        - LOW: 0.00 <= score < 0.35
        - MEDIUM: 0.35 <= score < 0.70
        - HIGH: 0.70 <= score <= 1.00
        """
        if score >= 0.70:
            return "HIGH"
        elif score >= 0.35:
            return "MEDIUM"
        else:
            return "LOW"

    # =========================================================================
    # 4. DATABASE REGION EVALUATION & PERSISTENCE
    # =========================================================================
    def evaluate_region_risk(
        self,
        db: Session,
        region_id: int,
        crop_id: int,
        disease_id: int,
        assessment_date: date,
        growth_stage: str = "Tillering"
    ) -> RiskAssessment:
        """
        Evaluates disease risk for a specific region and date by pulling the
        preceding 5 days of weather records from the database.
        Calculates rule-based score, assigns risk band, determines primary risk factors,
        and saves/updates the RiskAssessment record.
        """
        # Fetch disease details
        disease = db.query(Disease).filter(Disease.id == disease_id).first()
        if not disease:
            raise ValueError(f"Disease with ID {disease_id} not found in database.")

        is_blast = "blast" in disease.name.lower()

        # Query up to 5 days of weather records ending on assessment_date
        start_date = assessment_date - timedelta(days=4)
        weather_records = db.query(WeatherRecord).filter(
            WeatherRecord.region_id == region_id,
            WeatherRecord.record_date >= start_date,
            WeatherRecord.record_date <= assessment_date
        ).order_by(desc(WeatherRecord.record_date)).all()

        daily_indices: List[float] = []
        all_triggered_rules: List[str] = []
        temps_min: List[float] = []
        rhs: List[float] = []
        consecutive_conducive = 0

        if weather_records:
            for w in weather_records:
                temps_min.append(w.temp_min)
                rhs.append(w.rh_avg)

                if is_blast:
                    d_idx, rules = self.calculate_daily_blast_index(
                        temp_min=w.temp_min,
                        rh_avg=w.rh_avg,
                        rh_morning=w.rh_morning,
                        leaf_wetness_hours=w.leaf_wetness_hours_est,
                        rainfall_mm=w.rainfall_mm,
                        growth_stage=growth_stage
                    )
                else: # Brown Spot
                    d_idx, rules = self.calculate_daily_brown_spot_index(
                        temp_avg=w.temp_avg,
                        rh_avg=w.rh_avg,
                        rh_morning=w.rh_morning,
                        leaf_wetness_hours=w.leaf_wetness_hours_est,
                        rainfall_mm=w.rainfall_mm,
                        temp_min=w.temp_min,
                        growth_stage=growth_stage
                    )

                daily_indices.append(d_idx)
                for r in rules:
                    if r not in all_triggered_rules:
                        all_triggered_rules.append(r)

                if d_idx >= 0.40:
                    consecutive_conducive += 1

            cum_score = self.calculate_cumulative_risk(daily_indices)
            avg_temp_min = round(sum(temps_min) / len(temps_min), 2)
            avg_rh = round(sum(rhs) / len(rhs), 2)
        else:
            cum_score = 0.0
            avg_temp_min = None
            avg_rh = None
            all_triggered_rules.append("No weather observation records found for the preceding 5-day window.")

        risk_level = self.classify_risk_band(cum_score)

        # Formulate Primary Driving Factor
        if cum_score >= 0.70:
            factor = (
                f"Sustained conducive environment (night temp ~{avg_temp_min}°C, RH ~{avg_rh}%) "
                f"over {consecutive_conducive} consecutive days."
            )
        elif cum_score >= 0.35:
            factor = f"Moderate infection pressure with periodic high humidity (avg RH ~{avg_rh}%)."
        else:
            factor = "Atmospheric conditions remain unfavorable for fungal spore proliferation."

        # Fetch or Create RiskAssessment
        assessment = db.query(RiskAssessment).filter(
            RiskAssessment.region_id == region_id,
            RiskAssessment.crop_id == crop_id,
            RiskAssessment.disease_id == disease_id,
            RiskAssessment.assessment_date == assessment_date
        ).first()

        if not assessment:
            assessment = RiskAssessment(
                region_id=region_id,
                crop_id=crop_id,
                disease_id=disease_id,
                assessment_date=assessment_date,
                rule_based_score=cum_score,
                rule_based_level=risk_level,
                triggered_rules_json=json.dumps(all_triggered_rules),
                primary_risk_factor=factor,
                avg_temp_min_window=avg_temp_min,
                avg_rh_window=avg_rh,
                consecutive_conducive_days=consecutive_conducive
            )
            db.add(assessment)
        else:
            assessment.rule_based_score = cum_score
            assessment.rule_based_level = risk_level
            assessment.triggered_rules_json = json.dumps(all_triggered_rules)
            assessment.primary_risk_factor = factor
            assessment.avg_temp_min_window = avg_temp_min
            assessment.avg_rh_window = avg_rh
            assessment.consecutive_conducive_days = consecutive_conducive

        db.commit()
        db.refresh(assessment)
        return assessment

    # =========================================================================
    # 5. ALL REGIONS MULTI-TALUK EVALUATION
    # =========================================================================
    def evaluate_all_regions_for_date(
        self,
        db: Session,
        disease_id: int,
        assessment_date: date,
        crop_id: Optional[int] = None
    ) -> Dict[str, Dict[str, Any]]:
        """
        Evaluates disease risk across all 11 Madurai taluks for a specified date.
        Returns a dictionary indexed by taluk_name, ready for GeoJSON choropleth generation.
        """
        regions = db.query(Region).all()
        if not crop_id:
            crop = db.query(Crop).filter(Crop.common_name == "Rice (Paddy)").first()
            crop_id = crop.id if crop else 1

        results_by_taluk: Dict[str, Dict[str, Any]] = {}
        for region in regions:
            assessment = self.evaluate_region_risk(
                db=db,
                region_id=region.id,
                crop_id=crop_id,
                disease_id=disease_id,
                assessment_date=assessment_date
            )
            results_by_taluk[region.taluk_name] = {
                "region_id": region.id,
                "taluk_name": region.taluk_name,
                "rule_based_score": assessment.rule_based_score,
                "rule_based_level": assessment.rule_based_level,
                "primary_risk_factor": assessment.primary_risk_factor,
                "triggered_rules": json.loads(assessment.triggered_rules_json or "[]"),
                "avg_temp_min": assessment.avg_temp_min_window,
                "avg_rh": assessment.avg_rh_window,
                "consecutive_conducive_days": assessment.consecutive_conducive_days,
                "ml_predicted_score": assessment.ml_predicted_score,
                "ml_predicted_level": assessment.ml_predicted_level,
            }

        return results_by_taluk

# Singleton instance
risk_engine = EpidemiologicalRiskEngine()
