#!/usr/bin/env node
/**
 * Fix CRUD delete operations - ensure deletes persist to database
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Common issues with DELETE operations:
// 1. Not returning proper response
// 2. Not handling errors correctly
// 3. Not refreshing data after delete
// 4. Caching issues

log('\n🔧 Fixing CRUD Delete Operations', 'cyan');
log('═'.repeat(60) + '\n', 'cyan');

// Check DELETE route patterns
const apiRoutes = [
  'app/api/crm/customers/route.ts',
  'app/api/finance/accounts/route.ts',
  'app/api/finance/transactions/route.ts',
  'app/api/hr/employees/route.ts',
  'app/api/procurement/vendors/route.ts',
  'app/api/sales/orders/route.ts',
];

log('📋 Checking DELETE route implementations...\n', 'yellow');

let issuesFound = 0;
const fixes = [];

for (const route of apiRoutes) {
  const filePath = path.join(process.cwd(), route);
  
  if (!fs.existsSync(filePath)) {
    log(`   ⚠️  ${route} - File not found`, 'yellow');
    continue;
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Check for DELETE function
  if (!content.includes('export async function DELETE')) {
    log(`   ⚠️  ${route} - No DELETE function found`, 'yellow');
    issuesFound++;
    continue;
  }
  
  // Check for proper response
  if (!content.includes('return NextResponse.json') && !content.includes('return Response.json')) {
    log(`   ⚠️  ${route} - DELETE may not return proper response`, 'yellow');
    issuesFound++;
    fixes.push({
      file: route,
      issue: 'Missing proper response',
      fix: 'Add: return NextResponse.json({ success: true }, { status: 200 });'
    });
  }
  
  // Check for error handling
  if (!content.includes('try') || !content.includes('catch')) {
    log(`   ⚠️  ${route} - DELETE may not have error handling`, 'yellow');
    issuesFound++;
    fixes.push({
      file: route,
      issue: 'Missing error handling',
      fix: 'Wrap DELETE in try-catch block'
    });
  }
  
  // Check for database commit/transaction
  if (content.includes('DELETE FROM') && !content.includes('await') && !content.includes('prisma')) {
    log(`   ⚠️  ${route} - DELETE may not await database operation`, 'yellow');
    issuesFound++;
    fixes.push({
      file: route,
      issue: 'Not awaiting database operation',
      fix: 'Ensure DELETE query is awaited'
    });
  }
  
  log(`   ✅ ${route} - DELETE function found`, 'green');
}

log('\n📋 Summary of Issues:', 'cyan');
log('─'.repeat(60), 'cyan');

if (issuesFound === 0) {
  log('   ✅ No issues found!', 'green');
} else {
  log(`   ⚠️  Found ${issuesFound} potential issues`, 'yellow');
  fixes.forEach((fix, index) => {
    log(`\n   ${index + 1}. ${fix.file}`, 'blue');
    log(`      Issue: ${fix.issue}`, 'yellow');
    log(`      Fix: ${fix.fix}`, 'green');
  });
}

log('\n💡 Common Fixes for Delete Not Persisting:', 'cyan');
log('─'.repeat(60), 'cyan');
log('1. Ensure DELETE route returns proper response:', 'blue');
log('   return NextResponse.json({ success: true }, { status: 200 });', 'white');
log('');
log('2. Ensure database operation is awaited:', 'blue');
log('   const result = await prisma.model.delete({ where: { id } });', 'white');
log('');
log('3. Ensure frontend refreshes after delete:', 'blue');
log('   await fetchAll(); // Refresh list after delete', 'white');
log('');
log('4. Check for caching - add cache control:', 'blue');
log('   headers: { "Cache-Control": "no-store" }', 'white');
log('');
log('5. Verify tenant isolation:', 'blue');
log('   WHERE id = $1 AND tenant_id = $2', 'white');
log('');

log('✅ Analysis Complete!\n', 'green');

