-- AI Finance Agents Database Schema
-- Autonomous End-to-End Finance Workflow Management
-- Based on research from FinRobot and Finance-Agentic-AI patterns

-- AI Finance Agent Positions (The 8 Finance Roles as AI Agents)
CREATE TABLE IF NOT EXISTS ai_finance_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) NOT NULL,
    agent_code VARCHAR(50) NOT NULL, -- CFO_AGENT, CONTROLLER_AGENT, etc.
    agent_name VARCHAR(255) NOT NULL,
    agent_title_en VARCHAR(255) NOT NULL,
    agent_title_ar VARCHAR(255) NOT NULL,
    agent_type VARCHAR(100) NOT NULL, -- executive, operational, analytical, specialist
    agent_status VARCHAR(50) DEFAULT 'active', -- active, inactive, learning, error
    agent_version VARCHAR(20) DEFAULT '1.0.0',
    
    -- Agent Capabilities
    primary_functions TEXT[], -- Array of main functions
    secondary_functions TEXT[], -- Array of secondary functions
    decision_authority_level INTEGER DEFAULT 1, -- 1-10 scale
    automation_level VARCHAR(50) DEFAULT 'full', -- full, semi, manual
    
    -- AI Configuration
    llm_model VARCHAR(100) DEFAULT 'gpt-4', -- AI model used
    prompt_template TEXT, -- Agent-specific prompts
    chain_of_thought_enabled BOOLEAN DEFAULT true,
    memory_enabled BOOLEAN DEFAULT true,
    learning_enabled BOOLEAN DEFAULT true,
    
    -- Performance Metrics
    tasks_completed INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0.00,
    average_processing_time INTEGER DEFAULT 0, -- in seconds
    last_active_at TIMESTAMP WITH TIME ZONE,
    
    -- Agent Configuration
    config_json JSONB, -- Agent-specific configuration
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(tenant_id, agent_code),
    INDEX idx_ai_finance_agents_tenant (tenant_id),
    INDEX idx_ai_finance_agents_status (agent_status),
    INDEX idx_ai_finance_agents_type (agent_type)
);

-- AI Workflow Definitions (End-to-End Process Automation)
CREATE TABLE IF NOT EXISTS ai_finance_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) NOT NULL,
    workflow_code VARCHAR(100) NOT NULL,
    workflow_name VARCHAR(255) NOT NULL,
    workflow_description TEXT,
    
    -- Workflow Configuration
    trigger_type VARCHAR(100) NOT NULL, -- event, schedule, manual, api
    trigger_conditions JSONB, -- Conditions to start workflow
    workflow_steps JSONB NOT NULL, -- Array of workflow steps
    
    -- Automation Settings
    is_autonomous BOOLEAN DEFAULT true,
    requires_approval BOOLEAN DEFAULT false,
    approval_threshold DECIMAL(15,2), -- Amount threshold for approval
    
    -- Agent Assignment
    primary_agent_id UUID REFERENCES ai_finance_agents(id),
    secondary_agents UUID[], -- Array of agent IDs
    
    -- Performance
    execution_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    average_duration INTEGER DEFAULT 0, -- in seconds
    
    -- Status
    status VARCHAR(50) DEFAULT 'active', -- active, inactive, error, maintenance
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(tenant_id, workflow_code),
    INDEX idx_ai_workflows_tenant (tenant_id),
    INDEX idx_ai_workflows_trigger (trigger_type),
    INDEX idx_ai_workflows_status (status)
);

-- AI Workflow Executions (Track Each Workflow Run)
CREATE TABLE IF NOT EXISTS ai_workflow_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) NOT NULL,
    workflow_id UUID NOT NULL REFERENCES ai_finance_workflows(id),
    execution_number VARCHAR(100) NOT NULL,
    
    -- Execution Details
    trigger_event VARCHAR(255), -- What triggered this execution
    trigger_data JSONB, -- Data that triggered the workflow
    input_data JSONB, -- Input parameters
    output_data JSONB, -- Results and outputs
    
    -- Execution Status
    status VARCHAR(50) DEFAULT 'running', -- running, completed, failed, cancelled
    current_step INTEGER DEFAULT 1,
    total_steps INTEGER,
    
    -- Agent Involvement
    executing_agent_id UUID REFERENCES ai_finance_agents(id),
    agent_decisions JSONB, -- Array of agent decisions made
    
    -- Timing
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    
    -- Results
    success BOOLEAN,
    error_message TEXT,
    warning_messages TEXT[],
    
    -- Financial Impact
    financial_impact JSONB, -- Amounts, accounts affected, etc.
    
    INDEX idx_workflow_executions_tenant (tenant_id),
    INDEX idx_workflow_executions_workflow (workflow_id),
    INDEX idx_workflow_executions_status (status),
    INDEX idx_workflow_executions_date (started_at)
);

-- AI Agent Tasks (Individual Tasks within Workflows)
CREATE TABLE IF NOT EXISTS ai_agent_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) NOT NULL,
    execution_id UUID REFERENCES ai_workflow_executions(id),
    agent_id UUID NOT NULL REFERENCES ai_finance_agents(id),
    
    -- Task Details
    task_type VARCHAR(100) NOT NULL, -- analyze, calculate, approve, execute, report
    task_name VARCHAR(255) NOT NULL,
    task_description TEXT,
    task_priority INTEGER DEFAULT 5, -- 1-10 priority
    
    -- Task Data
    input_data JSONB,
    output_data JSONB,
    processing_context JSONB, -- Agent's reasoning and context
    
    -- AI Processing
    llm_prompt TEXT,
    llm_response TEXT,
    chain_of_thought TEXT, -- Agent's reasoning process
    confidence_score DECIMAL(5,2), -- Agent's confidence in decision
    
    -- Status and Timing
    status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    
    -- Results
    success BOOLEAN,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    
    INDEX idx_agent_tasks_tenant (tenant_id),
    INDEX idx_agent_tasks_execution (execution_id),
    INDEX idx_agent_tasks_agent (agent_id),
    INDEX idx_agent_tasks_status (status)
);

-- AI Event System (Event-Driven Automation)
CREATE TABLE IF NOT EXISTS ai_finance_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(100) NOT NULL, -- invoice_received, payment_due, threshold_exceeded
    event_source VARCHAR(100) NOT NULL, -- system, external_api, user, agent
    event_name VARCHAR(255) NOT NULL,
    
    -- Event Data
    event_data JSONB NOT NULL,
    event_metadata JSONB,
    
    -- Processing
    processed BOOLEAN DEFAULT false,
    processing_agent_id UUID REFERENCES ai_finance_agents(id),
    workflows_triggered UUID[], -- Array of workflow IDs triggered
    
    -- Timing
    event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE,
    
    -- Priority and Routing
    priority INTEGER DEFAULT 5, -- 1-10 priority
    routing_rules JSONB, -- Rules for which agents should handle
    
    INDEX idx_finance_events_tenant (tenant_id),
    INDEX idx_finance_events_type (event_type),
    INDEX idx_finance_events_processed (processed),
    INDEX idx_finance_events_timestamp (event_timestamp)
);

-- AI Notifications and Alerts
CREATE TABLE IF NOT EXISTS ai_finance_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) NOT NULL,
    notification_type VARCHAR(100) NOT NULL, -- alert, warning, info, success
    notification_category VARCHAR(100) NOT NULL, -- workflow, agent, system, financial
    
    -- Notification Content
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    details JSONB,
    
    -- Recipients
    recipient_type VARCHAR(50) NOT NULL, -- agent, user, system, external
    recipient_id VARCHAR(255), -- Agent ID, User ID, etc.
    recipient_config JSONB, -- Email, webhook, etc.
    
    -- Related Entities
    related_workflow_id UUID REFERENCES ai_finance_workflows(id),
    related_execution_id UUID REFERENCES ai_workflow_executions(id),
    related_agent_id UUID REFERENCES ai_finance_agents(id),
    
    -- Delivery
    delivery_method VARCHAR(100) DEFAULT 'system', -- system, email, webhook, sms
    delivery_status VARCHAR(50) DEFAULT 'pending', -- pending, sent, delivered, failed
    delivery_attempts INTEGER DEFAULT 0,
    delivered_at TIMESTAMP WITH TIME ZONE,
    
    -- Status
    read_status BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    archived BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_finance_notifications_tenant (tenant_id),
    INDEX idx_finance_notifications_type (notification_type),
    INDEX idx_finance_notifications_recipient (recipient_type, recipient_id),
    INDEX idx_finance_notifications_status (delivery_status)
);

-- AI Agent Learning and Memory
CREATE TABLE IF NOT EXISTS ai_agent_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) NOT NULL,
    agent_id UUID NOT NULL REFERENCES ai_finance_agents(id),
    
    -- Memory Type
    memory_type VARCHAR(100) NOT NULL, -- episodic, semantic, procedural, working
    memory_category VARCHAR(100), -- transaction_patterns, approval_rules, etc.
    
    -- Memory Content
    memory_key VARCHAR(255) NOT NULL,
    memory_value JSONB NOT NULL,
    memory_context JSONB,
    
    -- Learning Metadata
    confidence_level DECIMAL(5,2) DEFAULT 0.50,
    usage_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMP WITH TIME ZONE,
    
    -- Lifecycle
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_agent_memory_tenant (tenant_id),
    INDEX idx_agent_memory_agent (agent_id),
    INDEX idx_agent_memory_type (memory_type),
    INDEX idx_agent_memory_key (memory_key)
);

-- AI Decision Rules and Policies
CREATE TABLE IF NOT EXISTS ai_finance_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) NOT NULL,
    rule_code VARCHAR(100) NOT NULL,
    rule_name VARCHAR(255) NOT NULL,
    rule_description TEXT,
    
    -- Rule Configuration
    rule_type VARCHAR(100) NOT NULL, -- approval, validation, routing, calculation
    rule_category VARCHAR(100), -- invoice, payment, budget, reporting
    
    -- Rule Logic
    conditions JSONB NOT NULL, -- Rule conditions in JSON format
    actions JSONB NOT NULL, -- Actions to take when conditions met
    
    -- Agent Assignment
    applicable_agents UUID[], -- Which agents can use this rule
    
    -- Rule Status
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 5, -- 1-10 priority
    
    -- Performance
    execution_count INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0.00,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(tenant_id, rule_code),
    INDEX idx_finance_rules_tenant (tenant_id),
    INDEX idx_finance_rules_type (rule_type),
    INDEX idx_finance_rules_active (is_active)
);

-- Sample AI Finance Agents (The 8 Positions)
INSERT INTO ai_finance_agents (tenant_id, agent_code, agent_name, agent_title_en, agent_title_ar, agent_type, primary_functions, decision_authority_level) VALUES
('default-tenant', 'CFO_AGENT', 'AI Chief Financial Officer', 'Chief Financial Officer', 'المدير المالي التنفيذي', 'executive', 
 ARRAY['strategic_planning', 'financial_oversight', 'board_reporting', 'risk_management'], 10),

('default-tenant', 'CONTROLLER_AGENT', 'AI Finance Controller', 'Finance Controller', 'المراقب المالي', 'operational', 
 ARRAY['financial_reporting', 'month_end_close', 'compliance', 'internal_controls'], 8),

('default-tenant', 'SR_ACCOUNTANT_AGENT', 'AI Senior Accountant', 'Senior Accountant', 'محاسب أول', 'operational', 
 ARRAY['journal_entries', 'reconciliations', 'financial_analysis', 'supervision'], 6),

('default-tenant', 'AR_SPECIALIST_AGENT', 'AI AR Specialist', 'Accounts Receivable Specialist', 'أخصائي الحسابات المدينة', 'specialist', 
 ARRAY['invoice_processing', 'payment_collection', 'customer_management', 'aging_analysis'], 5),

('default-tenant', 'AP_SPECIALIST_AGENT', 'AI AP Specialist', 'Accounts Payable Specialist', 'أخصائي الحسابات الدائنة', 'specialist', 
 ARRAY['bill_processing', 'vendor_payments', 'expense_management', 'vendor_relations'], 5),

('default-tenant', 'ANALYST_AGENT', 'AI Financial Analyst', 'Financial Analyst', 'محلل مالي', 'analytical', 
 ARRAY['budget_analysis', 'forecasting', 'kpi_reporting', 'variance_analysis'], 4),

('default-tenant', 'PAYROLL_AGENT', 'AI Payroll Specialist', 'Payroll Specialist', 'أخصائي كشوف الرواتب', 'specialist', 
 ARRAY['payroll_processing', 'benefits_admin', 'tax_compliance', 'hr_coordination'], 6),

('default-tenant', 'BOOKKEEPER_AGENT', 'AI Bookkeeper', 'Junior Accountant', 'محاسب مبتدئ', 'operational', 
 ARRAY['data_entry', 'document_filing', 'basic_reconciliation', 'administrative_support'], 3)

ON CONFLICT (tenant_id, agent_code) DO NOTHING;

-- Sample Autonomous Workflows
INSERT INTO ai_finance_workflows (tenant_id, workflow_code, workflow_name, trigger_type, trigger_conditions, workflow_steps, primary_agent_id) VALUES
('default-tenant', 'AUTO_INVOICE_PROCESS', 'Autonomous Invoice Processing', 'event', 
 '{"event_type": "invoice_received", "conditions": {"amount": {"less_than": 10000}}}',
 '[{"step": 1, "action": "validate_invoice", "agent": "AP_SPECIALIST_AGENT"}, {"step": 2, "action": "create_journal_entry", "agent": "SR_ACCOUNTANT_AGENT"}, {"step": 3, "action": "schedule_payment", "agent": "AP_SPECIALIST_AGENT"}]',
 (SELECT id FROM ai_finance_agents WHERE agent_code = 'AP_SPECIALIST_AGENT' AND tenant_id = 'default-tenant')),

('default-tenant', 'AUTO_PAYMENT_COLLECTION', 'Autonomous Payment Collection', 'schedule', 
 '{"schedule": "daily", "time": "09:00", "conditions": {"overdue_days": {"greater_than": 30}}}',
 '[{"step": 1, "action": "identify_overdue", "agent": "AR_SPECIALIST_AGENT"}, {"step": 2, "action": "send_reminders", "agent": "AR_SPECIALIST_AGENT"}, {"step": 3, "action": "escalate_if_needed", "agent": "CONTROLLER_AGENT"}]',
 (SELECT id FROM ai_finance_agents WHERE agent_code = 'AR_SPECIALIST_AGENT' AND tenant_id = 'default-tenant')),

('default-tenant', 'AUTO_MONTH_END_CLOSE', 'Autonomous Month-End Close', 'schedule', 
 '{"schedule": "monthly", "day": "last", "time": "18:00"}',
 '[{"step": 1, "action": "reconcile_accounts", "agent": "SR_ACCOUNTANT_AGENT"}, {"step": 2, "action": "generate_reports", "agent": "CONTROLLER_AGENT"}, {"step": 3, "action": "review_and_approve", "agent": "CFO_AGENT"}]',
 (SELECT id FROM ai_finance_agents WHERE agent_code = 'CONTROLLER_AGENT' AND tenant_id = 'default-tenant'))

ON CONFLICT (tenant_id, workflow_code) DO NOTHING;

-- Triggers for updated_at
CREATE TRIGGER update_ai_finance_agents_updated_at BEFORE UPDATE ON ai_finance_agents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_finance_workflows_updated_at BEFORE UPDATE ON ai_finance_workflows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_agent_memory_updated_at BEFORE UPDATE ON ai_agent_memory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_finance_rules_updated_at BEFORE UPDATE ON ai_finance_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
