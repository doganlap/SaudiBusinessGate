const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// =================================================================
// DATABASE MIGRATION SCRIPT - PHASE 1: FOUNDATION
// =================================================================
// This script executes the foundational database schema changes for the
// enterprise transformation. It applies the new schema for RBAC,
// audit logging, white-labeling, and AI, and creates all
// necessary performance indexes.
// =================================================================

// --- Configuration ---
// Load database configuration from environment variables
const dbConfig = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'production',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
};

const SCHEMA_FILE = path.join(__dirname, '..', 'database', 'enterprise-schema-complete.sql');

// --- Main Execution ---
async function migrateDatabase() {
    console.log('?? Starting Enterprise Transformation - Phase 1: Database Migration...');
    
    const pool = new Pool(dbConfig);
    let client;

    try {
        // 1. Connect to the database
        client = await pool.connect();
        console.log('? Successfully connected to the database.');

        // 2. Read the master SQL schema file
        console.log(`?? Reading schema file: ${SCHEMA_FILE}`);
        const sql = fs.readFileSync(SCHEMA_FILE, 'utf8');
        if (!sql) {
            throw new Error('SQL schema file is empty or could not be read.');
        }
        console.log('? SQL schema file loaded successfully.');

        // 3. Execute the entire SQL script as a single transaction
        console.log('? Applying schema... This may take a few moments.');
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('COMMIT');
        console.log('??? Database migration successful! All schema changes have been applied.');
        console.log('?? RBAC, Audit Logging, and Performance Indexes are now in place.');

قث        console.error('??? FATAL: An error occurred during database migration.');
        console.error('Error:', error.message);
        if (client) {
            console.log('?? Rolling back transaction...');
            await client.query('ROLLBACK');
            console.log('? Transaction rolled back successfully.');
        }
        process.exit(1); // Exit with error
    } finally {
        // 4. Close the database connection
        if (client) {
            client.release();
        }
        await pool.end();
        console.log('?? Database connection closed.');
    }
}

// --- Run the migration ---
migrateDatabase();
reققث