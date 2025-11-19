# Saudi Store Billing Service

A comprehensive billing and payment service with Stripe integration, visitor activation workflow, and subscription management for the Saudi Store platform.

## Features

### 🔥 Core Functionality

- **Stripe Integration**: Complete payment processing with Stripe
- **Subscription Management**: Handle recurring billing and subscription lifecycle
- **Visitor Activation**: Email-based activation workflow for new users
- **Webhook Processing**: Real-time event handling from Stripe
- **Multi-tenant Support**: Tenant isolation and management
- **Database Integration**: PostgreSQL with proper schema management

### 💳 Payment Features

- Subscription checkout sessions
- Billing portal access
- Payment method management
- Invoice handling
- Trial period support
- Proration and upgrades/downgrades

### 👥 Visitor Management

- Email activation tokens
- Secure JWT-based verification
- Automated email notifications
- Activation tracking and analytics

### 🔧 Technical Features

- TypeScript with strict type checking
- Express.js REST API
- Comprehensive error handling
- Structured logging with Winston
- Docker containerization
- Health checks and monitoring

## API Endpoints

### Subscription Plans

- `GET /api/billing/plans` - Get available subscription plans

### Checkout & Payment

- `POST /api/billing/checkout` - Create Stripe checkout session
- `POST /api/billing/portal` - Create billing portal session

### Subscription Management

- `GET /api/billing/subscription/:tenantId` - Get subscription status
- `POST /api/billing/subscription/:subscriptionId/cancel` - Cancel subscription
- `POST /api/billing/subscription/:subscriptionId/reactivate` - Reactivate subscription

### Visitor Activation

- `POST /api/billing/activate` - Activate visitor with token
- `POST /api/billing/send-activation` - Send activation email

### Dashboard

- `GET /api/billing/dashboard/:tenantId` - Get billing dashboard data

### Webhooks

- `POST /webhooks/stripe` - Stripe webhook endpoint

## Environment Variables

```bash
# Server Configuration
NODE_ENV=development
PORT=3001
LOG_LEVEL=info

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/doganhub_billing

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Stripe Price IDs
STRIPE_PRICE_ID_BASIC=price_basic_plan_id
STRIPE_PRICE_ID_PRO=price_pro_plan_id
STRIPE_PRICE_ID_ENTERPRISE=price_enterprise_plan_id

# JWT & Email
JWT_SECRET=your_jwt_secret_key_for_activation_tokens
SMTP_HOST=smtp.gmail.com
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

## Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Database Setup

The service will automatically create the required database tables on startup:

- `billing_customers` - Customer information
- `billing_subscriptions` - Subscription data
- `tenants` - Tenant status and metadata
- `billing_events` - Audit trail for billing events
- `activation_tokens` - Email activation tokens
- `visitor_activations` - Visitor activation tracking

### 4. Stripe Configuration

#### Create Stripe Account

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Create account or sign in
3. Start in TEST mode for development

#### Get API Keys

1. Navigate to: Developers > API keys
2. Copy your Publishable key (`pk_test_...`)
3. Copy your Secret key (`sk_test_...`)

#### Create Products & Prices

1. Go to: Products in Stripe Dashboard
2. Create subscription products:
   - Basic Plan ($29/month)
   - Professional Plan ($99/month)
   - Enterprise Plan ($299/month)
3. Copy the Price IDs for each plan

#### Setup Webhooks

1. Go to: Developers > Webhooks
2. Add endpoint: `https://yourdomain.com/webhooks/stripe`
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `customer.subscription.trial_will_end`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `checkout.session.completed`
4. Copy the webhook signing secret

## Development

### Start Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
npm start
```

### Run Tests

```bash
npm test
```

### Docker Development

```bash
# Build image
docker build -t doganhub-billing .

# Run container
docker run -p 3001:3001 --env-file .env doganhub-billing
```

## Database Schema

### billing_customers

- Customer information linked to Stripe
- Tenant association
- Email and contact details

### billing_subscriptions

- Subscription lifecycle tracking
- Stripe subscription mapping
- Billing period management

### tenants

- Tenant status (active/suspended/pending)
- Subscription tier tracking

### activation_tokens

- JWT-based activation tokens
- Expiration and usage tracking

### visitor_activations

- Activation audit trail
- Source tracking

## Webhook Events

The service handles the following Stripe webhook events:

- **subscription.created** - Activates tenant, creates subscription record
- **subscription.updated** - Updates subscription status, handles plan changes
- **subscription.deleted** - Suspends tenant, marks subscription as cancelled
- **invoice.payment_succeeded** - Confirms successful payment
- **invoice.payment_failed** - Handles failed payments, sends notifications
- **checkout.session.completed** - Processes successful checkout

## Error Handling

- Comprehensive error logging with Winston
- Structured error responses
- Webhook event retry handling
- Database transaction rollbacks
- Graceful service shutdown

## Security

- JWT-based activation tokens
- Stripe webhook signature verification
- Input validation and sanitization
- SQL injection prevention
- CORS configuration
- Helmet security headers

## Monitoring

- Health check endpoint (`/health`)
- Structured logging
- Database connection monitoring
- Webhook event tracking
- Performance metrics

## Production Deployment

### Environment Setup

1. Set `NODE_ENV=production`
2. Configure production database
3. Set up SMTP for email delivery
4. Configure proper CORS origins
5. Set secure JWT secrets

### Stripe Live Mode

1. Switch to Live mode in Stripe Dashboard
2. Update API keys to live keys (`pk_live_...`, `sk_live_...`)
3. Update webhook endpoint to production URL
4. Test with small amounts first

### Monitoring

- Set up log aggregation
- Configure alerts for failed payments
- Monitor webhook delivery
- Track subscription metrics

## Integration

### Frontend Integration

```javascript
// Create checkout session
const response = await fetch('/api/billing/checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    priceId: 'price_pro_plan',
    tenantId: 'tenant_123',
    customerEmail: 'user@example.com'
  })
});

const { sessionId, url } = await response.json();
// Redirect to Stripe Checkout
window.location.href = url;
```

### Visitor Activation

```javascript
// Send activation email
await fetch('/api/billing/send-activation', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'newuser@example.com',
    tenantId: 'tenant_123'
  })
});

// Activate visitor
await fetch('/api/billing/activate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'newuser@example.com',
    tenantId: 'tenant_123',
    activationToken: 'jwt_token_from_email'
  })
});
```

## Support

For issues and questions:

1. Check the logs for detailed error information
2. Verify Stripe webhook delivery in Stripe Dashboard
3. Ensure database connectivity
4. Validate environment configuration

## License

MIT License - see LICENSE file for details.
