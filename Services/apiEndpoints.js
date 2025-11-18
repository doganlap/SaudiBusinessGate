// API Endpoints Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3050';

export const apiEndpoints = {
  // Authentication
  auth: {
    login: `${API_BASE_URL}/api/auth/login`,
    register: `${API_BASE_URL}/api/auth/register`,
    me: `${API_BASE_URL}/api/auth/me`,
    logout: `${API_BASE_URL}/api/auth/logout`
  },

  // Users
  users: {
    list: `${API_BASE_URL}/api/users`,
    create: `${API_BASE_URL}/api/users`,
    get: (id) => `${API_BASE_URL}/api/users/${id}`,
    update: (id) => `${API_BASE_URL}/api/users/${id}`,
    delete: (id) => `${API_BASE_URL}/api/users/${id}`
  },

  // Tenants
  tenants: {
    list: `${API_BASE_URL}/api/platform/tenants`,
    create: `${API_BASE_URL}/api/platform/tenants`,
    register: `${API_BASE_URL}/api/platform/tenants/register-complete`,
    get: (id) => `${API_BASE_URL}/api/platform/tenants/${id}`,
    update: (id) => `${API_BASE_URL}/api/platform/tenants/${id}`
  },

  // Dashboard
  dashboard: {
    stats: `${API_BASE_URL}/api/dashboard/stats`,
    activity: `${API_BASE_URL}/api/dashboard/activity`,
    widgets: `${API_BASE_URL}/api/dashboard/widgets`
  },

  // Health
  health: {
    check: `${API_BASE_URL}/api/health`,
    database: `${API_BASE_URL}/api/health/database`,
    redis: `${API_BASE_URL}/api/health/redis`
  },

  // Testing
  test: {
    database: `${API_BASE_URL}/api/test-db`
  }
};

export default apiEndpoints;
