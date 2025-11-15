-- Red Flags Detection Rules - قواعد كشف الأعلام الحمراء
-- PostgreSQL Implementation with Triggers and Functions

-- ========================================
-- 1) Accounting Equation Not Balanced
-- ========================================

-- Function to detect unbalanced journal entries
CREATE OR REPLACE FUNCTION detect_unbalanced_entries()
RETURNS TABLE(
    tenant_id VARCHAR,
    journal_id VARCHAR,
    doc_no VARCHAR,
    debit_total NUMERIC(18,2),
    credit_total NUMERIC(18,2),
    imbalance NUMERIC(18,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ge.tenant_id,
        ge.journal_id,
        ge.doc_no,
        SUM(ge.debit)::NUMERIC(18,2) AS debit_total,
        SUM(ge.credit)::NUMERIC(18,2) AS credit_total,
        (SUM(ge.debit) - SUM(ge.credit))::NUMERIC(18,2) AS imbalance
    FROM gl_entries ge
    WHERE ge.tenant_id IS NOT NULL
    GROUP BY ge.tenant_id, ge.journal_id, ge.doc_no
    HAVING SUM(ge.debit) <> SUM(ge.credit);
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce balance on GL entries
CREATE OR REPLACE FUNCTION gl_enforce_balance() 
RETURNS TRIGGER AS $$
DECLARE
    journal_balance NUMERIC(18,2);
BEGIN
    -- Calculate current balance for the journal
    SELECT COALESCE(SUM(debit), 0) - COALESCE(SUM(credit), 0)
    INTO journal_balance
    FROM gl_entries 
    WHERE journal_id = NEW.journal_id AND tenant_id = NEW.tenant_id;
    
    -- If journal is unbalanced, raise red flag
    IF ABS(journal_balance) > 0.01 THEN
        -- Insert red flag
        INSERT INTO red_flags (
            tenant_id, flag_type, severity, entity_type, entity_id,
            description, detected_at, status, metadata
        ) VALUES (
            NEW.tenant_id, 'accounting_unbalanced', 'high', 'journal', NEW.journal_id,
            'Journal entry is not balanced: ' || journal_balance::TEXT,
            NOW(), 'active',
            jsonb_build_object(
                'journal_id', NEW.journal_id,
                'imbalance', journal_balance,
                'doc_no', NEW.doc_no
            )
        );
        
        -- Trigger incident mode
        PERFORM pg_notify('red_flag_detected', 
            jsonb_build_object(
                'tenant_id', NEW.tenant_id,
                'flag_type', 'accounting_unbalanced',
                'entity_id', NEW.journal_id,
                'severity', 'high'
            )::TEXT
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_gl_balance_check ON gl_entries;
CREATE TRIGGER trigger_gl_balance_check
    AFTER INSERT OR UPDATE ON gl_entries
    FOR EACH ROW EXECUTE FUNCTION gl_enforce_balance();

-- ========================================
-- 2) Duplicate Transaction Detection
-- ========================================

-- Function to detect duplicate transactions
CREATE OR REPLACE FUNCTION detect_duplicate_transactions(
    p_tenant_id VARCHAR,
    p_time_window INTERVAL DEFAULT '24 hours'
)
RETURNS TABLE(
    signature TEXT,
    transaction_date DATE,
    duplicate_count BIGINT,
    transaction_ids TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    WITH transaction_signatures AS (
        SELECT 
            id,
            txn_date::DATE as txn_date,
            md5(
                COALESCE(counterparty_id::TEXT, '') || '|' ||
                COALESCE(reference, '') || '|' ||
                amount::TEXT
            ) AS signature
        FROM payments 
        WHERE tenant_id = p_tenant_id 
        AND status = 'posted'
        AND txn_date >= NOW() - p_time_window
    )
    SELECT 
        ts.signature,
        ts.txn_date,
        COUNT(*)::BIGINT as duplicate_count,
        array_agg(ts.id::TEXT) as transaction_ids
    FROM transaction_signatures ts
    GROUP BY ts.signature, ts.txn_date
    HAVING COUNT(*) > 1;
END;
$$ LANGUAGE plpgsql;

-- Trigger for duplicate detection
CREATE OR REPLACE FUNCTION check_duplicate_transaction()
RETURNS TRIGGER AS $$
DECLARE
    duplicate_count INTEGER;
    signature TEXT;
BEGIN
    -- Generate transaction signature
    signature := md5(
        COALESCE(NEW.counterparty_id::TEXT, '') || '|' ||
        COALESCE(NEW.reference, '') || '|' ||
        NEW.amount::TEXT
    );
    
    -- Check for duplicates in the last 24 hours
    SELECT COUNT(*)
    INTO duplicate_count
    FROM payments
    WHERE tenant_id = NEW.tenant_id
    AND md5(
        COALESCE(counterparty_id::TEXT, '') || '|' ||
        COALESCE(reference, '') || '|' ||
        amount::TEXT
    ) = signature
    AND txn_date >= NEW.txn_date - INTERVAL '24 hours'
    AND id != NEW.id;
    
    -- If duplicates found, raise red flag
    IF duplicate_count > 0 THEN
        INSERT INTO red_flags (
            tenant_id, flag_type, severity, entity_type, entity_id,
            description, detected_at, status, metadata
        ) VALUES (
            NEW.tenant_id, 'duplicate_transaction', 'medium', 'payment', NEW.id::TEXT,
            'Potential duplicate transaction detected',
            NOW(), 'active',
            jsonb_build_object(
                'signature', signature,
                'duplicate_count', duplicate_count + 1,
                'amount', NEW.amount,
                'reference', NEW.reference
            )
        );
        
        PERFORM pg_notify('red_flag_detected',
            jsonb_build_object(
                'tenant_id', NEW.tenant_id,
                'flag_type', 'duplicate_transaction',
                'entity_id', NEW.id::TEXT,
                'severity', 'medium'
            )::TEXT
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_duplicate_check ON payments;
CREATE TRIGGER trigger_duplicate_check
    AFTER INSERT ON payments
    FOR EACH ROW EXECUTE FUNCTION check_duplicate_transaction();

-- ========================================
-- 3) Sanctioned Entity Detection
-- ========================================

-- Function to check against sanctions list
CREATE OR REPLACE FUNCTION check_sanctions_screening(
    p_tenant_id VARCHAR,
    p_entity_name TEXT,
    p_entity_iban TEXT DEFAULT NULL
)
RETURNS TABLE(
    list_name TEXT,
    entry_id TEXT,
    match_type TEXT,
    confidence_score NUMERIC(3,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sw.list_name,
        sw.entry_id,
        CASE 
            WHEN sw.name = p_entity_name THEN 'exact_name'
            WHEN sw.iban = p_entity_iban THEN 'exact_iban'
            WHEN similarity(sw.name, p_entity_name) > 0.8 THEN 'fuzzy_name'
            ELSE 'partial_match'
        END as match_type,
        CASE 
            WHEN sw.name = p_entity_name OR sw.iban = p_entity_iban THEN 1.0
            ELSE similarity(sw.name, p_entity_name)
        END as confidence_score
    FROM sanctions_watchlist sw
    WHERE (
        sw.name = p_entity_name OR
        sw.iban = p_entity_iban OR
        similarity(sw.name, p_entity_name) > 0.7
    )
    ORDER BY confidence_score DESC;
END;
$$ LANGUAGE plpgsql;

-- Trigger for sanctions screening
CREATE OR REPLACE FUNCTION screen_for_sanctions()
RETURNS TRIGGER AS $$
DECLARE
    sanctions_hit RECORD;
BEGIN
    -- Screen counterparty against sanctions list
    FOR sanctions_hit IN 
        SELECT * FROM check_sanctions_screening(
            NEW.tenant_id, 
            NEW.name, 
            NEW.iban
        )
    LOOP
        -- Insert red flag for any sanctions hit
        INSERT INTO red_flags (
            tenant_id, flag_type, severity, entity_type, entity_id,
            description, detected_at, status, metadata
        ) VALUES (
            NEW.tenant_id, 'sanctioned_entity', 'critical', 'counterparty', NEW.id::TEXT,
            'Sanctions screening hit: ' || sanctions_hit.list_name,
            NOW(), 'active',
            jsonb_build_object(
                'list_name', sanctions_hit.list_name,
                'entry_id', sanctions_hit.entry_id,
                'match_type', sanctions_hit.match_type,
                'confidence_score', sanctions_hit.confidence_score,
                'entity_name', NEW.name,
                'entity_iban', NEW.iban
            )
        );
        
        PERFORM pg_notify('red_flag_detected',
            jsonb_build_object(
                'tenant_id', NEW.tenant_id,
                'flag_type', 'sanctioned_entity',
                'entity_id', NEW.id::TEXT,
                'severity', 'critical'
            )::TEXT
        );
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sanctions_screening ON counterparties;
CREATE TRIGGER trigger_sanctions_screening
    AFTER INSERT OR UPDATE ON counterparties
    FOR EACH ROW EXECUTE FUNCTION screen_for_sanctions();

-- ========================================
-- 4) Audit Trail Tampering Detection
-- ========================================

-- Function to detect audit trail gaps
CREATE OR REPLACE FUNCTION detect_audit_gaps(p_tenant_id VARCHAR)
RETURNS TABLE(
    expected_seq BIGINT,
    actual_seq BIGINT,
    gap_size BIGINT,
    gap_start_time TIMESTAMP,
    gap_end_time TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    WITH sequence_gaps AS (
        SELECT 
            seq_no,
            LAG(seq_no) OVER (ORDER BY seq_no) as prev_seq,
            created_at,
            LAG(created_at) OVER (ORDER BY seq_no) as prev_time
        FROM audit_logs 
        WHERE tenant_id = p_tenant_id
        ORDER BY seq_no
    )
    SELECT 
        (sg.prev_seq + 1) as expected_seq,
        sg.seq_no as actual_seq,
        (sg.seq_no - sg.prev_seq - 1) as gap_size,
        sg.prev_time as gap_start_time,
        sg.created_at as gap_end_time
    FROM sequence_gaps sg
    WHERE sg.prev_seq IS NOT NULL 
    AND sg.seq_no != sg.prev_seq + 1;
END;
$$ LANGUAGE plpgsql;

-- Function to detect unauthorized direct database modifications
CREATE OR REPLACE FUNCTION detect_unauthorized_modifications()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if this is a direct database modification (no audit trail)
    IF NOT EXISTS (
        SELECT 1 FROM audit_logs 
        WHERE tenant_id = COALESCE(NEW.tenant_id, OLD.tenant_id)
        AND table_name = TG_TABLE_NAME
        AND operation = TG_OP
        AND created_at >= NOW() - INTERVAL '5 seconds'
    ) THEN
        -- Insert red flag for potential tampering
        INSERT INTO red_flags (
            tenant_id, flag_type, severity, entity_type, entity_id,
            description, detected_at, status, metadata
        ) VALUES (
            COALESCE(NEW.tenant_id, OLD.tenant_id), 
            'audit_tampered', 'critical', 'database', TG_TABLE_NAME,
            'Unauthorized direct modification detected on ' || TG_TABLE_NAME,
            NOW(), 'active',
            jsonb_build_object(
                'table_name', TG_TABLE_NAME,
                'operation', TG_OP,
                'record_id', COALESCE(NEW.id, OLD.id)
            )
        );
        
        PERFORM pg_notify('red_flag_detected',
            jsonb_build_object(
                'tenant_id', COALESCE(NEW.tenant_id, OLD.tenant_id),
                'flag_type', 'audit_tampered',
                'entity_id', TG_TABLE_NAME,
                'severity', 'critical'
            )::TEXT
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 5) Large Unexplained Transaction Detection
-- ========================================

-- Function to detect large transactions without supporting documents
CREATE OR REPLACE FUNCTION detect_large_unexplained_transactions(
    p_tenant_id VARCHAR,
    p_materiality_threshold NUMERIC DEFAULT 10000
)
RETURNS TABLE(
    payment_id TEXT,
    txn_date DATE,
    amount NUMERIC(18,2),
    counterparty_id TEXT,
    has_documents BOOLEAN,
    days_without_docs INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id::TEXT as payment_id,
        p.txn_date::DATE,
        p.amount,
        p.counterparty_id::TEXT,
        (d.id IS NOT NULL) as has_documents,
        EXTRACT(DAY FROM NOW() - p.txn_date)::INTEGER as days_without_docs
    FROM payments p
    LEFT JOIN documents d ON d.entity_type = 'payment' AND d.entity_id = p.id::TEXT
    WHERE p.tenant_id = p_tenant_id
    AND p.amount >= p_materiality_threshold
    AND p.status = 'posted'
    AND d.id IS NULL
    AND p.txn_date >= NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Trigger for large transaction monitoring
CREATE OR REPLACE FUNCTION monitor_large_transactions()
RETURNS TRIGGER AS $$
DECLARE
    materiality_threshold NUMERIC;
BEGIN
    -- Get materiality threshold for tenant
    SELECT COALESCE(setting_value::NUMERIC, 10000)
    INTO materiality_threshold
    FROM tenant_settings 
    WHERE tenant_id = NEW.tenant_id 
    AND setting_key = 'materiality_threshold';
    
    -- Check if transaction exceeds threshold
    IF NEW.amount >= materiality_threshold THEN
        -- Check for supporting documents
        IF NOT EXISTS (
            SELECT 1 FROM documents 
            WHERE entity_type = 'payment' 
            AND entity_id = NEW.id::TEXT
        ) THEN
            INSERT INTO red_flags (
                tenant_id, flag_type, severity, entity_type, entity_id,
                description, detected_at, status, metadata
            ) VALUES (
                NEW.tenant_id, 'large_unexplained', 'high', 'payment', NEW.id::TEXT,
                'Large transaction without supporting documentation',
                NOW(), 'active',
                jsonb_build_object(
                    'amount', NEW.amount,
                    'threshold', materiality_threshold,
                    'counterparty_id', NEW.counterparty_id,
                    'reference', NEW.reference
                )
            );
            
            PERFORM pg_notify('red_flag_detected',
                jsonb_build_object(
                    'tenant_id', NEW.tenant_id,
                    'flag_type', 'large_unexplained',
                    'entity_id', NEW.id::TEXT,
                    'severity', 'high'
                )::TEXT
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_large_transaction_monitor ON payments;
CREATE TRIGGER trigger_large_transaction_monitor
    AFTER INSERT ON payments
    FOR EACH ROW EXECUTE FUNCTION monitor_large_transactions();

-- ========================================
-- 6) Rapid Succession Transaction Detection
-- ========================================

-- Function to detect rapid succession transactions
CREATE OR REPLACE FUNCTION detect_rapid_succession(
    p_tenant_id VARCHAR,
    p_time_window INTERVAL DEFAULT '10 minutes',
    p_count_threshold INTEGER DEFAULT 5
)
RETURNS TABLE(
    account_id TEXT,
    counterparty_id TEXT,
    transaction_count BIGINT,
    first_txn_time TIMESTAMP,
    last_txn_time TIMESTAMP,
    total_amount NUMERIC(18,2),
    transaction_ids TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    WITH windowed_transactions AS (
        SELECT 
            p.account_id::TEXT,
            p.counterparty_id::TEXT,
            p.id::TEXT,
            p.txn_ts,
            p.amount,
            COUNT(*) OVER (
                PARTITION BY p.account_id, p.counterparty_id
                ORDER BY p.txn_ts
                RANGE BETWEEN p_time_window PRECEDING AND CURRENT ROW
            ) as txn_count_in_window
        FROM payments p
        WHERE p.tenant_id = p_tenant_id
        AND p.status = 'posted'
        AND p.txn_ts >= NOW() - INTERVAL '1 day'
    )
    SELECT 
        wt.account_id,
        wt.counterparty_id,
        COUNT(*)::BIGINT as transaction_count,
        MIN(wt.txn_ts) as first_txn_time,
        MAX(wt.txn_ts) as last_txn_time,
        SUM(wt.amount) as total_amount,
        array_agg(wt.id) as transaction_ids
    FROM windowed_transactions wt
    WHERE wt.txn_count_in_window >= p_count_threshold
    GROUP BY wt.account_id, wt.counterparty_id
    HAVING COUNT(*) >= p_count_threshold;
END;
$$ LANGUAGE plpgsql;

-- Trigger for rapid succession detection
CREATE OR REPLACE FUNCTION check_rapid_succession()
RETURNS TRIGGER AS $$
DECLARE
    recent_count INTEGER;
    time_window INTERVAL := '10 minutes';
    count_threshold INTEGER := 5;
BEGIN
    -- Count recent transactions from same account to same counterparty
    SELECT COUNT(*)
    INTO recent_count
    FROM payments
    WHERE tenant_id = NEW.tenant_id
    AND account_id = NEW.account_id
    AND counterparty_id = NEW.counterparty_id
    AND txn_ts >= NEW.txn_ts - time_window
    AND txn_ts <= NEW.txn_ts;
    
    -- If threshold exceeded, raise red flag
    IF recent_count >= count_threshold THEN
        INSERT INTO red_flags (
            tenant_id, flag_type, severity, entity_type, entity_id,
            description, detected_at, status, metadata
        ) VALUES (
            NEW.tenant_id, 'rapid_succession', 'medium', 'account', NEW.account_id::TEXT,
            'Rapid succession of transactions detected',
            NOW(), 'active',
            jsonb_build_object(
                'account_id', NEW.account_id,
                'counterparty_id', NEW.counterparty_id,
                'transaction_count', recent_count,
                'time_window_minutes', EXTRACT(EPOCH FROM time_window)/60,
                'latest_transaction_id', NEW.id
            )
        );
        
        PERFORM pg_notify('red_flag_detected',
            jsonb_build_object(
                'tenant_id', NEW.tenant_id,
                'flag_type', 'rapid_succession',
                'entity_id', NEW.account_id::TEXT,
                'severity', 'medium'
            )::TEXT
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_rapid_succession_check ON payments;
CREATE TRIGGER trigger_rapid_succession_check
    AFTER INSERT ON payments
    FOR EACH ROW EXECUTE FUNCTION check_rapid_succession();

-- ========================================
-- Utility Functions for Red Flags Management
-- ========================================

-- Function to get active red flags summary
CREATE OR REPLACE FUNCTION get_red_flags_summary(p_tenant_id VARCHAR)
RETURNS TABLE(
    flag_type TEXT,
    severity TEXT,
    count BIGINT,
    latest_detection TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rf.flag_type,
        rf.severity,
        COUNT(*)::BIGINT,
        MAX(rf.detected_at) as latest_detection
    FROM red_flags rf
    WHERE rf.tenant_id = p_tenant_id
    AND rf.status = 'active'
    GROUP BY rf.flag_type, rf.severity
    ORDER BY 
        CASE rf.severity 
            WHEN 'critical' THEN 1
            WHEN 'high' THEN 2
            WHEN 'medium' THEN 3
            WHEN 'low' THEN 4
        END,
        COUNT(*) DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to resolve red flag
CREATE OR REPLACE FUNCTION resolve_red_flag(
    p_flag_id TEXT,
    p_resolution_notes TEXT,
    p_resolved_by TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE red_flags 
    SET 
        status = 'resolved',
        resolved_at = NOW(),
        resolved_by = p_resolved_by,
        resolution_notes = p_resolution_notes
    WHERE id = p_flag_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_red_flags_tenant_status ON red_flags(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_red_flags_type_severity ON red_flags(flag_type, severity);
CREATE INDEX IF NOT EXISTS idx_red_flags_detected_at ON red_flags(detected_at);
CREATE INDEX IF NOT EXISTS idx_payments_signature ON payments(tenant_id, md5(COALESCE(counterparty_id::TEXT, '') || '|' || COALESCE(reference, '') || '|' || amount::TEXT));
CREATE INDEX IF NOT EXISTS idx_payments_rapid_succession ON payments(tenant_id, account_id, counterparty_id, txn_ts);
CREATE INDEX IF NOT EXISTS idx_gl_entries_balance ON gl_entries(tenant_id, journal_id);

-- Enable pg_trgm extension for fuzzy matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_sanctions_name_trgm ON sanctions_watchlist USING gin(name gin_trgm_ops);

COMMENT ON FUNCTION detect_unbalanced_entries() IS 'Detects journal entries where debits do not equal credits';
COMMENT ON FUNCTION detect_duplicate_transactions(VARCHAR, INTERVAL) IS 'Identifies potential duplicate transactions within specified time window';
COMMENT ON FUNCTION check_sanctions_screening(VARCHAR, TEXT, TEXT) IS 'Screens entities against sanctions watchlists with fuzzy matching';
COMMENT ON FUNCTION detect_audit_gaps(VARCHAR) IS 'Identifies gaps in audit trail sequence numbers';
COMMENT ON FUNCTION detect_large_unexplained_transactions(VARCHAR, NUMERIC) IS 'Finds large transactions without supporting documentation';
COMMENT ON FUNCTION detect_rapid_succession(VARCHAR, INTERVAL, INTEGER) IS 'Detects unusual patterns of rapid transaction succession';
