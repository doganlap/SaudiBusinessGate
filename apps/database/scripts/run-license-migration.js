#!/usr/bin/env node

/**
 * License Management Database Migration Runner
 * Runs the license management database migrations
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'doganhub',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

async function runMigrations() {
  const pool = new Pool(dbConfig);
  
  try {
    console.log('🚀 Starting license management database migration...');
    console.log('Database:', dbConfig.host, ':', dbConfig.port, '/', dbConfig.database);
    
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection established');
    
    // Read migration files
    const migrationsDir = path.join(__dirname, '../migrations');
    const migrationFiles = [
      '001_license_management_complete.sql',
      '002_license_seed_data.sql'
    ];
    
    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Migration file not found: ${file}`);
        continue;
      }
      
      console.log(`📝 Running migration: ${file}`);
      
      const sql = fs.readFileSync(filePath, 'utf8');
      
      try {
        await pool.query(sql);
        console.log(`✅ Migration completed: ${file}`);
      } catch (error) {
        console.error(`❌ Error running migration ${file}:`, error.message);
        throw error;
      }
    }
    
    // Verify installation
    console.log('🔍 Verifying installation...');
    
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%license%'
      ORDER BY table_name
    `);
    
    console.log('📊 License management tables created:');
    tables.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
    // Check sample data
    const licenseCount = await pool.query('SELECT COUNT(*) as count FROM licenses');
    const tenantLicenseCount = await pool.query('SELECT COUNT(*) as count FROM tenant_licenses');
    const renewalCount = await pool.query('SELECT COUNT(*) as count FROM license_renewals');
    
    console.log(`\n📈 Sample data summary:`);
    console.log(`   - License types: ${licenseCount.rows[0].count}`);
    console.log(`   - Tenant licenses: ${tenantLicenseCount.rows[0].count}`);
    console.log(`   - Renewal records: ${renewalCount.rows[0].count}`);
    
    console.log('\n🎉 License management database migration completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Update your .env file with correct database credentials');
    console.log('   2. Test the license API endpoints');
    console.log('   3. Configure cron jobs for automated tasks');
    console.log('   4. Set up email templates for notifications');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Handle command line execution
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };