#!/usr/bin/env node
/**
 * Analyze Page Registration Status
 * Counts pages in navigation, exported pages, registered routes, and actual files
 */

import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();

// Read files
const sidebarPath = path.join(projectRoot, 'apps/web/src/components/layout/Sidebar.jsx');
const multiNavPath = path.join(projectRoot, 'apps/web/src/components/layout/MultiTenantNavigation.jsx');
const pagesIndexPath = path.join(projectRoot, 'apps/web/src/pages/index.js');
const appJsxPath = path.join(projectRoot, 'apps/web/src/App.jsx');
const pagesDir = path.join(projectRoot, 'apps/web/src/pages');

// Extract navigation paths
function extractNavPaths(content) {
  const paths = new Set();
  const pathRegex = /path:\s*['"`]([^'"`]+)['"`]/g;
  let match;
  while ((match = pathRegex.exec(content)) !== null) {
    paths.add(match[1]);
  }
  return paths;
}

// Extract exported pages
function extractExportedPages(content) {
  const exports = new Set();
  const exportRegex = /export\s+.*?\s+from\s+['"`]([^'"`]+)['"`]/g;
  let match;
  while ((match = exportRegex.exec(content)) !== null) {
    const filePath = match[1];
    // Extract page name from path
    const parts = filePath.split('/');
    const fileName = parts[parts.length - 1].replace('.jsx', '').replace('.tsx', '');
    exports.add(fileName);
  }
  return exports;
}

// Extract route paths
function extractRoutePaths(content) {
  const paths = new Set();
  const routeRegex = /<Route\s+path=["']([^"']+)["']/g;
  let match;
  while ((match = routeRegex.exec(content)) !== null) {
    paths.add(match[1]);
  }
  return paths;
}

// Get all page files
function getAllPageFiles(dir) {
  const files = [];
  function walkDir(currentPath) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        walkDir(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith('.jsx') || entry.name.endsWith('.tsx'))) {
        const relativePath = path.relative(dir, fullPath);
        files.push(relativePath);
      }
    }
  }
  walkDir(dir);
  return files;
}

try {
  // Read files
  const sidebarContent = fs.readFileSync(sidebarPath, 'utf8');
  const multiNavContent = fs.readFileSync(multiNavPath, 'utf8');
  const pagesIndexContent = fs.readFileSync(pagesIndexPath, 'utf8');
  const appJsxContent = fs.readFileSync(appJsxPath, 'utf8');
  
  // Extract data
  const sidebarPaths = extractNavPaths(sidebarContent);
  const multiNavPaths = extractNavPaths(multiNavContent);
  const allNavPaths = new Set([...sidebarPaths, ...multiNavPaths]);
  
  const exportedPages = extractExportedPages(pagesIndexContent);
  const routePaths = extractRoutePaths(appJsxContent);
  const pageFiles = getAllPageFiles(pagesDir);
  
  // Count unique navigation items
  const navItemsCount = allNavPaths.size;
  
  // Count exports
  const exportedCount = exportedPages.size;
  
  // Count routes
  const routesCount = routePaths.size;
  
  // Count actual page files
  const pageFilesCount = pageFiles.length;
  
  // Find pages in navigation but not exported
  const navPathsArray = Array.from(allNavPaths);
  const exportedArray = Array.from(exportedPages);
  
  // Simple comparison (this is approximate)
  const missingFromExports = navPathsArray.filter(path => {
    // Check if any exported page matches this path
    return !exportedArray.some(exp => path.includes(exp.toLowerCase()) || exp.toLowerCase().includes(path.split('/').pop()));
  });
  
  console.log('\n📊 PAGE REGISTRATION ANALYSIS\n');
  console.log('='.repeat(60));
  console.log(`\n✅ Pages in Navigation (Sidebar + MultiTenant): ${navItemsCount}`);
  console.log(`   - Sidebar.jsx: ${sidebarPaths.size} paths`);
  console.log(`   - MultiTenantNavigation.jsx: ${multiNavPaths.size} paths`);
  console.log(`   - Unique total: ${navItemsCount}`);
  
  console.log(`\n✅ Pages Exported (pages/index.js): ${exportedCount}`);
  
  console.log(`\n✅ Routes Registered (App.jsx): ${routesCount}`);
  
  console.log(`\n✅ Actual Page Files: ${pageFilesCount}`);
  
  console.log(`\n📋 Summary:`);
  console.log(`   - Navigation Items: ${navItemsCount}`);
  console.log(`   - Exported Pages: ${exportedCount}`);
  console.log(`   - Registered Routes: ${routesCount}`);
  console.log(`   - Page Files: ${pageFilesCount}`);
  
  // Calculate coverage
  const navCoverage = ((exportedCount / navItemsCount) * 100).toFixed(1);
  const routeCoverage = ((exportedCount / routesCount) * 100).toFixed(1);
  
  console.log(`\n📈 Coverage:`);
  console.log(`   - Navigation → Exports: ${navCoverage}%`);
  console.log(`   - Routes → Exports: ${routeCoverage}%`);
  
  // Estimate missing
  const estimatedMissing = Math.max(0, navItemsCount - exportedCount);
  
  console.log(`\n⚠️  Estimated Missing from Exports: ~${estimatedMissing} pages`);
  
  console.log('\n' + '='.repeat(60));
  console.log('\n✅ Analysis Complete!\n');
  
} catch (error) {
  console.error('Error analyzing pages:', error.message);
  process.exit(1);
}

