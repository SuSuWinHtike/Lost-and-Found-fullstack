import api from './api';

export const matchService = {
  async getPossibleMatches() {
    const response = await api.get('/matches');
    return response.data;
  },
};

export default matchService;
