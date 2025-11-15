import { Request, Response } from 'express';
import Stripe from 'stripe';
import { StripeService } from '@/services/stripe.service';
import { DatabaseService } from '@/services/database.service';
import { logger } from '@/utils/logger';

export class WebhookController {
  private stripeService: StripeService;
  private databaseService: DatabaseService;

  constructor() {
    this.stripeService = new StripeService();
    this.databaseService = new DatabaseService();
  }

  /**
   * Handle Stripe webhook events
   */
  async handleStripeWebhook(req: Request, res: Response): Promise<void> {
    const signature = req.headers['stripe-signature'] as string;
    
    if (!signature) {
      logger.error('Missing Stripe signature header');
      res.status(400).json({ error: 'Missing Stripe signature' });
      return;
    }

    try {
      // Construct the event from the webhook payload
      const event = this.stripeService.constructWebhookEvent(req.body, signature);
      
      logger.info('Received Stripe webhook event', { 
        eventId: event.id, 
        eventType: event.type 
      });

      // Log the event for audit trail
      const tenantId = this.extractTenantId(event);
      if (tenantId) {
        await this.databaseService.logBillingEvent(
          tenantId,
          event.id,
          event.type,
          event.data
        );
      }

      // Handle the event based on its type
      await this.processWebhookEvent(event);

      res.status(200).json({ received: true });
    } catch (error) {
      logger.error('Webhook processing failed', { error });
      res.status(400).json({ error: 'Webhook processing failed' });
    }
  }

  /**
   * Process webhook event based on type
   */
  private async processWebhookEvent(event: Stripe.Event): Promise<void> {
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

      case 'customer.subscription.trial_will_end':
        await this.handleTrialWillEnd(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'payment_intent.succeeded':
        await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await this.handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'checkout.session.completed':
        await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.created':
        await this.handleCustomerCreated(event.data.object as Stripe.Customer);
        break;

      case 'customer.updated':
        await this.handleCustomerUpdated(event.data.object as Stripe.Customer);
        break;

      case 'customer.deleted':
        await this.handleCustomerDeleted(event.data.object as Stripe.Customer);
        break;

      default:
        logger.info('Unhandled webhook event type', { eventType: event.type });
    }
  }

  /**
   * Handle subscription created
   */
  private async handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
    try {
      await this.stripeService.handleSubscriptionCreated(subscription);
      logger.info('Subscription created event processed', { subscriptionId: subscription.id });
    } catch (error) {
      logger.error('Failed to handle subscription created', { error, subscriptionId: subscription.id });
      throw error;
    }
  }

  /**
   * Handle subscription updated
   */
  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    try {
      await this.stripeService.handleSubscriptionUpdated(subscription);
      logger.info('Subscription updated event processed', { subscriptionId: subscription.id });
    } catch (error) {
      logger.error('Failed to handle subscription updated', { error, subscriptionId: subscription.id });
      throw error;
    }
  }

  /**
   * Handle subscription deleted
   */
  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    try {
      await this.stripeService.handleSubscriptionDeleted(subscription);
      logger.info('Subscription deleted event processed', { subscriptionId: subscription.id });
    } catch (error) {
      logger.error('Failed to handle subscription deleted', { error, subscriptionId: subscription.id });
      throw error;
    }
  }

  /**
   * Handle trial will end
   */
  private async handleTrialWillEnd(subscription: Stripe.Subscription): Promise<void> {
    try {
      const tenantId = subscription.metadata.tenantId;
      const customer = await this.databaseService.getCustomerByTenantId(tenantId);
      
      if (customer) {
        // Send trial ending notification email
        // This would integrate with your email service
        logger.info('Trial ending notification should be sent', { 
          tenantId, 
          subscriptionId: subscription.id,
          customerEmail: customer.email
        });
      }
    } catch (error) {
      logger.error('Failed to handle trial will end', { error, subscriptionId: subscription.id });
      throw error;
    }
  }

  /**
   * Handle invoice payment succeeded
   */
  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    try {
      const subscriptionId = invoice.subscription as string;
      
      if (subscriptionId) {
        // Update subscription status if needed
        const subscription = await this.stripeService.getSubscription(subscriptionId);
        await this.stripeService.handleSubscriptionUpdated(subscription);
      }

      logger.info('Invoice payment succeeded', { invoiceId: invoice.id, subscriptionId });
    } catch (error) {
      logger.error('Failed to handle invoice payment succeeded', { error, invoiceId: invoice.id });
      throw error;
    }
  }

  /**
   * Handle invoice payment failed
   */
  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    try {
      const subscriptionId = invoice.subscription as string;
      const customerId = invoice.customer as string;
      
      if (subscriptionId) {
        // Get subscription and tenant info
        const subscription = await this.stripeService.getSubscription(subscriptionId);
        const tenantId = subscription.metadata.tenantId;
        
        // Send payment failed notification
        logger.info('Payment failed notification should be sent', { 
          tenantId,
          subscriptionId,
          invoiceId: invoice.id,
          customerId
        });
      }
    } catch (error) {
      logger.error('Failed to handle invoice payment failed', { error, invoiceId: invoice.id });
      throw error;
    }
  }

  /**
   * Handle payment intent succeeded
   */
  private async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    try {
      logger.info('Payment intent succeeded', { 
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency
      });
    } catch (error) {
      logger.error('Failed to handle payment intent succeeded', { error, paymentIntentId: paymentIntent.id });
      throw error;
    }
  }

  /**
   * Handle payment intent failed
   */
  private async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    try {
      logger.info('Payment intent failed', { 
        paymentIntentId: paymentIntent.id,
        lastPaymentError: paymentIntent.last_payment_error
      });
    } catch (error) {
      logger.error('Failed to handle payment intent failed', { error, paymentIntentId: paymentIntent.id });
      throw error;
    }
  }

  /**
   * Handle checkout session completed
   */
  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
    try {
      const tenantId = session.metadata?.tenantId;
      
      if (session.mode === 'subscription' && session.subscription) {
        // Subscription checkout completed
        const subscription = await this.stripeService.getSubscription(session.subscription as string);
        await this.stripeService.handleSubscriptionCreated(subscription);
      }

      logger.info('Checkout session completed', { 
        sessionId: session.id,
        tenantId,
        mode: session.mode
      });
    } catch (error) {
      logger.error('Failed to handle checkout session completed', { error, sessionId: session.id });
      throw error;
    }
  }

  /**
   * Handle customer created
   */
  private async handleCustomerCreated(customer: Stripe.Customer): Promise<void> {
    try {
      logger.info('Customer created', { customerId: customer.id, email: customer.email });
    } catch (error) {
      logger.error('Failed to handle customer created', { error, customerId: customer.id });
      throw error;
    }
  }

  /**
   * Handle customer updated
   */
  private async handleCustomerUpdated(customer: Stripe.Customer): Promise<void> {
    try {
      logger.info('Customer updated', { customerId: customer.id, email: customer.email });
    } catch (error) {
      logger.error('Failed to handle customer updated', { error, customerId: customer.id });
      throw error;
    }
  }

  /**
   * Handle customer deleted
   */
  private async handleCustomerDeleted(customer: Stripe.Customer): Promise<void> {
    try {
      const tenantId = customer.metadata?.tenantId;
      
      if (tenantId) {
        // Suspend tenant when customer is deleted
        await this.databaseService.suspendTenant(tenantId);
      }

      logger.info('Customer deleted', { customerId: customer.id, tenantId });
    } catch (error) {
      logger.error('Failed to handle customer deleted', { error, customerId: customer.id });
      throw error;
    }
  }

  /**
   * Extract tenant ID from webhook event
   */
  private extractTenantId(event: Stripe.Event): string | null {
    const data = event.data.object as any;
    
    // Try to get tenant ID from metadata
    if (data.metadata?.tenantId) {
      return data.metadata.tenantId;
    }
    
    // For subscription events, try to get from subscription metadata
    if (data.subscription?.metadata?.tenantId) {
      return data.subscription.metadata.tenantId;
    }
    
    // For customer events, try to get from customer metadata
    if (data.customer?.metadata?.tenantId) {
      return data.customer.metadata.tenantId;
    }
    
    return null;
  }
}
