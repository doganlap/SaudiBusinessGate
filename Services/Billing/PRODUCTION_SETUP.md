# 🚀 Production Stripe Configuration Guide

This guide will help you configure real Stripe keys and deploy the billing service to production.

## 📋 Prerequisites

- [ ] Stripe account created
- [ ] Products and prices configured in Stripe Dashboard
- [ ] PostgreSQL database ready
- [ ] Domain/subdomain for webhooks
- [ ] SSL certificate configured

## 🔑 Step 1: Stripe Account Setup

### 1.1 Create Stripe Account
1. Go to [https://stripe.com](https://stripe.com)
2. Sign up for a new account
3. Complete business verification
4. Enable live mode

### 1.2 Get API Keys
1. Go to **Developers > API keys** in Stripe Dashboard
2. Copy your **Publishable key** (starts with `pk_live_`)
3. Copy your **Secret key** (starts with `sk_live_`)

### 1.3 Create Products and Prices
```bash
# Using Stripe CLI (recommended)
stripe products create --name="Basic Plan" --description="Up to 5 users with basic features"
stripe prices create --product=prod_xxx --unit-amount=2900 --currency=usd --recurring[interval]=month

stripe products create --name="Professional Plan" --description="Up to 25 users with advanced features"
stripe prices create --product=prod_xxx --unit-amount=9900 --currency=usd --recurring[interval]=month

stripe products create --name="Enterprise Plan" --description="Unlimited users with all features"
stripe prices create --product=prod_xxx --unit-amount=29900 --currency=usd --recurring[interval]=month
```

## 🔧 Step 2: Environment Configuration

### 2.1 Update Production .env
```bash
# Server Configuration
PORT=3001
NODE_ENV=production

# Database Configuration (Production)
DATABASE_URL=postgresql://username:password@your-db-host:5432/doganhub_billing
POSTGRES_HOST=your-db-host.com
POSTGRES_PORT=5432
POSTGRES_DB=doganhub_billing
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=your_secure_password

# Stripe Configuration (LIVE KEYS)
STRIPE_SECRET_KEY=sk_live_your_actual_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_actual_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Stripe Price IDs (from Step 1.3)
STRIPE_PRICE_ID_BASIC=price_your_basic_price_id
STRIPE_PRICE_ID_PRO=price_your_pro_price_id
STRIPE_PRICE_ID_ENTERPRISE=price_your_enterprise_price_id

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_minimum_32_characters

# Email Configuration (Production SMTP)
SMTP_HOST=smtp.your-email-provider.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=your_smtp_username
SMTP_PASSWORD=your_smtp_password
FROM_EMAIL=noreply@yourdomain.com

# Frontend Configuration
FRONTEND_URL=https://yourdomain.com

# Logging
LOG_LEVEL=info
```

### 2.2 Secure Environment Variables
```bash
# Using Azure Key Vault (recommended)
az keyvault secret set --vault-name "your-keyvault" --name "stripe-secret-key" --value "sk_live_..."
az keyvault secret set --vault-name "your-keyvault" --name "stripe-webhook-secret" --value "whsec_..."
az keyvault secret set --vault-name "your-keyvault" --name "database-url" --value "postgresql://..."

# Using AWS Secrets Manager
aws secretsmanager create-secret --name "doganhub/billing/stripe-secret" --secret-string "sk_live_..."
aws secretsmanager create-secret --name "doganhub/billing/webhook-secret" --secret-string "whsec_..."
```

## 🌐 Step 3: Webhook Configuration

### 3.1 Create Webhook Endpoint
1. Go to **Developers > Webhooks** in Stripe Dashboard
2. Click **Add endpoint**
3. Set URL: `https://yourdomain.com/webhooks/stripe`
4. Select events to listen for:
   ```
   ✅ customer.created
   ✅ customer.updated
   ✅ customer.deleted
   ✅ customer.subscription.created
   ✅ customer.subscription.updated
   ✅ customer.subscription.deleted
   ✅ invoice.payment_succeeded
   ✅ invoice.payment_failed
   ✅ checkout.session.completed
   ```

### 3.2 Get Webhook Secret
1. Click on your webhook endpoint
2. Copy the **Signing secret** (starts with `whsec_`)
3. Add to your environment variables

### 3.3 Test Webhook
```bash
# Using Stripe CLI
stripe listen --forward-to localhost:3001/webhooks/stripe
stripe trigger customer.created
```

## 🗄️ Step 4: Database Setup

### 4.1 Create Production Database
```sql
-- Create database
CREATE DATABASE doganhub_billing;

-- Create user
CREATE USER billing_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE doganhub_billing TO billing_user;

-- Switch to database
\c doganhub_billing;

-- Create tables (run the migration scripts)
```

### 4.2 Run Migrations
```bash
cd Services/Billing
npm run migrate:prod
```

### 4.3 Database Schema
```sql
-- Billing customers table
CREATE TABLE billing_customers (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(255) UNIQUE NOT NULL,
    stripe_customer_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Billing subscriptions table
CREATE TABLE billing_subscriptions (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    stripe_subscription_id VARCHAR(255) UNIQUE NOT NULL,
    stripe_customer_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES billing_customers(tenant_id)
);

-- Tenants table
CREATE TABLE tenants (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'inactive',
    activated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activation tokens table
CREATE TABLE activation_tokens (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Visitor activations table
CREATE TABLE visitor_activations (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    activation_token VARCHAR(500),
    activated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Billing events table (audit log)
CREATE TABLE billing_events (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(255),
    event_type VARCHAR(100) NOT NULL,
    stripe_event_id VARCHAR(255),
    data JSONB,
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_billing_customers_tenant_id ON billing_customers(tenant_id);
CREATE INDEX idx_billing_customers_stripe_id ON billing_customers(stripe_customer_id);
CREATE INDEX idx_billing_subscriptions_tenant_id ON billing_subscriptions(tenant_id);
CREATE INDEX idx_billing_subscriptions_stripe_id ON billing_subscriptions(stripe_subscription_id);
CREATE INDEX idx_tenants_tenant_id ON tenants(tenant_id);
CREATE INDEX idx_activation_tokens_tenant_id ON activation_tokens(tenant_id);
CREATE INDEX idx_activation_tokens_token ON activation_tokens(token);
CREATE INDEX idx_billing_events_tenant_id ON billing_events(tenant_id);
CREATE INDEX idx_billing_events_type ON billing_events(event_type);
```

## 🚀 Step 5: Deployment

### 5.1 Docker Production Build
```dockerfile
# Dockerfile.production
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

# Start application
CMD ["npm", "start"]
```

### 5.2 Build and Deploy
```bash
# Build production image
docker build -f Dockerfile.production -t doganhub-billing:latest .

# Run with production environment
docker run -d \
  --name doganhub-billing \
  --env-file .env.production \
  -p 3001:3001 \
  doganhub-billing:latest
```

### 5.3 Kubernetes Deployment
```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: doganhub-billing
spec:
  replicas: 3
  selector:
    matchLabels:
      app: doganhub-billing
  template:
    metadata:
      labels:
        app: doganhub-billing
    spec:
      containers:
      - name: billing-service
        image: doganhub-billing:latest
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "production"
        - name: STRIPE_SECRET_KEY
          valueFrom:
            secretKeyRef:
              name: stripe-secrets
              key: secret-key
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: doganhub-billing-service
spec:
  selector:
    app: doganhub-billing
  ports:
  - port: 80
    targetPort: 3001
  type: LoadBalancer
```

## 🔒 Step 6: Security Checklist

### 6.1 Environment Security
- [ ] All secrets stored in secure vault (Azure Key Vault, AWS Secrets Manager)
- [ ] No hardcoded credentials in code
- [ ] Environment variables validated on startup
- [ ] Database connections use SSL
- [ ] JWT secrets are cryptographically secure (32+ characters)

### 6.2 API Security
- [ ] HTTPS enforced for all endpoints
- [ ] CORS configured for specific domains
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] Webhook signature verification enabled
- [ ] SQL injection protection (parameterized queries)

### 6.3 Monitoring & Logging
- [ ] Application logs configured
- [ ] Error tracking (Sentry, Bugsnag)
- [ ] Performance monitoring (New Relic, DataDog)
- [ ] Webhook event logging
- [ ] Failed payment notifications
- [ ] Security event alerts

## 🧪 Step 7: Testing Production Setup

### 7.1 Test API Endpoints
```bash
# Health check
curl https://yourdomain.com/api/health

# Get plans
curl https://yourdomain.com/api/billing/plans

# Test webhook (use Stripe CLI)
stripe listen --forward-to https://yourdomain.com/webhooks/stripe
stripe trigger checkout.session.completed
```

### 7.2 Test Payment Flow
1. Create test checkout session
2. Complete payment with test card: `4242 4242 4242 4242`
3. Verify webhook received
4. Check database for subscription record
5. Test billing portal access

### 7.3 Load Testing
```bash
# Using Apache Bench
ab -n 1000 -c 10 https://yourdomain.com/api/billing/plans

# Using Artillery
artillery run load-test.yml
```

## 📊 Step 8: Monitoring & Maintenance

### 8.1 Key Metrics to Monitor
- API response times
- Database connection pool usage
- Webhook processing success rate
- Failed payment rates
- Customer churn metrics
- Revenue metrics

### 8.2 Alerts to Set Up
- Service downtime
- Database connection failures
- Webhook processing failures
- High error rates
- Failed payments
- Security events

### 8.3 Regular Maintenance
- [ ] Update dependencies monthly
- [ ] Review security logs weekly
- [ ] Monitor Stripe dashboard daily
- [ ] Backup database daily
- [ ] Test disaster recovery quarterly

## 🆘 Troubleshooting

### Common Issues
1. **Webhook not receiving events**
   - Check webhook URL is accessible
   - Verify SSL certificate
   - Check Stripe webhook logs

2. **Database connection issues**
   - Verify connection string
   - Check firewall rules
   - Monitor connection pool

3. **Payment failures**
   - Check Stripe logs
   - Verify API keys
   - Review webhook events

### Support Resources
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)
- [DoganHub Billing Service Logs](./logs/)

## ✅ Production Checklist

- [ ] Stripe account verified and live mode enabled
- [ ] All API keys configured and tested
- [ ] Products and prices created in Stripe
- [ ] Webhook endpoint configured and tested
- [ ] Database setup and migrations run
- [ ] Environment variables secured
- [ ] Application deployed and health check passing
- [ ] SSL certificate configured
- [ ] Monitoring and alerts configured
- [ ] Load testing completed
- [ ] Documentation updated
- [ ] Team trained on production procedures

---

🎉 **Congratulations!** Your billing service is now ready for production use with real Stripe integration!
