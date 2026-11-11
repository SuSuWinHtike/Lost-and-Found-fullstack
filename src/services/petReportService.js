import api from './api';

export const petReportService = {
  async getPetReports(params = {}) {
    const response = await api.get('/pet-reports', { params });
    return response.data;
  },

  async getPetReportById(id) {
    const response = await api.get(`/pet-reports/${id}`);
    return response.data.data;
  },

  async createPetReport(formData) {
    const isForm = formData instanceof FormData;
    const response = await api.post('/pet-reports', formData, {
      headers: isForm ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  async toggleFavorite(id) {
    const response = await api.post(`/pet-reports/${id}/favorite`);
    return response.data;
  },

  async getMyReports(params = {}) {
    const response = await api.get('/my-reports', { params });
    return response.data;
  },

  async updateMyReport(id, data) {
    const isForm = data instanceof FormData;
    const response = isForm
      ? await api.post(`/my-reports/${id}?_method=PUT`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      : await api.put(`/my-reports/${id}`, data);
    return response.data;
  },

  async deleteMyReport(id) {
    const response = await api.delete(`/my-reports/${id}`);
    return response.data;
  },

  async markAsReunited(id) {
    const response = await api.post(`/my-reports/${id}/reunited`);
    return response.data;
  },
};

export default petReportService;
