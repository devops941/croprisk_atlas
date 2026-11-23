import React, { useState, useEffect } from 'react';
import { uploadWeatherCSV, uploadObservationsCSV, getUploadBatches } from '../api/apiClient';

const DataManagerPage = () => {
  const [activeTab, setActiveTab] = useState('weather');
  const [weatherFile, setWeatherFile] = useState(null);
  const [weatherProvenance, setWeatherProvenance] = useState('PUBLIC_HISTORICAL_REANALYSIS');
  const [obsFile, setObsFile] = useState(null);
  const [obsProvenance, setObsProvenance] = useState('USER_SCOUTED');

  const [uploadResult, setUploadResult] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [batchHistory, setBatchHistory] = useState([]);
  const [selectedBatchErrors, setSelectedBatchErrors] = useState(null);

  const fetchBatches = async () => {
    try {
      const data = await getUploadBatches();
      setBatchHistory(data);
    } catch (err) {
      console.error('Failed to load upload history:', err);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleWeatherSubmit = async (e) => {
    e.preventDefault();
    if (!weatherFile) return;

    const formData = new FormData();
    formData.append('file', weatherFile);
    formData.append('provenance', weatherProvenance);

    try {
      setUploading(true);
      setUploadResult(null);
      const res = await uploadWeatherCSV(formData);
      setUploadResult(res);
      setWeatherFile(null);
      fetchBatches();
    } catch (err) {
      alert(`Upload failed: ${err.response?.data?.detail || err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleObsSubmit = async (e) => {
    e.preventDefault();
    if (!obsFile) return;

    const formData = new FormData();
    formData.append('file', obsFile);
    formData.append('provenance', obsProvenance);

    try {
      setUploading(true);
      setUploadResult(null);
      const res = await uploadObservationsCSV(formData);
      setUploadResult(res);
      setObsFile(null);
      fetchBatches();
    } catch (err) {
      alert(`Upload failed: ${err.response?.data?.detail || err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const downloadSampleTemplate = (type) => {
    let content = "";
    let filename = "";
    if (type === "weather") {
      filename = "weather_data_template.csv";
      content = "taluk_name,record_date,temp_max,temp_min,temp_avg,rh_morning,rh_evening,rh_avg,rainfall_mm,wind_speed_kmh,leaf_wetness_hours_est,solar_radiation_mj,data_provenance\n" +
        "Madurai North,2026-10-15,31.2,21.5,25.8,92.0,68.0,84.5,1.2,8.5,10.5,14.2,PUBLIC_HISTORICAL_REANALYSIS\n" +
        "Melur,2026-10-15,30.8,20.8,25.2,94.0,72.0,86.0,3.5,7.2,11.0,13.8,PUBLIC_HISTORICAL_REANALYSIS\n" +
        "Vadipatti,2026-10-15,31.5,22.0,26.1,90.0,65.0,82.0,0.0,9.0,9.5,15.1,PUBLIC_HISTORICAL_REANALYSIS";
    } else {
      filename = "field_observations_template.csv";
      content = "taluk_name,observation_date,latitude,longitude,crop_name,disease_name,growth_stage,disease_present,severity_score_ses,incidence_percentage,observer_name,notes,data_provenance\n" +
        "Melur,2026-10-18,10.035,78.335,Rice (Paddy),Rice Blast,Tillering,True,4,18.5,Dr. K. Sundaram,Early spindle lesions in transplanted field,REAL_FIELD_SURVEY\n" +
        "Vadipatti,2026-10-18,10.065,77.965,Rice (Paddy),Brown Spot,Tillering,True,3,12.0,R. Meenakshi,Oval brown spots on leaf blade,USER_SCOUTED";
    }

    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  return (
    <div className="container-fluid px-3 px-lg-4 py-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-3 border-bottom gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-secondary text-white px-2 py-1 small" style={{ fontSize: '0.72rem' }}>
              DATA INGESTION PIPELINE
            </span>
            <span className="text-secondary small">&bull;</span>
            <span className="text-secondary small">Automated Schema & Spatial Validation</span>
          </div>
          <h2 className="font-heading fw-bold mb-1 text-dark">
            Spatial & Field Data Ingestion Hub
          </h2>
          <p className="text-muted small mb-0">
            Upload CSV datasets with strict row-level auditing, point-in-polygon verification, and physical bounds checking.
          </p>
        </div>

        {/* Prepared Datasets Notice */}
        <div className="p-2 rounded bg-light border text-secondary small d-flex align-items-center gap-2">
          <i className="bi bi-folder-check text-success fs-5"></i>
          <div>
            <div className="fw-bold text-dark">Pre-generated Test Files Available:</div>
            <div className="font-mono text-muted" style={{ fontSize: '0.72rem' }}>
              <code>data/raw/madurai_weather_samba_season.csv</code>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="d-flex gap-2 mb-4">
        <button
          className={`btn btn-sm ${activeTab === 'weather' ? 'btn-pro-primary fw-semibold' : 'btn-pro-outline'}`}
          onClick={() => { setActiveTab('weather'); setUploadResult(null); }}
        >
          <i className="bi bi-cloud-sun me-1"></i> Weather CSV Ingestion
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'observation' ? 'btn-pro-primary fw-semibold' : 'btn-pro-outline'}`}
          onClick={() => { setActiveTab('observation'); setUploadResult(null); }}
        >
          <i className="bi bi-clipboard2-pulse me-1"></i> Field Scouting Ingestion
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'history' ? 'btn-pro-primary fw-semibold' : 'btn-pro-outline'}`}
          onClick={() => { setActiveTab('history'); setUploadResult(null); }}
        >
          <i className="bi bi-clock-history me-1"></i> Upload Audit History ({batchHistory.length})
        </button>
      </div>

      {/* Weather Upload Tab */}
      {activeTab === 'weather' && (
        <div className="row g-4">
          <div className="col-12 col-lg-6">
            <div className="card shadow-sm border-0 p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="font-heading fw-bold mb-0 text-dark">Upload Weather Dataset</h5>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => downloadSampleTemplate('weather')}
                >
                  <i className="bi bi-download me-1"></i> CSV Template
                </button>
              </div>

              <form onSubmit={handleWeatherSubmit}>
                <div className="mb-3">
                  <label className="form-label">Select Weather CSV File</label>
                  <input
                    type="file"
                    className="form-control"
                    accept=".csv"
                    onChange={(e) => setWeatherFile(e.target.files[0])}
                    required
                  />
                  {weatherFile && weatherFile.name.toLowerCase().includes('scouting') ? (
                    <div className="alert alert-warning py-2 px-3 small mt-2 mb-0 animate-pop">
                      <i className="bi bi-exclamation-triangle-fill me-1 text-warning"></i>
                      <strong>Wrong File Type:</strong> You selected <code>{weatherFile.name}</code> which is a Field Scouting file! Please upload <strong><code>madurai_weather_samba_season.csv</code></strong> here, or switch to the <strong>"Field Scouting Ingestion"</strong> tab above.
                    </div>
                  ) : (
                    <div className="form-text small text-muted">
                      Expected file: <strong><code>data/raw/madurai_weather_samba_season.csv</code></strong> (Must include: <code>taluk_name, record_date, temp_max, temp_min, temp_avg, rh_avg</code>)
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label className="form-label">Data Provenance Attribution</label>
                  <select
                    className="form-select"
                    value={weatherProvenance}
                    onChange={(e) => setWeatherProvenance(e.target.value)}
                  >
                    <option value="PUBLIC_HISTORICAL_REANALYSIS">Public Historical Reanalysis (NASA POWER / ERA5 / IMD)</option>
                    <option value="REAL_STATION">Real Local Automatic Weather Station (AWS)</option>
                    <option value="USER_SCOUTED">User / Field Survey Measurements</option>
                    <option value="SYNTHETIC_DEMO">Synthetic Benchmark Data (Clearly Labeled Demo)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="btn btn-pro-primary w-100 py-2 fw-semibold"
                  disabled={uploading || !weatherFile}
                >
                  {uploading ? (
                    <span><span className="spinner-border spinner-border-sm me-2"></span>Validating & Ingesting...</span>
                  ) : (
                    <span><i className="bi bi-cloud-arrow-up-fill me-2"></i>Upload & Validate Weather CSV</span>
                  )}
                </button>
              </form>
            </div>
          </div>

          <div className="col-12 col-lg-6">
            <div className="card shadow-sm border-0 p-4 h-100 bg-light">
              <h6 className="font-heading fw-bold text-dark mb-2">Ingestion & Validation Rules</h6>
              <ul className="small text-secondary mb-3 d-flex flex-column gap-2">
                <li><strong>Taluk Resolution:</strong> Coordinates or taluk names must match the 11 designated Madurai administrative subdivisions.</li>
                <li><strong>Temperature Bounds:</strong> <code>temp_min</code> cannot exceed <code>temp_max</code>. Values checked against realistic agroclimatic ranges (-5°C to 55°C).</li>
                <li><strong>Relative Humidity:</strong> Must fall strictly within 0% to 100%.</li>
                <li><strong>Provenance Tracking:</strong> Transparently tags real ground survey data vs synthetic demonstration entries.</li>
              </ul>

              {uploadResult && (
                <div className={`alert ${uploadResult.status === 'SUCCESS' ? 'alert-success' : uploadResult.status === 'PARTIAL' ? 'alert-warning' : 'alert-danger'} p-3 mt-auto mb-0`}>
                  <div className="fw-bold mb-1">
                    Upload Batch #{uploadResult.batch_id} &bull; Status: {uploadResult.status}
                  </div>
                  <div className="small">
                    <strong>Accepted Records:</strong> {uploadResult.valid_rows} / {uploadResult.total_rows}
                  </div>
                  {uploadResult.rejected_rows > 0 && (
                    <div className="small text-danger mt-1">
                      <strong>Rejected Records:</strong> {uploadResult.rejected_rows} (See error log below)
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Observation Upload Tab */}
      {activeTab === 'observation' && (
        <div className="row g-4">
          <div className="col-12 col-lg-6">
            <div className="card shadow-sm border-0 p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="font-heading fw-bold mb-0 text-dark">Upload Field Scouting Observations</h5>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => downloadSampleTemplate('observation')}
                >
                  <i className="bi bi-download me-1"></i> CSV Template
                </button>
              </div>

              <form onSubmit={handleObsSubmit}>
                <div className="mb-3">
                  <label className="form-label">Select Observations CSV File</label>
                  <input
                    type="file"
                    className="form-control"
                    accept=".csv"
                    onChange={(e) => setObsFile(e.target.files[0])}
                    required
                  />
                  {obsFile && obsFile.name.toLowerCase().includes('weather') ? (
                    <div className="alert alert-warning py-2 px-3 small mt-2 mb-0 animate-pop">
                      <i className="bi bi-exclamation-triangle-fill me-1 text-warning"></i>
                      <strong>Wrong File Type:</strong> You selected <code>{obsFile.name}</code> which is a Weather file! Please upload <strong><code>madurai_field_scouting_observations.csv</code></strong> here, or switch to the <strong>"Weather CSV Ingestion"</strong> tab above.
                    </div>
                  ) : (
                    <div className="form-text small text-muted">
                      Expected file: <strong><code>data/raw/madurai_field_scouting_observations.csv</code></strong> (Must include: <code>observation_date, latitude, longitude, crop_name, disease_name, severity_score_ses</code>)
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label className="form-label">Data Provenance Attribution</label>
                  <select
                    className="form-select"
                    value={obsProvenance}
                    onChange={(e) => setObsProvenance(e.target.value)}
                  >
                    <option value="REAL_FIELD_SURVEY">Real Ground Field Survey (TNAU / Extension Office)</option>
                    <option value="USER_SCOUTED">Field Scout Observation Entry</option>
                    <option value="SYNTHETIC_DEMO">Synthetic Benchmark Data (Clearly Labeled Demo)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="btn btn-pro-primary w-100 py-2 fw-semibold"
                  disabled={uploading || !obsFile}
                >
                  {uploading ? (
                    <span><span className="spinner-border spinner-border-sm me-2"></span>Validating & Ingesting...</span>
                  ) : (
                    <span><i className="bi bi-cloud-arrow-up-fill me-2"></i>Upload & Validate Observations CSV</span>
                  )}
                </button>
              </form>
            </div>
          </div>

          <div className="col-12 col-lg-6">
            <div className="card shadow-sm border-0 p-4 h-100 bg-light">
              <h6 className="font-heading fw-bold text-dark mb-2">Spatial Point-in-Polygon Verification</h6>
              <p className="small text-secondary mb-3">
                Uploaded latitude and longitude coordinates are indexed through the Shapely <code>STRtree</code> Point-in-Polygon engine. Any coordinates falling outside Madurai District boundary are rejected with an explicit rejection log.
              </p>

              {uploadResult && (
                <div className={`alert ${uploadResult.status === 'SUCCESS' ? 'alert-success' : uploadResult.status === 'PARTIAL' ? 'alert-warning' : 'alert-danger'} p-3 mt-auto mb-0`}>
                  <div className="fw-bold mb-1">
                    Upload Batch #{uploadResult.batch_id} &bull; Status: {uploadResult.status}
                  </div>
                  <div className="small">
                    <strong>Accepted Records:</strong> {uploadResult.valid_rows} / {uploadResult.total_rows}
                  </div>
                  {uploadResult.rejected_rows > 0 && (
                    <div className="small text-danger mt-1">
                      <strong>Rejected Records:</strong> {uploadResult.rejected_rows} (Spatial or SES score violations)
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Batch History Tab */}
      {activeTab === 'history' && (
        <div className="card shadow-sm border-0 p-4">
          <h5 className="font-heading fw-bold mb-3 text-dark">Dataset Upload Audit Log</h5>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Batch ID</th>
                  <th>File Name</th>
                  <th>Dataset Type</th>
                  <th>Total Rows</th>
                  <th>Accepted</th>
                  <th>Rejected</th>
                  <th>Provenance</th>
                  <th>Timestamp</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {batchHistory.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center text-muted py-4">No batch uploads recorded yet.</td>
                  </tr>
                ) : (
                  batchHistory.map((b) => (
                    <tr key={b.id}>
                      <td className="fw-bold font-mono">#{b.id}</td>
                      <td>{b.file_name}</td>
                      <td><span className="badge bg-light text-dark border">{b.batch_type}</span></td>
                      <td>{b.total_records}</td>
                      <td><span className="badge badge-risk-low">{b.accepted_records}</span></td>
                      <td>
                        {b.rejected_records > 0 ? (
                          <span className="badge badge-risk-severe">{b.rejected_records}</span>
                        ) : (
                          <span className="badge bg-light text-muted border">0</span>
                        )}
                      </td>
                      <td><span className="small text-muted font-mono" style={{ fontSize: '0.72rem' }}>{b.data_provenance}</span></td>
                      <td className="small text-muted">{new Date(b.uploaded_at).toLocaleString()}</td>
                      <td>
                        {b.errors && b.errors.length > 0 && (
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => setSelectedBatchErrors(b.errors)}
                          >
                            View Errors ({b.errors.length})
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Row Error Log Box */}
      {uploadResult && uploadResult.errors && uploadResult.errors.length > 0 && (
        <div className="card shadow-sm border-danger border-2 mt-4 p-4">
          <h6 className="font-heading fw-bold text-danger mb-2">
            <i className="bi bi-exclamation-triangle-fill me-1"></i> Row Rejection Details ({uploadResult.errors.length} Errors Detected)
          </h6>
          <div className="table-responsive" style={{ maxHeight: '250px' }}>
            <table className="table table-sm table-bordered mb-0 small">
              <thead className="table-danger">
                <tr>
                  <th>Row #</th>
                  <th>Field / Value</th>
                  <th>Rejection Reason</th>
                </tr>
              </thead>
              <tbody>
                {uploadResult.errors.map((err, idx) => (
                  <tr key={idx}>
                    <td>{err.row_index}</td>
                    <td><code>{err.invalid_value || err.field_name || 'N/A'}</code></td>
                    <td className="text-danger">{err.rejection_reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Batch History Error Modal */}
      {selectedBatchErrors && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title font-heading">Batch Rejection Logs</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedBatchErrors(null)}></button>
              </div>
              <div className="modal-body">
                <div className="table-responsive">
                  <table className="table table-sm table-hover small">
                    <thead>
                      <tr>
                        <th>Row #</th>
                        <th>Field / Value</th>
                        <th>Rejection Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedBatchErrors.map((e, idx) => (
                        <tr key={idx}>
                          <td>{e.row_index}</td>
                          <td><code>{e.invalid_value || e.field_name || 'N/A'}</code></td>
                          <td className="text-danger">{e.rejection_reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelectedBatchErrors(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataManagerPage;
