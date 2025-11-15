import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { BillingController } from '@/controllers/billing.controller';
import { WebhookController } from '@/controllers/webhook.controller';
import { DatabaseService } from '@/services/database.service';
import { logger } from '@/utils/logger';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Initialize services
const billingController = new BillingController();
const webhookController = new WebhookController();
const databaseService = new DatabaseService();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

// Webhook endpoint (must be before express.json() middleware)
app.post('/webhooks/stripe', 
  express.raw({ type: 'application/json' }), 
  webhookController.handleStripeWebhook.bind(webhookController)
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'billing-service',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API Routes

// Subscription Plans
app.get('/api/billing/plans', billingController.getSubscriptionPlans.bind(billingController));

// Checkout & Payment
app.post('/api/billing/checkout', billingController.createCheckoutSession.bind(billingController));
app.post('/api/billing/portal', billingController.createBillingPortalSession.bind(billingController));

// Subscription Management
app.get('/api/billing/subscription/:tenantId', billingController.getSubscriptionStatus.bind(billingController));
app.post('/api/billing/subscription/:subscriptionId/cancel', billingController.cancelSubscription.bind(billingController));
app.post('/api/billing/subscription/:subscriptionId/reactivate', billingController.reactivateSubscription.bind(billingController));

// Visitor Activation
app.post('/api/billing/activate', billingController.activateVisitor.bind(billingController));
app.post('/api/billing/send-activation', billingController.sendActivationEmail.bind(billingController));

// Billing Dashboard
app.get('/api/billing/dashboard/:tenantId', billingController.getBillingDashboard.bind(billingController));

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', { 
    error: err.message, 
    stack: err.stack,
    url: req.url,
    method: req.method
  });

  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Initialize database and start server
async function startServer() {
  try {
    // Initialize database tables
    await databaseService.initializeTables();
    logger.info('Database initialized successfully');

    // Start server
    app.listen(port, () => {
      logger.info(`Billing service started on port ${port}`, {
        port,
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
      });
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await databaseService.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await databaseService.close();
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection', { reason, promise });
  process.exit(1);
});

// Start the server
startServer();
