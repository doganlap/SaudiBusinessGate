#!/usr/bin/env node
/**
 * Check Server Status
 * Tests if the server is running and what errors it's showing
 */

const BASE_URL = 'http://localhost:3050';

async function checkServer() {
  console.log('🔍 Checking Server Status');
  console.log('================================\n');

  // Test 1: Simple health endpoint
  try {
    const response = await fetch(`${BASE_URL}/api/health/simple`);
    const text = await response.text();
    
    if (response.ok) {
      try {
        const data = JSON.parse(text);
        console.log('✅ Simple Health Endpoint: WORKING');
        console.log(JSON.stringify(data, null, 2));
        return true;
      } catch (e) {
        console.log('⚠️  Simple Health Endpoint: Returns non-JSON');
        console.log('Response:', text.substring(0, 200));
      }
    } else {
      console.log(`❌ Simple Health Endpoint: Status ${response.status}`);
      console.log('Response:', text.substring(0, 500));
    }
  } catch (error) {
    console.log('❌ Simple Health Endpoint: Connection failed');
    console.log('Error:', error.message);
    console.log('\n💡 Make sure the server is running: npm run dev');
    return false;
  }

  // Test 2: Root endpoint
  try {
    const response = await fetch(`${BASE_URL}/`);
    console.log(`\n📄 Root Endpoint: Status ${response.status}`);
    if (response.ok) {
      console.log('✅ Server is responding');
    }
  } catch (error) {
    console.log('❌ Root endpoint failed:', error.message);
  }

  console.log('\n================================');
  console.log('💡 Next Steps:');
  console.log('1. Check the terminal where npm run dev is running');
  console.log('2. Look for error messages in the console');
  console.log('3. Common issues:');
  console.log('   - Missing environment variables');
  console.log('   - Database connection errors');
  console.log('   - TypeScript compilation errors');
  console.log('   - Missing dependencies');
}

checkServer();

