/**
 * Centralized API Service for communicating with the FastAPI backend.
 * Uses VITE_API_BASE_URL or falls back to relative `/api` (supported via Vite proxy).
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL 
  ? `${import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')}/api`
  : '/api';

/**
 * Generic request helper with robust error handling and timeout support.
 */
async function fetchJson(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      let errorMsg = `Server returned status ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          errorMsg = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
        } else if (errorData.message) {
          errorMsg = errorData.message;
        }
      } catch {
        // Response was not JSON
      }
      throw new Error(errorMsg);
    }

    return await response.json();
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Request was aborted');
    }
    console.error(`API Error on [${options.method || 'GET'} ${url}]:`, err);
    throw err;
  }
}

export const api = {
  // Health
  checkHealth: () => fetchJson('/health'),

  // Countries
  getCountries: () => fetchJson('/countries'),

  // Overview (Page 1)
  getOverview: (year) => {
    const query = year ? `?year=${year}` : '';
    return fetchJson(`/overview${query}`);
  },

  // Global Map
  getMapEmissions: (year = 2022) => {
    return fetchJson(`/map/emissions?year=${year}`);
  },

  // Explorer (Page 2)
  getMetrics: () => fetchJson('/explorer/metrics'),
  getExplorerData: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.country) searchParams.set('country', params.country);
    if (params.metric) searchParams.set('metric', params.metric);
    if (params.start_year) searchParams.set('start_year', params.start_year);
    if (params.end_year) searchParams.set('end_year', params.end_year);
    if (params.comparison_year) searchParams.set('comparison_year', params.comparison_year);
    return fetchJson(`/explorer?${searchParams.toString()}`);
  },

  // Prediction (Page 3)
  getPredictionMetadata: () => fetchJson('/prediction/metadata'),
  getPredictionDiagnostics: (limit = 150) => fetchJson(`/prediction/diagnostics?limit=${limit}`),
  getCountryFeatures: (country, year) => 
    fetchJson(`/prediction/country-features?country=${encodeURIComponent(country)}&year=${year}`),
  runPrediction: (payload) => 
    fetchJson('/prediction', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Forecast (Page 4)
  getForecast: (country = null, horizon = 5) => {
    const searchParams = new URLSearchParams();
    if (country && country !== 'World' && country !== 'Global Total') {
      searchParams.set('country', country);
    }
    if (horizon) searchParams.set('horizon', horizon);
    return fetchJson(`/forecast?${searchParams.toString()}`);
  },

  // Renewable Impact (Page 5)
  getRenewableImpact: (country = null) => {
    const searchParams = new URLSearchParams();
    if (country && country !== 'World' && country !== 'Global Total') {
      searchParams.set('country', country);
    }
    return fetchJson(`/renewable-impact?${searchParams.toString()}`);
  },

  // Model Evaluation & Explainability
  getModelEvaluation: () => fetchJson('/model/evaluation'),
  getFeatureImportance: () => fetchJson('/model/feature-importance'),
};

export default api;
