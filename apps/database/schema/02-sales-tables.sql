-- Sales Module Database Schema
-- Multi-tenant sales management with leads, deals, and pipeline

-- Sales Leads Table
CREATE TABLE IF NOT EXISTS sales_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    company VARCHAR(255),
    position VARCHAR(255),
    source VARCHAR(100) NOT NULL, -- Website, LinkedIn, Referral, etc.
    status VARCHAR(50) NOT NULL DEFAULT 'new', -- new, contacted, qualified, proposal, negotiation, closed-won, closed-lost
    score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
    estimated_value DECIMAL(15,2) DEFAULT 0,
    assigned_to VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_contact_at TIMESTAMP WITH TIME ZONE,
    
    -- Indexes for performance
    INDEX idx_sales_leads_tenant (tenant_id),
    INDEX idx_sales_leads_status (status),
    INDEX idx_sales_leads_assigned (assigned_to),
    INDEX idx_sales_leads_score (score),
    INDEX idx_sales_leads_created (created_at)
);

-- Sales Deals Table
CREATE TABLE IF NOT EXISTS sales_deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) NOT NULL,
    lead_id UUID REFERENCES sales_leads(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    value DECIMAL(15,2) NOT NULL DEFAULT 0,
    probability INTEGER DEFAULT 50 CHECK (probability >= 0 AND probability <= 100),
    stage VARCHAR(100) NOT NULL DEFAULT 'prospecting', -- prospecting, qualification, proposal, negotiation, closed-won, closed-lost
    expected_close_date DATE,
    actual_close_date DATE,
    assigned_to VARCHAR(255),
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    customer_company VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_sales_deals_tenant (tenant_id),
    INDEX idx_sales_deals_stage (stage),
    INDEX idx_sales_deals_assigned (assigned_to),
    INDEX idx_sales_deals_close_date (expected_close_date),
    INDEX idx_sales_deals_value (value)
);

-- Sales Pipeline Stages Configuration
CREATE TABLE IF NOT EXISTS sales_pipeline_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    probability_default INTEGER DEFAULT 50,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique constraint per tenant
    UNIQUE(tenant_id, name),
    INDEX idx_pipeline_stages_tenant (tenant_id),
    INDEX idx_pipeline_stages_order (order_index)
);

-- Sales Activities/Interactions
CREATE TABLE IF NOT EXISTS sales_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) NOT NULL,
    lead_id UUID REFERENCES sales_leads(id) ON DELETE CASCADE,
    deal_id UUID REFERENCES sales_deals(id) ON DELETE CASCADE,
    activity_type VARCHAR(100) NOT NULL, -- call, email, meeting, note, task
    subject VARCHAR(255) NOT NULL,
    description TEXT,
    activity_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER,
    outcome VARCHAR(255),
    assigned_to VARCHAR(255),
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- At least one of lead_id or deal_id must be present
    CHECK (lead_id IS NOT NULL OR deal_id IS NOT NULL),
    
    -- Indexes
    INDEX idx_sales_activities_tenant (tenant_id),
    INDEX idx_sales_activities_lead (lead_id),
    INDEX idx_sales_activities_deal (deal_id),
    INDEX idx_sales_activities_date (activity_date),
    INDEX idx_sales_activities_type (activity_type)
);

-- Insert default pipeline stages for new tenants
INSERT INTO sales_pipeline_stages (tenant_id, name, description, order_index, probability_default) VALUES
('default-tenant', 'Prospecting', 'Initial contact and research', 1, 10),
('default-tenant', 'Qualification', 'Qualifying the lead', 2, 25),
('default-tenant', 'Proposal', 'Proposal sent to prospect', 3, 50),
('default-tenant', 'Negotiation', 'Negotiating terms and pricing', 4, 75),
('default-tenant', 'Closed Won', 'Deal successfully closed', 5, 100),
('default-tenant', 'Closed Lost', 'Deal lost to competitor or cancelled', 6, 0)
ON CONFLICT (tenant_id, name) DO NOTHING;

-- Sample data for testing
INSERT INTO sales_leads (tenant_id, name, email, phone, company, position, source, status, score, estimated_value, assigned_to) VALUES
('default-tenant', 'John Smith', 'john.smith@techcorp.com', '+1 (555) 123-4567', 'TechCorp Solutions', 'CTO', 'Website', 'qualified', 85, 50000, 'Sarah Johnson'),
('default-tenant', 'Emily Davis', 'emily.davis@innovate.io', '+1 (555) 987-6543', 'Innovate.io', 'VP of Operations', 'LinkedIn', 'proposal', 92, 75000, 'Mike Chen'),
('default-tenant', 'Robert Wilson', 'r.wilson@startup.com', '+1 (555) 456-7890', 'Startup Inc', 'Founder', 'Referral', 'new', 70, 25000, 'Alex Rodriguez')
ON CONFLICT DO NOTHING;

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sales_leads_updated_at BEFORE UPDATE ON sales_leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_deals_updated_at BEFORE UPDATE ON sales_deals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
