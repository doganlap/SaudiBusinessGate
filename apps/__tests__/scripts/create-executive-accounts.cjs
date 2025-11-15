/**
 * Executive Accounts Creation Script
 * Creates C-level executive accounts: CFO, CTO, CEO
 */

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Database connection
const db = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'doganhubstore',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
});

async function createExecutiveAccounts() {
  console.log('👔 Creating executive accounts...');

  const client = await db.connect();
  
  try {
    // Hash password for all executive accounts
    const execPassword = await bcrypt.hash('Executive2024!', 12);

    // Create executive accounts
    const executives = [
      {
        id: 'exec-cfo-001',
        name: 'Chief Financial Officer',
        email: 'CFO@doganhub.com',
        role: 'platform_admin',
        title: 'CFO',
        department: 'Finance',
        permissions: ['finance.admin', 'reporting.executive', 'budget.approval', 'audit.access']
      },
      {
        id: 'exec-cto-002',
        name: 'Chief Technology Officer',
        email: 'CTO@doganhub.com',
        role: 'platform_admin',
        title: 'CTO',
        department: 'Technology',
        permissions: ['platform.admin', 'infrastructure.admin', 'security.admin', 'development.oversight']
      },
      {
        id: 'exec-ceo-003',
        name: 'Chief Executive Officer',
        email: 'CEO@doganhub.com',
        role: 'platform_admin',
        title: 'CEO',
        department: 'Executive',
        permissions: ['platform.admin', 'tenant.admin', 'finance.admin', 'strategic.oversight', 'governance.admin']
      }
    ];

    // Start transaction
    await client.query('BEGIN');

    // Create each executive account
    for (const exec of executives) {
      
      // Create executive user account in the users table
      const userResult = await client.query(`
        INSERT INTO users (
          organization_id, email, password_hash, first_name, last_name, 
          is_active, created_at, updated_at, preferences
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (email) DO UPDATE SET
          password_hash = EXCLUDED.password_hash,
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          preferences = EXCLUDED.preferences,
          updated_at = EXCLUDED.updated_at
        RETURNING id, email
      `, [
        null, // No specific organization - platform-level access
        exec.email,
        execPassword,
        exec.title, // Use title as first name for executives
        exec.department, // Use department as last name
        true, // is_active
        new Date(),
        new Date(),
        JSON.stringify({
          title: exec.title,
          department: exec.department,
          level: 'C-Level',
          permissions: exec.permissions,
          accessLevel: 'executive',
          canViewAllTenants: true,
          canManagePlatform: true,
          role: exec.role
        })
      ]);

      console.log(`✅ Created ${exec.title}: ${exec.email}`);

      // Create audit log for account creation
      await client.query(`
        INSERT INTO audit_logs (
          organization_id, user_id, action_type, 
          changes, success, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, CURRENT_TIMESTAMP
        )
      `, [
        null, // Platform-level event
        userResult.rows[0].id,
        'executive_account_created',
        JSON.stringify({ 
          executiveTitle: exec.title,
          department: exec.department,
          email: exec.email,
          permissions: exec.permissions,
          description: `Created executive account: ${exec.title} (${exec.email})`
        }),
        true
      ]);
    }
    
    // Commit transaction
    await client.query('COMMIT');

    console.log('🎉 Executive accounts created successfully!');
    console.log('\nExecutive Login Credentials:');
    console.log('==============================');
    console.log('CFO@doganhub.com    | Executive2024!');
    console.log('CTO@doganhub.com    | Executive2024!');
    console.log('CEO@doganhub.com    | Executive2024!');
    console.log('==============================');
    console.log('All accounts have platform_admin role with full access');

  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    console.error('❌ Error creating executive accounts:', error);
    
    // Check if accounts already exist
    if (error.code === '23505') { // PostgreSQL unique violation
      console.log('⚠️  Some executive accounts may already exist. Checking existing accounts...');
      
      const existingExecs = await client.query(`
        SELECT email, first_name, last_name, preferences, created_at
        FROM users 
        WHERE email IN ('CFO@doganhub.com', 'CTO@doganhub.com', 'CEO@doganhub.com')
      `);

      if (existingExecs.rows.length > 0) {
        console.log('\nExisting Executive Accounts:');
        existingExecs.rows.forEach(exec => {
          const prefs = exec.preferences ? JSON.parse(exec.preferences) : {};
          const role = prefs.role || 'user';
          console.log(`✓ ${exec.email} - ${exec.first_name} ${exec.last_name} (${role}) - Created: ${new Date(exec.created_at).toLocaleDateString()}`);
        });
      }
    }
    
    throw error;
  } finally {
    client.release();
    await db.end();
  }
}

// Utility function to reset executive passwords if needed
async function resetExecutivePasswords() {
  console.log('🔐 Resetting executive passwords...');
  
  const client = await db.connect();
  
  try {
    const newPassword = await bcrypt.hash('Executive2024!', 12);
    const executives = ['CFO@doganhub.com', 'CTO@doganhub.com', 'CEO@doganhub.com'];
    
    for (const email of executives) {
      await client.query(`
        UPDATE users 
        SET password_hash = $1, updated_at = $2 
        WHERE email = $3
      `, [newPassword, new Date(), email]);
      console.log(`✅ Reset password for ${email}`);
    }
    
    console.log('🎉 All executive passwords reset to: Executive2024!');
  } finally {
    client.release();
    await db.end();
  }
}

if (require.main === module) {
  const action = process.argv[2];
  
  if (action === 'reset-passwords') {
    resetExecutivePasswords()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error(error);
        process.exit(1);
      });
  } else {
    createExecutiveAccounts()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error(error);
        process.exit(1);
      });
  }
}

module.exports = { 
  createExecutiveAccounts, 
  resetExecutivePasswords 
};