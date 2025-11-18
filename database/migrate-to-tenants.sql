-- =====================================================
-- Schema Migration: Organizations -> Tenants
-- Resolves the conflict between organizations and tenants tables
-- =====================================================

-- Step 1: Create tenants table if it doesn't exist (from 01_tenants_and_users.sql)
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic Information
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    domain VARCHAR(255) UNIQUE,
    
    -- Business Information
    business_type VARCHAR(50) CHECK (business_type IN ('enterprise', 'sme', 'startup', 'individual')),
    industry VARCHAR(100),
    company_size VARCHAR(50),
    country_code VARCHAR(3) DEFAULT 'SAU',
    
    -- Subscription & Status
    subscription_tier VARCHAR(50) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'demo', 'poc', 'partner', 'enterprise')),
    subscription_status VARCHAR(50) DEFAULT 'active' CHECK (subscription_status IN ('active', 'trial', 'suspended', 'cancelled')),
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    subscription_started_at TIMESTAMP WITH TIME ZONE,
    
    -- Limits & Quotas
    max_users INTEGER DEFAULT 5,
    max_storage_gb INTEGER DEFAULT 10,
    max_api_calls_per_month INTEGER DEFAULT 10000,
    
    -- Features Flags
    features JSONB DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    
    -- Billing
    billing_email VARCHAR(255),
    billing_address JSONB,
    
    -- Status & Tracking
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Owner reference
    owner_id UUID REFERENCES users(id),
    
    -- Additional fields from organizations
    description TEXT,
    logo_url TEXT,
    website VARCHAR(255)
);

-- Step 2: Migrate data from organizations to tenants if organizations table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'organizations') THEN
        -- Migrate data
        INSERT INTO tenants (
            id, name, slug, description, logo_url, website, industry, 
            subscription_tier, owner_id, created_at, updated_at
        )
        SELECT 
            id, name, slug, description, logo_url, website, industry,
            CASE 
                WHEN license_tier = 'basic' THEN 'free'
                WHEN license_tier = 'premium' THEN 'partner'
                WHEN license_tier = 'enterprise' THEN 'enterprise'
                ELSE 'free'
            END as subscription_tier,
            owner_id, created_at, updated_at
        FROM organizations
        ON CONFLICT (id) DO NOTHING;
        
        -- Update organization_members to reference tenants
        IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'organization_members') THEN
            -- Create tenant_members table
            CREATE TABLE IF NOT EXISTS tenant_members (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                role VARCHAR(50) DEFAULT 'member',
                joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(tenant_id, user_id)
            );
            
            -- Migrate data
            INSERT INTO tenant_members (tenant_id, user_id, role, joined_at)
            SELECT organization_id, user_id, role, joined_at
            FROM organization_members
            ON CONFLICT (tenant_id, user_id) DO NOTHING;
        END IF;
        
        -- Update subscriptions table
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'organization_id') THEN
            ALTER TABLE subscriptions RENAME COLUMN organization_id TO tenant_id;
        END IF;
        
        -- Update licenses table
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'licenses' AND column_name = 'organization_id') THEN
            ALTER TABLE licenses RENAME COLUMN organization_id TO tenant_id;
        END IF;
    END IF;
END $$;

-- Step 3: Create indexes for tenants
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_owner_id ON tenants(owner_id);
CREATE INDEX IF NOT EXISTS idx_tenants_subscription_tier ON tenants(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_tenants_is_active ON tenants(is_active);

-- Step 4: Create tenant_members indexes if table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tenant_members') THEN
        CREATE INDEX IF NOT EXISTS idx_tenant_members_tenant_id ON tenant_members(tenant_id);
        CREATE INDEX IF NOT EXISTS idx_tenant_members_user_id ON tenant_members(user_id);
    END IF;
END $$;

-- Step 5: Update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tenants_updated_at 
    BEFORE UPDATE ON tenants 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 6: Drop old tables (commented out for safety)
-- DROP TABLE IF EXISTS organization_members CASCADE;
-- DROP TABLE IF EXISTS organizations CASCADE;

COMMIT;
