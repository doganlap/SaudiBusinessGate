/**
 * Database Schema Inspector
 * Lists all tables in the database to understand the structure
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

async function inspectDatabase() {
  console.log('🔍 Inspecting database schema...');

  const client = await db.connect();
  
  try {
    // List all tables
    const tablesResult = await client.query(`
      SELECT table_name, table_schema 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    console.log('\n📊 Available Tables:');
    console.log('==================');
    
    if (tablesResult.rows.length === 0) {
      console.log('No tables found in the database.');
      return;
    }

    for (const table of tablesResult.rows) {
      console.log(`📋 ${table.table_name}`);
      
      // Get column information for each table
      const columnsResult = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = $1 AND table_schema = 'public'
        ORDER BY ordinal_position
      `, [table.table_name]);

      if (columnsResult.rows.length > 0) {
        columnsResult.rows.forEach(col => {
          const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
          const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
          console.log(`   ├─ ${col.column_name}: ${col.data_type} ${nullable}${defaultVal}`);
        });
      }
      console.log('');
    }

    // Check for user-related tables specifically
    const userTables = tablesResult.rows.filter(table => 
      table.table_name.includes('user') || 
      table.table_name.includes('auth') ||
      table.table_name.includes('account')
    );

    if (userTables.length > 0) {
      console.log('\n👥 User/Auth Related Tables:');
      console.log('============================');
      userTables.forEach(table => {
        console.log(`✓ ${table.table_name}`);
      });
    }

  } catch (error) {
    console.error('❌ Error inspecting database:', error);
  } finally {
    client.release();
    await db.end();
  }
}

if (require.main === module) {
  inspectDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { inspectDatabase };