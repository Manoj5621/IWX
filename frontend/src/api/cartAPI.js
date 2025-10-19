import axiosClient from './axiosClient';

export const cartAPI = {
  getCart: async () => {
    const response = await axiosClient.get('/orders/cart/');
    return response.data;
  },

  addToCart: async (productId, quantity = 1, size = null, color = null) => {
    const response = await axiosClient.post('/orders/cart/add/', {
      product_id: productId,
      quantity,
      size,
      color
    });
    return response.data;
  }
};