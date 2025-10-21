import axiosClient from './axiosClient';

export const adminAPI = {
  // Add admin-specific API calls here
  // Example: getUsers, updateUser, deleteUser, etc.
  getUsers: async () => {
    const response = await axiosClient.get('/admin/users');
    return response.data;
  },

  createUser: async (userData) => {
    const response = await axiosClient.post('/admin/users', userData);
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await axiosClient.get('/admin/dashboard/stats');
    return response.data;
  },

  updateUser: async (userId, userData) => {
    const response = await axiosClient.put(`/admin/users/${userId}`, userData);
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await axiosClient.delete(`/admin/users/${userId}`);
    return response.data;
  },

  // Security endpoints
  getSecurityStats: async () => {
    const response = await axiosClient.get('/admin/security/stats');
    return response.data;
  },

  getLoginHistory: async (userId = null, limit = 100) => {
    const params = new URLSearchParams();
    if (userId) params.append('user_id', userId);
    params.append('limit', limit);
    const response = await axiosClient.get(`/admin/security/login-history?${params}`);
    return response.data;
  },

  getSecurityEvents: async (userId = null, eventType = null, limit = 100) => {
    const params = new URLSearchParams();
    if (userId) params.append('user_id', userId);
    if (eventType) params.append('event_type', eventType);
    params.append('limit', limit);
    const response = await axiosClient.get(`/admin/security/events?${params}`);
    return response.data;
  },

  getConnectedDevices: async (userId = null) => {
    const params = new URLSearchParams();
    if (userId) params.append('user_id', userId);
    const response = await axiosClient.get(`/admin/security/devices?${params}`);
    return response.data;
  },

  runSecurityScan: async () => {
    const response = await axiosClient.post('/admin/security/scan');
    return response.data;
  }
};