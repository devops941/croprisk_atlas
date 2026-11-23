import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Popup, Tooltip } from 'react-leaflet';
import { getDiseases, getRiskMapLayer, getObservations } from '../api/apiClient';

const MapPage = () => {
  const [diseases, setDiseases] = useState([]);
  const [selectedDiseaseId, setSelectedDiseaseId] = useState(1);
  const [assessmentDate, setAssessmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [observations, setObservations] = useState([]);
  const [selectedTaluk, setSelectedTaluk] = useState(null);
  const [showChoropleth, setShowChoropleth] = useState(true);
  const [showObservations, setShowObservations] = useState(true);
  const [loading, setLoading] = useState(false);

  // Center of Madurai District
  const maduraiCenter = [9.925, 78.119];

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const dList = await getDiseases();
        setDiseases(dList);
        if (dList.length > 0) {
          setSelectedDiseaseId(dList[0].id);
        }
      } catch (err) {
        console.error('Error fetching diseases:', err);
      }
    };
    fetchInitial();
  }, []);

  useEffect(() => {
    const loadMapData = async () => {
      if (!selectedDiseaseId) return;
      try {
        setLoading(true);
        const [layerData, obsData] = await Promise.all([
          getRiskMapLayer(selectedDiseaseId, assessmentDate),
          getObservations({ disease_id: selectedDiseaseId })
        ]);
        setGeoJsonData(layerData);
        setObservations(obsData);
      } catch (err) {
        console.error('Error loading map layers:', err);
      } finally {
        setLoading(false);
      }
    };
    loadMapData();
  }, [selectedDiseaseId, assessmentDate]);

  const styleFeature = (feature) => {
    const props = feature.properties || {};
    return {
      fillColor: props.fill_color || '#28a745',
      weight: 2,
      opacity: 1,
      color: '#ffffff',
      dashArray: '3',
      fillOpacity: showChoropleth ? props.fill_opacity || 0.6 : 0.05
    };
  };

  const onEachFeature = (feature, layer) => {
    layer.on({
      mouseover: (e) => {
        const l = e.target;
        l.setStyle({
          weight: 4,
          color: '#333',
          dashArray: '',
          fillOpacity: 0.85
        });
      },
      mouseout: (e) => {
        const l = e.target;
        l.setStyle(styleFeature(feature));
      },
      click: () => {
        setSelectedTaluk(feature.properties);
      }
    });
  };

  const getMarkerColor = (ses) => {
    if (ses === 0) return '#28a745'; // Healthy
    if (ses <= 3) return '#17a2b8'; // Mild
    if (ses <= 6) return '#ffc107'; // Moderate
    return '#dc3545'; // Severe
  };

  return (
    <div className="container-fluid px-4 py-3">
      {/* Top Filter Bar */}
      <div className="card shadow-sm p-3 mb-3 bg-white border-0">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-4">
            <label className="form-label small fw-bold text-secondary mb-1">Target Crop Pathogen</label>
            <select
              className="form-select form-select-sm"
              value={selectedDiseaseId}
              onChange={(e) => setSelectedDiseaseId(Number(e.target.value))}
            >
              {diseases.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.scientific_name})
                </option>
              ))}
            </select>
          </div>

          <div className="col-12 col-md-3">
            <label className="form-label small fw-bold text-secondary mb-1">Assessment Date</label>
            <input
              type="date"
              className="form-control form-control-sm"
              value={assessmentDate}
              onChange={(e) => setAssessmentDate(e.target.value)}
            />
          </div>

          <div className="col-12 col-md-5 d-flex align-items-center justify-content-md-end gap-3 pt-3 pt-md-0">
            <div className="form-check form-switch mb-0">
              <input
                className="form-check-input"
                type="checkbox"
                id="toggleChoropleth"
                checked={showChoropleth}
                onChange={(e) => setShowChoropleth(e.target.checked)}
              />
              <label className="form-check-label small fw-semibold" htmlFor="toggleChoropleth">
                Risk Choropleth
              </label>
            </div>

            <div className="form-check form-switch mb-0">
              <input
                className="form-check-input"
                type="checkbox"
                id="toggleObservations"
                checked={showObservations}
                onChange={(e) => setShowObservations(e.target.checked)}
              />
              <label className="form-check-label small fw-semibold" htmlFor="toggleObservations">
                Scout Markers ({observations.length})
              </label>
            </div>

            {loading && (
              <span className="spinner-border spinner-border-sm text-success" role="status"></span>
            )}
          </div>
        </div>
      </div>

      {/* Map + Detail Sidebar */}
      <div className="row g-3">
        <div className={selectedTaluk ? "col-12 col-lg-8" : "col-12"}>
          <div className="card shadow-sm border-0 p-2 position-relative">
            <MapContainer
              center={maduraiCenter}
              zoom={10}
              scrollWheelZoom={true}
              className="map-container"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Administrative GeoJSON Choropleth */}
              {geoJsonData && (
                <GeoJSON
                  key={`${selectedDiseaseId}-${assessmentDate}-${showChoropleth}`}
                  data={geoJsonData}
                  style={styleFeature}
                  onEachFeature={onEachFeature}
                />
              )}

              {/* Field Observation Markers */}
              {showObservations &&
                observations.map((obs) => (
                  <CircleMarker
                    key={obs.id}
                    center={[obs.latitude, obs.longitude]}
                    radius={7}
                    pathOptions={{
                      fillColor: getMarkerColor(obs.severity_score_ses),
                      fillOpacity: 0.9,
                      color: '#ffffff',
                      weight: 2
                    }}
                  >
                    <Popup>
                      <div className="p-1">
                        <div className="fw-bold">{obs.taluk_name} Scout Report</div>
                        <div className="small text-muted">{obs.observation_date} &bull; {obs.observer_name}</div>
                        <hr className="my-1" />
                        <div className="small"><strong>Severity:</strong> IRRI SES {obs.severity_score_ses}/9</div>
                        <div className="small"><strong>Incidence:</strong> {obs.incidence_percentage}%</div>
                        <div className="small"><strong>Stage:</strong> {obs.growth_stage}</div>
                        {obs.notes && <div className="small fst-italic mt-1 text-secondary">"{obs.notes}"</div>}
                        <div className="badge bg-secondary-subtle text-dark small mt-1">{obs.data_provenance}</div>
                      </div>
                    </Popup>
                    <Tooltip direction="top" offset={[0, -5]} opacity={0.9}>
                      {obs.taluk_name}: SES {obs.severity_score_ses}/9 ({obs.disease_present ? 'Symptoms Present' : 'Healthy'})
                    </Tooltip>
                  </CircleMarker>
                ))}
            </MapContainer>

            {/* In-Map Legend Overlay */}
            <div
              className="position-absolute bottom-0 start-0 m-4 p-2 bg-white rounded shadow-sm opacity-90 small"
              style={{ zIndex: 1000 }}
            >
              <div className="fw-bold mb-1 border-bottom pb-1">Surveillance Priority</div>
              <div className="d-flex align-items-center mb-1">
                <span className="legend-color-box" style={{ background: '#dc3545' }}></span>
                <span>High Risk (Score &ge; 0.70)</span>
              </div>
              <div className="d-flex align-items-center mb-1">
                <span className="legend-color-box" style={{ background: '#ffc107' }}></span>
                <span>Medium Risk (0.35 - 0.69)</span>
              </div>
              <div className="d-flex align-items-center mb-1">
                <span className="legend-color-box" style={{ background: '#28a745' }}></span>
                <span>Low Risk (&lt; 0.35)</span>
              </div>
              <div className="d-flex align-items-center">
                <span className="legend-color-box rounded-circle" style={{ background: '#17a2b8', width: '12px', height: '12px' }}></span>
                <span className="ms-1">Ground Observation Pin</span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Taluk Detail Drawer */}
        {selectedTaluk && (
          <div className="col-12 col-lg-4">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-header bg-success-subtle text-success-emphasis d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="fw-bold mb-0">{selectedTaluk.taluk_name}</h5>
                  <span className="small text-muted">Madurai District &bull; {selectedTaluk.assessment_date}</span>
                </div>
                <button
                  type="button"
                  className="btn-close btn-sm"
                  onClick={() => setSelectedTaluk(null)}
                ></button>
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3 p-3 bg-light rounded">
                  <div>
                    <div className="text-muted small text-uppercase fw-semibold">Risk Classification</div>
                    <div className="fs-4 fw-bold">
                      <span className={`badge ${selectedTaluk.risk_level === 'HIGH' ? 'bg-danger' : selectedTaluk.risk_level === 'MEDIUM' ? 'bg-warning text-dark' : 'bg-success'}`}>
                        {selectedTaluk.risk_level} PRIORITY
                      </span>
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="text-muted small text-uppercase fw-semibold">Calculated Score</div>
                    <div className="fs-4 fw-bold text-dark">
                      {(selectedTaluk.risk_score * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                <h6 className="fw-bold text-dark mb-2">
                  <i className="bi bi-thermometer-half text-danger me-1"></i> Dominant Environmental Driver
                </h6>
                <div className="p-2 mb-3 bg-light rounded small text-secondary">
                  {selectedTaluk.primary_risk_factor || 'No specific weather anomaly identified.'}
                </div>

                <h6 className="fw-bold text-dark mb-2">
                  <i className="bi bi-check2-all text-success me-1"></i> Agricultural Area
                </h6>
                <p className="small text-muted mb-3">
                  <strong>Estimated Paddy Command:</strong> {selectedTaluk.agri_area_ha ? `${selectedTaluk.agri_area_ha.toLocaleString()} Hectares` : 'Not recorded'}
                </p>

                <div className="alert alert-info py-2 px-3 small mb-0">
                  <i className="bi bi-info-circle-fill me-1"></i>
                  <strong>Action Directive:</strong> {selectedTaluk.risk_level === 'HIGH' ? 'Immediate dispatch of field scouting squad to inspect leaf symptoms; prepare prophylactic fungicide advisory.' : selectedTaluk.risk_level === 'MEDIUM' ? 'Increase routine scouting rounds over the next 48-72 hours.' : 'Normal periodic surveillance; conditions remain suppressive.'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapPage;
