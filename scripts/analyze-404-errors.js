#!/usr/bin/env node
/**
 * Analyze 404 Errors in API Routes
 * Identifies legitimate vs problematic 404 responses
 */

import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();
const apiDir = path.join(projectRoot, 'app/api');

// Patterns that indicate legitimate 404s
const legitimate404Patterns = [
  /not found/i,
  /does not exist/i,
  /not exist/i,
  /missing/i,
  /invalid.*id/i,
];

// Patterns that indicate problematic 404s (should be other status codes)
const problematic404Patterns = [
  /table not found/i,
  /database.*not found/i,
  /migration/i,
  /schema/i,
];

function getAllRouteFiles(dir) {
  const files = [];
  function walkDir(currentPath) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        walkDir(fullPath);
      } else if (entry.isFile() && entry.name === 'route.ts') {
        files.push(fullPath);
      }
    }
  }
  walkDir(dir);
  return files;
}

function analyze404Errors() {
  const routeFiles = getAllRouteFiles(apiDir);
  const results = {
    total: 0,
    legitimate: [],
    problematic: [],
    files: new Set(),
  };

  console.log('\n🔍 Analyzing 404 Errors in API Routes\n');
  console.log('='.repeat(70));

  for (const file of routeFiles) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Check for 404 status codes
        if (line.includes('status: 404') || line.includes('status:404') || line.match(/status.*404/)) {
          results.total++;
          results.files.add(file);
          
          // Get context (previous 5 lines)
          const contextStart = Math.max(0, i - 5);
          const contextEnd = Math.min(lines.length, i + 2);
          const context = lines.slice(contextStart, contextEnd).join('\n');
          
          const isProblematic = problematic404Patterns.some(pattern => 
            context.match(pattern)
          );
          
          const isLegitimate = legitimate404Patterns.some(pattern => 
            context.match(pattern)
          );
          
          const relativePath = path.relative(projectRoot, file);
          
          if (isProblematic) {
            results.problematic.push({
              file: relativePath,
              line: i + 1,
              context: lines[i].trim(),
            });
          } else if (isLegitimate) {
            results.legitimate.push({
              file: relativePath,
              line: i + 1,
              context: lines[i].trim(),
            });
          } else {
            // Unknown - needs review
            results.problematic.push({
              file: relativePath,
              line: i + 1,
              context: lines[i].trim(),
              note: 'Needs review - unclear if legitimate',
            });
          }
        }
      }
    } catch (error) {
      console.error(`Error reading ${file}:`, error.message);
    }
  }

  console.log(`\n📊 SUMMARY:\n`);
  console.log(`   Total 404 Errors: ${results.total}`);
  console.log(`   Legitimate 404s: ${results.legitimate.length} ✅`);
  console.log(`   Problematic 404s: ${results.problematic.length} ⚠️`);
  console.log(`   Files with 404s: ${results.files.size}\n`);

  if (results.legitimate.length > 0) {
    console.log('✅ LEGITIMATE 404 ERRORS (Resource Not Found):\n');
    results.legitimate.slice(0, 10).forEach((item, index) => {
      console.log(`${index + 1}. ${item.file}:${item.line}`);
      console.log(`   ${item.context}\n`);
    });
    if (results.legitimate.length > 10) {
      console.log(`... and ${results.legitimate.length - 10} more legitimate 404s\n`);
    }
  }

  if (results.problematic.length > 0) {
    console.log('⚠️  PROBLEMATIC 404 ERRORS (Should be reviewed):\n');
    results.problematic.forEach((item, index) => {
      console.log(`${index + 1}. ${item.file}:${item.line}`);
      console.log(`   ${item.context}`);
      if (item.note) {
        console.log(`   ⚠️  ${item.note}`);
      }
      console.log('');
    });
  }

  console.log('='.repeat(70));
  console.log('\n✅ Analysis Complete!\n');

  // Save report
  const reportPath = path.join(projectRoot, '404_ERRORS_ANALYSIS.md');
  let report = '# 404 Errors Analysis\n\n';
  report += `**Date:** ${new Date().toISOString().split('T')[0]}\n\n`;
  report += `## Summary\n\n`;
  report += `- **Total 404 Errors:** ${results.total}\n`;
  report += `- **Legitimate 404s:** ${results.legitimate.length} ✅\n`;
  report += `- **Problematic 404s:** ${results.problematic.length} ⚠️\n`;
  report += `- **Files with 404s:** ${results.files.size}\n\n`;
  
  report += `## Legitimate 404 Errors (Resource Not Found)\n\n`;
  report += `These are correct - they indicate a requested resource doesn't exist.\n\n`;
  results.legitimate.forEach((item, index) => {
    report += `${index + 1}. **${item.file}** (line ${item.line})\n`;
    report += `   \`${item.context}\`\n\n`;
  });
  
  report += `## Problematic 404 Errors (Needs Review)\n\n`;
  report += `These may need to be changed to other status codes (e.g., 503 for database issues).\n\n`;
  results.problematic.forEach((item, index) => {
    report += `${index + 1}. **${item.file}** (line ${item.line})\n`;
    report += `   \`${item.context}\`\n`;
    if (item.note) {
      report += `   ⚠️  ${item.note}\n`;
    }
    report += `\n`;
  });
  
  fs.writeFileSync(reportPath, report);
  console.log(`📄 Detailed report saved to: 404_ERRORS_ANALYSIS.md\n`);

  return results;
}

try {
  analyze404Errors();
} catch (error) {
  console.error('Error analyzing 404 errors:', error);
  process.exit(1);
}

