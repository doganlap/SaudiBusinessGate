# 🔐 Authentication & Payment Setup Guide

## **المتجر السعودي - Saudi Store Platform**

### **Microsoft Authentication + Stripe Payment + ZATCA Integration**

---

## **📋 نظرة عامة - Overview**

تم إضافة نظام مصادقة Microsoft مع دفع Stripe وتكامل ZATCA للمنصة. هذا الدليل يوضح كيفية الإعداد والتشغيل.

This guide covers the setup of Microsoft Authentication, Stripe Payment, and ZATCA integration for the Saudi Store platform.

---

## **🔧 المتطلبات - Requirements**

### **1. Microsoft Azure App Registration**

- Azure Active Directory tenant
- App registration with redirect URIs
- Client ID and Client Secret
- User.Read permissions

### **2. Stripe Account**

- Stripe account (test/live)
- API keys (publishable and secret)
- Webhook endpoint configured

### **3. ZATCA Registration**

- Saudi VAT registration number
- Commercial registration number
- ZATCA portal access (sandbox/production)

---

## **🚀 الإعداد السريع - Quick Setup**

### **1. Environment Variables**

```bash
# Copy and configure environment variables
cp .env.example .env

# Required variables:
NEXT_PUBLIC_MICROSOFT_CLIENT_ID=your_microsoft_client_id
NEXT_PUBLIC_MICROSOFT_TENANT_ID=your_tenant_id_or_common
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret

STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

ZATCA_ENVIRONMENT=sandbox
ZATCA_VAT_NUMBER=123456789012345
ZATCA_CR_NUMBER=1234567890
```

### **2. Install Dependencies**

```bash
npm install @azure/msal-browser @azure/msal-node stripe
```

### **3. Start Application**

```bash
npm run dev
```

---

## **🔐 Microsoft Authentication Setup**

### **Step 1: Azure App Registration**

1. **Go to Azure Portal:**
   - Navigate to Azure Active Directory
   - Select "App registrations"
   - Click "New registration"

2. **Configure Application:**

   ```
   Name: Saudi Store Platform
   Supported account types: Accounts in any organizational directory
   Redirect URI: http://localhost:3050/auth/callback
   ```

3. **Get Credentials:**
   - Copy Application (client) ID
   - Copy Directory (tenant) ID
   - Create client secret in "Certificates & secrets"

4. **Configure API Permissions:**
   - Add Microsoft Graph permissions:
     - User.Read (delegated)
     - profile (delegated)
     - email (delegated)
     - openid (delegated)

### **Step 2: Application Configuration**

Update `.env` file:

```bash
NEXT_PUBLIC_MICROSOFT_CLIENT_ID=12345678-1234-1234-1234-123456789012
NEXT_PUBLIC_MICROSOFT_TENANT_ID=common  # or your specific tenant ID
MICROSOFT_CLIENT_SECRET=your_client_secret_here
```

### **Step 3: Test Authentication**

1. Navigate to `/ar/login`
2. Click "تسجيل الدخول بـ Microsoft"
3. Complete Microsoft authentication flow
4. Verify user data is synced to database

---

## **💳 Stripe Payment Setup**

### **Step 1: Stripe Account Setup**

1. **Create Stripe Account:**
   - Sign up at <https://stripe.com>
   - Complete account verification
   - Enable test mode for development

2. **Get API Keys:**
   - Go to Developers > API keys
   - Copy Publishable key (pk_test_...)
   - Copy Secret key (sk_test_...)

3. **Configure Webhooks:**
   - Go to Developers > Webhooks
   - Add endpoint: `http://localhost:3050/api/webhooks/stripe`
   - Select events:
     - customer.subscription.created
     - customer.subscription.updated
     - customer.subscription.deleted
     - invoice.payment_succeeded
     - invoice.payment_failed

### **Step 2: Subscription Plans Configuration**

The platform includes 3 pre-configured plans:

```typescript
// Basic Plan - 299 SAR/month
{
  id: 'basic',
  name: 'Basic Plan',
  nameAr: 'الخطة الأساسية',
  price: 299,
  currency: 'SAR',
  features: ['Up to 10 users', 'Basic red flags', '5 AI agents']
}

// Professional Plan - 599 SAR/month  
{
  id: 'professional',
  name: 'Professional Plan',
  nameAr: 'الخطة الاحترافية',
  price: 599,
  currency: 'SAR',
  features: ['Up to 50 users', 'Advanced features', '15 AI agents']
}

// Enterprise Plan - 1299 SAR/month
{
  id: 'enterprise',
  name: 'Enterprise Plan', 
  nameAr: 'خطة المؤسسات',
  price: 1299,
  currency: 'SAR',
  features: ['Unlimited users', 'Full features', 'Unlimited AI agents']
}
```

### **Step 3: Test Payments**

1. Navigate to `/ar/billing`
2. Select a subscription plan
3. Use Stripe test card: `4242 4242 4242 4242`
4. Complete checkout flow
5. Verify subscription in Stripe dashboard

---

## **🏛️ ZATCA Integration Setup**

### **Step 1: ZATCA Registration**

1. **Register with ZATCA:**
   - Complete VAT registration in Saudi Arabia
   - Obtain 15-digit VAT number
   - Get commercial registration number

2. **ZATCA Portal Access:**
   - Register for ZATCA e-invoicing portal
   - Get sandbox/production credentials
   - Configure API access

### **Step 2: Configuration**

Update `.env` file:

```bash
ZATCA_ENVIRONMENT=sandbox  # or production
ZATCA_VAT_NUMBER=123456789012345  # Your 15-digit VAT number
ZATCA_CR_NUMBER=1234567890  # Your CR number
ZATCA_API_ENDPOINT=https://gw-fatoora.zatca.gov.sa
ZATCA_USERNAME=your_zatca_username
ZATCA_PASSWORD=your_zatca_password
```

### **Step 3: Invoice Generation**

```typescript
// Create ZATCA compliant invoice
const invoice = await zatcaService.createInvoice({
  invoiceNumber: 'INV-001',
  issueDate: new Date().toISOString(),
  buyer: {
    name: 'Customer Name',
    nameAr: 'اسم العميل'
  },
  lines: [{
    description: 'Professional Subscription',
    descriptionAr: 'اشتراك احترافي',
    quantity: 1,
    unitPrice: 599,
    vatRate: 15
  }]
});

// Submit to ZATCA
const result = await zatcaService.submitInvoice(invoice);
```

---

## **🔄 Authentication Flow**

### **User Login Process:**

1. **User clicks "Sign in with Microsoft"**
2. **Redirect to Microsoft login**
3. **User authenticates with Microsoft**
4. **Microsoft returns user profile**
5. **System syncs user with database:**
   - Check if user exists by Microsoft ID or email
   - Create new user or update existing
   - Assign role based on email domain/job title
   - Set tenant based on email domain
6. **User redirected to dashboard**

### **Role Assignment Logic:**

```typescript
// Super Admin
const superAdminEmails = ['admin@saudistore.com', 'superadmin@saudistore.com'];

// Admin by job title
const adminTitles = ['مدير', 'manager', 'director', 'مدير عام', 'ceo', 'cto', 'cfo'];

// Manager by job title  
const managerTitles = ['مشرف', 'supervisor', 'lead', 'رئيس قسم', 'team lead'];

// Default: user role
```

### **Tenant Assignment:**

```typescript
// Domain to tenant mapping
const domainTenantMap = {
  'saudistore.com': 'saudi-store-main',
  'company.com': 'company-tenant',
  'organization.org': 'org-tenant'
};
```

---

## **💰 Payment Flow**

### **Subscription Process:**

1. **User selects plan on billing page**
2. **System creates Stripe customer**
3. **Redirect to Stripe Checkout**
4. **User completes payment**
5. **Stripe webhook updates subscription status**
6. **User gains access to plan features**

### **Invoice Generation:**

1. **Payment successful webhook received**
2. **System generates ZATCA invoice**
3. **Invoice submitted to ZATCA**
4. **QR code generated for invoice**
5. **Invoice stored in database**

---

## **🧪 Testing**

### **Authentication Testing:**

```bash
# Test Microsoft login
curl -X POST http://localhost:3050/api/auth/sync-user \
  -H "Content-Type: application/json" \
  -d '{
    "microsoftId": "test-user-123",
    "email": "test@saudistore.com", 
    "name": "Test User"
  }'
```

### **Payment Testing:**

```bash
# Get subscription plans
curl http://localhost:3050/api/payment?action=plans

# Create payment intent
curl -X POST http://localhost:3050/api/payment \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create-payment-intent",
    "amount": 599,
    "currency": "SAR"
  }'
```

### **ZATCA Testing:**

```bash
# Create ZATCA invoice
curl -X POST http://localhost:3050/api/payment \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create-zatca-invoice",
    "invoiceData": {
      "invoiceNumber": "INV-TEST-001",
      "buyer": {"name": "Test Customer"},
      "lines": [{
        "description": "Test Service",
        "quantity": 1,
        "unitPrice": 100,
        "vatRate": 15
      }]
    }
  }'
```

---

## **🔒 Security Considerations**

### **Environment Variables:**

- Never commit `.env` files to version control
- Use different keys for development/production
- Rotate secrets regularly

### **Microsoft Authentication:**

- Use HTTPS in production
- Validate JWT tokens properly
- Implement proper session management

### **Stripe Integration:**

- Verify webhook signatures
- Use idempotency keys
- Handle failed payments gracefully

### **ZATCA Compliance:**

- Validate all invoice data
- Store invoices securely
- Implement proper audit trails

---

## **📊 Monitoring & Analytics**

### **Authentication Metrics:**

- Login success/failure rates
- User role distribution
- Tenant activity

### **Payment Metrics:**

- Subscription conversion rates
- Payment success/failure rates
- Revenue by plan

### **ZATCA Compliance:**

- Invoice submission rates
- Approval/rejection rates
- Compliance percentage

---

## **🚨 Troubleshooting**

### **Common Issues:**

#### **Microsoft Authentication:**

```bash
# Error: Invalid redirect URI
# Solution: Add correct redirect URI in Azure app registration

# Error: Insufficient permissions
# Solution: Grant admin consent for required permissions
```

#### **Stripe Payments:**

```bash
# Error: Invalid API key
# Solution: Check STRIPE_SECRET_KEY in .env

# Error: Webhook signature verification failed
# Solution: Verify STRIPE_WEBHOOK_SECRET matches Stripe dashboard
```

#### **ZATCA Integration:**

```bash
# Error: Invalid VAT number format
# Solution: Ensure VAT number is exactly 15 digits

# Error: Invoice validation failed
# Solution: Check all required fields are present
```

---

## **🎯 Next Steps**

### **Production Deployment:**

1. **Configure production environment variables**
2. **Set up production Stripe account**
3. **Switch ZATCA to production environment**
4. **Configure proper SSL certificates**
5. **Set up monitoring and logging**

### **Additional Features:**

1. **Multi-factor authentication**
2. **Advanced payment methods**
3. **Automated invoice generation**
4. **Compliance reporting**
5. **Advanced user management**

---

## **📞 Support**

### **Technical Support:**

- Email: <support@saudistore.com>
- Documentation: Internal wiki
- Emergency: On-call rotation

### **Business Support:**

- Billing issues: <billing@saudistore.com>
- Compliance: <compliance@saudistore.com>
- Sales: <sales@saudistore.com>

---

**🎉 المتجر السعودي - Saudi Store**
**منصة إدارة الأعمال الذكية مع Microsoft Authentication + Stripe Payment + ZATCA**

**✅ جاهز للإنتاج مع نظام مصادقة ودفع متكامل!**
