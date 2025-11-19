#!/usr/bin/env node
/**
 * Remove Mock Data Script
 * Systematically removes mock data patterns from pages
 */

import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();
const pagesDir = path.join(projectRoot, 'apps/web/src/pages');

// Patterns to remove
const mockPatterns = [
  // Mock data arrays
  {
    pattern: /const\s+(mock|sample|dummy|fake|test)Data\s*=\s*\[[\s\S]*?\];/g,
    replacement: '// Mock data removed - use REST service only'
  },
  // Fallback patterns
  {
    pattern: /const\s+fallback\s*=\s*\[[\s\S]*?\];/g,
    replacement: '// Fallback mock removed - use empty state'
  },
  // Mock data assignments in catch blocks
  {
    pattern: /catch\s*\([^)]*\)\s*\{[\s\S]*?const\s+(mock|fallback|sample)\s*=[\s\S]*?set[A-Z]\w+\(mock\);/g,
    replacement: (match) => {
      // Replace with empty state
      const setMatch = match.match(/set\w+\(/);
      if (setMatch) {
        const setter = setMatch[0];
        return match.replace(/const\s+(mock|fallback|sample)\s*=.*?;[\s\S]*?set\w+\(mock\);/g, 
          `// Mock data removed\n      ${setter}[]);`);
      }
      return match;
    }
  }
];

console.log('\n🧹 REMOVING MOCK DATA FROM PAGES\n');
console.log('='.repeat(70));

// This is a helper script - actual removal should be done manually
// to ensure proper error handling is implemented

console.log('\n⚠️  Manual removal required for proper error handling\n');
console.log('Please review MOCK_DATA_REMOVAL_PLAN.md for detailed instructions\n');

