import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and .next
      if (!['node_modules', '.next', 'dist', 'build', '.git'].includes(file)) {
        getAllFiles(filePath, fileList);
      }
    } else if (file.match(/\.(jsx?|tsx?)$/)) {
      fileList.push({
        path: filePath,
        relative: path.relative(rootDir, filePath),
        name: file,
        size: stat.size,
        modified: stat.mtime
      });
    }
  });
  
  return fileList;
}

function getComponentName(filePath) {
  const name = path.basename(filePath, path.extname(filePath));
  return name;
}

function findDuplicates() {
  console.log('\n🔍 Analyzing Component Duplicates...\n');
  
  const locations = [
    { name: 'components/', path: path.join(rootDir, 'components') },
    { name: 'app/components/', path: path.join(rootDir, 'app/components') },
    { name: 'apps/web/src/components/', path: path.join(rootDir, 'apps/web/src/components') }
  ];
  
  const allFiles = {};
  const duplicates = {};
  const unique = {};
  
  locations.forEach(loc => {
    if (!fs.existsSync(loc.path)) {
      console.log(`⚠️  ${loc.name} does not exist`);
      return;
    }
    
    const files = getAllFiles(loc.path);
    console.log(`📁 ${loc.name}: ${files.length} files`);
    
    files.forEach(file => {
      const componentName = getComponentName(file.path);
      const key = `${componentName}`;
      
      if (!allFiles[key]) {
        allFiles[key] = [];
      }
      
      allFiles[key].push({
        ...file,
        location: loc.name
      });
    });
  });
  
  // Find duplicates
  Object.keys(allFiles).forEach(key => {
    if (allFiles[key].length > 1) {
      duplicates[key] = allFiles[key];
    } else {
      unique[key] = allFiles[key][0];
    }
  });
  
  console.log('\n📊 Results:\n');
  console.log(`✅ Unique components: ${Object.keys(unique).length}`);
  console.log(`⚠️  Duplicate components: ${Object.keys(duplicates).length}\n`);
  
  if (Object.keys(duplicates).length > 0) {
    console.log('🔴 Duplicate Components:\n');
    Object.keys(duplicates).forEach(key => {
      console.log(`  ${key}:`);
      duplicates[key].forEach(file => {
        console.log(`    - ${file.location}${file.relative.replace(file.location, '')}`);
      });
      console.log('');
    });
  }
  
  // Generate recommendations
  console.log('\n💡 Recommendations:\n');
  
  const recommendations = {
    keepInComponents: [],
    moveToComponents: [],
    delete: []
  };
  
  Object.keys(duplicates).forEach(key => {
    const files = duplicates[key];
    const inComponents = files.find(f => f.location === 'components/');
    const inAppComponents = files.find(f => f.location === 'app/components/');
    const inWebComponents = files.find(f => f.location === 'apps/web/src/components/');
    
    if (inComponents) {
      // Keep the one in components/, delete others
      recommendations.keepInComponents.push(key);
      if (inAppComponents) recommendations.delete.push({ name: key, file: inAppComponents });
      if (inWebComponents) recommendations.delete.push({ name: key, file: inWebComponents });
    } else if (inAppComponents) {
      // Move app/components/ to components/, delete web version
      recommendations.moveToComponents.push({ name: key, file: inAppComponents });
      if (inWebComponents) recommendations.delete.push({ name: key, file: inWebComponents });
    } else if (inWebComponents) {
      // Move web version to components/
      recommendations.moveToComponents.push({ name: key, file: inWebComponents });
    }
  });
  
  console.log(`✅ Keep in components/: ${recommendations.keepInComponents.length} components`);
  console.log(`📦 Move to components/: ${recommendations.moveToComponents.length} components`);
  console.log(`🗑️  Delete duplicates: ${recommendations.delete.length} files\n`);
  
  // Write report
  const report = {
    summary: {
      unique: Object.keys(unique).length,
      duplicates: Object.keys(duplicates).length,
      total: Object.keys(allFiles).length
    },
    duplicates: duplicates,
    recommendations: recommendations
  };
  
  fs.writeFileSync(
    path.join(rootDir, 'COMPONENT_DUPLICATES_REPORT.json'),
    JSON.stringify(report, null, 2)
  );
  
  console.log('📄 Report saved to: COMPONENT_DUPLICATES_REPORT.json\n');
  
  return report;
}

findDuplicates();

