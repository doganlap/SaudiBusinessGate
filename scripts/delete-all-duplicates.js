import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

console.log('\n🗑️  Deleting All Duplicate and Unnecessary Files...\n');

let deletedCount = 0;
let errorCount = 0;

function deleteFile(filePath, reason) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`   ✅ Deleted: ${path.relative(rootDir, filePath)} (${reason})`);
      deletedCount++;
      return true;
    }
  } catch (error) {
    console.log(`   ⚠️  Error deleting ${filePath}: ${error.message}`);
    errorCount++;
    return false;
  }
  return false;
}

function deleteDirectory(dirPath, reason) {
  try {
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath);
      if (files.length === 0) {
        fs.rmdirSync(dirPath);
        console.log(`   ✅ Deleted empty directory: ${path.relative(rootDir, dirPath)} (${reason})`);
        deletedCount++;
        return true;
      } else {
        // Delete all files first
        files.forEach(file => {
          const filePath = path.join(dirPath, file);
          const stat = fs.statSync(filePath);
          if (stat.isDirectory()) {
            deleteDirectory(filePath, reason);
          } else {
            deleteFile(filePath, reason);
          }
        });
        // Then delete directory
        fs.rmdirSync(dirPath);
        console.log(`   ✅ Deleted directory: ${path.relative(rootDir, dirPath)} (${reason})`);
        deletedCount++;
        return true;
      }
    }
  } catch (error) {
    console.log(`   ⚠️  Error deleting directory ${dirPath}: ${error.message}`);
    errorCount++;
    return false;
  }
  return false;
}

// Step 1: Delete all files in app/components/ (duplicates - components/ has the source)
console.log('📁 Deleting app/components/ duplicates...\n');
const appComponentsPath = path.join(rootDir, 'app/components');
if (fs.existsSync(appComponentsPath)) {
  const files = fs.readdirSync(appComponentsPath);
  files.forEach(file => {
    const filePath = path.join(appComponentsPath, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      deleteDirectory(filePath, 'duplicate in app/components/');
    } else {
      deleteFile(filePath, 'duplicate in app/components/');
    }
  });
  // Try to delete the directory itself
  try {
    const remaining = fs.readdirSync(appComponentsPath);
    if (remaining.length === 0) {
      fs.rmdirSync(appComponentsPath);
      console.log(`   ✅ Deleted empty directory: app/components/`);
    }
  } catch (e) {
    // Directory not empty or error
  }
}

// Step 2: Delete all files in apps/web/src/components/ (duplicates - components/ has the source)
console.log('\n📁 Deleting apps/web/src/components/ duplicates...\n');
const webComponentsPath = path.join(rootDir, 'apps/web/src/components');
if (fs.existsSync(webComponentsPath)) {
  const files = fs.readdirSync(webComponentsPath);
  files.forEach(file => {
    const filePath = path.join(webComponentsPath, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      deleteDirectory(filePath, 'duplicate in apps/web/src/components/');
    } else {
      deleteFile(filePath, 'duplicate in apps/web/src/components/');
    }
  });
  // Try to delete the directory itself
  try {
    const remaining = fs.readdirSync(webComponentsPath);
    if (remaining.length === 0) {
      fs.rmdirSync(webComponentsPath);
      console.log(`   ✅ Deleted empty directory: apps/web/src/components/`);
    }
  } catch (e) {
    // Directory not empty or error
  }
}

// Step 3: Delete old config files in apps/web/src/config/ (already consolidated to config/)
console.log('\n📁 Deleting apps/web/src/config/ (consolidated to config/)...\n');
const webConfigPath = path.join(rootDir, 'apps/web/src/config');
if (fs.existsSync(webConfigPath)) {
  const files = fs.readdirSync(webConfigPath);
  files.forEach(file => {
    // Keep README.md for reference, delete others
    if (file !== 'README.md') {
      const filePath = path.join(webConfigPath, file);
      const stat = fs.statSync(filePath);
      if (stat.isFile()) {
        deleteFile(filePath, 'consolidated to config/');
      }
    }
  });
}

// Step 4: Delete any remaining duplicate files in app/components/ that might have been missed
console.log('\n📁 Final cleanup of app/components/...\n');
if (fs.existsSync(appComponentsPath)) {
  try {
    const files = fs.readdirSync(appComponentsPath, { recursive: true, withFileTypes: true });
    // This is a final pass to catch anything missed
  } catch (e) {
    // Directory might not exist or be empty
  }
}

console.log(`\n📊 Cleanup Summary:`);
console.log(`   ✅ Deleted: ${deletedCount} files/directories`);
console.log(`   ⚠️  Errors: ${errorCount}`);
console.log(`\n✅ Cleanup complete!\n`);

