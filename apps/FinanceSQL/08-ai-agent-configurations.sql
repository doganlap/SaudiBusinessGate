-- AI Agent Configuration Tables
-- All layers, configurations, and settings stored in database

-- AI Agent Layer Configurations
CREATE TABLE IF NOT EXISTS ai_agent_layers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) NOT NULL,
    layer_code VARCHAR(100) NOT NULL,
    layer_name VARCHAR(255) NOT NULL,
    layer_type VARCHAR(100) NOT NULL, -- perception, brain, action, foundation
    layer_order INTEGER NOT NULL,
    layer_description TEXT,
    
    -- Layer Configuration
    is_active BOOLEAN DEFAULT true,
    config_schema JSONB, -- JSON schema for layer configuration
    default_config JSONB, -- Default configuration values
    
    -- Processing Settings
    processing_timeout INTEGER DEFAULT 30, -- seconds
    retry_attempts INTEGER DEFAULT 3,
    parallel_processing BOOLEAN DEFAULT false,
    
    -- Dependencies
    depends_on_layers VARCHAR(100)[], -- Array of layer codes this depends on
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(tenant_id, layer_code),
    INDEX idx_agent_layers_tenant (tenant_id),
    INDEX idx_agent_layers_type (layer_type),
    INDEX idx_agent_layers_order (layer_order)
);

-- AI Agent Capabilities Configuration
CREATE TABLE IF NOT EXISTS ai_agent_capabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) NOT NULL,
    capability_code VARCHAR(100) NOT NULL,
    capability_name VARCHAR(255) NOT NULL,
    capability_category VARCHAR(100) NOT NULL, -- financial, analytical, operational, communication
    
    -- Capability Details
    description TEXT,
    input_schema JSONB, -- Expected input format
    output_schema JSONB, -- Expected output format
    
    -- Processing Configuration
    processing_method VARCHAR(100) NOT NULL, -- llm, rule_based, calculation, api_call
    llm_model VARCHAR(100), -- gpt-4, claude, etc.
    prompt_template TEXT,
    system_prompt TEXT,
    
    -- Business Rules
    business_rules JSONB, -- Array of business rules
    validation_rules JSONB, -- Input/output validation
    approval_required BOOLEAN DEFAULT false,
    approval_threshold DECIMAL(15,2),
    
    -- Performance Settings
    max_processing_time INTEGER DEFAULT 60, -- seconds
    confidence_threshold DECIMAL(5,2) DEFAULT 0.70,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    version VARCHAR(20) DEFAULT '1.0.0',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(tenant_id, capability_code),
    INDEX idx_agent_capabilities_tenant (tenant_id),
    INDEX idx_agent_capabilities_category (capability_category),
    INDEX idx_agent_capabilities_method (processing_method)
);

-- AI Agent Role Configurations
CREATE TABLE IF NOT EXISTS ai_agent_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) NOT NULL,
    role_code VARCHAR(100) NOT NULL,
    role_name_en VARCHAR(255) NOT NULL,
    role_name_ar VARCHAR(255) NOT NULL,
    
    -- Role Hierarchy
    role_level INTEGER NOT NULL, -- 1-10, higher = more authority
    reports_to_role VARCHAR(100), -- Role code of supervisor
    supervises_roles VARCHAR(100)[], -- Array of subordinate role codes
    
    -- Capabilities Assignment
    primary_capabilities VARCHAR(100)[], -- Array of capability codes
    secondary_capabilities VARCHAR(100)[], -- Array of secondary capability codes
    restricted_capabilities VARCHAR(100)[], -- Capabilities this role cannot use
    
    -- Decision Authority
    decision_authority JSONB, -- Decision limits and authorities
    approval_limits JSONB, -- Financial approval limits
    escalation_rules JSONB, -- When to escalate decisions
    
    -- Working Hours and Availability
    working_hours JSONB, -- Schedule configuration
    timezone VARCHAR(100) DEFAULT 'UTC',
    availability_24_7 BOOLEAN DEFAULT true,
    
    -- Performance Expectations
    expected_response_time INTEGER DEFAULT 30, -- seconds
    expected_accuracy DECIMAL(5,2) DEFAULT 95.00, -- percentage
    max_concurrent_tasks INTEGER DEFAULT 10,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(tenant_id, role_code),
    INDEX idx_agent_roles_tenant (tenant_id),
    INDEX idx_agent_roles_level (role_level)
);

-- AI Agent Prompt Templates
CREATE TABLE IF NOT EXISTS ai_agent_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) NOT NULL,
    prompt_code VARCHAR(100) NOT NULL,
    prompt_name VARCHAR(255) NOT NULL,
    prompt_category VARCHAR(100) NOT NULL, -- system, task, decision, analysis
    
    -- Prompt Content
    prompt_template TEXT NOT NULL,
    system_message TEXT,
    context_template TEXT,
    
    -- Language Support
    language VARCHAR(10) DEFAULT 'en', -- en, ar
    
    -- Prompt Configuration
    temperature DECIMAL(3,2) DEFAULT 0.7,
    max_tokens INTEGER DEFAULT 1000,
    top_p DECIMAL(3,2) DEFAULT 1.0,
    frequency_penalty DECIMAL(3,2) DEFAULT 0.0,
    presence_penalty DECIMAL(3,2) DEFAULT 0.0,
    
    -- Usage Tracking
    usage_count INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0.00,
    average_response_time INTEGER DEFAULT 0,
    
    -- Versioning
    version VARCHAR(20) DEFAULT '1.0.0',
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(tenant_id, prompt_code, language),
    INDEX idx_agent_prompts_tenant (tenant_id),
    INDEX idx_agent_prompts_category (prompt_category),
    INDEX idx_agent_prompts_language (language)
);

-- AI Agent Business Rules
CREATE TABLE IF NOT EXISTS ai_agent_business_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) NOT NULL,
    rule_code VARCHAR(100) NOT NULL,
    rule_name VARCHAR(255) NOT NULL,
    rule_category VARCHAR(100) NOT NULL, -- approval, validation, calculation, routing
    
    -- Rule Definition
    rule_description TEXT,
    rule_conditions JSONB NOT NULL, -- Conditions in JSON format
    rule_actions JSONB NOT NULL, -- Actions to take
    
    -- Rule Scope
    applicable_roles VARCHAR(100)[], -- Which roles can use this rule
    applicable_capabilities VARCHAR(100)[], -- Which capabilities this applies to
    
    -- Rule Logic
    rule_type VARCHAR(50) NOT NULL, -- if_then, threshold, calculation, lookup
    priority INTEGER DEFAULT 5, -- 1-10, higher = more important
    
    -- Execution Settings
    is_blocking BOOLEAN DEFAULT false, -- Must pass before proceeding
    error_handling VARCHAR(100) DEFAULT 'log', -- log, escalate, stop
    
    -- Performance
    execution_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    effective_from DATE DEFAULT CURRENT_DATE,
    effective_to DATE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(tenant_id, rule_code),
    INDEX idx_business_rules_tenant (tenant_id),
    INDEX idx_business_rules_category (rule_category),
    INDEX idx_business_rules_type (rule_type)
);

-- AI Agent Decision Trees
CREATE TABLE IF NOT EXISTS ai_agent_decision_trees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) NOT NULL,
    tree_code VARCHAR(100) NOT NULL,
    tree_name VARCHAR(255) NOT NULL,
    
    -- Decision Tree Structure
    root_node JSONB NOT NULL, -- Root decision node
    decision_nodes JSONB NOT NULL, -- All decision nodes
    leaf_nodes JSONB NOT NULL, -- Final decision outcomes
    
    -- Tree Configuration
    tree_category VARCHAR(100) NOT NULL, -- approval, routing, classification
    applicable_roles VARCHAR(100)[], -- Which roles can use this tree
    
    -- Performance Tracking
    usage_count INTEGER DEFAULT 0,
    accuracy_rate DECIMAL(5,2) DEFAULT 0.00,
    average_depth DECIMAL(5,2) DEFAULT 0.00, -- Average path length
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    version VARCHAR(20) DEFAULT '1.0.0',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(tenant_id, tree_code),
    INDEX idx_decision_trees_tenant (tenant_id),
    INDEX idx_decision_trees_category (tree_category)
);

-- AI Agent Learning Configurations
CREATE TABLE IF NOT EXISTS ai_agent_learning_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) NOT NULL,
    config_code VARCHAR(100) NOT NULL,
    config_name VARCHAR(255) NOT NULL,
    
    -- Learning Settings
    learning_enabled BOOLEAN DEFAULT true,
    learning_rate DECIMAL(5,4) DEFAULT 0.01,
    memory_retention_days INTEGER DEFAULT 365,
    
    -- Feedback Processing
    feedback_weight DECIMAL(3,2) DEFAULT 1.0,
    auto_feedback_enabled BOOLEAN DEFAULT true,
    human_feedback_weight DECIMAL(3,2) DEFAULT 2.0,
    
    -- Pattern Recognition
    pattern_detection_enabled BOOLEAN DEFAULT true,
    min_pattern_occurrences INTEGER DEFAULT 5,
    pattern_confidence_threshold DECIMAL(5,2) DEFAULT 0.80,
    
    -- Model Updates
    auto_model_update BOOLEAN DEFAULT false,
    update_frequency VARCHAR(50) DEFAULT 'weekly', -- daily, weekly, monthly
    performance_threshold DECIMAL(5,2) DEFAULT 85.00,
    
    -- Data Retention
    success_data_retention_days INTEGER DEFAULT 730,
    failure_data_retention_days INTEGER DEFAULT 365,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(tenant_id, config_code),
    INDEX idx_learning_configs_tenant (tenant_id)
);

-- AI Agent Integration Configurations
CREATE TABLE IF NOT EXISTS ai_agent_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) NOT NULL,
    integration_code VARCHAR(100) NOT NULL,
    integration_name VARCHAR(255) NOT NULL,
    integration_type VARCHAR(100) NOT NULL, -- llm_api, database, external_api, webhook
    
    -- Connection Settings
    endpoint_url VARCHAR(500),
    api_key_encrypted TEXT, -- Encrypted API key
    authentication_method VARCHAR(100), -- api_key, oauth, basic_auth
    
    -- Configuration
    connection_config JSONB, -- Connection-specific settings
    request_headers JSONB, -- Default headers
    timeout_seconds INTEGER DEFAULT 30,
    retry_attempts INTEGER DEFAULT 3,
    
    -- Rate Limiting
    rate_limit_per_minute INTEGER DEFAULT 60,
    rate_limit_per_hour INTEGER DEFAULT 1000,
    rate_limit_per_day INTEGER DEFAULT 10000,
    
    -- Monitoring
    health_check_url VARCHAR(500),
    health_check_interval INTEGER DEFAULT 300, -- seconds
    last_health_check TIMESTAMP WITH TIME ZONE,
    health_status VARCHAR(50) DEFAULT 'unknown',
    
    -- Usage Tracking
    total_requests INTEGER DEFAULT 0,
    successful_requests INTEGER DEFAULT 0,
    failed_requests INTEGER DEFAULT 0,
    average_response_time INTEGER DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(tenant_id, integration_code),
    INDEX idx_agent_integrations_tenant (tenant_id),
    INDEX idx_agent_integrations_type (integration_type)
);

-- Sample Layer Configurations
INSERT INTO ai_agent_layers (tenant_id, layer_code, layer_name, layer_type, layer_order, layer_description, default_config) VALUES
('default-tenant', 'PERCEPTION_LAYER', 'Financial Data Perception Layer', 'perception', 1, 
 'Captures and interprets multimodal financial data from various sources',
 '{"data_sources": ["invoices", "payments", "bank_feeds", "market_data"], "processing_timeout": 30}'),

('default-tenant', 'BRAIN_LAYER', 'Financial AI Brain Layer', 'brain', 2,
 'Core processing unit using LLMs and Chain-of-Thought reasoning',
 '{"llm_model": "gpt-4", "temperature": 0.7, "max_tokens": 2000, "chain_of_thought": true}'),

('default-tenant', 'ACTION_LAYER', 'Financial Action Execution Layer', 'action', 3,
 'Executes decisions and interacts with financial systems',
 '{"execution_timeout": 60, "rollback_enabled": true, "audit_all_actions": true}'),

('default-tenant', 'FOUNDATION_LAYER', 'LLM Foundation Models Layer', 'foundation', 0,
 'Provides access to various LLM models and APIs',
 '{"primary_model": "gpt-4", "fallback_models": ["gpt-3.5-turbo", "claude-3"], "load_balancing": true}')

ON CONFLICT (tenant_id, layer_code) DO NOTHING;

-- Sample Role Configurations
INSERT INTO ai_agent_roles (tenant_id, role_code, role_name_en, role_name_ar, role_level, primary_capabilities, decision_authority) VALUES
('default-tenant', 'CFO_AGENT', 'Chief Financial Officer', 'المدير المالي التنفيذي', 10,
 ARRAY['strategic_planning', 'financial_oversight', 'board_reporting', 'risk_management'],
 '{"approval_limit": 1000000, "budget_authority": true, "policy_changes": true}'),

('default-tenant', 'CONTROLLER_AGENT', 'Finance Controller', 'المراقب المالي', 8,
 ARRAY['financial_reporting', 'month_end_close', 'compliance_monitoring', 'internal_controls'],
 '{"approval_limit": 100000, "reporting_authority": true, "compliance_enforcement": true}'),

('default-tenant', 'AR_SPECIALIST_AGENT', 'AR Specialist', 'أخصائي الحسابات المدينة', 5,
 ARRAY['invoice_processing', 'payment_collection', 'customer_management', 'aging_analysis'],
 '{"approval_limit": 10000, "customer_communication": true, "payment_terms_modification": false}')

ON CONFLICT (tenant_id, role_code) DO NOTHING;

-- Sample Business Rules
INSERT INTO ai_agent_business_rules (tenant_id, rule_code, rule_name, rule_category, rule_conditions, rule_actions, applicable_roles) VALUES
('default-tenant', 'INVOICE_AUTO_APPROVE', 'Auto Approve Small Invoices', 'approval',
 '{"amount": {"less_than": 1000}, "vendor": {"verified": true}, "budget": {"available": true}}',
 '{"action": "approve", "create_journal_entry": true, "schedule_payment": true}',
 ARRAY['AP_SPECIALIST_AGENT']),

('default-tenant', 'PAYMENT_ESCALATION', 'Escalate Large Payments', 'escalation',
 '{"amount": {"greater_than": 50000}, "approval_required": true}',
 '{"action": "escalate", "escalate_to": "CONTROLLER_AGENT", "notify": true}',
 ARRAY['AP_SPECIALIST_AGENT', 'AR_SPECIALIST_AGENT']),

('default-tenant', 'OVERDUE_COLLECTION', 'Overdue Payment Collection', 'automation',
 '{"days_overdue": {"greater_than": 30}, "customer_status": "active"}',
 '{"action": "send_reminder", "escalate_after_days": 60, "collection_fee": 25}',
 ARRAY['AR_SPECIALIST_AGENT'])

ON CONFLICT (tenant_id, rule_code) DO NOTHING;

-- Triggers for updated_at
CREATE TRIGGER update_ai_agent_layers_updated_at BEFORE UPDATE ON ai_agent_layers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_agent_capabilities_updated_at BEFORE UPDATE ON ai_agent_capabilities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_agent_roles_updated_at BEFORE UPDATE ON ai_agent_roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_agent_prompts_updated_at BEFORE UPDATE ON ai_agent_prompts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_agent_business_rules_updated_at BEFORE UPDATE ON ai_agent_business_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_agent_decision_trees_updated_at BEFORE UPDATE ON ai_agent_decision_trees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_agent_learning_configs_updated_at BEFORE UPDATE ON ai_agent_learning_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_agent_integrations_updated_at BEFORE UPDATE ON ai_agent_integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
