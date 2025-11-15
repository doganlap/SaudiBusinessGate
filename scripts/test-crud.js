#!/usr/bin/env node

/**
 * CRUD Test Runner
 * Run comprehensive UI to Database tests
 */

import { spawn } from 'child_process';
import path from 'path';

console.log('🚀 Saudi Store - CRUD & API Response Testing\n');
console.log('═'.repeat(80));
console.log('Testing: UI → API → Database → Response Flow');
console.log('═'.repeat(80));
console.log('');

const testCategories = [
  {
    name: 'Users CRUD Operations',
    command: 'npm',
    args: ['run', 'test:api', '--', '--testPathPattern=crud-flow.test.ts', '--testNamePattern=Users CRUD'],
  },
  {
    name: 'Organizations CRUD Operations',
    command: 'npm',
    args: ['run', 'test:api', '--', '--testPathPattern=crud-flow.test.ts', '--testNamePattern=Organizations CRUD'],
  },
  {
    name: 'End-to-End Flow',
    command: 'npm',
    args: ['run', 'test:api', '--', '--testPathPattern=crud-flow.test.ts', '--testNamePattern=End-to-End'],
  },
];

async function runTest(category) {
  return new Promise((resolve, reject) => {
    console.log(`\n📋 Running: ${category.name}`);
    console.log('─'.repeat(80));

    const test = spawn(category.command, category.args, {
      stdio: 'inherit',
      shell: true,
      cwd: process.cwd(),
    });

    test.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${category.name} - PASSED\n`);
        resolve();
      } else {
        console.log(`❌ ${category.name} - FAILED\n`);
        reject(new Error(`Test failed with code ${code}`));
      }
    });

    test.on('error', (error) => {
      console.error(`Error running test: ${error.message}`);
      reject(error);
    });
  });
}

async function runAllTests() {
  let passed = 0;
  let failed = 0;

  for (const category of testCategories) {
    try {
      await runTest(category);
      passed++;
    } catch (error) {
      failed++;
    }
  }

  console.log('\n' + '═'.repeat(80));
  console.log('  TEST SUMMARY');
  console.log('═'.repeat(80));
  console.log(`  ✅ Passed: ${passed}/${testCategories.length}`);
  console.log(`  ❌ Failed: ${failed}/${testCategories.length}`);
  console.log('═'.repeat(80));
  console.log('');

  if (failed === 0) {
    console.log('🎉 All CRUD tests passed! Database operations verified.');
    console.log('✅ UI → API → Database → Response flow working correctly.\n');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Please review errors above.\n');
    process.exit(1);
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3050/api/health');
    if (response.ok) {
      console.log('✅ Server is running at http://localhost:3050\n');
      return true;
    }
  } catch (error) {
    console.log('⚠️  Server not detected at http://localhost:3050');
    console.log('   Please ensure the development server is running:');
    console.log('   npm run dev\n');
    return false;
  }
}

// Main execution
(async () => {
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('💡 Starting tests anyway (using mock data)...\n');
  }

  await runAllTests();
})();
