-- Procurement Module Database Schema
-- Purchase orders, vendors, and inventory management

-- Procurement Vendors Table
CREATE TABLE IF NOT EXISTS procurement_vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) NOT NULL,
    vendor_code VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    website VARCHAR(255),
    address TEXT,
    city VARCHAR(255),
    state VARCHAR(255),
    country VARCHAR(255),
    postal_code VARCHAR(20),
    category VARCHAR(255), -- Office Supplies, IT Equipment, Services, etc.
    status VARCHAR(50) DEFAULT 'active', -- active, inactive, pending, blacklisted
    rating DECIMAL(3,2) CHECK (rating >= 0 AND rating <= 5),
    payment_terms VARCHAR(100), -- Net 30, Net 15, etc.
    delivery_time VARCHAR(100), -- 3-5 days, 1-2 weeks, etc.
    tax_id VARCHAR(100),
    bank_account VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique constraint for vendor_code per tenant
    UNIQUE(tenant_id, vendor_code),
    
    -- Indexes
    INDEX idx_procurement_vendors_tenant (tenant_id),
    INDEX idx_procurement_vendors_status (status),
    INDEX idx_procurement_vendors_category (category),
    INDEX idx_procurement_vendors_rating (rating)
);

-- Procurement Purchase Orders Table
CREATE TABLE IF NOT EXISTS procurement_purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) NOT NULL,
    po_number VARCHAR(100) NOT NULL,
    vendor_id UUID REFERENCES procurement_vendors(id) ON DELETE RESTRICT,
    order_date DATE NOT NULL,
    expected_delivery_date DATE,
    actual_delivery_date DATE,
    status VARCHAR(50) DEFAULT 'draft', -- draft, sent, confirmed, received, cancelled
    subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    shipping_cost DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'USD',
    payment_status VARCHAR(50) DEFAULT 'pending', -- pending, partial, paid
    payment_terms VARCHAR(100),
    shipping_address TEXT,
    billing_address TEXT,
    requested_by VARCHAR(255),
    approved_by VARCHAR(255),
    approved_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique constraint for po_number per tenant
    UNIQUE(tenant_id, po_number),
    
    -- Indexes
    INDEX idx_procurement_po_tenant (tenant_id),
    INDEX idx_procurement_po_vendor (vendor_id),
    INDEX idx_procurement_po_status (status),
    INDEX idx_procurement_po_date (order_date),
    INDEX idx_procurement_po_number (po_number)
);

-- Procurement Purchase Order Items Table
CREATE TABLE IF NOT EXISTS procurement_po_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) NOT NULL,
    po_id UUID REFERENCES procurement_purchase_orders(id) ON DELETE CASCADE,
    item_code VARCHAR(100),
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    total_price DECIMAL(15,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    received_quantity DECIMAL(10,2) DEFAULT 0,
    unit_of_measure VARCHAR(50) DEFAULT 'each', -- each, kg, lbs, hours, etc.
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_procurement_po_items_tenant (tenant_id),
    INDEX idx_procurement_po_items_po (po_id),
    INDEX idx_procurement_po_items_code (item_code)
);

-- Procurement Inventory Table
CREATE TABLE IF NOT EXISTS procurement_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) NOT NULL,
    sku VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(255),
    current_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
    min_stock DECIMAL(10,2) DEFAULT 0,
    max_stock DECIMAL(10,2) DEFAULT 0,
    reorder_point DECIMAL(10,2) DEFAULT 0,
    unit_cost DECIMAL(15,2) DEFAULT 0,
    unit_price DECIMAL(15,2) DEFAULT 0,
    total_value DECIMAL(15,2) GENERATED ALWAYS AS (current_stock * unit_cost) STORED,
    unit_of_measure VARCHAR(50) DEFAULT 'each',
    location VARCHAR(255), -- Warehouse A, IT Storage, etc.
    supplier_id UUID REFERENCES procurement_vendors(id) ON DELETE SET NULL,
    last_restocked_date DATE,
    status VARCHAR(50) DEFAULT 'active', -- active, inactive, discontinued
    movement_type VARCHAR(50) DEFAULT 'medium', -- fast, medium, slow
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique constraint for SKU per tenant
    UNIQUE(tenant_id, sku),
    
    -- Indexes
    INDEX idx_procurement_inventory_tenant (tenant_id),
    INDEX idx_procurement_inventory_category (category),
    INDEX idx_procurement_inventory_supplier (supplier_id),
    INDEX idx_procurement_inventory_stock (current_stock),
    INDEX idx_procurement_inventory_location (location)
);

-- Procurement Inventory Movements Table
CREATE TABLE IF NOT EXISTS procurement_inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) NOT NULL,
    inventory_id UUID REFERENCES procurement_inventory(id) ON DELETE CASCADE,
    movement_type VARCHAR(50) NOT NULL, -- in, out, adjustment, transfer
    quantity DECIMAL(10,2) NOT NULL,
    unit_cost DECIMAL(15,2),
    reference_type VARCHAR(100), -- purchase_order, sale, adjustment, transfer
    reference_id UUID,
    notes TEXT,
    moved_by VARCHAR(255),
    movement_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_procurement_movements_tenant (tenant_id),
    INDEX idx_procurement_movements_inventory (inventory_id),
    INDEX idx_procurement_movements_type (movement_type),
    INDEX idx_procurement_movements_date (movement_date)
);

-- Sample data for testing
INSERT INTO procurement_vendors (tenant_id, vendor_code, name, contact_person, email, phone, category, status, rating, payment_terms, delivery_time) VALUES
('default-tenant', 'VENDOR001', 'Office Supplies Inc', 'John Smith', 'john@officesupplies.com', '+1-555-0123', 'Office Supplies', 'active', 4.5, 'Net 30', '3-5 days'),
('default-tenant', 'VENDOR002', 'Tech Equipment Co', 'Sarah Johnson', 'sarah@techequip.com', '+1-555-0456', 'IT Equipment', 'active', 4.8, 'Net 15', '1-2 weeks'),
('default-tenant', 'VENDOR003', 'Furniture Solutions', 'Mike Chen', 'mike@furniture.com', '+1-555-0789', 'Furniture', 'active', 4.2, 'Net 45', '2-3 weeks'),
('default-tenant', 'VENDOR004', 'Cleaning Services Pro', 'Lisa Anderson', 'lisa@cleanpro.com', '+1-555-0321', 'Services', 'pending', 0, 'Net 30', 'Same day')
ON CONFLICT (tenant_id, vendor_code) DO NOTHING;

INSERT INTO procurement_inventory (tenant_id, sku, name, description, category, current_stock, min_stock, max_stock, unit_cost, location, supplier_id, movement_type) VALUES
('default-tenant', 'OFF-001', 'Office Chairs', 'Ergonomic office chairs with lumbar support', 'Furniture', 25, 10, 50, 299, 'Warehouse A', (SELECT id FROM procurement_vendors WHERE vendor_code = 'VENDOR003' AND tenant_id = 'default-tenant'), 'medium'),
('default-tenant', 'IT-002', 'Laptops', 'Business laptops for development team', 'IT Equipment', 3, 5, 20, 1299, 'IT Storage', (SELECT id FROM procurement_vendors WHERE vendor_code = 'VENDOR002' AND tenant_id = 'default-tenant'), 'fast'),
('default-tenant', 'SUP-003', 'Printer Paper', 'A4 white printer paper, 500 sheets per pack', 'Office Supplies', 0, 20, 100, 8, 'Supply Room', (SELECT id FROM procurement_vendors WHERE vendor_code = 'VENDOR001' AND tenant_id = 'default-tenant'), 'fast'),
('default-tenant', 'OFF-004', 'Desk Lamps', 'LED desk lamps with adjustable brightness', 'Furniture', 45, 15, 30, 89, 'Warehouse A', (SELECT id FROM procurement_vendors WHERE vendor_code = 'VENDOR003' AND tenant_id = 'default-tenant'), 'slow'),
('default-tenant', 'IT-005', 'Monitors', '24-inch LED monitors for workstations', 'IT Equipment', 18, 10, 25, 249, 'IT Storage', (SELECT id FROM procurement_vendors WHERE vendor_code = 'VENDOR002' AND tenant_id = 'default-tenant'), 'medium')
ON CONFLICT (tenant_id, sku) DO NOTHING;

-- Sample purchase order
INSERT INTO procurement_purchase_orders (tenant_id, po_number, vendor_id, order_date, expected_delivery_date, status, subtotal, total_amount, requested_by) VALUES
('default-tenant', 'PO-2024-001', (SELECT id FROM procurement_vendors WHERE vendor_code = 'VENDOR001' AND tenant_id = 'default-tenant'), '2024-01-10', '2024-01-15', 'confirmed', 2500, 2500, 'John Manager')
ON CONFLICT (tenant_id, po_number) DO NOTHING;

-- Triggers for updated_at
CREATE TRIGGER update_procurement_vendors_updated_at BEFORE UPDATE ON procurement_vendors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_procurement_purchase_orders_updated_at BEFORE UPDATE ON procurement_purchase_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_procurement_inventory_updated_at BEFORE UPDATE ON procurement_inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
