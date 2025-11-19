#!/usr/bin/env node
/**
 * Test API Endpoints
 * Tests key API endpoints to verify the application is running
 */

const BASE_URL = 'http://localhost:3050';

const endpoints = [
  { path: '/api/health', method: 'GET', name: 'Health Check', public: true },
  { path: '/api/crm/customers', method: 'GET', name: 'CRM Customers' },
  { path: '/api/procurement/vendors', method: 'GET', name: 'Procurement Vendors' },
  { path: '/api/procurement/inventory', method: 'GET', name: 'Procurement Inventory' },
  { path: '/api/hr/employees', method: 'GET', name: 'HR Employees' },
  { path: '/api/grc/controls', method: 'GET', name: 'GRC Controls' },
  { path: '/api/sales/pipeline', method: 'GET', name: 'Sales Pipeline' },
];

async function testEndpoint(endpoint) {
  try {
    const url = `${BASE_URL}${endpoint.path}`;
    const response = await fetch(url, {
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const status = response.status;
    let statusText = '✅';
    if (status === 0) statusText = '❌';
    else if (status >= 500) statusText = '❌';
    else if (status >= 400) statusText = '⚠️';
    
    let data = null;
    try {
      const text = await response.text();
      if (text) {
        try {
          data = JSON.parse(text);
        } catch (e) {
          data = { raw: text.substring(0, 200) };
        }
      }
    } catch (e) {
      data = { error: 'Could not parse response' };
    }

    // Format data for display
    let dataDisplay = 'No response';
    if (data) {
      if (data.error) {
        dataDisplay = `Error: ${data.error}`;
      } else if (data.status) {
        dataDisplay = `Status: ${data.status}`;
      } else if (Array.isArray(data)) {
        dataDisplay = `${data.length} items`;
      } else if (typeof data === 'object') {
        dataDisplay = JSON.stringify(data).substring(0, 150);
      } else {
        dataDisplay = String(data).substring(0, 150);
      }
    }

    return {
      name: endpoint.name,
      status,
      statusText,
      data: dataDisplay,
      success: status === 200 || (status === 401 && !endpoint.public), // 401 is OK for protected endpoints
    };
  } catch (error) {
    return {
      name: endpoint.name,
      status: 0,
      statusText: '❌',
      data: error.message,
      success: false,
    };
  }
}

async function testAllEndpoints() {
  console.log('🧪 Testing API Endpoints');
  console.log('================================\n');
  console.log(`Base URL: ${BASE_URL}\n`);

  const results = [];
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    results.push(result);
    
    const statusMsg = result.status === 0 
      ? 'Connection failed' 
      : result.status === 401 
        ? 'Unauthorized (auth required - this is OK)' 
        : result.status === 200 
          ? 'OK' 
          : `Status ${result.status}`;
    
    console.log(`${result.statusText} ${result.name}`);
    console.log(`   ${statusMsg}: ${typeof result.data === 'string' ? result.data : JSON.stringify(result.data).substring(0, 100)}`);
    console.log('');
  }

  console.log('================================');
  console.log('📊 Test Summary');
  console.log('================================\n');
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Successful: ${successful}/${results.length}`);
  console.log(`❌ Failed: ${failed}/${results.length}\n`);

  if (successful === results.length) {
    console.log('🎉 All endpoints are accessible!');
    console.log('\nNote: 401 (Unauthorized) responses are expected for protected endpoints.');
    console.log('This means the API is working and authentication is required.');
  } else if (failed > 0) {
    console.log('⚠️  Some endpoints failed. Check if the server is running:');
    console.log('   npm run dev');
  }
}

// Wait a bit for server to start, then test
setTimeout(() => {
  testAllEndpoints().catch(error => {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the server is running: npm run dev');
    process.exit(1);
  });
}, 5000);

