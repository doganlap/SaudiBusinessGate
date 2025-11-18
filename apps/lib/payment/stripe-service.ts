import Stripe from 'stripe';

// Stripe Configuration
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-10-29.clover',
});

// Payment Interfaces
export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  clientSecret: string;
  customerId?: string;
  metadata: Record<string, string>;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  featuresAr: string[];
  stripePriceId: string;
  isPopular?: boolean;
}

export interface Customer {
  id: string;
  stripeCustomerId: string;
  email: string;
  name: string;
  tenantId: string;
  subscriptionId?: string;
  subscriptionStatus?: string;
  createdAt: string;
  updatedAt: string;
}

// Saudi Store Subscription Plans
export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic Plan',
    nameAr: 'الخطة الأساسية',
    description: 'Perfect for small businesses',
    descriptionAr: 'مثالية للشركات الصغيرة',
    price: 299,
    currency: 'SAR',
    interval: 'month',
    features: [
      'Up to 10 users',
      'Basic red flags detection',
      '5 AI agents',
      'Standard support',
      '10GB storage'
    ],
    featuresAr: [
      'حتى 10 مستخدمين',
      'كشف الأعلام الحمراء الأساسي',
      '5 وكلاء ذكية',
      'دعم قياسي',
      '10 جيجابايت تخزين'
    ],
    stripePriceId: 'price_basic_monthly_sar'
  },
  {
    id: 'professional',
    name: 'Professional Plan',
    nameAr: 'الخطة الاحترافية',
    description: 'Advanced features for growing businesses',
    descriptionAr: 'ميزات متقدمة للشركات النامية',
    price: 599,
    currency: 'SAR',
    interval: 'month',
    features: [
      'Up to 50 users',
      'Advanced red flags detection',
      '15 AI agents',
      'Priority support',
      '100GB storage',
      'Custom workflows',
      'Advanced analytics'
    ],
    featuresAr: [
      'حتى 50 مستخدم',
      'كشف الأعلام الحمراء المتقدم',
      '15 وكيل ذكي',
      'دعم أولوية',
      '100 جيجابايت تخزين',
      'سير عمل مخصص',
      'تحليلات متقدمة'
    ],
    stripePriceId: 'price_professional_monthly_sar',
    isPopular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise Plan',
    nameAr: 'خطة المؤسسات',
    description: 'Complete solution for large organizations',
    descriptionAr: 'حل شامل للمؤسسات الكبيرة',
    price: 1299,
    currency: 'SAR',
    interval: 'month',
    features: [
      'Unlimited users',
      'Full red flags detection',
      'Unlimited AI agents',
      '24/7 dedicated support',
      'Unlimited storage',
      'Custom integrations',
      'White-label solution',
      'Advanced security',
      'Custom themes'
    ],
    featuresAr: [
      'مستخدمين غير محدودين',
      'كشف الأعلام الحمراء الكامل',
      'وكلاء ذكية غير محدودة',
      'دعم مخصص 24/7',
      'تخزين غير محدود',
      'تكاملات مخصصة',
      'حل العلامة البيضاء',
      'أمان متقدم',
      'مظاهر مخصصة'
    ],
    stripePriceId: 'price_enterprise_monthly_sar'
  }
];

class StripePaymentService {
  private stripe: Stripe;

  constructor() {
    this.stripe = stripe;
  }

  // Create Payment Intent
  async createPaymentIntent(
    amount: number,
    currency: string = 'SAR',
    customerId?: string,
    metadata: Record<string, string> = {}
  ): Promise<PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to smallest currency unit
        currency: currency.toLowerCase(),
        customer: customerId,
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        id: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase(),
        status: paymentIntent.status,
        clientSecret: paymentIntent.client_secret || '',
        customerId: paymentIntent.customer as string,
        metadata: paymentIntent.metadata,
      };
    } catch (error) {
      console.error('❌ Failed to create payment intent:', error);
      throw error;
    }
  }

  // Create Customer
  async createCustomer(
    email: string,
    name: string,
    tenantId: string,
    metadata: Record<string, string> = {}
  ): Promise<Stripe.Customer> {
    try {
      const customer = await this.stripe.customers.create({
        email,
        name,
        metadata: {
          tenantId,
          ...metadata,
        },
      });

      console.log(`✅ Customer created: ${customer.id} (${email})`);
      return customer;
    } catch (error) {
      console.error('❌ Failed to create customer:', error);
      throw error;
    }
  }

  // Create Checkout Session
  async createCheckoutSession(
    priceId: string,
    customerId: string,
    successUrl: string,
    cancelUrl: string,
    metadata: Record<string, string> = {}
  ): Promise<Stripe.Checkout.Session> {
    try {
      const session = await this.stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata,
        allow_promotion_codes: true,
        billing_address_collection: 'required',
        tax_id_collection: {
          enabled: true,
        },
      });

      console.log(`✅ Checkout session created: ${session.id}`);
      return session;
    } catch (error) {
      console.error('❌ Failed to create checkout session:', error);
      throw error;
    }
  }

  // Create Subscription
  async createSubscription(
    customerId: string,
    priceId: string,
    metadata: Record<string, string> = {}
  ): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        metadata,
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });

      console.log(`✅ Subscription created: ${subscription.id}`);
      return subscription;
    } catch (error) {
      console.error('❌ Failed to create subscription:', error);
      throw error;
    }
  }

  // Get Customer Subscriptions
  async getCustomerSubscriptions(customerId: string): Promise<Stripe.Subscription[]> {
    try {
      const subscriptions = await this.stripe.subscriptions.list({
        customer: customerId,
        status: 'all',
        expand: ['data.default_payment_method'],
      });

      return subscriptions.data;
    } catch (error) {
      console.error('❌ Failed to get customer subscriptions:', error);
      throw error;
    }
  }

  // Cancel Subscription
  async cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.cancel(subscriptionId);
      console.log(`✅ Subscription cancelled: ${subscriptionId}`);
      return subscription;
    } catch (error) {
      console.error('❌ Failed to cancel subscription:', error);
      throw error;
    }
  }

  // Create Customer Portal Session
  async createPortalSession(
    customerId: string,
    returnUrl: string
  ): Promise<Stripe.BillingPortal.Session> {
    try {
      const session = await this.stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });

      console.log(`✅ Portal session created for customer: ${customerId}`);
      return session;
    } catch (error) {
      console.error('❌ Failed to create portal session:', error);
      throw error;
    }
  }

  // Handle Webhook Events
  async handleWebhook(
    payload: string,
    signature: string,
    endpointSecret: string
  ): Promise<Stripe.Event> {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        endpointSecret
      );

      console.log(`✅ Webhook event received: ${event.type}`);
      return event;
    } catch (error) {
      console.error('❌ Webhook signature verification failed:', error);
      throw error;
    }
  }

  // Process Webhook Event
  async processWebhookEvent(event: Stripe.Event): Promise<void> {
    try {
      switch (event.type) {
        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;

        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;

        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error(`❌ Failed to process webhook event ${event.type}:`, error);
      throw error;
    }
  }

  // Handle Subscription Created
  private async handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
    console.log(`✅ Subscription created: ${subscription.id} for customer: ${subscription.customer}`);
    
    // Update database with subscription info
    // This would typically update your database
    // await updateCustomerSubscription(subscription.customer, subscription);
  }

  // Handle Subscription Updated
  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    console.log(`✅ Subscription updated: ${subscription.id} status: ${subscription.status}`);
    
    // Update database with subscription changes
    // await updateCustomerSubscription(subscription.customer, subscription);
  }

  // Handle Subscription Deleted
  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    console.log(`✅ Subscription deleted: ${subscription.id}`);
    
    // Update database to reflect cancelled subscription
    // await cancelCustomerSubscription(subscription.customer, subscription.id);
  }

  // Handle Payment Succeeded
  private async handlePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    console.log(`✅ Payment succeeded for invoice: ${invoice.id}`);
    
    // Update database with successful payment
    // await recordSuccessfulPayment(invoice);
  }

  // Handle Payment Failed
  private async handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    console.log(`❌ Payment failed for invoice: ${invoice.id}`);
    
    // Handle failed payment (send notification, update status, etc.)
    // await handleFailedPayment(invoice);
  }

  // Get Subscription Plans
  getSubscriptionPlans(): SubscriptionPlan[] {
    return subscriptionPlans;
  }

  // Get Plan by ID
  getPlanById(planId: string): SubscriptionPlan | undefined {
    return subscriptionPlans.find(plan => plan.id === planId);
  }

  // Format Price for Display
  formatPrice(amount: number, currency: string = 'SAR'): string {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }
}

// Export singleton instance
export const stripePayment = new StripePaymentService();
