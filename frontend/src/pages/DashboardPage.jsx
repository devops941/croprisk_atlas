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
        setRecentObservations(obsData.slice(0, 5));
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
    if (ses === 0) return <span className="badge bg-success">0 - Healthy</span>;
    if (ses <= 3) return <span className="badge bg-info text-dark">SES {ses} - Low</span>;
    if (ses <= 6) return <span className="badge bg-warning text-dark">SES {ses} - Moderate</span>;
    return <span className="badge bg-danger">SES {ses} - Severe</span>;
  };

  return (
    <div className="container-fluid px-4 py-4">
      {/* Title & Disease Selector */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold mb-1 text-dark">Surveillance Intelligence Dashboard</h2>
          <p className="text-muted mb-0">
            Real-time agro-epidemiological vulnerability indicators &bull; Madurai District, Tamil Nadu &bull; {todayStr}
          </p>
        </div>
        <div className="mt-3 mt-md-0 d-flex align-items-center gap-2">
          <span className="fw-semibold text-secondary small">Target Disease:</span>
          <div className="btn-group shadow-sm">
            {diseases.map((d) => (
              <button
                key={d.id}
                type="button"
                className={`btn btn-sm ${selectedDisease?.id === d.id ? 'btn-success fw-bold' : 'btn-outline-secondary'}`}
                onClick={() => handleDiseaseChange(d)}
              >
                {d.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card h-100 p-3 border-start border-4 border-success">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div className="text-muted small fw-semibold text-uppercase">Monitored Taluks</div>
                <div className="fs-3 fw-bold text-dark">11 / 11</div>
                <div className="small text-success mt-1"><i className="bi bi-check-circle-fill me-1"></i> Full District Coverage</div>
              </div>
              <div className="bg-success-subtle p-3 rounded-circle text-success fs-3">
                <i className="bi bi-map"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card h-100 p-3 border-start border-4 border-danger">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div className="text-muted small fw-semibold text-uppercase">High-Risk Priority Zones</div>
                <div className="fs-3 fw-bold text-danger">
                  {summary ? summary.high_risk_taluks_count : '...'}
                </div>
                <div className="small text-muted mt-1">Requires immediate scouting</div>
              </div>
              <div className="bg-danger-subtle p-3 rounded-circle text-danger fs-3">
                <i className="bi bi-exclamation-triangle-fill"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card h-100 p-3 border-start border-4 border-warning">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div className="text-muted small fw-semibold text-uppercase">District Mean Risk Score</div>
                <div className="fs-3 fw-bold text-dark">
                  {summary ? `${(summary.district_average_score * 100).toFixed(1)}%` : '...'}
                </div>
                <div className="small text-muted mt-1">Scale 0.0 – 1.0 (Epidemiological)</div>
              </div>
              <div className="bg-warning-subtle p-3 rounded-circle text-warning fs-3">
                <i className="bi bi-graph-up-arrow"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card h-100 p-3 border-start border-4 border-primary">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div className="text-muted small fw-semibold text-uppercase">Logged Scout Records</div>
                <div className="fs-3 fw-bold text-primary">{recentObservations.length}</div>
                <div className="small text-primary mt-1"><i className="bi bi-shield-check me-1"></i> Ground Validated</div>
              </div>
              <div className="bg-primary-subtle p-3 rounded-circle text-primary fs-3">
                <i className="bi bi-person-check-fill"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="row g-4 mb-4">
        {/* Left Column: Risk Breakdown & Map Callout */}
        <div className="col-12 col-lg-7">
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <span className="fs-5 text-dark fw-bold">
                <i className="bi bi-pie-chart-fill text-success me-2"></i>
                Vulnerability Distribution across Madurai Taluks
              </span>
              <Link to="/map" className="btn btn-sm btn-outline-success">
                View Full GeoMap <i className="bi bi-arrow-right ms-1"></i>
              </Link>
            </div>
            <div className="card-body">
              {summary && (
                <div className="mb-4">
                  <div className="progress" style={{ height: '24px', borderRadius: '8px' }}>
                    <div
                      className="progress-bar bg-danger"
                      style={{ width: `${(summary.high_risk_taluks_count / 11) * 100}%` }}
                    >
                      {summary.high_risk_taluks_count > 0 && `${summary.high_risk_taluks_count} High`}
                    </div>
                    <div
                      className="progress-bar bg-warning text-dark fw-bold"
                      style={{ width: `${(summary.medium_risk_taluks_count / 11) * 100}%` }}
                    >
                      {summary.medium_risk_taluks_count > 0 && `${summary.medium_risk_taluks_count} Medium`}
                    </div>
                    <div
                      className="progress-bar bg-success"
                      style={{ width: `${(summary.low_risk_taluks_count / 11) * 100}%` }}
                    >
                      {summary.low_risk_taluks_count > 0 && `${summary.low_risk_taluks_count} Low`}
                    </div>
                  </div>
                  <div className="d-flex justify-content-between text-muted small mt-2">
                    <span><span className="badge bg-danger me-1">&bull;</span> High Priority ({summary.high_risk_taluks_count})</span>
                    <span><span className="badge bg-warning text-dark me-1">&bull;</span> Medium Vulnerability ({summary.medium_risk_taluks_count})</span>
                    <span><span className="badge bg-success me-1">&bull;</span> Low / Safe ({summary.low_risk_taluks_count})</span>
                  </div>
                </div>
              )}

              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light small">
                    <tr>
                      <th>Taluk</th>
                      <th>Risk Level</th>
                      <th>Risk Score</th>
                      <th>Conducive Days</th>
                      <th>Dominant Microclimate Driver</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary?.taluk_breakdown?.slice(0, 6).map((t) => (
                      <tr key={t.taluk_name}>
                        <td className="fw-semibold">{t.taluk_name}</td>
                        <td>
                          <span className={`badge ${t.rule_based_level === 'HIGH' ? 'bg-danger' : t.rule_based_level === 'MEDIUM' ? 'bg-warning text-dark' : 'bg-success'}`}>
                            {t.rule_based_level}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <span className="small fw-bold">{(t.rule_based_score * 100).toFixed(0)}%</span>
                            <div className="progress flex-grow-1" style={{ height: '6px', width: '60px' }}>
                              <div
                                className={`progress-bar ${t.rule_based_level === 'HIGH' ? 'bg-danger' : t.rule_based_level === 'MEDIUM' ? 'bg-warning' : 'bg-success'}`}
                                style={{ width: `${t.rule_based_score * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td>{t.consecutive_conducive_days} days</td>
                        <td className="small text-muted text-truncate" style={{ maxWidth: '240px' }}>
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

        {/* Right Column: Recent Scouting Feed & Scientific Advice */}
        <div className="col-12 col-lg-5">
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <span className="fs-5 text-dark fw-bold">
                <i className="bi bi-clock-history text-primary me-2"></i>
                Recent Field Scouting Logs
              </span>
              <Link to="/scouting" className="btn btn-sm btn-outline-primary">
                Log Observation <i className="bi bi-plus-lg ms-1"></i>
              </Link>
            </div>
            <div className="card-body p-0">
              {recentObservations.length === 0 ? (
                <div className="p-4 text-center text-muted">
                  <i className="bi bi-clipboard-x fs-1 opacity-50 d-block mb-2"></i>
                  No field observations logged yet. Use the Field Scouting tool to submit survey reports.
                </div>
              ) : (
                <ul className="list-group list-group-flush">
                  {recentObservations.map((obs) => (
                    <li key={obs.id} className="list-group-item p-3">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <div>
                          <span className="fw-bold text-dark">{obs.taluk_name}</span>
                          <span className="text-muted small ms-2">({obs.observation_date})</span>
                        </div>
                        {getSeverityBadge(obs.severity_score_ses)}
                      </div>
                      <div className="small text-secondary mb-1">
                        <strong>Pathogen:</strong> {obs.disease_name} &bull; <strong>Stage:</strong> {obs.growth_stage}
                      </div>
                      {obs.notes && (
                        <div className="small bg-light p-2 rounded text-muted mt-1 fst-italic">
                          "{obs.notes}"
                        </div>
                      )}
                      <div className="d-flex justify-content-between align-items-center mt-2 small text-muted">
                        <span><i className="bi bi-person me-1"></i> {obs.observer_name}</span>
                        <span className="badge bg-secondary-subtle text-secondary">{obs.data_provenance}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Quick Navigation Tiles */}
      <div className="row g-3">
        <div className="col-12 col-md-4">
          <Link to="/map" className="text-decoration-none">
            <div className="card p-3 h-100 bg-white border-0 shadow-sm hover-shadow">
              <div className="d-flex align-items-center">
                <div className="bg-success text-white p-3 rounded-3 me-3 fs-3">
                  <i className="bi bi-geo-alt-fill"></i>
                </div>
                <div>
                  <h6 className="fw-bold text-dark mb-1">Interactive Risk GeoMap</h6>
                  <p className="text-muted small mb-0">Inspect spatial choropleth and cluster markers by taluk.</p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="col-12 col-md-4">
          <Link to="/data" className="text-decoration-none">
            <div className="card p-3 h-100 bg-white border-0 shadow-sm hover-shadow">
              <div className="d-flex align-items-center">
                <div className="bg-primary text-white p-3 rounded-3 me-3 fs-3">
                  <i className="bi bi-file-earmark-arrow-up-fill"></i>
                </div>
                <div>
                  <h6 className="fw-bold text-dark mb-1">Upload CSV Datasets</h6>
                  <p className="text-muted small mb-0">Import meteorological tables and batch field scouting observations.</p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="col-12 col-md-4">
          <Link to="/reports" className="text-decoration-none">
            <div className="card p-3 h-100 bg-white border-0 shadow-sm hover-shadow">
              <div className="d-flex align-items-center">
                <div className="bg-danger text-white p-3 rounded-3 me-3 fs-3">
                  <i className="bi bi-file-earmark-pdf-fill"></i>
                </div>
                <div>
                  <h6 className="fw-bold text-dark mb-1">Generate Surveillance Dossier</h6>
                  <p className="text-muted small mb-0">Download area-wise priority reports in CSV and styled PDF format.</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
