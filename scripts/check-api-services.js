#!/usr/bin/env node
/**
 * Check API Services Implementation
 * Identifies pages that need real API services
 */

import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();
const pagesDir = path.join(projectRoot, 'apps/web/src/pages');

// REST service indicators
const restServiceIndicators = [
  'apiServices',
  'apiService',
  'useApiData',
  'fetch(',
  'axios',
  'useQuery',
  'useMutation',
  '@tanstack/react-query',
  'apiClient',
  '/api/',
  'getData',
  'loadData',
  'fetchData',
  // Custom API services
  'licensesApi',
  'renewalsApi',
  'usageApi',
  'translationApi',
  'analyticsApi',
  'regulatorsApi',
  'workflowsApi',
  'partnersApi',
  'auditLogsApi',
  'emailService',
  'Api.get',
  'Api.post',
  'Api.put',
  'Api.delete',
];

// Mock data indicators (should not exist)
const mockIndicators = [
  'mockData',
  'const mock',
  'const sample',
  'const dummy',
  'const fake',
  'const testData',
  'fallbackData',
  'const fallback = [',
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

// Check if file has REST services
function hasRestService(content) {
  const lowerContent = content.toLowerCase();
  return restServiceIndicators.some(indicator => 
    lowerContent.includes(indicator.toLowerCase())
  );
}

// Check if file has mock data
function hasMockData(content) {
  const lowerContent = content.toLowerCase();
  return mockIndicators.some(indicator => 
    lowerContent.includes(indicator.toLowerCase())
  );
}

// Check if file has data loading (useState with data)
function hasDataLoading(content) {
  // Check for useState with data arrays/objects
  return /useState\s*\(\s*\[\s*\]\s*\)|useState\s*\(\s*\{\s*\}\)|useState\s*\(\s*null\s*\)/g.test(content);
}

// Check if file has useEffect (likely loading data)
function hasUseEffect(content) {
  return /useEffect\s*\(/g.test(content);
}

try {
  const pageFiles = getAllPageFiles(pagesDir);
  
  const results = {
    total: pageFiles.length,
    withRestService: [],
    withoutRestService: [],
    needsApiService: [],
    staticPages: []
  };
  
  console.log('\n🔍 CHECKING API SERVICES IMPLEMENTATION\n');
  console.log('='.repeat(70));
  console.log(`\n📁 Analyzing ${pageFiles.length} page files...\n`);
  
  for (const file of pageFiles) {
    try {
      const content = fs.readFileSync(file.fullPath, 'utf8');
      const hasRest = hasRestService(content);
      const hasMock = hasMockData(content);
      const hasData = hasDataLoading(content);
      const hasEffect = hasUseEffect(content);
      
      const pageInfo = {
        file: file.relativePath,
        hasRestService: hasRest,
        hasMockData: hasMock,
        hasDataLoading: hasData,
        hasUseEffect: hasEffect,
        needsApiService: !hasRest && (hasData || hasEffect)
      };
      
      if (hasRest) {
        results.withRestService.push(pageInfo);
      } else {
        results.withoutRestService.push(pageInfo);
        
        if (pageInfo.needsApiService) {
          results.needsApiService.push(pageInfo);
        } else {
          results.staticPages.push(pageInfo);
        }
      }
    } catch (error) {
      console.error(`Error reading ${file.relativePath}:`, error.message);
    }
  }
  
  console.log('📊 SUMMARY:\n');
  console.log(`   📁 Total Pages: ${results.total}`);
  console.log(`   ✅ Pages with REST Services: ${results.withRestService.length} (${((results.withRestService.length / results.total) * 100).toFixed(1)}%)`);
  console.log(`   ❌ Pages without REST Services: ${results.withoutRestService.length} (${((results.withoutRestService.length / results.total) * 100).toFixed(1)}%)`);
  console.log(`   ⚠️  Pages Needing API Services: ${results.needsApiService.length} (${((results.needsApiService.length / results.total) * 100).toFixed(1)}%)`);
  console.log(`   📄 Static/UI Pages: ${results.staticPages.length} (${((results.staticPages.length / results.total) * 100).toFixed(1)}%)\n`);
  
  console.log('='.repeat(70));
  
  if (results.needsApiService.length > 0) {
    console.log('\n⚠️  PAGES NEEDING API SERVICES:\n');
    results.needsApiService.forEach((page, index) => {
      console.log(`${index + 1}. ${page.file}`);
      console.log(`   - Has data loading: ${page.hasDataLoading ? '✅' : '❌'}`);
      console.log(`   - Has useEffect: ${page.hasUseEffect ? '✅' : '❌'}`);
      console.log(`   - Needs REST service: ✅\n`);
    });
  }
  
  console.log('='.repeat(70));
  console.log('\n📄 Static/UI Pages (No API needed):\n');
  results.staticPages.slice(0, 10).forEach((page, index) => {
    console.log(`${index + 1}. ${page.file}`);
  });
  if (results.staticPages.length > 10) {
    console.log(`... and ${results.staticPages.length - 10} more`);
  }
  
  // Save detailed report
  const reportPath = path.join(projectRoot, 'API_SERVICES_NEEDED.md');
  let report = '# API Services Implementation Status\n\n';
  report += `**Date:** ${new Date().toISOString().split('T')[0]}\n\n`;
  report += `## Summary\n\n`;
  report += `- **Total Pages:** ${results.total}\n`;
  report += `- **With REST Services:** ${results.withRestService.length} (${((results.withRestService.length / results.total) * 100).toFixed(1)}%)\n`;
  report += `- **Without REST Services:** ${results.withoutRestService.length} (${((results.withoutRestService.length / results.total) * 100).toFixed(1)}%)\n`;
  report += `- **Needing API Services:** ${results.needsApiService.length} (${((results.needsApiService.length / results.total) * 100).toFixed(1)}%)\n`;
  report += `- **Static/UI Pages:** ${results.staticPages.length} (${((results.staticPages.length / results.total) * 100).toFixed(1)}%)\n\n`;
  
  report += `## Pages Needing API Services\n\n`;
  results.needsApiService.forEach((page, index) => {
    report += `${index + 1}. **${page.file}**\n`;
    report += `   - Has data loading: ${page.hasDataLoading}\n`;
    report += `   - Has useEffect: ${page.hasUseEffect}\n`;
    report += `   - Action: Implement REST API service\n\n`;
  });
  
  report += `## Static/UI Pages (No API Needed)\n\n`;
  results.staticPages.forEach((page, index) => {
    report += `${index + 1}. ${page.file}\n`;
  });
  
  fs.writeFileSync(reportPath, report);
  console.log(`\n📄 Detailed report saved to: API_SERVICES_NEEDED.md\n`);
  
  console.log('='.repeat(70));
  console.log('\n✅ Analysis Complete!\n');
  
} catch (error) {
  console.error('Error analyzing API services:', error.message);
  console.error(error.stack);
  process.exit(1);
}

