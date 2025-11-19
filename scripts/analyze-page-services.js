#!/usr/bin/env node
/**
 * Analyze Page Services - REST vs Mock
 * Counts pages that use REST services vs mock data
 */

import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();
const pagesDir = path.join(projectRoot, 'apps/web/src/pages');

// Keywords for REST services
const restServiceKeywords = [
  'apiServices',
  'api/',
  'fetch',
  'axios',
  'useQuery',
  'useMutation',
  'react-query',
  '@tanstack/react-query',
  'apiServices.',
  'http://',
  'https://',
  'POST',
  'GET',
  'PUT',
  'DELETE',
  'PATCH',
  '/api/',
  'apiClient',
  'apiService',
  'fetchData',
  'loadData',
  'getData',
  'createData',
  'updateData',
  'deleteData',
];

// Keywords for mock data
const mockKeywords = [
  'mockData',
  'mock',
  'MOCK',
  'fakeData',
  'fake',
  'sampleData',
  'sample',
  'dummyData',
  'dummy',
  'testData',
  'hardcoded',
  'hard-coded',
  'staticData',
  'static data',
  'fallbackData',
  'fallback data',
  'demoData',
  'demo data',
  'placeholder',
  '// Mock',
  '// TODO:',
  '// FIXME:',
  'useState([{',
  'const data = [',
  'const items = [',
  'const mock',
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
        const relativePath = path.relative(dir, fullPath);
        files.push(fullPath);
      }
    }
  }
  walkDir(dir);
  return files;
}

// Analyze a file for REST services
function hasRestService(content) {
  const lowerContent = content.toLowerCase();
  return restServiceKeywords.some(keyword => 
    lowerContent.includes(keyword.toLowerCase())
  );
}

// Analyze a file for mock data
function hasMockData(content) {
  const lowerContent = content.toLowerCase();
  return mockKeywords.some(keyword => 
    lowerContent.includes(keyword.toLowerCase())
  );
}

// Count occurrences
function countOccurrences(content, keywords) {
  const lowerContent = content.toLowerCase();
  let count = 0;
  keywords.forEach(keyword => {
    // Escape special regex characters
    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedKeyword.toLowerCase(), 'gi');
    const matches = lowerContent.match(regex);
    if (matches) count += matches.length;
  });
  return count;
}

try {
  const pageFiles = getAllPageFiles(pagesDir);
  
  const results = {
    total: pageFiles.length,
    withRestService: 0,
    withMockData: 0,
    withBoth: 0,
    withNeither: 0,
    pages: []
  };
  
  console.log('\n🔍 ANALYZING PAGE SERVICES (REST vs MOCK)\n');
  console.log('='.repeat(70));
  console.log(`\n📁 Total Page Files: ${pageFiles.length}\n`);
  
  for (const filePath of pageFiles) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const fileName = path.relative(pagesDir, filePath);
      
      const hasRest = hasRestService(content);
      const hasMock = hasMockData(content);
      
      const restCount = countOccurrences(content, restServiceKeywords);
      const mockCount = countOccurrences(content, mockKeywords);
      
      if (hasRest) results.withRestService++;
      if (hasMock) results.withMockData++;
      if (hasRest && hasMock) results.withBoth++;
      if (!hasRest && !hasMock) results.withNeither++;
      
      results.pages.push({
        file: fileName,
        hasRest,
        hasMock,
        restCount,
        mockCount,
        both: hasRest && hasMock
      });
    } catch (error) {
      console.error(`Error reading ${filePath}:`, error.message);
    }
  }
  
  // Sort by REST service usage
  results.pages.sort((a, b) => {
    if (a.hasRest && !b.hasRest) return -1;
    if (!a.hasRest && b.hasRest) return 1;
    return b.restCount - a.restCount;
  });
  
  console.log('📊 SUMMARY:\n');
  console.log(`   ✅ Pages with REST Services: ${results.withRestService} (${((results.withRestService / results.total) * 100).toFixed(1)}%)`);
  console.log(`   🎭 Pages with Mock Data: ${results.withMockData} (${((results.withMockData / results.total) * 100).toFixed(1)}%)`);
  console.log(`   🔄 Pages with Both: ${results.withBoth} (${((results.withBoth / results.total) * 100).toFixed(1)}%)`);
  console.log(`   ⚪ Pages with Neither: ${results.withNeither} (${((results.withNeither / results.total) * 100).toFixed(1)}%)`);
  
  console.log('\n' + '='.repeat(70));
  console.log('\n📋 DETAILED BREAKDOWN:\n');
  
  // Pages with REST services only
  const restOnly = results.pages.filter(p => p.hasRest && !p.hasMock);
  console.log(`\n✅ REST Services Only (${restOnly.length} pages):`);
  restOnly.slice(0, 10).forEach((page, i) => {
    console.log(`   ${i + 1}. ${page.file} (${page.restCount} REST calls)`);
  });
  if (restOnly.length > 10) {
    console.log(`   ... and ${restOnly.length - 10} more`);
  }
  
  // Pages with Mock data only
  const mockOnly = results.pages.filter(p => p.hasMock && !p.hasRest);
  console.log(`\n🎭 Mock Data Only (${mockOnly.length} pages):`);
  mockOnly.slice(0, 10).forEach((page, i) => {
    console.log(`   ${i + 1}. ${page.file} (${page.mockCount} mock references)`);
  });
  if (mockOnly.length > 10) {
    console.log(`   ... and ${mockOnly.length - 10} more`);
  }
  
  // Pages with both
  const both = results.pages.filter(p => p.hasRest && p.hasMock);
  console.log(`\n🔄 Both REST & Mock (${both.length} pages):`);
  both.slice(0, 10).forEach((page, i) => {
    console.log(`   ${i + 1}. ${page.file} (${page.restCount} REST, ${page.mockCount} mock)`);
  });
  if (both.length > 10) {
    console.log(`   ... and ${both.length - 10} more`);
  }
  
  // Pages with neither
  const neither = results.pages.filter(p => !p.hasRest && !p.hasMock);
  console.log(`\n⚪ Neither (${neither.length} pages):`);
  neither.slice(0, 10).forEach((page, i) => {
    console.log(`   ${i + 1}. ${page.file}`);
  });
  if (neither.length > 10) {
    console.log(`   ... and ${neither.length - 10} more`);
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('\n✅ Analysis Complete!\n');
  
  // Save detailed results
  const reportPath = path.join(projectRoot, 'PAGE_SERVICES_ANALYSIS.md');
  let report = '# Page Services Analysis - REST vs Mock\n\n';
  report += `**Date:** ${new Date().toISOString().split('T')[0]}\n\n`;
  report += `## Summary\n\n`;
  report += `- **Total Pages:** ${results.total}\n`;
  report += `- **With REST Services:** ${results.withRestService} (${((results.withRestService / results.total) * 100).toFixed(1)}%)\n`;
  report += `- **With Mock Data:** ${results.withMockData} (${((results.withMockData / results.total) * 100).toFixed(1)}%)\n`;
  report += `- **With Both:** ${results.withBoth} (${((results.withBoth / results.total) * 100).toFixed(1)}%)\n`;
  report += `- **With Neither:** ${results.withNeither} (${((results.withNeither / results.total) * 100).toFixed(1)}%)\n\n`;
  
  report += `## Pages with REST Services Only\n\n`;
  restOnly.forEach(page => {
    report += `- ${page.file} (${page.restCount} REST calls)\n`;
  });
  
  report += `\n## Pages with Mock Data Only\n\n`;
  mockOnly.forEach(page => {
    report += `- ${page.file} (${page.mockCount} mock references)\n`;
  });
  
  report += `\n## Pages with Both\n\n`;
  both.forEach(page => {
    report += `- ${page.file} (${page.restCount} REST, ${page.mockCount} mock)\n`;
  });
  
  report += `\n## Pages with Neither\n\n`;
  neither.forEach(page => {
    report += `- ${page.file}\n`;
  });
  
  fs.writeFileSync(reportPath, report);
  console.log(`📄 Detailed report saved to: PAGE_SERVICES_ANALYSIS.md\n`);
  
} catch (error) {
  console.error('Error analyzing pages:', error.message);
  console.error(error.stack);
  process.exit(1);
}

