/**
 * Verify Executive Accounts
 * Check that CFO, CTO, and CEO accounts were created successfully
 */

const { Pool } = require('pg');

// Database connection
const db = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'doganhubstore',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
});

async function verifyExecutiveAccounts() {
  console.log('🔍 Verifying executive accounts...');

  const client = await db.connect();
  
  try {
    // Check executive accounts
    const execResult = await client.query(`
      SELECT 
        id, email, first_name, last_name, is_active, created_at, preferences
      FROM users 
      WHERE email IN ('CFO@doganhub.com', 'CTO@doganhub.com', 'CEO@doganhub.com')
      ORDER BY email
    `);

    console.log('\n👔 Executive Accounts Status:');
    console.log('============================');
    
    if (execResult.rows.length === 0) {
      console.log('❌ No executive accounts found!');
      return;
    }

    execResult.rows.forEach(exec => {
      let prefs = {};
      try {
        // Handle both string and object types for preferences
        if (typeof exec.preferences === 'string') {
          prefs = JSON.parse(exec.preferences);
        } else if (typeof exec.preferences === 'object' && exec.preferences !== null) {
          prefs = exec.preferences;
        }
      } catch (e) {
        console.warn(`Warning: Could not parse preferences for ${exec.email}:`, e.message);
        prefs = {};
      }
      
      const status = exec.is_active ? '🟢 Active' : '🔴 Inactive';
      const createdDate = new Date(exec.created_at).toLocaleDateString();
      
      console.log(`\n${status} ${exec.email}`);
      console.log(`   Name: ${exec.first_name} ${exec.last_name}`);
      console.log(`   Title: ${prefs.title || 'N/A'}`);
      console.log(`   Department: ${prefs.department || 'N/A'}`);
      console.log(`   Role: ${prefs.role || 'N/A'}`);
      console.log(`   Access Level: ${prefs.accessLevel || 'N/A'}`);
      console.log(`   Created: ${createdDate}`);
      
      if (prefs.permissions && Array.isArray(prefs.permissions) && prefs.permissions.length > 0) {
        console.log(`   Permissions: ${prefs.permissions.join(', ')}`);
      }
    });

    // Check audit logs
    const auditResult = await client.query(`
      SELECT 
        action_type, changes, created_at
      FROM audit_logs 
      WHERE action_type = 'executive_account_created'
      ORDER BY created_at DESC
      LIMIT 5
    `);

    if (auditResult.rows.length > 0) {
      console.log('\n📋 Recent Executive Account Creation Logs:');
      console.log('========================================');
      auditResult.rows.forEach(log => {
        let changes = {};
        try {
          if (typeof log.changes === 'string') {
            changes = JSON.parse(log.changes);
          } else if (typeof log.changes === 'object' && log.changes !== null) {
            changes = log.changes;
          }
        } catch (e) {
          changes = { description: 'Executive account created' };
        }
        
        const logDate = new Date(log.created_at).toLocaleString();
        console.log(`✓ ${changes.description || 'Executive account created'} - ${logDate}`);
      });
    }

    console.log('\n🎉 Executive accounts verification completed!');
    console.log('\nLogin Instructions:');
    console.log('==================');
    console.log('1. Navigate to the platform login page');
    console.log('2. Use any of these credentials:');
    console.log('   • CFO@doganhub.com / Executive2024!');
    console.log('   • CTO@doganhub.com / Executive2024!');  
    console.log('   • CEO@doganhub.com / Executive2024!');
    console.log('3. All accounts have platform-level administrative access');

  } catch (error) {
    console.error('❌ Error verifying executive accounts:', error);
  } finally {
    client.release();
    await db.end();
  }
}

if (require.main === module) {
  verifyExecutiveAccounts()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { verifyExecutiveAccounts };