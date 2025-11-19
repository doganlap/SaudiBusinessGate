#!/usr/bin/env node
/**
 * Find Missing Pages - Detailed Analysis
 * Identifies specific pages in navigation that are not exported
 */

import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();

// Read files
const sidebarPath = path.join(projectRoot, 'apps/web/src/components/layout/Sidebar.jsx');
const multiNavPath = path.join(projectRoot, 'apps/web/src/components/layout/MultiTenantNavigation.jsx');
const pagesIndexPath = path.join(projectRoot, 'apps/web/src/pages/index.js');

// Extract navigation items with their names and paths
function extractNavItems(content) {
  const items = [];
  // Match navigation items with id, name, and path
  const itemRegex = /\{\s*id:\s*['"`]([^'"`]+)['"`]\s*,\s*name:\s*['"`]([^'"`]+)['"`]\s*,\s*path:\s*['"`]([^'"`]+)['"`]/g;
  let match;
  while ((match = itemRegex.exec(content)) !== null) {
    items.push({
      id: match[1],
      name: match[2],
      path: match[3]
    });
  }
  return items;
}

// Extract exported page names
function extractExportedPageNames(content) {
  const exports = new Set();
  // Match export statements
  const exportRegex = /export\s+(?:{\s*default\s+as\s+(\w+)|default\s+as\s+(\w+)|{\s*default\s+as\s+(\w+)})\s+from/g;
  let match;
  while ((match = exportRegex.exec(content)) !== null) {
    const name = match[1] || match[2] || match[3];
    if (name) exports.add(name);
  }
  
  // Also match: export { default as Name } from
  const exportDefaultRegex = /export\s*{\s*default\s+as\s+(\w+)\s*}\s+from/g;
  while ((match = exportDefaultRegex.exec(content)) !== null) {
    exports.add(match[1]);
  }
  
  return exports;
}

// Map path to expected page name
function pathToPageName(navPath) {
  // Remove /app prefix
  let cleanPath = navPath.replace(/^\/app\//, '').replace(/^\//, '');
  
  // Handle dynamic routes
  cleanPath = cleanPath.replace(/\/:[^/]+/g, '');
  
  // Convert path segments to PascalCase
  const parts = cleanPath.split('/').filter(p => p);
  if (parts.length === 0) return 'Dashboard';
  
  // Map common paths to page names
  const pathMap = {
    'dashboard': 'Dashboard',
    'dashboard/legacy': 'Dashboard',
    'dashboard/advanced': 'AdvancedGRCDashboard',
    'dashboard/tenant': 'TenantDashboard',
    'dashboard/regulatory-market': 'RegulatoryMarketDashboard',
    'frameworks': 'FrameworksPage',
    'assessments': 'AssessmentsModuleEnhanced',
    'risks': 'RiskManagementModuleEnhanced',
    'controls': 'ControlsModuleEnhanced',
    'compliance': 'ComplianceTrackingModuleEnhanced',
    'organizations': 'OrganizationsPage',
    'users': 'UserManagementPage',
    'reports': 'ReportsPage',
    'settings': 'SettingsPage',
    'workflows': 'WorkflowManagementPage',
    'notifications': 'NotificationManagementPage',
    'audit-logs': 'AuditLogsPage',
    'onboarding': 'OnboardingPage',
    'tasks': 'TaskManagementPage',
    'gaps': 'GapAnalysisPage',
    'remediation': 'RemediationPlanPage',
    'evidence': 'Evidence',
    'documents': 'DocumentManagementPage',
    'regulatory': 'RegulatoryIntelligencePage',
    'regulators': 'RegulatorsPage',
    'partners': 'PartnerManagementPage',
    'licenses': 'LicensesManagementPage',
    'renewals': 'RenewalsPipelinePage',
    'usage': 'UsageDashboardPage',
    'upgrade': 'UpgradePage',
    'auto-assessment': 'AutoAssessmentGeneratorPage',
    'advanced': 'AdvancedGRCDashboard',
    'ai': 'AISchedulerPage',
    'rag': 'RAGServicePage',
    'database': 'DatabasePage',
    'api-management': 'APIManagementPage',
    'performance': 'PerformanceMonitorPage',
    'mission-control': 'MissionControlPage',
    'ksa-grc': 'KSAGRCPage',
    'sector-intelligence': 'SectorIntelligence',
    'regulatory-intelligence': 'RegulatoryIntelligencePage',
    'components-demo': 'ComponentsDemo',
    'modern-components-demo': 'ModernComponentsDemo',
    'landing': 'LandingPage',
    'demo': 'DemoLanding',
  };
  
  if (pathMap[cleanPath]) {
    return pathMap[cleanPath];
  }
  
  // Fallback: convert to PascalCase
  return parts.map(p => 
    p.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join('')
  ).join('') + 'Page';
}

try {
  // Read files
  const sidebarContent = fs.readFileSync(sidebarPath, 'utf8');
  const multiNavContent = fs.readFileSync(multiNavPath, 'utf8');
  const pagesIndexContent = fs.readFileSync(pagesIndexPath, 'utf8');
  
  // Extract data
  const sidebarItems = extractNavItems(sidebarContent);
  const multiNavItems = extractNavItems(multiNavContent);
  const allNavItems = [...sidebarItems, ...multiNavItems];
  
  // Remove duplicates by id
  const uniqueNavItems = Array.from(
    new Map(allNavItems.map(item => [item.id, item])).values()
  );
  
  const exportedPages = extractExportedPageNames(pagesIndexContent);
  
  console.log('\n🔍 FINDING MISSING PAGES\n');
  console.log('='.repeat(70));
  
  // Find missing pages
  const missingPages = [];
  
  for (const navItem of uniqueNavItems) {
    const expectedPageName = pathToPageName(navItem.path);
    const pathSegments = navItem.path.split('/').filter(p => p && !p.startsWith(':'));
    const lastSegment = pathSegments[pathSegments.length - 1] || 'dashboard';
    
    // Check multiple possible names
    const possibleNames = [
      expectedPageName,
      navItem.name.replace(/\s+/g, '') + 'Page',
      navItem.name.replace(/\s+/g, ''),
      lastSegment.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('') + 'Page',
      lastSegment.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(''),
    ];
    
    const found = possibleNames.some(name => exportedPages.has(name));
    
    if (!found && navItem.path.startsWith('/app/')) {
      missingPages.push({
        name: navItem.name,
        path: navItem.path,
        id: navItem.id,
        expectedName: expectedPageName
      });
    }
  }
  
  console.log(`\n📊 Analysis Results:\n`);
  console.log(`   Total Navigation Items: ${uniqueNavItems.length}`);
  console.log(`   Exported Pages: ${exportedPages.size}`);
  console.log(`   Missing Pages: ${missingPages.length}\n`);
  
  if (missingPages.length > 0) {
    console.log('⚠️  MISSING PAGES (Not Exported):\n');
    console.log('='.repeat(70));
    
    missingPages.forEach((page, index) => {
      console.log(`\n${index + 1}. ${page.name}`);
      console.log(`   Path: ${page.path}`);
      console.log(`   ID: ${page.id}`);
      console.log(`   Expected Export: ${page.expectedName}`);
    });
    
    console.log('\n' + '='.repeat(70));
    console.log(`\n📋 Summary: ${missingPages.length} pages need to be exported\n`);
  } else {
    console.log('✅ All navigation items have corresponding exports!\n');
  }
  
  // Also show some exported pages for reference
  console.log('\n📦 Sample Exported Pages (for reference):');
  const exportedArray = Array.from(exportedPages).slice(0, 10);
  exportedArray.forEach((name, i) => {
    console.log(`   ${i + 1}. ${name}`);
  });
  if (exportedPages.size > 10) {
    console.log(`   ... and ${exportedPages.size - 10} more`);
  }
  
  console.log('\n' + '='.repeat(70) + '\n');
  
} catch (error) {
  console.error('Error finding missing pages:', error.message);
  console.error(error.stack);
  process.exit(1);
}

