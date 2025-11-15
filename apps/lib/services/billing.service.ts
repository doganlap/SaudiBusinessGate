/**
 * Comprehensive Billing Service
 * Handles all billing operations including Stripe integration, invoice generation,
 * payment processing, subscription management, and webhook handling
 */

import Stripe from 'stripe';
import { DatabaseService } from './database.service';
import { EmailService } from './email.service';
import { NotificationService } from './notification.service';

interface BillingEvent {
  tenantId: string;
  eventType: string;
  data?: any;
  timestamp?: Date;
}

interface LicensePlan {
  id: string;
  name: string;
  type: 'basic' | 'professional' | 'enterprise' | 'custom';
  features: string[];
  price: {
    monthly: number;
    annual: number;
  };
  limits: {
    users: number;
    storage: number; // GB
    apiCalls: number;
    supportLevel: 'basic' | 'priority' | 'dedicated';
  };
  stripePriceIds: {
    monthly: string;
    annual: string;
  };
}

interface BillingCycle {
  tenantId: string;
  licenseId: string;
  period: 'monthly' | 'annual';
  amount: number;
  currency: 'USD' | 'EUR' | 'SAR';
  dueDate: Date;
  status: 'pending' | 'paid' | 'overdue' | 'failed';
  invoiceId?: string;
  stripeInvoiceId?: string;
}

interface PaymentMethod {
  id: string;
  tenantId: string;
  stripePaymentMethodId: string;
  type: 'card' | 'bank_account';
  last4: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

interface WebhookEvent {
  id: string;
  type: string;
  data: any;
  processedAt?: Date;
  status: 'pending' | 'processed' | 'failed';
  retryCount: number;
}

export class BillingService {
  private stripe: Stripe;
  private databaseService: DatabaseService;
  private emailService: EmailService;
  private notificationService: NotificationService;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-10-29.clover',
    });
    this.databaseService = new DatabaseService();
    this.emailService = new EmailService();
    this.notificationService = new NotificationService();
  }

  // ===================== LICENSE PLANS =====================

  async getLicensePlans(): Promise<LicensePlan[]> {
    const plans: LicensePlan[] = [
      {
        id: 'basic',
        name: 'Basic Plan',
        type: 'basic',
        features: ['Core Features', 'Basic Support', 'API Access'],
        price: { monthly: 99, annual: 999 },
        limits: { users: 10, storage: 50, apiCalls: 10000, supportLevel: 'basic' },
        stripePriceIds: { monthly: 'price_basic_monthly', annual: 'price_basic_annual' }
      },
      {
        id: 'professional',
        name: 'Professional Plan',
        type: 'professional',
        features: ['All Basic Features', 'Advanced Analytics', 'Priority Support'],
        price: { monthly: 299, annual: 2999 },
        limits: { users: 50, storage: 200, apiCalls: 50000, supportLevel: 'priority' },
        stripePriceIds: { monthly: 'price_pro_monthly', annual: 'price_pro_annual' }
      },
      {
        id: 'enterprise',
        name: 'Enterprise Plan',
        type: 'enterprise',
        features: ['All Pro Features', 'Custom Integrations', 'Dedicated Support'],
        price: { monthly: 999, annual: 9999 },
        limits: { users: -1, storage: 1000, apiCalls: -1, supportLevel: 'dedicated' },
        stripePriceIds: { monthly: 'price_ent_monthly', annual: 'price_ent_annual' }
      }
    ];

    return plans;
  }

  async getLicensePlan(planId: string): Promise<LicensePlan | null> {
    const plans = await this.getLicensePlans();
    return plans.find(plan => plan.id === planId) || null;
  }

  // ===================== SUBSCRIPTION MANAGEMENT =====================

  async createSubscription(tenantId: string, planId: string, billingPeriod: 'monthly' | 'annual', paymentMethodId?: string): Promise<any> {
    try {
      const plan = await this.getLicensePlan(planId);
      if (!plan) {
        throw new Error(`License plan ${planId} not found`);
      }

      // Get or create Stripe customer
      const customer = await this.getOrCreateStripeCustomer(tenantId);
      
      // Attach payment method if provided
      if (paymentMethodId) {
        await this.stripe.paymentMethods.attach(paymentMethodId, {
          customer: customer.id,
        });
      }

      // Create subscription
      const priceId = billingPeriod === 'monthly' ? plan.stripePriceIds.monthly : plan.stripePriceIds.annual;
      const subscription = await this.stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: priceId }],
        default_payment_method: paymentMethodId,
        metadata: {
          tenantId,
          planId,
          billingPeriod
        }
      });

      // Record in database
      await this.databaseService.logBillingEvent({
        tenantId,
        eventType: 'subscription_created',
        data: {
          subscriptionId: subscription.id,
          planId,
          billingPeriod,
          amount: plan.price[billingPeriod],
          status: subscription.status
        }
      });

      // Send confirmation email
      await this.emailService.sendSubscriptionConfirmation({
        tenantId,
        planName: plan.name,
        amount: plan.price[billingPeriod],
        billingPeriod,
        subscriptionId: subscription.id
      });

      return subscription;
    } catch (error) {
      await this.databaseService.logBillingEvent({
        tenantId,
        eventType: 'subscription_failed',
        data: {
          planId,
          billingPeriod,
          error: error.message
        }
      });
      throw error;
    }
  }

  async updateSubscription(subscriptionId: string, newPlanId: string, billingPeriod: 'monthly' | 'annual'): Promise<any> {
    try {
      const plan = await this.getLicensePlan(newPlanId);
      if (!plan) {
        throw new Error(`License plan ${newPlanId} not found`);
      }

      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
      const priceId = billingPeriod === 'monthly' ? plan.stripePriceIds.monthly : plan.stripePriceIds.annual;

      const updatedSubscription = await this.stripe.subscriptions.update(subscriptionId, {
        items: [{
          id: subscription.items.data[0].id,
          price: priceId,
        }],
        metadata: {
          ...subscription.metadata,
          planId: newPlanId,
          billingPeriod
        }
      });

      // Record upgrade/downgrade
      await this.databaseService.logBillingEvent({
        tenantId: subscription.metadata.tenantId,
        eventType: 'subscription_updated',
        data: {
          subscriptionId,
          oldPlanId: subscription.metadata.planId,
          newPlanId,
          billingPeriod,
          amount: plan.price[billingPeriod]
        }
      });

      // Send notification
      await this.emailService.sendSubscriptionUpdate({
        tenantId: subscription.metadata.tenantId,
        planName: plan.name,
        amount: plan.price[billingPeriod],
        billingPeriod,
        subscriptionId
      });

      return updatedSubscription;
    } catch (error) {
      throw error;
    }
  }

  async cancelSubscription(subscriptionId: string, immediately: boolean = false): Promise<any> {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
      
      const canceledSubscription = immediately 
        ? await this.stripe.subscriptions.cancel(subscriptionId)
        : await this.stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: true
          });

      // Record cancellation
      await this.databaseService.logBillingEvent({
        tenantId: subscription.metadata.tenantId,
        eventType: 'subscription_canceled',
        data: {
          subscriptionId,
          immediately,
          canceledAt: new Date(),
          endDate: immediately ? new Date() : new Date(subscription.current_period_end * 1000)
        }
      });

      // Send confirmation email
      await this.emailService.sendSubscriptionCancellation({
        tenantId: subscription.metadata.tenantId,
        subscriptionId,
        endDate: immediately ? new Date() : new Date(subscription.current_period_end * 1000)
      });

      return canceledSubscription;
    } catch (error) {
      throw error;
    }
  }

  // ===================== INVOICE MANAGEMENT =====================

  async generateInvoice(tenantId: string, items: Array<{description: string, amount: number, quantity?: number}>): Promise<any> {
    try {
      const customer = await this.getOrCreateStripeCustomer(tenantId);
      
      // Create invoice items
      for (const item of items) {
        await this.stripe.invoiceItems.create({
          customer: customer.id,
          amount: Math.round(item.amount * 100), // Convert to cents
          currency: 'usd',
          description: item.description,
          quantity: item.quantity || 1
        });
      }

      // Create and finalize invoice
      const invoice = await this.stripe.invoices.create({
        customer: customer.id,
        auto_advance: true,
        metadata: { tenantId }
      });

      const finalizedInvoice = await this.stripe.invoices.finalizeInvoice(invoice.id);

      // Record in database
      await this.databaseService.logBillingEvent({
        tenantId,
        eventType: 'invoice_generated',
        data: {
          invoiceId: finalizedInvoice.id,
          amount: finalizedInvoice.amount_due / 100,
          currency: finalizedInvoice.currency,
          items,
          dueDate: new Date(finalizedInvoice.due_date! * 1000)
        }
      });

      // Send invoice email
      await this.emailService.sendInvoice({
        tenantId,
        invoiceId: finalizedInvoice.id,
        amount: finalizedInvoice.amount_due / 100,
        dueDate: new Date(finalizedInvoice.due_date! * 1000),
        invoiceUrl: finalizedInvoice.hosted_invoice_url
      });

      return finalizedInvoice;
    } catch (error) {
      throw error;
    }
  }

  async getInvoices(tenantId: string, limit: number = 10): Promise<any[]> {
    try {
      const customer = await this.getOrCreateStripeCustomer(tenantId);
      const invoices = await this.stripe.invoices.list({
        customer: customer.id,
        limit
      });

      return invoices.data;
    } catch (error) {
      throw error;
    }
  }

  // ===================== PAYMENT METHODS =====================

  async addPaymentMethod(tenantId: string, paymentMethodId: string, setAsDefault: boolean = false): Promise<PaymentMethod> {
    try {
      const customer = await this.getOrCreateStripeCustomer(tenantId);
      
      // Attach payment method to customer
      await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customer.id,
      });

      const paymentMethod = await this.stripe.paymentMethods.retrieve(paymentMethodId);

      if (setAsDefault) {
        await this.stripe.customers.update(customer.id, {
          invoice_settings: {
            default_payment_method: paymentMethodId,
          },
        });
      }

      // Store in database
      const savedPaymentMethod: PaymentMethod = {
        id: paymentMethod.id,
        tenantId,
        stripePaymentMethodId: paymentMethod.id,
        type: paymentMethod.type as 'card' | 'bank_account',
        last4: paymentMethod.card?.last4 || '',
        brand: paymentMethod.card?.brand,
        expiryMonth: paymentMethod.card?.exp_month,
        expiryYear: paymentMethod.card?.exp_year,
        isDefault: setAsDefault
      };

      await this.databaseService.logBillingEvent({
        tenantId,
        eventType: 'payment_method_added',
        data: savedPaymentMethod
      });

      return savedPaymentMethod;
    } catch (error) {
      throw error;
    }
  }

  async removePaymentMethod(tenantId: string, paymentMethodId: string): Promise<void> {
    try {
      await this.stripe.paymentMethods.detach(paymentMethodId);

      await this.databaseService.logBillingEvent({
        tenantId,
        eventType: 'payment_method_removed',
        data: { paymentMethodId }
      });
    } catch (error) {
      throw error;
    }
  }

  // ===================== WEBHOOK HANDLING =====================

  async handleWebhook(signature: string, body: string): Promise<void> {
    try {
      const event = this.stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );

      // Store webhook event
      const webhookEvent: WebhookEvent = {
        id: event.id,
        type: event.type,
        data: event.data,
        status: 'pending',
        retryCount: 0
      };

      await this.processWebhookEvent(webhookEvent);
    } catch (error) {
      throw error;
    }
  }

  private async processWebhookEvent(webhookEvent: WebhookEvent): Promise<void> {
    try {
      switch (webhookEvent.type) {
        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(webhookEvent.data.object);
          break;
        case 'invoice.payment_failed':
          await this.handlePaymentFailed(webhookEvent.data.object);
          break;
        case 'subscription.created':
          await this.handleSubscriptionCreated(webhookEvent.data.object);
          break;
        case 'subscription.updated':
          await this.handleSubscriptionUpdated(webhookEvent.data.object);
          break;
        case 'subscription.deleted':
          await this.handleSubscriptionDeleted(webhookEvent.data.object);
          break;
        case 'customer.subscription.trial_will_end':
          await this.handleTrialWillEnd(webhookEvent.data.object);
          break;
        default:
          console.log(`Unhandled webhook event type: ${webhookEvent.type}`);
      }

      webhookEvent.status = 'processed';
      webhookEvent.processedAt = new Date();
    } catch (error) {
      webhookEvent.status = 'failed';
      webhookEvent.retryCount += 1;
      
      // Schedule retry if under limit
      if (webhookEvent.retryCount < 3) {
        setTimeout(() => {
          this.processWebhookEvent(webhookEvent);
        }, 1000 * Math.pow(2, webhookEvent.retryCount)); // Exponential backoff
      }
      
      throw error;
    }
  }

  private async handlePaymentSucceeded(invoice: any): Promise<void> {
    const tenantId = invoice.metadata.tenantId;
    
    await this.databaseService.logBillingEvent({
      tenantId,
      eventType: 'payment_succeeded',
      data: {
        invoiceId: invoice.id,
        amount: invoice.amount_paid / 100,
        currency: invoice.currency,
        subscriptionId: invoice.subscription
      }
    });

    await this.emailService.sendPaymentConfirmation({
      tenantId,
      amount: invoice.amount_paid / 100,
      invoiceId: invoice.id
    });
  }

  private async handlePaymentFailed(invoice: any): Promise<void> {
    const tenantId = invoice.metadata.tenantId;
    
    await this.databaseService.logBillingEvent({
      tenantId,
      eventType: 'payment_failed',
      data: {
        invoiceId: invoice.id,
        amount: invoice.amount_due / 100,
        currency: invoice.currency,
        subscriptionId: invoice.subscription
      }
    });

    await this.emailService.sendPaymentFailed({
      tenantId,
      amount: invoice.amount_due / 100,
      invoiceId: invoice.id,
      retryUrl: invoice.hosted_invoice_url
    });

    // Send notification to platform admin
    await this.notificationService.sendAlert({
      type: 'payment_failed',
      priority: 'high',
      message: `Payment failed for tenant ${tenantId}`,
      data: { tenantId, invoiceId: invoice.id, amount: invoice.amount_due / 100 }
    });
  }

  // ===================== HELPER METHODS =====================

  private async getOrCreateStripeCustomer(tenantId: string): Promise<any> {
    // First check if customer exists in our database
    let customer = await this.databaseService.getStripeCustomer(tenantId);
    
    if (!customer) {
      // Get tenant details from database
      const tenant = await this.databaseService.getTenant(tenantId);
      if (!tenant) {
        throw new Error(`Tenant ${tenantId} not found`);
      }

      // Create new Stripe customer
      customer = await this.stripe.customers.create({
        email: tenant.email,
        name: tenant.name,
        metadata: { tenantId }
      });

      // Store customer ID in database
      await this.databaseService.saveStripeCustomer(tenantId, customer.id);
    }

    return customer;
  }

  // ===================== BILLING ANALYTICS =====================

  async getBillingAnalytics(tenantId: string, period: 'month' | 'quarter' | 'year'): Promise<any> {
    try {
      const customer = await this.getOrCreateStripeCustomer(tenantId);
      
      const startDate = new Date();
      switch (period) {
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(startDate.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }

      const invoices = await this.stripe.invoices.list({
        customer: customer.id,
        created: {
          gte: Math.floor(startDate.getTime() / 1000)
        }
      });

      const analytics = {
        totalRevenue: invoices.data.reduce((sum, inv) => sum + (inv.amount_paid / 100), 0),
        totalInvoices: invoices.data.length,
        paidInvoices: invoices.data.filter(inv => inv.status === 'paid').length,
        unpaidInvoices: invoices.data.filter(inv => inv.status === 'open').length,
        averageInvoiceAmount: invoices.data.length > 0 ? 
          invoices.data.reduce((sum, inv) => sum + (inv.amount_due / 100), 0) / invoices.data.length : 0
      };

      return analytics;
    } catch (error) {
      throw error;
    }
  }

  // ===================== USAGE BASED BILLING =====================

  async processUsageBasedBilling(tenantId: string, usageData: any): Promise<void> {
    try {
      const subscription = await this.getCurrentSubscription(tenantId);
      if (!subscription) {
        throw new Error(`No active subscription found for tenant ${tenantId}`);
      }

      // Calculate overage charges based on usage
      const plan = await this.getLicensePlan(subscription.metadata.planId);
      if (!plan) {
        throw new Error(`Plan not found for subscription`);
      }

      const overageCharges = this.calculateOverageCharges(usageData, plan.limits);
      
      if (overageCharges.total > 0) {
        await this.generateInvoice(tenantId, overageCharges.items);
        
        // Send usage alert
        await this.emailService.sendUsageOverageAlert({
          tenantId,
          charges: overageCharges,
          usageData
        });
      }

      // Update usage tracking
      await this.databaseService.logBillingEvent({
        tenantId,
        eventType: 'usage_processed',
        data: {
          usageData,
          overageCharges,
          subscriptionId: subscription.id
        }
      });
    } catch (error) {
      throw error;
    }
  }

  private calculateOverageCharges(usage: any, limits: any): any {
    const charges = {
      items: [],
      total: 0
    };

    // Calculate user overage
    if (limits.users > 0 && usage.activeUsers > limits.users) {
      const overage = usage.activeUsers - limits.users;
      const charge = overage * 10; // $10 per extra user
      charges.items.push({
        description: `Extra users (${overage})`,
        amount: charge
      });
      charges.total += charge;
    }

    // Calculate storage overage
    if (usage.storageGB > limits.storage) {
      const overage = usage.storageGB - limits.storage;
      const charge = overage * 0.5; // $0.50 per GB
      charges.items.push({
        description: `Extra storage (${overage}GB)`,
        amount: charge
      });
      charges.total += charge;
    }

    // Calculate API call overage
    if (limits.apiCalls > 0 && usage.apiCalls > limits.apiCalls) {
      const overage = usage.apiCalls - limits.apiCalls;
      const charge = Math.ceil(overage / 1000) * 0.1; // $0.10 per 1000 calls
      charges.items.push({
        description: `Extra API calls (${overage})`,
        amount: charge
      });
      charges.total += charge;
    }

    return charges;
  }

  private async getCurrentSubscription(tenantId: string): Promise<any> {
    try {
      const customer = await this.getOrCreateStripeCustomer(tenantId);
      const subscriptions = await this.stripe.subscriptions.list({
        customer: customer.id,
        status: 'active',
        limit: 1
      });

      return subscriptions.data[0] || null;
    } catch (error) {
      return null;
    }
  }
}

export default BillingService;