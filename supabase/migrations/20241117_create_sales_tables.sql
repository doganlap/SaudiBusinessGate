-- Create sales tables for the SBG Platform
-- This migration creates the necessary tables for the sales module

-- Create sales_quotes table
CREATE TABLE IF NOT EXISTS sales_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    quote_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID,
    deal_id UUID,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    status VARCHAR(50) DEFAULT 'draft',
    valid_until TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    viewed_at TIMESTAMP WITH TIME ZONE,
    accepted_at TIMESTAMP WITH TIME ZONE,
    rejected_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Create sales_rfqs table
CREATE TABLE IF NOT EXISTS sales_rfqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    rfq_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID,
    deal_id UUID,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'pending',
    priority VARCHAR(20) DEFAULT 'medium',
    responded_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Create sales_orders table
CREATE TABLE IF NOT EXISTS sales_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID,
    quote_id UUID,
    contract_id UUID,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending',
    fulfillment_status VARCHAR(50) DEFAULT 'pending',
    order_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    delivery_date TIMESTAMP WITH TIME ZONE,
    fulfilled_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Create sales_contracts table
CREATE TABLE IF NOT EXISTS sales_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    contract_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID,
    deal_id UUID,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    total_value DECIMAL(12,2) NOT NULL DEFAULT 0,
    status VARCHAR(50) DEFAULT 'draft',
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    renewal_date TIMESTAMP WITH TIME ZONE,
    auto_renewal BOOLEAN DEFAULT FALSE,
    signed_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Create sales_proposals table
CREATE TABLE IF NOT EXISTS sales_proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    proposal_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID,
    deal_id UUID,
    quote_id UUID,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    status VARCHAR(50) DEFAULT 'draft',
    sections_count INTEGER DEFAULT 0,
    sent_at TIMESTAMP WITH TIME ZONE,
    viewed_at TIMESTAMP WITH TIME ZONE,
    accepted_at TIMESTAMP WITH TIME ZONE,
    rejected_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sales_quotes_tenant_id ON sales_quotes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sales_quotes_customer_id ON sales_quotes(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_quotes_status ON sales_quotes(status);
CREATE INDEX IF NOT EXISTS idx_sales_quotes_created_at ON sales_quotes(created_at);

CREATE INDEX IF NOT EXISTS idx_sales_rfqs_tenant_id ON sales_rfqs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sales_rfqs_customer_id ON sales_rfqs(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_rfqs_status ON sales_rfqs(status);
CREATE INDEX IF NOT EXISTS idx_sales_rfqs_due_date ON sales_rfqs(due_date);

CREATE INDEX IF NOT EXISTS idx_sales_orders_tenant_id ON sales_orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sales_orders_customer_id ON sales_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_orders_status ON sales_orders(status);
CREATE INDEX IF NOT EXISTS idx_sales_orders_order_date ON sales_orders(order_date);

CREATE INDEX IF NOT EXISTS idx_sales_contracts_tenant_id ON sales_contracts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sales_contracts_customer_id ON sales_contracts(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_contracts_status ON sales_contracts(status);
CREATE INDEX IF NOT EXISTS idx_sales_contracts_end_date ON sales_contracts(end_date);

CREATE INDEX IF NOT EXISTS idx_sales_proposals_tenant_id ON sales_proposals(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sales_proposals_customer_id ON sales_proposals(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_proposals_status ON sales_proposals(status);
CREATE INDEX IF NOT EXISTS idx_sales_proposals_created_at ON sales_proposals(created_at);

-- Grant permissions to anon and authenticated roles
GRANT SELECT ON sales_quotes TO anon;
GRANT SELECT ON sales_quotes TO authenticated;
GRANT INSERT, UPDATE, DELETE ON sales_quotes TO authenticated;

GRANT SELECT ON sales_rfqs TO anon;
GRANT SELECT ON sales_rfqs TO authenticated;
GRANT INSERT, UPDATE, DELETE ON sales_rfqs TO authenticated;

GRANT SELECT ON sales_orders TO anon;
GRANT SELECT ON sales_orders TO authenticated;
GRANT INSERT, UPDATE, DELETE ON sales_orders TO authenticated;

GRANT SELECT ON sales_contracts TO anon;
GRANT SELECT ON sales_contracts TO authenticated;
GRANT INSERT, UPDATE, DELETE ON sales_contracts TO authenticated;

GRANT SELECT ON sales_proposals TO anon;
GRANT SELECT ON sales_proposals TO authenticated;
GRANT INSERT, UPDATE, DELETE ON sales_proposals TO authenticated;