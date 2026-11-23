import React, { useState, useEffect } from 'react';
import { getCrops, getDiseases, createObservation, getObservations, validateCoordinatePoint, formatApiError } from '../api/apiClient';

const ScoutingPage = () => {
  const [crops, setCrops] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [observations, setObservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [gpsLocating, setGpsLocating] = useState(false);

  // Form State
  const [latitude, setLatitude] = useState(9.998);
  const [longitude, setLongitude] = useState(78.330);
  const [cropId, setCropId] = useState('');
  const [diseaseId, setDiseaseId] = useState('');
  const [growthStage, setGrowthStage] = useState('Tillering');
  const [diseasePresent, setDiseasePresent] = useState(true);
  const [severitySes, setSeveritySes] = useState(3);
  const [incidencePct, setIncidencePct] = useState(15.0);
  const [observerName, setObserverName] = useState('Extension Officer');
  const [notes, setNotes] = useState('');
  const [provenance, setProvenance] = useState('USER_SCOUTED');
  const [obsDate, setObsDate] = useState(new Date().toISOString().split('T')[0]);

  // Spatial Validation State
  const [validationResult, setValidationResult] = useState(null);

  // Madurai District bounding coordinates check helper
  const isWithinMaduraiBounds = (lat, lon) => {
    const numLat = parseFloat(lat);
    const numLon = parseFloat(lon);
    return !isNaN(numLat) && !isNaN(numLon) && numLat >= 9.40 && numLat <= 10.50 && numLon >= 77.60 && numLon <= 78.60;
  };

  // Presets for quick field location selection
  const testingPresets = [
    { label: 'Melur', lat: 9.998, lon: 78.330 },
    { label: 'Madurai East', lat: 9.955, lon: 78.185 },
    { label: 'Vadipatti', lat: 10.052, lon: 77.965 },
    { label: 'Peraiyur', lat: 9.715, lon: 77.720 },
    { label: 'Thirumangalam', lat: 9.824, lon: 77.989 }
  ];

  // IRRI SES 0-9 Scale Descriptions
  const irriScaleDescriptions = {
    0: { label: 'Healthy / Immune', desc: 'No symptoms or lesions observed. Clean foliage.', color: 'text-success' },
    1: { label: 'Resistant (Very Mild)', desc: 'Small brown specks of pin-point size without sporulation.', color: 'text-success' },
    2: { label: 'Moderately Resistant', desc: 'Slightly larger brown specks, restricted lesions.', color: 'text-info' },
    3: { label: 'Mild Infection', desc: 'Small roundish necrotic lesions with greyish center, <5% leaf area.', color: 'text-info' },
    4: { label: 'Moderate Symptoms', desc: 'Spindle-shaped blast spots typical of pathogen, 5-10% leaf area.', color: 'text-warning' },
    5: { label: 'Moderate-High Severity', desc: 'Spindle-shaped lesions coalescing, 11-25% leaf area affected.', color: 'text-warning' },
    6: { label: 'High Infection', desc: 'Numerous coalescing lesions on top leaves, 26-50% area necrosis.', color: 'text-danger' },
    7: { label: 'Severe Blight', desc: 'Lesions covering 51-75% leaf area. Rapid chlorosis.', color: 'text-danger' },
    8: { label: 'Very Severe Blight', desc: 'Extensive coalescence, leaves largely dead or withered.', color: 'text-danger' },
    9: { label: 'Total Crop Collapse', desc: 'Complete leaf necrosis, lodging, plant death.', color: 'text-danger' }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const [cList, dList, obsList] = await Promise.all([
          getCrops(),
          getDiseases(),
          getObservations()
        ]);
        setCrops(cList);
        setDiseases(dList);
        setObservations(obsList);
        if (cList.length > 0) setCropId(cList[0].id);
        if (dList.length > 0) setDiseaseId(dList[0].id);
      } catch (err) {
        console.error('Initialization error:', err);
      }
    };
    init();
  }, []);

  const handleValidateCoordinates = async (latArg, lonArg) => {
    const lat = latArg !== undefined ? latArg : parseFloat(latitude);
    const lon = lonArg !== undefined ? lonArg : parseFloat(longitude);
    try {
      const res = await validateCoordinatePoint(lat, lon);
      setValidationResult(res);
    } catch (err) {
      setValidationResult({ is_valid: false, error_message: 'Spatial verification engine unreachable.' });
    }
  };

  const handleUseDeviceGps = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setGpsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(4));
        const lon = parseFloat(pos.coords.longitude.toFixed(4));
        setLatitude(lat);
        setLongitude(lon);
        setGpsLocating(false);
        if (!isWithinMaduraiBounds(lat, lon)) {
          setValidationResult({
            is_valid: false,
            error_message: `Your device GPS (${lat}°N, ${lon}°E) is outside Madurai District. For field testing, please click a Madurai preset (e.g. Melur or Vadipatti).`
          });
        } else {
          handleValidateCoordinates(lat, lon);
        }
      },
      (err) => {
        setGpsLocating(false);
        alert(`Could not acquire GPS: ${err.message}. Please enter coordinates manually or use preset buttons.`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const applyPreset = (preset) => {
    setLatitude(preset.lat);
    setLongitude(preset.lon);
    if (!isWithinMaduraiBounds(preset.lat, preset.lon)) {
      setValidationResult({
        is_valid: false,
        error_message: `Notice: ${preset.label} (${preset.lat}°N, ${preset.lon}°E) is deliberately outside Madurai for testing boundary rejection.`
      });
    } else {
      setValidationResult({
        is_valid: true,
        taluk_name: preset.label
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const latNum = parseFloat(latitude);
    const lonNum = parseFloat(longitude);
    if (isNaN(latNum) || isNaN(lonNum)) {
      alert('Please enter valid numeric latitude and longitude coordinates.');
      return;
    }
    if (!isWithinMaduraiBounds(latNum, lonNum)) {
      alert(
        `Boundary Check Rejected:\nCoordinates (${latNum}°N, ${lonNum}°E) fall outside Madurai District boundaries (accepted range: 9.40°N-10.50°N, 77.60°E-78.60°E).\n\nPlease select one of the Madurai presets (e.g., Melur, Vadipatti, or Madurai East) to log observations.`
      );
      return;
    }
    try {
      setLoading(true);
      const payload = {
        crop_id: parseInt(cropId),
        disease_id: parseInt(diseaseId),
        observation_date: obsDate,
        latitude: latNum,
        longitude: lonNum,
        growth_stage: growthStage,
        disease_present: diseasePresent,
        severity_score_ses: parseInt(severitySes),
        incidence_percentage: parseFloat(incidencePct),
        observer_name: observerName,
        notes: notes || null,
        data_provenance: provenance
      };

      const created = await createObservation(payload);
      setObservations([created, ...observations]);
      alert(`Observation saved successfully in Taluk: ${created.taluk_name || 'Madurai'}!`);
      setNotes('');
      setValidationResult(null);
    } catch (err) {
      alert(`Submission error:\n${formatApiError(err, 'Failed to save field observation.')}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid px-3 px-lg-4 py-4">
      {/* Title & Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-3 border-bottom gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-success text-white px-2 py-1 small" style={{ fontSize: '0.72rem' }}>
              FIELD TELEMETRY
            </span>
            <span className="text-secondary small">&bull;</span>
            <span className="text-secondary small">Point-in-Polygon Administrative Mapping</span>
          </div>
          <h2 className="font-heading fw-bold mb-1 text-dark">
            Mobile Field Scouting & Ground Verification Tool
          </h2>
          <p className="text-muted small mb-0">
            Log standardized ground truth observations using the <strong>IRRI Standard Evaluation System (SES 0-9)</strong>.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-light text-secondary border px-3 py-2 small">
            <i className="bi bi-pin-map text-danger me-1"></i> Total Recorded Points: <strong>{observations.length}</strong>
          </span>
        </div>
      </div>

      <div className="row g-4">
        {/* Left Form Column */}
        <div className="col-12 col-lg-7">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-slate-900 text-white py-3 d-flex justify-content-between align-items-center"
                 style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-geo-alt-fill text-success fs-5"></i>
                <h5 className="font-heading fw-bold mb-0 text-white">Log New Field Observation</h5>
              </div>
              <span className="badge bg-secondary-subtle text-dark small" style={{ fontSize: '0.7rem' }}>
                Spatial Coordinates
              </span>
            </div>

            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                {/* Coordinates & Testing Presets */}
                <div className="mb-4 p-3 bg-light rounded-3 border">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="form-label mb-0">
                      <i className="bi bi-crosshair text-danger me-1"></i> Field Coordinates (Lat / Lon)
                    </label>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary py-0 px-2 small"
                      style={{ fontSize: '0.75rem' }}
                      onClick={handleUseDeviceGps}
                      disabled={gpsLocating}
                    >
                      {gpsLocating ? (
                        <span><span className="spinner-border spinner-border-sm me-1"></span>Acquiring...</span>
                      ) : (
                        <span><i className="bi bi-cursor-fill me-1"></i>Use Device GPS</span>
                      )}
                    </button>
                  </div>

                  {/* Preset Pills */}
                  <div className="d-flex flex-wrap gap-1 mb-3">
                    <span className="small text-muted me-1 align-self-center" style={{ fontSize: '0.72rem' }}>Preset Locations:</span>
                    {testingPresets.map((preset, idx) => {
                      const isActive = parseFloat(latitude) === preset.lat && parseFloat(longitude) === preset.lon;
                      return (
                        <button
                          key={idx}
                          type="button"
                          className={`btn btn-sm py-0 px-2 ${isActive ? 'btn-success text-white fw-bold shadow-xs' : 'btn-light border text-secondary'}`}
                          style={{ fontSize: '0.75rem' }}
                          onClick={() => applyPreset(preset)}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="row g-2 mb-2">
                    <div className="col-12 col-sm-6">
                      <div className="input-group input-group-sm">
                        <span className="input-group-text font-mono">Lat:</span>
                        <input
                          type="number"
                          step="0.0001"
                          className="form-control font-mono"
                          value={latitude}
                          onChange={(e) => {
                            setLatitude(e.target.value);
                            setValidationResult(null);
                          }}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-12 col-sm-6">
                      <div className="input-group input-group-sm">
                        <span className="input-group-text font-mono">Lon:</span>
                        <input
                          type="number"
                          step="0.0001"
                          className="form-control font-mono"
                          value={longitude}
                          onChange={(e) => {
                            setLongitude(e.target.value);
                            setValidationResult(null);
                          }}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {!isWithinMaduraiBounds(latitude, longitude) && (
                    <div className="alert alert-warning py-2 px-3 small mt-2 mb-3 d-flex align-items-center gap-2">
                      <i className="bi bi-exclamation-triangle-fill text-warning fs-5"></i>
                      <div className="small">
                        <strong>Outside Madurai District Bounds:</strong> ({latitude}, {longitude}) is outside monitored limits (9.40°N–10.50°N, 77.60°E–78.60°E).
                        <br />
                        <span className="text-secondary">Please click a preset above (e.g. <strong>Melur</strong> or <strong>Vadipatti</strong>) to load valid coordinates.</span>
                      </div>
                    </div>
                  )}

                  <div className="d-flex justify-content-between align-items-center">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleValidateCoordinates(parseFloat(latitude), parseFloat(longitude))}
                    >
                      <i className="bi bi-shield-check me-1"></i> Verify Location
                    </button>

                    {validationResult && (
                      <div className="animate-pop">
                        {validationResult.is_valid ? (
                          <span className="badge badge-risk-low px-2 py-1 shadow-xs">
                            <i className="bi bi-check-circle-fill me-1"></i> Assigned Taluk: <strong>{validationResult.taluk_name}</strong>
                          </span>
                        ) : (
                          <span className="badge badge-risk-severe px-2 py-1 shadow-xs animate-pulse-glow-danger">
                            <i className="bi bi-exclamation-octagon-fill me-1"></i> {validationResult.error_message || 'Outside Madurai Bounding Box'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Target Crop & Disease */}
                <div className="row g-3 mb-3">
                  <div className="col-12 col-sm-6">
                    <label className="form-label">Crop Species</label>
                    <select
                      className="form-select form-select-sm"
                      value={cropId}
                      onChange={(e) => setCropId(e.target.value)}
                      required
                    >
                      {crops.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.scientific_name})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label">Target Pathogen</label>
                    <select
                      className="form-select form-select-sm"
                      value={diseaseId}
                      onChange={(e) => setDiseaseId(e.target.value)}
                      required
                    >
                      {diseases.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.scientific_name})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Phenological Stage & Date */}
                <div className="row g-3 mb-3">
                  <div className="col-12 col-sm-6">
                    <label className="form-label">Growth Stage</label>
                    <select
                      className="form-select form-select-sm"
                      value={growthStage}
                      onChange={(e) => setGrowthStage(e.target.value)}
                    >
                      <option value="Nursery / Seedling">Nursery / Seedling</option>
                      <option value="Tillering">Tillering (High Blast Risk)</option>
                      <option value="Panicle Initiation">Panicle Initiation</option>
                      <option value="Flowering / Heading">Flowering / Heading (Neck Blast)</option>
                      <option value="Grain Filling / Maturation">Grain Filling / Maturation</option>
                    </select>
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label">Survey Date</label>
                    <input
                      type="date"
                      className="form-control form-control-sm"
                      value={obsDate}
                      onChange={(e) => setObsDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Disease Presence Checkbox */}
                <div className="form-check form-switch mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="diseaseCheck"
                    checked={diseasePresent}
                    onChange={(e) => {
                      setDiseasePresent(e.target.checked);
                      if (!e.target.checked) {
                        setSeveritySes(0);
                        setIncidencePct(0);
                      }
                    }}
                  />
                  <label className="form-check-label fw-semibold text-dark small" htmlFor="diseaseCheck">
                    Macroscopic Symptoms Present on Leaves / Panicles
                  </label>
                </div>

                {/* IRRI SES Severity Interactive Slider */}
                {diseasePresent && (
                  <div className="mb-4 p-3 bg-light rounded-3 border">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <label className="form-label mb-0">IRRI Standard Evaluation System (SES Score)</label>
                      <span className="badge bg-danger fs-6 px-2 py-0">Score: {severitySes} / 9</span>
                    </div>

                    <input
                      type="range"
                      className="form-range"
                      min="0"
                      max="9"
                      step="1"
                      value={severitySes}
                      onChange={(e) => setSeveritySes(e.target.value)}
                    />

                    {/* Dynamic Symptom Visual Card */}
                    <div className="p-2 rounded bg-white border small mt-2">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <strong className={irriScaleDescriptions[severitySes]?.color || 'text-dark'}>
                          SES {severitySes}: {irriScaleDescriptions[severitySes]?.label}
                        </strong>
                        <span className="badge bg-light text-secondary border">IRRI Standard</span>
                      </div>
                      <div className="text-secondary" style={{ fontSize: '0.8rem' }}>
                        {irriScaleDescriptions[severitySes]?.desc}
                      </div>
                    </div>

                    {/* Field Incidence Percentage */}
                    <div className="mt-3">
                      <label className="form-label">Estimated Canopy Incidence (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        className="form-control form-control-sm"
                        value={incidencePct}
                        onChange={(e) => setIncidencePct(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* Observer Details & Provenance */}
                <div className="row g-3 mb-3">
                  <div className="col-12 col-sm-6">
                    <label className="form-label">Observer Designation</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={observerName}
                      onChange={(e) => setObserverName(e.target.value)}
                    />
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label">Data Provenance Tag</label>
                    <select
                      className="form-select form-select-sm"
                      value={provenance}
                      onChange={(e) => setProvenance(e.target.value)}
                    >
                      <option value="USER_SCOUTED">Field Scout Observation</option>
                      <option value="REAL_FIELD_SURVEY">Validated Ground Survey</option>
                      <option value="PUBLIC_HISTORICAL_REANALYSIS">Historical Reanalysis</option>
                    </select>
                  </div>
                </div>

                {/* Notes */}
                <div className="mb-4">
                  <label className="form-label">Agronomic Notes & Symptoms</label>
                  <textarea
                    className="form-control form-control-sm"
                    rows="2"
                    placeholder="e.g., Symptoms observed on young tillers, morning dew heavy, nitrogen over-fertilization noted..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="btn btn-pro-primary w-100 py-2 fw-semibold"
                  disabled={loading}
                >
                  {loading ? (
                    <span><span className="spinner-border spinner-border-sm me-2"></span>Recording Observation...</span>
                  ) : (
                    <span><i className="bi bi-cloud-arrow-up-fill me-2"></i>Submit Ground Observation</span>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right Logged Records Table */}
        <div className="col-12 col-lg-5">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <div>
                <h5 className="font-heading fw-bold mb-0 text-dark">
                  <i className="bi bi-clock-history text-success me-2"></i>
                  Ground Truth Database
                </h5>
                <span className="small text-muted" style={{ fontSize: '0.75rem' }}>
                  Live observations stored in SQLite engine
                </span>
              </div>
              <span className="badge bg-light text-secondary border">{observations.length} Entries</span>
            </div>

            <div className="card-body p-0">
              <div className="table-responsive" style={{ maxHeight: '680px' }}>
                <table className="table table-hover align-middle mb-0">
                  <thead className="sticky-top bg-light">
                    <tr>
                      <th>Taluk</th>
                      <th>Severity</th>
                      <th>Incidence</th>
                      <th>Stage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {observations.map((obs) => (
                      <tr key={obs.id}>
                        <td>
                          <div className="fw-semibold text-dark">{obs.taluk_name}</div>
                          <div className="text-muted font-mono" style={{ fontSize: '0.68rem' }}>
                            {obs.latitude.toFixed(3)}, {obs.longitude.toFixed(3)}
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${obs.severity_score_ses === 0 ? 'badge-risk-low' : obs.severity_score_ses <= 3 ? 'badge-risk-moderate' : 'badge-risk-severe'}`}>
                            SES {obs.severity_score_ses}
                          </span>
                        </td>
                        <td className="small text-secondary">{obs.incidence_percentage}%</td>
                        <td>
                          <span className="badge bg-light text-dark border small" style={{ fontSize: '0.7rem' }}>
                            {obs.growth_stage}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoutingPage;
