import { Request, Response } from 'express';
import { StripeService } from '@/services/stripe.service';
import { DatabaseService } from '@/services/database.service';
import { VisitorActivationService } from '@/services/visitor-activation.service';
import { logger } from '@/utils/logger';

export class BillingController {
  private stripeService: StripeService;
  private databaseService: DatabaseService;
  private visitorActivationService: VisitorActivationService;

  constructor() {
    this.stripeService = new StripeService();
    this.databaseService = new DatabaseService();
    this.visitorActivationService = new VisitorActivationService();
  }

  /**
   * Get subscription plans
   */
  async getSubscriptionPlans(req: Request, res: Response): Promise<void> {
    try {
      const plans = await this.stripeService.getSubscriptionPlans();
      
      res.json({
        success: true,
        data: plans
      });
    } catch (error) {
      logger.error('Failed to get subscription plans', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to get subscription plans'
      });
    }
  }

  /**
   * Create checkout session
   */
  async createCheckoutSession(req: Request, res: Response): Promise<void> {
    try {
      const { priceId, tenantId, customerEmail, trialPeriodDays } = req.body;
      
      if (!priceId || !tenantId || !customerEmail) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: priceId, tenantId, customerEmail'
        });
        return;
      }

      // Check if customer already exists
      let customer = await this.databaseService.getCustomerByTenantId(tenantId);
      
      const session = await this.stripeService.createCheckoutSession({
        priceId,
        customerId: customer?.stripeCustomerId,
        customerEmail,
        tenantId,
        successUrl: `${process.env.FRONTEND_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${process.env.FRONTEND_URL}/billing/cancel`,
        trialPeriodDays,
        metadata: {
          tenantId,
          source: 'checkout'
        }
      });

      res.json({
        success: true,
        data: {
          sessionId: session.id,
          url: session.url
        }
      });
    } catch (error) {
      logger.error('Failed to create checkout session', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to create checkout session'
      });
    }
  }

  /**
   * Create billing portal session
   */
  async createBillingPortalSession(req: Request, res: Response): Promise<void> {
    try {
      const { tenantId } = req.body;
      
      if (!tenantId) {
        res.status(400).json({
          success: false,
          message: 'Missing required field: tenantId'
        });
        return;
      }

      const customer = await this.databaseService.getCustomerByTenantId(tenantId);
      
      if (!customer) {
        res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
        return;
      }

      const session = await this.stripeService.createBillingPortalSession(
        customer.stripeCustomerId,
        `${process.env.FRONTEND_URL}/billing`
      );

      res.json({
        success: true,
        data: {
          url: session.url
        }
      });
    } catch (error) {
      logger.error('Failed to create billing portal session', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to create billing portal session'
      });
    }
  }

  /**
   * Get subscription status
   */
  async getSubscriptionStatus(req: Request, res: Response): Promise<void> {
    try {
      const { tenantId } = req.params;
      
      if (!tenantId) {
        res.status(400).json({
          success: false,
          message: 'Missing tenantId parameter'
        });
        return;
      }

      const customer = await this.databaseService.getCustomerByTenantId(tenantId);
      
      if (!customer) {
        res.json({
          success: true,
          data: {
            status: 'no_subscription',
            customer: null,
            subscriptions: []
          }
        });
        return;
      }

      const subscriptions = await this.stripeService.getCustomerSubscriptions(customer.stripeCustomerId);
      const tenantStatus = await this.databaseService.getTenantStatus(tenantId);

      res.json({
        success: true,
        data: {
          status: tenantStatus || 'pending_activation',
          customer: {
            id: customer.stripeCustomerId,
            email: customer.email,
            name: customer.name
          },
          subscriptions: subscriptions.map(sub => ({
            id: sub.id,
            status: sub.status,
            currentPeriodStart: new Date(sub.current_period_start * 1000),
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
            cancelAtPeriodEnd: sub.cancel_at_period_end,
            priceId: sub.items.data[0]?.price.id,
            amount: sub.items.data[0]?.price.unit_amount,
            currency: sub.items.data[0]?.price.currency,
            interval: sub.items.data[0]?.price.recurring?.interval
          }))
        }
      });
    } catch (error) {
      logger.error('Failed to get subscription status', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to get subscription status'
      });
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(req: Request, res: Response): Promise<void> {
    try {
      const { subscriptionId } = req.params;
      const { cancelAtPeriodEnd = true } = req.body;
      
      if (!subscriptionId) {
        res.status(400).json({
          success: false,
          message: 'Missing subscriptionId parameter'
        });
        return;
      }

      const subscription = await this.stripeService.cancelSubscription(subscriptionId, cancelAtPeriodEnd);

      res.json({
        success: true,
        data: {
          id: subscription.id,
          status: subscription.status,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000)
        }
      });
    } catch (error) {
      logger.error('Failed to cancel subscription', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to cancel subscription'
      });
    }
  }

  /**
   * Reactivate subscription
   */
  async reactivateSubscription(req: Request, res: Response): Promise<void> {
    try {
      const { subscriptionId } = req.params;
      
      if (!subscriptionId) {
        res.status(400).json({
          success: false,
          message: 'Missing subscriptionId parameter'
        });
        return;
      }

      const subscription = await this.stripeService.reactivateSubscription(subscriptionId);

      res.json({
        success: true,
        data: {
          id: subscription.id,
          status: subscription.status,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000)
        }
      });
    } catch (error) {
      logger.error('Failed to reactivate subscription', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to reactivate subscription'
      });
    }
  }

  /**
   * Activate visitor (trial signup)
   */
  async activateVisitor(req: Request, res: Response): Promise<void> {
    try {
      const { email, name, tenantId, activationToken } = req.body;
      
      if (!email || !tenantId || !activationToken) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: email, tenantId, activationToken'
        });
        return;
      }

      // Verify activation token
      const isValidToken = await this.visitorActivationService.verifyActivationToken(
        tenantId,
        activationToken
      );

      if (!isValidToken) {
        res.status(400).json({
          success: false,
          message: 'Invalid or expired activation token'
        });
        return;
      }

      // Create Stripe customer
      const customer = await this.stripeService.createCustomer({
        email,
        name,
        tenantId,
        metadata: {
          source: 'visitor_activation',
          activatedAt: new Date().toISOString()
        }
      });

      // Mark visitor as activated
      await this.visitorActivationService.markVisitorActivated(tenantId, email);

      // Set tenant to trial status
      await this.databaseService.activateTenant(tenantId);

      res.json({
        success: true,
        data: {
          customerId: customer.id,
          tenantId,
          status: 'activated',
          message: 'Visitor activated successfully'
        }
      });
    } catch (error) {
      logger.error('Failed to activate visitor', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to activate visitor'
      });
    }
  }

  /**
   * Send activation email
   */
  async sendActivationEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email, tenantId } = req.body;
      
      if (!email || !tenantId) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: email, tenantId'
        });
        return;
      }

      const activationToken = await this.visitorActivationService.generateActivationToken(tenantId, email);
      await this.visitorActivationService.sendActivationEmail(email, tenantId, activationToken);

      res.json({
        success: true,
        message: 'Activation email sent successfully'
      });
    } catch (error) {
      logger.error('Failed to send activation email', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to send activation email'
      });
    }
  }

  /**
   * Get billing dashboard data
   */
  async getBillingDashboard(req: Request, res: Response): Promise<void> {
    try {
      const { tenantId } = req.params;
      
      if (!tenantId) {
        res.status(400).json({
          success: false,
          message: 'Missing tenantId parameter'
        });
        return;
      }

      const customer = await this.databaseService.getCustomerByTenantId(tenantId);
      const tenantStatus = await this.databaseService.getTenantStatus(tenantId);
      
      let subscriptions: any[] = [];
      let upcomingInvoice = null;
      
      if (customer) {
        subscriptions = await this.stripeService.getCustomerSubscriptions(customer.stripeCustomerId);
        
        // Get upcoming invoice if there's an active subscription
        const activeSubscription = subscriptions.find(sub => sub.status === 'active');
        if (activeSubscription) {
          try {
            // This would require additional Stripe API call
            // upcomingInvoice = await this.stripeService.getUpcomingInvoice(customer.stripeCustomerId);
          } catch (error) {
            logger.warn('Failed to get upcoming invoice', { error });
          }
        }
      }

      const plans = await this.stripeService.getSubscriptionPlans();

      res.json({
        success: true,
        data: {
          tenant: {
            id: tenantId,
            status: tenantStatus || 'pending_activation'
          },
          customer: customer ? {
            id: customer.stripeCustomerId,
            email: customer.email,
            name: customer.name
          } : null,
          subscriptions: subscriptions.map(sub => ({
            id: sub.id,
            status: sub.status,
            currentPeriodStart: new Date(sub.current_period_start * 1000),
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
            cancelAtPeriodEnd: sub.cancel_at_period_end,
            priceId: sub.items.data[0]?.price.id,
            amount: sub.items.data[0]?.price.unit_amount,
            currency: sub.items.data[0]?.price.currency,
            interval: sub.items.data[0]?.price.recurring?.interval
          })),
          upcomingInvoice,
          availablePlans: plans
        }
      });
    } catch (error) {
      logger.error('Failed to get billing dashboard', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to get billing dashboard'
      });
    }
  }
}
