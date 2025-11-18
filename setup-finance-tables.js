import { Pool } from 'pg';
import fs from 'fs';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://f9b01b016f6065e1f9d62776a95e03ccb3773e35f2ba4d5ec6f6bbc1afaa2e46:sk_ZDb_YXE5HdKoY5VayB3tN@db.prisma.io:5432/postgres?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

async function setupFinanceTables() {
  try {
    console.log('📊 Reading finance tables schema...');
    const sql = fs.readFileSync('./apps/database/schema/01-finance-tables.sql', 'utf8');
    
    console.log('🔧 Creating finance tables...');
    await pool.query(sql);
    console.log('✅ Finance tables created successfully');
    
    // Verify tables were created
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (table_name LIKE 'financial_%' OR table_name = 'transactions' OR table_name = 'budgets' OR table_name = 'cost_centers' OR table_name = 'transaction_cost_allocations')
    `);
    console.log('📊 Finance tables found:', result.rows.map(r => r.table_name));
    
  } catch (error) {
    console.error('❌ Error creating finance tables:', error.message);
    if (error.code === '42P07') {
      console.log('ℹ️  Tables already exist, skipping creation');
    }
  } finally {
    await pool.end();
  }
}

setupFinanceTables();