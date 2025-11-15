#!/bin/bash
# Database initialization script for DoganHub Store
# This script runs when PostgreSQL container starts for the first time

set -e

echo "🗃️  Initializing DoganHub Store Database..."
echo "📊 Creating database: doganhubstore"

# Create additional databases if needed
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Create extensions
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pg_trgm";
    CREATE EXTENSION IF NOT EXISTS "unaccent";
    
    -- Create schemas
    CREATE SCHEMA IF NOT EXISTS auth;
    CREATE SCHEMA IF NOT EXISTS billing;
    CREATE SCHEMA IF NOT EXISTS hr;
    CREATE SCHEMA IF NOT EXISTS finance;
    CREATE SCHEMA IF NOT EXISTS crm;
    CREATE SCHEMA IF NOT EXISTS grc;
    CREATE SCHEMA IF NOT EXISTS pm;
    CREATE SCHEMA IF NOT EXISTS procurement;
    CREATE SCHEMA IF NOT EXISTS analytics;
    
    -- Set timezone
    SET timezone = 'Asia/Riyadh';
    
    -- Create basic tables structure will be handled by Prisma migrations
    
    GRANT ALL PRIVILEGES ON DATABASE doganhubstore TO postgres;
    
    -- Log completion
    \echo 'DoganHub Store database initialized successfully!'
EOSQL

echo "✅ Database initialization completed!"