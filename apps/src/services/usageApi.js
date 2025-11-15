/**
 * Usage API Service
 * Frontend API calls for tenant usage monitoring and analytics
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

class UsageApiService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/usage`;
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

  // Get tenant usage overview
  async getTenantUsage(tenantId, timeframe = '30_days') {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    
    return this.apiCall(`/tenant/${tenantId}?timeframe=${timeframe}`);
  }

  // Get usage analytics for all tenants
  async getAllTenantsUsage(filters = {}) {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        queryParams.append(key, value);
      }
    });

    const queryString = queryParams.toString();
    const endpoint = `/analytics${queryString ? `?${queryString}` : ''}`;
    
    return this.apiCall(endpoint);
  }

  // Get current usage metrics
  async getCurrentUsageMetrics(tenantId) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    
    return this.apiCall(`/tenant/${tenantId}/current`);
  }

  // Get usage trends
  async getUsageTrends(tenantId, period = '12_months') {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    
    return this.apiCall(`/tenant/${tenantId}/trends?period=${period}`);
  }

  // Get feature usage breakdown
  async getFeatureUsage(tenantId, timeframe = '30_days') {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    
    return this.apiCall(`/tenant/${tenantId}/features?timeframe=${timeframe}`);
  }

  // Get usage alerts
  async getUsageAlerts(tenantId) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    
    return this.apiCall(`/tenant/${tenantId}/alerts`);
  }

  // Get usage forecasting
  async getUsageForecast(tenantId, months = 6) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    
    return this.apiCall(`/tenant/${tenantId}/forecast?months=${months}`);
  }

  // Record usage event
  async recordUsageEvent(tenantId, eventData) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    if (!eventData.eventType) {
      throw new Error('Event type is required');
    }

    return this.apiCall(`/tenant/${tenantId}/events`, {
      method: 'POST',
      body: JSON.stringify({
        ...eventData,
        timestamp: new Date().toISOString(),
      }),
    });
  }

  // Bulk record usage events
  async bulkRecordUsageEvents(tenantId, events) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    if (!Array.isArray(events) || events.length === 0) {
      throw new Error('Events array is required');
    }

    return this.apiCall(`/tenant/${tenantId}/events/bulk`, {
      method: 'POST',
      body: JSON.stringify({
        events: events.map(event => ({
          ...event,
          timestamp: event.timestamp || new Date().toISOString(),
        })),
      }),
    });
  }

  // Get usage limits
  async getUsageLimits(tenantId) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    
    return this.apiCall(`/tenant/${tenantId}/limits`);
  }

  // Update usage limits
  async updateUsageLimits(tenantId, limits) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }

    return this.apiCall(`/tenant/${tenantId}/limits`, {
      method: 'PUT',
      body: JSON.stringify({
        ...limits,
        updatedAt: new Date().toISOString(),
      }),
    });
  }

  // Get usage recommendations
  async getUsageRecommendations(tenantId) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    
    return this.apiCall(`/tenant/${tenantId}/recommendations`);
  }

  // Get upgrade suggestions
  async getUpgradeSuggestions(tenantId) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    
    return this.apiCall(`/tenant/${tenantId}/upgrade-suggestions`);
  }

  // Check feature availability
  async checkFeatureAvailability(tenantId, featureName) {
    if (!tenantId || !featureName) {
      throw new Error('Tenant ID and feature name are required');
    }
    
    return this.apiCall(`/tenant/${tenantId}/features/${featureName}/availability`);
  }

  // Get billing usage
  async getBillingUsage(tenantId, billingPeriod) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    
    const endpoint = `/tenant/${tenantId}/billing${billingPeriod ? `?period=${billingPeriod}` : ''}`;
    return this.apiCall(endpoint);
  }

  // Generate usage report
  async generateUsageReport(tenantId, reportConfig = {}) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }

    return this.apiCall(`/tenant/${tenantId}/reports`, {
      method: 'POST',
      body: JSON.stringify({
        ...reportConfig,
        generatedAt: new Date().toISOString(),
      }),
    });
  }

  // Get usage comparisons
  async getUsageComparisons(tenantId, compareWith = 'industry_average') {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    
    return this.apiCall(`/tenant/${tenantId}/comparisons?with=${compareWith}`);
  }

  // Get peak usage times
  async getPeakUsageTimes(tenantId, timeframe = '30_days') {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    
    return this.apiCall(`/tenant/${tenantId}/peak-times?timeframe=${timeframe}`);
  }

  // Get usage efficiency metrics
  async getUsageEfficiency(tenantId) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    
    return this.apiCall(`/tenant/${tenantId}/efficiency`);
  }

  // Set usage notifications
  async setUsageNotifications(tenantId, notificationSettings) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }

    return this.apiCall(`/tenant/${tenantId}/notifications`, {
      method: 'PUT',
      body: JSON.stringify({
        ...notificationSettings,
        updatedAt: new Date().toISOString(),
      }),
    });
  }

  // Get usage notifications
  async getUsageNotifications(tenantId) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    
    return this.apiCall(`/tenant/${tenantId}/notifications`);
  }

  // Export usage data
  async exportUsageData(tenantId, exportConfig = {}) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }

    const queryParams = new URLSearchParams();
    Object.entries(exportConfig).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });

    const format = exportConfig.format || 'csv';
    const queryString = queryParams.toString();
    const endpoint = `/tenant/${tenantId}/export${queryString ? `?${queryString}` : ''}`;
    
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

  // Get aggregated platform usage
  async getPlatformUsageAggregates(timeframe = '30_days') {
    return this.apiCall(`/platform/aggregates?timeframe=${timeframe}`);
  }

  // Get tenant usage rankings
  async getTenantUsageRankings(metric = 'total_usage', timeframe = '30_days') {
    return this.apiCall(`/platform/rankings?metric=${metric}&timeframe=${timeframe}`);
  }

  // Get system capacity metrics
  async getSystemCapacityMetrics() {
    return this.apiCall('/platform/capacity');
  }

  // Get resource utilization
  async getResourceUtilization(resourceType = 'all') {
    return this.apiCall(`/platform/resources?type=${resourceType}`);
  }

  // Process usage aggregations
  async processUsageAggregations(tenantId) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }

    return this.apiCall(`/tenant/${tenantId}/aggregate`, {
      method: 'POST',
    });
  }

  // Reset usage counters
  async resetUsageCounters(tenantId, resetType = 'billing_cycle') {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }

    return this.apiCall(`/tenant/${tenantId}/reset`, {
      method: 'POST',
      body: JSON.stringify({
        resetType,
        resetAt: new Date().toISOString(),
      }),
    });
  }

  // Get usage audit trail
  async getUsageAuditTrail(tenantId, filters = {}) {
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

  // Validate usage data integrity
  async validateUsageIntegrity(tenantId) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }

    return this.apiCall(`/tenant/${tenantId}/validate`, {
      method: 'POST',
    });
  }

  // Get usage health check
  async getUsageHealthCheck(tenantId) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    
    return this.apiCall(`/tenant/${tenantId}/health`);
  }
}

// Create singleton instance
const usageApi = new UsageApiService();

// Export both the class and the instance
export { UsageApiService };
export default usageApi;