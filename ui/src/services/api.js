import axios from 'axios';

class ApiService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8082';
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  setBaseURL(url) {
    this.baseURL = url;
    this.client.defaults.baseURL = url;
  }

  async getChaosConfig() {
    try {
      const response = await this.client.get('/chaos');
      return response.data;
    } catch (error) {
      console.error('Failed to get chaos config:', error);
      throw error;
    }
  }

  async updateChaosConfig(config) {
    try {
      const response = await this.client.post('/chaos', config);
      return response.data;
    } catch (error) {
      console.error('Failed to update chaos config:', error);
      throw error;
    }
  }

  async resetChaosConfig() {
    try {
      await this.client.delete('/chaos');
      return true;
    } catch (error) {
      console.error('Failed to reset chaos config:', error);
      throw error;
    }
  }

  async getMetrics() {
    try {
      const response = await this.client.get('/chaos/metrics');
      return response.data;
    } catch (error) {
      console.error('Failed to get metrics:', error);
      throw error;
    }
  }
}

export default new ApiService();
