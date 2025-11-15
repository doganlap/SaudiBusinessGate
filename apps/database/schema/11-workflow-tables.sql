-- ============================================
-- Workflow Management Tables
-- Saudi Store - المتجر السعودي
-- Real-time workflow tracking with WebSocket support
-- ============================================

-- Workflow Instances Table
CREATE TABLE IF NOT EXISTS workflow_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Workflow Info
  workflow_name VARCHAR(255) NOT NULL,
  workflow_name_ar VARCHAR(255),
  workflow_type VARCHAR(100), -- compliance, risk, evidence, etc.
  
  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'queued',
  -- Status values: queued, running, completed, failed, paused, cancelled
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  
  -- User tracking
  created_by UUID REFERENCES platform_users(id),
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Constraints
  CONSTRAINT valid_status CHECK (
    status IN ('queued', 'running', 'completed', 'failed', 'paused', 'cancelled')
  )
);

-- Workflow Steps Table
CREATE TABLE IF NOT EXISTS workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_instance_id UUID NOT NULL REFERENCES workflow_instances(id) ON DELETE CASCADE,
  
  -- Step Info
  step_name VARCHAR(255) NOT NULL,
  step_name_ar VARCHAR(255),
  step_order INTEGER NOT NULL,
  step_type VARCHAR(100), -- agent, manual, automated, approval
  
  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  -- Status values: pending, running, completed, failed, skipped, paused
  
  -- Progress
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  duration_ms INTEGER, -- Duration in milliseconds
  
  -- Details
  details TEXT,
  details_ar TEXT,
  agent_name VARCHAR(255),
  
  -- Results
  result JSONB DEFAULT '{}',
  error_message TEXT,
  
  -- Constraints
  CONSTRAINT valid_step_status CHECK (
    status IN ('pending', 'running', 'completed', 'failed', 'skipped', 'paused')
  )
);

-- Workflow Events Table (for audit trail)
CREATE TABLE IF NOT EXISTS workflow_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_instance_id UUID NOT NULL REFERENCES workflow_instances(id) ON DELETE CASCADE,
  workflow_step_id UUID REFERENCES workflow_steps(id) ON DELETE SET NULL,
  
  -- Event Info
  event_type VARCHAR(100) NOT NULL,
  -- Event types: created, started, step_started, step_completed, step_failed, 
  --              completed, failed, paused, resumed, cancelled
  
  event_data JSONB DEFAULT '{}',
  
  -- User tracking
  triggered_by UUID REFERENCES platform_users(id),
  
  -- Timestamp
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- IP and User Agent
  ip_address INET,
  user_agent TEXT
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_workflow_instances_tenant 
  ON workflow_instances(tenant_id);

CREATE INDEX IF NOT EXISTS idx_workflow_instances_status 
  ON workflow_instances(status);

CREATE INDEX IF NOT EXISTS idx_workflow_instances_created 
  ON workflow_instances(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_workflow_instances_type 
  ON workflow_instances(workflow_type);

CREATE INDEX IF NOT EXISTS idx_workflow_steps_instance 
  ON workflow_steps(workflow_instance_id);

CREATE INDEX IF NOT EXISTS idx_workflow_steps_status 
  ON workflow_steps(status);

CREATE INDEX IF NOT EXISTS idx_workflow_steps_order 
  ON workflow_steps(workflow_instance_id, step_order);

CREATE INDEX IF NOT EXISTS idx_workflow_events_instance 
  ON workflow_events(workflow_instance_id);

CREATE INDEX IF NOT EXISTS idx_workflow_events_step 
  ON workflow_events(workflow_step_id);

CREATE INDEX IF NOT EXISTS idx_workflow_events_type 
  ON workflow_events(event_type);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_workflow_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER workflow_instances_updated_at
  BEFORE UPDATE ON workflow_instances
  FOR EACH ROW
  EXECUTE FUNCTION update_workflow_timestamp();

CREATE TRIGGER workflow_steps_updated_at
  BEFORE UPDATE ON workflow_steps
  FOR EACH ROW
  EXECUTE FUNCTION update_workflow_timestamp();

-- Function to calculate step duration
CREATE OR REPLACE FUNCTION calculate_step_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('completed', 'failed') AND NEW.started_at IS NOT NULL THEN
    NEW.duration_ms = EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at)) * 1000;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER workflow_steps_calculate_duration
  BEFORE UPDATE ON workflow_steps
  FOR EACH ROW
  WHEN (NEW.status IN ('completed', 'failed'))
  EXECUTE FUNCTION calculate_step_duration();

-- Function to log workflow events
CREATE OR REPLACE FUNCTION log_workflow_event()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO workflow_events (
      workflow_instance_id,
      event_type,
      event_data,
      triggered_by
    ) VALUES (
      NEW.id,
      'created',
      json_build_object(
        'workflow_name', NEW.workflow_name,
        'status', NEW.status
      )::jsonb,
      NEW.created_by
    );
  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    INSERT INTO workflow_events (
      workflow_instance_id,
      event_type,
      event_data
    ) VALUES (
      NEW.id,
      CASE NEW.status
        WHEN 'running' THEN 'started'
        WHEN 'completed' THEN 'completed'
        WHEN 'failed' THEN 'failed'
        WHEN 'paused' THEN 'paused'
        WHEN 'cancelled' THEN 'cancelled'
        ELSE 'status_changed'
      END,
      json_build_object(
        'old_status', OLD.status,
        'new_status', NEW.status
      )::jsonb
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER workflow_instances_log_events
  AFTER INSERT OR UPDATE ON workflow_instances
  FOR EACH ROW
  EXECUTE FUNCTION log_workflow_event();

-- Sample Data for Testing
INSERT INTO workflow_instances (
  tenant_id,
  workflow_name,
  workflow_name_ar,
  workflow_type,
  status,
  created_by
) VALUES (
  (SELECT id FROM tenants LIMIT 1),
  'Compliance Gap Scan',
  'فحص فجوات الامتثال',
  'compliance',
  'running',
  (SELECT id FROM platform_users LIMIT 1)
) ON CONFLICT DO NOTHING;

-- Sample Steps
WITH workflow AS (
  SELECT id FROM workflow_instances WHERE workflow_name = 'Compliance Gap Scan' LIMIT 1
)
INSERT INTO workflow_steps (
  workflow_instance_id,
  step_name,
  step_name_ar,
  step_order,
  status,
  progress,
  agent_name
)
SELECT 
  workflow.id,
  step_data.name,
  step_data.name_ar,
  step_data.step_order,
  step_data.status,
  step_data.progress,
  step_data.agent
FROM workflow,
  (VALUES
    ('Initialize Scan', 'تهيئة الفحص', 0, 'completed', 100, 'compliance-agent'),
    ('Collect Data', 'جمع البيانات', 1, 'completed', 100, 'compliance-agent'),
    ('Analyze Gaps', 'تحليل الفجوات', 2, 'running', 65, 'compliance-agent'),
    ('Generate Report', 'إنشاء التقرير', 3, 'pending', 0, 'compliance-agent'),
    ('Send Notification', 'إرسال الإشعار', 4, 'pending', 0, 'notification-agent')
  ) AS step_data(name, name_ar, step_order, status, progress, agent)
ON CONFLICT DO NOTHING;

-- Comments
COMMENT ON TABLE workflow_instances IS 'Stores workflow execution instances with real-time tracking';
COMMENT ON TABLE workflow_steps IS 'Individual steps within a workflow instance';
COMMENT ON TABLE workflow_events IS 'Audit trail of all workflow events';

COMMENT ON COLUMN workflow_instances.status IS 'Current status: queued, running, completed, failed, paused, cancelled';
COMMENT ON COLUMN workflow_steps.progress IS 'Progress percentage (0-100)';
COMMENT ON COLUMN workflow_steps.duration_ms IS 'Step execution duration in milliseconds';
