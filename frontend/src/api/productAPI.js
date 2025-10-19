import axiosClient from './axiosClient';

export const productAPI = {
  getProducts: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(key, v));
          } else {
            queryParams.append(key, value);
          }
        }
      });
      const queryString = queryParams.toString();
      const response = await axiosClient.get(`/products${queryString ? `?${queryString}` : ''}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch products:', error);
      throw error;
    }
  },

  getProduct: async (productId) => {
    try {
      const response = await axiosClient.get(`/products/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch product:', error);
      throw error;
    }
  }
};