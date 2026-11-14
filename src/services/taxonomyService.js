import api from './api';

export const taxonomyService = {
  async getAdminTaxonomies() {
    const response = await api.get('/admin/taxonomies');
    return response.data.data;
  },

  async createPetType(data) {
    const response = await api.post('/admin/pet-categories', data);
    return response.data;
  },

  async createBreed(data) {
    const response = await api.post('/admin/breeds', data);
    return response.data;
  },

  async deleteBreed(id) {
    const response = await api.delete(`/admin/breeds/${id}`);
    return response.data;
  },

  async createColor(data) {
    const response = await api.post('/admin/colors', data);
    return response.data;
  },

  async deleteColor(id) {
    const response = await api.delete(`/admin/colors/${id}`);
    return response.data;
  },
};

export default taxonomyService;
