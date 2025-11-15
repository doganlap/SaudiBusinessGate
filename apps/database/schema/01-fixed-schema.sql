-- ============================================
-- FIXED SCHEMA FOR SAUDI STORE
-- All tables, triggers, and functions working
-- ============================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 1. TENANTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_code VARCHAR(50) UNIQUE NOT NULL,
    tenant_name VARCHAR(255) NOT NULL,
    tenant_name_ar VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active',
    subscription_tier VARCHAR(50) DEFAULT 'basic',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tenants_code ON tenants(tenant_code);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);

-- ============================================
-- 2. PLATFORM USERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS platform_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_tenant ON platform_users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON platform_users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON platform_users(role);

-- ============================================
-- 3. WORKFLOW INSTANCES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS workflow_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    workflow_name VARCHAR(255) NOT NULL,
    workflow_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    priority VARCHAR(20) DEFAULT 'medium',
    assigned_to UUID REFERENCES platform_users(id),
    created_by UUID REFERENCES platform_users(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_workflow_tenant ON workflow_instances(tenant_id);
CREATE INDEX IF NOT EXISTS idx_workflow_status ON workflow_instances(status);
CREATE INDEX IF NOT EXISTS idx_workflow_type ON workflow_instances(workflow_type);

-- ============================================
-- 4. WORKFLOW STEPS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS workflow_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES workflow_instances(id) ON DELETE CASCADE,
    step_name VARCHAR(255) NOT NULL,
    step_order INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    assigned_to UUID REFERENCES platform_users(id),
    completed_at TIMESTAMP,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_steps_workflow ON workflow_steps(workflow_id);
CREATE INDEX IF NOT EXISTS idx_steps_status ON workflow_steps(status);

-- ============================================
-- 5. AI FINANCE EVENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS ai_finance_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) DEFAULT 'medium',
    source_table VARCHAR(100),
    source_id UUID,
    event_data JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'pending',
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_events_tenant ON ai_finance_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON ai_finance_events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_status ON ai_finance_events(status);

-- ============================================
-- 6. AI FINANCE WORKFLOWS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS ai_finance_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    event_id UUID REFERENCES ai_finance_events(id),
    workflow_type VARCHAR(100) NOT NULL,
    workflow_name VARCHAR(255) NOT NULL,
    assigned_agent VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending',
    priority VARCHAR(20) DEFAULT 'medium',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ai_workflows_tenant ON ai_finance_workflows(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ai_workflows_event ON ai_finance_workflows(event_id);
CREATE INDEX IF NOT EXISTS idx_ai_workflows_status ON ai_finance_workflows(status);

-- ============================================
-- 7. LICENSE TYPES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS license_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    license_code VARCHAR(50) UNIQUE NOT NULL,
    license_name VARCHAR(255) NOT NULL,
    license_name_ar VARCHAR(255),
    monthly_cost NUMERIC(10, 2) NOT NULL DEFAULT 0,
    annual_cost NUMERIC(10, 2) NOT NULL DEFAULT 0,
    features JSONB DEFAULT '[]',
    max_users INTEGER,
    max_storage_gb INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 8. USER LICENSES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS user_licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES platform_users(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    license_type_id UUID REFERENCES license_types(id),
    license_key VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    is_owner BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_licenses_user ON user_licenses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_licenses_tenant ON user_licenses(tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_licenses_status ON user_licenses(status);

-- ============================================
-- 9. OWNER PERMISSIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS owner_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES platform_users(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    can_manage_licenses BOOLEAN DEFAULT false,
    can_view_costs BOOLEAN DEFAULT false,
    can_manage_billing BOOLEAN DEFAULT false,
    can_add_users BOOLEAN DEFAULT false,
    can_remove_users BOOLEAN DEFAULT false,
    can_assign_roles BOOLEAN DEFAULT false,
    can_view_analytics BOOLEAN DEFAULT false,
    can_export_data BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_owner_permissions_user ON owner_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_owner_permissions_tenant ON owner_permissions(tenant_id);

-- ============================================
-- 10. AUDIT LOGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES platform_users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_tenant ON audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);

-- ============================================
-- 11. TRANSACTIONS TABLE (for Red Flags)
-- ============================================

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    amount NUMERIC(15, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'SAR',
    debit_account_id UUID,
    credit_account_id UUID,
    description TEXT,
    transaction_date DATE DEFAULT CURRENT_DATE,
    created_by UUID REFERENCES platform_users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_transactions_tenant ON transactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_transactions_amount ON transactions(amount);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Generate License Key
CREATE OR REPLACE FUNCTION generate_license_key(tenant_uuid UUID, user_uuid UUID)
RETURNS VARCHAR(255) AS $$
BEGIN
    RETURN 'LIC-' || UPPER(SUBSTRING(tenant_uuid::text, 1, 8)) || '-' || 
           UPPER(SUBSTRING(user_uuid::text, 1, 8)) || '-' || 
           UPPER(SUBSTRING(gen_random_uuid()::text, 1, 8));
END;
$$ LANGUAGE plpgsql;

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Red Flags Detection Function
CREATE OR REPLACE FUNCTION detect_large_transaction()
RETURNS TRIGGER AS $$
DECLARE
    threshold NUMERIC := 100000;
    event_id UUID;
BEGIN
    IF NEW.amount >= threshold THEN
        INSERT INTO ai_finance_events (
            tenant_id,
            event_type,
            severity,
            source_table,
            source_id,
            event_data,
            status
        ) VALUES (
            NEW.tenant_id,
            'large_transaction',
            'high',
            'transactions',
            NEW.id,
            jsonb_build_object(
                'amount', NEW.amount,
                'currency', NEW.currency,
                'threshold', threshold,
                'description', NEW.description
            ),
            'pending'
        ) RETURNING id INTO event_id;
        
        RAISE NOTICE 'Large Transaction Detected: % % (Event: %)', NEW.amount, NEW.currency, event_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Update timestamp triggers
CREATE TRIGGER update_tenants_updated_at 
    BEFORE UPDATE ON tenants 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON platform_users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflows_updated_at 
    BEFORE UPDATE ON workflow_instances 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_permissions_updated_at 
    BEFORE UPDATE ON owner_permissions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Red Flags trigger
CREATE TRIGGER trigger_detect_large_transaction
    AFTER INSERT ON transactions
    FOR EACH ROW EXECUTE FUNCTION detect_large_transaction();

-- ============================================
-- SAMPLE DATA
-- ============================================

-- Insert license types
INSERT INTO license_types (license_code, license_name, license_name_ar, monthly_cost, annual_cost, features, max_users, max_storage_gb) VALUES
('BASIC', 'Basic License', 'ترخيص أساسي', 99.00, 990.00, '["dashboard", "basic_reports"]', 5, 10),
('PROFESSIONAL', 'Professional License', 'ترخيص احترافي', 299.00, 2990.00, '["dashboard", "advanced_reports", "api_access"]', 25, 100),
('ENTERPRISE', 'Enterprise License', 'ترخيص مؤسسي', 999.00, 9990.00, '["all_features", "white_label", "custom_support"]', NULL, NULL),
('OWNER', 'Owner License', 'ترخيص المالك', 0.00, 0.00, '["all_features", "full_access"]', NULL, NULL)
ON CONFLICT (license_code) DO NOTHING;

-- Insert sample tenant
INSERT INTO tenants (tenant_code, tenant_name, tenant_name_ar, status, subscription_tier) VALUES
('DEMO001', 'Demo Company', 'شركة تجريبية', 'active', 'professional')
ON CONFLICT (tenant_code) DO NOTHING;

-- Insert sample user
INSERT INTO platform_users (tenant_id, email, full_name, role, status) VALUES
((SELECT id FROM tenants WHERE tenant_code = 'DEMO001'), 'admin@demo.com', 'Demo Admin', 'super_admin', 'active')
ON CONFLICT (email) DO NOTHING;

-- Insert owner license
INSERT INTO user_licenses (
    user_id, 
    tenant_id, 
    license_type_id, 
    license_key, 
    status, 
    is_owner
) VALUES (
    (SELECT id FROM platform_users WHERE email = 'admin@demo.com'),
    (SELECT id FROM tenants WHERE tenant_code = 'DEMO001'),
    (SELECT id FROM license_types WHERE license_code = 'OWNER'),
    generate_license_key(
        (SELECT id FROM tenants WHERE tenant_code = 'DEMO001'),
        (SELECT id FROM platform_users WHERE email = 'admin@demo.com')
    ),
    'active',
    true
) ON CONFLICT (license_key) DO NOTHING;

-- Insert owner permissions
INSERT INTO owner_permissions (
    user_id,
    tenant_id,
    can_manage_licenses,
    can_view_costs,
    can_manage_billing,
    can_add_users,
    can_remove_users,
    can_assign_roles,
    can_view_analytics,
    can_export_data
) VALUES (
    (SELECT id FROM platform_users WHERE email = 'admin@demo.com'),
    (SELECT id FROM tenants WHERE tenant_code = 'DEMO001'),
    true, true, true, true, true, true, true, true
) ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check tables
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Check triggers
SELECT 
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY trigger_name;

-- Check functions
SELECT 
    proname as function_name,
    pronargs as arg_count
FROM pg_proc 
WHERE pronamespace = 'public'::regnamespace
    AND proname NOT LIKE 'pg_%'
ORDER BY proname;
