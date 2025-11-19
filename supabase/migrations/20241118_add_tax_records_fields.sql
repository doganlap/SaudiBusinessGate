-- Add missing fields to tax_records table for CompleteFinanceService compatibility
-- These fields are required by the service but may be missing from the original schema

-- Add account_id to link tax records to financial accounts
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tax_records' AND column_name = 'account_id'
  ) THEN
    ALTER TABLE tax_records 
    ADD COLUMN account_id UUID REFERENCES financial_accounts(id) ON DELETE SET NULL;
    
    CREATE INDEX IF NOT EXISTS idx_tax_records_account_id ON tax_records(account_id);
  END IF;
END $$;

-- Add transaction_id to link tax records to transactions/invoices
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tax_records' AND column_name = 'transaction_id'
  ) THEN
    ALTER TABLE tax_records 
    ADD COLUMN transaction_id VARCHAR(100);
    
    CREATE INDEX IF NOT EXISTS idx_tax_records_transaction_id ON tax_records(transaction_id);
  END IF;
END $$;

-- Add vat_return_period for VAT return tracking
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tax_records' AND column_name = 'vat_return_period'
  ) THEN
    ALTER TABLE tax_records 
    ADD COLUMN vat_return_period VARCHAR(20);
    
    CREATE INDEX IF NOT EXISTS idx_tax_records_vat_return_period ON tax_records(vat_return_period);
  END IF;
END $$;

-- Add saudi_compliance JSONB field for compliance metadata
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tax_records' AND column_name = 'saudi_compliance'
  ) THEN
    ALTER TABLE tax_records 
    ADD COLUMN saudi_compliance JSONB DEFAULT '{}'::jsonb;
    
    CREATE INDEX IF NOT EXISTS idx_tax_records_saudi_compliance ON tax_records USING GIN(saudi_compliance);
  END IF;
END $$;

-- Update reference_number to be used as transaction_id if transaction_id is null
-- This is a data migration to populate transaction_id from existing reference_number
UPDATE tax_records 
SET transaction_id = reference_number 
WHERE transaction_id IS NULL AND reference_number IS NOT NULL;

