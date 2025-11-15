-- ============================================
-- RED FLAGS TRIGGERS & EVENTS
-- Saudi Store - المتجر السعودي
-- Automated detection and AI workflow triggering
-- ============================================

-- ============================================
-- 1. RED FLAGS DETECTION FUNCTIONS
-- ============================================

-- Function: Detect Large Transaction
CREATE OR REPLACE FUNCTION detect_large_transaction()
RETURNS TRIGGER AS $$
DECLARE
  threshold NUMERIC := 100000; -- SAR 100,000
  event_id UUID;
BEGIN
  IF NEW.amount >= threshold THEN
    -- Create AI Finance Event
    INSERT INTO ai_finance_events (
      tenant_id,
      event_type,
      severity,
      source_table,
      source_id,
      event_data,
      status
    ) VALUES (
      NEW.tenant_id,
      'large_transaction',
      'high',
      'transactions',
      NEW.id,
      jsonb_build_object(
        'amount', NEW.amount,
        'currency', NEW.currency,
        'threshold', threshold,
        'account_from', NEW.debit_account_id,
        'account_to', NEW.credit_account_id,
        'description', NEW.description
      ),
      'pending'
    ) RETURNING id INTO event_id;
    
    -- Log the detection
    RAISE NOTICE '🚨 Large Transaction Detected: % SAR (Event: %)', NEW.amount, event_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Detect Duplicate Payment
CREATE OR REPLACE FUNCTION detect_duplicate_payment()
RETURNS TRIGGER AS $$
DECLARE
  duplicate_count INTEGER;
  event_id UUID;
BEGIN
  -- Check for duplicate payments within 24 hours
  SELECT COUNT(*) INTO duplicate_count
  FROM transactions
  WHERE tenant_id = NEW.tenant_id
    AND id != NEW.id
    AND amount = NEW.amount
    AND credit_account_id = NEW.credit_account_id
    AND created_at >= NOW() - INTERVAL '24 hours';
  
  IF duplicate_count > 0 THEN
    -- Create AI Finance Event
    INSERT INTO ai_finance_events (
      tenant_id,
      event_type,
      severity,
      source_table,
      source_id,
      event_data,
      status
    ) VALUES (
      NEW.tenant_id,
      'duplicate_payment',
      'medium',
      'transactions',
      NEW.id,
      jsonb_build_object(
        'amount', NEW.amount,
        'duplicate_count', duplicate_count,
        'account', NEW.credit_account_id,
        'time_window', '24 hours'
      ),
      'pending'
    ) RETURNING id INTO event_id;
    
    RAISE NOTICE '⚠️ Duplicate Payment Detected: % occurrences (Event: %)', duplicate_count, event_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Detect Round Amount (Structuring)
CREATE OR REPLACE FUNCTION detect_round_amount()
RETURNS TRIGGER AS $$
DECLARE
  event_id UUID;
BEGIN
  -- Check if amount is round (divisible by 1000) and > 10,000
  IF NEW.amount >= 10000 AND MOD(NEW.amount::INTEGER, 1000) = 0 THEN
    INSERT INTO ai_finance_events (
      tenant_id,
      event_type,
      severity,
      source_table,
      source_id,
      event_data,
      status
    ) VALUES (
      NEW.tenant_id,
      'round_amount_structuring',
      'low',
      'transactions',
      NEW.id,
      jsonb_build_object(
        'amount', NEW.amount,
        'is_round', true,
        'potential_structuring', true
      ),
      'pending'
    ) RETURNING id INTO event_id;
    
    RAISE NOTICE '🔍 Round Amount Detected: % SAR (Event: %)', NEW.amount, event_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Detect Budget Overrun
CREATE OR REPLACE FUNCTION detect_budget_overrun()
RETURNS TRIGGER AS $$
DECLARE
  budget_limit NUMERIC;
  current_spent NUMERIC;
  event_id UUID;
BEGIN
  -- Get budget limit for the account
  SELECT amount INTO budget_limit
  FROM budgets
  WHERE tenant_id = NEW.tenant_id
    AND account_id = NEW.debit_account_id
    AND period_start <= CURRENT_DATE
    AND period_end >= CURRENT_DATE
  LIMIT 1;
  
  IF budget_limit IS NOT NULL THEN
    -- Calculate current spending
    SELECT COALESCE(SUM(amount), 0) INTO current_spent
    FROM transactions
    WHERE tenant_id = NEW.tenant_id
      AND debit_account_id = NEW.debit_account_id
      AND transaction_date >= (SELECT period_start FROM budgets WHERE account_id = NEW.debit_account_id LIMIT 1)
      AND transaction_date <= CURRENT_DATE;
    
    -- Check if over budget
    IF current_spent + NEW.amount > budget_limit THEN
      INSERT INTO ai_finance_events (
        tenant_id,
        event_type,
        severity,
        source_table,
        source_id,
        event_data,
        status
      ) VALUES (
        NEW.tenant_id,
        'budget_overrun',
        'high',
        'transactions',
        NEW.id,
        jsonb_build_object(
          'budget_limit', budget_limit,
          'current_spent', current_spent,
          'new_amount', NEW.amount,
          'total_spent', current_spent + NEW.amount,
          'overrun_amount', (current_spent + NEW.amount) - budget_limit,
          'overrun_percentage', ((current_spent + NEW.amount - budget_limit) / budget_limit * 100)
        ),
        'pending'
      ) RETURNING id INTO event_id;
      
      RAISE NOTICE '💰 Budget Overrun Detected: %.2f%% (Event: %)', 
        ((current_spent + NEW.amount - budget_limit) / budget_limit * 100), event_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Detect Unusual Transaction Time
CREATE OR REPLACE FUNCTION detect_unusual_time()
RETURNS TRIGGER AS $$
DECLARE
  transaction_hour INTEGER;
  event_id UUID;
BEGIN
  transaction_hour := EXTRACT(HOUR FROM NEW.created_at);
  
  -- Check if transaction is outside business hours (8 AM - 5 PM)
  IF transaction_hour < 8 OR transaction_hour >= 17 THEN
    INSERT INTO ai_finance_events (
      tenant_id,
      event_type,
      severity,
      source_table,
      source_id,
      event_data,
      status
    ) VALUES (
      NEW.tenant_id,
      'unusual_transaction_time',
      'low',
      'transactions',
      NEW.id,
      jsonb_build_object(
        'hour', transaction_hour,
        'business_hours', '08:00-17:00',
        'amount', NEW.amount
      ),
      'pending'
    ) RETURNING id INTO event_id;
    
    RAISE NOTICE '🕐 Unusual Time Transaction: %:00 (Event: %)', transaction_hour, event_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Detect Rapid Succession Transactions
CREATE OR REPLACE FUNCTION detect_rapid_transactions()
RETURNS TRIGGER AS $$
DECLARE
  recent_count INTEGER;
  event_id UUID;
BEGIN
  -- Count transactions in last 1 hour
  SELECT COUNT(*) INTO recent_count
  FROM transactions
  WHERE tenant_id = NEW.tenant_id
    AND created_by = NEW.created_by
    AND created_at >= NOW() - INTERVAL '1 hour';
  
  IF recent_count > 10 THEN
    INSERT INTO ai_finance_events (
      tenant_id,
      event_type,
      severity,
      source_table,
      source_id,
      event_data,
      status
    ) VALUES (
      NEW.tenant_id,
      'rapid_transactions',
      'medium',
      'transactions',
      NEW.id,
      jsonb_build_object(
        'count', recent_count,
        'time_window', '1 hour',
        'user_id', NEW.created_by
      ),
      'pending'
    ) RETURNING id INTO event_id;
    
    RAISE NOTICE '⚡ Rapid Transactions Detected: % in 1 hour (Event: %)', recent_count, event_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 2. CREATE TRIGGERS
-- ============================================

-- Trigger: Large Transaction Detection
DROP TRIGGER IF EXISTS trg_detect_large_transaction ON transactions;
CREATE TRIGGER trg_detect_large_transaction
  AFTER INSERT ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION detect_large_transaction();

-- Trigger: Duplicate Payment Detection
DROP TRIGGER IF EXISTS trg_detect_duplicate_payment ON transactions;
CREATE TRIGGER trg_detect_duplicate_payment
  AFTER INSERT ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION detect_duplicate_payment();

-- Trigger: Round Amount Detection
DROP TRIGGER IF EXISTS trg_detect_round_amount ON transactions;
CREATE TRIGGER trg_detect_round_amount
  AFTER INSERT ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION detect_round_amount();

-- Trigger: Budget Overrun Detection
DROP TRIGGER IF EXISTS trg_detect_budget_overrun ON transactions;
CREATE TRIGGER trg_detect_budget_overrun
  AFTER INSERT ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION detect_budget_overrun();

-- Trigger: Unusual Time Detection
DROP TRIGGER IF EXISTS trg_detect_unusual_time ON transactions;
CREATE TRIGGER trg_detect_unusual_time
  AFTER INSERT ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION detect_unusual_time();

-- Trigger: Rapid Transactions Detection
DROP TRIGGER IF EXISTS trg_detect_rapid_transactions ON transactions;
CREATE TRIGGER trg_detect_rapid_transactions
  AFTER INSERT ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION detect_rapid_transactions();

-- ============================================
-- 3. EVENT PROCESSING FUNCTION
-- ============================================

-- Function: Process AI Finance Events
CREATE OR REPLACE FUNCTION process_ai_finance_event(event_id UUID)
RETURNS VOID AS $$
DECLARE
  event_record RECORD;
  workflow_id UUID;
BEGIN
  -- Get event details
  SELECT * INTO event_record
  FROM ai_finance_events
  WHERE id = event_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Event not found: %', event_id;
  END IF;
  
  -- Create workflow based on event type
  CASE event_record.event_type
    WHEN 'large_transaction' THEN
      -- Create compliance review workflow
      INSERT INTO ai_finance_workflows (
        tenant_id,
        event_id,
        workflow_type,
        workflow_name,
        workflow_name_ar,
        status,
        priority,
        assigned_agent
      ) VALUES (
        event_record.tenant_id,
        event_id,
        'compliance_review',
        'Large Transaction Review',
        'مراجعة معاملة كبيرة',
        'pending',
        'high',
        'compliance-agent'
      ) RETURNING id INTO workflow_id;
      
    WHEN 'duplicate_payment' THEN
      -- Create fraud detection workflow
      INSERT INTO ai_finance_workflows (
        tenant_id,
        event_id,
        workflow_type,
        workflow_name,
        workflow_name_ar,
        status,
        priority,
        assigned_agent
      ) VALUES (
        event_record.tenant_id,
        event_id,
        'fraud_detection',
        'Duplicate Payment Investigation',
        'تحقيق في دفعة مكررة',
        'pending',
        'medium',
        'fraud-detection-agent'
      ) RETURNING id INTO workflow_id;
      
    WHEN 'budget_overrun' THEN
      -- Create budget alert workflow
      INSERT INTO ai_finance_workflows (
        tenant_id,
        event_id,
        workflow_type,
        workflow_name,
        workflow_name_ar,
        status,
        priority,
        assigned_agent
      ) VALUES (
        event_record.tenant_id,
        event_id,
        'budget_alert',
        'Budget Overrun Alert',
        'تنبيه تجاوز الميزانية',
        'pending',
        'high',
        'budget-monitor-agent'
      ) RETURNING id INTO workflow_id;
      
    ELSE
      -- Create generic review workflow
      INSERT INTO ai_finance_workflows (
        tenant_id,
        event_id,
        workflow_type,
        workflow_name,
        workflow_name_ar,
        status,
        priority,
        assigned_agent
      ) VALUES (
        event_record.tenant_id,
        event_id,
        'general_review',
        'Financial Event Review',
        'مراجعة حدث مالي',
        'pending',
        'low',
        'general-agent'
      ) RETURNING id INTO workflow_id;
  END CASE;
  
  -- Update event status
  UPDATE ai_finance_events
  SET status = 'processing',
      processed_at = CURRENT_TIMESTAMP
  WHERE id = event_id;
  
  RAISE NOTICE '✅ Workflow Created: % for Event: %', workflow_id, event_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. SCHEDULED EVENT PROCESSOR
-- ============================================

-- Function: Process Pending Events (Called by Scheduler)
CREATE OR REPLACE FUNCTION process_pending_events()
RETURNS TABLE(processed_count INTEGER, workflow_count INTEGER) AS $$
DECLARE
  event_rec RECORD;
  processed INTEGER := 0;
  workflows INTEGER := 0;
BEGIN
  -- Process all pending events
  FOR event_rec IN
    SELECT id
    FROM ai_finance_events
    WHERE status = 'pending'
    ORDER BY created_at ASC
    LIMIT 100
  LOOP
    BEGIN
      PERFORM process_ai_finance_event(event_rec.id);
      processed := processed + 1;
      workflows := workflows + 1;
    EXCEPTION WHEN OTHERS THEN
      -- Log error and continue
      RAISE WARNING 'Failed to process event %: %', event_rec.id, SQLERRM;
      
      UPDATE ai_finance_events
      SET status = 'failed',
          event_data = event_data || jsonb_build_object('error', SQLERRM)
      WHERE id = event_rec.id;
    END;
  END LOOP;
  
  RETURN QUERY SELECT processed, workflows;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. NOTIFICATION TRIGGERS
-- ============================================

-- Function: Send Notification on High Severity Event
CREATE OR REPLACE FUNCTION notify_high_severity_event()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.severity = 'high' THEN
    -- Send notification (will be picked up by notification service)
    PERFORM pg_notify(
      'high_severity_event',
      json_build_object(
        'event_id', NEW.id,
        'tenant_id', NEW.tenant_id,
        'event_type', NEW.event_type,
        'severity', NEW.severity,
        'data', NEW.event_data
      )::text
    );
    
    RAISE NOTICE '📢 High Severity Event Notification Sent: %', NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Notify on High Severity
DROP TRIGGER IF EXISTS trg_notify_high_severity ON ai_finance_events;
CREATE TRIGGER trg_notify_high_severity
  AFTER INSERT ON ai_finance_events
  FOR EACH ROW
  WHEN (NEW.severity = 'high')
  EXECUTE FUNCTION notify_high_severity_event();

-- ============================================
-- 6. CLEANUP FUNCTION
-- ============================================

-- Function: Archive Old Events (Run Daily)
CREATE OR REPLACE FUNCTION archive_old_events()
RETURNS INTEGER AS $$
DECLARE
  archived_count INTEGER;
BEGIN
  -- Archive events older than 90 days
  WITH archived AS (
    DELETE FROM ai_finance_events
    WHERE created_at < NOW() - INTERVAL '90 days'
      AND status IN ('completed', 'failed')
    RETURNING *
  )
  SELECT COUNT(*) INTO archived_count FROM archived;
  
  RAISE NOTICE '🗄️ Archived % old events', archived_count;
  RETURN archived_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON FUNCTION detect_large_transaction() IS 'Detects transactions >= 100,000 SAR';
COMMENT ON FUNCTION detect_duplicate_payment() IS 'Detects duplicate payments within 24 hours';
COMMENT ON FUNCTION detect_round_amount() IS 'Detects round amounts (potential structuring)';
COMMENT ON FUNCTION detect_budget_overrun() IS 'Detects budget overruns';
COMMENT ON FUNCTION detect_unusual_time() IS 'Detects transactions outside business hours';
COMMENT ON FUNCTION detect_rapid_transactions() IS 'Detects rapid succession of transactions';
COMMENT ON FUNCTION process_ai_finance_event(UUID) IS 'Processes a single AI finance event and creates workflow';
COMMENT ON FUNCTION process_pending_events() IS 'Processes all pending events (called by scheduler)';
COMMENT ON FUNCTION archive_old_events() IS 'Archives events older than 90 days';

-- Success Message
DO $$
BEGIN
  RAISE NOTICE '✅ Red Flags Triggers & Events System Activated!';
  RAISE NOTICE '📊 6 Detection Triggers Created';
  RAISE NOTICE '🤖 AI Workflow Integration Ready';
  RAISE NOTICE '📢 Notification System Active';
  RAISE NOTICE '🗄️ Auto-Archive Configured';
END $$;
