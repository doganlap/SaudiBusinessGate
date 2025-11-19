#!/usr/bin/env node
/**
 * Find All Mock Data - Detailed Analysis
 * Identifies all pages with mock data and fallback mocks for removal
 */

import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();
const pagesDir = path.join(projectRoot, 'apps/web/src/pages');

// Extended mock keywords
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
  'fallback',
  'Fallback',
  'FALLBACK',
  'defaultData',
  'default data',
  'emptyData',
  'empty data',
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
        files.push({ fullPath, relativePath });
      }
    }
  }
  walkDir(dir);
  return files;
}

// Find mock data in file
function findMockData(content, filePath) {
  const lines = content.split('\n');
  const mockLocations = [];
  
  lines.forEach((line, index) => {
    const lowerLine = line.toLowerCase();
    mockKeywords.forEach(keyword => {
      if (lowerLine.includes(keyword.toLowerCase())) {
        // Check if it's not in a comment explaining something else
        if (!lowerLine.includes('// remove mock') && 
            !lowerLine.includes('// no mock') &&
            !lowerLine.includes('// mock removed')) {
          mockLocations.push({
            line: index + 1,
            content: line.trim(),
            keyword: keyword
          });
        }
      }
    });
  });
  
  return mockLocations;
}

// Count mock occurrences
function countMockOccurrences(content) {
  const lowerContent = content.toLowerCase();
  let count = 0;
  const foundKeywords = new Set();
  
  mockKeywords.forEach(keyword => {
    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedKeyword.toLowerCase(), 'gi');
    const matches = lowerContent.match(regex);
    if (matches) {
      count += matches.length;
      foundKeywords.add(keyword);
    }
  });
  
  return { count, keywords: Array.from(foundKeywords) };
}

try {
  const pageFiles = getAllPageFiles(pagesDir);
  
  const results = {
    total: pageFiles.length,
    withMock: [],
    mockOnly: [],
    withFallback: [],
    totalMockOccurrences: 0
  };
  
  console.log('\n🔍 FINDING ALL MOCK DATA FOR REMOVAL\n');
  console.log('='.repeat(70));
  console.log(`\n📁 Analyzing ${pageFiles.length} page files...\n`);
  
  for (const file of pageFiles) {
    try {
      const content = fs.readFileSync(file.fullPath, 'utf8');
      const mockInfo = countMockOccurrences(content);
      const mockLocations = findMockData(content, file.relativePath);
      
      if (mockInfo.count > 0) {
        const hasRest = content.toLowerCase().includes('apiservices') || 
                       content.toLowerCase().includes('fetch') ||
                       content.toLowerCase().includes('usequery');
        
        const pageInfo = {
          file: file.relativePath,
          mockCount: mockInfo.count,
          keywords: mockInfo.keywords,
          locations: mockLocations.slice(0, 5), // First 5 locations
          hasRest: hasRest,
          needsReplacement: hasRest // Can be replaced with REST
        };
        
        results.withMock.push(pageInfo);
        results.totalMockOccurrences += mockInfo.count;
        
        if (!hasRest) {
          results.mockOnly.push(pageInfo);
        }
        
        // Check for fallback patterns
        if (content.toLowerCase().includes('fallback') || 
            content.toLowerCase().includes('defaultdata') ||
            content.toLowerCase().includes('emptydata')) {
          results.withFallback.push(pageInfo);
        }
      }
    } catch (error) {
      console.error(`Error reading ${file.relativePath}:`, error.message);
    }
  }
  
  // Sort by mock count (descending)
  results.withMock.sort((a, b) => b.mockCount - a.mockCount);
  results.mockOnly.sort((a, b) => b.mockCount - a.mockCount);
  results.withFallback.sort((a, b) => b.mockCount - a.mockCount);
  
  console.log('📊 SUMMARY:\n');
  console.log(`   📁 Total Pages: ${results.total}`);
  console.log(`   🎭 Pages with Mock Data: ${results.withMock.length}`);
  console.log(`   ⚠️  Pages with Mock Only (No REST): ${results.mockOnly.length}`);
  console.log(`   🔄 Pages with Fallback Mock: ${results.withFallback.length}`);
  console.log(`   📊 Total Mock Occurrences: ${results.totalMockOccurrences}\n`);
  
  console.log('='.repeat(70));
  console.log('\n🎯 PAGES WITH MOCK DATA (Priority Order):\n');
  
  results.withMock.forEach((page, index) => {
    console.log(`\n${index + 1}. ${page.file}`);
    console.log(`   Mock Count: ${page.mockCount}`);
    console.log(`   Keywords: ${page.keywords.join(', ')}`);
    console.log(`   Has REST: ${page.hasRest ? '✅ Yes' : '❌ No'}`);
    console.log(`   Can Replace: ${page.needsReplacement ? '✅ Yes' : '⚠️  Needs REST Service'}`);
    if (page.locations.length > 0) {
      console.log(`   Sample Locations:`);
      page.locations.forEach(loc => {
        console.log(`      Line ${loc.line}: ${loc.content.substring(0, 60)}...`);
      });
    }
  });
  
  console.log('\n' + '='.repeat(70));
  console.log('\n⚠️  PAGES WITH MOCK ONLY (Need REST Service First):\n');
  
  if (results.mockOnly.length > 0) {
    results.mockOnly.forEach((page, index) => {
      console.log(`${index + 1}. ${page.file} (${page.mockCount} mock occurrences)`);
    });
  } else {
    console.log('✅ All pages with mock data also have REST services!');
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('\n🔄 PAGES WITH FALLBACK MOCK:\n');
  
  if (results.withFallback.length > 0) {
    results.withFallback.forEach((page, index) => {
      console.log(`${index + 1}. ${page.file} (${page.mockCount} mock occurrences)`);
    });
  } else {
    console.log('✅ No pages with fallback mock patterns found!');
  }
  
  // Save detailed report
  const reportPath = path.join(projectRoot, 'MOCK_DATA_REMOVAL_PLAN.md');
  let report = '# Mock Data Removal Plan - Zero Mock Zero Fallback\n\n';
  report += `**Date:** ${new Date().toISOString().split('T')[0]}\n\n`;
  report += `## Summary\n\n`;
  report += `- **Total Pages:** ${results.total}\n`;
  report += `- **Pages with Mock Data:** ${results.withMock.length}\n`;
  report += `- **Pages with Mock Only:** ${results.mockOnly.length}\n`;
  report += `- **Pages with Fallback Mock:** ${results.withFallback.length}\n`;
  report += `- **Total Mock Occurrences:** ${results.totalMockOccurrences}\n\n`;
  
  report += `## Action Plan\n\n`;
  report += `### Phase 1: Pages with REST Services (Can Remove Mock Immediately)\n\n`;
  results.withMock.filter(p => p.hasRest).forEach((page, index) => {
    report += `${index + 1}. **${page.file}**\n`;
    report += `   - Mock Count: ${page.mockCount}\n`;
    report += `   - Keywords: ${page.keywords.join(', ')}\n`;
    report += `   - Action: Remove mock data, use REST service only\n`;
    report += `   - Error Handling: Use proper error states instead of fallback\n\n`;
  });
  
  report += `### Phase 2: Pages Needing REST Services First\n\n`;
  results.mockOnly.forEach((page, index) => {
    report += `${index + 1}. **${page.file}**\n`;
    report += `   - Mock Count: ${page.mockCount}\n`;
    report += `   - Action: Implement REST service first, then remove mock\n\n`;
  });
  
  report += `### Phase 3: Remove Fallback Patterns\n\n`;
  results.withFallback.forEach((page, index) => {
    report += `${index + 1}. **${page.file}**\n`;
    report += `   - Action: Replace fallback mock with proper error handling\n\n`;
  });
  
  fs.writeFileSync(reportPath, report);
  console.log(`\n📄 Detailed removal plan saved to: MOCK_DATA_REMOVAL_PLAN.md\n`);
  
  console.log('='.repeat(70));
  console.log('\n✅ Analysis Complete!\n');
  console.log('🎯 Target: Zero Mock Zero Fallback Mock\n');
  console.log(`📋 Next Steps:`);
  console.log(`   1. Review MOCK_DATA_REMOVAL_PLAN.md`);
  console.log(`   2. Start with pages that have REST services`);
  console.log(`   3. Implement REST services for mock-only pages`);
  console.log(`   4. Replace all fallback patterns with error handling`);
  console.log(`   5. Verify zero mock data remains\n`);
  
} catch (error) {
  console.error('Error analyzing mock data:', error.message);
  console.error(error.stack);
  process.exit(1);
}

