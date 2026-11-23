import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  const [activePathogen, setActivePathogen] = useState('blast');
  const [selectedTaluk, setSelectedTaluk] = useState('melur');

  const talukData = {
    melur: {
      name: 'Melur Taluk (Periyar Basin)',
      riskLevel: 'HIGH RISK',
      score: '85%',
      colorClass: 'danger',
      bgClass: 'badge-risk-severe',
      temp: '21.5°C',
      rh: '94%',
      wetness: '11.4 hrs',
      rainfall: '14.2 mm',
      insight: 'Optimal night temperature and morning relative humidity. Sustained leaf wetness exceeded 11 hours, creating high spore germination pressure.',
      action: 'Deploy extension squads immediately; advise prophylactic bio-agent (Pseudomonas fluorescens 2.5 kg/ha).'
    },
    vadipatti: {
      name: 'Vadipatti Taluk',
      riskLevel: 'MEDIUM RISK',
      score: '62%',
      colorClass: 'warning',
      bgClass: 'badge-risk-high',
      temp: '24.2°C',
      rh: '88%',
      wetness: '8.6 hrs',
      rainfall: '6.0 mm',
      insight: 'Moderate infection window with sustained canopy moisture. Sporulation potential is rising over the 5-day sliding window.',
      action: 'Issue watch advisory to local farmer groups; conduct random field sampling on early-transplanted Samba plots.'
    },
    sedapatti: {
      name: 'Sedapatti Taluk',
      riskLevel: 'LOW RISK',
      score: '18%',
      colorClass: 'success',
      bgClass: 'badge-risk-low',
      temp: '28.1°C',
      rh: '65%',
      wetness: '3.1 hrs',
      rainfall: '0.0 mm',
      insight: 'Warm, dry atmospheric conditions. High solar radiation and low dew condensation suppress fungal spore proliferation.',
      action: 'Routine surveillance only; no chemical or biological interventions required at this stage.'
    }
  };

  const pathogenInfo = {
    blast: {
      title: 'Rice Blast (Magnaporthe oryzae)',
      tamilName: 'குலை நோய் (நெல் பிளாஸ்ட்)',
      criticalWindow: 'Tillering to Panicle Initiation (Samba Season)',
      triggers: [
        { label: 'Night Temp', value: '18°C – 24°C', detail: 'Accelerates appressorium formation' },
        { label: 'Morning RH', value: '≥ 90%', detail: 'Triggers fungal spore sporulation' },
        { label: 'Leaf Wetness', value: '≥ 10 Hours', detail: 'Critical threshold for droplet penetration' }
      ],
      indexFormula: 'DBII = (T_opt × 0.35) + (RH_score × 0.35) + (LW_score × 0.30)',
      prophylacticAdvice: 'Foliar spray of Pseudomonas fluorescens @ 2.5 kg/ha or Tricyclazole 75 WP @ 500 g/ha prior to rainfall.'
    },
    brown_spot: {
      title: 'Brown Spot (Bipolaris oryzae)',
      tamilName: 'செம்புள்ளி நோய் (பிரவுன் ஸ்பாட்)',
      criticalWindow: 'Stem Elongation to Heading / Flowering',
      triggers: [
        { label: 'Temperature', value: '25°C – 32°C', detail: 'Optimal conidial germination range' },
        { label: 'Atmospheric RH', value: '≥ 85%', detail: 'Sustained humidity promotes leaf lesions' },
        { label: 'Soil Factor', value: 'Nutrient Stress', detail: 'Aggravated by silica/potassium deficiency' }
      ],
      indexFormula: 'DBSII = (T_favorable × 0.40) + (RH_score × 0.40) + (Rain_factor × 0.20)',
      prophylacticAdvice: 'Balanced NPK application + Mancozeb 75 WP @ 1000 g/ha or Carbendazim @ 500 g/ha on susceptible tillers.'
    }
  };

  const currentTaluk = talukData[selectedTaluk];
  const currentPathogen = pathogenInfo[activePathogen];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="position-relative overflow-hidden py-5 border-bottom"
               style={{
                 background: 'radial-gradient(circle at 85% 15%, rgba(16, 185, 129, 0.08) 0%, rgba(15, 23, 42, 0.03) 50%, #ffffff 80%)'
               }}>
        {/* Subtle Background Grid Pattern */}
        <div className="position-absolute top-0 start-0 w-100 h-100 pointer-events-none opacity-25"
             style={{
               backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
               backgroundSize: '24px 24px',
               zIndex: 0
             }}></div>

        <div className="container position-relative py-4" style={{ zIndex: 1 }}>
          <div className="row align-items-center g-5">
            {/* Left Hero Narrative */}
            <div className="col-12 col-lg-7">
              {/* Telemetry pill */}
              <div className="d-inline-flex align-items-center gap-2 px-3 py-1 mb-3 rounded-pill border shadow-xs"
                   style={{ background: '#ecfdf5', borderColor: '#a7f3d0' }}>
                <span className="radar-pulse"></span>
                <span className="fw-bold text-success" style={{ fontSize: '0.75rem', letterSpacing: '0.04em' }}>
                  GOVTECH AGRO-EPIDEMIOLOGICAL GIS &bull; MADURAI PILOT
                </span>
              </div>

              <h1 className="font-heading display-5 fw-bold text-dark lh-tight mb-3" style={{ letterSpacing: '-0.03em' }}>
                CropRisk <span className="text-gradient-emerald">Atlas</span>
              </h1>
              
              <h2 className="fs-4 text-secondary fw-semibold mb-3 lh-sm">
                Predictive Biometeorological & Spatial Disease Intelligence Platform
              </h2>

              <p className="lead text-secondary mb-4" style={{ fontSize: '1.05rem', lineHeight: '1.75' }}>
                Engineered for <strong>proactive field surveillance prioritization</strong> across Madurai District's 11 taluks. Instead of late-stage leaf photo scanning after foliar necrosis has already occurred, CropRisk Atlas models rolling microclimates and TNAU biological criteria to predict fungal infection windows <strong>3 to 5 days before visible macroscopic sporulation</strong>.
              </p>

              <div className="d-flex flex-wrap gap-3 mb-4">
                <Link to="/map" className="btn btn-pro-primary btn-lg px-4 shadow-sm fw-semibold d-inline-flex align-items-center gap-2">
                  <i className="bi bi-map-fill"></i>
                  <span>Launch Spatial Risk Cockpit</span>
                  <i className="bi bi-arrow-right small ms-1"></i>
                </Link>
                <Link to="/scouting" className="btn btn-pro-outline btn-lg px-3 fw-semibold d-inline-flex align-items-center gap-2">
                  <i className="bi bi-crosshair text-danger"></i>
                  <span>Field Scout GPS</span>
                </Link>
                <Link to="/dashboard" className="btn btn-pro-outline btn-lg px-3 fw-semibold d-inline-flex align-items-center gap-2">
                  <i className="bi bi-speedometer2 text-success"></i>
                  <span>Executive Dashboard</span>
                </Link>
              </div>

              {/* Agronomic Scope Chips */}
              <div className="pt-3 border-top d-flex flex-wrap gap-4 small text-muted">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-geo-alt-fill text-danger fs-6"></i>
                  <span><strong>District:</strong> Madurai (11 Taluks, TN)</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-flower1 text-success fs-6"></i>
                  <span><strong>Crop:</strong> Rice (<em>Oryza sativa</em>, Samba)</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-shield-shaded text-warning fs-6"></i>
                  <span><strong>Standard:</strong> TNAU & IRRI Grounded</span>
                </div>
              </div>
            </div>

            {/* Right Interactive GIS Map & Risk Cockpit Preview Card */}
            <div className="col-12 col-lg-5">
              <div className="card shadow-lg border-0 bg-white rounded-4 overflow-hidden position-relative"
                   style={{ boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.15)' }}>
                
                {/* Cockpit Card Header */}
                <div className="card-header bg-slate-900 text-white p-3 d-flex justify-content-between align-items-center"
                     style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
                  <div className="d-flex align-items-center gap-2">
                    <span className="radar-pulse"></span>
                    <div>
                      <h6 className="font-heading fw-bold mb-0 text-white" style={{ fontSize: '0.9rem' }}>
                        Spatial Risk Cockpit
                      </h6>
                      <span className="text-secondary small font-mono" style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                        11 Taluks &bull; Vector Choropleth
                      </span>
                    </div>
                  </div>
                  <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1 small fw-bold font-mono">
                    OCT 25 PEAK
                  </span>
                </div>

                {/* Pathogen Switcher Pills */}
                <div className="bg-light px-3 py-2 border-bottom d-flex justify-content-between align-items-center">
                  <span className="small text-muted fw-semibold" style={{ fontSize: '0.72rem' }}>Pathogen:</span>
                  <div className="btn-group btn-group-sm" role="group">
                    <button
                      type="button"
                      className={`btn btn-sm py-1 px-2 ${activePathogen === 'blast' ? 'btn-success text-white fw-bold' : 'btn-outline-secondary'}`}
                      style={{ fontSize: '0.72rem' }}
                      onClick={() => setActivePathogen('blast')}
                    >
                      Rice Blast
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm py-1 px-2 ${activePathogen === 'brown_spot' ? 'btn-success text-white fw-bold' : 'btn-outline-secondary'}`}
                      style={{ fontSize: '0.72rem' }}
                      onClick={() => setActivePathogen('brown_spot')}
                    >
                      Brown Spot
                    </button>
                  </div>
                </div>

                {/* Stylized SVG Map Representation of Madurai Taluks */}
                <div className="position-relative bg-slate-950 p-2 text-center"
                     style={{
                       background: 'radial-gradient(circle at 50% 50%, #064e3b 0%, #0f172a 100%)',
                       minHeight: '220px'
                     }}>
                  
                  {/* Grid Lines & Coordinates Overlay */}
                  <div className="position-absolute top-2 start-2 text-start font-mono text-white opacity-50" style={{ fontSize: '0.65rem' }}>
                    10.15°N / 78.35°E<br />Madurai Command Area
                  </div>
                  <div className="position-absolute bottom-2 end-2 font-mono text-white opacity-50" style={{ fontSize: '0.65rem' }}>
                    CRS: EPSG:4326 (WGS84)
                  </div>

                  {/* Interactive SVG Taluk Polygons */}
                  <svg viewBox="0 0 380 200" className="w-100 h-auto" style={{ maxHeight: '200px' }}>
                    <defs>
                      <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#ef4444" floodOpacity="0.6"/>
                      </filter>
                      <filter id="glow-amber" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#f59e0b" floodOpacity="0.5"/>
                      </filter>
                    </defs>

                    {/* Coordinate Grid Background */}
                    <line x1="20" y1="50" x2="360" y2="50" stroke="rgba(255,255,255,0.08)" strokeDasharray="3,3" />
                    <line x1="20" y1="100" x2="360" y2="100" stroke="rgba(255,255,255,0.08)" strokeDasharray="3,3" />
                    <line x1="20" y1="150" x2="360" y2="150" stroke="rgba(255,255,255,0.08)" strokeDasharray="3,3" />
                    <line x1="120" y1="10" x2="120" y2="190" stroke="rgba(255,255,255,0.08)" strokeDasharray="3,3" />
                    <line x1="240" y1="10" x2="240" y2="190" stroke="rgba(255,255,255,0.08)" strokeDasharray="3,3" />

                    {/* Vadipatti Taluk (Moderate Risk) */}
                    <polygon
                      points="60,40 130,25 155,75 110,105 50,80"
                      fill={selectedTaluk === 'vadipatti' ? 'rgba(245, 158, 11, 0.85)' : 'rgba(245, 158, 11, 0.55)'}
                      stroke="#f59e0b"
                      strokeWidth={selectedTaluk === 'vadipatti' ? "2.5" : "1.5"}
                      filter="url(#glow-amber)"
                      style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                      onClick={() => setSelectedTaluk('vadipatti')}
                    />
                    <text x="95" y="65" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle" pointerEvents="none">
                      Vadipatti (62%)
                    </text>

                    {/* Melur Taluk (High Risk) */}
                    <polygon
                      points="200,20 290,15 330,65 275,100 190,70"
                      fill={selectedTaluk === 'melur' ? 'rgba(239, 68, 68, 0.9)' : 'rgba(239, 68, 68, 0.65)'}
                      stroke="#ef4444"
                      strokeWidth={selectedTaluk === 'melur' ? "3" : "1.8"}
                      filter="url(#glow-red)"
                      style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                      onClick={() => setSelectedTaluk('melur')}
                    />
                    <text x="250" y="55" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle" pointerEvents="none">
                      ★ Melur (85%)
                    </text>

                    {/* Madurai North & South (Low Risk) */}
                    <polygon
                      points="140,75 205,70 230,125 160,135 125,105"
                      fill="#10b981"
                      fillOpacity="0.45"
                      stroke="#10b981"
                      strokeWidth="1.2"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedTaluk('sedapatti')}
                    />
                    <text x="175" y="105" fill="#ffffff" fontSize="9" fontWeight="600" textAnchor="middle" pointerEvents="none">
                      Madurai Urban
                    </text>

                    {/* Thirumangalam / Usilampatti */}
                    <polygon
                      points="40,95 115,105 145,155 75,170 30,135"
                      fill="#10b981"
                      fillOpacity="0.45"
                      stroke="#10b981"
                      strokeWidth="1.2"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedTaluk('sedapatti')}
                    />
                    <text x="85" y="135" fill="#ffffff" fontSize="9" fontWeight="600" textAnchor="middle" pointerEvents="none">
                      Thirumangalam
                    </text>

                    {/* Sedapatti & Peraiyur (Low Risk) */}
                    <polygon
                      points="100,155 180,140 230,190 140,195 80,175"
                      fill={selectedTaluk === 'sedapatti' ? 'rgba(16, 185, 129, 0.85)' : 'rgba(16, 185, 129, 0.5)'}
                      stroke="#10b981"
                      strokeWidth={selectedTaluk === 'sedapatti' ? "2.5" : "1.2"}
                      style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                      onClick={() => setSelectedTaluk('sedapatti')}
                    />
                    <text x="155" y="175" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle" pointerEvents="none">
                      Sedapatti (18%)
                    </text>

                    {/* Field Scout Pin Indicators */}
                    <circle cx="260" cy="45" r="4" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
                    <circle cx="280" cy="70" r="3" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" />
                    <circle cx="105" cy="55" r="4" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
                    <circle cx="160" cy="165" r="3" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" />
                  </svg>

                  {/* Tap hint */}
                  <div className="small text-white opacity-75 font-mono" style={{ fontSize: '0.68rem' }}>
                    <i className="bi bi-hand-index-thumb me-1"></i> Click any taluk polygon to inspect live microclimate dossier
                  </div>
                </div>

                {/* Taluk Live Telemetry Details */}
                <div className="card-body p-3 bg-white">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="font-heading fw-bold text-dark" style={{ fontSize: '0.95rem' }}>
                      {currentTaluk.name}
                    </span>
                    <span className={`badge ${currentTaluk.bgClass} fw-bold font-mono px-2 py-1 small`}>
                      {currentTaluk.riskLevel} &bull; {currentTaluk.score}
                    </span>
                  </div>

                  <div className="progress mb-3" style={{ height: '6px' }}>
                    <div className={`progress-bar bg-${currentTaluk.colorClass}`}
                         style={{ width: currentTaluk.score }}></div>
                  </div>

                  {/* 4 Microclimate Parameters */}
                  <div className="row g-2 text-center mb-3">
                    <div className="col-3">
                      <div className="p-1 rounded bg-light border">
                        <div className="text-secondary small" style={{ fontSize: '0.68rem' }}>Night Temp</div>
                        <div className="fw-bold font-mono text-dark small">{currentTaluk.temp}</div>
                      </div>
                    </div>
                    <div className="col-3">
                      <div className="p-1 rounded bg-light border">
                        <div className="text-secondary small" style={{ fontSize: '0.68rem' }}>Morn RH</div>
                        <div className="fw-bold font-mono text-dark small">{currentTaluk.rh}</div>
                      </div>
                    </div>
                    <div className="col-3">
                      <div className="p-1 rounded bg-light border">
                        <div className="text-secondary small" style={{ fontSize: '0.68rem' }}>Wetness</div>
                        <div className="fw-bold font-mono text-dark small">{currentTaluk.wetness}</div>
                      </div>
                    </div>
                    <div className="col-3">
                      <div className="p-1 rounded bg-light border">
                        <div className="text-secondary small" style={{ fontSize: '0.68rem' }}>Rain (24h)</div>
                        <div className="fw-bold font-mono text-dark small">{currentTaluk.rainfall}</div>
                      </div>
                    </div>
                  </div>

                  {/* Epidemiological Action Advisory */}
                  <div className="p-2 rounded bg-light border small text-secondary mb-3" style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>
                    <strong className="text-dark d-block mb-1">
                      <i className="bi bi-info-circle-fill text-primary me-1"></i> Biometeorological Assessment:
                    </strong>
                    {currentTaluk.insight}
                  </div>

                  {/* Link to Full Interactive Map */}
                  <Link to="/map" className="btn btn-pro-primary w-100 py-2 d-flex justify-content-center align-items-center gap-2 fw-semibold">
                    <i className="bi bi-compass"></i>
                    <span>Explore All 11 Taluks on Full Interactive Map</span>
                    <i className="bi bi-chevron-right small"></i>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Metric Highlights Telemetry Strip */}
      <section className="py-4 text-white" style={{ background: 'linear-gradient(135deg, #064e3b 0%, #0f172a 100%)' }}>
        <div className="container">
          <div className="row text-center g-3">
            <div className="col-6 col-md-3">
              <div className="fs-2 fw-bold font-mono text-success" style={{ color: '#34d399' }}>11 / 11</div>
              <div className="small opacity-75 text-uppercase fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                Administrative Taluks
              </div>
              <div className="small opacity-50" style={{ fontSize: '0.7rem' }}>100% Madurai District Coverage</div>
            </div>
            <div className="col-6 col-md-3">
              <div className="fs-2 fw-bold font-mono text-white">192,000+</div>
              <div className="small opacity-75 text-uppercase fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                Paddy Command Area (Ha)
              </div>
              <div className="small opacity-50" style={{ fontSize: '0.7rem' }}>Samba Season Surveillance</div>
            </div>
            <div className="col-6 col-md-3">
              <div className="fs-2 fw-bold font-mono text-warning">3 - 5 Days</div>
              <div className="small opacity-75 text-uppercase fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                Pre-Sporulation Lead Time
              </div>
              <div className="small opacity-50" style={{ fontSize: '0.7rem' }}>Proactive Early Warning Window</div>
            </div>
            <div className="col-6 col-md-3">
              <div className="fs-2 fw-bold font-mono text-info">TNAU &bull; IRRI</div>
              <div className="small opacity-75 text-uppercase fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                Biological Rules Grounded
              </div>
              <div className="small opacity-50" style={{ fontSize: '0.7rem' }}>SES 0-9 Ground Scored</div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Epidemiological Paradigm: Surveillance Prioritization vs Image Diagnosis */}
      <section className="py-5 bg-light">
        <div className="container py-4">
          <div className="text-center max-w-3xl mx-auto mb-5">
            <span className="badge bg-emerald-subtle text-success border border-success-subtle px-3 py-1 mb-2 small fw-bold">
              SCIENTIFIC PARADIGM SHIFT
            </span>
            <h2 className="font-heading display-6 fw-bold text-dark">
              Why Surveillance Prioritization Outperforms Photo Diagnosis
            </h2>
            <p className="text-secondary small mb-0">
              Comparing conventional leaf-level computer vision against regional biometeorological spatial intelligence.
            </p>
          </div>

          <div className="row g-4">
            {/* Box 1: Conventional Leaf Photo CV */}
            <div className="col-12 col-md-6">
              <div className="card h-100 p-4 border-0 shadow-sm border-top border-4 border-secondary bg-white">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="p-3 rounded-3 bg-secondary-subtle text-secondary fs-4">
                    <i className="bi bi-camera-fill"></i>
                  </div>
                  <div>
                    <h5 className="font-heading fw-bold text-dark mb-0">Conventional Smartphone Photo Diagnosis</h5>
                    <span className="badge bg-danger-subtle text-danger small fw-semibold">Reactive & Late-Stage</span>
                  </div>
                </div>

                <div className="d-flex flex-column gap-3 text-secondary small" style={{ lineHeight: '1.6' }}>
                  <div className="d-flex gap-2">
                    <i className="bi bi-x-circle-fill text-danger fs-6 flex-shrink-0 mt-1"></i>
                    <div>
                      <strong>Trigger Event:</strong> Requires farmers to first observe necrotic lesions, walk to the plant, and photograph symptoms with a phone.
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <i className="bi bi-x-circle-fill text-danger fs-6 flex-shrink-0 mt-1"></i>
                    <div>
                      <strong>Fatal Limitation:</strong> By the time macro spindle lesions appear on leaves, millions of fungal spores have already burst and infected neighboring fields.
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <i className="bi bi-x-circle-fill text-danger fs-6 flex-shrink-0 mt-1"></i>
                    <div>
                      <strong>Operational Blindspot:</strong> Classifies a single plant leaf in isolation; cannot direct government agricultural extension officers on where to deploy squads across 11 taluks.
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <i className="bi bi-x-circle-fill text-danger fs-6 flex-shrink-0 mt-1"></i>
                    <div>
                      <strong>Financial Loss:</strong> Yield reduction has already begun; curative fungicide treatments are emergency-based and cost 3x more.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Box 2: CropRisk Atlas Surveillance */}
            <div className="col-12 col-md-6">
              <div className="card h-100 p-4 border-0 shadow-sm border-top border-4 border-success bg-white"
                   style={{ boxShadow: '0 10px 30px rgba(16, 185, 129, 0.12)' }}>
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="p-3 rounded-3 bg-success-subtle text-success fs-4">
                    <i className="bi bi-shield-check"></i>
                  </div>
                  <div>
                    <h5 className="font-heading fw-bold text-dark mb-0">CropRisk Atlas Regional Surveillance</h5>
                    <span className="badge bg-success-subtle text-success small fw-bold">Proactive & Preventive (Pre-Sporulation)</span>
                  </div>
                </div>

                <div className="d-flex flex-column gap-3 text-secondary small" style={{ lineHeight: '1.6' }}>
                  <div className="d-flex gap-2">
                    <i className="bi bi-check-circle-fill text-success fs-6 flex-shrink-0 mt-1"></i>
                    <div>
                      <strong>Trigger Event:</strong> Continuous telemetry of rolling microclimates (night dew condensation, minimum temperature, sustained leaf wetness hours).
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <i className="bi bi-check-circle-fill text-success fs-6 flex-shrink-0 mt-1"></i>
                    <div>
                      <strong>Scientific Advantage:</strong> Identifies high-risk fungal incubation windows <strong>3 to 5 days before visible lesions appear</strong> on foliage.
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <i className="bi bi-check-circle-fill text-success fs-6 flex-shrink-0 mt-1"></i>
                    <div>
                      <strong>Regional Scale:</strong> Geospatial stratification with automated Point-in-Polygon administrative ranking across all 11 Madurai taluks.
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <i className="bi bi-check-circle-fill text-success fs-6 flex-shrink-0 mt-1"></i>
                    <div>
                      <strong>Financial Savings:</strong> Enables targeted prophylactic bio-control (e.g. <em>Pseudomonas fluorescens</em>) to arrest spore germination, preserving crop yield at minimal cost.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Biometeorological Disease Rules Simulator */}
      <section className="py-5 bg-white border-top">
        <div className="container py-3">
          <div className="text-center max-w-3xl mx-auto mb-4">
            <span className="badge bg-light text-secondary border px-3 py-1 mb-2 small fw-bold">
              EPIDEMIOLOGICAL KNOWLEDGE BASE
            </span>
            <h2 className="font-heading fw-bold text-dark">
              TNAU & IRRI Grounded Biological Rules
            </h2>
            <p className="text-secondary small mb-0">
              Each disease is governed by rigorous agronomic criteria established by the Tamil Nadu Agricultural University.
            </p>
          </div>

          <div className="card shadow-sm border-0 rounded-4 overflow-hidden mb-4">
            <div className="card-header bg-light border-bottom p-3 d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-mortarboard-fill text-success"></i>
                <span className="font-heading fw-bold text-dark">{currentPathogen.title}</span>
                <span className="text-muted small">({currentPathogen.tamilName})</span>
              </div>
              <div className="btn-group btn-group-sm">
                <button
                  type="button"
                  className={`btn ${activePathogen === 'blast' ? 'btn-success text-white' : 'btn-outline-secondary'}`}
                  onClick={() => setActivePathogen('blast')}
                >
                  Rice Blast
                </button>
                <button
                  type="button"
                  className={`btn ${activePathogen === 'brown_spot' ? 'btn-success text-white' : 'btn-outline-secondary'}`}
                  onClick={() => setActivePathogen('brown_spot')}
                >
                  Brown Spot
                </button>
              </div>
            </div>

            <div className="card-body p-4">
              <div className="row g-4 align-items-center">
                <div className="col-12 col-md-7">
                  <h6 className="font-heading fw-bold text-dark mb-2">Vulnerable Phenological Stage:</h6>
                  <p className="text-secondary small mb-3">
                    <span className="badge bg-light text-dark border me-2 font-mono">CRITICAL WINDOW</span>
                    {currentPathogen.criticalWindow}
                  </p>

                  <h6 className="font-heading fw-bold text-dark mb-2">Primary Meteorological Triggers:</h6>
                  <div className="row g-2 mb-3">
                    {currentPathogen.triggers.map((t, idx) => (
                      <div key={idx} className="col-12 col-sm-4">
                        <div className="p-2 rounded bg-light border">
                          <div className="small text-muted" style={{ fontSize: '0.72rem' }}>{t.label}</div>
                          <div className="fw-bold font-mono text-dark">{t.value}</div>
                          <div className="small text-secondary" style={{ fontSize: '0.68rem' }}>{t.detail}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <h6 className="font-heading fw-bold text-dark mb-1">Mathematical Index Model:</h6>
                  <div className="p-2 rounded bg-slate-900 text-white font-mono small mb-0" style={{ fontSize: '0.8rem' }}>
                    <code>{currentPathogen.indexFormula}</code>
                  </div>
                </div>

                <div className="col-12 col-md-5 border-start-md">
                  <div className="p-3 bg-emerald-subtle rounded-3 border border-success-subtle">
                    <h6 className="font-heading fw-bold text-success mb-2">
                      <i className="bi bi-shield-fill-check me-1"></i> TNAU Recommended Prophylaxis:
                    </h6>
                    <p className="small text-secondary mb-3" style={{ lineHeight: '1.6' }}>
                      {currentPathogen.prophylacticAdvice}
                    </p>
                    <Link to="/rules" className="btn btn-sm btn-outline-success">
                      Read Full Biological Rules Dossier <i className="bi bi-arrow-right ms-1"></i>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Architectural Pipeline */}
      <section className="py-5 bg-light border-top">
        <div className="container py-3">
          <div className="text-center mb-5">
            <span className="badge bg-light text-secondary border px-3 py-1 mb-2 small fw-bold">
              INTELLIGENCE ARCHITECTURE
            </span>
            <h2 className="font-heading fw-bold text-dark">
              End-to-End Agro-Epidemiological Pipeline
            </h2>
            <p className="text-secondary small mb-0">
              Transforming raw weather stations and ground observations into district-wide squad directives.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card h-100 p-4 border-0 shadow-sm card-interactive">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="fs-2 fw-bold text-success font-mono">01</span>
                  <div className="p-2 rounded bg-success-subtle text-success fs-5">
                    <i className="bi bi-layers-fill"></i>
                  </div>
                </div>
                <h6 className="font-heading fw-bold text-dark mb-2">Spatial Vector Indexing</h6>
                <p className="small text-secondary mb-0" style={{ lineHeight: '1.5' }}>
                  Administers polygon boundaries for all 11 Madurai taluks using automated Point-in-Polygon spatial assignment.
                </p>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card h-100 p-4 border-0 shadow-sm card-interactive">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="fs-2 fw-bold text-success font-mono">02</span>
                  <div className="p-2 rounded bg-success-subtle text-success fs-5">
                    <i className="bi bi-cloud-sun-fill"></i>
                  </div>
                </div>
                <h6 className="font-heading fw-bold text-dark mb-2">Biometeorological Engine</h6>
                <p className="small text-secondary mb-0" style={{ lineHeight: '1.5' }}>
                  Computes Daily Blast Infection Index (DBII) and Brown Spot Index (DBSII) based on continuous temperature and dew hours.
                </p>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card h-100 p-4 border-0 shadow-sm card-interactive">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="fs-2 fw-bold text-success font-mono">03</span>
                  <div className="p-2 rounded bg-success-subtle text-success fs-5">
                    <i className="bi bi-graph-up"></i>
                  </div>
                </div>
                <h6 className="font-heading fw-bold text-dark mb-2">Multi-Day Risk Decay</h6>
                <p className="small text-secondary mb-0" style={{ lineHeight: '1.5' }}>
                  Applies exponential decay weighting [0.35, 0.25, 0.20, 0.10, 0.10] across a 5-day sliding window to track incubation pressure.
                </p>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card h-100 p-4 border-0 shadow-sm card-interactive">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="fs-2 fw-bold text-success font-mono">04</span>
                  <div className="p-2 rounded bg-success-subtle text-success fs-5">
                    <i className="bi bi-file-earmark-pdf-fill"></i>
                  </div>
                </div>
                <h6 className="font-heading fw-bold text-dark mb-2">Actionable Field Dossiers</h6>
                <p className="small text-secondary mb-0" style={{ lineHeight: '1.5' }}>
                  Generates interactive choropleths, taluk priority rankings, and print-ready PDF briefing dossiers for extension squads.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Module Navigation Cards */}
      <section className="py-5 bg-white border-top">
        <div className="container py-3">
          <div className="text-center mb-5">
            <h3 className="font-heading fw-bold text-dark">Platform Modules</h3>
            <p className="text-secondary small">Click any module to begin exploring spatial intelligence.</p>
          </div>

          <div className="row g-4">
            <div className="col-12 col-md-3">
              <div className="card h-100 p-4 border-0 shadow-sm card-interactive bg-light">
                <div className="p-3 rounded-3 bg-success-subtle text-success fs-3 mb-3 d-inline-block">
                  <i className="bi bi-map-fill"></i>
                </div>
                <h5 className="font-heading fw-bold text-dark mb-2">Spatial Risk Map</h5>
                <p className="small text-secondary mb-3">
                  Leaflet map with taluk choropleth heatmaps, ground scout pins, and basemap switcher.
                </p>
                <Link to="/map" className="btn btn-sm btn-pro-primary mt-auto">
                  Open Map <i className="bi bi-arrow-right ms-1"></i>
                </Link>
              </div>
            </div>

            <div className="col-12 col-md-3">
              <div className="card h-100 p-4 border-0 shadow-sm card-interactive bg-light">
                <div className="p-3 rounded-3 bg-danger-subtle text-danger fs-3 mb-3 d-inline-block">
                  <i className="bi bi-crosshair"></i>
                </div>
                <h5 className="font-heading fw-bold text-dark mb-2">Field Scouting Tool</h5>
                <p className="small text-secondary mb-3">
                  Log ground truth observations with live GPS, Point-in-Polygon checks, and IRRI SES 0-9 slider.
                </p>
                <Link to="/scouting" className="btn btn-sm btn-pro-outline mt-auto">
                  Launch Surveyor <i className="bi bi-arrow-right ms-1"></i>
                </Link>
              </div>
            </div>

            <div className="col-12 col-md-3">
              <div className="card h-100 p-4 border-0 shadow-sm card-interactive bg-light">
                <div className="p-3 rounded-3 bg-primary-subtle text-primary fs-3 mb-3 d-inline-block">
                  <i className="bi bi-speedometer2"></i>
                </div>
                <h5 className="font-heading fw-bold text-dark mb-2">Executive Dashboard</h5>
                <p className="small text-secondary mb-3">
                  High-level surveillance metrics, high-priority taluk counts, and regional risk indices.
                </p>
                <Link to="/dashboard" className="btn btn-sm btn-pro-outline mt-auto">
                  Open Dashboard <i className="bi bi-arrow-right ms-1"></i>
                </Link>
              </div>
            </div>

            <div className="col-12 col-md-3">
              <div className="card h-100 p-4 border-0 shadow-sm card-interactive bg-light">
                <div className="p-3 rounded-3 bg-warning-subtle text-warning fs-3 mb-3 d-inline-block">
                  <i className="bi bi-file-earmark-bar-graph-fill"></i>
                </div>
                <h5 className="font-heading fw-bold text-dark mb-2">Reports & PDF Dossier</h5>
                <p className="small text-secondary mb-3">
                  11-taluk comparative rankings (Plotly charts), CSV export, and print-ready officer PDF dossiers.
                </p>
                <Link to="/reports" className="btn btn-sm btn-pro-outline mt-auto">
                  View Reports <i className="bi bi-arrow-right ms-1"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-5 text-white" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #064e3b 100%)' }}>
        <div className="container py-4 text-center">
          <h2 className="font-heading display-6 fw-bold mb-3 text-white">
            Ready to Explore Madurai's Agro-Epidemiological Surveillance?
          </h2>
          <p className="lead text-light opacity-75 mb-4 max-w-2xl mx-auto" style={{ fontSize: '1.05rem' }}>
            Empower agricultural extension squads with predictive disease mapping, multi-day weather decay tracking, and automated field ground truthing.
          </p>
          <div className="d-flex justify-content-center flex-wrap gap-3">
            <Link to="/map" className="btn btn-pro-primary btn-lg px-4 fw-bold">
              <i className="bi bi-map-fill me-2"></i> Launch Interactive Map
            </Link>
            <Link to="/scouting" className="btn btn-light btn-lg px-4 text-dark fw-bold">
              <i className="bi bi-geo-alt-fill text-danger me-2"></i> Field Scout Telemetry
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
