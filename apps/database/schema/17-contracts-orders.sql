-- Contracts Table
CREATE TABLE sales_contracts (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    deal_id INTEGER REFERENCES sales_deals(id),
    title VARCHAR(255) NOT NULL,
    content TEXT,
    status VARCHAR(50) DEFAULT 'draft',
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE sales_orders (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    quote_id INTEGER REFERENCES sales_quotes(id),
    contract_id INTEGER REFERENCES sales_contracts(id),
    order_number VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    total_amount NUMERIC(10, 2) NOT NULL,
    order_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Order Items Table
CREATE TABLE sales_order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES sales_orders(id) ON DELETE CASCADE,
    product_id VARCHAR(255),
    description TEXT,
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL
);

-- Indexes
CREATE INDEX idx_sales_contracts_tenant_id ON sales_contracts(tenant_id);
CREATE INDEX idx_sales_orders_tenant_id ON sales_orders(tenant_id);
CREATE INDEX idx_sales_order_items_order_id ON sales_order_items(order_id);

-- Triggers
CREATE OR REPLACE FUNCTION set_updated_at_on_sales_contracts() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sales_contracts_updated_at_trigger
BEFORE UPDATE ON sales_contracts
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_on_sales_contracts();

CREATE OR REPLACE FUNCTION set_updated_at_on_sales_orders() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sales_orders_updated_at_trigger
BEFORE UPDATE ON sales_orders
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_on_sales_orders();