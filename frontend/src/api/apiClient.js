import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

export const getMaduraiTaluksGeoJSON = async () => {
  const res = await api.get('/spatial/madurai-taluks');
  return res.data;
};

export const getRegions = async () => {
  const res = await api.get('/spatial/regions');
  return res.data;
};

export const validateCoordinatePoint = async (lat, lon) => {
  const res = await api.post('/spatial/validate-point', { latitude: lat, longitude: lon });
  return res.data;
};

export const getCrops = async () => {
  const res = await api.get('/crops');
  return res.data;
};

export const getDiseases = async () => {
  const res = await api.get('/diseases');
  return res.data;
};

export const getRiskMapLayer = async (diseaseId, dateStr) => {
  const res = await api.get(`/risk/map-layer?disease_id=${diseaseId}&assessment_date=${dateStr}`);
  return res.data;
};

export const evaluateRisk = async (payload) => {
  const res = await api.post('/risk/evaluate', payload);
  return res.data;
};

export const getTalukSummary = async (diseaseId, dateStr) => {
  const res = await api.get(`/reports/taluk-summary?disease_id=${diseaseId}&assessment_date=${dateStr}`);
  return res.data;
};

export const uploadWeatherCSV = async (formData) => {
  const res = await api.post('/data/upload-weather', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

export const uploadObservationsCSV = async (formData) => {
  const res = await api.post('/data/upload-observations', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

export const createObservation = async (payload) => {
  const res = await api.post('/data/observations', payload);
  return res.data;
};

export const getObservations = async (params = {}) => {
  const res = await api.get('/data/observations', { params });
  return res.data;
};

export const getUploadBatches = async () => {
  const res = await api.get('/data/upload-batches');
  return res.data;
};

export const getRiskHistory = async (params = {}) => {
  const res = await api.get('/risk/history', { params });
  return res.data;
};

export default api;
