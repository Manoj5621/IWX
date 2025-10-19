// api.js - Updated version
const API_BASE_URL = 'http://localhost:8000';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (response.status === 401) {
        this.setToken(null);
        window.location.href = '/auth';
        throw new Error('Authentication required');
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Network error' }));
        throw new Error(error.detail || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication
  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password
      }),
    });
    this.setToken(response.access_token);
    return response;
  }

  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return response;
  }

  async getCurrentUser() {
    try {
      return await this.request('/auth/me');
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
  }

  async updateCurrentUser(updateData) {
    try {
      return await this.request('/auth/me', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  }

  async refreshToken() {
    const response = await this.request('/auth/refresh-token');
    this.setToken(response.access_token);
    return response;
  }

  // Other methods remain the same...
  async getProducts(filters = {}) {
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
    return await this.request(`/products${queryString ? `?${queryString}` : ''}`);
  }

  async getProduct(productId) {
    return await this.request(`/products/${productId}`);
  }

  async getCart() {
    return await this.request('/orders/cart/');
  }

  async addToCart(productId, quantity = 1, size = null, color = null) {
    return await this.request('/orders/cart/add/', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity, size, color }),
    });
  }

  async getOrders() {
    return await this.request('/orders/');
  }
}

const apiService = new ApiService();
export default apiService;