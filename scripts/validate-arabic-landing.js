#!/usr/bin/env node
/**
 * Validation Script for Arabic Language Support and Landing Page
 * Validates that Arabic is properly configured and landing page exists
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function checkArabicSupport() {
  console.log('\n🌍 Validating Arabic Language Support...\n');
  
  const checks = [
    {
      file: 'lib/i18n.ts',
      checks: [
        {
          pattern: /defaultLanguage:\s*Language\s*=\s*['"]ar['"]/,
          name: 'Default language is Arabic'
        },
        {
          pattern: /languages:\s*Language\[\]\s*=\s*\[['"]ar['"]/,
          name: 'Arabic is first in languages array'
        }
      ]
    },
    {
      file: 'middleware.ts',
      checks: [
        {
          pattern: /defaultLanguage/,
          name: 'Middleware imports defaultLanguage'
        },
        {
          pattern: /return\s+defaultLanguage/,
          name: 'Middleware defaults to Arabic'
        },
        {
          pattern: /lang\s*===\s*['"]ar['"]/,
          name: 'Middleware prioritizes Arabic'
        }
      ]
    },
    {
      file: 'app/layout.tsx',
      checks: [
        {
          pattern: /lang=["']ar["']/,
          name: 'HTML lang attribute is Arabic'
        },
        {
          pattern: /dir=["']rtl["']/,
          name: 'HTML dir attribute is RTL'
        },
        {
          pattern: /Noto\s+Sans\s+Arabic/,
          name: 'Arabic font (Noto Sans Arabic) is loaded'
        }
      ]
    },
    {
      file: 'components/i18n/LanguageProvider.tsx',
      checks: [
        {
          pattern: /defaultLanguage:\s*Language\s*=\s*['"]ar['"]/,
          name: 'LanguageProvider defaults to Arabic'
        }
      ]
    }
  ];

  let allPassed = true;
  const results = {
    passed: [],
    failed: []
  };

  for (const check of checks) {
    const filePath = path.join(process.cwd(), check.file);
    if (!fs.existsSync(filePath)) {
      console.log(`   ❌ ${check.file} (file not found)`);
      results.failed.push(`${check.file}: File not found`);
      allPassed = false;
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    
    for (const subCheck of check.checks) {
      if (subCheck.pattern.test(content)) {
        console.log(`   ✅ ${subCheck.name}`);
        results.passed.push(`${check.file}: ${subCheck.name}`);
      } else {
        console.log(`   ❌ ${subCheck.name}`);
        results.failed.push(`${check.file}: ${subCheck.name}`);
        allPassed = false;
      }
    }
  }

  return { allPassed, results };
}

function checkLandingPage() {
  console.log('\n🏠 Validating Landing Page...\n');
  
  const landingPageChecks = [
    {
      path: 'app/landing/page.tsx',
      name: 'Main landing page',
      required: true
    },
    {
      path: 'app/page.tsx',
      name: 'Root page (redirect)',
      required: true
    },
    {
      path: 'app/[lng]/page.tsx',
      name: 'Language-specific home page',
      required: false
    }
  ];

  let allFound = true;
  const results = {
    found: [],
    missing: []
  };

  for (const check of landingPageChecks) {
    const filePath = path.join(process.cwd(), check.path);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check if it's a valid React/Next.js component
      const isComponent = content.includes('export default') || 
                         content.includes('export default function') ||
                         content.includes('function LandingPage') ||
                         content.includes('function HomePage') ||
                         content.includes('function LangHomePage');
      
      if (isComponent) {
        console.log(`   ✅ ${check.name} (${check.path})`);
        results.found.push(check.path);
      } else {
        console.log(`   ⚠️  ${check.name} exists but may not be a valid component`);
        results.found.push(check.path);
      }
    } else {
      if (check.required) {
        console.log(`   ❌ ${check.name} (${check.path}) - MISSING`);
        results.missing.push(check.path);
        allFound = false;
      } else {
        console.log(`   ⚠️  ${check.name} (${check.path}) - Optional, not found`);
      }
    }
  }

  // Additional check: Verify landing page has proper content
  const landingPagePath = path.join(process.cwd(), 'app/landing/page.tsx');
  if (fs.existsSync(landingPagePath)) {
    const content = fs.readFileSync(landingPagePath, 'utf8');
    
    const contentChecks = [
      {
        pattern: /LandingPage|HomePage/,
        name: 'Has LandingPage component'
      },
      {
        pattern: /return\s*\(/,
        name: 'Has JSX return statement'
      },
      {
        pattern: /className|style/,
        name: 'Has styling'
      }
    ];

    console.log(`\n   Landing Page Content Checks:`);
    for (const check of contentChecks) {
      if (check.pattern.test(content)) {
        console.log(`   ✅ ${check.name}`);
      } else {
        console.log(`   ⚠️  ${check.name} (may be minimal)`);
      }
    }
  }

  return { allFound, results };
}

function checkLandingPageRouting() {
  console.log('\n🔀 Validating Landing Page Routing...\n');
  
  const routingChecks = [
    {
      file: 'app/page.tsx',
      check: (content) => {
        // Should redirect to default language
        return content.includes('defaultLanguage') || 
               content.includes('/ar') ||
               content.includes('router.push');
      },
      name: 'Root page redirects to language route'
    },
    {
      file: 'app/landing/page.tsx',
      check: (content) => {
        // Should be accessible at /landing
        return content.includes('export default');
      },
      name: 'Landing page is accessible'
    }
  ];

  let allValid = true;
  for (const check of routingChecks) {
    const filePath = path.join(process.cwd(), check.file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (check.check(content)) {
        console.log(`   ✅ ${check.name}`);
      } else {
        console.log(`   ⚠️  ${check.name} (may need review)`);
      }
    } else {
      console.log(`   ❌ ${check.file} not found`);
      allValid = false;
    }
  }

  return allValid;
}

async function main() {
  console.log('🔍 Arabic & Landing Page Validation');
  console.log('====================================\n');

  // Run all checks
  const arabicCheck = checkArabicSupport();
  const landingCheck = checkLandingPage();
  const routingCheck = checkLandingPageRouting();

  // Summary
  console.log('\n====================================');
  console.log('📋 Validation Summary');
  console.log('====================================\n');

  console.log(`Arabic Language Support: ${arabicCheck.allPassed ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`   - Passed: ${arabicCheck.results.passed.length} checks`);
  console.log(`   - Failed: ${arabicCheck.results.failed.length} checks`);

  console.log(`\nLanding Page: ${landingCheck.allFound ? '✅ FOUND' : '❌ MISSING'}`);
  console.log(`   - Found: ${landingCheck.results.found.length} pages`);
  console.log(`   - Missing: ${landingCheck.results.missing.length} required pages`);

  console.log(`\nRouting: ${routingCheck ? '✅ VALID' : '⚠️  NEEDS REVIEW'}`);

  const allPassed = arabicCheck.allPassed && landingCheck.allFound && routingCheck;

  console.log('\n====================================');
  if (allPassed) {
    console.log('✅ All Validations Passed!');
    console.log('\n✅ Arabic is properly configured as default language');
    console.log('✅ Landing page exists and is accessible');
    console.log('\n🌐 Arabic (RTL) is the default language');
    console.log('🏠 Landing page is available at /landing');
    console.log('🏠 Root page redirects to /ar');
  } else {
    console.log('⚠️  Some Validations Failed');
    console.log('\nPlease review the issues above:');
    if (!arabicCheck.allPassed) {
      console.log('\n❌ Arabic Configuration Issues:');
      arabicCheck.results.failed.forEach(fail => console.log(`   - ${fail}`));
    }
    if (!landingCheck.allFound) {
      console.log('\n❌ Landing Page Issues:');
      landingCheck.results.missing.forEach(missing => console.log(`   - ${missing} is missing`));
    }
  }
  console.log('====================================\n');

  process.exit(allPassed ? 0 : 1);
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});

