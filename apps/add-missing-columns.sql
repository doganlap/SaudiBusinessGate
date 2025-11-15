-- Add missing invoice_date column to invoices table (if not exists)
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'invoices' AND COLUMN_NAME = 'invoice_date')
BEGIN
    ALTER TABLE invoices ADD invoice_date DATE;
END

-- Add missing status column to customers table (if not exists)
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'customers' AND COLUMN_NAME = 'status')
BEGIN
    ALTER TABLE customers ADD status VARCHAR(50) DEFAULT 'active';
END