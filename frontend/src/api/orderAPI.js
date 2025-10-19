import axiosClient from './axiosClient';

export const orderAPI = {
  getOrders: async () => {
    const response = await axiosClient.get('/orders/');
    return response.data;
  }
};