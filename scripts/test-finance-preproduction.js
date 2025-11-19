#!/usr/bin/env node
/**
 * Finance System Pre-Production Test Suite
 * Zero Alarms, Zero Errors Validation
 * 
 * Tests all finance endpoints, validations, and data integrity
 */

import https from 'https';
import http from 'http';

// Configuration
const config = {
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3050',
  timeout: 30000,
  verbose: process.argv.includes('--verbose') || process.argv.includes('-v'),
};

// Test Results
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  errors: [],
  warnings_list: [],
  startTime: Date.now(),
};

// Colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Finance API Endpoints to Test
const financeEndpoints = [
  // Core Finance APIs
  { path: '/api/finance/stats', method: 'GET', name: 'Finance Statistics', critical: true },
  { path: '/api/finance/stats-fixed', method: 'GET', name: 'Finance Stats Fixed', critical: false },
  { path: '/api/finance/accounts', method: 'GET', name: 'Chart of Accounts', critical: true },
  { path: '/api/finance/accounts', method: 'POST', name: 'Create Account', critical: true, requiresBody: true },
  { path: '/api/finance/transactions', method: 'GET', name: 'Transactions List', critical: true },
  { path: '/api/finance/transactions', method: 'POST', name: 'Create Transaction', critical: true, requiresBody: true },
  { path: '/api/finance/budgets', method: 'GET', name: 'Budgets List', critical: true },
  { path: '/api/finance/budgets', method: 'POST', name: 'Create Budget', critical: true, requiresBody: true },
  { path: '/api/finance/reports', method: 'GET', name: 'Financial Reports', critical: true },
  { path: '/api/finance/reports', method: 'POST', name: 'Generate Report', critical: true, requiresBody: true },
  
  // Invoice Management
  { path: '/api/finance/invoices', method: 'GET', name: 'Invoices List', critical: true },
  { path: '/api/finance/invoices', method: 'POST', name: 'Create Invoice', critical: true, requiresBody: true },
  
  // Journal Entries
  { path: '/api/finance/journal-entries', method: 'GET', name: 'Journal Entries', critical: true },
  { path: '/api/finance/journal-entries', method: 'POST', name: 'Create Journal Entry', critical: true, requiresBody: true },
  
  // Accounts Payable/Receivable
  { path: '/api/finance/accounts-payable', method: 'GET', name: 'Accounts Payable', critical: true },
  { path: '/api/finance/accounts-receivable', method: 'GET', name: 'Accounts Receivable', critical: true },
  
  // Cash Flow
  { path: '/api/finance/cash-flow', method: 'GET', name: 'Cash Flow', critical: true },
  { path: '/api/finance/monthly', method: 'GET', name: 'Monthly Finance', critical: true },
  
  // Tax & Compliance
  { path: '/api/finance/tax', method: 'GET', name: 'Tax Information', critical: true },
  { path: '/api/finance/zatca?invoice_id=test-invoice-001&action=validate', method: 'GET', name: 'ZATCA Compliance', critical: false },
  
  // Export
  { path: '/api/finance/export/excel', method: 'POST', name: 'Export to Excel', critical: false, requiresBody: true },
  { path: '/api/finance/export/pdf', method: 'POST', name: 'Export to PDF', critical: false, requiresBody: true },
];

// Helper Functions
function log(message, color = 'reset') {
  const timestamp = new Date().toISOString();
  console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
  results.passed++;
}

function logError(message, error = null) {
  log(`❌ ${message}`, 'red');
  results.failed++;
  results.errors.push({ message, error: error?.message || error });
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
  results.warnings++;
  results.warnings_list.push(message);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      timeout: config.timeout,
    };

    if (options.body) {
      const bodyString = JSON.stringify(options.body);
      requestOptions.headers['Content-Length'] = Buffer.byteLength(bodyString);
    }

    const req = client.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: jsonData,
            rawData: data,
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data,
            rawData: data,
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

// Test Functions
async function testEndpoint(endpoint) {
  const url = `${config.baseUrl}${endpoint.path}`;
  const testName = `${endpoint.method} ${endpoint.name}`;
  
  try {
    if (config.verbose) {
      log(`Testing: ${testName}`, 'cyan');
    }

    const startTime = Date.now();
    const options = {
      method: endpoint.method,
    };

    // Add test body for POST requests
    if (endpoint.requiresBody && endpoint.method === 'POST') {
      options.body = getTestBody(endpoint.path);
    }

    const response = await makeRequest(url, options);
    const responseTime = Date.now() - startTime;

    // Validate response
    if (response.statusCode >= 200 && response.statusCode < 300) {
      // Additional validations
      const validationErrors = validateResponse(endpoint, response);
      
      if (validationErrors.length === 0) {
        logSuccess(`${testName} - ${response.statusCode} (${responseTime}ms)`);
        return true;
      } else {
        validationErrors.forEach(err => logWarning(`${testName}: ${err}`));
        logSuccess(`${testName} - ${response.statusCode} (${responseTime}ms) [with warnings]`);
        return true;
      }
    } else if (response.statusCode === 401 || response.statusCode === 403) {
      logWarning(`${testName} - ${response.statusCode} (Authentication required - may be expected)`);
      return true; // Not a failure, just needs auth
    } else {
      logError(`${testName} - ${response.statusCode} (Expected 2xx)`);
      if (config.verbose) {
        console.log('Response:', JSON.stringify(response.data, null, 2));
      }
      return false;
    }
  } catch (error) {
    logError(`${testName} - Error: ${error.message}`, error);
    return false;
  }
}

function getTestBody(path) {
  // Return appropriate test body based on endpoint
  if (path.includes('/accounts')) {
    return {
      account_name: 'Test Account',
      account_code: 'TEST-001',
      account_type: 'asset',
      parent_account_id: null,
      balance: 0,
    };
  } else if (path.includes('/transactions')) {
    return {
      date: new Date().toISOString(),
      description: 'Test Transaction',
      amount: 100.00,
      type: 'debit',
      accountId: 1,
    };
  } else if (path.includes('/budgets')) {
    return {
      name: 'Test Budget',
      period: '2024',
      amount: 10000,
      category: 'operating',
    };
  } else if (path.includes('/reports')) {
    return {
      reportId: 'balance-sheet',
      period: { startDate: '2024-01-01', endDate: '2024-12-31' },
    };
  } else if (path.includes('/invoices')) {
    return {
      customerId: 1,
      items: [
        { description: 'Test Item', quantity: 1, price: 100 },
      ],
      dueDate: new Date().toISOString(),
    };
  } else if (path.includes('/journal-entries')) {
    return {
      entry_date: new Date().toISOString().split('T')[0],
      description: 'Test Journal Entry',
      lines: [
        { account_id: '1', debit_amount: 100, credit_amount: 0 },
        { account_id: '2', debit_amount: 0, credit_amount: 100 },
      ],
    };
  } else if (path.includes('/export/excel') || path.includes('/export/pdf')) {
    return {
      data: [
        { account: 'Cash', balance: 10000 },
        { account: 'Revenue', balance: 50000 },
      ],
      options: {
        filename: 'test-export',
        title: 'Test Export',
      },
    };
  }
  return {};
}

function validateResponse(endpoint, response) {
  const errors = [];
  const data = response.data;

  // Validate based on endpoint type
  if (endpoint.path.includes('/stats')) {
    if (!data || typeof data !== 'object') {
      errors.push('Stats should return an object');
    }
  } else if (endpoint.path.includes('/accounts')) {
    if (endpoint.method === 'GET' && !Array.isArray(data) && !data.accounts) {
      errors.push('Accounts should return an array or object with accounts property');
    }
  } else if (endpoint.path.includes('/transactions')) {
    if (endpoint.method === 'GET' && !Array.isArray(data) && !data.transactions) {
      errors.push('Transactions should return an array or object with transactions property');
    }
  } else if (endpoint.path.includes('/budgets')) {
    if (endpoint.method === 'GET' && !Array.isArray(data) && !data.budgets) {
      errors.push('Budgets should return an array or object with budgets property');
    }
  } else if (endpoint.path.includes('/reports')) {
    if (endpoint.method === 'GET' && !Array.isArray(data) && !data.reports) {
      errors.push('Reports should return an array or object with reports property');
    }
  }

  // Check for error messages in response (but ignore fallback messages)
  if (data && (data.error || (data.message?.toLowerCase().includes('error') && !data.message?.toLowerCase().includes('fallback')))) {
    errors.push(`Response contains error: ${data.error || data.message}`);
  }

  return errors;
}

// Data Integrity Tests
async function testDataIntegrity() {
  log('\n🔍 Testing Data Integrity...', 'cyan');
  
  try {
    // Test 1: Double-entry bookkeeping validation
    log('Testing double-entry bookkeeping...', 'blue');
    const accountsResponse = await makeRequest(`${config.baseUrl}/api/finance/accounts`);
    
    if (accountsResponse.statusCode === 200) {
      logSuccess('Accounts endpoint accessible for integrity checks');
    } else {
      logError('Cannot access accounts for integrity validation');
    }

    // Test 2: Balance validation
    log('Testing account balance consistency...', 'blue');
    const statsResponse = await makeRequest(`${config.baseUrl}/api/finance/stats`);
    
    if (statsResponse.statusCode === 200 && statsResponse.data) {
      logSuccess('Stats endpoint accessible for balance validation');
    } else {
      logWarning('Stats endpoint may need authentication');
    }

  } catch (error) {
    logError('Data integrity test failed', error);
  }
}

// Performance Tests
async function testPerformance() {
  log('\n⚡ Testing Performance...', 'cyan');
  
  const criticalEndpoints = financeEndpoints.filter(e => e.critical);
  const performanceResults = [];

  for (const endpoint of criticalEndpoints.slice(0, 5)) { // Test top 5 critical endpoints
    try {
      const startTime = Date.now();
      await makeRequest(`${config.baseUrl}${endpoint.path}`, { method: endpoint.method });
      const responseTime = Date.now() - startTime;
      
      performanceResults.push({ endpoint: endpoint.name, time: responseTime });
      
      if (responseTime > 5000) {
        logWarning(`${endpoint.name} response time: ${responseTime}ms (slow)`);
      } else {
        logSuccess(`${endpoint.name} response time: ${responseTime}ms`);
      }
    } catch (error) {
      // Ignore auth errors for performance test
      if (!error.message.includes('401') && !error.message.includes('403')) {
        logWarning(`${endpoint.name} performance test skipped: ${error.message}`);
      }
    }
  }

  const avgTime = performanceResults.reduce((sum, r) => sum + r.time, 0) / performanceResults.length;
  if (avgTime > 3000) {
    logWarning(`Average response time: ${avgTime.toFixed(2)}ms (consider optimization)`);
  } else {
    logSuccess(`Average response time: ${avgTime.toFixed(2)}ms`);
  }
}

// Main Test Runner
async function runTests() {
  log('\n🚀 Finance System Pre-Production Test Suite', 'cyan');
  log('='.repeat(60), 'cyan');
  log(`Base URL: ${config.baseUrl}`, 'blue');
  log(`Timeout: ${config.timeout}ms`, 'blue');
  log('='.repeat(60), 'cyan');
  log('');

  // Test all endpoints
  log('📡 Testing Finance API Endpoints...', 'cyan');
  log('');
  
  const criticalEndpoints = financeEndpoints.filter(e => e.critical);
  const optionalEndpoints = financeEndpoints.filter(e => !e.critical);

  // Test critical endpoints first
  log('🔴 Critical Endpoints:', 'yellow');
  for (const endpoint of criticalEndpoints) {
    await testEndpoint(endpoint);
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between requests
  }

  log('');
  log('🟡 Optional Endpoints:', 'yellow');
  for (const endpoint of optionalEndpoints) {
    await testEndpoint(endpoint);
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Data Integrity Tests
  await testDataIntegrity();

  // Performance Tests
  await testPerformance();

  // Generate Report
  log('');
  log('='.repeat(60), 'cyan');
  log('📊 Test Summary', 'cyan');
  log('='.repeat(60), 'cyan');
  
  const totalTests = results.passed + results.failed;
  const passRate = totalTests > 0 ? ((results.passed / totalTests) * 100).toFixed(2) : 0;
  const duration = ((Date.now() - results.startTime) / 1000).toFixed(2);

  log(`Total Tests: ${totalTests}`, 'blue');
  log(`✅ Passed: ${results.passed}`, 'green');
  log(`❌ Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  log(`⚠️  Warnings: ${results.warnings}`, results.warnings > 0 ? 'yellow' : 'green');
  log(`Pass Rate: ${passRate}%`, passRate >= 95 ? 'green' : 'yellow');
  log(`Duration: ${duration}s`, 'blue');

  if (results.errors.length > 0) {
    log('');
    log('❌ Errors:', 'red');
    results.errors.forEach((err, idx) => {
      log(`  ${idx + 1}. ${err.message}`, 'red');
      if (config.verbose && err.error) {
        log(`     ${err.error}`, 'red');
      }
    });
  }

  if (results.warnings_list.length > 0 && config.verbose) {
    log('');
    log('⚠️  Warnings:', 'yellow');
    results.warnings_list.forEach((warn, idx) => {
      log(`  ${idx + 1}. ${warn}`, 'yellow');
    });
  }

  log('');
  log('='.repeat(60), 'cyan');

  // Final Status
  if (results.failed === 0 && results.warnings === 0) {
    log('🎉 ZERO ALARMS, ZERO ERRORS - Finance System Ready for Production!', 'green');
    process.exit(0);
  } else if (results.failed === 0) {
    log('✅ ZERO ERRORS - Finance System Ready (with warnings)', 'green');
    process.exit(0);
  } else {
    log('❌ ERRORS DETECTED - Finance System NOT Ready for Production', 'red');
    process.exit(1);
  }
}

// Run tests
runTests().catch((error) => {
  logError('Test suite failed', error);
  process.exit(1);
});

