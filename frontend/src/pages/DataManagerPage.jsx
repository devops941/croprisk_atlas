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
    <div className="container px-4 py-4">
      <div className="mb-4 pb-2 border-bottom">
        <h2 className="fw-bold mb-1 text-dark">Spatial & Field Data Ingestion Hub</h2>
        <p className="text-muted mb-0">
          Upload and validate CSV datasets &bull; Strict integrity validation &bull; Audit trail logging
        </p>
      </div>

      {/* Tabs */}
      <ul className="nav nav-pills mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'weather' ? 'active bg-success' : 'text-secondary'}`}
            onClick={() => { setActiveTab('weather'); setUploadResult(null); }}
          >
            <i className="bi bi-cloud-sun me-1"></i> Weather CSV Ingestion
          </button>
        </li>
        <li className="nav-item ms-2">
          <button
            className={`nav-link ${activeTab === 'observation' ? 'active bg-success' : 'text-secondary'}`}
            onClick={() => { setActiveTab('observation'); setUploadResult(null); }}
          >
            <i className="bi bi-clipboard2-pulse me-1"></i> Field Scouting CSV Ingestion
          </button>
        </li>
        <li className="nav-item ms-2">
          <button
            className={`nav-link ${activeTab === 'history' ? 'active bg-success' : 'text-secondary'}`}
            onClick={() => { setActiveTab('history'); setUploadResult(null); }}
          >
            <i className="bi bi-clock-history me-1"></i> Upload Audit History ({batchHistory.length})
          </button>
        </li>
      </ul>

      {/* Weather Upload Tab */}
      {activeTab === 'weather' && (
        <div className="row g-4">
          <div className="col-12 col-lg-6">
            <div className="card shadow-sm border-0 p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">Upload Weather Dataset</h5>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-success"
                  onClick={() => downloadSampleTemplate('weather')}
                >
                  <i className="bi bi-download me-1"></i> Download Template
                </button>
              </div>

              <form onSubmit={handleWeatherSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Select CSV File</label>
                  <input
                    type="file"
                    className="form-control"
                    accept=".csv"
                    onChange={(e) => setWeatherFile(e.target.files[0])}
                    required
                  />
                  <div className="form-text">Must contain taluk_name, record_date, temp_max, temp_min, temp_avg, rh_avg</div>
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-semibold">Data Provenance Attribution</label>
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
                  className="btn btn-success w-100 py-2 fw-semibold"
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
              <h6 className="fw-bold text-dark mb-2">Ingestion & Validation Rules</h6>
              <ul className="small text-secondary mb-3">
                <li className="mb-1"><strong>Taluk Resolution:</strong> Coordinates or taluk names must match the 11 designated Madurai subdivisions.</li>
                <li className="mb-1"><strong>Temperature Boundaries:</strong> <code>temp_min</code> cannot exceed <code>temp_max</code>. Values checked against reasonable agro-climatic ranges (-5°C to 55°C).</li>
                <li className="mb-1"><strong>Humidity Bounds:</strong> Relative humidity must fall strictly within 0% to 100%.</li>
                <li className="mb-1"><strong>Provenance Tracking:</strong> Strictly separates ground-verified observations from synthetic demonstration data.</li>
              </ul>

              {uploadResult && (
                <div className={`alert ${uploadResult.status === 'SUCCESS' ? 'alert-success' : uploadResult.status === 'PARTIAL' ? 'alert-warning' : 'alert-danger'} p-3 mt-auto`}>
                  <div className="fw-bold mb-1">
                    Upload Batch #{uploadResult.batch_id} &bull; Status: {uploadResult.status}
                  </div>
                  <div className="small">
                    <strong>Accepted Records:</strong> {uploadResult.valid_rows} / {uploadResult.total_rows}
                  </div>
                  {uploadResult.rejected_rows > 0 && (
                    <div className="small text-danger mt-1">
                      <strong>Rejected Records:</strong> {uploadResult.rejected_rows} (See errors below)
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
                <h5 className="fw-bold mb-0">Upload Field Scouting Observations</h5>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-success"
                  onClick={() => downloadSampleTemplate('observation')}
                >
                  <i className="bi bi-download me-1"></i> Download Template
                </button>
              </div>

              <form onSubmit={handleObsSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Select CSV File</label>
                  <input
                    type="file"
                    className="form-control"
                    accept=".csv"
                    onChange={(e) => setObsFile(e.target.files[0])}
                    required
                  />
                  <div className="form-text">Must contain observation_date, latitude, longitude, crop_name, disease_name, severity_score_ses</div>
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-semibold">Data Provenance Attribution</label>
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
                  className="btn btn-success w-100 py-2 fw-semibold"
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
              <h6 className="fw-bold text-dark mb-2">Spatial Point-in-Polygon Verification</h6>
              <p className="small text-secondary mb-3">
                Uploaded latitude and longitude coordinates are processed through the Shapely <code>STRtree</code> spatial index. Any coordinates falling outside Madurai District boundary are rejected with an explicit rejection log.
              </p>

              {uploadResult && (
                <div className={`alert ${uploadResult.status === 'SUCCESS' ? 'alert-success' : uploadResult.status === 'PARTIAL' ? 'alert-warning' : 'alert-danger'} p-3 mt-auto`}>
                  <div className="fw-bold mb-1">
                    Upload Batch #{uploadResult.batch_id} &bull; Status: {uploadResult.status}
                  </div>
                  <div className="small">
                    <strong>Accepted Records:</strong> {uploadResult.valid_rows} / {uploadResult.total_rows}
                  </div>
                  {uploadResult.rejected_rows > 0 && (
                    <div className="small text-danger mt-1">
                      <strong>Rejected Records:</strong> {uploadResult.rejected_rows} (Spatial or SES violations)
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
          <h5 className="fw-bold mb-3">Dataset Upload Audit Log</h5>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small">
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
                      <td className="fw-bold">#{b.id}</td>
                      <td>{b.file_name}</td>
                      <td><span className="badge bg-light text-dark">{b.batch_type}</span></td>
                      <td>{b.total_records}</td>
                      <td><span className="badge bg-success">{b.accepted_records}</span></td>
                      <td>
                        {b.rejected_records > 0 ? (
                          <span className="badge bg-danger">{b.rejected_records}</span>
                        ) : (
                          <span className="badge bg-secondary">0</span>
                        )}
                      </td>
                      <td><span className="small text-muted">{b.data_provenance}</span></td>
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

      {/* Upload Errors Modal / Alert Box */}
      {uploadResult && uploadResult.errors && uploadResult.errors.length > 0 && (
        <div className="card shadow-sm border-danger border-2 mt-4 p-4">
          <h6 className="fw-bold text-danger mb-2">
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
                <h5 className="modal-title">Batch Rejection Logs</h5>
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
