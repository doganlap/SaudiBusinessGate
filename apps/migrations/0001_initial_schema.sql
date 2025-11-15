-- Dogan AI Platform - Initial Database Schema
-- Migration: 0001_initial_schema.sql

-- Users and Authentication
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user',
    tenant_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME
);

-- License Management
CREATE TABLE licenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    tenant_id TEXT NOT NULL,
    tier TEXT NOT NULL CHECK (tier IN ('basic', 'professional', 'enterprise', 'platform')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'suspended', 'cancelled')),
    expires_at DATETIME,
    features TEXT, -- JSON string of enabled features
    limits TEXT,   -- JSON string of usage limits
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- License Usage Tracking
CREATE TABLE license_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    license_id INTEGER REFERENCES licenses(id),
    tenant_id TEXT NOT NULL,
    usage_type TEXT NOT NULL, -- 'api_calls', 'storage', 'users', etc.
    usage_count INTEGER DEFAULT 0,
    usage_date DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- GRC Framework
CREATE TABLE grc_frameworks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    version TEXT,
    country_code TEXT,
    industry TEXT,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- GRC Controls
CREATE TABLE grc_controls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    framework_id INTEGER REFERENCES grc_frameworks(id),
    control_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    implementation_guidance TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- GRC Assessments
CREATE TABLE grc_assessments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id TEXT NOT NULL,
    framework_id INTEGER REFERENCES grc_frameworks(id),
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'archived')),
    completion_percentage REAL DEFAULT 0,
    assigned_to INTEGER REFERENCES users(id),
    due_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- GRC Assessment Results
CREATE TABLE grc_assessment_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    assessment_id INTEGER REFERENCES grc_assessments(id),
    control_id INTEGER REFERENCES grc_controls(id),
    compliance_status TEXT CHECK (compliance_status IN ('compliant', 'non_compliant', 'partially_compliant', 'not_applicable')),
    evidence TEXT,
    notes TEXT,
    risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    remediation_plan TEXT,
    assessed_by INTEGER REFERENCES users(id),
    assessed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- CRM - Contacts
CREATE TABLE crm_contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    company TEXT,
    position TEXT,
    source TEXT,
    status TEXT DEFAULT 'active',
    tags TEXT, -- JSON array
    custom_fields TEXT, -- JSON object
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- CRM - Deals
CREATE TABLE crm_deals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    value REAL,
    currency TEXT DEFAULT 'USD',
    stage TEXT NOT NULL,
    probability INTEGER DEFAULT 0,
    contact_id INTEGER REFERENCES crm_contacts(id),
    assigned_to INTEGER REFERENCES users(id),
    expected_close_date DATETIME,
    actual_close_date DATETIME,
    source TEXT,
    tags TEXT, -- JSON array
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Finance - Invoices
CREATE TABLE finance_invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id TEXT NOT NULL,
    invoice_number TEXT UNIQUE NOT NULL,
    customer_id INTEGER REFERENCES crm_contacts(id),
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
    due_date DATETIME,
    paid_date DATETIME,
    payment_method TEXT,
    notes TEXT,
    line_items TEXT, -- JSON array
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Analytics - Events
CREATE TABLE analytics_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id TEXT,
    user_id INTEGER REFERENCES users(id),
    event_type TEXT NOT NULL,
    event_data TEXT, -- JSON object
    session_id TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Workflows
CREATE TABLE workflows (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    trigger_type TEXT NOT NULL,
    trigger_config TEXT, -- JSON object
    actions TEXT, -- JSON array of actions
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
    created_by INTEGER REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Workflow Executions
CREATE TABLE workflow_executions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workflow_id INTEGER REFERENCES workflows(id),
    status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
    input_data TEXT, -- JSON object
    output_data TEXT, -- JSON object
    error_message TEXT,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME
);

-- Reports
CREATE TABLE reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    report_type TEXT NOT NULL,
    config TEXT, -- JSON object with report configuration
    schedule TEXT, -- Cron expression for scheduled reports
    last_generated DATETIME,
    created_by INTEGER REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- System Monitoring
CREATE TABLE system_monitoring (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metric_name TEXT NOT NULL,
    metric_value REAL,
    metric_unit TEXT,
    tags TEXT, -- JSON object
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- AI Interactions
CREATE TABLE ai_interactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id TEXT,
    user_id INTEGER REFERENCES users(id),
    model TEXT NOT NULL,
    prompt TEXT NOT NULL,
    response TEXT,
    tokens_used INTEGER,
    response_time_ms INTEGER,
    cost REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Vector Embeddings Metadata
CREATE TABLE vector_embeddings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id TEXT,
    content_type TEXT NOT NULL, -- 'document', 'product', 'support', 'grc'
    content_id TEXT NOT NULL,
    title TEXT,
    content TEXT,
    metadata TEXT, -- JSON object
    vector_id TEXT, -- Reference to Vectorize index
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_licenses_tenant_id ON licenses(tenant_id);
CREATE INDEX idx_licenses_status ON licenses(status);
CREATE INDEX idx_license_usage_tenant_date ON license_usage(tenant_id, usage_date);
CREATE INDEX idx_grc_assessments_tenant ON grc_assessments(tenant_id);
CREATE INDEX idx_crm_contacts_tenant ON crm_contacts(tenant_id);
CREATE INDEX idx_crm_deals_tenant ON crm_deals(tenant_id);
CREATE INDEX idx_finance_invoices_tenant ON finance_invoices(tenant_id);
CREATE INDEX idx_analytics_events_tenant ON analytics_events(tenant_id);
CREATE INDEX idx_workflows_tenant ON workflows(tenant_id);
CREATE INDEX idx_reports_tenant ON reports(tenant_id);
CREATE INDEX idx_ai_interactions_tenant ON ai_interactions(tenant_id);
CREATE INDEX idx_vector_embeddings_tenant_type ON vector_embeddings(tenant_id, content_type);