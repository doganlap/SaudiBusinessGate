import fs from 'fs';
import path from 'path';

const reactFile = 'apps/web/src/components/layout/MultiTenantNavigation.jsx';
const nextFile = 'app/components/layout/MultiTenantNavigation.jsx';

const reactContent = fs.readFileSync(reactFile, 'utf8');
const nextContent = fs.readFileSync(nextFile, 'utf8');

// Extract all navigation item IDs
const extractIds = (content) => {
  const idMatches = content.matchAll(/id:\s*['"]([^'"]+)['"]/g);
  const ids = new Set();
  for (const match of idMatches) {
    ids.add(match[1]);
  }
  return ids;
};

const reactIds = extractIds(reactContent);
const nextIds = extractIds(nextContent);

const inReactNotNext = [...reactIds].filter(id => !nextIds.has(id));
const inNextNotReact = [...nextIds].filter(id => !reactIds.has(id));

console.log('\n📊 Navigation Comparison Report\n');
console.log(`React Router Navigation Items: ${reactIds.size}`);
console.log(`Next.js Navigation Items: ${nextIds.size}\n`);

if (inReactNotNext.length > 0) {
  console.log(`⚠️  Items in React Router but NOT in Next.js (${inReactNotNext.length}):`);
  inReactNotNext.forEach(id => console.log(`   • ${id}`));
} else {
  console.log('✅ All React Router items are in Next.js');
}

console.log('');

if (inNextNotReact.length > 0) {
  console.log(`⚠️  Items in Next.js but NOT in React Router (${inNextNotReact.length}):`);
  inNextNotReact.forEach(id => console.log(`   • ${id}`));
} else {
  console.log('✅ All Next.js items are in React Router');
}

console.log('\n');

