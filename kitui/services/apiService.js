/**
 * ==========================================
 * API SERVICE
 * ==========================================
 * 
 * Centralized API service for all HTTP requests
 * Handles authentication, error handling, and request formatting
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method for making requests
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('authToken');

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }

      return response;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // GET request
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, {
      method: 'GET',
    });
  }

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // PATCH request
  async patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  // Upload file
  async uploadFile(endpoint, file, additionalData = {}) {
    const formData = new FormData();
    formData.append('file', file);
    
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });

    const token = localStorage.getItem('authToken');
    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('File Upload Error:', error);
      throw error;
    }
  }

  // Organizations endpoints
  async getOrganizations(params) {
    return this.get('/organizations', params);
  }

  async getOrganization(id) {
    return this.get(`/organizations/${id}`);
  }

  async createOrganization(data) {
    return this.post('/organizations', data);
  }

  async updateOrganization(id, data) {
    return this.put(`/organizations/${id}`, data);
  }

  async deleteOrganization(id) {
    return this.delete(`/organizations/${id}`);
  }

  // Assessments endpoints
  async getAssessments(params) {
    return this.get('/assessments', params);
  }

  async getAssessment(id) {
    return this.get(`/assessments/${id}`);
  }

  async createAssessment(data) {
    return this.post('/assessments', data);
  }

  async updateAssessment(id, data) {
    return this.put(`/assessments/${id}`, data);
  }

  async deleteAssessment(id) {
    return this.delete(`/assessments/${id}`);
  }

  // Templates endpoints
  async getTemplates(params) {
    return this.get('/templates', params);
  }

  async getTemplate(id) {
    return this.get(`/templates/${id}`);
  }

  // Documents endpoints
  async uploadDocument(file, metadata) {
    return this.uploadFile('/documents/upload', file, metadata);
  }

  async getDocuments(params) {
    return this.get('/documents', params);
  }

  // Analytics endpoints
  async getAnalytics(params) {
    return this.get('/analytics', params);
  }

  async getDashboardStats() {
    return this.get('/analytics/dashboard');
  }

  // Users endpoints
  async getUsers(params) {
    return this.get('/users', params);
  }

  async getUser(id) {
    return this.get(`/users/${id}`);
  }

  async updateUser(id, data) {
    return this.put(`/users/${id}`, data);
  }

  // Authentication endpoints
  async login(credentials) {
    const response = await this.post('/auth/login', credentials);
    if (response.token) {
      localStorage.setItem('authToken', response.token);
    }
    return response;
  }

  async logout() {
    localStorage.removeItem('authToken');
    return this.post('/auth/logout');
  }

  async getCurrentUser() {
    return this.get('/auth/me');
  }

  // Settings endpoints
  async getSettings() {
    return this.get('/settings');
  }

  async updateSettings(data) {
    return this.put('/settings', data);
  }
}

// Create and export a singleton instance
const apiService = new ApiService();

export default apiService;
