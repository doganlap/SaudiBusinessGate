-- =====================================================
-- CRITICAL INDEXES FOR PERFORMANCE
-- =====================================================

-- Users & Authentication
CREATE INDEX IF NOT EXISTS idx_users_email_active ON users(email) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_users_org_active ON users(organization_id, is_active);
CREATE INDEX IF NOT EXISTS idx_sessions_user_exp ON sessions(user_id, expires_at);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_user ON auth_tokens(user_id, expires_at) WHERE revoked = false;

-- Organizations & Subscriptions
CREATE INDEX IF NOT EXISTS idx_orgs_active ON organizations(id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_subscriptions_org ON organization_subscriptions(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan ON organization_subscriptions(plan_id) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_licenses_org ON licenses(organization_id, license_type);

-- Business Data (Hot Tables)
CREATE INDEX IF NOT EXISTS idx_transactions_org_date ON transactions(organization_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status, organization_id);
CREATE INDEX IF NOT EXISTS idx_invoices_org_date ON invoices(organization_id, invoice_date DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status, organization_id);
CREATE INDEX IF NOT EXISTS idx_customers_org_active ON customers(organization_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_org_active ON products(organization_id) WHERE is_active = true;

-- Analytics & Reporting
CREATE INDEX IF NOT EXISTS idx_usage_records_org_date ON usage_records(organization_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_records_feature ON usage_records(feature_name, organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_date ON audit_logs(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action_type, organization_id);

-- Full-Text Search Indexes
CREATE INDEX IF NOT EXISTS idx_customers_search ON customers 
  USING gin(to_tsvector('english', company_name || ' ' || COALESCE(contact_person, '')));
CREATE INDEX IF NOT EXISTS idx_products_search ON products 
  USING gin(to_tsvector('english', product_name || ' ' || COALESCE(description, '')));
CREATE INDEX IF NOT EXISTS idx_transactions_search ON transactions 
  USING gin(to_tsvector('english', description));

-- Composite Indexes for Common Queries
CREATE INDEX IF NOT EXISTS idx_transactions_org_status_date 
  ON transactions(organization_id, status, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_org_status_date 
  ON invoices(organization_id, status, invoice_date DESC);
CREATE INDEX IF NOT EXISTS idx_customers_org_status 
  ON customers(organization_id, status) WHERE is_active = true;

-- Partial Indexes for Active Records
CREATE INDEX IF NOT EXISTS idx_active_users 
  ON users(organization_id, email) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_active_subscriptions 
  ON organization_subscriptions(organization_id) WHERE status = 'active';

-- JSON/JSONB Indexes
CREATE INDEX IF NOT EXISTS idx_user_preferences_jsonb 
  ON users USING gin(preferences jsonb_path_ops);
CREATE INDEX IF NOT EXISTS idx_org_settings_jsonb 
  ON organizations USING gin(settings jsonb_path_ops);
CREATE INDEX IF NOT EXISTS idx_theme_colors_jsonb 
  ON white_label_themes USING gin(colors jsonb_path_ops);

-- =====================================================
-- CONNECTION POOLING
-- =====================================================

-- Increase connection limits
ALTER SYSTEM SET max_connections = 500;
ALTER SYSTEM SET shared_buffers = '4GB';
ALTER SYSTEM SET effective_cache_size = '12GB';
ALTER SYSTEM SET maintenance_work_mem = '1GB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
ALTER SYSTEM SET random_page_cost = 1.1; -- For SSD
ALTER SYSTEM SET work_mem = '32MB';
ALTER SYSTEM SET min_wal_size = '1GB';
ALTER SYSTEM SET max_wal_size = '4GB';

SELECT pg_reload_conf();

-- =====================================================
-- QUERY STATISTICS
-- =====================================================

-- Enable pg_stat_statements for query analysis
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;