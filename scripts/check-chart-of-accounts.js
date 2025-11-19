#!/usr/bin/env node
/**
 * Quick script to check if chart_of_accounts table exists
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkTable() {
  try {
    const client = await pool.connect();
    
    // Check for chart_of_accounts
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (table_name LIKE '%account%' OR table_name = 'chart_of_accounts')
      ORDER BY table_name
    `);
    
    console.log('\n📊 Tables with "account" in name:');
    if (result.rows.length === 0) {
      console.log('   ⚠️  No account tables found');
    } else {
      result.rows.forEach(row => {
        console.log(`   ${row.table_name === 'chart_of_accounts' ? '✅' : '  '} ${row.table_name}`);
      });
    }
    
    // Check if chart_of_accounts specifically exists
    const chartExists = result.rows.some(r => r.table_name === 'chart_of_accounts');
    
    if (!chartExists) {
      console.log('\n⚠️  chart_of_accounts table not found!');
      console.log('   The table should be created by database/create-finance-tables.sql');
      console.log('   Let\'s verify the SQL file contains the table definition...\n');
    } else {
      console.log('\n✅ chart_of_accounts table exists!\n');
    }
    
    client.release();
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

checkTable();

