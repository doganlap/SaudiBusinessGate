-- Schema for Quotes & RFQs Module

-- Table for Quotes
CREATE TABLE sales_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    deal_id UUID,
    customer_id UUID NOT NULL,
    quote_number VARCHAR(50) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'draft', -- draft, sent, accepted, rejected, expired
    total_amount NUMERIC(12, 2) NOT NULL,
    valid_until DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (deal_id) REFERENCES sales_deals(id) ON DELETE SET NULL,
    FOREIGN KEY (customer_id) REFERENCES crm_customers(id) ON DELETE CASCADE
);

CREATE INDEX idx_sales_quotes_tenant_id ON sales_quotes(tenant_id);
CREATE INDEX idx_sales_quotes_customer_id ON sales_quotes(customer_id);
CREATE INDEX idx_sales_quotes_status ON sales_quotes(status);

-- Table for Quote Line Items
CREATE TABLE sales_quote_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID NOT NULL,
    product_id UUID,
    description TEXT NOT NULL,
    quantity INT NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quote_id) REFERENCES sales_quotes(id) ON DELETE CASCADE
);

CREATE INDEX idx_sales_quote_items_quote_id ON sales_quote_items(quote_id);

-- Table for Requests for Quotes (RFQs)
CREATE TABLE sales_rfqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    customer_id UUID NOT NULL,
    rfq_number VARCHAR(50) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'new', -- new, in-progress, quoted, closed
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES crm_customers(id) ON DELETE CASCADE
);

CREATE INDEX idx_sales_rfqs_tenant_id ON sales_rfqs(tenant_id);
CREATE INDEX idx_sales_rfqs_customer_id ON sales_rfqs(customer_id);
CREATE INDEX idx_sales_rfqs_status ON sales_rfqs(status);

-- Create a trigger to update the updated_at column on every update
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sales_quotes_updated_at
BEFORE UPDATE ON sales_quotes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_rfqs_updated_at
BEFORE UPDATE ON sales_rfqs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();