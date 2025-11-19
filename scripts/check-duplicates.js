// Check for duplicate files in the project
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Checking for duplicate files...\n');

const projectRoot = path.join(__dirname, '..');

// Files to check for duplicates
const filesToCheck = [
  'FinancePlotlyCharts.tsx',
  'CashFlowStatement.tsx',
  'finance-export.ts',
  'finance-export-pdf.ts'
];

const duplicates = {};

filesToCheck.forEach(filename => {
  const found = [];
  
  function searchDir(dir) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        // Skip node_modules, .next, .git
        if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === '.git' || entry.name === 'dist') {
          continue;
        }
        
        if (entry.isDirectory()) {
          searchDir(fullPath);
        } else if (entry.name === filename) {
          found.push(fullPath);
        }
      }
    } catch (err) {
      // Skip directories we can't read
    }
  }
  
  searchDir(projectRoot);
  
  if (found.length > 1) {
    duplicates[filename] = found;
  }
});

// Report duplicates
if (Object.keys(duplicates).length === 0) {
  console.log('✅ No duplicates found!\n');
} else {
  console.log('⚠️  Found duplicates:\n');
  
  Object.entries(duplicates).forEach(([filename, paths]) => {
    console.log(`📄 ${filename}:`);
    paths.forEach((p, idx) => {
      const relPath = path.relative(projectRoot, p);
      const stats = fs.statSync(p);
      console.log(`   ${idx + 1}. ${relPath} (${stats.size} bytes, modified: ${stats.mtime.toLocaleDateString()})`);
    });
    console.log('');
  });
}

// Check which FinancePlotlyCharts is actually used
if (duplicates['FinancePlotlyCharts.tsx']) {
  console.log('\n🔍 Checking which FinancePlotlyCharts is imported...\n');
  
  function findImports(dir, imports = []) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === '.git' || entry.name === 'dist') {
          continue;
        }
        
        if (entry.isDirectory()) {
          findImports(fullPath, imports);
        } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts') || entry.name.endsWith('.jsx') || entry.name.endsWith('.js')) {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('FinancePlotlyCharts')) {
              const lines = content.split('\n');
              lines.forEach((line, idx) => {
                if (line.includes('FinancePlotlyCharts')) {
                  imports.push({
                    file: path.relative(projectRoot, fullPath),
                    line: idx + 1,
                    content: line.trim()
                  });
                }
              });
            }
          } catch (err) {
            // Skip files we can't read
          }
        }
      }
    } catch (err) {
      // Skip directories we can't read
    }
    
    return imports;
  }
  
  const imports = findImports(path.join(projectRoot, 'app'));
  
  console.log('Imports found:');
  imports.forEach(imp => {
    console.log(`   ${imp.file}:${imp.line}`);
    console.log(`   ${imp.content}`);
    console.log('');
  });
}

console.log('\n✅ Duplicate check complete!\n');

