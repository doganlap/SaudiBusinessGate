/**
 * ==========================================
 * API CONNECTOR UTILITY
 * ==========================================
 * 
 * Utility for connecting to various APIs and data sources
 */

import apiService from '../services/apiService';

class ApiConnector {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Get data with caching
  async getData(endpoint, options = {}) {
    const cacheKey = `${endpoint}_${JSON.stringify(options)}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      const data = await apiService.get(endpoint, options);
      
      // Cache the result
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      console.error('API Connector Error:', error);
      throw error;
    }
  }

  // Clear cache
  clearCache(endpoint) {
    if (endpoint) {
      const keys = Array.from(this.cache.keys()).filter(key => 
        key.startsWith(endpoint)
      );
      keys.forEach(key => this.cache.delete(key));
    } else {
      this.cache.clear();
    }
  }

  // Dashboard data
  async getDashboardData() {
    try {
      const [stats, analytics, recentActivity] = await Promise.all([
        this.getStats(),
        this.getAnalytics(),
        this.getRecentActivity()
      ]);

      return {
        stats,
        analytics,
        recentActivity
      };
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      return this.getMockDashboardData();
    }
  }

  // Get statistics
  async getStats() {
    try {
      return await apiService.getDashboardStats();
    } catch (error) {
      return {
        totalOrganizations: 156,
        activeAssessments: 42,
        completedProjects: 89,
        totalUsers: 234
      };
    }
  }

  // Get analytics
  async getAnalytics(params = {}) {
    try {
      return await apiService.getAnalytics(params);
    } catch (error) {
      return this.getMockAnalytics();
    }
  }

  // Get recent activity
  async getRecentActivity() {
    try {
      return await this.getData('/activity/recent', { limit: 10 });
    } catch (error) {
      return [
        {
          id: 1,
          type: 'assessment',
          action: 'completed',
          user: 'John Doe',
          timestamp: new Date().toISOString()
        },
        {
          id: 2,
          type: 'organization',
          action: 'created',
          user: 'Jane Smith',
          timestamp: new Date(Date.now() - 3600000).toISOString()
        }
      ];
    }
  }

  // Mock data generators
  getMockDashboardData() {
    return {
      stats: {
        totalOrganizations: 156,
        activeAssessments: 42,
        completedProjects: 89,
        totalUsers: 234,
        growth: {
          organizations: 12,
          assessments: 8,
          projects: 15,
          users: 23
        }
      },
      analytics: this.getMockAnalytics(),
      recentActivity: [
        {
          id: 1,
          type: 'assessment',
          action: 'completed',
          description: 'Security assessment completed',
          user: 'John Doe',
          timestamp: new Date().toISOString()
        },
        {
          id: 2,
          type: 'organization',
          action: 'created',
          description: 'New organization registered',
          user: 'Jane Smith',
          timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 3,
          type: 'document',
          action: 'uploaded',
          description: 'Compliance document uploaded',
          user: 'Mike Johnson',
          timestamp: new Date(Date.now() - 7200000).toISOString()
        }
      ]
    };
  }

  getMockAnalytics() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    
    return {
      assessments: months.map((month, idx) => ({
        month,
        completed: Math.floor(Math.random() * 50) + 20,
        pending: Math.floor(Math.random() * 30) + 10,
        inProgress: Math.floor(Math.random() * 20) + 5
      })),
      compliance: {
        compliant: 78,
        partiallyCompliant: 15,
        nonCompliant: 7
      },
      riskLevels: {
        low: 45,
        medium: 32,
        high: 18,
        critical: 5
      },
      categories: [
        { name: 'Security', value: 35, color: '#EF4444' },
        { name: 'Privacy', value: 28, color: '#F59E0B' },
        { name: 'Compliance', value: 22, color: '#10B981' },
        { name: 'Operations', value: 15, color: '#3B82F6' }
      ]
    };
  }

  // Specific data fetchers
  async getOrganizations(params) {
    return this.getData('/organizations', params);
  }

  async getAssessments(params) {
    return this.getData('/assessments', params);
  }

  async getUsers(params) {
    return this.getData('/users', params);
  }

  async getDocuments(params) {
    return this.getData('/documents', params);
  }

  // Real-time updates simulation
  subscribeToUpdates(callback) {
    // Simulate real-time updates
    const interval = setInterval(() => {
      callback({
        type: 'update',
        timestamp: new Date().toISOString(),
        data: {
          newAssessments: Math.floor(Math.random() * 5),
          activeUsers: Math.floor(Math.random() * 50) + 100
        }
      });
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }
}

// Create and export singleton
const apiConnector = new ApiConnector();

export default apiConnector;
