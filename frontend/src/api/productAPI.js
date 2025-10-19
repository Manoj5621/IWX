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
  },

  getFeaturedProducts: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          queryParams.append(key, value);
        }
      });
      const queryString = queryParams.toString();
      const response = await axiosClient.get(`/products/featured/${queryString ? `?${queryString}` : ''}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch featured products:', error);
      throw error;
    }
  },

  getTrendingProducts: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          queryParams.append(key, value);
        }
      });
      const queryString = queryParams.toString();
      const response = await axiosClient.get(`/products/trending/${queryString ? `?${queryString}` : ''}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch trending products:', error);
      throw error;
    }
  },

  getNewArrivals: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          queryParams.append(key, value);
        }
      });
      const queryString = queryParams.toString();
      const response = await axiosClient.get(`/products/new-arrivals/${queryString ? `?${queryString}` : ''}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch new arrivals:', error);
      throw error;
    }
  }
};