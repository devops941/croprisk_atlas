import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="py-5 bg-light border-bottom position-relative overflow-hidden">
        <div className="container py-4">
          <div className="row align-items-center g-5">
            <div className="col-12 col-lg-7">
              <div className="d-inline-flex align-items-center gap-2 px-3 py-1 mb-3 rounded-pill bg-success-subtle text-success-emphasis border border-success-subtle small fw-bold">
                <i className="bi bi-shield-check"></i> Final Year Academic Intelligence Project
              </div>
              <h1 className="display-5 fw-bold text-dark lh-tight mb-3">
                CropRisk Atlas
              </h1>
              <h2 className="fs-4 text-success fw-semibold mb-3">
                Weather & Field-Based Crop Disease Risk Mapping Intelligence
              </h2>
              <p className="lead text-secondary mb-4">
                An advanced agricultural geospatial intelligence platform designed for <strong>field surveillance prioritization</strong>. Analyzes rolling microclimates, crop phenology, and field scouting reports to forecast and map disease vulnerability across <strong>Madurai District, Tamil Nadu</strong>.
              </p>

              <div className="d-flex flex-wrap gap-3 mb-4">
                <Link to="/map" className="btn btn-success btn-lg px-4 shadow-sm fw-semibold">
                  <i className="bi bi-map-fill me-2"></i> Launch Spatial Risk Map
                </Link>
                <Link to="/dashboard" className="btn btn-outline-dark btn-lg px-4 fw-semibold">
                  <i className="bi bi-speedometer2 me-2"></i> View Dashboard
                </Link>
                <Link to="/data" className="btn btn-outline-secondary btn-lg px-3">
                  <i className="bi bi-cloud-arrow-up me-1"></i> Data Hub
                </Link>
              </div>

              {/* Target Scope Badges */}
              <div className="pt-3 border-top d-flex flex-wrap gap-3 small text-muted">
                <div><i className="bi bi-geo-alt-fill text-danger me-1"></i> <strong>Scope:</strong> Madurai District (11 Taluks)</div>
                <div><i className="bi bi-flower1 text-success me-1"></i> <strong>Crop:</strong> Rice (Paddy / <em>Oryza sativa</em>)</div>
                <div><i className="bi bi-virus text-warning me-1"></i> <strong>Pathogens:</strong> Rice Blast & Brown Spot</div>
              </div>
            </div>

            <div className="col-12 col-lg-5">
              <div className="card shadow-lg border-0 p-4 bg-white rounded-4">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <span className="badge bg-danger text-uppercase px-2 py-1">Early Warning Priority</span>
                  <span className="text-muted small">Madurai Command Area</span>
                </div>
                <div className="p-3 bg-light rounded-3 mb-3 border">
                  <div className="d-flex justify-content-between small fw-bold mb-1">
                    <span>Melur Taluk (Periyar Basin)</span>
                    <span className="text-danger">High Risk (85%)</span>
                  </div>
                  <div className="progress mb-2" style={{ height: '8px' }}>
                    <div className="progress-bar bg-danger" style={{ width: '85%' }}></div>
                  </div>
                  <div className="small text-secondary fst-italic">
                    "Optimal night temp (21.5°C), morning RH 94%, sustained leaf wetness &gt; 11 hrs."
                  </div>
                </div>

                <div className="p-3 bg-light rounded-3 mb-3 border">
                  <div className="d-flex justify-content-between small fw-bold mb-1">
                    <span>Vadipatti Taluk</span>
                    <span className="text-warning text-dark">Medium Risk (62%)</span>
                  </div>
                  <div className="progress mb-2" style={{ height: '8px' }}>
                    <div className="progress-bar bg-warning" style={{ width: '62%' }}></div>
                  </div>
                  <div className="small text-secondary fst-italic">
                    "Favorable temperature for Bipolaris oryzae; periodic humidity spikes."
                  </div>
                </div>

                <div className="p-3 bg-light rounded-3 border">
                  <div className="d-flex justify-content-between small fw-bold mb-1">
                    <span>Sedapatti Taluk</span>
                    <span className="text-success">Low Risk (18%)</span>
                  </div>
                  <div className="progress mb-2" style={{ height: '8px' }}>
                    <div className="progress-bar bg-success" style={{ width: '18%' }}></div>
                  </div>
                  <div className="small text-secondary fst-italic">
                    "Dry atmospheric conditions suppress fungal germination."
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Stats Strip */}
      <section className="py-4 bg-success text-white">
        <div className="container">
          <div className="row text-center g-3">
            <div className="col-6 col-md-3">
              <div className="fs-2 fw-bold">11</div>
              <div className="small opacity-90 text-uppercase fw-semibold">Administrative Taluks</div>
            </div>
            <div className="col-6 col-md-3">
              <div className="fs-2 fw-bold">192,000+</div>
              <div className="small opacity-90 text-uppercase fw-semibold">Paddy Command (Ha)</div>
            </div>
            <div className="col-6 col-md-3">
              <div className="fs-2 fw-bold">100%</div>
              <div className="small opacity-90 text-uppercase fw-semibold">TNAU / IRRI Grounded</div>
            </div>
            <div className="col-6 col-md-3">
              <div className="fs-2 fw-bold">0%</div>
              <div className="small opacity-90 text-uppercase fw-semibold">Spatial Leakage (GroupKFold)</div>
            </div>
          </div>
        </div>
      </section>

      {/* Surveillance Prioritization vs Diagnosis Callout */}
      <section className="py-5">
        <div className="container">
          <div className="row justify-content-center mb-4 text-center">
            <div className="col-12 col-md-8">
              <h3 className="fw-bold text-dark mb-2">Core Scientific Distinction</h3>
              <p className="text-muted">
                Why areal epidemiological forecasting outperforms reactive photo-diagnosis.
              </p>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-12 col-md-6">
              <div className="card h-100 p-4 border-danger border-2 bg-light">
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-danger text-white p-2 rounded-circle me-3 fs-4">
                    <i className="bi bi-camera-fill"></i>
                  </div>
                  <h5 className="fw-bold text-danger mb-0">Reactive Leaf Photo Diagnosis</h5>
                </div>
                <ul className="text-secondary small mb-0">
                  <li className="mb-2">Requires farmer to detect visible lesions on individual plant leaves.</li>
                  <li className="mb-2"><strong>Too Late:</strong> When symptoms appear, millions of fungal conidia have already sporulated and dispersed into neighbouring fields.</li>
                  <li>Does not provide regional macro guidance on where extension officers should travel next.</li>
                </ul>
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div className="card h-100 p-4 border-success border-2 bg-success-subtle">
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-success text-white p-2 rounded-circle me-3 fs-4">
                    <i className="bi bi-radar"></i>
                  </div>
                  <h5 className="fw-bold text-success-emphasis mb-0">Proactive Surveillance Prioritization (CropRisk Atlas)</h5>
                </div>
                <ul className="text-dark small mb-0">
                  <li className="mb-2">Monitors weather conditions (temperature, humidity, dew hours) <strong>before</strong> visual symptoms erupt.</li>
                  <li className="mb-2">Directs scarce plant protection squads, mobile inspection vans, and advisory broadcasts to high-risk taluks proactively.</li>
                  <li>Enables prophylactic fungicide and balanced nitrogen management to stop epidemics before they start.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Operational Pipeline */}
      <section className="py-5 bg-light border-top border-bottom">
        <div className="container">
          <div className="text-center mb-5">
            <h3 className="fw-bold text-dark mb-2">How CropRisk Atlas Works</h3>
            <p className="text-muted">A systematic 4-tier pipeline connecting weather data to actionable field alerts.</p>
          </div>

          <div className="row g-4">
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card p-3 h-100 border-0 shadow-sm text-center">
                <div className="fs-1 text-primary mb-2"><i className="bi bi-cloud-haze2-fill"></i></div>
                <h6 className="fw-bold mb-2">1. Ingest Microclimate</h6>
                <p className="small text-muted mb-0">
                  Daily minimum/maximum temperature, morning relative humidity, rainfall, and leaf wetness duration across 11 taluks.
                </p>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card p-3 h-100 border-0 shadow-sm text-center">
                <div className="fs-1 text-success mb-2"><i className="bi bi-geo-fill"></i></div>
                <h6 className="fw-bold mb-2">2. Spatial PIP Verification</h6>
                <p className="small text-muted mb-0">
                  Field scouting coordinates are verified through Shapely Point-in-Polygon spatial trees against Madurai boundaries.
                </p>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card p-3 h-100 border-0 shadow-sm text-center">
                <div className="fs-1 text-warning mb-2"><i className="bi bi-calculator-fill"></i></div>
                <h6 className="fw-bold mb-2">3. Epidemiological Modeling</h6>
                <p className="small text-muted mb-0">
                  Computes Daily Blast (DBII) and Brown Spot (DBSII) infection indices with 5-day weighted temporal decay.
                </p>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card p-3 h-100 border-0 shadow-sm text-center">
                <div className="fs-1 text-danger mb-2"><i className="bi bi-send-check-fill"></i></div>
                <h6 className="fw-bold mb-2">4. Priority Action Alerts</h6>
                <p className="small text-muted mb-0">
                  Color-codes taluks into Low, Medium, and High priority zones; exports PDF dossiers for field inspection squads.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Platform Features Grid */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h3 className="fw-bold text-dark mb-2">Explore Platform Modules</h3>
            <p className="text-muted">Click any module to begin exploring the system.</p>
          </div>

          <div className="row g-4">
            <div className="col-12 col-md-4">
              <div className="card h-100 border-0 shadow-sm p-3">
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-success text-white p-3 rounded-3 me-3 fs-3">
                    <i className="bi bi-map"></i>
                  </div>
                  <div>
                    <h5 className="fw-bold text-dark mb-0">Spatial Risk GeoMap</h5>
                    <span className="small text-muted">Interactive Leaflet Interface</span>
                  </div>
                </div>
                <p className="small text-secondary mb-3">
                  Color-coded choropleth layers across Madurai taluks with clickable detail drawers and clustered ground observation pins.
                </p>
                <Link to="/map" className="btn btn-sm btn-outline-success mt-auto">
                  Open GeoMap <i className="bi bi-arrow-right ms-1"></i>
                </Link>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="card h-100 border-0 shadow-sm p-3">
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-primary text-white p-3 rounded-3 me-3 fs-3">
                    <i className="bi bi-geo-alt"></i>
                  </div>
                  <div>
                    <h5 className="fw-bold text-dark mb-0">Field Scouting Tool</h5>
                    <span className="small text-muted">Ground Truth Logging</span>
                  </div>
                </div>
                <p className="small text-secondary mb-3">
                  Log observations with live GPS Point-in-Polygon taluk verification and IRRI Standard Evaluation System (SES) 0-9 scale.
                </p>
                <Link to="/scouting" className="btn btn-sm btn-outline-primary mt-auto">
                  Log Field Survey <i className="bi bi-arrow-right ms-1"></i>
                </Link>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="card h-100 border-0 shadow-sm p-3">
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-warning text-dark p-3 rounded-3 me-3 fs-3">
                    <i className="bi bi-file-earmark-arrow-up"></i>
                  </div>
                  <div>
                    <h5 className="fw-bold text-dark mb-0">Data Ingestion Hub</h5>
                    <span className="small text-muted">CSV Upload & Validation</span>
                  </div>
                </div>
                <p className="small text-secondary mb-3">
                  Upload meteorological tables and batch field scouting observations with row-level error audit and provenance tracking.
                </p>
                <Link to="/data" className="btn btn-sm btn-outline-warning text-dark mt-auto">
                  Upload Datasets <i className="bi bi-arrow-right ms-1"></i>
                </Link>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="card h-100 border-0 shadow-sm p-3">
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-info text-white p-3 rounded-3 me-3 fs-3">
                    <i className="bi bi-speedometer2"></i>
                  </div>
                  <div>
                    <h5 className="fw-bold text-dark mb-0">Surveillance Dashboard</h5>
                    <span className="small text-muted">District Intelligence KPIs</span>
                  </div>
                </div>
                <p className="small text-secondary mb-3">
                  High-level surveillance metrics, risk distribution gauges, recent scouting feeds, and microclimate indicators.
                </p>
                <Link to="/dashboard" className="btn btn-sm btn-outline-info text-dark mt-auto">
                  Open Dashboard <i className="bi bi-arrow-right ms-1"></i>
                </Link>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="card h-100 border-0 shadow-sm p-3">
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-danger text-white p-3 rounded-3 me-3 fs-3">
                    <i className="bi bi-file-earmark-pdf"></i>
                  </div>
                  <div>
                    <h5 className="fw-bold text-dark mb-0">Reports & Export</h5>
                    <span className="small text-muted">PDF Dossier & CSV Stream</span>
                  </div>
                </div>
                <p className="small text-secondary mb-3">
                  Area-wise vulnerability breakdown with Plotly comparative bar charts, one-click CSV export, and formatted PDF dossiers.
                </p>
                <Link to="/reports" className="btn btn-sm btn-outline-danger mt-auto">
                  Generate Dossier <i className="bi bi-arrow-right ms-1"></i>
                </Link>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="card h-100 border-0 shadow-sm p-3">
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-secondary text-white p-3 rounded-3 me-3 fs-3">
                    <i className="bi bi-journal-medical"></i>
                  </div>
                  <div>
                    <h5 className="fw-bold text-dark mb-0">Knowledge Base</h5>
                    <span className="small text-muted">Agronomic Science</span>
                  </div>
                </div>
                <p className="small text-secondary mb-3">
                  TNAU and IRRI published biological threshold guidelines, symptom morphology, and Integrated Pest Management (IPM) directives.
                </p>
                <Link to="/knowledge" className="btn btn-sm btn-outline-secondary mt-auto">
                  Read Science Guide <i className="bi bi-arrow-right ms-1"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="py-5 bg-dark text-white text-center">
        <div className="container py-3">
          <h3 className="fw-bold mb-3">Ready to Prioritize Agricultural Surveillance?</h3>
          <p className="text-white-50 lead mb-4">
            Test the live system with pre-validated Madurai Samba season weather and field observation datasets.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/map" className="btn btn-success btn-lg px-4 fw-semibold">
              <i className="bi bi-map me-2"></i> Launch Live Map
            </Link>
            <Link to="/data" className="btn btn-outline-light btn-lg px-4">
              <i className="bi bi-upload me-2"></i> Ingest Datasets
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
