import json
import math
from typing import Optional, Dict, Any, List, Tuple
from pathlib import Path
import geopandas as gpd
from shapely.geometry import Point, shape
from shapely.strtree import STRtree
from app.core.config import settings

class GeospatialService:
    def __init__(self, geojson_path: Optional[Path] = None):
        self.geojson_path = geojson_path or settings.MADURAI_GEOJSON_PATH
        self._gdf: Optional[gpd.GeoDataFrame] = None
        self._raw_geojson: Optional[Dict[str, Any]] = None
        self._spatial_tree: Optional[STRtree] = None
        self._geometries: List[Any] = []
        self._load_data()

    def _load_data(self) -> None:
        """Loads and pre-indexes the Madurai Taluks GeoJSON"""
        if not self.geojson_path.exists():
            raise FileNotFoundError(f"Madurai Taluks GeoJSON not found at: {self.geojson_path}")
        
        with open(self.geojson_path, "r", encoding="utf-8") as f:
            self._raw_geojson = json.load(f)
            
        self._gdf = gpd.read_file(self.geojson_path)
        if self._gdf.crs is None:
            self._gdf.set_crs(settings.CRS_STORAGE, inplace=True)
            
        self._geometries = list(self._gdf.geometry)
        self._spatial_tree = STRtree(self._geometries)

    @property
    def gdf(self) -> gpd.GeoDataFrame:
        if self._gdf is None:
            self._load_data()
        return self._gdf

    @property
    def raw_geojson(self) -> Dict[str, Any]:
        if self._raw_geojson is None:
            self._load_data()
        return self._raw_geojson

    def is_within_madurai_bbox(self, lat: float, lon: float) -> bool:
        """Fast bounding-box filter for Madurai District"""
        bbox = settings.MADURAI_BBOX
        return (bbox["min_lat"] <= lat <= bbox["max_lat"]) and (bbox["min_lon"] <= lon <= bbox["max_lon"])

    def find_taluk_for_point(self, lat: float, lon: float, tolerance_deg: float = 0.02) -> Optional[Dict[str, Any]]:
        """
        Assigns GPS (lat, lon) coordinates to its containing Madurai Taluk.
        Uses Point-in-Polygon (PIP) via Shapely.
        If the point is slightly outside due to boundary discretization,
        it uses distance tolerance (up to ~2km) to assign to nearest taluk.
        """
        if not self.is_within_madurai_bbox(lat, lon):
            return None

        # GeoJSON is in (longitude, latitude) = (x, y) order
        point = Point(lon, lat)

        # 1. Exact containment query using spatial index
        potential_idx = self._spatial_tree.query(point)
        for idx in potential_idx:
            geom = self._geometries[idx]
            if geom.contains(point) or geom.touches(point):
                row = self._gdf.iloc[idx]
                return {
                    "taluk_id": int(row.get("taluk_id", idx + 1)),
                    "taluk_name": str(row.get("taluk_name")),
                    "district": str(row.get("district", "Madurai")),
                    "state": str(row.get("state", "Tamil Nadu")),
                    "centroid_lat": float(row.get("centroid_lat")),
                    "centroid_lon": float(row.get("centroid_lon")),
                    "matched_method": "POINT_IN_POLYGON"
                }

        # 2. Nearest boundary fallback within tolerance
        min_distance = float("inf")
        nearest_row = None
        for idx, geom in enumerate(self._geometries):
            dist = geom.distance(point)
            if dist < min_distance:
                min_distance = dist
                nearest_row = self._gdf.iloc[idx]

        if min_distance <= tolerance_deg and nearest_row is not None:
            return {
                "taluk_id": int(nearest_row.get("taluk_id", 1)),
                "taluk_name": str(nearest_row.get("taluk_name")),
                "district": str(nearest_row.get("district", "Madurai")),
                "state": str(nearest_row.get("state", "Tamil Nadu")),
                "centroid_lat": float(nearest_row.get("centroid_lat")),
                "centroid_lon": float(nearest_row.get("centroid_lon")),
                "matched_method": "NEAREST_BOUNDARY_TOLERANCE",
                "boundary_distance_deg": round(min_distance, 5)
            }

        return None

    @staticmethod
    def calculate_idw_interpolation(
        stations: List[Dict[str, Any]],
        target_lat: float,
        target_lon: float,
        param_key: str,
        power: float = 2.0
    ) -> float:
        """
        Inverse Distance Weighting (IDW) interpolation to estimate weather
        parameters at an unmonitored location from surrounding stations.
        
        Formula:
        Z(u) = sum(w_i * z_i) / sum(w_i), where w_i = 1 / (d_i ^ power)
        """
        if not stations:
            raise ValueError("No weather stations available for IDW interpolation.")

        weighted_sum = 0.0
        total_weights = 0.0

        for station in stations:
            s_lat = station["lat"]
            s_lon = station["lon"]
            val = station[param_key]

            # Approximate Euclidean distance in degrees (sufficient for regional taluk scale)
            # or Haversine distance
            dist = math.sqrt((target_lat - s_lat) ** 2 + (target_lon - s_lon) ** 2)

            # Exact station location match
            if dist < 1e-6:
                return float(val)

            weight = 1.0 / (dist ** power)
            weighted_sum += weight * val
            total_weights += weight

        if total_weights == 0.0:
            return 0.0

        return round(weighted_sum / total_weights, 2)

    def generate_risk_choropleth_geojson(
        self,
        risk_by_taluk: Dict[str, Dict[str, Any]],
        assessment_date_str: str,
        disease_name: str
    ) -> Dict[str, Any]:
        """
        Enriches the base Madurai Taluks GeoJSON with computed risk scores,
        risk categories, and choropleth fill colors.
        """
        color_map = {
            "LOW": "#28a745",     # Leaf Green
            "MEDIUM": "#ffc107",  # Warning Amber
            "HIGH": "#dc3545",    # Alert Crimson
            "NO_DATA": "#6c757d"  # Neutral Slate Gray
        }

        geojson_copy = json.loads(json.dumps(self.raw_geojson))
        for feature in geojson_copy.get("features", []):
            props = feature.get("properties", {})
            taluk_name = props.get("taluk_name")
            
            risk_info = risk_by_taluk.get(taluk_name, {
                "rule_based_score": 0.0,
                "rule_based_level": "NO_DATA",
                "ml_predicted_score": None,
                "ml_predicted_level": None,
                "primary_risk_factor": "No weather or observation data recorded for this period."
            })
            
            level = risk_info.get("rule_based_level", "NO_DATA")
            props["assessment_date"] = assessment_date_str
            props["disease_name"] = disease_name
            props["risk_score"] = risk_info.get("rule_based_score", 0.0)
            props["risk_level"] = level
            props["fill_color"] = color_map.get(level, "#6c757d")
            props["fill_opacity"] = 0.65 if level != "NO_DATA" else 0.25
            props["ml_score"] = risk_info.get("ml_predicted_score")
            props["ml_level"] = risk_info.get("ml_predicted_level")
            props["primary_risk_factor"] = risk_info.get("primary_risk_factor")

        return geojson_copy

# Singleton instance
geospatial_service = GeospatialService()
