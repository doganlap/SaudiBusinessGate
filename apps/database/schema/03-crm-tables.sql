-- CRM Module Database Schema
-- Customer relationship management with customers, contacts, and activities

-- CRM Customers Table
CREATE TABLE IF NOT EXISTS crm_customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    industry VARCHAR(255),
    website VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    billing_address TEXT,
    shipping_address TEXT,
    city VARCHAR(255),
    state VARCHAR(255),
    country VARCHAR(255),
    postal_code VARCHAR(20),
    customer_type VARCHAR(100) DEFAULT 'prospect', -- prospect, customer, partner, vendor
    status VARCHAR(50) DEFAULT 'active', -- active, inactive, suspended
    credit_limit DECIMAL(15,2) DEFAULT 0,
    payment_terms VARCHAR(100),
    tax_id VARCHAR(100),
    notes TEXT,
    assigned_to VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_crm_customers_tenant (tenant_id),
    INDEX idx_crm_customers_type (customer_type),
    INDEX idx_crm_customers_status (status),
    INDEX idx_crm_customers_assigned (assigned_to),
    INDEX idx_crm_customers_company (company_name)
);

-- CRM Contacts Table
CREATE TABLE IF NOT EXISTS crm_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) NOT NULL,
    customer_id UUID REFERENCES crm_customers(id) ON DELETE CASCADE,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    full_name VARCHAR(511) GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    title VARCHAR(255),
    department VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    mobile VARCHAR(50),
    is_primary BOOLEAN DEFAULT false,
    is_decision_maker BOOLEAN DEFAULT false,
    preferred_contact_method VARCHAR(50) DEFAULT 'email', -- email, phone, mobile
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_crm_contacts_tenant (tenant_id),
    INDEX idx_crm_contacts_customer (customer_id),
    INDEX idx_crm_contacts_name (first_name, last_name),
    INDEX idx_crm_contacts_email (email),
    INDEX idx_crm_contacts_primary (is_primary)
);

-- CRM Activities Table
CREATE TABLE IF NOT EXISTS crm_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) NOT NULL,
    customer_id UUID REFERENCES crm_customers(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES crm_contacts(id) ON DELETE SET NULL,
    activity_type VARCHAR(100) NOT NULL, -- call, email, meeting, note, task, follow_up
    subject VARCHAR(255) NOT NULL,
    description TEXT,
    activity_date TIMESTAMP WITH TIME ZONE NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    outcome VARCHAR(255),
    priority VARCHAR(50) DEFAULT 'medium', -- low, medium, high, urgent
    status VARCHAR(50) DEFAULT 'pending', -- pending, completed, cancelled
    assigned_to VARCHAR(255),
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_crm_activities_tenant (tenant_id),
    INDEX idx_crm_activities_customer (customer_id),
    INDEX idx_crm_activities_contact (contact_id),
    INDEX idx_crm_activities_date (activity_date),
    INDEX idx_crm_activities_type (activity_type),
    INDEX idx_crm_activities_status (status),
    INDEX idx_crm_activities_assigned (assigned_to)
);

-- CRM Customer Interactions History
CREATE TABLE IF NOT EXISTS crm_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) NOT NULL,
    customer_id UUID REFERENCES crm_customers(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES crm_contacts(id) ON DELETE SET NULL,
    interaction_type VARCHAR(100) NOT NULL, -- purchase, support_ticket, complaint, inquiry
    channel VARCHAR(100), -- website, phone, email, in_person, social_media
    subject VARCHAR(255),
    description TEXT,
    value DECIMAL(15,2),
    satisfaction_score INTEGER CHECK (satisfaction_score >= 1 AND satisfaction_score <= 5),
    resolution_status VARCHAR(100), -- open, in_progress, resolved, closed
    interaction_date TIMESTAMP WITH TIME ZONE NOT NULL,
    resolved_date TIMESTAMP WITH TIME ZONE,
    handled_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_crm_interactions_tenant (tenant_id),
    INDEX idx_crm_interactions_customer (customer_id),
    INDEX idx_crm_interactions_type (interaction_type),
    INDEX idx_crm_interactions_date (interaction_date),
    INDEX idx_crm_interactions_status (resolution_status)
);

-- Sample data for testing
INSERT INTO crm_customers (tenant_id, company_name, industry, website, phone, email, customer_type, status, assigned_to) VALUES
('default-tenant', 'TechCorp Solutions', 'Technology', 'https://techcorp.com', '+1-555-0123', 'info@techcorp.com', 'customer', 'active', 'Sarah Johnson'),
('default-tenant', 'Innovate.io', 'Software', 'https://innovate.io', '+1-555-0456', 'contact@innovate.io', 'customer', 'active', 'Mike Chen'),
('default-tenant', 'Startup Inc', 'Startup', 'https://startup.com', '+1-555-0789', 'hello@startup.com', 'prospect', 'active', 'Alex Rodriguez')
ON CONFLICT DO NOTHING;

INSERT INTO crm_contacts (tenant_id, customer_id, first_name, last_name, title, email, phone, is_primary, is_decision_maker) VALUES
('default-tenant', (SELECT id FROM crm_customers WHERE company_name = 'TechCorp Solutions' AND tenant_id = 'default-tenant'), 'John', 'Smith', 'CTO', 'john.smith@techcorp.com', '+1-555-1234', true, true),
('default-tenant', (SELECT id FROM crm_customers WHERE company_name = 'Innovate.io' AND tenant_id = 'default-tenant'), 'Emily', 'Davis', 'VP of Operations', 'emily.davis@innovate.io', '+1-555-5678', true, true),
('default-tenant', (SELECT id FROM crm_customers WHERE company_name = 'Startup Inc' AND tenant_id = 'default-tenant'), 'Robert', 'Wilson', 'Founder', 'r.wilson@startup.com', '+1-555-9012', true, true)
ON CONFLICT DO NOTHING;

-- Triggers for updated_at
CREATE TRIGGER update_crm_customers_updated_at BEFORE UPDATE ON crm_customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_crm_contacts_updated_at BEFORE UPDATE ON crm_contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_crm_activities_updated_at BEFORE UPDATE ON crm_activities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
