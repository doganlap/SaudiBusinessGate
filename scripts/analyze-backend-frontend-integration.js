import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

console.log('\n🔗 Analyzing Backend-Frontend Integration...\n');

// Get all API routes
function getAPIRoutes() {
  const apiDir = path.join(rootDir, 'app/api');
  const routes = [];
  
  function scanDir(dir, basePath = '') {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        scanDir(filePath, path.join(basePath, file));
      } else if (file === 'route.ts') {
        const routePath = basePath ? `/api/${basePath}` : '/api';
        routes.push({
          path: routePath,
          file: filePath,
          relative: path.relative(rootDir, filePath)
        });
      }
    });
  }
  
  scanDir(apiDir);
  return routes;
}

// Get all frontend pages
function getFrontendPages() {
  const appDir = path.join(rootDir, 'app');
  const pages = [];
  
  function scanDir(dir, basePath = '') {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        // Skip API directory
        if (file !== 'api') {
          scanDir(filePath, path.join(basePath, file));
        }
      } else if (file === 'page.tsx') {
        const pagePath = basePath ? `/${basePath}` : '/';
        pages.push({
          path: pagePath,
          file: filePath,
          relative: path.relative(rootDir, filePath)
        });
      }
    });
  }
  
  scanDir(appDir);
  return pages;
}

// Analyze API usage in frontend pages
function analyzeAPICalls(pageFile) {
  if (!fs.existsSync(pageFile)) return [];
  
  const content = fs.readFileSync(pageFile, 'utf8');
  const apiCalls = [];
  
  // Find fetch calls
  const fetchRegex = /fetch\(['"`]([^'"`]+)['"`]/g;
  let match;
  while ((match = fetchRegex.exec(content)) !== null) {
    const url = match[1];
    if (url.startsWith('/api/') || url.startsWith('api/')) {
      apiCalls.push(url.startsWith('/') ? url : `/${url}`);
    }
  }
  
  // Find axios calls
  const axiosRegex = /(axios|apiServices)\.(get|post|put|delete|patch)\(['"`]([^'"`]+)['"`]/g;
  while ((match = axiosRegex.exec(content)) !== null) {
    const url = match[3];
    if (url.startsWith('/api/') || url.startsWith('api/')) {
      apiCalls.push(url.startsWith('/') ? url : `/${url}`);
    }
  }
  
  return [...new Set(apiCalls)]; // Remove duplicates
}

// Main analysis
const apiRoutes = getAPIRoutes();
const frontendPages = getFrontendPages();

console.log(`📊 Found:`);
console.log(`   API Routes: ${apiRoutes.length}`);
console.log(`   Frontend Pages: ${frontendPages.length}\n`);

// Analyze each page
const pageAnalysis = frontendPages.map(page => {
  const apiCalls = analyzeAPICalls(page.file);
  return {
    page: page.path,
    file: page.relative,
    apiCalls: apiCalls,
    hasAPICalls: apiCalls.length > 0
  };
});

// Categorize pages
const pagesWithAPI = pageAnalysis.filter(p => p.hasAPICalls);
const pagesWithoutAPI = pageAnalysis.filter(p => !p.hasAPICalls);

// Map API routes to modules
const apiModules = {};
apiRoutes.forEach(route => {
  const parts = route.path.split('/').filter(p => p && p !== 'api');
  const module = parts[0] || 'root';
  if (!apiModules[module]) {
    apiModules[module] = [];
  }
  apiModules[module].push(route.path);
});

// Map frontend pages to modules
const pageModules = {};
pageAnalysis.forEach(page => {
  if (!page || !page.path) return;
  const parts = page.path.split('/').filter(p => p && p !== 'lng' && p !== 'platform');
  const module = parts[0] || 'root';
  if (!pageModules[module]) {
    pageModules[module] = [];
  }
  pageModules[module].push({
    path: page.path,
    hasAPI: page.hasAPICalls,
    apiCalls: page.apiCalls
  });
});

console.log('📋 Module Analysis:\n');
Object.keys(apiModules).sort().forEach(module => {
  const apis = apiModules[module];
  const pages = pageModules[module] || [];
  const pagesWithAPI = pages.filter(p => p.hasAPI).length;
  const pagesWithoutAPI = pages.length - pagesWithAPI;
  
  console.log(`📦 ${module}:`);
  console.log(`   APIs: ${apis.length}`);
  console.log(`   Pages: ${pages.length} (${pagesWithAPI} with API, ${pagesWithoutAPI} without)`);
  
  if (pagesWithoutAPI > 0 && apis.length > 0) {
    console.log(`   ⚠️  ${pagesWithoutAPI} pages may need API integration`);
  }
  console.log('');
});

// Generate report
const report = {
  summary: {
    totalAPIRoutes: apiRoutes.length,
    totalFrontendPages: frontendPages.length,
    pagesWithAPI: pagesWithAPI.length,
    pagesWithoutAPI: pagesWithoutAPI.length,
    integrationRate: ((pagesWithAPI.length / frontendPages.length) * 100).toFixed(1) + '%'
  },
  apiModules: apiModules,
  pageModules: pageModules,
  pagesWithoutAPI: pagesWithoutAPI.map(p => ({
    path: p.page,
    file: p.file
  })),
  pagesWithAPI: pagesWithAPI.map(p => ({
    path: p.page,
    file: p.file,
    apiCalls: p.apiCalls
  }))
};

fs.writeFileSync(
  path.join(rootDir, 'BACKEND_FRONTEND_INTEGRATION_REPORT.json'),
  JSON.stringify(report, null, 2)
);

console.log('📄 Integration report saved to: BACKEND_FRONTEND_INTEGRATION_REPORT.json\n');

// Show pages without API
if (pagesWithoutAPI.length > 0) {
  console.log('⚠️  Pages without API calls:\n');
  pagesWithoutAPI.slice(0, 20).forEach(page => {
    console.log(`   • ${page.page} (${page.file})`);
  });
  if (pagesWithoutAPI.length > 20) {
    console.log(`   ... and ${pagesWithoutAPI.length - 20} more`);
  }
  console.log('');
}

console.log(`✅ Integration Analysis Complete!\n`);

