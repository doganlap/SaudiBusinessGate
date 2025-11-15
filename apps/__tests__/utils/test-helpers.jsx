/**
 * Test Utilities and Helpers
 * Common functions and utilities for testing
 */

import { render } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock session data
export const mockSession = {
  user: {
    id: 'user-123',
    name: 'Test User',
    email: 'test@example.com',
    role: 'tenant_admin',
    tenantId: 'tenant-123'
  },
  tenant: {
    id: 'tenant-123',
    name: 'Test Tenant',
    plan: 'professional',
    status: 'active'
  },
  expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
};

export const mockPlatformAdminSession = {
  user: {
    id: 'admin-123',
    name: 'Platform Admin',
    email: 'admin@platform.com',
    role: 'platform_admin',
    tenantId: 'platform'
  },
  expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
};

// Custom render function with providers
export function renderWithProviders(ui, options = {}) {
  const {
    session = mockSession,
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    }),
    ...renderOptions
  } = options;

  const Wrapper = ({ children }) => (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </SessionProvider>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Mock API responses
export const mockApiResponses = {
  subscription: {
    id: 'sub_123',
    status: 'active',
    plan: {
      id: 'professional',
      name: 'Professional Plan',
      price: 299
    },
    billingPeriod: 'monthly',
    currentPeriodEnd: new Date('2024-04-01'),
    amount: 299
  },

  paymentMethods: [
    {
      id: 'pm_123',
      type: 'card',
      last4: '4242',
      brand: 'visa',
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true
    }
  ],

  billingHistory: {
    invoices: [
      {
        id: 'in_123',
        amount: 299,
        status: 'paid',
        date: '2024-03-01',
        downloadUrl: 'https://invoice.stripe.com/123'
      }
    ],
    subscriptionHistory: [
      {
        date: '2024-01-01',
        action: 'created',
        plan: 'professional',
        amount: 299
      }
    ]
  },

  usageAnalytics: {
    currentPlan: 'professional',
    limits: { users: 50, storage: 200, apiCalls: 50000 },
    current: { users: 25, storage: 150, apiCalls: 35000 },
    percentages: { users: 50, storage: 75, apiCalls: 70 }
  },

  licenses: [
    {
      id: 'lic-123',
      tenantName: 'Acme Corp',
      type: 'professional',
      status: 'active',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      usage: { users: 25, storage: 150 },
      limits: { users: 50, storage: 200 }
    }
  ],

  renewals: [
    {
      id: 'lic-123',
      tenantName: 'Acme Corp',
      currentPlan: 'professional',
      expiryDate: '2024-04-15',
      daysToExpiry: 15,
      status: 'pending_renewal',
      annualValue: 3588,
      probability: 85
    }
  ]
};

// Mock fetch function
export function createMockFetch(responses = {}) {
  return jest.fn().mockImplementation((url, options = {}) => {
    const method = options.method || 'GET';
    const key = `${method} ${url}`;

    if (responses[key]) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(responses[key]),
        text: () => Promise.resolve(JSON.stringify(responses[key]))
      });
    }

    // Default responses
    if (url.includes('/api/billing/subscription') && method === 'GET') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockApiResponses.subscription)
      });
    }

    if (url.includes('/api/billing/payment-methods') && method === 'GET') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockApiResponses.paymentMethods)
      });
    }

    // Default error response
    return Promise.reject(new Error(`No mock response for ${key}`));
  });
}

// Wait for async operations
export function waitForAsync(ms = 0) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Mock Stripe elements
export function createMockStripeElements() {
  const mockElement = {
    mount: jest.fn(),
    on: jest.fn(),
    destroy: jest.fn(),
    getValue: jest.fn(() => ({
      complete: true,
      empty: false,
      error: null
    }))
  };

  return {
    create: jest.fn(() => mockElement),
    getElement: jest.fn(() => mockElement)
  };
}

// Mock Stripe instance
export function createMockStripe() {
  return {
    elements: jest.fn(() => createMockStripeElements()),
    confirmCardPayment: jest.fn(() => 
      Promise.resolve({
        paymentIntent: { status: 'succeeded' }
      })
    ),
    createPaymentMethod: jest.fn(() =>
      Promise.resolve({
        paymentMethod: { id: 'pm_test_123' }
      })
    )
  };
}

// Database test helpers
export class DatabaseTestHelper {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async createTestTenant(data = {}) {
    return this.prisma.tenant.create({
      data: {
        name: 'Test Tenant',
        email: 'test@example.com',
        status: 'active',
        plan: 'professional',
        ...data
      }
    });
  }

  async createTestUser(tenantId, data = {}) {
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('TestPass123!', 12);

    return this.prisma.user.create({
      data: {
        name: 'Test User',
        email: 'testuser@example.com',
        password: hashedPassword,
        role: 'tenant_admin',
        tenantId,
        emailVerified: new Date(),
        ...data
      }
    });
  }

  async createTestLicense(tenantId, data = {}) {
    return this.prisma.license.create({
      data: {
        tenantId,
        type: 'professional',
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        maxUsers: 50,
        maxStorage: 200,
        features: ['advanced_analytics', 'api_access'],
        usage: { currentUsers: 25, currentStorage: 150 },
        ...data
      }
    });
  }

  async cleanupTestData() {
    // Delete test data in reverse order of dependencies
    await this.prisma.billingEvent.deleteMany({
      where: { tenantId: { contains: 'test' } }
    });

    await this.prisma.licenseEvent.deleteMany({
      where: { tenantId: { contains: 'test' } }
    });

    await this.prisma.user.deleteMany({
      where: { email: { contains: 'test' } }
    });

    await this.prisma.license.deleteMany({
      where: { tenantId: { contains: 'test' } }
    });

    await this.prisma.tenant.deleteMany({
      where: { email: { contains: 'test' } }
    });
  }
}

// Test data generators
export const testDataGenerators = {
  subscription: (overrides = {}) => ({
    id: 'sub_test_123',
    status: 'active',
    plan: { id: 'professional', name: 'Professional Plan', price: 299 },
    billingPeriod: 'monthly',
    amount: 299,
    currentPeriodEnd: new Date('2024-04-01'),
    ...overrides
  }),

  invoice: (overrides = {}) => ({
    id: 'in_test_123',
    amount: 299,
    status: 'paid',
    date: new Date('2024-03-01'),
    downloadUrl: 'https://test.com/invoice',
    ...overrides
  }),

  tenant: (overrides = {}) => ({
    id: 'tenant-test-123',
    name: 'Test Tenant',
    email: 'test@example.com',
    status: 'active',
    plan: 'professional',
    createdAt: new Date(),
    ...overrides
  }),

  user: (overrides = {}) => ({
    id: 'user-test-123',
    name: 'Test User',
    email: 'testuser@example.com',
    role: 'tenant_admin',
    tenantId: 'tenant-test-123',
    ...overrides
  }),

  license: (overrides = {}) => ({
    id: 'lic-test-123',
    tenantId: 'tenant-test-123',
    type: 'professional',
    status: 'active',
    startDate: new Date(),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    maxUsers: 50,
    maxStorage: 200,
    features: ['advanced_analytics', 'api_access'],
    usage: { currentUsers: 25, currentStorage: 150 },
    ...overrides
  })
};

// Assertion helpers
export const assertHelpers = {
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isValidDate: (date) => {
    return date instanceof Date && !isNaN(date);
  },

  isPositiveNumber: (num) => {
    return typeof num === 'number' && num > 0;
  },

  hasRequiredFields: (obj, fields) => {
    return fields.every(field => obj.hasOwnProperty(field) && obj[field] !== undefined);
  }
};

export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';