const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('demo'));

// Mock data for demo
const mockPlans = [
  {
    id: 'basic',
    name: 'Basic Plan',
    price: 29,
    currency: 'USD',
    interval: 'month',
    features: [
      'Up to 5 users',
      'Basic reporting',
      'Email support',
      '10GB storage',
      'Standard integrations'
    ],
    popular: false
  },
  {
    id: 'pro',
    name: 'Professional',
    price: 99,
    currency: 'USD',
    interval: 'month',
    features: [
      'Up to 25 users',
      'Advanced analytics',
      'Priority support',
      '100GB storage',
      'Premium integrations',
      'Custom workflows'
    ],
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 299,
    currency: 'USD',
    interval: 'month',
    features: [
      'Unlimited users',
      'Custom reporting',
      '24/7 support',
      'Unlimited storage',
      'All integrations',
      'Custom development',
      'Dedicated account manager'
    ],
    popular: false
  }
];

const mockDashboardData = {
  account: {
    status: 'active',
    tenantId: 'tenant_demo_123',
    customerId: 'cus_demo_customer'
  },
  subscription: {
    id: 'sub_demo_subscription',
    status: 'active',
    planName: 'Professional',
    amount: 99.00,
    currency: 'USD',
    interval: 'month',
    currentPeriodStart: new Date().toISOString(),
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    cancelAtPeriodEnd: false
  },
  customer: {
    email: 'demo@example.com',
    name: 'Demo User'
  }
};

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'Saudi Store Billing Service',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/billing/plans', (req, res) => {
  res.json({
    success: true,
    data: mockPlans
  });
});

app.get('/api/billing/dashboard/:tenantId', (req, res) => {
  const { tenantId } = req.params;
  res.json({
    success: true,
    data: {
      ...mockDashboardData,
      account: {
        ...mockDashboardData.account,
        tenantId
      }
    }
  });
});

app.post('/api/billing/checkout', (req, res) => {
  const { planId, tenantId } = req.body;
  const plan = mockPlans.find(p => p.id === planId);
  
  if (!plan) {
    return res.status(404).json({
      success: false,
      message: 'Plan not found'
    });
  }

  // In real implementation, this would create a Stripe checkout session
  res.json({
    success: true,
    data: {
      checkoutUrl: `https://checkout.stripe.com/demo?plan=${planId}&tenant=${tenantId}`,
      sessionId: 'cs_demo_session_' + Date.now()
    }
  });
});

app.post('/api/billing/portal', (req, res) => {
  const { tenantId } = req.body;
  
  // In real implementation, this would create a Stripe billing portal session
  res.json({
    success: true,
    data: {
      portalUrl: `https://billing.stripe.com/demo?tenant=${tenantId}`,
      sessionId: 'bps_demo_session_' + Date.now()
    }
  });
});

app.post('/api/billing/send-activation', (req, res) => {
  const { email, tenantId } = req.body;
  
  if (!email || !tenantId) {
    return res.status(400).json({
      success: false,
      message: 'Email and tenantId are required'
    });
  }

  // In real implementation, this would send an actual email
  res.json({
    success: true,
    data: {
      message: 'Activation email sent successfully',
      email,
      tenantId,
      activationToken: 'demo_token_' + Date.now()
    }
  });
});

app.post('/api/billing/activate', (req, res) => {
  const { email, name, tenantId, activationToken } = req.body;
  
  if (!email || !tenantId || !activationToken) {
    return res.status(400).json({
      success: false,
      message: 'Email, tenantId, and activationToken are required'
    });
  }

  // In real implementation, this would validate the token and activate the account
  res.json({
    success: true,
    data: {
      message: 'Account activated successfully',
      tenantId,
      status: 'active',
      user: {
        email,
        name: name || 'Demo User'
      }
    }
  });
});

// Webhook endpoint (demo)
app.post('/webhooks/stripe', (req, res) => {
  // In real implementation, this would handle Stripe webhooks
  res.json({
    success: true,
    message: 'Webhook received (demo mode)'
  });
});

// Serve demo page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'demo', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Saudi Store Billing Service running on port ${PORT}`);
  console.log(`📊 Demo available at: http://localhost:${PORT}`);
  console.log(`🔗 API Health check: http://localhost:${PORT}/api/health`);
  console.log(`💳 Billing API: http://localhost:${PORT}/api/billing/plans`);
  console.log('');
  console.log('✅ Service Status:');
  console.log('   - Backend API: Running');
  console.log('   - Demo UI: Available');
  console.log('   - Mock Data: Loaded');
  console.log('   - Stripe Integration: Demo Mode');
  console.log('');
  console.log('🎉 Ready for testing!');
});
