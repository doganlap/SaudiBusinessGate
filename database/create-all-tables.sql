-- =====================================================
-- CREATE ALL MODULE TABLES
-- Run this script to create all database tables for all modules
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Run all table creation scripts
\i database/create-crm-tables.sql
\i database/create-sales-tables.sql
\i database/create-hr-tables.sql
\i database/create-finance-tables.sql
\i database/create-grc-tables.sql
\i database/create-procurement-tables.sql

-- Note: If running individually, execute each file separately:
-- psql -d your_database -f database/create-crm-tables.sql
-- psql -d your_database -f database/create-sales-tables.sql
-- psql -d your_database -f database/create-hr-tables.sql
-- psql -d your_database -f database/create-finance-tables.sql
-- psql -d your_database -f database/create-grc-tables.sql
-- psql -d your_database -f database/create-procurement-tables.sql

