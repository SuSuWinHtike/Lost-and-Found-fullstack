import api from './api';

export const messageService = {
  async getConversations() {
    const response = await api.get('/conversations');
    return response.data.data;
  },

  async getMessages(conversationId) {
    const response = await api.get(`/conversations/${conversationId}/messages`);
    return response.data;
  },

  async sendMessage(conversationId, messageText) {
    const response = await api.post(`/conversations/${conversationId}/messages`, {
      message: messageText,
    });
    return response.data.data;
  },

  async startConversation(recipientId, petReportId = null, initialMessage = null) {
    const response = await api.post('/conversations/start', {
      recipient_id: recipientId,
      pet_report_id: petReportId,
      initial_message: initialMessage,
    });
    return response.data;
  },
};

export default messageService;
