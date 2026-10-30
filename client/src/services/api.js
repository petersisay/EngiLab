import axios from 'axios';

/**
 * Standardized Axios HTTP client instance for EngiLab frontend.
 * Preconfigured with credentials support for HTTP-only JWT cookies.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Response interceptor to normalize error messages
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const customMessage =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred while communicating with the server.';

    const status = error.response?.status;
    const errors = error.response?.data?.errors || [];

    const enhancedError = new Error(customMessage);
    enhancedError.status = status;
    enhancedError.errors = errors;
    enhancedError.rawResponse = error.response;

    return Promise.reject(enhancedError);
  }
);

export default api;
