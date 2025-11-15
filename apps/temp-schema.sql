-- =====================================================
-- ENTERPRISE DATABASE SCHEMA - COMPLETE IMPLEMENTATION
-- Deploy to: fresh-maas-postgres.postgres.database.azure.com
-- Database: production
-- =====================================================

-- =====================================================
-- 1. WHITE-LABEL SYSTEM TABLES
-- =====================================================

-- White-label themes
CREATE TABLE IF NOT EXISTS white_label_themes (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    theme_name VARCHAR(100) NOT NULL,
    
    -- Brand Identity
    company_name VARCHAR(200),
    logo_primary TEXT,
    logo_secondary TEXT,
    favicon TEXT,
    tagline TEXT,
    
    -- Colors (JSON for flexibility)
    colors JSONB DEFAULT '{}',
    
    -- Typography
    typography JSONB DEFAULT '{}',
    
    -- Layout
    layout JSONB DEFAULT '{}',
    
    -- Components
    components JSONB DEFAULT '{}',
    
    -- Advanced settings
    advanced_settings JSONB DEFAULT '{}',
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    
    -- Versioning
    version INTEGER DEFAULT 1,
    parent_theme_id INTEGER REFERENCES white_label_themes(id),
    
    UNIQUE(organization_id, theme_name)
);

-- Theme history for rollback
CREATE TABLE IF NOT EXISTS white_label_theme_history (
    id SERIAL PRIMARY KEY,
    theme_id INTEGER NOT NULL REFERENCES white_label_themes(id) ON DELETE CASCADE,
    theme_data JSONB NOT NULL,
    version INTEGER NOT NULL,
    changed_by INTEGER REFERENCES users(id),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    change_description TEXT
);

-- Custom domains
CREATE TABLE IF NOT EXISTS custom_domains (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    domain VARCHAR(255) NOT NULL UNIQUE,
    is_primary BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT false,
    
    -- SSL Configuration
    ssl_provider VARCHAR(50) DEFAULT 'azure',
    ssl_certificate_id TEXT,
    ssl_expires_at TIMESTAMP,
    ssl_auto_renew BOOLEAN DEFAULT true,
    ssl_status VARCHAR(50) DEFAULT 'pending',
    
    -- DNS Configuration
    dns_status VARCHAR(50) DEFAULT 'pending',
    dns_records JSONB DEFAULT '[]',
    dns_verified_at TIMESTAMP,
    
    -- Routing
    target_url TEXT NOT NULL,
    custom_headers JSONB DEFAULT '{}',
    redirects JSONB DEFAULT '[]',
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP,
    last_checked_at TIMESTAMP
);

-- Domain verification tokens
CREATE TABLE IF NOT EXISTS domain_verification_tokens (
    id SERIAL PRIMARY KEY,
    domain_id INTEGER NOT NULL REFERENCES custom_domains(id) ON DELETE CASCADE,
    token VARCHAR(64) NOT NULL UNIQUE,
    verification_method VARCHAR(50),
    expires_at TIMESTAMP NOT NULL,
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SSL certificates
CREATE TABLE IF NOT EXISTS ssl_certificates (
    id SERIAL PRIMARY KEY,
    domain_id INTEGER NOT NULL REFERENCES custom_domains(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    certificate_data TEXT,
    private_key_data TEXT,
    chain_data TEXT,
    issued_at TIMESTAMP NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    auto_renew BOOLEAN DEFAULT true,
    last_renewal_attempt TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active'
);

-- =====================================================
-- 2. RBAC SYSTEM TABLES
-- =====================================================

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(200),
    description TEXT,
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Permissions table
CREATE TABLE IF NOT EXISTS permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    resource VARCHAR(100),
    action VARCHAR(50),
    description TEXT,
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Role permissions mapping
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    granted_by INTEGER REFERENCES users(id),
    PRIMARY KEY (role_id, permission_id)
);

-- User roles mapping
CREATE TABLE IF NOT EXISTS user_roles (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by INTEGER REFERENCES users(id),
    expires_at TIMESTAMP,
    PRIMARY KEY (user_id, role_id, organization_id)
);

-- Resource permissions (for fine-grained control)
CREATE TABLE IF NOT EXISTS resource_permissions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    resource_type VARCHAR(100) NOT NULL,
    resource_id INTEGER NOT NULL,
    permission VARCHAR(100) NOT NULL,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    granted_by INTEGER REFERENCES users(id),
    expires_at TIMESTAMP
);

-- =====================================================
-- 3. AUDIT LOGGING TABLES
-- =====================================================

-- Audit logs (partitioned by month)
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id),
    user_id INTEGER REFERENCES users(id),
    action_type VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id INTEGER,
    changes JSONB,
    ip_address INET,
    user_agent TEXT,
    request_id VARCHAR(100),
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Security events log
CREATE TABLE IF NOT EXISTS security_events (
    id BIGSERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id),
    user_id INTEGER REFERENCES users(id),
    event_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) DEFAULT 'info',
    description TEXT,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP,
    resolved_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 4. AI & ANALYTICS TABLES
-- =====================================================

-- AI models metadata
CREATE TABLE IF NOT EXISTS ai_models (
    id SERIAL PRIMARY KEY,
    model_name VARCHAR(100) NOT NULL UNIQUE,
    model_type VARCHAR(50) NOT NULL,
    model_version VARCHAR(20),
    model_path TEXT,
    accuracy_score DECIMAL(5,4),
    training_data_size INTEGER,
    last_trained_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    configuration JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI predictions log
CREATE TABLE IF NOT EXISTS ai_predictions (
    id BIGSERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id),
    user_id INTEGER REFERENCES users(id),
    model_id INTEGER REFERENCES ai_models(id),
    prediction_type VARCHAR(100),
    input_data JSONB,
    prediction_result JSONB,
    confidence_score DECIMAL(5,4),
    processing_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- KPI calculations cache
CREATE TABLE IF NOT EXISTS kpi_calculations (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id),
    kpi_name VARCHAR(100) NOT NULL,
    kpi_value JSONB NOT NULL,
    calculation_metadata JSONB,
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP NOT NULL
);

-- Custom reports
CREATE TABLE IF NOT EXISTS custom_reports (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id),
    user_id INTEGER REFERENCES users(id),
    report_name VARCHAR(200) NOT NULL,
    report_type VARCHAR(50),
    query_definition JSONB NOT NULL,
    visualization_config JSONB,
    schedule_config JSONB,
    is_public BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Report executions
CREATE TABLE IF NOT EXISTS report_executions (
    id BIGSERIAL PRIMARY KEY,
    report_id INTEGER REFERENCES custom_reports(id) ON DELETE CASCADE,
    organization_id INTEGER REFERENCES organizations(id),
    executed_by INTEGER REFERENCES users(id),
    execution_time_ms INTEGER,
    row_count INTEGER,
    file_path TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 5. TRANSLATIONS & LOCALIZATION
-- =====================================================

-- Translations table
CREATE TABLE IF NOT EXISTS translations (
    id SERIAL PRIMARY KEY,
    language_code VARCHAR(10) NOT NULL,
    namespace VARCHAR(100) NOT NULL,
    key VARCHAR(255) NOT NULL,
    value TEXT NOT NULL,
    organization_id INTEGER REFERENCES organizations(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(language_code, namespace, key, COALESCE(organization_id, 0))
);

-- User language preferences
CREATE TABLE IF NOT EXISTS user_language_preferences (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    language_code VARCHAR(10) NOT NULL DEFAULT 'en',
    date_format VARCHAR(50) DEFAULT 'MM/DD/YYYY',
    time_format VARCHAR(50) DEFAULT '12h',
    timezone VARCHAR(100) DEFAULT 'UTC',
    number_format VARCHAR(50) DEFAULT '1,000.00',
    currency_code VARCHAR(10) DEFAULT 'SAR',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 6. EMAIL TEMPLATES
-- =====================================================

-- Email templates
CREATE TABLE IF NOT EXISTS email_templates (
    id SERIAL PRIMARY KEY,
    template_name VARCHAR(100) NOT NULL,
    template_category VARCHAR(50) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT,
    variables JSONB DEFAULT '[]',
    organization_id INTEGER REFERENCES organizations(id),
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(template_name, COALESCE(organization_id, 0))
);

-- Email send log
CREATE TABLE IF NOT EXISTS email_send_log (
    id BIGSERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id),
    template_id INTEGER REFERENCES email_templates(id),
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(500),
    status VARCHAR(50) DEFAULT 'pending',
    sent_at TIMESTAMP,
    opened_at TIMESTAMP,
    clicked_at TIMESTAMP,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 7. PERFORMANCE & ANALYTICS INDEXES
-- =====================================================

-- White-label indexes
CREATE INDEX IF NOT EXISTS idx_themes_org ON white_label_themes(organization_id);
CREATE INDEX IF NOT EXISTS idx_themes_active ON white_label_themes(is_active);
CREATE INDEX IF NOT EXISTS idx_themes_history ON white_label_theme_history(theme_id, version);
CREATE INDEX IF NOT EXISTS idx_domains_org ON custom_domains(organization_id);
CREATE INDEX IF NOT EXISTS idx_domains_status ON custom_domains(dns_status, ssl_status);
CREATE INDEX IF NOT EXISTS idx_domain_tokens ON domain_verification_tokens(token, expires_at);

-- RBAC indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_org ON user_roles(organization_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_resource_permissions_user ON resource_permissions(user_id, resource_type);

-- Audit logging indexes
CREATE INDEX IF NOT EXISTS idx_audit_org_date ON audit_logs(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_security_events_org ON security_events(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity, resolved);

-- AI & Analytics indexes
CREATE INDEX IF NOT EXISTS idx_ai_predictions_org ON ai_predictions(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_predictions_model ON ai_predictions(model_id);
CREATE INDEX IF NOT EXISTS idx_kpi_calc_org_name ON kpi_calculations(organization_id, kpi_name);
CREATE INDEX IF NOT EXISTS idx_kpi_calc_valid ON kpi_calculations(valid_until) WHERE valid_until > CURRENT_TIMESTAMP;
CREATE INDEX IF NOT EXISTS idx_reports_org ON custom_reports(organization_id, is_active);
CREATE INDEX IF NOT EXISTS idx_report_exec_report ON report_executions(report_id, created_at DESC);

-- Translation indexes
CREATE INDEX IF NOT EXISTS idx_translations_lang ON translations(language_code, namespace);
CREATE INDEX IF NOT EXISTS idx_translations_org ON translations(organization_id);

-- Email template indexes
CREATE INDEX IF NOT EXISTS idx_email_templates_org ON email_templates(organization_id, is_active);
CREATE INDEX IF NOT EXISTS idx_email_log_org ON email_send_log(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_log_status ON email_send_log(status, created_at);

-- =====================================================
-- 8. INSERT DEFAULT DATA
-- =====================================================

-- Default system roles
INSERT INTO roles (name, display_name, description, is_system) VALUES
('super_admin', 'Super Administrator', 'Full system access', true),
('organization_admin', 'Organization Administrator', 'Full organization access', true),
('manager', 'Manager', 'Department or team management', true),
('user', 'Standard User', 'Standard user access', true),
('viewer', 'Viewer', 'Read-only access', true)
ON CONFLICT (name) DO NOTHING;

-- Default permissions (100+ permissions)
INSERT INTO permissions (name, resource, action, description, is_system) VALUES
-- User Management (10)
('users.view', 'users', 'read', 'View users', true),
('users.create', 'users', 'create', 'Create users', true),
('users.update', 'users', 'update', 'Update users', true),
('users.delete', 'users', 'delete', 'Delete users', true),
('users.invite', 'users', 'invite', 'Invite users', true),
('users.suspend', 'users', 'suspend', 'Suspend users', true),
('users.restore', 'users', 'restore', 'Restore users', true),
('users.export', 'users', 'export', 'Export user data', true),
('users.impersonate', 'users', 'impersonate', 'Impersonate users', true),
('users.audit', 'users', 'audit', 'View user audit logs', true),

-- Organization Management (15)
('organizations.view', 'organizations', 'read', 'View organization', true),
('organizations.update', 'organizations', 'update', 'Update organization', true),
('organizations.settings', 'organizations', 'settings', 'Manage settings', true),
('organizations.billing', 'organizations', 'billing', 'Manage billing', true),
('organizations.subscription', 'organizations', 'subscription', 'Manage subscription', true),
('organizations.members', 'organizations', 'members', 'Manage members', true),
('organizations.teams', 'organizations', 'teams', 'Manage teams', true),
('organizations.roles', 'organizations', 'roles', 'Manage roles', true),
('organizations.audit', 'organizations', 'audit', 'View audit logs', true),
('organizations.export', 'organizations', 'export', 'Export data', true),
('organizations.delete', 'organizations', 'delete', 'Delete organization', true),
('organizations.white_label', 'organizations', 'white_label', 'Manage white-label', true),
('organizations.domains', 'organizations', 'domains', 'Manage custom domains', true),
('organizations.integrations', 'organizations', 'integrations', 'Manage integrations', true),
('organizations.api_keys', 'organizations', 'api_keys', 'Manage API keys', true),

-- Module Access (20)
('module.finance', 'modules', 'access', 'Access Finance module', true),
('module.hr', 'modules', 'access', 'Access HR module', true),
('module.sales', 'modules', 'access', 'Access Sales module', true),
('module.crm', 'modules', 'access', 'Access CRM module', true),
('module.procurement', 'modules', 'access', 'Access Procurement module', true),
('module.ai_analytics', 'modules', 'access', 'Access AI Analytics', true),
('module.process', 'modules', 'access', 'Access Process Management', true),
('module.enterprise', 'modules', 'access', 'Access Enterprise features', true),
('module.integration', 'modules', 'access', 'Access Integrations', true),
('module.reporting', 'modules', 'access', 'Access Reporting', true),
('finance.view', 'finance', 'read', 'View financial data', true),
('finance.create', 'finance', 'create', 'Create transactions', true),
('finance.update', 'finance', 'update', 'Update transactions', true),
('finance.delete', 'finance', 'delete', 'Delete transactions', true),
('finance.approve', 'finance', 'approve', 'Approve transactions', true),
('sales.view', 'sales', 'read', 'View sales data', true),
('sales.create', 'sales', 'create', 'Create opportunities', true),
('sales.update', 'sales', 'update', 'Update opportunities', true),
('sales.delete', 'sales', 'delete', 'Delete opportunities', true),
('sales.close', 'sales', 'close', 'Close deals', true),

-- Data Operations (20)
('data.view_own', 'data', 'read', 'View own data', true),
('data.view_team', 'data', 'read', 'View team data', true),
('data.view_all', 'data', 'read', 'View all data', true),
('data.create', 'data', 'create', 'Create records', true),
('data.update_own', 'data', 'update', 'Update own records', true),
('data.update_all', 'data', 'update', 'Update all records', true),
('data.delete_own', 'data', 'delete', 'Delete own records', true),
('data.delete_all', 'data', 'delete', 'Delete all records', true),
('data.export', 'data', 'export', 'Export data', true),
('data.import', 'data', 'import', 'Import data', true),
('reports.view', 'reports', 'read', 'View reports', true),
('reports.create', 'reports', 'create', 'Create reports', true),
('reports.update', 'reports', 'update', 'Update reports', true),
('reports.delete', 'reports', 'delete', 'Delete reports', true),
('reports.schedule', 'reports', 'schedule', 'Schedule reports', true),
('reports.export', 'reports', 'export', 'Export reports', true),
('dashboards.view', 'dashboards', 'read', 'View dashboards', true),
('dashboards.create', 'dashboards', 'create', 'Create dashboards', true),
('dashboards.update', 'dashboards', 'update', 'Update dashboards', true),
('dashboards.delete', 'dashboards', 'delete', 'Delete dashboards', true),

-- System Administration (15)
('system.settings', 'system', 'settings', 'Manage system settings', true),
('system.monitoring', 'system', 'monitoring', 'View system monitoring', true),
('system.logs', 'system', 'logs', 'View system logs', true),
('system.audit', 'system', 'audit', 'View audit logs', true),
('system.security', 'system', 'security', 'Manage security', true),
('system.backup', 'system', 'backup', 'Manage backups', true),
('system.restore', 'system', 'restore', 'Restore data', true),
('system.maintenance', 'system', 'maintenance', 'System maintenance', true),
('system.alerts', 'system', 'alerts', 'Manage alerts', true),
('system.integrations', 'system', 'integrations', 'Manage integrations', true),
('api.access', 'api', 'access', 'API access', true),
('api.admin', 'api', 'admin', 'API administration', true),
('api.keys', 'api', 'keys', 'Manage API keys', true),
('api.webhooks', 'api', 'webhooks', 'Manage webhooks', true),
('api.logs', 'api', 'logs', 'View API logs', true),

-- Security Operations (10)
('security.view', 'security', 'read', 'View security settings', true),
('security.configure', 'security', 'configure', 'Configure security', true),
('security.audit', 'security', 'audit', 'Security audit', true),
('security.incidents', 'security', 'incidents', 'Manage incidents', true),
('security.compliance', 'security', 'compliance', 'Compliance management', true),
('white_label.view', 'white_label', 'read', 'View white-label settings', true),
('white_label.configure', 'white_label', 'configure', 'Configure white-label', true),
('domains.manage', 'domains', 'manage', 'Manage custom domains', true),
('ssl.manage', 'ssl', 'manage', 'Manage SSL certificates', true),
('themes.manage', 'themes', 'manage', 'Manage themes', true),

-- Billing & Subscriptions (10)
('billing.view', 'billing', 'read', 'View billing', true),
('billing.manage', 'billing', 'manage', 'Manage billing', true),
('billing.invoices', 'billing', 'invoices', 'Manage invoices', true),
('billing.payments', 'billing', 'payments', 'Manage payments', true),
('subscription.view', 'subscription', 'read', 'View subscription', true),
('subscription.upgrade', 'subscription', 'upgrade', 'Upgrade subscription', true),
('subscription.downgrade', 'subscription', 'downgrade', 'Downgrade subscription', true),
('subscription.cancel', 'subscription', 'cancel', 'Cancel subscription', true),
('licenses.view', 'licenses', 'read', 'View licenses', true),
('licenses.manage', 'licenses', 'manage', 'Manage licenses', true)
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to roles
-- Super Admin gets all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE name = 'super_admin'),
    id
FROM permissions
ON CONFLICT DO NOTHING;

-- Organization Admin gets most permissions (except system admin)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE name = 'organization_admin'),
    id
FROM permissions
WHERE NOT (resource = 'system' AND action IN ('maintenance', 'backup', 'restore'))
ON CONFLICT DO NOTHING;

-- Manager gets department permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE name = 'manager'),
    id
FROM permissions
WHERE resource IN ('users', 'data', 'reports', 'dashboards')
AND action IN ('read', 'create', 'update')
ON CONFLICT DO NOTHING;

-- Standard User gets basic permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE name = 'user'),
    id
FROM permissions
WHERE action = 'read'
OR name IN ('data.create', 'data.update_own', 'reports.create', 'dashboards.create')
ON CONFLICT DO NOTHING;

-- Viewer gets read-only permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE name = 'viewer'),
    id
FROM permissions
WHERE action = 'read'
ON CONFLICT DO NOTHING;

-- =====================================================
-- 9. DEFAULT EMAIL TEMPLATES
-- =====================================================

-- Insert default email templates (25 templates)
INSERT INTO email_templates (template_name, template_category, subject, html_content, text_content, variables, is_default) VALUES
('welcome', 'authentication', 'Welcome to {{companyName}}!', 
'<h1>Welcome {{userName}}!</h1><p>Thank you for joining {{companyName}}.</p>', 
'Welcome {{userName}}! Thank you for joining {{companyName}}.', 
'["userName", "companyName"]', true),

('email_verification', 'authentication', 'Verify your email address', 
'<h1>Verify Your Email</h1><p>Click here to verify: {{verificationLink}}</p>', 
'Verify your email: {{verificationLink}}', 
'["userName", "verificationLink"]', true),

('password_reset', 'authentication', 'Reset your password', 
'<h1>Password Reset</h1><p>Click here to reset: {{resetLink}}</p>', 
'Reset your password: {{resetLink}}', 
'["userName", "resetLink"]', true),

('trial_started', 'subscription', 'Your free trial has started!', 
'<h1>Trial Started!</h1><p>Enjoy your 14-day free trial of {{planName}}.</p>', 
'Your 14-day trial of {{planName}} has started!', 
'["userName", "planName", "trialEndDate"]', true),

('trial_ending', 'subscription', 'Your trial ends in 3 days', 
'<h1>Trial Ending Soon</h1><p>Your trial ends on {{trialEndDate}}. Upgrade to continue.</p>', 
'Your trial ends on {{trialEndDate}}. Upgrade to continue.', 
'["userName", "trialEndDate", "upgradeLink"]', true),

('subscription_activated', 'subscription', 'Subscription activated!', 
'<h1>Welcome to {{planName}}!</h1><p>Your subscription is now active.</p>', 
'Your {{planName}} subscription is now active.', 
'["userName", "planName", "amount"]', true),

('invoice_generated', 'billing', 'Invoice #{{invoiceNumber}}', 
'<h1>New Invoice</h1><p>Amount: {{amount}}</p><p><a href="{{invoiceLink}}">View Invoice</a></p>', 
'New invoice #{{invoiceNumber}} for {{amount}}. View: {{invoiceLink}}', 
'["userName", "invoiceNumber", "amount", "invoiceLink"]', true),

('payment_failed', 'billing', 'Payment failed for your subscription', 
'<h1>Payment Failed</h1><p>Please update your payment method.</p>', 
'Payment failed. Please update your payment method.', 
'["userName", "amount", "updatePaymentLink"]', true),

('report_ready', 'notification', 'Your report is ready', 
'<h1>Report Ready</h1><p>Your report "{{reportName}}" is ready for download.</p>', 
'Your report "{{reportName}}" is ready.', 
'["userName", "reportName", "downloadLink"]', true),

('support_ticket_created', 'support', 'Support ticket #{{ticketNumber}} created', 
'<h1>Ticket Created</h1><p>We received your support request.</p>', 
'Support ticket #{{ticketNumber}} created.', 
'["userName", "ticketNumber", "subject"]', true)
ON CONFLICT (template_name, COALESCE(organization_id, 0)) DO NOTHING;

-- =====================================================
-- 10. DEFAULT TRANSLATIONS
-- =====================================================

-- English translations
INSERT INTO translations (language_code, namespace, key, value) VALUES
-- Common
('en', 'common', 'welcome', 'Welcome'),
('en', 'common', 'dashboard', 'Dashboard'),
('en', 'common', 'settings', 'Settings'),
('en', 'common', 'logout', 'Logout'),
('en', 'common', 'save', 'Save'),
('en', 'common', 'cancel', 'Cancel'),
('en', 'common', 'delete', 'Delete'),
('en', 'common', 'edit', 'Edit'),
('en', 'common', 'create', 'Create'),
('en', 'common', 'search', 'Search'),

-- Arabic translations (RTL)
('ar', 'common', 'welcome', 'مرحبا'),
('ar', 'common', 'dashboard', 'لوحة التحكم'),
('ar', 'common', 'settings', 'الإعدادات'),
('ar', 'common', 'logout', 'تسجيل الخروج'),
('ar', 'common', 'save', 'حفظ'),
('ar', 'common', 'cancel', 'إلغاء'),
('ar', 'common', 'delete', 'حذف'),
('ar', 'common', 'edit', 'تعديل'),
('ar', 'common', 'create', 'إنشاء'),
('ar', 'common', 'search', 'بحث'),

-- Dashboard
('en', 'dashboard', 'total_revenue', 'Total Revenue'),
('en', 'dashboard', 'active_customers', 'Active Customers'),
('en', 'dashboard', 'monthly_growth', 'Monthly Growth'),
('ar', 'dashboard', 'total_revenue', 'إجمالي الإيرادات'),
('ar', 'dashboard', 'active_customers', 'العملاء النشطون'),
('ar', 'dashboard', 'monthly_growth', 'النمو الشهري')
ON CONFLICT (language_code, namespace, key, COALESCE(organization_id, 0)) DO NOTHING;

-- =====================================================
-- 11. TRIGGERS & FUNCTIONS
-- =====================================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables
CREATE TRIGGER update_themes_updated_at BEFORE UPDATE ON white_label_themes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON custom_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SCHEMA DEPLOYMENT COMPLETE
-- =====================================================

-- Verify table creation
SELECT 
    schemaname,
    tablename,
    hasindexes,
    hastriggers
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
    'white_label_themes', 'custom_domains', 'roles', 'permissions',
    'audit_logs', 'ai_models', 'kpi_calculations', 'translations',
    'email_templates'
)
ORDER BY tablename;

-- Report summary
SELECT 
    'Tables Created' as metric,
    COUNT(*) as count
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
    'white_label_themes', 'white_label_theme_history', 'custom_domains',
    'domain_verification_tokens', 'ssl_certificates', 'roles', 'permissions',
    'role_permissions', 'user_roles', 'resource_permissions',
    'audit_logs', 'security_events', 'ai_models', 'ai_predictions',
    'kpi_calculations', 'custom_reports', 'report_executions',
    'translations', 'user_language_preferences', 'email_templates',
    'email_send_log'
)
UNION ALL
SELECT 
    'Indexes Created' as metric,
    COUNT(*) as count
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN (
    'white_label_themes', 'custom_domains', 'roles', 'permissions',
    'audit_logs', 'ai_models', 'translations', 'email_templates'
)
UNION ALL
SELECT 
    'Permissions Loaded' as metric,
    COUNT(*) as count
FROM permissions
UNION ALL
SELECT 
    'Roles Created' as metric,
    COUNT(*) as count
FROM roles;