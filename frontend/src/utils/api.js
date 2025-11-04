import axios from 'axios';

// Create axios instance with base configuration
// Use backend URL directly for Digital Ocean deployment
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://planmorph-tech-backend-ays3m.ondigitalocean.app/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      if (status === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Only redirect if we're on an admin page
        if (window.location.pathname.startsWith('/admin')) {
          window.location.href = '/admin/login';
        }
      }

      // Return formatted error
      return Promise.reject({
        message: data.message || data.error || 'An error occurred',
        details: data.details || null,
        status,
      });
    } else if (error.request) {
      // Request made but no response
      return Promise.reject({
        message: 'Network error. Please check your connection.',
        status: 0,
      });
    } else {
      // Something else happened
      return Promise.reject({
        message: error.message || 'An unexpected error occurred',
        status: 0,
      });
    }
  }
);

// API methods
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  verify: (token) => api.post('/auth/verify', { token }),
};

export const requestsAPI = {
  create: (requestData) => api.post('/requests', requestData),
  getAll: (params) => api.get('/requests', { params }),
  getById: (id) => api.get(`/requests/${id}`),
  update: (id, data) => api.put(`/requests/${id}`, data),
  delete: (id) => api.delete(`/requests/${id}`),
};

export const quotesAPI = {
  create: (quoteData) => api.post('/quotes', quoteData),
  getAll: (params) => api.get('/quotes', { params }),
  getById: (id) => api.get(`/quotes/${id}`),
  getByRequestId: (requestId) => api.get(`/quotes/request/${requestId}`),
  delete: (id) => api.delete(`/quotes/${id}`),
};

export default api;
