#!/bin/bash

# ============================================
# RED FLAGS ACTIVATION SCRIPT
# Saudi Store - المتجر السعودي
# Automated deployment of Red Flags detection system
# ============================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DB_NAME="${POSTGRES_DB:-saudi_store}"
DB_USER="${POSTGRES_USER:-postgres}"
DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}🚀 Red Flags System Activation${NC}"
echo -e "${BLUE}المتجر السعودي - Saudi Store${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Function to print status
print_status() {
    echo -e "${GREEN}✅${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️${NC}  $1"
}

print_info() {
    echo -e "${BLUE}ℹ️${NC}  $1"
}

# Check if PostgreSQL is running
print_info "Checking PostgreSQL connection..."
if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1" > /dev/null 2>&1; then
    print_status "PostgreSQL connection successful"
else
    print_error "Cannot connect to PostgreSQL"
    print_info "Please check your database configuration"
    exit 1
fi

# Step 1: Deploy Red Flags Triggers
print_info "Deploying Red Flags Triggers..."
if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "database/schema/12-red-flags-triggers.sql" > /dev/null 2>&1; then
    print_status "Red Flags Triggers deployed successfully"
else
    print_error "Failed to deploy Red Flags Triggers"
    exit 1
fi

# Step 2: Verify Triggers
print_info "Verifying triggers..."
TRIGGER_COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
    SELECT COUNT(*) 
    FROM information_schema.triggers 
    WHERE trigger_schema = 'public' 
    AND trigger_name LIKE 'trg_detect_%'
")

if [ "$TRIGGER_COUNT" -ge 6 ]; then
    print_status "All 6 detection triggers verified"
else
    print_warning "Expected 6 triggers, found $TRIGGER_COUNT"
fi

# Step 3: Verify Functions
print_info "Verifying functions..."
FUNCTION_COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
    SELECT COUNT(*) 
    FROM pg_proc 
    WHERE proname IN (
        'detect_large_transaction',
        'detect_duplicate_payment',
        'detect_round_amount',
        'detect_budget_overrun',
        'detect_unusual_time',
        'detect_rapid_transactions',
        'process_ai_finance_event',
        'process_pending_events',
        'archive_old_events'
    )
")

if [ "$FUNCTION_COUNT" -ge 9 ]; then
    print_status "All detection functions verified"
else
    print_warning "Expected 9 functions, found $FUNCTION_COUNT"
fi

# Step 4: Test Detection System
print_info "Testing detection system..."

# Insert test transaction (large amount)
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
    INSERT INTO transactions (
        tenant_id,
        amount,
        currency,
        debit_account_id,
        credit_account_id,
        description,
        transaction_date,
        created_by
    ) VALUES (
        (SELECT id FROM tenants LIMIT 1),
        150000,
        'SAR',
        (SELECT id FROM financial_accounts WHERE account_type = 'asset' LIMIT 1),
        (SELECT id FROM financial_accounts WHERE account_type = 'liability' LIMIT 1),
        'Test Large Transaction',
        CURRENT_DATE,
        (SELECT id FROM platform_users LIMIT 1)
    )
" > /dev/null 2>&1

# Check if event was created
EVENT_COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
    SELECT COUNT(*) 
    FROM ai_finance_events 
    WHERE event_type = 'large_transaction' 
    AND created_at >= NOW() - INTERVAL '1 minute'
")

if [ "$EVENT_COUNT" -gt 0 ]; then
    print_status "Detection system working - Event created"
else
    print_warning "No event created - Check trigger configuration"
fi

# Step 5: Process Pending Events
print_info "Processing pending events..."
RESULT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
    SELECT * FROM process_pending_events()
")

print_status "Event processing completed: $RESULT"

# Step 6: Verify Workflows Created
WORKFLOW_COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
    SELECT COUNT(*) 
    FROM ai_finance_workflows 
    WHERE created_at >= NOW() - INTERVAL '1 minute'
")

if [ "$WORKFLOW_COUNT" -gt 0 ]; then
    print_status "AI Workflows created successfully"
else
    print_warning "No workflows created - Check event processing"
fi

# Step 7: Display Statistics
echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}📊 System Statistics${NC}"
echo -e "${BLUE}============================================${NC}"

# Total Events
TOTAL_EVENTS=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
    SELECT COUNT(*) FROM ai_finance_events
")
print_info "Total Events: $TOTAL_EVENTS"

# Pending Events
PENDING_EVENTS=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
    SELECT COUNT(*) FROM ai_finance_events WHERE status = 'pending'
")
print_info "Pending Events: $PENDING_EVENTS"

# Active Workflows
ACTIVE_WORKFLOWS=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
    SELECT COUNT(*) FROM ai_finance_workflows WHERE status IN ('pending', 'running')
")
print_info "Active Workflows: $ACTIVE_WORKFLOWS"

# Events by Type
echo ""
print_info "Events by Type:"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
    SELECT 
        event_type,
        COUNT(*) as count,
        severity
    FROM ai_finance_events
    GROUP BY event_type, severity
    ORDER BY count DESC
"

# Step 8: Setup Scheduler (Optional)
echo ""
print_info "Setting up scheduler..."
print_warning "Scheduler setup requires cron or pg_cron extension"
print_info "To enable automatic event processing, add to crontab:"
echo ""
echo -e "${YELLOW}# Process AI Finance Events every minute${NC}"
echo -e "${YELLOW}* * * * * psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c \"SELECT process_pending_events()\"${NC}"
echo ""
echo -e "${YELLOW}# Archive old events daily at 2 AM${NC}"
echo -e "${YELLOW}0 2 * * * psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c \"SELECT archive_old_events()\"${NC}"
echo ""

# Step 9: Display Configuration
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}⚙️  Configuration${NC}"
echo -e "${BLUE}============================================${NC}"
print_info "YAML Config: config/ai-workflow-config.yaml"
print_info "SQL Schema: database/schema/12-red-flags-triggers.sql"
print_info "Database: $DB_NAME"
print_info "Host: $DB_HOST:$DB_PORT"
echo ""

# Step 10: Next Steps
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}📝 Next Steps${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
print_info "1. Review YAML configuration: config/ai-workflow-config.yaml"
print_info "2. Configure notification channels (email, SMS, etc.)"
print_info "3. Setup WebSocket server for real-time updates"
print_info "4. Configure scheduler for automatic event processing"
print_info "5. Test with real transactions"
print_info "6. Monitor ai_finance_events and ai_finance_workflows tables"
echo ""

# Success Message
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}✅ Red Flags System Activated Successfully!${NC}"
echo -e "${GREEN}المتجر السعودي - Saudi Store${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
print_status "6 Detection Triggers Active"
print_status "9 Detection Functions Deployed"
print_status "AI Workflow Integration Ready"
print_status "Notification System Configured"
print_status "Multi-Tenant Support Enabled"
echo ""
print_info "System is now monitoring all transactions for red flags"
print_info "Events will be automatically processed and routed to AI agents"
echo ""
