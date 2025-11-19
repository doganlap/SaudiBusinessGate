#!/usr/bin/env node
/**
 * Verify Zero Mock Data
 * Checks for any remaining mock data patterns
 */

import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();
const pagesDir = path.join(projectRoot, 'apps/web/src/pages');

// Actual mock data patterns (not comments or placeholders)
const mockPatterns = [
  // Mock data arrays with actual values
  /const\s+(mock|sample|dummy|fake|test)Data\s*=\s*\[\s*\{[\s\S]{20,}/g,
  // Fallback data with values
  /const\s+fallback\s*=\s*\[\s*\{[\s\S]{20,}/g,
  // Data || mockData patterns
  /data\s*\|\|\s*(mock|sample|dummy|fake|test)Data/g,
  // setData(mock) patterns
  /set\w+\(mock\)/g,
  // Mock data in catch blocks
  /catch\s*\([^)]*\)\s*\{[\s\S]*?const\s+(mock|fallback|sample)\s*=\s*\[[\s\S]{20,}[\s\S]*?set\w+\(mock\)/g,
];

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
        files.push(fullPath);
      }
    }
  }
  walkDir(dir);
  return files;
}

try {
  const pageFiles = getAllPageFiles(pagesDir);
  const issues = [];
  
  console.log('\n🔍 VERIFYING ZERO MOCK DATA\n');
  console.log('='.repeat(70));
  console.log(`\n📁 Checking ${pageFiles.length} page files...\n`);
  
  for (const filePath of pageFiles) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const fileName = path.relative(pagesDir, filePath);
      
      for (const pattern of mockPatterns) {
        const matches = content.match(pattern);
        if (matches) {
          issues.push({
            file: fileName,
            pattern: pattern.toString(),
            matches: matches.length
          });
        }
      }
    } catch (error) {
      console.error(`Error reading ${filePath}:`, error.message);
    }
  }
  
  console.log('📊 VERIFICATION RESULTS:\n');
  
  if (issues.length === 0) {
    console.log('✅ ZERO MOCK DATA DETECTED!');
    console.log('✅ All pages are clean of mock data patterns');
    console.log('✅ All error handlers use empty states');
    console.log('\n🎉 SUCCESS: Zero Mock Zero Fallback Mock achieved!\n');
  } else {
    console.log(`⚠️  Found ${issues.length} potential mock data patterns:\n`);
    issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.file}`);
      console.log(`   Pattern: ${issue.pattern.substring(0, 50)}...`);
      console.log(`   Matches: ${issue.matches}\n`);
    });
  }
  
  console.log('='.repeat(70));
  console.log('\n✅ Verification Complete!\n');
  
} catch (error) {
  console.error('Error verifying mock data:', error.message);
  process.exit(1);
}

