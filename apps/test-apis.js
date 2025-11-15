// Test script for API endpoints
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3050';

async function testAPIs() {
  console.log('🧪 Testing API Endpoints...\n');

  try {
    // Test Vectorize API
    console.log('📊 Testing Vectorize API...');
    const vectorizeResponse = await fetch(`${BASE_URL}/api/vectorize`, {
      headers: { 'x-tenant-id': 'demo-tenant' }
    });

    console.log(`Vectorize Status: ${vectorizeResponse.status}`);
    if (vectorizeResponse.ok) {
      const data = await vectorizeResponse.json();
      console.log('✅ Vectorize API Response:', JSON.stringify(data, null, 2));
    } else {
      console.log('❌ Vectorize API failed');
    }

    console.log('\n---\n');

    // Test Licensing API
    console.log('📋 Testing Licensing API...');
    const licensingResponse = await fetch(`${BASE_URL}/api/licensing`, {
      headers: { 'x-tenant-id': 'demo-tenant' }
    });

    console.log(`Licensing Status: ${licensingResponse.status}`);
    if (licensingResponse.ok) {
      const data = await licensingResponse.json();
      console.log('✅ Licensing API Response:', JSON.stringify(data, null, 2));
    } else {
      console.log('❌ Licensing API failed');
    }

    console.log('\n🎉 API Testing Complete!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAPIs();
