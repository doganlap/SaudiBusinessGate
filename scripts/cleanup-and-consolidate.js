import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Load duplicate report
const duplicateReport = JSON.parse(
  fs.readFileSync(path.join(rootDir, 'COMPONENT_DUPLICATES_REPORT.json'), 'utf8')
);

console.log('\n🧹 Starting Cleanup and Consolidation...\n');

// Step 1: Create archive directory
const archiveDir = path.join(rootDir, 'archive');
if (!fs.existsSync(archiveDir)) {
  fs.mkdirSync(archiveDir, { recursive: true });
  console.log('✅ Created archive directory');
}

// Step 2: Archive apps/web (if exists)
const appsWebPath = path.join(rootDir, 'apps/web');
const archiveWebPath = path.join(archiveDir, 'apps-web-legacy');
if (fs.existsSync(appsWebPath) && !fs.existsSync(archiveWebPath)) {
  console.log('📦 Archiving apps/web/ to archive/apps-web-legacy/...');
  // Note: In production, use proper move/copy
  console.log('   (Manual step: mv apps/web archive/apps-web-legacy)');
}

// Step 3: Archive apps/app (if exists)
const appsAppPath = path.join(rootDir, 'apps/app');
const archiveAppPath = path.join(archiveDir, 'apps-app-duplicate');
if (fs.existsSync(appsAppPath) && !fs.existsSync(archiveAppPath)) {
  console.log('📦 Archiving apps/app/ to archive/apps-app-duplicate/...');
  console.log('   (Manual step: mv apps/app archive/apps-app-duplicate)');
}

// Step 4: Delete duplicate components
console.log('\n🗑️  Deleting duplicate components...\n');

let deletedCount = 0;
let keptCount = 0;

Object.keys(duplicateReport.duplicates).forEach(componentName => {
  const duplicates = duplicateReport.duplicates[componentName];
  
  // Find the one in components/ (preferred location)
  const inComponents = duplicates.find(f => f.location === 'components/');
  
  if (inComponents) {
    // Keep the one in components/, delete others
    duplicates.forEach(file => {
      if (file.location !== 'components/') {
        const filePath = path.join(rootDir, file.relative);
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
            console.log(`   ✅ Deleted: ${file.relative}`);
            deletedCount++;
          } catch (error) {
            console.log(`   ⚠️  Could not delete: ${file.relative} - ${error.message}`);
          }
        }
      } else {
        keptCount++;
      }
    });
  } else {
    // No version in components/, keep the one in app/components/ (Next.js)
    const inAppComponents = duplicates.find(f => f.location === 'app/components/');
    const inWebComponents = duplicates.find(f => f.location === 'apps/web/src/components/');
    
    if (inAppComponents) {
      // Move to components/ and delete others
      const sourcePath = path.join(rootDir, inAppComponents.relative);
      const targetPath = path.join(rootDir, 'components', path.basename(inAppComponents.relative));
      
      if (fs.existsSync(sourcePath)) {
        try {
          // Create target directory if needed
          const targetDir = path.dirname(targetPath);
          if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
          }
          
          // Copy to components/ (safer than move)
          fs.copyFileSync(sourcePath, targetPath);
          console.log(`   📦 Moved to components/: ${path.basename(inAppComponents.relative)}`);
          keptCount++;
          
          // Delete from app/components/
          fs.unlinkSync(sourcePath);
          console.log(`   ✅ Deleted: ${inAppComponents.relative}`);
          deletedCount++;
          
          // Delete from apps/web/src/components/ if exists
          if (inWebComponents) {
            const webPath = path.join(rootDir, inWebComponents.relative);
            if (fs.existsSync(webPath)) {
              fs.unlinkSync(webPath);
              console.log(`   ✅ Deleted: ${inWebComponents.relative}`);
              deletedCount++;
            }
          }
        } catch (error) {
          console.log(`   ⚠️  Error processing ${componentName}: ${error.message}`);
        }
      }
    }
  }
});

console.log(`\n📊 Cleanup Summary:`);
console.log(`   ✅ Kept: ${keptCount} components in components/`);
console.log(`   🗑️  Deleted: ${deletedCount} duplicate files`);
console.log(`\n✅ Component cleanup complete!\n`);

// Step 5: Generate cleanup report
const cleanupReport = {
  timestamp: new Date().toISOString(),
  summary: {
    kept: keptCount,
    deleted: deletedCount,
    archived: ['apps/web (if exists)', 'apps/app (if exists)']
  },
  note: 'Manual steps required: Archive apps/web and apps/app directories'
};

fs.writeFileSync(
  path.join(rootDir, 'CLEANUP_REPORT.json'),
  JSON.stringify(cleanupReport, null, 2)
);

console.log('📄 Cleanup report saved to: CLEANUP_REPORT.json\n');
console.log('⚠️  Manual Steps Required:');
console.log('   1. Archive apps/web: mv apps/web archive/apps-web-legacy');
console.log('   2. Archive apps/app: mv apps/app archive/apps-app-duplicate');
console.log('   3. Update package.json workspaces if needed');
console.log('   4. Test build: npm run build\n');

