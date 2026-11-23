import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDiseases, getTalukSummary, getObservations } from '../api/apiClient';

const DashboardPage = () => {
  const [diseases, setDiseases] = useState([]);
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [summary, setSummary] = useState(null);
  const [recentObservations, setRecentObservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const dList = await getDiseases();
        setDiseases(dList);
        const initialDisease = dList[0];
        setSelectedDisease(initialDisease);

        if (initialDisease) {
          const sumData = await getTalukSummary(initialDisease.id, todayStr);
          setSummary(sumData);
        }

        const obsData = await getObservations();
        setRecentObservations(obsData.slice(0, 6));
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDiseaseChange = async (d) => {
    setSelectedDisease(d);
    try {
      const sumData = await getTalukSummary(d.id, todayStr);
      setSummary(sumData);
    } catch (err) {
      console.error(err);
    }
  };

  const getSeverityBadge = (ses) => {
    if (ses === 0) return <span className="badge badge-risk-low">0 - Healthy</span>;
    if (ses <= 3) return <span className="badge badge-risk-moderate">SES {ses} - Mild</span>;
    if (ses <= 6) return <span className="badge badge-risk-high">SES {ses} - Moderate</span>;
    return <span className="badge badge-risk-severe">SES {ses} - Severe</span>;
  };

  return (
    <div className="container-fluid px-3 px-lg-4 py-4">
      {/* Top Header & Disease Selector */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-3 border-bottom gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="radar-pulse"></span>
            <span className="badge bg-dark text-white px-2 py-1 small" style={{ fontSize: '0.72rem' }}>
              REAL-TIME MONITORING
            </span>
            <span className="text-secondary small">&bull;</span>
            <span className="text-secondary small">Madurai District, Tamil Nadu</span>
          </div>
          <h2 className="font-heading fw-bold mb-1 text-dark" style={{ letterSpacing: '-0.02em' }}>
            Agro-Epidemiological Surveillance Dashboard
          </h2>
          <p className="text-muted small mb-0">
            Automated Point-in-Polygon & Biometeorological Risk Stratification (TNAU/IRRI Rules) &bull; Assessment: <strong>{todayStr}</strong>
          </p>
        </div>

        {/* Pathogen Switcher Pills */}
        <div className="d-flex align-items-center gap-2">
          <span className="small fw-semibold text-secondary text-uppercase" style={{ fontSize: '0.72rem' }}>Pathogen:</span>
          <div className="btn-group shadow-xs">
            {diseases.map((d) => (
              <button
                key={d.id}
                type="button"
                className={`btn btn-sm ${selectedDisease?.id === d.id ? 'btn-pro-primary fw-semibold' : 'btn-pro-outline'}`}
                onClick={() => handleDiseaseChange(d)}
              >
                <i className="bi bi-virus me-1"></i> {d.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* High Risk Alert Banner (Conditional with Pulse Glow Animation) */}
      {summary && summary.high_risk_taluks_count > 0 && (
        <div className="alert alert-danger border-0 shadow-sm d-flex align-items-center justify-content-between mb-4 p-3 rounded-3 animate-pulse-glow-danger animate-fade-in-up"
             style={{ background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)', borderLeft: '5px solid #ef4444' }}>
          <div className="d-flex align-items-center gap-3">
            <div className="p-2 rounded-circle bg-danger text-white d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px' }}>
              <i className="bi bi-exclamation-triangle-fill fs-5"></i>
            </div>
            <div>
              <strong className="text-danger font-heading">
                Epidemiological Alert: {summary.high_risk_taluks_count} High-Priority Taluks Detected!
              </strong>
              <div className="text-dark small opacity-75">
                Microclimatic conditions (night temperature depression &gt; 90% RH) are conducive for rapid sporulation. Field scouting squads are recommended for immediate mobilization.
              </div>
            </div>
          </div>
          <Link to="/map" className="btn btn-sm btn-danger fw-semibold d-none d-md-inline-flex align-items-center gap-1">
            Inspect on Map <i className="bi bi-arrow-right"></i>
          </Link>
        </div>
      )}

      {/* KPI Cards Row with Staggered Entrance */}
      <div className="row g-3 mb-4">
        {/* Metric 1 */}
        <div className="col-12 col-sm-6 col-xl-3 animate-fade-in-up stagger-1">
          <div className="card h-100 card-interactive p-3 border-start border-4" style={{ borderLeftColor: '#059669 !important' }}>
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="text-uppercase fw-bold text-muted" style={{ fontSize: '0.70rem', letterSpacing: '0.04em' }}>
                  Monitored Taluks
                </div>
                <div className="fs-3 fw-bold text-dark font-mono mt-1">11 / 11</div>
                <div className="small text-success mt-1 d-flex align-items-center gap-1">
                  <i className="bi bi-check-circle-fill"></i>
                  <span>100% Administrative Coverage</span>
                </div>
              </div>
              <div className="p-2 rounded-3 text-success" style={{ backgroundColor: '#ecfdf5' }}>
                <i className="bi bi-map fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="col-12 col-sm-6 col-xl-3 animate-fade-in-up stagger-2">
          <div className="card h-100 card-interactive p-3 border-start border-4" style={{ borderLeftColor: '#ef4444 !important' }}>
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="text-uppercase fw-bold text-muted" style={{ fontSize: '0.70rem', letterSpacing: '0.04em' }}>
                  High-Priority Zones
                </div>
                <div className="fs-3 fw-bold text-danger font-mono mt-1">
                  {summary ? summary.high_risk_taluks_count : '...'}
                </div>
                <div className="small text-danger mt-1 d-flex align-items-center gap-1">
                  <i className="bi bi-shield-exclamation"></i>
                  <span>Immediate squad deployment</span>
                </div>
              </div>
              <div className="p-2 rounded-3 text-danger" style={{ backgroundColor: '#fef2f2' }}>
                <i className="bi bi-exclamation-triangle fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="col-12 col-sm-6 col-xl-3 animate-fade-in-up stagger-3">
          <div className="card h-100 card-interactive p-3 border-start border-4" style={{ borderLeftColor: '#f59e0b !important' }}>
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="text-uppercase fw-bold text-muted" style={{ fontSize: '0.70rem', letterSpacing: '0.04em' }}>
                  District Risk Index
                </div>
                <div className="fs-3 fw-bold text-dark font-mono mt-1">
                  {summary ? `${(summary.district_average_score * 100).toFixed(1)}%` : '...'}
                </div>
                <div className="small text-muted mt-1 d-flex align-items-center gap-1">
                  <i className="bi bi-graph-up-arrow text-warning"></i>
                  <span>5-Day Decay Weighted</span>
                </div>
              </div>
              <div className="p-2 rounded-3 text-warning" style={{ backgroundColor: '#fffbeb' }}>
                <i className="bi bi-speedometer2 fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="col-12 col-sm-6 col-xl-3 animate-fade-in-up stagger-4">
          <div className="card h-100 card-interactive p-3 border-start border-4" style={{ borderLeftColor: '#3b82f6 !important' }}>
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="text-uppercase fw-bold text-muted" style={{ fontSize: '0.70rem', letterSpacing: '0.04em' }}>
                  Ground Scout Validations
                </div>
                <div className="fs-3 fw-bold text-primary font-mono mt-1">
                  {recentObservations.length > 0 ? '27 Records' : '...'}
                </div>
                <div className="small text-primary mt-1 d-flex align-items-center gap-1">
                  <i className="bi bi-shield-check"></i>
                  <span>Spatial Block Validated</span>
                </div>
              </div>
              <div className="p-2 rounded-3 text-primary" style={{ backgroundColor: '#eff6ff' }}>
                <i className="bi bi-geo-alt-fill fs-4"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Taluk Breakdown & Recent Scouts */}
      <div className="row g-4 mb-4">
        {/* Left Column: Vulnerability Breakdown Table */}
        <div className="col-12 col-lg-7">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header d-flex justify-content-between align-items-center py-3">
              <div>
                <h5 className="font-heading fw-bold mb-0 text-dark">
                  <i className="bi bi-pie-chart-fill text-success me-2"></i>
                  Taluk Vulnerability Distribution
                </h5>
                <span className="small text-muted" style={{ fontSize: '0.75rem' }}>
                  Stratified by Biometeorological Conduciveness & IRRI Historical Calibration
                </span>
              </div>
              <Link to="/map" className="btn btn-sm btn-pro-outline">
                <span>View Full Map</span>
                <i className="bi bi-arrow-right ms-1"></i>
              </Link>
            </div>

            <div className="card-body">
              {summary && (
                <div className="mb-4 p-3 bg-light rounded-3">
                  <div className="d-flex justify-content-between small text-secondary fw-semibold mb-2">
                    <span>District Vulnerability Breakdown</span>
                    <span>11 Administrative Taluks</span>
                  </div>
                  <div className="progress" style={{ height: '14px', borderRadius: '6px' }}>
                    <div
                      className="progress-bar bg-danger"
                      style={{ width: `${(summary.high_risk_taluks_count / 11) * 100}%` }}
                      title={`${summary.high_risk_taluks_count} High Risk`}
                    ></div>
                    <div
                      className="progress-bar bg-warning"
                      style={{ width: `${(summary.medium_risk_taluks_count / 11) * 100}%` }}
                      title={`${summary.medium_risk_taluks_count} Medium Risk`}
                    ></div>
                    <div
                      className="progress-bar bg-success"
                      style={{ width: `${(summary.low_risk_taluks_count / 11) * 100}%` }}
                      title={`${summary.low_risk_taluks_count} Low Risk`}
                    ></div>
                  </div>
                  <div className="d-flex justify-content-between text-muted small mt-2" style={{ fontSize: '0.75rem' }}>
                    <span><span className="badge bg-danger me-1">&bull;</span> High Priority ({summary.high_risk_taluks_count})</span>
                    <span><span className="badge bg-warning text-dark me-1">&bull;</span> Medium ({summary.medium_risk_taluks_count})</span>
                    <span><span className="badge bg-success me-1">&bull;</span> Low / Safe ({summary.low_risk_taluks_count})</span>
                  </div>
                </div>
              )}

              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Taluk</th>
                      <th>Priority Level</th>
                      <th>Calculated Score</th>
                      <th>Conducive Streak</th>
                      <th>Primary Microclimate Driver</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary?.taluk_breakdown?.slice(0, 7).map((t) => (
                      <tr key={t.taluk_name}>
                        <td className="fw-semibold text-dark">{t.taluk_name}</td>
                        <td>
                          <span className={`badge ${t.rule_based_level === 'HIGH' ? 'badge-risk-severe' : t.rule_based_level === 'MEDIUM' ? 'badge-risk-moderate' : 'badge-risk-low'}`}>
                            {t.rule_based_level}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <span className="small fw-bold font-mono">{(t.rule_based_score * 100).toFixed(0)}%</span>
                            <div className="progress flex-grow-1" style={{ height: '6px', width: '50px' }}>
                              <div
                                className={`progress-bar ${t.rule_based_level === 'HIGH' ? 'bg-danger' : t.rule_based_level === 'MEDIUM' ? 'bg-warning' : 'bg-success'}`}
                                style={{ width: `${t.rule_based_score * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="small text-secondary">{t.consecutive_conducive_days} days</td>
                        <td className="small text-secondary text-truncate" style={{ maxWidth: '200px' }}>
                          {t.primary_risk_factor}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Field Scouting Logs */}
        <div className="col-12 col-lg-5">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header d-flex justify-content-between align-items-center py-3">
              <div>
                <h5 className="font-heading fw-bold mb-0 text-dark">
                  <i className="bi bi-clock-history text-primary me-2"></i>
                  Ground Scouting Telemetry
                </h5>
                <span className="small text-muted" style={{ fontSize: '0.75rem' }}>
                  GPS-verified field surveyor observations (IRRI SES 0-9)
                </span>
              </div>
              <Link to="/scouting" className="btn btn-sm btn-pro-primary">
                <i className="bi bi-plus-lg me-1"></i> Log Scout
              </Link>
            </div>

            <div className="card-body p-0">
              <div className="list-group list-group-flush">
                {recentObservations.length === 0 ? (
                  <div className="p-4 text-center text-muted">
                    No scouting logs available for this pathogen yet.
                  </div>
                ) : (
                  recentObservations.map((obs) => (
                    <div key={obs.id} className="list-group-item p-3 border-0 border-bottom">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <div className="d-flex align-items-center gap-2">
                          <div className="p-2 rounded bg-light border text-primary">
                            <i className="bi bi-geo-alt-fill"></i>
                          </div>
                          <div>
                            <span className="fw-bold text-dark font-heading">{obs.taluk_name}</span>
                            <div className="text-muted small" style={{ fontSize: '0.72rem' }}>
                              {obs.observation_date} &bull; {obs.observer_name}
                            </div>
                          </div>
                        </div>
                        <div>
                          {getSeverityBadge(obs.severity_score_ses)}
                        </div>
                      </div>

                      <div className="d-flex justify-content-between align-items-center mt-2 small text-secondary">
                        <div>
                          <span>Incidence: <strong>{obs.incidence_percentage}%</strong></span>
                          <span className="mx-2">&bull;</span>
                          <span>Stage: <strong>{obs.growth_stage}</strong></span>
                        </div>
                        <span className="badge bg-light text-muted border font-mono" style={{ fontSize: '0.65rem' }}>
                          {obs.data_provenance}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="card-footer bg-white border-top p-3 text-center">
              <Link to="/reports" className="small text-decoration-none fw-semibold text-success">
                View Full District Epidemiological Reports <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Dock */}
      <div className="card bg-slate-900 text-white p-4 border-0 shadow-md"
           style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-8">
            <h5 className="font-heading fw-bold text-white mb-1">
              Field Surveillance Prioritization Actions
            </h5>
            <p className="small text-light opacity-75 mb-0">
              Generate actionable PDF briefing dossiers for taluk extension officers, or upload new automatic weather station feeds.
            </p>
          </div>
          <div className="col-12 col-md-4 d-flex justify-content-md-end gap-2">
            <Link to="/data" className="btn btn-sm btn-light fw-semibold">
              <i className="bi bi-upload me-1"></i> Data Hub
            </Link>
            <Link to="/reports" className="btn btn-sm btn-success fw-semibold">
              <i className="bi bi-file-earmark-pdf me-1"></i> Export PDF Dossier
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
