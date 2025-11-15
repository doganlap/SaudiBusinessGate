/**
 * Integration Tests for API Routes
 * Tests complete API functionality with authentication, authorization, and database integration
 */

import { describe, test, expect, jest, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';
import { createMocks } from 'node-mocks-http';
import { NextRequest, NextResponse } from 'next/server';

// Import API route handlers
import { GET as getPlans, POST as createPlan } from '../../apps/web/src/app/api/billing/plans/route';
import { GET as getSubscription, POST as createSubscription, PUT as updateSubscription, DELETE as cancelSubscription } from '../../apps/web/src/app/api/billing/subscription/route';
import { GET as getPaymentMethods, POST as addPaymentMethod, DELETE as removePaymentMethod } from '../../apps/web/src/app/api/billing/payment-methods/route';
import { GET as getBillingHistory } from '../../apps/web/src/app/api/billing/history/route';
import { POST as handleWebhook } from '../../apps/web/src/app/api/billing/webhook/route';

// Mock services
jest.mock('../../lib/services/billing.service');
jest.mock('../../lib/services/license.service');

// Mock authentication
const mockAuthenticatedSession = {
  user: {
    id: 'user-123',
    tenantId: 'tenant-123',
    role: 'tenant_admin',
    email: 'admin@test.com'
  },
  tenant: {
    id: 'tenant-123',
    name: 'Test Tenant',
    plan: 'professional'
  }
};

const mockPlatformAdminSession = {
  user: {
    id: 'admin-123',
    tenantId: 'platform',
    role: 'platform_admin',
    email: 'platform@admin.com'
  }
};

// Mock next-auth
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn()
}));

import { getServerSession } from 'next-auth/next';

describe('API Routes Integration Tests', () => {
  let BillingService;
  let LicenseService;

  beforeAll(() => {
    // Setup environment variables
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_123';
    process.env.NEXTAUTH_SECRET = 'test_secret';
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default authentication
    getServerSession.mockResolvedValue(mockAuthenticatedSession);

    // Mock BillingService methods
    BillingService = require('../../lib/services/billing.service').default;
    BillingService.prototype.getLicensePlans = jest.fn();
    BillingService.prototype.createSubscription = jest.fn();
    BillingService.prototype.getCurrentSubscription = jest.fn();
    BillingService.prototype.updateSubscription = jest.fn();
    BillingService.prototype.cancelSubscription = jest.fn();
    BillingService.prototype.getPaymentMethods = jest.fn();
    BillingService.prototype.addPaymentMethod = jest.fn();
    BillingService.prototype.removePaymentMethod = jest.fn();
    BillingService.prototype.getBillingHistory = jest.fn();
    BillingService.prototype.handleWebhook = jest.fn();

    // Mock LicenseService methods
    LicenseService = require('../../lib/services/license.service').default;
    LicenseService.prototype.validateLicense = jest.fn();
    LicenseService.prototype.createLicenseFromSubscription = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('/api/billing/plans', () => {
    const mockPlans = [
      {
        id: 'basic',
        name: 'Basic Plan',
        price: { monthly: 99, annual: 999 },
        features: ['basic_analytics']
      },
      {
        id: 'professional',
        name: 'Professional Plan',
        price: { monthly: 299, annual: 2999 },
        features: ['advanced_analytics', 'api_access']
      }
    ];

    test('GET /api/billing/plans - should return license plans', async () => {
      BillingService.prototype.getLicensePlans.mockResolvedValue(mockPlans);

      const request = new NextRequest('http://localhost:3000/api/billing/plans');
      const response = await getPlans(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.plans).toEqual(mockPlans);
      expect(BillingService.prototype.getLicensePlans).toHaveBeenCalled();
    });

    test('GET /api/billing/plans - should handle unauthenticated request', async () => {
      getServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/billing/plans');
      const response = await getPlans(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    test('POST /api/billing/plans - should create new plan (platform admin only)', async () => {
      getServerSession.mockResolvedValue(mockPlatformAdminSession);
      
      const newPlan = {
        id: 'enterprise',
        name: 'Enterprise Plan',
        price: { monthly: 999, annual: 9999 },
        features: ['enterprise_sso', 'priority_support']
      };

      const request = new NextRequest('http://localhost:3000/api/billing/plans', {
        method: 'POST',
        body: JSON.stringify(newPlan)
      });
      
      const response = await createPlan(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
    });

    test('POST /api/billing/plans - should deny access for non-platform admin', async () => {
      const newPlan = {
        id: 'enterprise',
        name: 'Enterprise Plan'
      };

      const request = new NextRequest('http://localhost:3000/api/billing/plans', {
        method: 'POST',
        body: JSON.stringify(newPlan)
      });
      
      const response = await createPlan(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Forbidden');
    });
  });

  describe('/api/billing/subscription', () => {
    const mockSubscription = {
      id: 'sub_123',
      status: 'active',
      plan: 'professional',
      billingPeriod: 'monthly',
      currentPeriodEnd: new Date('2024-04-01'),
      amount: 299
    };

    test('GET /api/billing/subscription - should return current subscription', async () => {
      BillingService.prototype.getCurrentSubscription.mockResolvedValue(mockSubscription);

      const request = new NextRequest('http://localhost:3000/api/billing/subscription');
      const response = await getSubscription(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.subscription).toEqual(mockSubscription);
      expect(BillingService.prototype.getCurrentSubscription).toHaveBeenCalledWith('tenant-123');
    });

    test('POST /api/billing/subscription - should create new subscription', async () => {
      const subscriptionData = {
        planId: 'professional',
        billingPeriod: 'monthly',
        paymentMethodId: 'pm_123'
      };

      BillingService.prototype.createSubscription.mockResolvedValue(mockSubscription);
      LicenseService.prototype.createLicenseFromSubscription.mockResolvedValue({
        id: 'lic-123',
        tenantId: 'tenant-123',
        type: 'professional'
      });

      const request = new NextRequest('http://localhost:3000/api/billing/subscription', {
        method: 'POST',
        body: JSON.stringify(subscriptionData)
      });
      
      const response = await createSubscription(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.subscription).toEqual(mockSubscription);
      
      expect(BillingService.prototype.createSubscription).toHaveBeenCalledWith(
        'tenant-123',
        'professional',
        'monthly',
        'pm_123'
      );
      
      expect(LicenseService.prototype.createLicenseFromSubscription).toHaveBeenCalledWith({
        tenantId: 'tenant-123',
        planId: 'professional',
        billingPeriod: 'monthly'
      });
    });

    test('PUT /api/billing/subscription - should update subscription', async () => {
      const updateData = {
        planId: 'enterprise',
        billingPeriod: 'annual'
      };

      const updatedSubscription = {
        ...mockSubscription,
        plan: 'enterprise',
        billingPeriod: 'annual',
        amount: 9999
      };

      BillingService.prototype.getCurrentSubscription.mockResolvedValue(mockSubscription);
      BillingService.prototype.updateSubscription.mockResolvedValue(updatedSubscription);

      const request = new NextRequest('http://localhost:3000/api/billing/subscription', {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });
      
      const response = await updateSubscription(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.subscription).toEqual(updatedSubscription);
      expect(BillingService.prototype.updateSubscription).toHaveBeenCalledWith(
        mockSubscription.id,
        'enterprise',
        'annual'
      );
    });

    test('DELETE /api/billing/subscription - should cancel subscription', async () => {
      const cancelData = { immediately: false };

      BillingService.prototype.getCurrentSubscription.mockResolvedValue(mockSubscription);
      BillingService.prototype.cancelSubscription.mockResolvedValue({
        ...mockSubscription,
        status: 'cancel_at_period_end'
      });

      const request = new NextRequest('http://localhost:3000/api/billing/subscription', {
        method: 'DELETE',
        body: JSON.stringify(cancelData)
      });
      
      const response = await cancelSubscription(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(BillingService.prototype.cancelSubscription).toHaveBeenCalledWith(
        mockSubscription.id,
        false
      );
    });
  });

  describe('/api/billing/payment-methods', () => {
    const mockPaymentMethods = [
      {
        id: 'pm_123',
        type: 'card',
        last4: '4242',
        brand: 'visa',
        expiryMonth: 12,
        expiryYear: 2025,
        isDefault: true
      }
    ];

    test('GET /api/billing/payment-methods - should return payment methods', async () => {
      BillingService.prototype.getPaymentMethods.mockResolvedValue(mockPaymentMethods);

      const request = new NextRequest('http://localhost:3000/api/billing/payment-methods');
      const response = await getPaymentMethods(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.paymentMethods).toEqual(mockPaymentMethods);
      expect(BillingService.prototype.getPaymentMethods).toHaveBeenCalledWith('tenant-123');
    });

    test('POST /api/billing/payment-methods - should add payment method', async () => {
      const paymentMethodData = {
        paymentMethodId: 'pm_new_123',
        setAsDefault: true
      };

      const newPaymentMethod = {
        id: 'pm_new_123',
        type: 'card',
        last4: '1234',
        brand: 'mastercard',
        isDefault: true
      };

      BillingService.prototype.addPaymentMethod.mockResolvedValue(newPaymentMethod);

      const request = new NextRequest('http://localhost:3000/api/billing/payment-methods', {
        method: 'POST',
        body: JSON.stringify(paymentMethodData)
      });
      
      const response = await addPaymentMethod(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.paymentMethod).toEqual(newPaymentMethod);
      expect(BillingService.prototype.addPaymentMethod).toHaveBeenCalledWith(
        'tenant-123',
        'pm_new_123',
        true
      );
    });

    test('DELETE /api/billing/payment-methods - should remove payment method', async () => {
      BillingService.prototype.removePaymentMethod.mockResolvedValue(true);

      const request = new NextRequest('http://localhost:3000/api/billing/payment-methods?paymentMethodId=pm_123', {
        method: 'DELETE'
      });
      
      const response = await removePaymentMethod(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(BillingService.prototype.removePaymentMethod).toHaveBeenCalledWith(
        'tenant-123',
        'pm_123'
      );
    });
  });

  describe('/api/billing/history', () => {
    const mockBillingHistory = {
      invoices: [
        {
          id: 'in_123',
          amount: 299,
          status: 'paid',
          date: new Date('2024-03-01'),
          downloadUrl: 'https://invoice.stripe.com/123'
        }
      ],
      subscriptionHistory: [
        {
          date: new Date('2024-01-01'),
          action: 'created',
          plan: 'professional',
          amount: 299
        }
      ],
      analytics: {
        totalSpent: 897, // 3 months * 299
        averageMonthlySpend: 299,
        lastPaymentDate: new Date('2024-03-01')
      }
    };

    test('GET /api/billing/history - should return billing history', async () => {
      BillingService.prototype.getBillingHistory.mockResolvedValue(mockBillingHistory);

      const request = new NextRequest('http://localhost:3000/api/billing/history');
      const response = await getBillingHistory(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.history).toEqual(mockBillingHistory);
      expect(BillingService.prototype.getBillingHistory).toHaveBeenCalledWith('tenant-123');
    });

    test('GET /api/billing/history - with date range filter', async () => {
      const filteredHistory = {
        ...mockBillingHistory,
        invoices: mockBillingHistory.invoices.filter(
          inv => inv.date >= new Date('2024-02-01')
        )
      };

      BillingService.prototype.getBillingHistory.mockResolvedValue(filteredHistory);

      const request = new NextRequest(
        'http://localhost:3000/api/billing/history?from=2024-02-01&to=2024-03-31'
      );
      const response = await getBillingHistory(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(BillingService.prototype.getBillingHistory).toHaveBeenCalledWith(
        'tenant-123',
        {
          from: new Date('2024-02-01'),
          to: new Date('2024-03-31')
        }
      );
    });
  });

  describe('/api/billing/webhook', () => {
    test('POST /api/billing/webhook - should handle successful payment webhook', async () => {
      const webhookPayload = JSON.stringify({
        id: 'evt_123',
        type: 'invoice.payment_succeeded',
        data: {
          object: {
            id: 'in_123',
            amount_paid: 29900,
            subscription: 'sub_123'
          }
        }
      });

      const signature = 'test_signature';
      
      BillingService.prototype.handleWebhook.mockResolvedValue(true);

      const request = new NextRequest('http://localhost:3000/api/billing/webhook', {
        method: 'POST',
        body: webhookPayload,
        headers: {
          'stripe-signature': signature
        }
      });
      
      const response = await handleWebhook(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.received).toBe(true);
      expect(BillingService.prototype.handleWebhook).toHaveBeenCalledWith(
        signature,
        webhookPayload
      );
    });

    test('POST /api/billing/webhook - should handle invalid signature', async () => {
      const webhookPayload = JSON.stringify({
        id: 'evt_123',
        type: 'invoice.payment_failed'
      });

      const invalidSignature = 'invalid_signature';
      
      BillingService.prototype.handleWebhook.mockRejectedValue(new Error('Invalid signature'));

      const request = new NextRequest('http://localhost:3000/api/billing/webhook', {
        method: 'POST',
        body: webhookPayload,
        headers: {
          'stripe-signature': invalidSignature
        }
      });
      
      const response = await handleWebhook(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Webhook signature verification failed');
    });

    test('POST /api/billing/webhook - should handle missing signature', async () => {
      const request = new NextRequest('http://localhost:3000/api/billing/webhook', {
        method: 'POST',
        body: JSON.stringify({ test: 'data' })
        // No stripe-signature header
      });
      
      const response = await handleWebhook(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing stripe-signature header');
    });
  });

  describe('Error Handling', () => {
    test('should handle service errors gracefully', async () => {
      const serviceError = new Error('Stripe API error');
      BillingService.prototype.getLicensePlans.mockRejectedValue(serviceError);

      const request = new NextRequest('http://localhost:3000/api/billing/plans');
      const response = await getPlans(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });

    test('should validate request body', async () => {
      const invalidData = {
        // Missing required fields
      };

      const request = new NextRequest('http://localhost:3000/api/billing/subscription', {
        method: 'POST',
        body: JSON.stringify(invalidData)
      });
      
      const response = await createSubscription(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('validation');
    });

    test('should handle malformed JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/billing/subscription', {
        method: 'POST',
        body: 'invalid json'
      });
      
      const response = await createSubscription(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid JSON');
    });
  });

  describe('Authorization', () => {
    test('should enforce tenant isolation', async () => {
      // Mock different tenant session
      const differentTenantSession = {
        user: {
          id: 'user-456',
          tenantId: 'tenant-456',
          role: 'tenant_admin'
        }
      };
      
      getServerSession.mockResolvedValue(differentTenantSession);
      BillingService.prototype.getCurrentSubscription.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/billing/subscription');
      const response = await getSubscription(request);

      expect(BillingService.prototype.getCurrentSubscription).toHaveBeenCalledWith('tenant-456');
      expect(BillingService.prototype.getCurrentSubscription).not.toHaveBeenCalledWith('tenant-123');
    });

    test('should allow platform admin to access any tenant data', async () => {
      getServerSession.mockResolvedValue(mockPlatformAdminSession);

      const request = new NextRequest('http://localhost:3000/api/billing/subscription?tenantId=tenant-123');
      const response = await getSubscription(request);

      expect(BillingService.prototype.getCurrentSubscription).toHaveBeenCalledWith('tenant-123');
    });

    test('should deny tenant admin access to other tenant data', async () => {
      const request = new NextRequest('http://localhost:3000/api/billing/subscription?tenantId=tenant-999');
      const response = await getSubscription(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Forbidden');
    });
  });
});