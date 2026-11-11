import api from './api';

export const sightingService = {
  async getSightings(params = {}) {
    const response = await api.get('/sightings', { params });
    return response.data;
  },

  async createSighting(formData) {
    const response = await api.post('/sightings', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default sightingService;
