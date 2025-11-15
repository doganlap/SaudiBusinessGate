-- ============================================
-- AUTONOMOUS FINANCE AGENT DATABASE SCHEMA
-- Based on FinRobot & Finance-Agentic-AI Patterns
-- ============================================

-- ============================================
-- LAYER 1: FOUNDATION MODELS
-- ============================================

CREATE TABLE foundation_models (
    model_id TEXT PRIMARY KEY,
    model_name TEXT NOT NULL,
    provider TEXT NOT NULL, -- 'openai', 'anthropic', 'local', etc.
    model_type TEXT NOT NULL, -- 'chat', 'embedding', 'reasoning'
    api_endpoint TEXT,
    capabilities TEXT, -- JSON: ["text-generation", "reasoning", "code"]
    context_window INTEGER,
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- LAYER 2: FINANCIAL AI AGENTS
-- ============================================

CREATE TABLE agents (
    agent_id TEXT PRIMARY KEY,
    agent_name TEXT NOT NULL,
    agent_type TEXT NOT NULL, -- 'analyst', 'trader', 'risk_manager', 'reporter'
    description TEXT,
    specialization TEXT, -- 'market_analysis', 'portfolio_optimization', etc.
    foundation_model_id TEXT,
    status TEXT DEFAULT 'available', -- 'available', 'busy', 'offline'
    capabilities TEXT, -- JSON array of capabilities
    configuration TEXT, -- JSON configuration
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (foundation_model_id) REFERENCES foundation_models(model_id)
);

CREATE TABLE agent_metrics (
    metric_id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL,
    task_success_rate REAL,
    avg_execution_time REAL,
    total_tasks_completed INTEGER DEFAULT 0,
    last_active TIMESTAMP,
    performance_score REAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES agents(agent_id)
);

-- ============================================
-- LAYER 3: SMART SCHEDULER & ORCHESTRATION
-- ============================================

CREATE TABLE director_agents (
    director_id TEXT PRIMARY KEY,
    director_name TEXT NOT NULL,
    orchestration_strategy TEXT, -- 'sequential', 'parallel', 'hierarchical'
    priority_algorithm TEXT, -- JSON configuration
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tasks (
    task_id TEXT PRIMARY KEY,
    task_name TEXT NOT NULL,
    task_type TEXT NOT NULL, -- 'analysis', 'prediction', 'trading', 'reporting'
    description TEXT,
    priority INTEGER DEFAULT 0, -- Higher = more urgent
    status TEXT DEFAULT 'pending', -- 'pending', 'assigned', 'running', 'completed', 'failed'
    assigned_agent_id TEXT,
    director_id TEXT,
    input_data TEXT, -- JSON input
    output_data TEXT, -- JSON output
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (assigned_agent_id) REFERENCES agents(agent_id),
    FOREIGN KEY (director_id) REFERENCES director_agents(director_id)
);

CREATE TABLE workflows (
    workflow_id TEXT PRIMARY KEY,
    workflow_name TEXT NOT NULL,
    description TEXT,
    workflow_definition TEXT NOT NULL, -- JSON: defines steps, dependencies
    trigger_type TEXT, -- 'scheduled', 'event', 'manual'
    trigger_config TEXT, -- JSON: cron or event config
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE workflow_executions (
    execution_id TEXT PRIMARY KEY,
    workflow_id TEXT NOT NULL,
    status TEXT DEFAULT 'running', -- 'running', 'completed', 'failed', 'paused'
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    execution_context TEXT, -- JSON: runtime variables
    results TEXT, -- JSON: workflow results
    FOREIGN KEY (workflow_id) REFERENCES workflows(workflow_id)
);

CREATE TABLE task_dependencies (
    dependency_id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL,
    depends_on_task_id TEXT NOT NULL,
    dependency_type TEXT DEFAULT 'sequential', -- 'sequential', 'parallel'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(task_id),
    FOREIGN KEY (depends_on_task_id) REFERENCES tasks(task_id)
);

-- ============================================
-- AGENT WORKFLOW: PERCEPTION → BRAIN → ACTION
-- ============================================

CREATE TABLE perceptions (
    perception_id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL,
    task_id TEXT,
    data_source_id TEXT,
    raw_data TEXT, -- JSON: captured financial data
    processed_data TEXT, -- JSON: interpreted data
    perception_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confidence_score REAL,
    FOREIGN KEY (agent_id) REFERENCES agents(agent_id),
    FOREIGN KEY (task_id) REFERENCES tasks(task_id)
);

CREATE TABLE reasoning_logs (
    reasoning_id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL,
    task_id TEXT,
    perception_id TEXT,
    chain_of_thought TEXT, -- JSON: step-by-step reasoning
    model_prompts TEXT, -- JSON: prompts sent to LLM
    model_responses TEXT, -- JSON: LLM responses
    reasoning_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tokens_used INTEGER,
    FOREIGN KEY (agent_id) REFERENCES agents(agent_id),
    FOREIGN KEY (task_id) REFERENCES tasks(task_id),
    FOREIGN KEY (perception_id) REFERENCES perceptions(perception_id)
);

CREATE TABLE actions (
    action_id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL,
    task_id TEXT,
    reasoning_id TEXT,
    action_type TEXT NOT NULL, -- 'trade', 'alert', 'report', 'recommendation'
    action_details TEXT, -- JSON: specific action parameters
    execution_status TEXT DEFAULT 'pending', -- 'pending', 'executed', 'failed'
    execution_timestamp TIMESTAMP,
    result TEXT, -- JSON: action outcome
    FOREIGN KEY (agent_id) REFERENCES agents(agent_id),
    FOREIGN KEY (task_id) REFERENCES tasks(task_id),
    FOREIGN KEY (reasoning_id) REFERENCES reasoning_logs(reasoning_id)
);

-- ============================================
-- DATA SOURCES & FINANCIAL DATA
-- ============================================

CREATE TABLE data_sources (
    source_id TEXT PRIMARY KEY,
    source_name TEXT NOT NULL,
    source_type TEXT NOT NULL, -- 'market_data', 'news', 'fundamental', 'sentiment'
    provider TEXT, -- 'yahoo', 'alpha_vantage', 'newsapi', etc.
    api_endpoint TEXT,
    update_frequency TEXT, -- 'realtime', 'daily', 'hourly'
    is_active BOOLEAN DEFAULT 1,
    configuration TEXT, -- JSON: API keys, params
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE market_data (
    data_id TEXT PRIMARY KEY,
    source_id TEXT NOT NULL,
    symbol TEXT NOT NULL,
    data_type TEXT NOT NULL, -- 'price', 'volume', 'ohlc'
    timestamp TIMESTAMP NOT NULL,
    open_price REAL,
    high_price REAL,
    low_price REAL,
    close_price REAL,
    volume INTEGER,
    additional_data TEXT, -- JSON: any extra fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (source_id) REFERENCES data_sources(source_id)
);

CREATE TABLE financial_news (
    news_id TEXT PRIMARY KEY,
    source_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    url TEXT,
    published_at TIMESTAMP,
    sentiment_score REAL, -- -1 to 1
    entities TEXT, -- JSON: extracted entities (companies, people)
    topics TEXT, -- JSON: categorized topics
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (source_id) REFERENCES data_sources(source_id)
);

CREATE TABLE fundamental_data (
    fundamental_id TEXT PRIMARY KEY,
    symbol TEXT NOT NULL,
    report_date DATE,
    period TEXT, -- 'Q1', 'Q2', 'annual'
    revenue REAL,
    net_income REAL,
    eps REAL,
    pe_ratio REAL,
    market_cap REAL,
    additional_metrics TEXT, -- JSON: other metrics
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ANALYSIS & PREDICTIONS
-- ============================================

CREATE TABLE analyses (
    analysis_id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL,
    task_id TEXT,
    analysis_type TEXT NOT NULL, -- 'technical', 'fundamental', 'sentiment'
    symbol TEXT,
    time_period TEXT,
    findings TEXT, -- JSON: analysis results
    confidence_level REAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES agents(agent_id),
    FOREIGN KEY (task_id) REFERENCES tasks(task_id)
);

CREATE TABLE predictions (
    prediction_id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL,
    analysis_id TEXT,
    prediction_type TEXT NOT NULL, -- 'price', 'trend', 'risk'
    symbol TEXT,
    predicted_value REAL,
    predicted_direction TEXT, -- 'up', 'down', 'neutral'
    confidence_score REAL,
    prediction_horizon TEXT, -- '1d', '1w', '1m'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    target_date DATE,
    actual_value REAL,
    accuracy_score REAL,
    FOREIGN KEY (agent_id) REFERENCES agents(agent_id),
    FOREIGN KEY (analysis_id) REFERENCES analyses(analysis_id)
);

-- ============================================
-- PORTFOLIO & RISK MANAGEMENT
-- ============================================

CREATE TABLE portfolios (
    portfolio_id TEXT PRIMARY KEY,
    portfolio_name TEXT NOT NULL,
    description TEXT,
    initial_value REAL,
    current_value REAL,
    risk_profile TEXT, -- 'conservative', 'moderate', 'aggressive'
    strategy TEXT, -- JSON: investment strategy
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE positions (
    position_id TEXT PRIMARY KEY,
    portfolio_id TEXT NOT NULL,
    symbol TEXT NOT NULL,
    quantity REAL,
    entry_price REAL,
    current_price REAL,
    entry_date DATE,
    position_type TEXT, -- 'long', 'short'
    status TEXT DEFAULT 'open', -- 'open', 'closed'
    FOREIGN KEY (portfolio_id) REFERENCES portfolios(portfolio_id)
);

CREATE TABLE risk_assessments (
    assessment_id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL,
    portfolio_id TEXT,
    assessment_type TEXT, -- 'var', 'volatility', 'drawdown'
    risk_score REAL,
    risk_factors TEXT, -- JSON: identified risks
    recommendations TEXT, -- JSON: risk mitigation steps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES agents(agent_id),
    FOREIGN KEY (portfolio_id) REFERENCES portfolios(portfolio_id)
);

-- ============================================
-- EXECUTION & AUDIT LOGS
-- ============================================

CREATE TABLE execution_logs (
    log_id TEXT PRIMARY KEY,
    agent_id TEXT,
    task_id TEXT,
    action_id TEXT,
    log_level TEXT, -- 'info', 'warning', 'error'
    message TEXT,
    metadata TEXT, -- JSON: additional context
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES agents(agent_id),
    FOREIGN KEY (task_id) REFERENCES tasks(task_id),
    FOREIGN KEY (action_id) REFERENCES actions(action_id)
);

CREATE TABLE alerts (
    alert_id TEXT PRIMARY KEY,
    agent_id TEXT,
    alert_type TEXT NOT NULL, -- 'price_threshold', 'risk_warning', 'opportunity'
    severity TEXT, -- 'low', 'medium', 'high', 'critical'
    symbol TEXT,
    message TEXT NOT NULL,
    triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    acknowledged BOOLEAN DEFAULT 0,
    acknowledged_at TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES agents(agent_id)
);

-- ============================================
-- KNOWLEDGE BASE & LEARNING
-- ============================================

CREATE TABLE knowledge_base (
    kb_id TEXT PRIMARY KEY,
    category TEXT NOT NULL, -- 'strategy', 'pattern', 'indicator', 'insight'
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    source_type TEXT, -- 'learned', 'curated', 'external'
    confidence_score REAL,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE learning_history (
    learning_id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL,
    task_id TEXT,
    learning_type TEXT, -- 'success_pattern', 'failure_analysis', 'adaptation'
    before_state TEXT, -- JSON: state before learning
    after_state TEXT, -- JSON: state after learning
    improvement_metric REAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES agents(agent_id),
    FOREIGN KEY (task_id) REFERENCES tasks(task_id)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_agent ON tasks(assigned_agent_id);
CREATE INDEX idx_market_data_symbol_time ON market_data(symbol, timestamp);
CREATE INDEX idx_perceptions_agent ON perceptions(agent_id);
CREATE INDEX idx_actions_agent ON actions(agent_id);
CREATE INDEX idx_execution_logs_task ON execution_logs(task_id);
CREATE INDEX idx_predictions_symbol ON predictions(symbol);
CREATE INDEX idx_alerts_triggered ON alerts(triggered_at);
CREATE INDEX idx_workflows_active ON workflows(is_active);
CREATE INDEX idx_agents_status ON agents(status);