import api from './api';

export const authService = {
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('petlove_token', response.data.token);
      localStorage.setItem('petlove_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('petlove_token', response.data.token);
      localStorage.setItem('petlove_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('petlove_token');
      localStorage.removeItem('petlove_user');
    }
  },

  async getMe() {
    const response = await api.get('/auth/me');
    if (response.data.user) {
      localStorage.setItem('petlove_user', JSON.stringify(response.data.user));
    }
    return response.data.user;
  },

  async forgotPassword(email) {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('petlove_user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  getToken() {
    return localStorage.getItem('petlove_token');
  },

  isAuthenticated() {
    return !!localStorage.getItem('petlove_token');
  },
};

export default authService;
