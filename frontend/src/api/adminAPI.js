import axiosClient from './axiosClient';

// Debounce utility for API calls
const debounceMap = new Map();

function debounceApiCall(key, fn, delay = 300) {
  if (debounceMap.has(key)) {
    clearTimeout(debounceMap.get(key));
  }

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(async () => {
      try {
        const result = await fn();
        resolve(result);
      } catch (error) {
        reject(error);
      } finally {
        debounceMap.delete(key);
      }
    }, delay);

    debounceMap.set(key, timeoutId);
  });
}

export const adminAPI = {
  // Add admin-specific API calls here
  // Example: getUsers, updateUser, deleteUser, etc.
  getUsers: async () => {
    try {
      const response = await axiosClient.get('/admin/users');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch users via REST API:', error);
      throw error;
    }
  },

  createUser: async (userData) => {
    const response = await axiosClient.post('/admin/users', userData);
    return response.data;
  },

  getDashboardStats: async () => {
    return debounceApiCall('dashboard-stats', async () => {
      try {
        const response = await axiosClient.get('/admin/dashboard/stats');
        return response.data;
      } catch (error) {
        console.error('Failed to fetch dashboard stats via REST API:', error);
        throw error;
      }
    }, 100); // 100ms debounce for dashboard stats
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
  },

  // Inventory endpoints
  getInventoryAlerts: async () => {
    const response = await axiosClient.get('/admin/inventory/alerts');
    return response.data;
  },

  getInventoryItems: async () => {
    const response = await axiosClient.get('/admin/inventory/items');
    return response.data;
  },

  // Marketing endpoints
  getMarketingCampaigns: async () => {
    const response = await axiosClient.get('/admin/marketing/campaigns');
    return response.data;
  },

  getMarketingStats: async () => {
    const response = await axiosClient.get('/admin/marketing/stats');
    return response.data;
  },

  // Performance metrics endpoints
  getPerformanceMetrics: async () => {
    return debounceApiCall('performance-metrics', async () => {
      try {
        const response = await axiosClient.get('/admin/performance/metrics');
        return response.data;
      } catch (error) {
        console.error('Failed to fetch performance metrics via REST API:', error);
        throw error;
      }
    }, 100);
  },

  // Customer satisfaction endpoints
  getCustomerSatisfaction: async () => {
    return debounceApiCall('customer-satisfaction', async () => {
      try {
        const response = await axiosClient.get('/admin/customers/satisfaction');
        return response.data;
      } catch (error) {
        console.error('Failed to fetch customer satisfaction via REST API:', error);
        throw error;
      }
    }, 100);
  },

  // Traffic sources endpoints
  getTrafficSources: async () => {
    return debounceApiCall('traffic-sources', async () => {
      try {
        const response = await axiosClient.get('/admin/analytics/traffic');
        return response.data;
      } catch (error) {
        console.error('Failed to fetch traffic sources via REST API:', error);
        throw error;
      }
    }, 100);
  },

  // System status endpoints
  getSystemStatus: async () => {
    return debounceApiCall('system-status', async () => {
      try {
        const response = await axiosClient.get('/admin/system/status');
        return response.data;
      } catch (error) {
        console.error('Failed to fetch system status via REST API:', error);
        throw error;
      }
    }, 100);
  },

  // Sales and analytics data endpoints
  getSalesData: async () => {
    const response = await axiosClient.get('/admin/analytics/sales-data');
    return response.data;
  },

  getTopProducts: async () => {
    const response = await axiosClient.get('/admin/analytics/top-products');
    return response.data;
  },

  getRecentOrders: async () => {
    const response = await axiosClient.get('/admin/analytics/recent-orders');
    return response.data;
  },

  getRevenueTrend: async () => {
    const response = await axiosClient.get('/admin/analytics/revenue-trend');
    return response.data;
  },

  // Product management endpoints
  getProducts: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(key, v));
          } else {
            queryParams.append(key, value);
          }
        }
      });
      const queryString = queryParams.toString();
      const response = await axiosClient.get(`/admin/products${queryString ? `?${queryString}` : ''}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch products for admin:', error);
      throw error;
    }
  },

  updateProductStatus: async (productId, status) => {
    try {
      const response = await axiosClient.put(`/admin/products/${productId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Failed to update product status:', error);
      throw error;
    }
  },

  deleteProduct: async (productId) => {
    try {
      const response = await axiosClient.delete(`/admin/products/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete product:', error);
      throw error;
    }
  },

  bulkUpdateProductStatus: async (productIds, status) => {
    try {
      const response = await axiosClient.post('/admin/products/bulk-status-update', {
        product_ids: productIds,
        status: status
      });
      return response.data;
    } catch (error) {
      console.error('Failed to bulk update product status:', error);
      throw error;
    }
  }
};