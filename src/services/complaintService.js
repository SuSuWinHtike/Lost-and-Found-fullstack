import api from './api';

export const complaintService = {
  async submitComplaint(data) {
    const response = await api.post('/complaints', data);
    return response.data;
  },

  async getAdminComplaints() {
    const response = await api.get('/admin/complaints');
    return response.data;
  },

  async updateAdminComplaint(id, data) {
    const response = await api.patch(`/admin/complaints/${id}`, data);
    return response.data;
  },
};

export default complaintService;