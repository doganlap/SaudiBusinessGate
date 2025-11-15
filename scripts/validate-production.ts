/**
 * Production Readiness Validation Script
 * Checks all critical components before deployment
 */

import fs from 'fs';
import path from 'path';

interface ValidationResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string[];
}

const results: ValidationResult[] = [];

// Check environment variables
function checkEnvironmentVariables() {
  console.log('\n🔍 Checking environment variables...');
  
  const requiredVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'NEXTAUTH_SECRET',
    'NEXT_PUBLIC_APP_URL',
  ];
  
  const missingVars: string[] = [];
  
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });
  
  if (missingVars.length === 0) {
    results.push({
      name: 'Environment Variables',
      status: 'pass',
      message: 'All required environment variables are set',
    });
  } else {
    results.push({
      name: 'Environment Variables',
      status: 'fail',
      message: `Missing required environment variables`,
      details: missingVars,
    });
  }
}

// Check configuration files
function checkConfigFiles() {
  console.log('\n🔍 Checking configuration files...');
  
  const requiredFiles = [
    'package.json',
    'next.config.js',
    'tsconfig.json',
    'vercel.json',
    'docker-compose.yml',
    '.env.local',
  ];
  
  const missingFiles: string[] = [];
  
  requiredFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (!fs.existsSync(filePath)) {
      missingFiles.push(file);
    }
  });
  
  if (missingFiles.length === 0) {
    results.push({
      name: 'Configuration Files',
      status: 'pass',
      message: 'All configuration files present',
    });
  } else {
    results.push({
      name: 'Configuration Files',
      status: 'fail',
      message: 'Missing configuration files',
      details: missingFiles,
    });
  }
}

// Check API endpoints
async function checkAPIEndpoints() {
  console.log('\n🔍 Checking API endpoints...');
  
  const endpoints = [
    '/api/health',
    '/api/health/database',
    '/api/health/redis',
    '/api/health/performance',
    '/api/ai/chat',
  ];
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3050';
  const failedEndpoints: string[] = [];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: endpoint === '/api/ai/chat' ? 'POST' : 'GET',
        headers: { 'Content-Type': 'application/json' },
        body: endpoint === '/api/ai/chat' ? JSON.stringify({ message: 'test' }) : undefined,
      });
      
      if (!response.ok) {
        failedEndpoints.push(`${endpoint} (Status: ${response.status})`);
      }
    } catch (error) {
      failedEndpoints.push(`${endpoint} (Error: ${error instanceof Error ? error.message : 'Unknown'})`);
    }
  }
  
  if (failedEndpoints.length === 0) {
    results.push({
      name: 'API Endpoints',
      status: 'pass',
      message: 'All API endpoints responding correctly',
    });
  } else {
    results.push({
      name: 'API Endpoints',
      status: 'warning',
      message: 'Some endpoints may not be accessible (server may not be running)',
      details: failedEndpoints,
    });
  }
}

// Check database structure
function checkDatabaseStructure() {
  console.log('\n🔍 Checking database structure...');
  
  const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
  const seedPath = path.join(process.cwd(), 'database', 'seed.sql');
  
  const issues: string[] = [];
  
  if (!fs.existsSync(schemaPath)) {
    issues.push('database/schema.sql not found');
  }
  
  if (!fs.existsSync(seedPath)) {
    issues.push('database/seed.sql not found');
  }
  
  if (issues.length === 0) {
    results.push({
      name: 'Database Structure',
      status: 'pass',
      message: 'Database schema and seed files present',
    });
  } else {
    results.push({
      name: 'Database Structure',
      status: 'fail',
      message: 'Database structure incomplete',
      details: issues,
    });
  }
}

// Check monitoring configuration
function checkMonitoring() {
  console.log('\n🔍 Checking monitoring configuration...');
  
  const warnings: string[] = [];
  
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    warnings.push('Sentry DSN not configured');
  }
  
  if (!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
    warnings.push('Google Analytics not configured');
  }
  
  if (warnings.length === 0) {
    results.push({
      name: 'Monitoring Configuration',
      status: 'pass',
      message: 'All monitoring services configured',
    });
  } else {
    results.push({
      name: 'Monitoring Configuration',
      status: 'warning',
      message: 'Some monitoring services not configured',
      details: warnings,
    });
  }
}

// Check build integrity
function checkBuildIntegrity() {
  console.log('\n🔍 Checking build integrity...');
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  
  const issues: string[] = [];
  
  if (!packageJson.name) {
    issues.push('package.json missing name');
  }
  
  if (!packageJson.version) {
    issues.push('package.json missing version');
  }
  
  if (!packageJson.scripts?.build) {
    issues.push('Build script not defined');
  }
  
  if (!packageJson.scripts?.start) {
    issues.push('Start script not defined');
  }
  
  if (issues.length === 0) {
    results.push({
      name: 'Build Integrity',
      status: 'pass',
      message: `Package "${packageJson.name}" v${packageJson.version} configured correctly`,
    });
  } else {
    results.push({
      name: 'Build Integrity',
      status: 'fail',
      message: 'Build configuration issues found',
      details: issues,
    });
  }
}

// Print results
function printResults() {
  console.log('\n');
  console.log('═'.repeat(80));
  console.log('  PRODUCTION READINESS VALIDATION REPORT');
  console.log('  Saudi Store - The 1st Autonomous Store in the World 🇸🇦');
  console.log('═'.repeat(80));
  console.log('\n');
  
  let passCount = 0;
  let failCount = 0;
  let warningCount = 0;
  
  results.forEach(result => {
    const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
    console.log(`${icon} ${result.name}: ${result.message}`);
    
    if (result.details && result.details.length > 0) {
      result.details.forEach(detail => {
        console.log(`   - ${detail}`);
      });
    }
    
    console.log('');
    
    if (result.status === 'pass') passCount++;
    else if (result.status === 'fail') failCount++;
    else warningCount++;
  });
  
  console.log('─'.repeat(80));
  console.log(`  Summary: ${passCount} passed, ${failCount} failed, ${warningCount} warnings`);
  console.log('─'.repeat(80));
  console.log('\n');
  
  if (failCount === 0) {
    console.log('🎉 Production readiness validation PASSED!');
    console.log('   Your application is ready for deployment.\n');
    return true;
  } else {
    console.log('⚠️  Production readiness validation FAILED!');
    console.log('   Please fix the issues above before deploying.\n');
    return false;
  }
}

// Main execution
async function main() {
  console.log('\n🚀 Starting Production Readiness Validation...\n');
  
  checkEnvironmentVariables();
  checkConfigFiles();
  checkDatabaseStructure();
  checkMonitoring();
  checkBuildIntegrity();
  await checkAPIEndpoints();
  
  const passed = printResults();
  process.exit(passed ? 0 : 1);
}

main().catch(console.error);
