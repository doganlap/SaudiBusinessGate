/**
 * Renewals API Service
 * Frontend API calls for license renewal management
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

class RenewalsApiService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/renewals`;
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

  // Get renewal pipeline
  async getRenewalPipeline(filters = {}) {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        queryParams.append(key, value);
      }
    });

    const queryString = queryParams.toString();
    const endpoint = `/pipeline${queryString ? `?${queryString}` : ''}`;
    
    return this.apiCall(endpoint);
  }

  // Get specific renewal
  async getRenewal(renewalId) {
    if (!renewalId) {
      throw new Error('Renewal ID is required');
    }
    
    return this.apiCall(`/${renewalId}`);
  }

  // Get renewals by tenant
  async getRenewalsByTenant(tenantId) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    
    return this.apiCall(`/tenant/${tenantId}`);
  }

  // Create renewal record
  async createRenewal(renewalData) {
    if (!renewalData.tenantId || !renewalData.expiryDate) {
      throw new Error('Tenant ID and expiry date are required');
    }

    return this.apiCall('/', {
      method: 'POST',
      body: JSON.stringify(renewalData),
    });
  }

  // Update renewal status
  async updateRenewalStatus(renewalId, status, notes = '') {
    if (!renewalId || !status) {
      throw new Error('Renewal ID and status are required');
    }

    return this.apiCall(`/${renewalId}/status`, {
      method: 'PUT',
      body: JSON.stringify({
        status,
        notes,
        updatedAt: new Date().toISOString(),
      }),
    });
  }

  // Update renewal details
  async updateRenewal(renewalId, renewalData) {
    if (!renewalId) {
      throw new Error('Renewal ID is required');
    }

    return this.apiCall(`/${renewalId}`, {
      method: 'PUT',
      body: JSON.stringify(renewalData),
    });
  }

  // Add communication record
  async addCommunication(renewalId, communicationData) {
    if (!renewalId) {
      throw new Error('Renewal ID is required');
    }

    return this.apiCall(`/${renewalId}/communications`, {
      method: 'POST',
      body: JSON.stringify({
        ...communicationData,
        timestamp: new Date().toISOString(),
      }),
    });
  }

  // Get communication history
  async getCommunicationHistory(renewalId) {
    if (!renewalId) {
      throw new Error('Renewal ID is required');
    }
    
    return this.apiCall(`/${renewalId}/communications`);
  }

  // Send renewal reminder
  async sendRenewalReminder(renewalId, reminderType) {
    if (!renewalId || !reminderType) {
      throw new Error('Renewal ID and reminder type are required');
    }

    return this.apiCall(`/${renewalId}/remind`, {
      method: 'POST',
      body: JSON.stringify({
        reminderType,
        sentAt: new Date().toISOString(),
      }),
    });
  }

  // Bulk send reminders
  async bulkSendReminders(renewalIds, reminderType) {
    if (!Array.isArray(renewalIds) || renewalIds.length === 0) {
      throw new Error('Renewal IDs array is required');
    }
    if (!reminderType) {
      throw new Error('Reminder type is required');
    }

    return this.apiCall('/bulk/remind', {
      method: 'POST',
      body: JSON.stringify({
        renewalIds,
        reminderType,
        sentAt: new Date().toISOString(),
      }),
    });
  }

  // Get renewal statistics
  async getRenewalStatistics(timeframe = '120_days') {
    return this.apiCall(`/statistics?timeframe=${timeframe}`);
  }

  // Get renewal forecast
  async getRenewalForecast(months = 12) {
    return this.apiCall(`/forecast?months=${months}`);
  }

  // Process renewal completion
  async completeRenewal(renewalId, renewalDetails) {
    if (!renewalId) {
      throw new Error('Renewal ID is required');
    }

    return this.apiCall(`/${renewalId}/complete`, {
      method: 'POST',
      body: JSON.stringify({
        ...renewalDetails,
        completedAt: new Date().toISOString(),
      }),
    });
  }

  // Cancel renewal
  async cancelRenewal(renewalId, cancellationReason) {
    if (!renewalId) {
      throw new Error('Renewal ID is required');
    }

    return this.apiCall(`/${renewalId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({
        cancellationReason,
        cancelledAt: new Date().toISOString(),
      }),
    });
  }

  // Generate renewal proposal
  async generateProposal(renewalId, proposalOptions = {}) {
    if (!renewalId) {
      throw new Error('Renewal ID is required');
    }

    return this.apiCall(`/${renewalId}/proposal`, {
      method: 'POST',
      body: JSON.stringify(proposalOptions),
    });
  }

  // Get renewal templates
  async getRenewalTemplates() {
    return this.apiCall('/templates');
  }

  // Create custom renewal template
  async createRenewalTemplate(templateData) {
    return this.apiCall('/templates', {
      method: 'POST',
      body: JSON.stringify(templateData),
    });
  }

  // Get renewals requiring attention
  async getAttentionRequired() {
    return this.apiCall('/attention-required');
  }

  // Export renewal data
  async exportRenewalData(filters = {}, format = 'csv') {
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

  // Schedule renewal follow-up
  async scheduleFollowUp(renewalId, followUpData) {
    if (!renewalId) {
      throw new Error('Renewal ID is required');
    }

    return this.apiCall(`/${renewalId}/follow-up`, {
      method: 'POST',
      body: JSON.stringify({
        ...followUpData,
        createdAt: new Date().toISOString(),
      }),
    });
  }

  // Get scheduled follow-ups
  async getScheduledFollowUps(filters = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });

    const queryString = queryParams.toString();
    const endpoint = `/follow-ups${queryString ? `?${queryString}` : ''}`;
    
    return this.apiCall(endpoint);
  }

  // Update risk assessment
  async updateRiskAssessment(renewalId, riskData) {
    if (!renewalId) {
      throw new Error('Renewal ID is required');
    }

    return this.apiCall(`/${renewalId}/risk`, {
      method: 'PUT',
      body: JSON.stringify({
        ...riskData,
        updatedAt: new Date().toISOString(),
      }),
    });
  }

  // Get renewal recommendations
  async getRenewalRecommendations(tenantId) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }

    return this.apiCall(`/recommendations/${tenantId}`);
  }

  // Set auto-renewal preference
  async setAutoRenewal(renewalId, autoRenewalEnabled, preferences = {}) {
    if (!renewalId) {
      throw new Error('Renewal ID is required');
    }

    return this.apiCall(`/${renewalId}/auto-renewal`, {
      method: 'PUT',
      body: JSON.stringify({
        autoRenewalEnabled,
        preferences,
        updatedAt: new Date().toISOString(),
      }),
    });
  }

  // Process auto-renewals
  async processAutoRenewals() {
    return this.apiCall('/auto-renewal/process', {
      method: 'POST',
    });
  }
}

// Create singleton instance
const renewalsApi = new RenewalsApiService();

// Export both the class and the instance
export { RenewalsApiService };
export default renewalsApi;