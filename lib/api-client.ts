/**
 * Unified API Client for Backend-Frontend Integration
 * Single source of truth for all API calls
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

// Get API base URL from environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  },
  withCredentials: true // Include cookies for authentication
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add tenant ID if available
    if (typeof window !== 'undefined') {
      try {
        const tenantId = localStorage.getItem('tenant_id');
        if (tenantId) {
          config.headers['x-tenant-id'] = tenantId;
        }
      } catch (e) {
        // Ignore localStorage errors
      }
    }

    // Add request metadata
    config.headers['X-Request-ID'] = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    config.headers['X-Client'] = 'nextjs-frontend';

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle common errors
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Unauthorized - redirect to login
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          break;
        case 403:
          console.error('Forbidden: Insufficient permissions');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Server error');
          break;
      }
    }
    return Promise.reject(error);
  }
);

/**
 * API Service Methods
 */
export const api = {
  // Finance APIs
  finance: {
    accounts: {
      list: () => apiClient.get('/finance/accounts'),
      get: (id: string) => apiClient.get(`/finance/accounts/${id}`),
      create: (data: any) => apiClient.post('/finance/accounts', data),
      update: (id: string, data: any) => apiClient.put(`/finance/accounts/${id}`, data),
      delete: (id: string) => apiClient.delete(`/finance/accounts/${id}`)
    },
    cashFlow: (params?: any) => apiClient.get('/finance/cash-flow', { params }),
    transactions: {
      list: (params?: any) => apiClient.get('/finance/transactions', { params }),
      get: (id: string) => apiClient.get(`/finance/transactions/${id}`),
      create: (data: any) => apiClient.post('/finance/transactions', data),
      update: (id: string, data: any) => apiClient.put(`/finance/transactions/${id}`, data),
      delete: (id: string) => apiClient.delete(`/finance/transactions/${id}`)
    },
    invoices: {
      list: (params?: any) => apiClient.get('/finance/invoices', { params }),
      get: (id: string) => apiClient.get(`/finance/invoices/${id}`),
      create: (data: any) => apiClient.post('/finance/invoices', data),
      update: (id: string, data: any) => apiClient.put(`/finance/invoices/${id}`, data),
      delete: (id: string) => apiClient.delete(`/finance/invoices/${id}`)
    },
    journalEntries: {
      list: (params?: any) => apiClient.get('/finance/journal-entries', { params }),
      create: (data: any) => apiClient.post('/finance/journal-entries', data)
    },
    budgets: {
      list: () => apiClient.get('/finance/budgets'),
      get: (id: string) => apiClient.get(`/finance/budgets/${id}`),
      create: (data: any) => apiClient.post('/finance/budgets', data),
      update: (id: string, data: any) => apiClient.put(`/finance/budgets/${id}`, data)
    },
    tax: {
      get: (params?: any) => apiClient.get('/finance/tax', { params })
    },
    stats: () => apiClient.get('/finance/stats'),
    reports: (params?: any) => apiClient.post('/finance/reports', params)
  },

  // Sales APIs
  sales: {
    leads: {
      list: (params?: any) => apiClient.get('/sales/leads', { params }),
      get: (id: string) => apiClient.get(`/sales/leads/${id}`),
      create: (data: any) => apiClient.post('/sales/leads', data),
      update: (id: string, data: any) => apiClient.put(`/sales/leads/${id}`, data)
    },
    deals: {
      list: (params?: any) => apiClient.get('/sales/deals', { params }),
      get: (id: string) => apiClient.get(`/sales/deals/${id}`),
      create: (data: any) => apiClient.post('/sales/deals', data),
      update: (id: string, data: any) => apiClient.put(`/sales/deals/${id}`, data)
    },
    pipeline: () => apiClient.get('/sales/pipeline'),
    quotes: {
      list: () => apiClient.get('/sales/quotes'),
      get: (id: string) => apiClient.get(`/sales/quotes/${id}`),
      create: (data: any) => apiClient.post('/sales/quotes', data)
    },
    orders: {
      list: () => apiClient.get('/sales/orders'),
      get: (id: string) => apiClient.get(`/sales/orders/${id}`),
      create: (data: any) => apiClient.post('/sales/orders', data)
    }
  },

  // HR APIs
  hr: {
    employees: {
      list: (params?: any) => apiClient.get('/hr/employees', { params }),
      get: (id: string) => apiClient.get(`/hr/employees/${id}`),
      create: (data: any) => apiClient.post('/hr/employees', data),
      update: (id: string, data: any) => apiClient.put(`/hr/employees/${id}`, data),
      delete: (id: string) => apiClient.delete(`/hr/employees/${id}`)
    },
    payroll: {
      list: () => apiClient.get('/hr/payroll'),
      process: (data: any) => apiClient.post('/hr/payroll', data)
    },
    attendance: {
      list: (params?: any) => apiClient.get('/hr/attendance', { params }),
      log: (data: any) => apiClient.post('/hr/attendance', data)
    }
  },

  // Procurement APIs
  procurement: {
    orders: {
      list: (params?: any) => apiClient.get('/procurement/orders', { params }),
      get: (id: string) => apiClient.get(`/procurement/orders/${id}`),
      create: (data: any) => apiClient.post('/procurement/orders', data)
    },
    vendors: {
      list: () => apiClient.get('/procurement/vendors'),
      get: (id: string) => apiClient.get(`/procurement/vendors/${id}`),
      create: (data: any) => apiClient.post('/procurement/vendors', data)
    },
    inventory: {
      list: (params?: any) => apiClient.get('/procurement/inventory', { params }),
      update: (id: string, data: any) => apiClient.put(`/procurement/inventory/${id}`, data)
    }
  },

  // CRM APIs
  crm: {
    customers: {
      list: (params?: any) => apiClient.get('/crm/customers', { params }),
      get: (id: string) => apiClient.get(`/crm/customers/${id}`),
      create: (data: any) => apiClient.post('/crm/customers', data),
      update: (id: string, data: any) => apiClient.put(`/crm/customers/${id}`, data)
    },
    contacts: {
      list: () => apiClient.get('/crm/contacts'),
      get: (id: string) => apiClient.get(`/crm/contacts/${id}`),
      create: (data: any) => apiClient.post('/crm/contacts', data),
      update: (id: string, data: any) => apiClient.put(`/crm/contacts/${id}`, data)
    },
    deals: {
      list: () => apiClient.get('/crm/deals'),
      get: (id: string) => apiClient.get(`/crm/deals/${id}`),
      create: (data: any) => apiClient.post('/crm/deals', data)
    },
    pipeline: () => apiClient.get('/crm/pipeline'),
    activities: {
      list: () => apiClient.get('/crm/activities'),
      create: (data: any) => apiClient.post('/crm/activities', data)
    }
  },

  // GRC APIs
  grc: {
    frameworks: {
      list: () => apiClient.get('/grc/frameworks'),
      get: (id: string) => apiClient.get(`/grc/frameworks/${id}`)
    },
    controls: {
      list: (params?: any) => apiClient.get('/grc/controls', { params }),
      get: (id: string) => apiClient.get(`/grc/controls/${id}`),
      create: (data: any) => apiClient.post('/grc/controls', data),
      update: (id: string, data: any) => apiClient.put(`/grc/controls/${id}`, data)
    },
    analytics: () => apiClient.get('/grc/analytics')
  },

  // Dashboard APIs
  dashboard: {
    stats: () => apiClient.get('/dashboard/stats'),
    activity: () => apiClient.get('/dashboard/activity'),
    widgets: () => apiClient.get('/dashboard/widgets')
  },

  // Workflows APIs
  workflows: {
    list: () => apiClient.get('/workflows'),
    get: (id: string) => apiClient.get(`/workflows/${id}`),
    create: (data: any) => apiClient.post('/workflows', data),
    execute: (id: string, data?: any) => apiClient.post(`/workflows/${id}/execute`, data)
  },

  // Analytics APIs
  analytics: {
    financial: (params?: any) => apiClient.get('/analytics/financial-analytics', { params }),
    customer: (params?: any) => apiClient.get('/analytics/customer-analytics', { params }),
    aiInsights: () => apiClient.get('/analytics/ai-insights')
  },

  // Billing APIs
  billing: {
    plans: () => apiClient.get('/billing/plans'),
    checkout: (data: any) => apiClient.post('/billing/checkout', data),
    portal: () => apiClient.get('/billing/portal')
  },

  // Auth APIs
  auth: {
    login: (data: any) => apiClient.post('/auth/login', data),
    register: (data: any) => apiClient.post('/auth/register', data),
    me: () => apiClient.get('/auth/me'),
    logout: () => apiClient.post('/auth/logout')
  }
};

export default api;

