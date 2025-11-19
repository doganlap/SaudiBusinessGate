#!/usr/bin/env node

/**
 * Simple Database Migration Runner
 * Saudi Business Gate Platform - Missing Tables Migration
 */

import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting database migration for missing tables...');

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

try {
    // Test connection
    console.log('📡 Testing database connection...');
    const client = await pool.connect();
    console.log('✅ Database connection successful');
    client.release();

    // Read migration file
    const migrationPath = path.join(__dirname, '..', 'database', 'migrations', '001_create_missing_tables.sql');
    console.log(`📄 Reading migration file: ${migrationPath}`);
    
    if (!fs.existsSync(migrationPath)) {
        throw new Error(`Migration file not found: ${migrationPath}`);
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log('📖 Migration file loaded successfully');

    // Execute migration
    console.log('⚡ Executing migration...');
    await pool.query(migrationSQL);
    console.log('✅ Migration executed successfully');

    // Verify tables were created
    console.log('🔍 Verifying created tables...');
    const tableCheck = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('ai_agents', 'themes', 'tenant_webhook_configs', 'notifications', 'workflow_templates', 'workflow_executions')
        ORDER BY table_name
    `);

    console.log('📊 Created tables:');
    tableCheck.rows.forEach(row => {
        console.log(`   ✅ ${row.table_name}`);
    });

    // Check record counts
    console.log('📈 Initial data verification:');
    const tables = ['ai_agents', 'themes', 'workflow_templates'];
    
    for (const table of tables) {
        try {
            const countResult = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
            console.log(`   📋 ${table}: ${countResult.rows[0].count} records`);
        } catch (error) {
            console.log(`   ❌ ${table}: Error checking records - ${error.message}`);
        }
    }

    console.log('\n🎉 Database migration completed successfully!');
    console.log('📋 Summary:');
    console.log('   ✅ ai_agents - AI agent management system');
    console.log('   ✅ themes - Theme customization system');
    console.log('   ✅ tenant_webhook_configs - Webhook configurations');
    console.log('   ✅ notifications - Notification system');
    console.log('   ✅ workflow_templates - Workflow management');
    console.log('   ✅ workflow_executions - Workflow execution tracking');
    console.log('\n🚀 Your application is now ready for production database operations!');

} catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
} finally {
    await pool.end();
    console.log('🔌 Database connection closed');
}
