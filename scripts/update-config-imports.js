import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Files that import from apps/web/src/config
const filesToUpdate = [
  'apps/web/src/components/layout/AdvancedAppShell.jsx',
  'apps/web/src/pages/system/MissionControlPage.jsx',
  'apps/web/src/components/layout/AdvancedShell.jsx',
  'apps/web/src/components/layout/EnterprisePageLayout.jsx',
  'apps/web/src/context/AppContext.jsx',
  'apps/web/src/components/ui/EnterpriseComponents.jsx',
  'apps/web/src/services/grc-api/server.js',
  'apps/web/src/services/grc-api/middleware/auth.js',
  'apps/web/src/services/grc-api/middleware/rbac.js',
  'apps/web/src/services/grc-api/routes/auth.js',
  'apps/web/src/services/auth-service/routes/auth.js',
  'apps/web/src/services/grc-api/routes/assessment-templates.js',
  'apps/web/src/services/grc-api/routes/organizations.js',
  'apps/web/src/services/grc-api/routes/regulators.js',
  'apps/web/src/services/grc-api/routes/dashboard-multi-db.js',
  'apps/web/src/services/grc-api/routes/compliance.js',
  'apps/web/src/services/grc-api/routes/demo/admin/platformRoutes.js',
  'apps/web/src/health-check-unified.js',
  'apps/web/src/setup-unified-config.js'
];

function updateImports(filePath) {
  const fullPath = path.join(rootDir, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let updated = false;

  // Pattern 1: Relative imports from apps/web/src/config
  // e.g., from '../../config/theme.config' -> from '../../../../config/theme.config'
  // e.g., require('../../config/loader') -> require('../../../../config/loader')
  
  // Calculate relative path from file to root config
  const fileDir = path.dirname(fullPath);
  const relativeToRoot = path.relative(fileDir, path.join(rootDir, 'config'));
  const relativePath = relativeToRoot.replace(/\\/g, '/'); // Normalize to forward slashes
  
  // Update various import patterns
  const patterns = [
    // ES6 imports
    {
      from: /from\s+['"]\.\.\/\.\.\/config\/([^'"]+)['"]/g,
      to: `from '${relativePath}/$1'`
    },
    {
      from: /from\s+['"]\.\.\/config\/([^'"]+)['"]/g,
      to: `from '${relativePath}/$1'`
    },
    {
      from: /from\s+['"]\.\.\/\.\.\/\.\.\/config\/([^'"]+)['"]/g,
      to: `from '${relativePath}/$1'`
    },
    {
      from: /from\s+['"]\.\.\/\.\.\/\.\.\/\.\.\/config\/([^'"]+)['"]/g,
      to: `from '${relativePath}/$1'`
    },
    // CommonJS requires
    {
      from: /require\(['"]\.\.\/\.\.\/config\/([^'"]+)['"]\)/g,
      to: `require('${relativePath}/$1')`
    },
    {
      from: /require\(['"]\.\.\/config\/([^'"]+)['"]\)/g,
      to: `require('${relativePath}/$1')`
    },
    {
      from: /require\(['"]\.\.\/\.\.\/\.\.\/config\/([^'"]+)['"]\)/g,
      to: `require('${relativePath}/$1')`
    },
    {
      from: /require\(['"]\.\.\/\.\.\/\.\.\/\.\.\/config\/([^'"]+)['"]\)/g,
      to: `require('${relativePath}/$1')`
    }
  ];

  patterns.forEach(({ from, to }) => {
    if (from.test(content)) {
      content = content.replace(from, to);
      updated = true;
    }
  });

  if (updated) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Updated: ${filePath}`);
    return true;
  } else {
    console.log(`⏭️  No changes: ${filePath}`);
    return false;
  }
}

console.log('🔄 Updating config imports...\n');

let updatedCount = 0;
filesToUpdate.forEach(file => {
  if (updateImports(file)) {
    updatedCount++;
  }
});

console.log(`\n✅ Updated ${updatedCount} of ${filesToUpdate.length} files`);

