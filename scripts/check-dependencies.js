#!/usr/bin/env node
/**
 * Dependency Checker Script
 * Checks CSS, notifications, and all required dependencies
 */

import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Checking Dependencies');
console.log('================================\n');

const rootDir = process.cwd();
let allGood = true;

// Required CSS dependencies
const cssDependencies = {
  'tailwindcss': 'Tailwind CSS',
  'postcss': 'PostCSS',
  'autoprefixer': 'Autoprefixer',
  '@tailwindcss/forms': 'Tailwind Forms',
  '@tailwindcss/typography': 'Tailwind Typography',
};

// Required notification dependencies
const notificationDependencies = {
  'sonner': 'Sonner (Toast notifications)',
  '@radix-ui/react-toast': 'Radix UI Toast',
};

// Check package.json
const packageJsonPath = path.join(rootDir, 'package.json');
if (!existsSync(packageJsonPath)) {
  console.error('❌ package.json not found');
  process.exit(1);
}

const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
const allDependencies = {
  ...packageJson.dependencies || {},
  ...packageJson.devDependencies || {},
};

// Check CSS dependencies
console.log('📦 CSS Dependencies:\n');
for (const [pkg, name] of Object.entries(cssDependencies)) {
  if (allDependencies[pkg]) {
    console.log(`   ✅ ${name} (${pkg})`);
  } else {
    console.log(`   ❌ ${name} (${pkg}) - MISSING`);
    allGood = false;
  }
}

// Check notification dependencies
console.log('\n🔔 Notification Dependencies:\n');
for (const [pkg, name] of Object.entries(notificationDependencies)) {
  if (allDependencies[pkg]) {
    console.log(`   ✅ ${name} (${pkg})`);
  } else {
    console.log(`   ❌ ${name} (${pkg}) - MISSING`);
    allGood = false;
  }
}

// Check config files
console.log('\n📄 Configuration Files:\n');

const configFiles = [
  { path: 'tailwind.config.ts', name: 'Tailwind Config' },
  { path: 'tailwind.config.js', name: 'Tailwind Config (JS)' },
  { path: 'postcss.config.js', name: 'PostCSS Config' },
  { path: 'postcss.config.cjs', name: 'PostCSS Config (CJS)' },
  { path: 'next.config.js', name: 'Next.js Config' },
  { path: 'app/globals.css', name: 'Global CSS' },
];

let configFound = false;
for (const config of configFiles) {
  const configPath = path.join(rootDir, config.path);
  if (existsSync(configPath)) {
    console.log(`   ✅ ${config.name}`);
    configFound = true;
    if (config.path.includes('tailwind.config')) break; // Found one, skip others
  }
}

if (!configFound && !existsSync(path.join(rootDir, 'tailwind.config.ts')) && 
    !existsSync(path.join(rootDir, 'tailwind.config.js'))) {
  console.log(`   ⚠️  Tailwind config not found`);
}

// Check if CSS files import Tailwind
console.log('\n🎨 CSS File Checks:\n');
const globalsCssPath = path.join(rootDir, 'app/globals.css');
if (existsSync(globalsCssPath)) {
  const globalsCss = readFileSync(globalsCssPath, 'utf8');
  if (globalsCss.includes('@tailwind')) {
    console.log('   ✅ globals.css includes Tailwind directives');
  } else {
    console.log('   ⚠️  globals.css missing Tailwind directives');
  }
} else {
  console.log('   ⚠️  globals.css not found');
}

// Check if sonner is used in components
console.log('\n🔔 Notification Usage:\n');
try {
  const result = execSync('grep -r "sonner" app components --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" 2>/dev/null | head -5', { 
    encoding: 'utf8',
    cwd: rootDir,
    shell: true
  });
  if (result.trim()) {
    console.log('   ✅ Sonner is being used in components');
    console.log(`   Found in: ${result.split('\n').length} files`);
  } else {
    console.log('   ⚠️  Sonner not found in components (may not be used yet)');
  }
} catch (e) {
  console.log('   ⚠️  Could not check sonner usage');
}

// Check installed packages
console.log('\n📦 Installed Packages Check:\n');
try {
  const installed = execSync('npm list --depth=0 2>&1', { encoding: 'utf8', cwd: rootDir });
  const missing = [];
  
  for (const pkg of Object.keys(cssDependencies)) {
    if (!installed.includes(pkg)) {
      missing.push(pkg);
    }
  }
  
  for (const pkg of Object.keys(notificationDependencies)) {
    if (!installed.includes(pkg)) {
      missing.push(pkg);
    }
  }
  
  if (missing.length === 0) {
    console.log('   ✅ All required packages are installed');
  } else {
    console.log(`   ❌ Missing packages: ${missing.join(', ')}`);
    allGood = false;
  }
} catch (e) {
  console.log('   ⚠️  Could not verify installed packages');
}

// Summary
console.log('\n================================');
console.log('📋 Dependency Summary');
console.log('================================\n');

if (allGood) {
  console.log('✅ All dependencies are properly configured!');
  console.log('\n🚀 Ready to build and deploy!');
} else {
  console.log('⚠️  Some dependencies are missing or misconfigured');
  console.log('\n💡 Run: npm install');
  console.log('💡 Or install missing packages individually');
}

console.log('\n');

