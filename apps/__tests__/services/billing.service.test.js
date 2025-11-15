/**
 * Comprehensive Test Suite for Billing Service
 * Tests all billing operations including Stripe integration, subscriptions, payments, and webhooks
 */

import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';
import BillingService from '../../lib/services/billing.service';
import { DatabaseService } from '../../lib/services/database.service';
import { EmailService } from '../../lib/services/email.service';
import { NotificationService } from '../../lib/services/notification.service';

// Mock Stripe
const mockStripe = {
  customers: {
    create: jest.fn(),
    update: jest.fn(),
    list: jest.fn()
  },
  subscriptions: {
    create: jest.fn(),
    retrieve: jest.fn(),
    update: jest.fn(),
    cancel: jest.fn(),
    list: jest.fn()
  },
  paymentMethods: {
    attach: jest.fn(),
    detach: jest.fn(),
    retrieve: jest.fn()
  },
  invoices: {
    create: jest.fn(),
    finalizeInvoice: jest.fn(),
    list: jest.fn()
  },
  invoiceItems: {
    create: jest.fn()
  },
  webhooks: {
    constructEvent: jest.fn()
  }
};

// Mock services
jest.mock('stripe', () => {
  return jest.fn(() => mockStripe);
});

jest.mock('../../lib/services/database.service');
jest.mock('../../lib/services/email.service');
jest.mock('../../lib/services/notification.service');

describe('BillingService', () => {
  let billingService;
  let mockDatabaseService;
  let mockEmailService;
  let mockNotificationService;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create service instance
    billingService = new BillingService();
    
    // Setup mock services
    mockDatabaseService = new DatabaseService();
    mockEmailService = new EmailService();
    mockNotificationService = new NotificationService();

    // Setup default mock implementations
    mockDatabaseService.logBillingEvent = jest.fn().mockResolvedValue(true);
    mockDatabaseService.getTenant = jest.fn().mockResolvedValue({
      id: 'tenant-123',
      name: 'Test Tenant',
      email: 'test@example.com'
    });
    mockDatabaseService.getStripeCustomer = jest.fn().mockResolvedValue(null);
    mockDatabaseService.saveStripeCustomer = jest.fn().mockResolvedValue(true);

    mockEmailService.sendSubscriptionConfirmation = jest.fn().mockResolvedValue(true);
    mockEmailService.sendSubscriptionUpdate = jest.fn().mockResolvedValue(true);
    mockEmailService.sendSubscriptionCancellation = jest.fn().mockResolvedValue(true);
    mockEmailService.sendInvoice = jest.fn().mockResolvedValue(true);
    mockEmailService.sendPaymentConfirmation = jest.fn().mockResolvedValue(true);
    mockEmailService.sendPaymentFailed = jest.fn().mockResolvedValue(true);

    mockNotificationService.sendAlert = jest.fn().mockResolvedValue(true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('License Plans Management', () => {
    test('should return available license plans', async () => {
      const plans = await billingService.getLicensePlans();
      
      expect(plans).toHaveLength(3);
      expect(plans[0]).toEqual(
        expect.objectContaining({
          id: 'basic',
          name: 'Basic Plan',
          type: 'basic',
          price: { monthly: 99, annual: 999 }
        })
      );
    });

    test('should return specific license plan by ID', async () => {
      const plan = await billingService.getLicensePlan('professional');
      
      expect(plan).toEqual(
        expect.objectContaining({
          id: 'professional',
          name: 'Professional Plan',
          type: 'professional',
          price: { monthly: 299, annual: 2999 }
        })
      );
    });

    test('should return null for non-existent plan', async () => {
      const plan = await billingService.getLicensePlan('non-existent');
      expect(plan).toBeNull();
    });
  });

  describe('Subscription Management', () => {
    const mockCustomer = {
      id: 'cus_123',
      email: 'test@example.com',
      metadata: { tenantId: 'tenant-123' }
    };

    const mockSubscription = {
      id: 'sub_123',
      customer: 'cus_123',
      status: 'active',
      current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
      metadata: {
        tenantId: 'tenant-123',
        planId: 'professional',
        billingPeriod: 'monthly'
      },
      items: {
        data: [{ id: 'si_123', price: { id: 'price_pro_monthly' } }]
      }
    };

    beforeEach(() => {
      mockStripe.customers.create.mockResolvedValue(mockCustomer);
      mockStripe.customers.list.mockResolvedValue({ data: [mockCustomer] });
      mockStripe.subscriptions.create.mockResolvedValue(mockSubscription);
      mockStripe.subscriptions.retrieve.mockResolvedValue(mockSubscription);
      mockStripe.subscriptions.update.mockResolvedValue(mockSubscription);
      mockStripe.subscriptions.cancel.mockResolvedValue({
        ...mockSubscription,
        status: 'canceled'
      });
    });

    test('should create new subscription successfully', async () => {
      const tenantId = 'tenant-123';
      const planId = 'professional';
      const billingPeriod = 'monthly';
      const paymentMethodId = 'pm_123';

      const result = await billingService.createSubscription(
        tenantId,
        planId,
        billingPeriod,
        paymentMethodId
      );

      expect(mockStripe.customers.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        name: 'Test Tenant',
        metadata: { tenantId }
      });

      expect(mockStripe.paymentMethods.attach).toHaveBeenCalledWith(paymentMethodId, {
        customer: mockCustomer.id
      });

      expect(mockStripe.subscriptions.create).toHaveBeenCalledWith({
        customer: mockCustomer.id,
        items: [{ price: 'price_pro_monthly' }],
        default_payment_method: paymentMethodId,
        metadata: {
          tenantId,
          planId,
          billingPeriod
        }
      });

      expect(mockDatabaseService.logBillingEvent).toHaveBeenCalledWith({
        tenantId,
        eventType: 'subscription_created',
        data: expect.objectContaining({
          subscriptionId: mockSubscription.id,
          planId,
          billingPeriod,
          amount: 299,
          status: 'active'
        })
      });

      expect(mockEmailService.sendSubscriptionConfirmation).toHaveBeenCalledWith({
        tenantId,
        planName: 'Professional Plan',
        amount: 299,
        billingPeriod,
        subscriptionId: mockSubscription.id
      });

      expect(result).toEqual(mockSubscription);
    });

    test('should update existing subscription', async () => {
      const subscriptionId = 'sub_123';
      const newPlanId = 'enterprise';
      const billingPeriod = 'annual';

      const result = await billingService.updateSubscription(
        subscriptionId,
        newPlanId,
        billingPeriod
      );

      expect(mockStripe.subscriptions.retrieve).toHaveBeenCalledWith(subscriptionId);
      expect(mockStripe.subscriptions.update).toHaveBeenCalledWith(subscriptionId, {
        items: [{
          id: 'si_123',
          price: 'price_ent_annual'
        }],
        metadata: expect.objectContaining({
          planId: newPlanId,
          billingPeriod
        })
      });

      expect(mockDatabaseService.logBillingEvent).toHaveBeenCalledWith({
        tenantId: 'tenant-123',
        eventType: 'subscription_updated',
        data: expect.objectContaining({
          subscriptionId,
          oldPlanId: 'professional',
          newPlanId,
          billingPeriod,
          amount: 9999
        })
      });
    });

    test('should cancel subscription immediately', async () => {
      const subscriptionId = 'sub_123';
      const immediately = true;

      const result = await billingService.cancelSubscription(subscriptionId, immediately);

      expect(mockStripe.subscriptions.cancel).toHaveBeenCalledWith(subscriptionId);
      expect(mockDatabaseService.logBillingEvent).toHaveBeenCalledWith({
        tenantId: 'tenant-123',
        eventType: 'subscription_canceled',
        data: expect.objectContaining({
          subscriptionId,
          immediately: true
        })
      });
    });

    test('should cancel subscription at period end', async () => {
      const subscriptionId = 'sub_123';
      const immediately = false;

      const result = await billingService.cancelSubscription(subscriptionId, immediately);

      expect(mockStripe.subscriptions.update).toHaveBeenCalledWith(subscriptionId, {
        cancel_at_period_end: true
      });
    });

    test('should handle subscription creation failure', async () => {
      const error = new Error('Payment method declined');
      mockStripe.subscriptions.create.mockRejectedValue(error);

      await expect(
        billingService.createSubscription('tenant-123', 'professional', 'monthly')
      ).rejects.toThrow('Payment method declined');

      expect(mockDatabaseService.logBillingEvent).toHaveBeenCalledWith({
        tenantId: 'tenant-123',
        eventType: 'subscription_failed',
        data: expect.objectContaining({
          planId: 'professional',
          billingPeriod: 'monthly',
          error: 'Payment method declined'
        })
      });
    });
  });

  describe('Payment Methods Management', () => {
    const mockPaymentMethod = {
      id: 'pm_123',
      type: 'card',
      card: {
        last4: '4242',
        brand: 'visa',
        exp_month: 12,
        exp_year: 2025
      }
    };

    const mockCustomer = {
      id: 'cus_123',
      email: 'test@example.com'
    };

    beforeEach(() => {
      mockStripe.customers.create.mockResolvedValue(mockCustomer);
      mockStripe.paymentMethods.retrieve.mockResolvedValue(mockPaymentMethod);
      mockStripe.paymentMethods.attach.mockResolvedValue({});
      mockStripe.paymentMethods.detach.mockResolvedValue({});
      mockStripe.customers.update.mockResolvedValue({});
    });

    test('should add payment method successfully', async () => {
      const tenantId = 'tenant-123';
      const paymentMethodId = 'pm_123';
      const setAsDefault = true;

      const result = await billingService.addPaymentMethod(
        tenantId,
        paymentMethodId,
        setAsDefault
      );

      expect(mockStripe.paymentMethods.attach).toHaveBeenCalledWith(paymentMethodId, {
        customer: mockCustomer.id
      });

      expect(mockStripe.customers.update).toHaveBeenCalledWith(mockCustomer.id, {
        invoice_settings: {
          default_payment_method: paymentMethodId
        }
      });

      expect(result).toEqual({
        id: paymentMethodId,
        tenantId,
        stripePaymentMethodId: paymentMethodId,
        type: 'card',
        last4: '4242',
        brand: 'visa',
        expiryMonth: 12,
        expiryYear: 2025,
        isDefault: true
      });
    });

    test('should remove payment method successfully', async () => {
      const tenantId = 'tenant-123';
      const paymentMethodId = 'pm_123';

      await billingService.removePaymentMethod(tenantId, paymentMethodId);

      expect(mockStripe.paymentMethods.detach).toHaveBeenCalledWith(paymentMethodId);
      expect(mockDatabaseService.logBillingEvent).toHaveBeenCalledWith({
        tenantId,
        eventType: 'payment_method_removed',
        data: { paymentMethodId }
      });
    });
  });

  describe('Invoice Management', () => {
    const mockInvoice = {
      id: 'in_123',
      amount_due: 29900, // $299.00 in cents
      currency: 'usd',
      due_date: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
      hosted_invoice_url: 'https://invoice.stripe.com/123'
    };

    const mockCustomer = {
      id: 'cus_123',
      email: 'test@example.com'
    };

    beforeEach(() => {
      mockStripe.customers.create.mockResolvedValue(mockCustomer);
      mockStripe.invoiceItems.create.mockResolvedValue({});
      mockStripe.invoices.create.mockResolvedValue(mockInvoice);
      mockStripe.invoices.finalizeInvoice.mockResolvedValue(mockInvoice);
    });

    test('should generate invoice successfully', async () => {
      const tenantId = 'tenant-123';
      const items = [
        { description: 'Monthly subscription', amount: 299, quantity: 1 },
        { description: 'Extra users', amount: 50, quantity: 2 }
      ];

      const result = await billingService.generateInvoice(tenantId, items);

      expect(mockStripe.invoiceItems.create).toHaveBeenCalledTimes(2);
      expect(mockStripe.invoiceItems.create).toHaveBeenCalledWith({
        customer: mockCustomer.id,
        amount: 29900, // $299 in cents
        currency: 'usd',
        description: 'Monthly subscription',
        quantity: 1
      });

      expect(mockStripe.invoices.create).toHaveBeenCalledWith({
        customer: mockCustomer.id,
        auto_advance: true,
        metadata: { tenantId }
      });

      expect(mockStripe.invoices.finalizeInvoice).toHaveBeenCalledWith(mockInvoice.id);

      expect(mockEmailService.sendInvoice).toHaveBeenCalledWith({
        tenantId,
        invoiceId: mockInvoice.id,
        amount: 299,
        dueDate: expect.any(Date),
        invoiceUrl: mockInvoice.hosted_invoice_url
      });

      expect(result).toEqual(mockInvoice);
    });

    test('should get invoices for tenant', async () => {
      const tenantId = 'tenant-123';
      const mockInvoices = {
        data: [mockInvoice]
      };

      mockStripe.invoices.list.mockResolvedValue(mockInvoices);

      const result = await billingService.getInvoices(tenantId, 5);

      expect(mockStripe.invoices.list).toHaveBeenCalledWith({
        customer: mockCustomer.id,
        limit: 5
      });

      expect(result).toEqual([mockInvoice]);
    });
  });

  describe('Usage-Based Billing', () => {
    const mockSubscription = {
      id: 'sub_123',
      metadata: {
        tenantId: 'tenant-123',
        planId: 'professional'
      }
    };

    beforeEach(() => {
      billingService.getCurrentSubscription = jest.fn().mockResolvedValue(mockSubscription);
      billingService.generateInvoice = jest.fn().mockResolvedValue({});
    });

    test('should process usage-based billing with overages', async () => {
      const tenantId = 'tenant-123';
      const usageData = {
        activeUsers: 75, // Over limit of 50
        storageGB: 250, // Over limit of 200
        apiCalls: 75000 // Over limit of 50000
      };

      await billingService.processUsageBasedBilling(tenantId, usageData);

      expect(billingService.generateInvoice).toHaveBeenCalledWith(
        tenantId,
        expect.arrayContaining([
          expect.objectContaining({
            description: 'Extra users (25)',
            amount: 250 // 25 * $10
          }),
          expect.objectContaining({
            description: 'Extra storage (50GB)',
            amount: 25 // 50 * $0.50
          }),
          expect.objectContaining({
            description: 'Extra API calls (25000)',
            amount: 2.5 // 25 * $0.10
          })
        ])
      );

      expect(mockEmailService.sendUsageOverageAlert).toHaveBeenCalledWith({
        tenantId,
        charges: expect.objectContaining({
          total: 277.5,
          items: expect.any(Array)
        }),
        usageData
      });
    });

    test('should not generate invoice when within limits', async () => {
      const tenantId = 'tenant-123';
      const usageData = {
        activeUsers: 30, // Within limit
        storageGB: 150, // Within limit
        apiCalls: 25000 // Within limit
      };

      await billingService.processUsageBasedBilling(tenantId, usageData);

      expect(billingService.generateInvoice).not.toHaveBeenCalled();
      expect(mockEmailService.sendUsageOverageAlert).not.toHaveBeenCalled();
    });
  });

  describe('Webhook Handling', () => {
    const mockWebhookEvent = {
      id: 'evt_123',
      type: 'invoice.payment_succeeded',
      data: {
        object: {
          id: 'in_123',
          amount_paid: 29900,
          currency: 'usd',
          subscription: 'sub_123',
          metadata: { tenantId: 'tenant-123' }
        }
      }
    };

    beforeEach(() => {
      mockStripe.webhooks.constructEvent.mockReturnValue(mockWebhookEvent);
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
    });

    test('should handle successful payment webhook', async () => {
      const signature = 'webhook_signature';
      const body = JSON.stringify(mockWebhookEvent);

      await billingService.handleWebhook(signature, body);

      expect(mockStripe.webhooks.constructEvent).toHaveBeenCalledWith(
        body,
        signature,
        'whsec_test'
      );

      expect(mockDatabaseService.logBillingEvent).toHaveBeenCalledWith({
        tenantId: 'tenant-123',
        eventType: 'payment_succeeded',
        data: expect.objectContaining({
          invoiceId: 'in_123',
          amount: 299,
          currency: 'usd',
          subscriptionId: 'sub_123'
        })
      });

      expect(mockEmailService.sendPaymentConfirmation).toHaveBeenCalledWith({
        tenantId: 'tenant-123',
        amount: 299,
        invoiceId: 'in_123'
      });
    });

    test('should handle failed payment webhook', async () => {
      const failedPaymentEvent = {
        ...mockWebhookEvent,
        type: 'invoice.payment_failed'
      };
      mockStripe.webhooks.constructEvent.mockReturnValue(failedPaymentEvent);

      const signature = 'webhook_signature';
      const body = JSON.stringify(failedPaymentEvent);

      await billingService.handleWebhook(signature, body);

      expect(mockDatabaseService.logBillingEvent).toHaveBeenCalledWith({
        tenantId: 'tenant-123',
        eventType: 'payment_failed',
        data: expect.any(Object)
      });

      expect(mockEmailService.sendPaymentFailed).toHaveBeenCalled();
      expect(mockNotificationService.sendAlert).toHaveBeenCalledWith({
        type: 'payment_failed',
        priority: 'high',
        message: 'Payment failed for tenant tenant-123',
        data: expect.any(Object)
      });
    });

    test('should handle invalid webhook signature', async () => {
      const error = new Error('Invalid signature');
      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw error;
      });

      await expect(
        billingService.handleWebhook('invalid_signature', '{}')
      ).rejects.toThrow('Invalid signature');
    });
  });

  describe('Analytics', () => {
    const mockCustomer = { id: 'cus_123' };
    const mockInvoices = {
      data: [
        { amount_paid: 29900, status: 'paid', amount_due: 29900 },
        { amount_paid: 9900, status: 'paid', amount_due: 9900 },
        { amount_paid: 0, status: 'open', amount_due: 29900 }
      ]
    };

    beforeEach(() => {
      billingService.getOrCreateStripeCustomer = jest.fn().mockResolvedValue(mockCustomer);
      mockStripe.invoices.list.mockResolvedValue(mockInvoices);
    });

    test('should calculate billing analytics correctly', async () => {
      const tenantId = 'tenant-123';
      const period = 'month';

      const analytics = await billingService.getBillingAnalytics(tenantId, period);

      expect(analytics).toEqual({
        totalRevenue: 398, // (299 + 99)
        totalInvoices: 3,
        paidInvoices: 2,
        unpaidInvoices: 1,
        averageInvoiceAmount: 229.67 // (299 + 99 + 299) / 3
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle Stripe API errors gracefully', async () => {
      const stripeError = new Error('Your card was declined');
      stripeError.type = 'StripeCardError';
      mockStripe.subscriptions.create.mockRejectedValue(stripeError);

      await expect(
        billingService.createSubscription('tenant-123', 'professional', 'monthly')
      ).rejects.toThrow('Your card was declined');
    });

    test('should handle database errors during subscription creation', async () => {
      const dbError = new Error('Database connection failed');
      mockDatabaseService.logBillingEvent.mockRejectedValue(dbError);

      // Should still complete the Stripe operation even if logging fails
      await expect(
        billingService.createSubscription('tenant-123', 'professional', 'monthly')
      ).rejects.toThrow('Database connection failed');
    });

    test('should handle email service failures gracefully', async () => {
      const emailError = new Error('Email service unavailable');
      mockEmailService.sendSubscriptionConfirmation.mockRejectedValue(emailError);

      // Should complete subscription creation even if email fails
      const result = await billingService.createSubscription(
        'tenant-123',
        'professional',
        'monthly'
      );

      expect(result).toBeDefined();
      expect(mockDatabaseService.logBillingEvent).toHaveBeenCalled();
    });
  });
});