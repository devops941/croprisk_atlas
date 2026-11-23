import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="bg-white">
      {/* Hero Section with Glassmorphism & High-tech Aura */}
      <section className="position-relative overflow-hidden py-5 border-bottom"
               style={{
                 background: 'radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.08) 0%, rgba(15, 23, 42, 0.02) 60%), #ffffff'
               }}>
        <div className="container py-4">
          <div className="row align-items-center g-5">
            <div className="col-12 col-lg-7">
              {/* Telemetry pill */}
              <div className="d-inline-flex align-items-center gap-2 px-3 py-1 mb-3 rounded-pill border small"
                   style={{ background: '#ecfdf5', borderColor: '#a7f3d0' }}>
                <span className="radar-pulse"></span>
                <span className="fw-bold text-success" style={{ fontSize: '0.78rem' }}>
                  MADURAI AGRO-EPIDEMIOLOGICAL SURVEILLANCE
                </span>
              </div>

              <h1 className="font-heading display-5 fw-bold text-dark lh-tight mb-3" style={{ letterSpacing: '-0.03em' }}>
                CropRisk <span className="text-gradient-emerald">Atlas</span>
              </h1>
              
              <h2 className="fs-4 text-secondary fw-semibold mb-3">
                Weather & Field-Based Crop Disease Risk Mapping Intelligence
              </h2>

              <p className="lead text-secondary mb-4" style={{ fontSize: '1.05rem', lineHeight: '1.7' }}>
                A proactive regional epidemiological platform engineered for <strong>field surveillance prioritization</strong>. Instead of reactive leaf photo scanning after crops are already damaged, CropRisk Atlas uses rolling microclimates, Point-in-Polygon administrative mapping, and TNAU biometeorological rules to predict disease outbreaks <strong>before macroscopic sporulation</strong> across Madurai District's 11 taluks.
              </p>

              <div className="d-flex flex-wrap gap-3 mb-4">
                <Link to="/map" className="btn btn-pro-primary btn-lg px-4 shadow-sm fw-semibold d-inline-flex align-items-center gap-2">
                  <i className="bi bi-map-fill"></i>
                  <span>Launch Spatial Risk Map</span>
                </Link>
                <Link to="/dashboard" className="btn btn-pro-outline btn-lg px-4 fw-semibold d-inline-flex align-items-center gap-2">
                  <i className="bi bi-speedometer2"></i>
                  <span>Executive Dashboard</span>
                </Link>
                <Link to="/scouting" className="btn btn-pro-outline btn-lg px-3 d-inline-flex align-items-center gap-2">
                  <i className="bi bi-geo-alt-fill text-danger"></i>
                  <span>Field Scout GPS</span>
                </Link>
              </div>

              {/* Agronomic Scope Badges */}
              <div className="pt-3 border-top d-flex flex-wrap gap-3 small text-muted">
                <div className="d-flex align-items-center">
                  <i className="bi bi-geo-alt-fill text-danger me-1"></i>
                  <span><strong>Scope:</strong> Madurai District (11 Taluks)</span>
                </div>
                <div className="d-flex align-items-center">
                  <i className="bi bi-flower1 text-success me-1"></i>
                  <span><strong>Crop:</strong> Rice (<em>Oryza sativa</em>, Samba Season)</span>
                </div>
                <div className="d-flex align-items-center">
                  <i className="bi bi-virus text-warning me-1"></i>
                  <span><strong>Pathogens:</strong> Blast & Brown Spot</span>
                </div>
              </div>
            </div>

            {/* Right Interactive Card */}
            <div className="col-12 col-lg-5">
              <div className="card shadow-lg border-0 p-4 bg-white rounded-4 position-relative"
                   style={{ boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.10)' }}>
                
                <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                  <div className="d-flex align-items-center gap-2">
                    <span className="radar-pulse"></span>
                    <strong className="text-dark font-heading">Real-Time Risk Stratification</strong>
                  </div>
                  <span className="badge bg-danger text-uppercase px-2 py-1 small">Oct 25 Peak</span>
                </div>

                {/* Taluk 1 */}
                <div className="p-3 bg-light rounded-3 mb-3 border">
                  <div className="d-flex justify-content-between small fw-bold mb-1">
                    <span className="text-dark font-heading">Melur Taluk (Periyar Basin)</span>
                    <span className="text-danger fw-bold">HIGH RISK &bull; 85%</span>
                  </div>
                  <div className="progress mb-2" style={{ height: '7px' }}>
                    <div className="progress-bar bg-danger" style={{ width: '85%' }}></div>
                  </div>
                  <div className="small text-secondary" style={{ fontSize: '0.78rem' }}>
                    <i className="bi bi-thermometer-half text-danger me-1"></i>
                    Optimal night temp (21.5°C), morning RH 94%, sustained leaf wetness &gt; 11 hrs.
                  </div>
                </div>

                {/* Taluk 2 */}
                <div className="p-3 bg-light rounded-3 mb-3 border">
                  <div className="d-flex justify-content-between small fw-bold mb-1">
                    <span className="text-dark font-heading">Vadipatti Taluk</span>
                    <span className="text-warning text-dark fw-bold">MEDIUM RISK &bull; 62%</span>
                  </div>
                  <div className="progress mb-2" style={{ height: '7px' }}>
                    <div className="progress-bar bg-warning" style={{ width: '62%' }}></div>
                  </div>
                  <div className="small text-secondary" style={{ fontSize: '0.78rem' }}>
                    <i className="bi bi-cloud-drizzle text-primary me-1"></i>
                    Favorable temperatures for <em>Bipolaris oryzae</em>; humidity spikes recorded.
                  </div>
                </div>

                {/* Taluk 3 */}
                <div className="p-3 bg-light rounded-3 border">
                  <div className="d-flex justify-content-between small fw-bold mb-1">
                    <span className="text-dark font-heading">Sedapatti Taluk</span>
                    <span className="text-success fw-bold">LOW RISK &bull; 18%</span>
                  </div>
                  <div className="progress mb-2" style={{ height: '7px' }}>
                    <div className="progress-bar bg-success" style={{ width: '18%' }}></div>
                  </div>
                  <div className="small text-secondary" style={{ fontSize: '0.78rem' }}>
                    <i className="bi bi-sun text-warning me-1"></i>
                    Dry atmospheric conditions suppress fungal spore germination.
                  </div>
                </div>

                <div className="mt-3 text-center">
                  <Link to="/map" className="small text-decoration-none fw-bold text-success">
                    Explore All 11 Taluks on Interactive Map <i className="bi bi-arrow-right"></i>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Metric Highlights Strip */}
      <section className="py-4 bg-slate-900 text-white" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
        <div className="container">
          <div className="row text-center g-3">
            <div className="col-6 col-md-3">
              <div className="fs-2 fw-bold font-mono text-success" style={{ color: '#34d399' }}>11 / 11</div>
              <div className="small opacity-75 text-uppercase fw-semibold" style={{ fontSize: '0.75rem' }}>Administrative Taluks</div>
            </div>
            <div className="col-6 col-md-3">
              <div className="fs-2 fw-bold font-mono text-white">192,000+</div>
              <div className="small opacity-75 text-uppercase fw-semibold" style={{ fontSize: '0.75rem' }}>Paddy Command Area (Ha)</div>
            </div>
            <div className="col-6 col-md-3">
              <div className="fs-2 fw-bold font-mono text-warning">TNAU / IRRI</div>
              <div className="small opacity-75 text-uppercase fw-semibold" style={{ fontSize: '0.75rem' }}>Biological Rules Grounded</div>
            </div>
            <div className="col-6 col-md-3">
              <div className="fs-2 fw-bold font-mono text-info">Spatial Block</div>
              <div className="small opacity-75 text-uppercase fw-semibold" style={{ fontSize: '0.75rem' }}>GroupKFold Validation</div>
            </div>
          </div>
        </div>
      </section>

      {/* Surveillance Prioritization vs Image Diagnosis Comparison */}
      <section className="py-5 bg-light">
        <div className="container py-3">
          <div className="text-center max-w-3xl mx-auto mb-5">
            <span className="badge bg-emerald-subtle text-success border border-success-subtle px-3 py-1 mb-2 small fw-bold">
              SYSTEM DISTINCTION
            </span>
            <h2 className="font-heading fw-bold text-dark">
              Why Surveillance Prioritization Matters More Than Photo Diagnosis
            </h2>
            <p className="text-secondary small">
              Understanding the scientific and operational difference in agricultural epidemiological workflows.
            </p>
          </div>

          <div className="row g-4">
            {/* Box 1: Traditional Leaf Photo CV */}
            <div className="col-12 col-md-6">
              <div className="card h-100 p-4 border-0 shadow-sm border-top border-4 border-secondary">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div className="p-2 rounded bg-secondary-subtle text-secondary fs-4">
                    <i className="bi bi-camera"></i>
                  </div>
                  <div>
                    <h5 className="font-heading fw-bold text-dark mb-0">Conventional Computer Vision</h5>
                    <span className="small text-danger fw-semibold">Reactive & Late-Stage</span>
                  </div>
                </div>
                <ul className="text-secondary small mb-0 d-flex flex-column gap-2" style={{ lineHeight: '1.6' }}>
                  <li><strong>Trigger:</strong> Farmer sees spots, takes a smartphone photo of the damaged leaf.</li>
                  <li><strong>Limitation:</strong> By the time macro lesions are visible, spores have already released and spread to neighboring fields.</li>
                  <li><strong>Scale:</strong> Single-plant leaf classification; fails to provide district-level squad deployment directives.</li>
                  <li><strong>Economic Impact:</strong> Yield loss has already occurred; treatments are curative and expensive.</li>
                </ul>
              </div>
            </div>

            {/* Box 2: CropRisk Atlas Surveillance */}
            <div className="col-12 col-md-6">
              <div className="card h-100 p-4 border-0 shadow-sm border-top border-4 border-success"
                   style={{ background: '#ffffff', boxShadow: '0 8px 24px rgba(16, 185, 129, 0.1)' }}>
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div className="p-2 rounded bg-success-subtle text-success fs-4">
                    <i className="bi bi-shield-check"></i>
                  </div>
                  <div>
                    <h5 className="font-heading fw-bold text-dark mb-0">CropRisk Atlas Surveillance</h5>
                    <span className="small text-success fw-bold">Proactive & Preventive (Pre-Sporulation)</span>
                  </div>
                </div>
                <ul className="text-secondary small mb-0 d-flex flex-column gap-2" style={{ lineHeight: '1.6' }}>
                  <li><strong>Trigger:</strong> Automated analysis of multi-day microclimate conditions (dew, temperature, leaf wetness).</li>
                  <li><strong>Advantage:</strong> Detects conducive infection windows <strong>3 to 5 days before visible lesions appear</strong>.</li>
                  <li><strong>Scale:</strong> District-wide geospatial stratification across 11 taluks to guide government extension squads.</li>
                  <li><strong>Economic Impact:</strong> Enables timely prophylactic bio-control, protecting yield before crop damage occurs.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Pipeline */}
      <section className="py-5 bg-white">
        <div className="container py-3">
          <div className="text-center mb-5">
            <span className="badge bg-light text-secondary border px-3 py-1 mb-2 small fw-bold">
              SCIENTIFIC METHODOLOGY
            </span>
            <h2 className="font-heading fw-bold text-dark">
              End-to-End Agro-Epidemiological Pipeline
            </h2>
          </div>

          <div className="row g-4">
            <div className="col-12 col-sm-6 col-lg-3 animate-fade-in-up stagger-1">
              <div className="card h-100 p-3 border-0 bg-light card-interactive">
                <div className="fs-1 fw-bold text-success opacity-50 font-mono mb-2">01</div>
                <h6 className="font-heading fw-bold text-dark mb-2">Spatial Vector Indexing</h6>
                <p className="small text-secondary mb-0">
                  Integrates boundary coordinates for all 11 Madurai taluks using automated Point-in-Polygon spatial mapping.
                </p>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-3 animate-fade-in-up stagger-2">
              <div className="card h-100 p-3 border-0 bg-light card-interactive">
                <div className="fs-1 fw-bold text-success opacity-50 font-mono mb-2">02</div>
                <h6 className="font-heading fw-bold text-dark mb-2">Biometeorological Engine</h6>
                <p className="small text-secondary mb-0">
                  Computes Daily Blast Infection Index (DBII) and Brown Spot Index (DBSII) based on validated TNAU & IRRI temperature and leaf wetness criteria.
                </p>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-3 animate-fade-in-up stagger-3">
              <div className="card h-100 p-3 border-0 bg-light card-interactive">
                <div className="fs-1 fw-bold text-success opacity-50 font-mono mb-2">03</div>
                <h6 className="font-heading fw-bold text-dark mb-2">Multi-Day Risk Decay</h6>
                <p className="small text-secondary mb-0">
                  Applies exponential decay weighting $w = [0.35, 0.25, 0.20, 0.10, 0.10]$ across a 5-day rolling window to capture sustained spore incubation pressure.
                </p>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-3 animate-fade-in-up stagger-4">
              <div className="card h-100 p-3 border-0 bg-light card-interactive">
                <div className="fs-1 fw-bold text-success opacity-50 font-mono mb-2">04</div>
                <h6 className="font-heading fw-bold text-dark mb-2">Actionable Field Dossiers</h6>
                <p className="small text-secondary mb-0">
                  Generates interactive choropleth maps, taluk ranking bar charts, and print-ready PDF briefing dossiers for extension officers and farmers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Module Navigation Grid */}
      <section className="py-5 bg-light border-top">
        <div className="container py-3">
          <div className="text-center mb-5">
            <h3 className="font-heading fw-bold text-dark">Platform Modules</h3>
            <p className="text-secondary small">Click any module to begin exploring or testing.</p>
          </div>

          <div className="row g-4">
            <div className="col-12 col-md-4">
              <div className="card h-100 p-4 border-0 shadow-sm card-interactive">
                <div className="p-3 rounded-3 bg-success-subtle text-success fs-3 mb-3 d-inline-block">
                  <i className="bi bi-map-fill"></i>
                </div>
                <h5 className="font-heading fw-bold text-dark mb-2">Spatial Risk Map</h5>
                <p className="small text-secondary mb-3">
                  Interactive Leaflet map showing taluk choropleths, ground truth cluster pins, microclimate inspection cards, and basemap switcher.
                </p>
                <Link to="/map" className="btn btn-sm btn-pro-primary mt-auto">
                  Open Map <i className="bi bi-arrow-right ms-1"></i>
                </Link>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="card h-100 p-4 border-0 shadow-sm card-interactive">
                <div className="p-3 rounded-3 bg-danger-subtle text-danger fs-3 mb-3 d-inline-block">
                  <i className="bi bi-geo-alt-fill"></i>
                </div>
                <h5 className="font-heading fw-bold text-dark mb-2">Field Scouting Tool</h5>
                <p className="small text-secondary mb-3">
                  Log ground truth observations with live GPS coordinates, Point-in-Polygon taluk verification, and IRRI SES 0-9 severity slider.
                </p>
                <Link to="/scouting" className="btn btn-sm btn-pro-outline mt-auto">
                  Launch Surveyor <i className="bi bi-arrow-right ms-1"></i>
                </Link>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="card h-100 p-4 border-0 shadow-sm card-interactive">
                <div className="p-3 rounded-3 bg-primary-subtle text-primary fs-3 mb-3 d-inline-block">
                  <i className="bi bi-file-earmark-bar-graph-fill"></i>
                </div>
                <h5 className="font-heading fw-bold text-dark mb-2">Reports & PDF Dossier</h5>
                <p className="small text-secondary mb-3">
                  11-Taluk comparative bar charts (Plotly), structured CSV export, and print-ready agricultural officer briefing dossiers.
                </p>
                <Link to="/reports" className="btn btn-sm btn-pro-outline mt-auto">
                  View Reports <i className="bi bi-arrow-right ms-1"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
