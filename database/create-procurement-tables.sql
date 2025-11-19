-- =====================================================
-- CREATE PROCUREMENT TABLES (Vendors, Inventory, Orders)
-- =====================================================

-- Vendors Table
CREATE TABLE IF NOT EXISTS vendors (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    vendor_code VARCHAR(100) UNIQUE NOT NULL,
    vendor_name VARCHAR(255) NOT NULL,
    vendor_name_ar VARCHAR(255),
    vendor_type VARCHAR(50), -- supplier, contractor, service_provider
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(50) DEFAULT 'SA',
    tax_id VARCHAR(100),
    commercial_registration VARCHAR(100),
    bank_name VARCHAR(255),
    bank_account_number VARCHAR(100),
    iban VARCHAR(50),
    payment_terms VARCHAR(255),
    credit_limit DECIMAL(15, 2),
    currency VARCHAR(3) DEFAULT 'SAR',
    status VARCHAR(50) DEFAULT 'active', -- active, inactive, suspended, blacklisted
    rating INTEGER, -- 1-5
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inventory Items Table
CREATE TABLE IF NOT EXISTS inventory_items (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    item_code VARCHAR(100) UNIQUE NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    item_name_ar VARCHAR(255),
    category VARCHAR(100),
    subcategory VARCHAR(100),
    unit_of_measure VARCHAR(50), -- piece, kg, liter, meter, etc.
    description TEXT,
    sku VARCHAR(100),
    barcode VARCHAR(100),
    current_stock DECIMAL(10, 2) DEFAULT 0,
    min_stock_level DECIMAL(10, 2) DEFAULT 0,
    max_stock_level DECIMAL(10, 2),
    reorder_point DECIMAL(10, 2),
    unit_cost DECIMAL(15, 2),
    selling_price DECIMAL(15, 2),
    currency VARCHAR(3) DEFAULT 'SAR',
    location VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active', -- active, inactive, discontinued
    vendor_id INTEGER REFERENCES vendors(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Purchase Orders Table
CREATE TABLE IF NOT EXISTS purchase_orders (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    po_number VARCHAR(100) UNIQUE NOT NULL,
    vendor_id INTEGER REFERENCES vendors(id) ON DELETE SET NULL,
    vendor_name VARCHAR(255),
    order_date DATE NOT NULL,
    expected_delivery_date DATE,
    delivery_date DATE,
    status VARCHAR(50) DEFAULT 'draft', -- draft, sent, confirmed, received, cancelled, partially_received
    subtotal DECIMAL(15, 2) NOT NULL DEFAULT 0,
    vat_amount DECIMAL(15, 2) DEFAULT 0,
    discount_amount DECIMAL(15, 2) DEFAULT 0,
    shipping_cost DECIMAL(15, 2) DEFAULT 0,
    total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'SAR',
    payment_terms VARCHAR(255),
    shipping_address TEXT,
    notes TEXT,
    approved_by VARCHAR(255),
    approved_at TIMESTAMP,
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Purchase Order Items Table
CREATE TABLE IF NOT EXISTS purchase_order_items (
    id SERIAL PRIMARY KEY,
    purchase_order_id INTEGER REFERENCES purchase_orders(id) ON DELETE CASCADE,
    inventory_item_id INTEGER REFERENCES inventory_items(id) ON DELETE SET NULL,
    item_description TEXT NOT NULL,
    item_code VARCHAR(100),
    quantity DECIMAL(10, 2) NOT NULL,
    unit_price DECIMAL(15, 2) NOT NULL,
    discount_percent DECIMAL(5, 2) DEFAULT 0,
    vat_percent DECIMAL(5, 2) DEFAULT 15,
    line_total DECIMAL(15, 2) NOT NULL,
    received_quantity DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Receiving Notes Table
CREATE TABLE IF NOT EXISTS receiving_notes (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    receiving_number VARCHAR(100) UNIQUE NOT NULL,
    purchase_order_id INTEGER REFERENCES purchase_orders(id) ON DELETE SET NULL,
    vendor_id INTEGER REFERENCES vendors(id) ON DELETE SET NULL,
    receiving_date DATE NOT NULL,
    received_by VARCHAR(255),
    status VARCHAR(50) DEFAULT 'draft', -- draft, completed, cancelled
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Receiving Note Items Table
CREATE TABLE IF NOT EXISTS receiving_note_items (
    id SERIAL PRIMARY KEY,
    receiving_note_id INTEGER REFERENCES receiving_notes(id) ON DELETE CASCADE,
    purchase_order_item_id INTEGER REFERENCES purchase_order_items(id) ON DELETE SET NULL,
    inventory_item_id INTEGER REFERENCES inventory_items(id) ON DELETE SET NULL,
    item_description TEXT NOT NULL,
    quantity_received DECIMAL(10, 2) NOT NULL,
    unit_price DECIMAL(15, 2),
    condition_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vendor Contracts Table
CREATE TABLE IF NOT EXISTS vendor_contracts (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    contract_number VARCHAR(100) UNIQUE NOT NULL,
    vendor_id INTEGER REFERENCES vendors(id) ON DELETE SET NULL,
    contract_type VARCHAR(50), -- service, supply, maintenance, license
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'active', -- active, expired, terminated, renewed
    total_value DECIMAL(15, 2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'SAR',
    payment_terms TEXT,
    contract_terms TEXT,
    renewal_terms TEXT,
    signed_date DATE,
    signed_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stock Movements Table (for inventory tracking)
CREATE TABLE IF NOT EXISTS stock_movements (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    inventory_item_id INTEGER REFERENCES inventory_items(id) ON DELETE CASCADE,
    movement_type VARCHAR(50) NOT NULL, -- purchase, sale, adjustment, transfer, return
    movement_date DATE NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    unit_cost DECIMAL(15, 2),
    reference_type VARCHAR(50), -- purchase_order, sales_order, adjustment, transfer
    reference_id INTEGER,
    location_from VARCHAR(255),
    location_to VARCHAR(255),
    notes TEXT,
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_vendors_tenant_id ON vendors(tenant_id);
CREATE INDEX IF NOT EXISTS idx_vendors_code ON vendors(vendor_code);
CREATE INDEX IF NOT EXISTS idx_vendors_status ON vendors(status);
CREATE INDEX IF NOT EXISTS idx_inventory_items_tenant_id ON inventory_items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_code ON inventory_items(item_code);
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_tenant_id ON purchase_orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_vendor_id ON purchase_orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_po_number ON purchase_orders(po_number);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_po_id ON purchase_order_items(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_receiving_notes_tenant_id ON receiving_notes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_receiving_notes_po_id ON receiving_notes(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_receiving_note_items_receiving_id ON receiving_note_items(receiving_note_id);
CREATE INDEX IF NOT EXISTS idx_vendor_contracts_tenant_id ON vendor_contracts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_vendor_contracts_vendor_id ON vendor_contracts(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_contracts_status ON vendor_contracts(status);
CREATE INDEX IF NOT EXISTS idx_stock_movements_tenant_id ON stock_movements(tenant_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_item_id ON stock_movements(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_date ON stock_movements(movement_date);
CREATE INDEX IF NOT EXISTS idx_stock_movements_type ON stock_movements(movement_type);

-- Create updated_at triggers
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON purchase_orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_receiving_notes_updated_at BEFORE UPDATE ON receiving_notes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vendor_contracts_updated_at BEFORE UPDATE ON vendor_contracts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

