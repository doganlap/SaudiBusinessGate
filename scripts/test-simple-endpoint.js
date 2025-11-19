#!/usr/bin/env node
/**
 * Test Simple Health Endpoint
 * Tests the simplest possible endpoint
 */

const BASE_URL = 'http://localhost:3050';

async function test() {
  console.log('🧪 Testing Simple Health Endpoint\n');
  
  try {
    const response = await fetch(`${BASE_URL}/api/health/simple`);
    const text = await response.text();
    
    console.log(`Status: ${response.status}`);
    console.log(`Status Text: ${response.statusText}\n`);
    
    if (response.ok) {
      try {
        const data = JSON.parse(text);
        console.log('✅ Response (JSON):');
        console.log(JSON.stringify(data, null, 2));
      } catch (e) {
        console.log('⚠️  Response (not JSON):');
        console.log(text.substring(0, 500));
      }
    } else {
      console.log('❌ Error Response:');
      console.log(text.substring(0, 1000));
    }
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\n💡 Make sure the server is running: npm run dev');
  }
}

test();

