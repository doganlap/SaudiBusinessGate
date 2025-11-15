/**
 * Licenses API Service
 * Frontend API calls for license management
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

class LicensesApiService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/license`;
  }

  // Helper method for API calls
  async apiCall(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API call failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Get all licenses (Platform Admin view)
  async getAllLicenses(filters = {}) {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        queryParams.append(key, value);
      }
    });

    const queryString = queryParams.toString();
    const endpoint = `/all${queryString ? `?${queryString}` : ''}`;
    
    return this.apiCall(endpoint);
  }

  // Get specific tenant license
  async getTenantLicense(tenantId) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    
    return this.apiCall(`/tenant/${tenantId}`);
  }

  // Update tenant license
  async updateTenantLicense(tenantId, licenseData) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }

    return this.apiCall(`/tenant/${tenantId}`, {
      method: 'PUT',
      body: JSON.stringify(licenseData),
    });
  }

  // Create new license
  async createLicense(licenseData) {
    if (!licenseData.tenantId || !licenseData.licenseCode) {
      throw new Error('Tenant ID and license code are required');
    }

    return this.apiCall('/create', {
      method: 'POST',
      body: JSON.stringify(licenseData),
    });
  }

  // Check feature access
  async checkFeatureAccess(tenantId, featureCode, userId = null) {
    if (!tenantId || !featureCode) {
      throw new Error('Tenant ID and feature code are required');
    }

    return this.apiCall('/check', {
      method: 'POST',
      body: JSON.stringify({
        tenantId,
        featureCode,
        userId,
      }),
    });
  }

  // Suspend license
  async suspendLicense(tenantId, reason) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }

    return this.apiCall(`/tenant/${tenantId}/suspend`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // Reactivate license
  async reactivateLicense(tenantId) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }

    return this.apiCall(`/tenant/${tenantId}/reactivate`, {
      method: 'POST',
    });
  }

  // Get license statistics
  async getLicenseStatistics() {
    return this.apiCall('/statistics');
  }

  // Get license features by tier
  async getLicenseFeatures(licenseCode) {
    if (!licenseCode) {
      throw new Error('License code is required');
    }

    return this.apiCall(`/features/${licenseCode}`);
  }

  // Validate license configuration
  async validateLicenseConfig(licenseData) {
    return this.apiCall('/validate', {
      method: 'POST',
      body: JSON.stringify(licenseData),
    });
  }

  // Get license audit log
  async getLicenseAuditLog(tenantId, filters = {}) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }

    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });

    const queryString = queryParams.toString();
    const endpoint = `/tenant/${tenantId}/audit${queryString ? `?${queryString}` : ''}`;
    
    return this.apiCall(endpoint);
  }

  // Export license data
  async exportLicenseData(filters = {}, format = 'csv') {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        queryParams.append(key, value);
      }
    });
    queryParams.append('format', format);

    const queryString = queryParams.toString();
    const endpoint = `/export${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers: {
        'Accept': format === 'csv' ? 'text/csv' : 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    if (format === 'csv') {
      return await response.text();
    }
    
    return await response.json();
  }

  // Bulk license operations
  async bulkUpdateLicenses(operations) {
    if (!Array.isArray(operations) || operations.length === 0) {
      throw new Error('Operations array is required');
    }

    return this.apiCall('/bulk', {
      method: 'POST',
      body: JSON.stringify({ operations }),
    });
  }

  // Get license templates
  async getLicenseTemplates() {
    return this.apiCall('/templates');
  }

  // Create license from template
  async createFromTemplate(templateId, tenantData) {
    if (!templateId) {
      throw new Error('Template ID is required');
    }

    return this.apiCall('/create-from-template', {
      method: 'POST',
      body: JSON.stringify({
        templateId,
        ...tenantData,
      }),
    });
  }

  // Get license comparison
  async compareLicenses(licenseCode1, licenseCode2) {
    if (!licenseCode1 || !licenseCode2) {
      throw new Error('Both license codes are required for comparison');
    }

    return this.apiCall(`/compare/${licenseCode1}/${licenseCode2}`);
  }

  // Request license upgrade
  async requestUpgrade(tenantId, targetLicenseCode, billingPeriod = 'monthly') {
    if (!tenantId || !targetLicenseCode) {
      throw new Error('Tenant ID and target license code are required');
    }

    return this.apiCall('/upgrade/request', {
      method: 'POST',
      body: JSON.stringify({
        tenantId,
        targetLicenseCode,
        billingPeriod,
      }),
    });
  }

  // Get upgrade options
  async getUpgradeOptions(tenantId) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }

    return this.apiCall(`/upgrade/options/${tenantId}`);
  }

  // Process license upgrade
  async processUpgrade(tenantId, upgradeData) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }

    return this.apiCall(`/upgrade/process/${tenantId}`, {
      method: 'POST',
      body: JSON.stringify(upgradeData),
    });
  }
}

// Create singleton instance
const licensesApi = new LicensesApiService();

// Export both the class and the instance
export { LicensesApiService };
export default licensesApi;