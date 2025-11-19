#!/usr/bin/env node
/**
 * Missing Dependencies Checker
 * Scans codebase for imports and checks if all dependencies are installed
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Checking for Missing Dependencies');
console.log('================================\n');

const rootDir = process.cwd();
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

// Get installed packages
let installedPackages = new Set();
try {
  const npmList = execSync('npm list --depth=0 --json', { 
    encoding: 'utf8', 
    cwd: rootDir,
    stdio: 'pipe'
  });
  const npmData = JSON.parse(npmList);
  if (npmData.dependencies) {
    Object.keys(npmData.dependencies).forEach(pkg => {
      installedPackages.add(pkg);
      // Also add scoped package names
      if (pkg.startsWith('@')) {
        installedPackages.add(pkg.split('/')[0]);
      }
    });
  }
} catch (e) {
  console.warn('⚠️  Could not get installed packages list');
}

// Common built-in modules that don't need to be installed
const builtInModules = new Set([
  'fs', 'path', 'url', 'http', 'https', 'crypto', 'stream', 'util',
  'events', 'buffer', 'querystring', 'os', 'child_process', 'cluster',
  'dgram', 'dns', 'net', 'tls', 'zlib', 'readline', 'repl', 'vm',
  'assert', 'console', 'process', 'timers', 'tty', 'v8', 'worker_threads',
  'react', 'react-dom', 'next', 'next/server', 'next/navigation', 'next-auth',
  'next-auth/next'
]);

// Scanned imports
const foundImports = new Set();
const missingPackages = new Set();
const missingScopedPackages = new Set();

// Directories to scan
const scanDirs = ['app', 'components', 'lib', 'scripts', 'hooks'];

// Extract package name from import
function extractPackageName(importPath) {
  // Remove quotes
  importPath = importPath.replace(/['"]/g, '');
  
  // Skip relative imports
  if (importPath.startsWith('.')) {
    return null;
  }
  
  // Skip absolute imports (starting with /)
  if (importPath.startsWith('/')) {
    return null;
  }
  
  // Handle scoped packages (@scope/package)
  if (importPath.startsWith('@')) {
    const parts = importPath.split('/');
    if (parts.length >= 2) {
      return `${parts[0]}/${parts[1]}`;
    }
    return parts[0];
  }
  
  // Handle regular packages
  const parts = importPath.split('/');
  return parts[0];
}

// Scan file for imports
function scanFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf8');
    
    // Match import statements
    const importRegex = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*(?:\s+from)?\s+)?['"]([^'"]+)['"]|require\(['"]([^'"]+)['"]\)/g;
    
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1] || match[2];
      if (!importPath) continue;
      
      const pkgName = extractPackageName(importPath);
      if (pkgName && !builtInModules.has(pkgName)) {
        foundImports.add(pkgName);
      }
    }
  } catch (e) {
    // Skip files that can't be read
  }
}

// Recursively scan directory
function scanDirectory(dirPath) {
  try {
    const entries = readdirSync(dirPath);
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules, .next, etc.
        if (!['node_modules', '.next', '.git', 'dist', 'build'].includes(entry)) {
          scanDirectory(fullPath);
        }
      } else if (stat.isFile()) {
        // Only scan JS/TS files
        if (/\.(js|jsx|ts|tsx)$/.test(entry)) {
          scanFile(fullPath);
        }
      }
    }
  } catch (e) {
    // Skip directories that can't be read
  }
}

// Scan all directories
console.log('📂 Scanning codebase for imports...\n');
for (const dir of scanDirs) {
  const dirPath = path.join(rootDir, dir);
  if (existsSync(dirPath)) {
    console.log(`   Scanning ${dir}/...`);
    scanDirectory(dirPath);
  }
}

console.log(`\n   Found ${foundImports.size} unique package imports\n`);

// Check which packages are missing
console.log('🔍 Checking installed packages...\n');

for (const pkg of foundImports) {
  // Check if it's in package.json
  if (!allDependencies[pkg]) {
    // Check if it's installed as a dependency of another package
    if (!installedPackages.has(pkg)) {
      // Check if it's a scoped package
      if (pkg.startsWith('@')) {
        missingScopedPackages.add(pkg);
      } else {
        missingPackages.add(pkg);
      }
    }
  }
}

// Also check for common missing packages
const commonPackages = [
  'typescript', '@types/node', '@types/react', '@types/react-dom',
  'eslint', 'prettier', 'tailwindcss', 'postcss', 'autoprefixer'
];

console.log('📦 Dependency Status:\n');

if (missingPackages.size === 0 && missingScopedPackages.size === 0) {
  console.log('   ✅ All imported packages are installed!\n');
} else {
  if (missingPackages.size > 0) {
    console.log('   ❌ Missing packages:');
    for (const pkg of Array.from(missingPackages).sort()) {
      console.log(`      - ${pkg}`);
    }
    console.log('');
  }
  
  if (missingScopedPackages.size > 0) {
    console.log('   ⚠️  Potentially missing scoped packages:');
    for (const pkg of Array.from(missingScopedPackages).sort()) {
      console.log(`      - ${pkg}`);
    }
    console.log('');
  }
}

// Check for packages in package.json that might not be used
console.log('📋 Checking for unused packages...\n');
const potentiallyUnused = [];
const usedPackages = new Set();

// Check if package is actually used
for (const pkg of Object.keys(allDependencies)) {
  const pkgName = pkg.split('/')[0]; // For scoped packages
  if (!foundImports.has(pkg) && !foundImports.has(pkgName)) {
    // Some packages are always needed (like next, react, etc.)
    const alwaysNeeded = ['next', 'react', 'react-dom', 'typescript', 'tailwindcss', 'postcss', 'autoprefixer'];
    if (!alwaysNeeded.includes(pkg) && !alwaysNeeded.includes(pkgName)) {
      potentiallyUnused.push(pkg);
    }
  }
}

if (potentiallyUnused.length > 0) {
  console.log(`   ⚠️  ${potentiallyUnused.length} potentially unused packages (may be used indirectly):`);
  for (const pkg of potentiallyUnused.slice(0, 10).sort()) {
    console.log(`      - ${pkg}`);
  }
  if (potentiallyUnused.length > 10) {
    console.log(`      ... and ${potentiallyUnused.length - 10} more`);
  }
  console.log('');
} else {
  console.log('   ✅ No obviously unused packages found\n');
}

// Summary
console.log('================================');
console.log('📋 Summary');
console.log('================================\n');

console.log(`Total imports found: ${foundImports.size}`);
console.log(`Missing packages: ${missingPackages.size + missingScopedPackages.size}`);

if (missingPackages.size === 0 && missingScopedPackages.size === 0) {
  console.log('\n✅ All dependencies are installed!');
  console.log('🚀 Ready to build and deploy!\n');
} else {
  console.log('\n⚠️  Some packages may be missing');
  console.log('\n💡 To install missing packages:');
  if (missingPackages.size > 0) {
    const packagesToInstall = Array.from(missingPackages).join(' ');
    console.log(`   npm install ${packagesToInstall}`);
  }
  if (missingScopedPackages.size > 0) {
    const scopedToInstall = Array.from(missingScopedPackages).join(' ');
    console.log(`   npm install ${scopedToInstall}`);
  }
  console.log('');
}
