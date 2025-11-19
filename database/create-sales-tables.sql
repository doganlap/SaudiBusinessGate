-- =====================================================
-- CREATE SALES TABLES (Orders, Quotes, Proposals, RFQs, Contracts)
-- =====================================================

-- Sales Orders Table
CREATE TABLE IF NOT EXISTS sales_orders (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    order_number VARCHAR(100) UNIQUE NOT NULL,
    customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
    customer_name VARCHAR(255),
    order_date DATE NOT NULL,
    expected_delivery_date DATE,
    status VARCHAR(50) DEFAULT 'draft', -- draft, confirmed, processing, shipped, delivered, cancelled
    total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    vat_amount DECIMAL(15, 2) DEFAULT 0,
    discount_amount DECIMAL(15, 2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'SAR',
    payment_status VARCHAR(50) DEFAULT 'pending', -- pending, partial, paid, overdue
    payment_method VARCHAR(50),
    shipping_address TEXT,
    billing_address TEXT,
    notes TEXT,
    assigned_to VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS sales_order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES sales_orders(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    product_sku VARCHAR(100),
    quantity DECIMAL(10, 2) NOT NULL,
    unit_price DECIMAL(15, 2) NOT NULL,
    discount_percent DECIMAL(5, 2) DEFAULT 0,
    vat_percent DECIMAL(5, 2) DEFAULT 15,
    line_total DECIMAL(15, 2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quotes Table
CREATE TABLE IF NOT EXISTS quotes (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    quote_number VARCHAR(100) UNIQUE NOT NULL,
    customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
    customer_name VARCHAR(255),
    quote_date DATE NOT NULL,
    valid_until DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'draft', -- draft, sent, accepted, rejected, expired
    total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    vat_amount DECIMAL(15, 2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'SAR',
    terms TEXT,
    notes TEXT,
    assigned_to VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quote Items Table
CREATE TABLE IF NOT EXISTS quote_items (
    id SERIAL PRIMARY KEY,
    quote_id INTEGER REFERENCES quotes(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    product_sku VARCHAR(100),
    quantity DECIMAL(10, 2) NOT NULL,
    unit_price DECIMAL(15, 2) NOT NULL,
    discount_percent DECIMAL(5, 2) DEFAULT 0,
    vat_percent DECIMAL(5, 2) DEFAULT 15,
    line_total DECIMAL(15, 2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Proposals Table
CREATE TABLE IF NOT EXISTS proposals (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    proposal_number VARCHAR(100) UNIQUE NOT NULL,
    customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
    customer_name VARCHAR(255),
    proposal_date DATE NOT NULL,
    valid_until DATE,
    status VARCHAR(50) DEFAULT 'draft', -- draft, sent, under_review, accepted, rejected
    total_value DECIMAL(15, 2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'SAR',
    executive_summary TEXT,
    scope_of_work TEXT,
    deliverables TEXT,
    timeline TEXT,
    pricing_details TEXT,
    terms_and_conditions TEXT,
    assigned_to VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- RFQs (Request for Quotation) Table
CREATE TABLE IF NOT EXISTS rfqs (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    rfq_number VARCHAR(100) UNIQUE NOT NULL,
    customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
    customer_name VARCHAR(255),
    rfq_date DATE NOT NULL,
    response_deadline DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'open', -- open, in_progress, submitted, awarded, cancelled
    description TEXT,
    requirements TEXT,
    budget_range VARCHAR(100),
    currency VARCHAR(3) DEFAULT 'SAR',
    assigned_to VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- RFQ Items Table
CREATE TABLE IF NOT EXISTS rfq_items (
    id SERIAL PRIMARY KEY,
    rfq_id INTEGER REFERENCES rfqs(id) ON DELETE CASCADE,
    item_description TEXT NOT NULL,
    quantity DECIMAL(10, 2),
    unit_of_measure VARCHAR(50),
    specifications TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contracts Table
CREATE TABLE IF NOT EXISTS contracts (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    contract_number VARCHAR(100) UNIQUE NOT NULL,
    customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
    customer_name VARCHAR(255),
    contract_type VARCHAR(50), -- sales, service, maintenance, license
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'draft', -- draft, active, expired, terminated, renewed
    total_value DECIMAL(15, 2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'SAR',
    payment_terms VARCHAR(255),
    renewal_terms TEXT,
    contract_terms TEXT,
    signed_date DATE,
    signed_by VARCHAR(255),
    assigned_to VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sales Pipeline Table (for tracking deals through stages)
CREATE TABLE IF NOT EXISTS sales_pipeline (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    deal_id INTEGER REFERENCES deals(id) ON DELETE CASCADE,
    stage VARCHAR(50) NOT NULL, -- prospect, qualified, proposal, negotiation, closed_won, closed_lost
    probability INTEGER DEFAULT 0, -- 0-100
    expected_close_date DATE,
    actual_close_date DATE,
    value DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'SAR',
    notes TEXT,
    moved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    moved_by VARCHAR(255)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sales_orders_tenant_id ON sales_orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sales_orders_customer_id ON sales_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_orders_status ON sales_orders(status);
CREATE INDEX IF NOT EXISTS idx_sales_orders_order_number ON sales_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_sales_order_items_order_id ON sales_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_quotes_tenant_id ON quotes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_quotes_customer_id ON quotes(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quote_items_quote_id ON quote_items(quote_id);
CREATE INDEX IF NOT EXISTS idx_proposals_tenant_id ON proposals(tenant_id);
CREATE INDEX IF NOT EXISTS idx_proposals_customer_id ON proposals(customer_id);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);
CREATE INDEX IF NOT EXISTS idx_rfqs_tenant_id ON rfqs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rfqs_customer_id ON rfqs(customer_id);
CREATE INDEX IF NOT EXISTS idx_rfqs_status ON rfqs(status);
CREATE INDEX IF NOT EXISTS idx_rfq_items_rfq_id ON rfq_items(rfq_id);
CREATE INDEX IF NOT EXISTS idx_contracts_tenant_id ON contracts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_contracts_customer_id ON contracts(customer_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_sales_pipeline_tenant_id ON sales_pipeline(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sales_pipeline_deal_id ON sales_pipeline(deal_id);
CREATE INDEX IF NOT EXISTS idx_sales_pipeline_stage ON sales_pipeline(stage);

-- Create updated_at triggers
CREATE TRIGGER update_sales_orders_updated_at BEFORE UPDATE ON sales_orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON proposals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rfqs_updated_at BEFORE UPDATE ON rfqs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

