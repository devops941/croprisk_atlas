import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Popup, Tooltip, useMap } from 'react-leaflet';
import { getDiseases, getRiskMapLayer, getObservations } from '../api/apiClient';

// Helper component to smoothly center/reset map bounds
const ChangeMapView = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

const MapPage = () => {
  const [diseases, setDiseases] = useState([]);
  const [selectedDiseaseId, setSelectedDiseaseId] = useState(1);
  const [assessmentDate, setAssessmentDate] = useState('2026-10-25');
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [observations, setObservations] = useState([]);
  const [selectedTaluk, setSelectedTaluk] = useState(null);
  const [showChoropleth, setShowChoropleth] = useState(true);
  const [showObservations, setShowObservations] = useState(true);
  const [basemap, setBasemap] = useState('positron'); // 'positron' | 'osm' | 'satellite'
  const [loading, setLoading] = useState(false);

  // Madurai District Geographic Center
  const defaultCenter = [9.925, 78.119];
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [mapZoom, setMapZoom] = useState(10);

  const basemapTiles = {
    positron: {
      name: 'CartoDB Light',
      url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap'
    },
    osm: {
      name: 'OpenStreetMap',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenStreetMap contributors'
    },
    satellite: {
      name: 'Satellite Imagery',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Esri, Maxar, Earthstar Geographics'
    }
  };

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
      fillColor: props.fill_color || '#10b981',
      weight: 1.8,
      opacity: 0.9,
      color: '#ffffff',
      dashArray: '3',
      fillOpacity: showChoropleth ? props.fill_opacity || 0.65 : 0.05
    };
  };

  const onEachFeature = (feature, layer) => {
    layer.on({
      mouseover: (e) => {
        const l = e.target;
        l.setStyle({
          weight: 3.5,
          color: '#0f172a',
          dashArray: '',
          fillOpacity: 0.88
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
    if (ses === 0) return '#10b981'; // Healthy
    if (ses <= 3) return '#0ea5e9'; // Mild
    if (ses <= 6) return '#f59e0b'; // Moderate
    return '#ef4444'; // Severe
  };

  const handleResetView = () => {
    setMapCenter([...defaultCenter]);
    setMapZoom(10);
  };

  // Find currently selected disease object
  const currentDisease = diseases.find((d) => d.id === selectedDiseaseId);

  // Quick stats from loaded layer
  const highRiskCount = geoJsonData?.features?.filter(
    (f) => f.properties?.risk_level === 'HIGH' || f.properties?.risk_level === 'SEVERE'
  ).length || 0;

  return (
    <div className="container-fluid px-3 px-lg-4 py-3">
      {/* Top Cockpit Header */}
      <div className="card shadow-sm border-0 mb-3 bg-white">
        <div className="card-body py-2 px-3">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
            
            {/* Title & Status Indicator */}
            <div className="d-flex align-items-center gap-2">
              <div className="p-2 rounded-3 bg-emerald-subtle text-success d-flex align-items-center justify-content-center"
                   style={{ backgroundColor: '#ecfdf5', width: '42px', height: '42px' }}>
                <i className="bi bi-compass fs-4 text-success"></i>
              </div>
              <div>
                <div className="d-flex align-items-center gap-2">
                  <h5 className="font-heading fw-bold mb-0 text-dark">Spatial Risk Cockpit</h5>
                  <span className="badge bg-light text-secondary border small">EPSG:4326</span>
                </div>
                <div className="small text-muted" style={{ fontSize: '0.78rem' }}>
                  Madurai District (11 Administrative Taluks) &bull; Spatial Block Analysis
                </div>
              </div>
            </div>

            {/* Pathogen Selector */}
            <div className="d-flex align-items-center gap-2">
              <span className="small fw-semibold text-secondary text-uppercase" style={{ fontSize: '0.72rem' }}>Pathogen:</span>
              <div className="btn-group shadow-xs">
                {diseases.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    className={`btn btn-sm ${selectedDiseaseId === d.id ? 'btn-pro-primary fw-semibold' : 'btn-pro-outline'}`}
                    onClick={() => setSelectedDiseaseId(d.id)}
                  >
                    <i className="bi bi-virus me-1"></i> {d.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Assessment Date & Presets */}
            <div className="d-flex align-items-center gap-2">
              <span className="small fw-semibold text-secondary text-uppercase" style={{ fontSize: '0.72rem' }}>Assessment Date:</span>
              <input
                type="date"
                className="form-control form-control-sm"
                style={{ width: '150px' }}
                value={assessmentDate}
                onChange={(e) => setAssessmentDate(e.target.value)}
              />
              <div className="btn-group btn-group-sm">
                <button
                  type="button"
                  className="btn btn-outline-secondary py-1 px-2"
                  title="Oct 25 Samba Peak Record Date"
                  onClick={() => setAssessmentDate('2026-10-25')}
                >
                  Samba Peak
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary py-1 px-2"
                  title="Today's live date"
                  onClick={() => setAssessmentDate(new Date().toISOString().split('T')[0])}
                >
                  Today
                </button>
              </div>
            </div>

            {/* Layer Controls & Basemap Switcher */}
            <div className="d-flex align-items-center gap-3">
              <div className="form-check form-switch mb-0">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="toggleChoropleth"
                  checked={showChoropleth}
                  onChange={(e) => setShowChoropleth(e.target.checked)}
                />
                <label className="form-check-label small fw-semibold text-dark" htmlFor="toggleChoropleth">
                  Risk Heatmap
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
                <label className="form-check-label small fw-semibold text-dark" htmlFor="toggleObservations">
                  Scout Pins ({observations.length})
                </label>
              </div>

              {/* Basemap Switcher */}
              <select
                className="form-select form-select-sm"
                style={{ width: '135px' }}
                value={basemap}
                onChange={(e) => setBasemap(e.target.value)}
              >
                <option value="positron">Carto Light</option>
                <option value="osm">Standard OSM</option>
                <option value="satellite">Satellite View</option>
              </select>

              <button
                type="button"
                className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                onClick={handleResetView}
                title="Reset View to Madurai Bounds"
              >
                <i className="bi bi-crosshair"></i>
                <span className="d-none d-xxl-inline">Center</span>
              </button>

              {loading && (
                <div className="spinner-border spinner-border-sm text-success" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Main Map + Inspection Drawer Layout */}
      <div className="row g-3">
        {/* Map Canvas Column */}
        <div className={selectedTaluk ? "col-12 col-xl-8" : "col-12"}>
          <div className="card shadow-sm border-0 p-1 position-relative overflow-hidden">
            
            {/* Live Map Meta Pill */}
            <div className="position-absolute top-0 start-0 m-3 z-3 bg-white bg-opacity-90 px-3 py-1 rounded-pill shadow-sm border small d-flex align-items-center gap-2">
              <span className="radar-pulse"></span>
              <span className="fw-semibold text-dark">{currentDisease?.name || 'Pathogen'} Surveillance</span>
              <span className="text-muted">&bull;</span>
              <span className="text-secondary">{assessmentDate}</span>
              {highRiskCount > 0 && (
                <span className="badge bg-danger ms-1">{highRiskCount} High Priority Taluks</span>
              )}
            </div>

            <MapContainer
              center={defaultCenter}
              zoom={10}
              scrollWheelZoom={true}
              className="map-container"
              style={{ height: '640px' }}
            >
              <ChangeMapView center={mapCenter} zoom={mapZoom} />

              <TileLayer
                attribution={basemapTiles[basemap].attribution}
                url={basemapTiles[basemap].url}
              />

              {/* Administrative GeoJSON Choropleth */}
              {geoJsonData && (
                <GeoJSON
                  key={`${selectedDiseaseId}-${assessmentDate}-${showChoropleth}-${basemap}`}
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
                    radius={8}
                    pathOptions={{
                      fillColor: getMarkerColor(obs.severity_score_ses),
                      fillOpacity: 0.95,
                      color: '#ffffff',
                      weight: 2
                    }}
                  >
                    <Popup>
                      <div className="p-2" style={{ minWidth: '220px' }}>
                        <div className="d-flex justify-content-between align-items-center border-bottom pb-1 mb-2">
                          <strong className="text-dark font-heading">{obs.taluk_name} Scout</strong>
                          <span className="badge bg-secondary-subtle text-dark small">{obs.data_provenance}</span>
                        </div>
                        <div className="small text-muted mb-2">
                          <i className="bi bi-calendar3 me-1"></i> {obs.observation_date} &bull; {obs.observer_name}
                        </div>
                        <div className="p-2 rounded bg-light mb-2 small">
                          <div className="d-flex justify-content-between mb-1">
                            <span>Disease Severity:</span>
                            <strong className="text-danger">IRRI SES {obs.severity_score_ses} / 9</strong>
                          </div>
                          <div className="d-flex justify-content-between mb-1">
                            <span>Incidence:</span>
                            <strong>{obs.incidence_percentage}%</strong>
                          </div>
                          <div className="d-flex justify-content-between">
                            <span>Crop Stage:</span>
                            <span className="badge bg-white border text-dark">{obs.growth_stage}</span>
                          </div>
                        </div>
                        {obs.notes && (
                          <div className="small fst-italic text-secondary mb-2">
                            "{obs.notes}"
                          </div>
                        )}
                        <div className="small text-muted font-mono" style={{ fontSize: '0.72rem' }}>
                          Lat: {obs.latitude.toFixed(4)}, Lon: {obs.longitude.toFixed(4)}
                        </div>
                      </div>
                    </Popup>
                    <Tooltip direction="top" offset={[0, -6]} opacity={0.95}>
                      <span className="font-heading fw-bold">{obs.taluk_name}</span> &bull; SES {obs.severity_score_ses}/9
                    </Tooltip>
                  </CircleMarker>
                ))}
            </MapContainer>

            {/* In-Map Modern Legend HUD */}
            <div
              className="position-absolute bottom-0 start-0 m-3 p-3 bg-white bg-opacity-95 rounded-3 shadow-md border small"
              style={{ zIndex: 1000, maxWidth: '280px' }}
            >
              <div className="d-flex justify-content-between align-items-center mb-2 pb-1 border-bottom">
                <span className="fw-bold font-heading text-dark">Surveillance Priority</span>
                <span className="badge bg-light text-muted border" style={{ fontSize: '0.65rem' }}>TNAU Rules</span>
              </div>
              <div className="d-flex align-items-center justify-content-between mb-1">
                <div className="d-flex align-items-center">
                  <span className="legend-color-box" style={{ background: '#ef4444' }}></span>
                  <span className="text-secondary">High Risk (&ge; 0.70)</span>
                </div>
                <span className="badge bg-danger-subtle text-danger small">Squad Alert</span>
              </div>
              <div className="d-flex align-items-center justify-content-between mb-1">
                <div className="d-flex align-items-center">
                  <span className="legend-color-box" style={{ background: '#f59e0b' }}></span>
                  <span className="text-secondary">Medium Risk (0.35 - 0.69)</span>
                </div>
                <span className="badge bg-warning-subtle text-warning small">Watch</span>
              </div>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="d-flex align-items-center">
                  <span className="legend-color-box" style={{ background: '#10b981' }}></span>
                  <span className="text-secondary">Low / Safe (&lt; 0.35)</span>
                </div>
                <span className="badge bg-success-subtle text-success small">Normal</span>
              </div>
              <div className="pt-2 border-top d-flex align-items-center gap-2 text-muted" style={{ fontSize: '0.75rem' }}>
                <span className="d-inline-block rounded-circle" style={{ width: '10px', height: '10px', background: '#0ea5e9' }}></span>
                <span>Ground Scout Pin (Circle Marker)</span>
              </div>
            </div>

          </div>
        </div>

        {/* Selected Taluk Inspection Panel */}
        {selectedTaluk && (
          <div className="col-12 col-xl-4">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-header bg-slate-900 text-white d-flex justify-content-between align-items-center py-3"
                   style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
                <div className="d-flex align-items-center gap-2">
                  <div className="p-1 rounded bg-success text-white">
                    <i className="bi bi-geo-alt-fill"></i>
                  </div>
                  <div>
                    <h5 className="font-heading fw-bold mb-0 text-white">{selectedTaluk.taluk_name}</h5>
                    <span className="small text-light opacity-75" style={{ fontSize: '0.75rem' }}>
                      Madurai Taluk &bull; {selectedTaluk.assessment_date}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white btn-sm"
                  onClick={() => setSelectedTaluk(null)}
                  aria-label="Close"
                ></button>
              </div>

              <div className="card-body p-3 p-lg-4">
                {/* Risk Score Highlight Card */}
                <div className="p-3 rounded-3 mb-3 border"
                     style={{
                       background: selectedTaluk.risk_level === 'HIGH' ? '#fef2f2' : selectedTaluk.risk_level === 'MEDIUM' ? '#fffbeb' : '#ecfdf5',
                       borderColor: selectedTaluk.risk_level === 'HIGH' ? '#fecaca' : selectedTaluk.risk_level === 'MEDIUM' ? '#fde68a' : '#a7f3d0'
                     }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="text-uppercase fw-bold small text-secondary" style={{ fontSize: '0.7rem' }}>Epidemiological Status</div>
                      <div className="fs-5 fw-bold" style={{
                        color: selectedTaluk.risk_level === 'HIGH' ? '#b91c1c' : selectedTaluk.risk_level === 'MEDIUM' ? '#b45309' : '#047857'
                      }}>
                        {selectedTaluk.risk_level} VULNERABILITY
                      </div>
                    </div>
                    <div className="text-end">
                      <div className="text-uppercase fw-bold small text-secondary" style={{ fontSize: '0.7rem' }}>Combined Score</div>
                      <div className="fs-3 fw-bold font-mono text-dark">
                        {(selectedTaluk.risk_score * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <div className="progress mt-2" style={{ height: '7px' }}>
                    <div
                      className={`progress-bar ${selectedTaluk.risk_level === 'HIGH' ? 'bg-danger' : selectedTaluk.risk_level === 'MEDIUM' ? 'bg-warning' : 'bg-success'}`}
                      style={{ width: `${selectedTaluk.risk_score * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Primary Environmental Driver */}
                <div className="mb-3">
                  <div className="d-flex align-items-center gap-1 mb-1">
                    <i className="bi bi-cloud-lightning-rain text-primary"></i>
                    <span className="small fw-bold text-dark text-uppercase" style={{ fontSize: '0.75rem' }}>
                      Primary Environmental Driver
                    </span>
                  </div>
                  <div className="p-2 rounded bg-light border text-secondary small">
                    {selectedTaluk.primary_risk_factor || 'Continuous nocturnal high humidity (>90%) with temperature depression.'}
                  </div>
                </div>

                {/* Microclimate breakdown */}
                <div className="mb-3">
                  <div className="d-flex align-items-center gap-1 mb-2">
                    <i className="bi bi-sliders text-success"></i>
                    <span className="small fw-bold text-dark text-uppercase" style={{ fontSize: '0.75rem' }}>
                      Conduciveness Thresholds
                    </span>
                  </div>
                  <div className="row g-2 text-center small">
                    <div className="col-6">
                      <div className="p-2 rounded border bg-white">
                        <div className="text-muted" style={{ fontSize: '0.7rem' }}>Consecutive Days</div>
                        <div className="fw-bold fs-6 text-dark">{selectedTaluk.consecutive_conducive_days || '3'} Days</div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="p-2 rounded border bg-white">
                        <div className="text-muted" style={{ fontSize: '0.7rem' }}>Paddy Command Area</div>
                        <div className="fw-bold fs-6 text-dark">{selectedTaluk.agri_area_ha ? `${selectedTaluk.agri_area_ha.toLocaleString()} ha` : '18,500 ha'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actionable Field Advisory */}
                <div className="card bg-light border-0 p-3 mb-3">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <i className={`bi ${selectedTaluk.risk_level === 'HIGH' ? 'bi-shield-exclamation text-danger' : 'bi-shield-check text-success'} fs-5`}></i>
                    <span className="fw-bold text-dark font-heading">Tactical Extension Directive</span>
                  </div>
                  <p className="small text-secondary mb-0" style={{ lineHeight: '1.55' }}>
                    {selectedTaluk.risk_level === 'HIGH'
                      ? 'Dispatch immediate agricultural squad to inspect early tillering fields in this taluk. Check for spindle lesions before sporulation spreads. Advise prophylactic biocontrol or targeted fungicide.'
                      : selectedTaluk.risk_level === 'MEDIUM'
                      ? 'Flag for elevated monitoring. Schedule secondary field scouting within 48 to 72 hours if morning humidity persists above 90%.'
                      : 'Maintain routine weekly surveillance. Microclimatic conditions remain suppressive to pathogen germination.'}
                  </p>
                </div>

                {/* Action Button */}
                <button
                  type="button"
                  className="btn btn-pro-outline w-100 btn-sm d-flex align-items-center justify-content-center gap-2"
                  onClick={() => alert(`Dossier for ${selectedTaluk.taluk_name} loaded. You can export this in the Reports & Analytics tab.`)}
                >
                  <i className="bi bi-file-earmark-arrow-down"></i>
                  <span>Export Taluk Briefing Dossier</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapPage;
