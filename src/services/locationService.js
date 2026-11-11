import api from './api';

export const locationService = {
  async getLocations() {
    const response = await api.get('/locations');
    return response.data.data;
  },

  async getCategories() {
    const response = await api.get('/categories');
    return response.data.data;
  },

  async getColors() {
    const response = await api.get('/colors');
    return response.data.data;
  },
};

export default locationService;
