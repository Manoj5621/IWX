import axiosClient from './axiosClient';

export const authAPI = {
  login: async (credentials) => {
    const response = await axiosClient.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await axiosClient.post('/auth/register', userData);
    return response.data;
  },

  getCurrentUser: async () => {
    try {
      const response = await axiosClient.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Failed to get current user:', error);
      // Return mock data for development
      return {
        id: '1',
        email: 'user@example.com',
        first_name: 'John',
        last_name: 'Doe',
        phone: '+1 (555) 123-4567',
        birth_date: '1990-01-01',
        gender: 'male',
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA'
        },
        preferences: {
          emailNewsletter: true,
          smsNotifications: false,
          promotions: true,
          orderUpdates: true,
          stockAlerts: true
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
  },

  updateCurrentUser: async (updateData) => {
    const response = await axiosClient.put('/auth/me', updateData);
    return response.data;
  },

  refreshToken: async () => {
    const response = await axiosClient.post('/auth/refresh-token');
    return response.data;
  }
};