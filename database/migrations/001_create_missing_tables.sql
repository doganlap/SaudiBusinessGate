-- =====================================================
-- MISSING DATABASE TABLES MIGRATION
-- Saudi Business Gate Platform - Production Ready Schema
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- AI AGENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_agents (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    tenant_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    agent_type VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'error', 'maintenance')),
    description TEXT,
    description_ar TEXT,
    capabilities JSONB DEFAULT '[]',
    model VARCHAR(100) DEFAULT 'gpt-4',
    provider VARCHAR(100) DEFAULT 'OpenAI',
    last_active TIMESTAMP WITH TIME ZONE,
    tasks_completed INTEGER DEFAULT 0,
    tasks_in_progress INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0.00 CHECK (success_rate >= 0 AND success_rate <= 100),
    avg_response_time DECIMAL(8,2) DEFAULT 0.00,
    configuration JSONB DEFAULT '{}',
    metrics JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for ai_agents
CREATE INDEX IF NOT EXISTS idx_ai_agents_tenant_id ON ai_agents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ai_agents_status ON ai_agents(status);
CREATE INDEX IF NOT EXISTS idx_ai_agents_type ON ai_agents(agent_type);
CREATE INDEX IF NOT EXISTS idx_ai_agents_active ON ai_agents(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_agents_uuid ON ai_agents(uuid);

-- =====================================================
-- THEMES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS themes (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    tenant_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    description TEXT,
    description_ar TEXT,
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    colors JSONB DEFAULT '{}',
    typography JSONB DEFAULT '{}',
    spacing JSONB DEFAULT '{}',
    border_radius JSONB DEFAULT '{}',
    shadows JSONB DEFAULT '{}',
    branding JSONB DEFAULT '{}',
    custom_css TEXT,
    version VARCHAR(20) DEFAULT '1.0.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for themes
CREATE INDEX IF NOT EXISTS idx_themes_tenant_id ON themes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_themes_active ON themes(is_active);
CREATE INDEX IF NOT EXISTS idx_themes_default ON themes(is_default);
CREATE INDEX IF NOT EXISTS idx_themes_uuid ON themes(uuid);

-- Ensure only one default theme per tenant
CREATE UNIQUE INDEX IF NOT EXISTS idx_themes_tenant_default 
ON themes(tenant_id) WHERE is_default = true;

-- =====================================================
-- TENANT WEBHOOK CONFIGURATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS tenant_webhook_configs (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    tenant_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    webhook_url VARCHAR(500) NOT NULL,
    secret_key VARCHAR(255),
    http_method VARCHAR(10) DEFAULT 'POST' CHECK (http_method IN ('POST', 'PUT', 'PATCH')),
    headers JSONB DEFAULT '{}',
    timeout_seconds INTEGER DEFAULT 30,
    retry_attempts INTEGER DEFAULT 3,
    is_active BOOLEAN DEFAULT true,
    last_triggered TIMESTAMP WITH TIME ZONE,
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for tenant_webhook_configs
CREATE INDEX IF NOT EXISTS idx_webhook_configs_tenant_id ON tenant_webhook_configs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_webhook_configs_event_type ON tenant_webhook_configs(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_configs_active ON tenant_webhook_configs(is_active);
CREATE INDEX IF NOT EXISTS idx_webhook_configs_uuid ON tenant_webhook_configs(uuid);

-- Unique constraint for tenant + event_type combination
CREATE UNIQUE INDEX IF NOT EXISTS idx_webhook_configs_tenant_event 
ON tenant_webhook_configs(tenant_id, event_type) WHERE is_active = true;

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    tenant_id VARCHAR(255),
    user_id VARCHAR(255),
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    message_ar TEXT,
    severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'success', 'critical')),
    category VARCHAR(50) DEFAULT 'general',
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    action_url VARCHAR(500),
    action_label VARCHAR(100),
    action_label_ar VARCHAR(100),
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_tenant_id ON notifications(tenant_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_severity ON notifications(severity);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON notifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_notifications_uuid ON notifications(uuid);

-- =====================================================
-- WORKFLOW TEMPLATES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS workflow_templates (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    tenant_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    description TEXT,
    description_ar TEXT,
    category VARCHAR(50) DEFAULT 'general' CHECK (category IN ('finance', 'compliance', 'hr', 'general', 'sales', 'procurement')),
    version VARCHAR(20) DEFAULT '1.0.0',
    nodes JSONB DEFAULT '[]',
    edges JSONB DEFAULT '[]',
    variables JSONB DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    is_published BOOLEAN DEFAULT false,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    tags TEXT[],
    execution_count INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0.00,
    avg_execution_time INTEGER DEFAULT 0, -- in seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for workflow_templates
CREATE INDEX IF NOT EXISTS idx_workflow_templates_tenant_id ON workflow_templates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_category ON workflow_templates(category);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_active ON workflow_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_published ON workflow_templates(is_published);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_created_by ON workflow_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_tags ON workflow_templates USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_uuid ON workflow_templates(uuid);

-- =====================================================
-- WORKFLOW EXECUTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS workflow_executions (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    workflow_template_id INTEGER REFERENCES workflow_templates(id) ON DELETE CASCADE,
    tenant_id VARCHAR(255) NOT NULL,
    executed_by VARCHAR(255),
    trigger_type VARCHAR(50) DEFAULT 'manual' CHECK (trigger_type IN ('manual', 'scheduled', 'webhook', 'event')),
    trigger_data JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled', 'timeout')),
    input_data JSONB DEFAULT '{}',
    output_data JSONB DEFAULT '{}',
    execution_log JSONB DEFAULT '[]',
    current_step VARCHAR(255),
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    error_message TEXT,
    error_code VARCHAR(50),
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    next_retry_at TIMESTAMP WITH TIME ZONE,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for workflow_executions
CREATE INDEX IF NOT EXISTS idx_workflow_executions_template_id ON workflow_executions(workflow_template_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_tenant_id ON workflow_executions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_executed_by ON workflow_executions(executed_by);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_trigger_type ON workflow_executions(trigger_type);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_started_at ON workflow_executions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_completed_at ON workflow_executions(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_priority ON workflow_executions(priority DESC);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_retry ON workflow_executions(next_retry_at) WHERE next_retry_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_workflow_executions_uuid ON workflow_executions(uuid);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables
CREATE TRIGGER update_ai_agents_updated_at BEFORE UPDATE ON ai_agents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_themes_updated_at BEFORE UPDATE ON themes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_webhook_configs_updated_at BEFORE UPDATE ON tenant_webhook_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workflow_templates_updated_at BEFORE UPDATE ON workflow_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workflow_executions_updated_at BEFORE UPDATE ON workflow_executions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INITIAL DATA SEEDING
-- =====================================================

-- Insert default AI agents for demo tenant
INSERT INTO ai_agents (tenant_id, name, name_ar, agent_type, status, description, description_ar, capabilities, model, provider, configuration, metrics) VALUES
('demo-tenant', 'Finance Analyzer Pro', 'محلل مالي محترف', 'finance_analyzer', 'active', 'Advanced AI agent for financial analysis, transaction monitoring, and budget optimization', 'وكيل ذكي متقدم للتحليل المالي ومراقبة المعاملات وتحسين الميزانية', '["Transaction Analysis", "Budget Forecasting", "Risk Assessment", "Anomaly Detection", "Financial Reporting"]', 'gpt-4', 'OpenAI', '{"maxConcurrentTasks": 10, "timeout": 30000, "retryAttempts": 3, "priority": "high"}', '{"totalRequests": 1265, "successfulRequests": 1247, "failedRequests": 18, "averageProcessingTime": 2.3, "uptime": 99.2}'),
('demo-tenant', 'Compliance Monitor', 'مراقب الامتثال', 'compliance_monitor', 'active', 'Automated compliance monitoring and regulatory requirement tracking', 'مراقبة الامتثال التلقائية وتتبع المتطلبات التنظيمية', '["Regulatory Compliance", "Risk Assessment", "Audit Trail", "Policy Monitoring", "Violation Detection"]', 'gpt-4', 'OpenAI', '{"maxConcurrentTasks": 5, "timeout": 45000, "retryAttempts": 2, "priority": "high"}', '{"totalRequests": 892, "successfulRequests": 876, "failedRequests": 16, "averageProcessingTime": 3.1, "uptime": 98.1}'),
('demo-tenant', 'Fraud Detector', 'كاشف الاحتيال', 'fraud_detector', 'active', 'Real-time fraud detection and suspicious activity monitoring', 'كشف الاحتيال في الوقت الفعلي ومراقبة الأنشطة المشبوهة', '["Fraud Detection", "Pattern Recognition", "Risk Scoring", "Alert Generation", "Investigation Support"]', 'gpt-4', 'OpenAI', '{"maxConcurrentTasks": 15, "timeout": 20000, "retryAttempts": 3, "priority": "critical"}', '{"totalRequests": 2156, "successfulRequests": 2089, "failedRequests": 67, "averageProcessingTime": 1.8, "uptime": 97.8}')
ON CONFLICT DO NOTHING;

-- Insert default themes for demo tenant
INSERT INTO themes (tenant_id, name, name_ar, description, description_ar, is_default, is_active, colors, typography, spacing, border_radius, shadows, branding) VALUES
('demo-tenant', 'Saudi Store Default', 'المتجر السعودي الافتراضي', 'Default theme with Saudi green colors and modern design', 'المظهر الافتراضي بالألوان السعودية الخضراء والتصميم العصري', true, true, 
'{"primary": "#059669", "secondary": "#0d9488", "accent": "#0ea5e9", "background": "#ffffff", "surface": "#f8fafc", "text": "#0f172a", "textSecondary": "#64748b", "border": "#e2e8f0", "success": "#10b981", "warning": "#f59e0b", "error": "#ef4444", "info": "#3b82f6"}',
'{"fontFamily": "Inter, system-ui, sans-serif", "fontSize": {"xs": "0.75rem", "sm": "0.875rem", "base": "1rem", "lg": "1.125rem", "xl": "1.25rem", "2xl": "1.5rem", "3xl": "1.875rem"}, "fontWeight": {"normal": 400, "medium": 500, "semibold": 600, "bold": 700}}',
'{"xs": "0.5rem", "sm": "1rem", "md": "1.5rem", "lg": "2rem", "xl": "3rem", "2xl": "4rem"}',
'{"sm": "0.25rem", "md": "0.5rem", "lg": "0.75rem", "xl": "1rem", "full": "9999px"}',
'{"sm": "0 1px 2px 0 rgb(0 0 0 / 0.05)", "md": "0 4px 6px -1px rgb(0 0 0 / 0.1)", "lg": "0 10px 15px -3px rgb(0 0 0 / 0.1)", "xl": "0 20px 25px -5px rgb(0 0 0 / 0.1)"}',
'{"companyName": "Saudi Store", "companyNameAr": "المتجر السعودي", "tagline": "Smart Business Management Platform", "taglineAr": "منصة إدارة الأعمال الذكية"}')
ON CONFLICT DO NOTHING;

-- Insert default workflow templates
INSERT INTO workflow_templates (tenant_id, name, name_ar, description, description_ar, category, nodes, edges, is_active, is_published) VALUES
('demo-tenant', 'Invoice Approval Workflow', 'سير عمل الموافقة على الفواتير', 'Automated invoice approval process with multi-level authorization', 'عملية الموافقة التلقائية على الفواتير مع التفويض متعدد المستويات', 'finance',
'[{"id": "start-1", "type": "start", "label": "Invoice Received", "labelAr": "استلام الفاتورة", "position": {"x": 100, "y": 100}, "data": {}}, {"id": "task-1", "type": "task", "label": "Validate Invoice", "labelAr": "التحقق من الفاتورة", "position": {"x": 300, "y": 100}, "data": {"assignedTo": "finance-team", "timeout": 86400000, "retryAttempts": 2}}, {"id": "decision-1", "type": "decision", "label": "Amount > 10,000?", "labelAr": "المبلغ > 10,000؟", "position": {"x": 500, "y": 100}, "data": {"condition": "amount > 10000"}}, {"id": "approval-1", "type": "approval", "label": "Manager Approval", "labelAr": "موافقة المدير", "position": {"x": 700, "y": 50}, "data": {"assignedTo": "manager", "timeout": 172800000}}, {"id": "task-2", "type": "task", "label": "Process Payment", "labelAr": "معالجة الدفع", "position": {"x": 700, "y": 150}, "data": {"assignedTo": "finance-team", "action": "process_payment"}}, {"id": "end-1", "type": "end", "label": "Process Complete", "labelAr": "اكتمال العملية", "position": {"x": 900, "y": 100}, "data": {}}]',
'[{"id": "e1", "source": "start-1", "target": "task-1"}, {"id": "e2", "source": "task-1", "target": "decision-1"}, {"id": "e3", "source": "decision-1", "target": "approval-1", "condition": "yes"}, {"id": "e4", "source": "decision-1", "target": "task-2", "condition": "no"}, {"id": "e5", "source": "approval-1", "target": "task-2"}, {"id": "e6", "source": "task-2", "target": "end-1"}]',
true, true),
('demo-tenant', 'Employee Onboarding', 'إدخال الموظف الجديد', 'Complete employee onboarding process with document collection and training', 'عملية إدخال الموظف الجديد الكاملة مع جمع الوثائق والتدريب', 'hr',
'[{"id": "start-2", "type": "start", "label": "New Employee", "labelAr": "موظف جديد", "position": {"x": 100, "y": 100}, "data": {}}, {"id": "task-3", "type": "task", "label": "Collect Documents", "labelAr": "جمع الوثائق", "position": {"x": 300, "y": 100}, "data": {"assignedTo": "hr-team", "timeout": 259200000}}, {"id": "task-4", "type": "task", "label": "Setup Accounts", "labelAr": "إعداد الحسابات", "position": {"x": 500, "y": 100}, "data": {"assignedTo": "it-team", "action": "setup_accounts"}}, {"id": "task-5", "type": "task", "label": "Schedule Training", "labelAr": "جدولة التدريب", "position": {"x": 700, "y": 100}, "data": {"assignedTo": "training-team"}}, {"id": "end-2", "type": "end", "label": "Onboarding Complete", "labelAr": "اكتمال الإدخال", "position": {"x": 900, "y": 100}, "data": {}}]',
'[{"id": "e8", "source": "start-2", "target": "task-3"}, {"id": "e9", "source": "task-3", "target": "task-4"}, {"id": "e10", "source": "task-4", "target": "task-5"}, {"id": "e11", "source": "task-5", "target": "end-2"}]',
true, true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- PERMISSIONS AND SECURITY
-- =====================================================

-- Grant necessary permissions (adjust based on your user roles)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_app_user;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Log migration completion
DO $$
BEGIN
    RAISE NOTICE 'Migration 001_create_missing_tables.sql completed successfully';
    RAISE NOTICE 'Created tables: ai_agents, themes, tenant_webhook_configs, notifications, workflow_templates, workflow_executions';
    RAISE NOTICE 'Added indexes, triggers, and initial data';
END $$;
