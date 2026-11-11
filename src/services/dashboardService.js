import api from './api';

export const dashboardService = {
  async getDashboardStats() {
    const response = await api.get('/dashboard/stats');
    return response.data.data;
  },

  async updateProfile(profileData) {
    const response = await api.put('/user/profile', profileData);
    if (response.data.user) {
      localStorage.setItem('petlove_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async changePassword(passwordData) {
    const response = await api.post('/user/change-password', passwordData);
    return response.data;
  },

  async updateAvatar(formData) {
    const response = await api.post('/user/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    if (response.data.user) {
      localStorage.setItem('petlove_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
};

export default dashboardService;
