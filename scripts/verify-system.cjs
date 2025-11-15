#!/usr/bin/env node
/**
 * System Verification Script
 * Validates all configurations and dependencies
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const checks = {
  passed: [],
  failed: [],
  warnings: [],
};

console.log('🔍 DoganHub Store - System Verification\n');
console.log('=' .repeat(50) + '\n');

// Check 1: Node.js version
try {
  const nodeVersion = process.version;
  const major = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  if (major >= 18) {
    checks.passed.push(`Node.js ${nodeVersion} ✓`);
  } else {
    checks.failed.push(`Node.js version ${nodeVersion} (requires 18+)`);
  }
} catch (error) {
  checks.failed.push('Node.js version check failed');
}

// Check 2: Required files
const requiredFiles = [
  'package.json',
  'next.config.js',
  'tsconfig.json',
  '.env.local',
  'app/layout.tsx',
  'components/ui',
  'lib/utils.ts',
];

requiredFiles.forEach((file) => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    checks.passed.push(`${file} exists ✓`);
  } else {
    checks.failed.push(`${file} missing`);
  }
});

// Check 3: node_modules
if (fs.existsSync(path.join(process.cwd(), 'node_modules'))) {
  checks.passed.push('Dependencies installed ✓');
  
  // Check critical packages
  const criticalPackages = ['next', 'react', 'typescript'];
  criticalPackages.forEach((pkg) => {
    const pkgPath = path.join(process.cwd(), 'node_modules', pkg);
    if (fs.existsSync(pkgPath)) {
      checks.passed.push(`${pkg} installed ✓`);
    } else {
      checks.failed.push(`${pkg} not installed`);
    }
  });
} else {
  checks.failed.push('Dependencies not installed (run npm install)');
}

// Check 4: Environment variables
try {
  require('dotenv').config({ path: '.env.local' });
  
  const requiredEnvVars = [
    'NEXT_PUBLIC_APP_URL',
    'NEXTAUTH_SECRET',
    'JWT_SECRET',
  ];
  
  requiredEnvVars.forEach((varName) => {
    if (process.env[varName]) {
      checks.passed.push(`${varName} configured ✓`);
    } else {
      checks.failed.push(`${varName} not set in .env.local`);
    }
  });
  
  // Optional but recommended
  const optionalVars = ['STRIPE_SECRET_KEY', 'DATABASE_URL'];
  optionalVars.forEach((varName) => {
    if (!process.env[varName]) {
      checks.warnings.push(`${varName} not configured (optional)`);
    }
  });
} catch (error) {
  checks.failed.push('Environment variables check failed');
}

// Check 5: TypeScript configuration
try {
  const tsconfig = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'tsconfig.json'), 'utf-8')
  );
  
  if (tsconfig.compilerOptions?.paths) {
    checks.passed.push('TypeScript path aliases configured ✓');
  } else {
    checks.warnings.push('TypeScript path aliases not configured');
  }
  
  if (tsconfig.compilerOptions?.strict) {
    checks.passed.push('TypeScript strict mode enabled ✓');
  } else {
    checks.warnings.push('TypeScript strict mode disabled');
  }
} catch (error) {
  checks.failed.push('TypeScript configuration check failed');
}

// Check 6: Build directory
if (fs.existsSync(path.join(process.cwd(), '.next'))) {
  checks.warnings.push('.next directory exists (consider clean build)');
}

// Print results
console.log('✅ PASSED CHECKS (' + checks.passed.length + '):\n');
checks.passed.forEach((msg) => console.log('  ' + msg));

if (checks.warnings.length > 0) {
  console.log('\n⚠️  WARNINGS (' + checks.warnings.length + '):\n');
  checks.warnings.forEach((msg) => console.log('  ' + msg));
}

if (checks.failed.length > 0) {
  console.log('\n❌ FAILED CHECKS (' + checks.failed.length + '):\n');
  checks.failed.forEach((msg) => console.log('  ' + msg));
  console.log('\n' + '='.repeat(50));
  console.log('⚠️  Fix the failed checks before proceeding');
  process.exit(1);
}

console.log('\n' + '='.repeat(50));
console.log('✅ All checks passed! System ready for development.\n');

// Provide next steps
console.log('Next steps:');
console.log('  1. npm run dev       - Start development server');
console.log('  2. npm run build     - Build for production');
console.log('  3. npm run test      - Run test suite\n');
