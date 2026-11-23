# CropRisk Atlas: Weather & Field-Based Crop Disease Risk Mapping Intelligence

An agriculture intelligence web application for surveillance prioritization of crop diseases (initially focusing on Rice Blast and Brown Spot in Madurai District, Tamil Nadu).

## Architecture & Scope
* **Geographical Scope:** Madurai District (11 Taluks), Tamil Nadu, India.
* **Crop:** Rice (*Oryza sativa*).
* **Target Diseases:** Rice Blast (*Magnaporthe oryzae*), Brown Spot (*Bipolaris oryzae*).
* **Backend:** FastAPI, SQLAlchemy 2.0, GeoPandas, Shapely, Scikit-learn.
* **Frontend:** React.js, Leaflet, Bootstrap 5, Plotly.js.

## Modules
1. Executive Dashboard (KPIs, Risk Gauges)
2. Interactive Spatial GeoMap (Leaflet Choropleth & Cluster Pins)
3. Data Ingestion Hub (CSV Upload & Strict Validation)
4. Field Scouting Log & Single Observation Form
5. Epidemiological Risk Calculation Engine (TNAU / IRRI Rules)
6. Machine Learning Evaluation Pipeline
7. Area-wise Reports & Dossier Export (CSV & PDF)
