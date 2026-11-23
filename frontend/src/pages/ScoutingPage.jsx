import React, { useState, useEffect } from 'react';
import { getCrops, getDiseases, createObservation, getObservations, validateCoordinatePoint } from '../api/apiClient';

const ScoutingPage = () => {
  const [crops, setCrops] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [observations, setObservations] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [latitude, setLatitude] = useState(9.985);
  const [longitude, setLongitude] = useState(78.145);
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

  const handleValidateCoordinates = async () => {
    try {
      const res = await validateCoordinatePoint(parseFloat(latitude), parseFloat(longitude));
      setValidationResult(res);
    } catch (err) {
      setValidationResult({ is_valid: false, error_message: 'Validation service unreachable.' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        crop_id: parseInt(cropId),
        disease_id: parseInt(diseaseId),
        observation_date: obsDate,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
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
      alert(`Observation saved successfully in Taluk: ${created.taluk_name}!`);
      setNotes('');
    } catch (err) {
      alert(`Submission error: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getSesLabel = (score) => {
    switch (score) {
      case 0: return '0 - No lesion observed (Immune/Healthy)';
      case 1: return '1 - Small brown specks of pin-point size (< 0.5 mm)';
      case 2: return '2 - Larger brown specks without sporulating center';
      case 3: return '3 - Small roundish to slightly elongated necrotic gray spots';
      case 4: return '4 - Typical spindle blast lesions (< 2% leaf area)';
      case 5: return '5 - Typical blast lesions infecting 2-10% leaf area';
      case 6: return '6 - Typical blast lesions infecting 11-25% leaf area';
      case 7: return '7 - Typical blast lesions infecting 26-50% leaf area';
      case 8: return '8 - Lesions coalescing, 51-75% leaf area killed';
      case 9: return '9 - Extensive lodging, > 75% leaf area killed';
      default: return `SES ${score}`;
    }
  };

  return (
    <div className="container px-4 py-4">
      <div className="mb-4 pb-2 border-bottom">
        <h2 className="fw-bold mb-1 text-dark">Field Scouting & Ground Truth Recording</h2>
        <p className="text-muted mb-0">
          Submit single field observations with Point-in-Polygon Taluk validation and IRRI SES severity scoring.
        </p>
      </div>

      <div className="row g-4">
        {/* Left Column: Form */}
        <div className="col-12 col-lg-6">
          <div className="card shadow-sm border-0 p-4">
            <h5 className="fw-bold mb-3 text-dark">Log Field Observation</h5>
            <form onSubmit={handleSubmit}>
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-semibold">Target Crop</label>
                  <select className="form-select form-select-sm" value={cropId} onChange={(e) => setCropId(e.target.value)}>
                    {crops.map((c) => (
                      <option key={c.id} value={c.id}>{c.common_name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold">Pathogen / Disease</label>
                  <select className="form-select form-select-sm" value={diseaseId} onChange={(e) => setDiseaseId(e.target.value)}>
                    {diseases.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Coordinates & PIP Check */}
              <div className="p-3 bg-light rounded mb-3">
                <label className="form-label small fw-bold text-dark mb-1">
                  GPS Coordinates (Madurai Bounds: 9.5°N - 10.35°N, 77.75°E - 78.5°E)
                </label>
                <div className="row g-2 align-items-center">
                  <div className="col-5">
                    <div className="input-group input-group-sm">
                      <span className="input-group-text">Lat</span>
                      <input
                        type="number"
                        step="0.0001"
                        className="form-control"
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-5">
                    <div className="input-group input-group-sm">
                      <span className="input-group-text">Lon</span>
                      <input
                        type="number"
                        step="0.0001"
                        className="form-control"
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary w-100"
                      onClick={handleValidateCoordinates}
                    >
                      Verify
                    </button>
                  </div>
                </div>

                {validationResult && (
                  <div className={`mt-2 small ${validationResult.is_valid ? 'text-success' : 'text-danger'}`}>
                    {validationResult.is_valid ? (
                      <span><i className="bi bi-geo-alt-fill me-1"></i> Verified in Taluk: <strong>{validationResult.taluk_name}</strong></span>
                    ) : (
                      <span><i className="bi bi-x-circle-fill me-1"></i> {validationResult.error_message}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Growth Stage & Presence */}
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-semibold">Growth Stage</label>
                  <select className="form-select form-select-sm" value={growthStage} onChange={(e) => setGrowthStage(e.target.value)}>
                    <option value="Tillering">Tillering (Active Leaf Blast)</option>
                    <option value="Panicle Initiation">Panicle Initiation</option>
                    <option value="Heading/Flowering">Heading/Flowering (Neck Blast)</option>
                    <option value="Booting">Booting</option>
                    <option value="Milk/Dough">Milk / Dough stage</option>
                    <option value="Seedling/Nursery">Seedling / Nursery</option>
                    <option value="Maturity">Maturity</option>
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold">Observation Date</label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={obsDate}
                    onChange={(e) => setObsDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Severity Slider */}
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label small fw-semibold mb-0">IRRI Standard Evaluation System (SES) Scale</label>
                  <span className="badge bg-dark">Score: {severitySes}/9</span>
                </div>
                <input
                  type="range"
                  className="form-range"
                  min="0"
                  max="9"
                  step="1"
                  value={severitySes}
                  onChange={(e) => setSeveritySes(parseInt(e.target.value))}
                />
                <div className="small text-muted fst-italic">
                  {getSesLabel(severitySes)}
                </div>
              </div>

              {/* Incidence and Observer */}
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-semibold">Field Incidence (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="100"
                    className="form-control form-control-sm"
                    value={incidencePct}
                    onChange={(e) => setIncidencePct(e.target.value)}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold">Observer Name</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={observerName}
                    onChange={(e) => setObserverName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">Field Notes & Symptoms</label>
                <textarea
                  className="form-control form-control-sm"
                  rows="2"
                  placeholder="e.g. Spindle-shaped lesions on upper leaves, grey center, water stress noted."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                ></textarea>
              </div>

              <button
                type="submit"
                className="btn btn-success w-100 py-2 fw-semibold"
                disabled={loading}
              >
                {loading ? 'Recording...' : 'Submit Field Observation'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Existing Observations Feed */}
        <div className="col-12 col-lg-6">
          <div className="card shadow-sm border-0 p-4 h-100">
            <h5 className="fw-bold mb-3 text-dark">Logged Observations ({observations.length})</h5>
            <div className="table-responsive" style={{ maxHeight: '550px' }}>
              <table className="table table-hover align-middle small mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Taluk</th>
                    <th>Date</th>
                    <th>Pathogen</th>
                    <th>SES Score</th>
                    <th>Incidence</th>
                  </tr>
                </thead>
                <tbody>
                  {observations.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center text-muted py-4">No observations recorded yet.</td>
                    </tr>
                  ) : (
                    observations.map((obs) => (
                      <tr key={obs.id}>
                        <td className="fw-bold">{obs.taluk_name}</td>
                        <td className="text-muted">{obs.observation_date}</td>
                        <td>{obs.disease_name}</td>
                        <td>
                          <span className={`badge ${obs.severity_score_ses >= 7 ? 'bg-danger' : obs.severity_score_ses >= 4 ? 'bg-warning text-dark' : 'bg-success'}`}>
                            SES {obs.severity_score_ses}
                          </span>
                        </td>
                        <td>{obs.incidence_percentage}%</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoutingPage;
