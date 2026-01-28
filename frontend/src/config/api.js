/**
 * API Configuration
 * Automatically detects environment (dev vs production)
 */

// Determine API base URL based on environment
export const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Development: localhost
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:8000/api';
  }

  // Production: use current origin + /backend/api
  return window.location.origin + '/backend/api';
};

export const API_BASE_URL = getApiBaseUrl();

export default API_BASE_URL;
