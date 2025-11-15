#!/usr/bin/env ts-node

/**
 * Database Setup Script
 * Sets up the DoganHubStore database schema and initial data
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { Pool } from 'pg';

const config = {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'doganhubstore',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || '',
  ssl: process.env.POSTGRES_SSL === 'true'
};

async function setupDatabase() {
  const pool = new Pool(config);

  try {
    console.log('🔌 Connecting to database...');
    console.log(`   Host: ${config.host}:${config.port}`);
    console.log(`   Database: ${config.database}`);
    
    // Test connection
    const testResult = await pool.query('SELECT NOW() as now, version() as version');
    console.log('✅ Database connection successful!');
    console.log(`   Server time: ${testResult.rows[0].now}`);
    console.log(`   PostgreSQL version: ${testResult.rows[0].version.split(',')[0]}`);
    
    // Read and execute schema files
    const schemaFiles = [
      '01-finance-tables.sql'
    ];

    for (const file of schemaFiles) {
      console.log(`\n📄 Executing schema: ${file}`);
      const schemaPath = join(__dirname, '..', 'database', 'schema', file);
      
      try {
        const sql = readFileSync(schemaPath, 'utf8');
        await pool.query(sql);
        console.log(`✅ Schema ${file} executed successfully`);
      } catch (error) {
        console.error(`❌ Error executing ${file}:`, error);
        throw error;
      }
    }

    // Verify tables were created
    console.log('\n🔍 Verifying tables...');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    console.log('✅ Tables created:');
    tablesResult.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });

    // Check sample data
    console.log('\n📊 Checking sample data...');
    const accountsResult = await pool.query(
      'SELECT COUNT(*) as count FROM financial_accounts'
    );
    console.log(`   Financial accounts: ${accountsResult.rows[0].count}`);

    const transactionsResult = await pool.query(
      'SELECT COUNT(*) as count FROM transactions'
    );
    console.log(`   Transactions: ${transactionsResult.rows[0].count}`);

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Update your .env file with database credentials');
    console.log('   2. Start the application: npm run dev');
    console.log('   3. Visit http://localhost:3001/en/test-connections to verify');

  } catch (error) {
    console.error('\n❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run setup
setupDatabase().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
