const { default: fetch } = require('node-fetch');

const BASE_URL = 'http://localhost:3001';

async function testAPI() {
  console.log('🧪 Testing Saudi Store Billing API Endpoints\n');

  // Test 1: Health Check
  try {
    console.log('1️⃣ Testing Health Check...');
    const response = await fetch(`${BASE_URL}/api/health`);
    const data = await response.json();
    console.log('✅ Health Check:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.log('❌ Health Check failed:', error.message);
  }

  // Test 2: Get Plans
  try {
    console.log('\n2️⃣ Testing Get Plans...');
    const response = await fetch(`${BASE_URL}/api/billing/plans`);
    const data = await response.json();
    console.log('✅ Plans:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.log('❌ Get Plans failed:', error.message);
  }

  // Test 3: Get Dashboard
  try {
    console.log('\n3️⃣ Testing Get Dashboard...');
    const response = await fetch(`${BASE_URL}/api/billing/dashboard/tenant_123`);
    const data = await response.json();
    console.log('✅ Dashboard:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.log('❌ Get Dashboard failed:', error.message);
  }

  // Test 4: Create Checkout
  try {
    console.log('\n4️⃣ Testing Create Checkout...');
    const response = await fetch(`${BASE_URL}/api/billing/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        planId: 'pro',
        tenantId: 'tenant_123'
      })
    });
    const data = await response.json();
    console.log('✅ Checkout:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.log('❌ Create Checkout failed:', error.message);
  }

  // Test 5: Create Billing Portal
  try {
    console.log('\n5️⃣ Testing Billing Portal...');
    const response = await fetch(`${BASE_URL}/api/billing/portal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tenantId: 'tenant_123'
      })
    });
    const data = await response.json();
    console.log('✅ Billing Portal:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.log('❌ Billing Portal failed:', error.message);
  }

  // Test 6: Send Activation Email
  try {
    console.log('\n6️⃣ Testing Send Activation...');
    const response = await fetch(`${BASE_URL}/api/billing/send-activation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        tenantId: 'tenant_123'
      })
    });
    const data = await response.json();
    console.log('✅ Send Activation:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.log('❌ Send Activation failed:', error.message);
  }

  // Test 7: Activate Account
  try {
    console.log('\n7️⃣ Testing Account Activation...');
    const response = await fetch(`${BASE_URL}/api/billing/activate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        name: 'Test User',
        tenantId: 'tenant_123',
        activationToken: 'demo_token_123'
      })
    });
    const data = await response.json();
    console.log('✅ Account Activation:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.log('❌ Account Activation failed:', error.message);
  }

  console.log('\n🎉 API Testing Complete!');
}

// Run tests
testAPI().catch(console.error);
