import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Accept': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor to attach Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('petlove_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle session expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear expired credentials
      localStorage.removeItem('petlove_token');
      localStorage.removeItem('petlove_user');
      // Redirect to login if on protected route
      if (window.location.pathname.startsWith('/user')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
