import axiosClient from './axiosClient';

export const adminAPI = {
  // Add admin-specific API calls here
  // Example: getUsers, updateUser, deleteUser, etc.
  getUsers: async () => {
    const response = await axiosClient.get('/admin/users');
    return response.data;
  },

  updateUser: async (userId, userData) => {
    const response = await axiosClient.put(`/admin/users/${userId}`, userData);
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await axiosClient.delete(`/admin/users/${userId}`);
    return response.data;
  }
};