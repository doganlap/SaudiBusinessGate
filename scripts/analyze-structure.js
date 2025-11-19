import fs from 'fs';
import path from 'path';

console.log('\n📊 Project Structure Analysis\n');
console.log('='.repeat(50));

// Check for multiple apps
const apps = [];
if (fs.existsSync('apps/web')) apps.push('apps/web (React Router)');
if (fs.existsSync('app')) apps.push('app (Next.js App Router)');
if (fs.existsSync('apps/app')) apps.push('apps/app (Duplicate?)');

console.log('\n📱 Apps Found:');
apps.forEach(app => console.log(`   • ${app}`));
console.log(`\n   Total: ${apps.length} app${apps.length > 1 ? 's' : ''}`);

// Check for multiple config directories
const configDirs = [];
if (fs.existsSync('config')) configDirs.push('config/');
if (fs.existsSync('apps/web/src/config')) configDirs.push('apps/web/src/config/');
if (fs.existsSync('app/components')) configDirs.push('app/components/ (has config?)');

console.log('\n⚙️  Config Directories:');
configDirs.forEach(dir => console.log(`   • ${dir}`));
console.log(`\n   Total: ${configDirs.length} config location${configDirs.length > 1 ? 's' : ''}`);

// Check for multiple index files
const indexFiles = [];
const checkIndex = (dir, label) => {
  const indexPath = path.join(dir, 'index.js');
  if (fs.existsSync(indexPath)) {
    indexFiles.push(`${label}: ${indexPath}`);
  }
};

checkIndex('apps/web/src/pages', 'React Router Pages');
checkIndex('app', 'Next.js App');
checkIndex('components', 'Components');
checkIndex('lib', 'Lib');
checkIndex('hooks', 'Hooks');

console.log('\n📑 Index Files Found:');
indexFiles.forEach(file => console.log(`   • ${file}`));
console.log(`\n   Total: ${indexFiles.length} index file${indexFiles.length > 1 ? 's' : ''}`);

// Check for duplicate components
const componentDirs = [];
if (fs.existsSync('components')) componentDirs.push('components/');
if (fs.existsSync('apps/web/src/components')) componentDirs.push('apps/web/src/components/');
if (fs.existsSync('app/components')) componentDirs.push('app/components/');

console.log('\n🧩 Component Directories:');
componentDirs.forEach(dir => console.log(`   • ${dir}`));
console.log(`\n   Total: ${componentDirs.length} component location${componentDirs.length > 1 ? 's' : ''}`);

console.log('\n' + '='.repeat(50));
console.log('\n📋 Summary:');
console.log(`   ${apps.length > 1 ? '⚠️  Multiple apps found' : '✅ Single app'}`);
console.log(`   ${configDirs.length > 1 ? '⚠️  Multiple config locations' : '✅ Single config'}`);
console.log(`   ${indexFiles.length > 1 ? '⚠️  Multiple index files' : '✅ Single index'}`);
console.log(`   ${componentDirs.length > 1 ? '⚠️  Multiple component locations' : '✅ Single components'}\n`);

