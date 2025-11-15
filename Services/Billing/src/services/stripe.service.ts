import Stripe from 'stripe';
import { logger } from '../utils/logger';
import { DatabaseService } from './database.service';

export interface CreateCheckoutSessionParams {
  priceId: string;
  customerId?: string;
  customerEmail: string;
  tenantId: string;
  successUrl: string;
  cancelUrl: string;
  trialPeriodDays?: number;
  metadata?: Record<string, string>;
}

export interface CreateCustomerParams {
  email: string;
  name?: string;
  tenantId: string;
  metadata?: Record<string, string>;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  priceId: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  isPopular?: boolean;
}

export class StripeService {
  private stripe: Stripe;
  private db: DatabaseService;

  constructor() {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required');
    }

    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
      typescript: true,
    });

    this.db = new DatabaseService();
  }

  /**
   * Create a Stripe customer
   */
  async createCustomer(params: CreateCustomerParams): Promise<Stripe.Customer> {
    try {
      const customer = await this.stripe.customers.create({
        email: params.email,
        name: params.name,
        metadata: {
          tenantId: params.tenantId,
          ...params.metadata,
        },
      });

      // Store customer in database
      await this.db.createCustomer({
        stripeCustomerId: customer.id,
        email: params.email,
        name: params.name,
        tenantId: params.tenantId,
      });

      logger.info('Stripe customer created', { customerId: customer.id, tenantId: params.tenantId });
      return customer;
    } catch (error) {
      logger.error('Failed to create Stripe customer', { error, params });
      throw error;
    }
  }

  /**
   * Create a checkout session for subscription
   */
  async createCheckoutSession(params: CreateCheckoutSessionParams): Promise<Stripe.Checkout.Session> {
    try {
      let customerId = params.customerId;

      // Create customer if not provided
      if (!customerId) {
        const customer = await this.createCustomer({
          email: params.customerEmail,
          tenantId: params.tenantId,
        });
        customerId = customer.id;
      }

      const sessionParams: Stripe.Checkout.SessionCreateParams = {
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: params.priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        metadata: {
          tenantId: params.tenantId,
          ...params.metadata,
        },
        allow_promotion_codes: true,
        billing_address_collection: 'required',
        customer_update: {
          address: 'auto',
          name: 'auto',
        },
      };

      // Add trial period if specified
      if (params.trialPeriodDays) {
        sessionParams.subscription_data = {
          trial_period_days: params.trialPeriodDays,
          metadata: {
            tenantId: params.tenantId,
          },
        };
      }

      const session = await this.stripe.checkout.sessions.create(sessionParams);

      logger.info('Checkout session created', { 
        sessionId: session.id, 
        tenantId: params.tenantId,
        customerId 
      });

      return session;
    } catch (error) {
      logger.error('Failed to create checkout session', { error, params });
      throw error;
    }
  }

  /**
   * Create a billing portal session
   */
  async createBillingPortalSession(customerId: string, returnUrl: string): Promise<Stripe.BillingPortal.Session> {
    try {
      const session = await this.stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });

      logger.info('Billing portal session created', { customerId, sessionId: session.id });
      return session;
    } catch (error) {
      logger.error('Failed to create billing portal session', { error, customerId });
      throw error;
    }
  }

  /**
   * Get subscription by ID
   */
  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId, {
        expand: ['default_payment_method', 'customer'],
      });

      return subscription;
    } catch (error) {
      logger.error('Failed to retrieve subscription', { error, subscriptionId });
      throw error;
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd: boolean = true): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: cancelAtPeriodEnd,
      });

      logger.info('Subscription cancelled', { subscriptionId, cancelAtPeriodEnd });
      return subscription;
    } catch (error) {
      logger.error('Failed to cancel subscription', { error, subscriptionId });
      throw error;
    }
  }

  /**
   * Reactivate subscription
   */
  async reactivateSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: false,
      });

      logger.info('Subscription reactivated', { subscriptionId });
      return subscription;
    } catch (error) {
      logger.error('Failed to reactivate subscription', { error, subscriptionId });
      throw error;
    }
  }

  /**
   * Get customer by ID
   */
  async getCustomer(customerId: string): Promise<Stripe.Customer> {
    try {
      const customer = await this.stripe.customers.retrieve(customerId) as Stripe.Customer;
      return customer;
    } catch (error) {
      logger.error('Failed to retrieve customer', { error, customerId });
      throw error;
    }
  }

  /**
   * List customer subscriptions
   */
  async getCustomerSubscriptions(customerId: string): Promise<Stripe.Subscription[]> {
    try {
      const subscriptions = await this.stripe.subscriptions.list({
        customer: customerId,
        status: 'all',
        expand: ['data.default_payment_method'],
      });

      return subscriptions.data;
    } catch (error) {
      logger.error('Failed to retrieve customer subscriptions', { error, customerId });
      throw error;
    }
  }

  /**
   * Get available subscription plans
   */
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      // In a real implementation, you might store these in your database
      // or retrieve them from Stripe products/prices
      const plans: SubscriptionPlan[] = [
        {
          id: 'basic',
          name: 'Basic Plan',
          description: 'Perfect for small teams getting started',
          priceId: process.env.STRIPE_PRICE_ID_BASIC || 'price_basic',
          price: 29,
          currency: 'usd',
          interval: 'month',
          features: [
            'Up to 5 users',
            'Basic reporting',
            'Email support',
            '10GB storage',
          ],
        },
        {
          id: 'professional',
          name: 'Professional Plan',
          description: 'Best for growing businesses',
          priceId: process.env.STRIPE_PRICE_ID_PRO || 'price_pro',
          price: 99,
          currency: 'usd',
          interval: 'month',
          isPopular: true,
          features: [
            'Up to 25 users',
            'Advanced reporting',
            'Priority support',
            '100GB storage',
            'API access',
            'Custom integrations',
          ],
        },
        {
          id: 'enterprise',
          name: 'Enterprise Plan',
          description: 'For large organizations with advanced needs',
          priceId: process.env.STRIPE_PRICE_ID_ENTERPRISE || 'price_enterprise',
          price: 299,
          currency: 'usd',
          interval: 'month',
          features: [
            'Unlimited users',
            'Custom reporting',
            'Dedicated support',
            'Unlimited storage',
            'Advanced API access',
            'Custom integrations',
            'SSO integration',
            'Advanced security',
          ],
        },
      ];

      return plans;
    } catch (error) {
      logger.error('Failed to get subscription plans', { error });
      throw error;
    }
  }

  /**
   * Construct webhook event
   */
  constructWebhookEvent(payload: string, signature: string): Stripe.Event {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET environment variable is required');
    }

    try {
      return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (error) {
      logger.error('Failed to construct webhook event', { error });
      throw error;
    }
  }

  /**
   * Handle subscription created event
   */
  async handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
    try {
      const customer = subscription.customer as string;
      const tenantId = subscription.metadata.tenantId;

      await this.db.createSubscription({
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: customer,
        tenantId,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        priceId: subscription.items.data[0]?.price.id,
      });

      // Activate tenant
      await this.db.activateTenant(tenantId);

      logger.info('Subscription created and tenant activated', { 
        subscriptionId: subscription.id, 
        tenantId 
      });
    } catch (error) {
      logger.error('Failed to handle subscription created', { error, subscriptionId: subscription.id });
      throw error;
    }
  }

  /**
   * Handle subscription updated event
   */
  async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    try {
      const tenantId = subscription.metadata.tenantId;

      await this.db.updateSubscription(subscription.id, {
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      });

      // Handle subscription status changes
      if (subscription.status === 'active') {
        await this.db.activateTenant(tenantId);
      } else if (['canceled', 'unpaid', 'past_due'].includes(subscription.status)) {
        await this.db.suspendTenant(tenantId);
      }

      logger.info('Subscription updated', { 
        subscriptionId: subscription.id, 
        tenantId,
        status: subscription.status 
      });
    } catch (error) {
      logger.error('Failed to handle subscription updated', { error, subscriptionId: subscription.id });
      throw error;
    }
  }

  /**
   * Handle subscription deleted event
   */
  async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    try {
      const tenantId = subscription.metadata.tenantId;

      await this.db.updateSubscription(subscription.id, {
        status: 'canceled',
        canceledAt: new Date(),
      });

      // Suspend tenant
      await this.db.suspendTenant(tenantId);

      logger.info('Subscription deleted and tenant suspended', { 
        subscriptionId: subscription.id, 
        tenantId 
      });
    } catch (error) {
      logger.error('Failed to handle subscription deleted', { error, subscriptionId: subscription.id });
      throw error;
    }
  }
}
