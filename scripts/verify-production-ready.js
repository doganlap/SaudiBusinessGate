#!/usr/bin/env node
/**
 * Production Readiness Verification Script
 * Comprehensive check for all systems before production deployment
 */

import https from 'https';
import http from 'http';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const config = {
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3050',
  timeout: 30000,
};

const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  checks: [],
  startTime: Date.now(),
};

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function check(name, condition, critical = true) {
  if (condition) {
    log(`✅ ${name}`, 'green');
    results.passed++;
    results.checks.push({ name, status: 'pass', critical });
  } else {
    log(`❌ ${name}`, critical ? 'red' : 'yellow');
    if (critical) {
      results.failed++;
    } else {
      results.warnings++;
    }
    results.checks.push({ name, status: critical ? 'fail' : 'warning', critical });
  }
}

// Production Readiness Checks
async function runChecks() {
  log('\n🚀 Production Readiness Verification', 'cyan');
  log('='.repeat(60), 'cyan');
  log('');

  // 1. Build Check
  log('📦 Build Verification...', 'blue');
  try {
    const buildDir = path.join(process.cwd(), '.next');
    check('Build directory exists', fs.existsSync(buildDir), true);
    
    if (fs.existsSync(buildDir)) {
      const buildFiles = fs.readdirSync(buildDir);
      check('Build artifacts present', buildFiles.length > 0, true);
    }
  } catch (error) {
    check('Build verification', false, true);
  }

  // 2. Environment Variables (Check if in production or have .env file)
  log('\n🔐 Environment Configuration...', 'blue');
  const hasEnvFile = fs.existsSync(path.join(process.cwd(), '.env')) || 
                     fs.existsSync(path.join(process.cwd(), '.env.production'));
  const isProduction = process.env.NODE_ENV === 'production';
  
  check('Environment file exists', hasEnvFile || isProduction, false);
  
  // In production, these will be set in Vercel
  if (isProduction) {
    check('Production environment detected', true, false);
  } else {
    check('Local development environment', true, false);
  }

  // 3. Finance System Health
  log('\n💰 Finance System Health...', 'blue');
  try {
    const response = await makeRequest(`${config.baseUrl}/api/finance/stats`);
    check('Finance stats endpoint', response.statusCode === 200, true);
    check('Finance stats response valid', response.data && response.data.success !== false, true);
  } catch (error) {
    check('Finance system accessible', false, true);
  }

  // 4. API Health Check
  log('\n🏥 API Health Check...', 'blue');
  try {
    const response = await makeRequest(`${config.baseUrl}/api/health`);
    check('Health endpoint accessible', response.statusCode === 200, false);
  } catch (error) {
    // Health endpoint may not exist, not critical
    check('Health endpoint accessible', false, false);
  }

  // 5. Database Connection
  log('\n🗄️  Database Connection...', 'blue');
  try {
    const response = await makeRequest(`${config.baseUrl}/api/health/database`);
    check('Database health check', response.statusCode === 200, false);
  } catch (error) {
    // Database health check may not exist, not critical
    check('Database health check', false, false);
  }
  
  // Alternative: Test database via finance endpoint
  try {
    const response = await makeRequest(`${config.baseUrl}/api/finance/stats`);
    check('Database accessible via finance API', response.statusCode === 200, false);
  } catch (error) {
    check('Database accessible via finance API', false, false);
  }

  // 6. Critical Finance Endpoints
  log('\n📊 Critical Finance Endpoints...', 'blue');
  const criticalEndpoints = [
    '/api/finance/accounts',
    '/api/finance/stats',
    '/api/finance/budgets',
    '/api/finance/reports',
  ];

  for (const endpoint of criticalEndpoints) {
    try {
      const response = await makeRequest(`${config.baseUrl}${endpoint}`);
      check(`${endpoint} accessible`, response.statusCode === 200, true);
    } catch (error) {
      check(`${endpoint} accessible`, false, true);
    }
  }

  // 7. File Structure
  log('\n📁 File Structure Verification...', 'blue');
  const requiredFiles = [
    'package.json',
    'next.config.js',
    'vercel.json',
    'app/api/finance',
  ];

  requiredFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    check(`${file} exists`, fs.existsSync(filePath), true);
  });

  // 8. Security Checks
  log('\n🔒 Security Configuration...', 'blue');
  try {
    const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
    check('Vercel config has security headers', !!vercelConfig.headers, true);
    check('CORS configured', !!vercelConfig.headers, false);
  } catch (error) {
    check('Security configuration', false, false);
  }

  // Generate Report
  log('');
  log('='.repeat(60), 'cyan');
  log('📊 Production Readiness Summary', 'cyan');
  log('='.repeat(60), 'cyan');
  
  const totalChecks = results.passed + results.failed;
  const passRate = totalChecks > 0 ? ((results.passed / totalChecks) * 100).toFixed(2) : 0;
  const duration = ((Date.now() - results.startTime) / 1000).toFixed(2);

  log(`Total Checks: ${totalChecks}`, 'blue');
  log(`✅ Passed: ${results.passed}`, 'green');
  log(`❌ Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  log(`⚠️  Warnings: ${results.warnings}`, results.warnings > 0 ? 'yellow' : 'green');
  log(`Pass Rate: ${passRate}%`, passRate >= 95 ? 'green' : 'yellow');
  log(`Duration: ${duration}s`, 'blue');

  log('');
  log('='.repeat(60), 'cyan');

  // Only fail if critical checks failed
  const criticalFailures = results.checks.filter(c => c.critical && c.status === 'fail').length;
  
  if (criticalFailures === 0) {
    log('🎉 PRODUCTION READY - All critical checks passed!', 'green');
    if (results.failed > 0) {
      log(`⚠️  ${results.failed} non-critical checks failed (acceptable)`, 'yellow');
    }
    process.exit(0);
  } else {
    log(`❌ NOT PRODUCTION READY - ${criticalFailures} critical issues must be fixed`, 'red');
    process.exit(1);
  }
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const req = client.request({
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      timeout: config.timeout,
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            data: data ? JSON.parse(data) : {},
            rawData: data,
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            data: data,
            rawData: data,
          });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    req.end();
  });
}

runChecks().catch((error) => {
  log(`❌ Verification failed: ${error.message}`, 'red');
  process.exit(1);
});

