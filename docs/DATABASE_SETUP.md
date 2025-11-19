# Database Setup & Service Connections Guide

## Overview

This guide explains how to connect all real services (Database, AI Analytics, Theme Management) to the DoganHubStore application.

## 🗄️ Database Setup

### Prerequisites

- PostgreSQL 14+ installed and running
- Node.js 18+ and npm installed
- Access to database credentials

### Step 1: Configure Environment Variables

1. Copy the example environment file:

```bash
cp .env.example .env
```

## 📋 License Management Database Setup

### Overview

This section covers the database setup for the comprehensive license management system.

### Prerequisites

- PostgreSQL 12+ installed and running
- Node.js environment with database connection configured
- Database user with CREATE TABLE permissions

### Quick Setup

#### 1. Database Connection

Ensure your `.env` file has the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=doganhub
DB_USER=postgres
DB_PASSWORD=your_password

# License Management Features
ENABLE_LICENSE_MANAGEMENT=true
LICENSE_ENFORCEMENT=true
AUTO_RENEWAL_CHECK=true
USAGE_TRACKING=true
```

#### 2. Run License Management Migrations

##### Option A: Automated Script

```bash
cd database/scripts
node run-license-migration.js
```

##### Option B: Manual SQL Execution

1. Connect to your PostgreSQL database
2. Run the migrations in order:
   - `database/migrations/001_license_management_complete.sql`
   - `database/migrations/002_license_seed_data.sql`

#### 3. Verification

After running the migrations, you should have these tables:

- `licenses` - License catalog/SKUs
- `license_features` - Available features
- `license_feature_map` - Feature-to-license mappings
- `tenant_licenses` - Active tenant licenses
- `license_renewals` - Renewal pipeline
- `renewal_communications` - Communication tracking
- `tenant_license_usage` - Usage tracking
- `usage_aggregations` - Pre-calculated usage stats
- `license_events` - Audit trail
- `license_notifications` - Notification preferences
- `dunning_schedules` - Renewal reminder configuration

Plus these views:

- `v_renewals_120d` - 120-day renewal pipeline view
- `v_license_usage_summary` - Current usage summary
- `v_usage_trends` - Monthly usage trends

### Sample Data

The seed script creates:

- 6 license types (Basic, Professional, Enterprise - monthly/annual)
- 12 feature definitions
- Feature mappings for each license tier
- 15 sample tenant licenses
- Renewal pipeline records
- Communication history
- Usage aggregation data
- Notification preferences
- Audit events

### API Integration

After database setup, the following API endpoints will work:

- `/api/licenses/*` - License management
- `/api/renewals/*` - Renewal pipeline
- `/api/usage/*` - Usage analytics

### Frontend Components

The React components will now connect to real data:

- `LicensesManagementPage` - Platform admin license overview
- `RenewalsPipelinePage` - 120-day renewal tracking
- `UsageDashboardPage` - Tenant usage analytics
- `UpgradePage` - License upgrade flow

### Testing License Functions

```sql
-- Check if a tenant has a specific feature
SELECT check_feature_availability('tenant-uuid', 'api_access');

-- View renewal pipeline
SELECT * FROM v_renewals_120d;

-- Check usage summary
SELECT * FROM v_license_usage_summary;
```

1. Update the database configuration in `.env`:

```env
# Database Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=doganhubstore
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-password-here
POSTGRES_SSL=false
DB_POOL_MAX=20
```

### Step 2: Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE doganhubstore;

# Exit psql
\q
```

### Step 3: Run Database Setup Script

```bash
# Install dependencies if not already installed
npm install

# Run the setup script
npx ts-node scripts/setup-database.ts
```

This will:

- ✅ Create all required tables (financial_accounts, transactions, budgets, cost_centers)
- ✅ Set up indexes for performance
- ✅ Create triggers for automatic timestamp updates
- ✅ Insert sample data for testing

### Step 4: Verify Database Setup

```bash
# Connect to database
psql -U postgres -d doganhubstore

# List tables
\dt

# Check sample data
SELECT * FROM financial_accounts;
SELECT * FROM transactions;

# Exit
\q
```

## 🔌 Service Connections

### Finance Service ✅

**Status**: Connected to real database

**Files**:

- Service: `lib/services/finance.service.ts`
- API Endpoints: `app/api/finance/*`
- Database Schema: `database/schema/01-finance-tables.sql`

**Features**:

- Real-time account management
- Transaction processing with balance updates
- Financial statistics calculation
- Multi-tenant data isolation
- Automatic fallback to sample data if DB unavailable

**Test**:

```bash
# Start the app
npm run dev

# Visit test page
http://localhost:3001/en/test-connections
```

### Billing Service ✅

**Status**: Connected to Stripe API

**Files**:

- Service: `Services/Billing/src/services/stripe.service.ts`
- API Endpoints: `app/api/billing/*`

**Configuration Required**:

```env
STRIPE_SECRET_KEY=sk_test_your_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

**Features**:

- Real Stripe payment processing
- Subscription management
- Customer portal access
- Webhook event handling

### Authentication Service ✅

**Status**: JWT-based authentication active

**Files**:

- API: `app/api/auth/me/route.ts`

**Configuration Required**:

```env
JWT_SECRET=your-super-secret-jwt-key-here
```

**Features**:

- JWT token verification
- Demo mode for development
- Multi-tenant user management

### AI Analytics Service ⚠️

**Status**: Architecture ready, needs connection

**Files**:

- Engine: `Services/AI/apps/services/ai-analytics-engine.ts`
- Dashboard: `Services/AI/apps/services/real-time-analytics-dashboard.ts`
- API: `app/api/analytics/kpis/business/route.ts`

**To Connect**:

1. The AI service code is ready in `Services/AI/`
2. Currently using sample KPI data
3. To connect real AI engine, update `app/api/analytics/kpis/business/route.ts`

### Theme Management Service ⚠️

**Status**: Service ready, needs database tables

**Files**:

- Service: `Services/WhiteLabel/theme-management-service.ts`
- API: `app/api/themes/[organizationId]/route.ts`

**To Connect**:

1. Create theme tables in database
2. Update API to use real service
3. Configure multi-tenant theme storage

## 📊 Database Schema

### Financial Accounts Table

```sql
CREATE TABLE financial_accounts (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    account_code VARCHAR(50) NOT NULL,
    account_type VARCHAR(50) CHECK (account_type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
    balance DECIMAL(15, 2) DEFAULT 0.00,
    parent_account_id UUID REFERENCES financial_accounts(id),
    is_active BOOLEAN DEFAULT true,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, account_code)
);
```

### Transactions Table

```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    account_id UUID NOT NULL REFERENCES financial_accounts(id),
    transaction_type VARCHAR(50) CHECK (transaction_type IN ('debit', 'credit', 'payment', 'receipt')),
    amount DECIMAL(15, 2) NOT NULL,
    transaction_date TIMESTAMP WITH TIME ZONE NOT NULL,
    reference_id VARCHAR(255),
    transaction_number VARCHAR(100),
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## 🧪 Testing Connections

### Test All Connections

Visit: `http://localhost:3001/en/test-connections`

This page will test:

- ✅ Dashboard Stats API
- ✅ Dashboard Activity API
- ✅ Authentication API
- ✅ Billing Plans API
- ✅ Finance Stats API (with DB connection)
- ✅ Finance Accounts API (with DB connection)
- ✅ Finance Transactions API (with DB connection)
- ✅ Analytics KPIs API
- ✅ Theme Management API

### Manual API Testing

```bash
# Test Finance Stats (should connect to DB)
curl http://localhost:3001/api/finance/stats

# Test Finance Accounts (should connect to DB)
curl http://localhost:3001/api/finance/accounts

# Test Finance Transactions (should connect to DB)
curl http://localhost:3001/api/finance/transactions

# Test Analytics KPIs
curl http://localhost:3001/api/analytics/kpis/business

# Test Billing Plans (Stripe)
curl http://localhost:3001/api/billing/plans
```

## 🔧 Troubleshooting

### Database Connection Issues

**Problem**: "Database connection failed"

**Solutions**:

1. Verify PostgreSQL is running: `pg_isready`
2. Check credentials in `.env`
3. Ensure database exists: `psql -l`
4. Check firewall/network settings

### Sample Data Not Showing

**Problem**: Empty tables after setup

**Solutions**:

1. Re-run setup script: `npx ts-node scripts/setup-database.ts`
2. Manually insert data from `database/schema/01-finance-tables.sql`
3. Check for SQL errors in console output

### API Returns Fallback Data

**Problem**: API shows `"source": "fallback"` instead of `"source": "database"`

**Solutions**:

1. Verify database connection in test page
2. Check database credentials
3. Ensure tables exist and have data
4. Review server console for errors

## 📈 Performance Optimization

### Database Indexes

All critical indexes are created automatically:

- Tenant ID indexes for multi-tenant queries
- Account type and status indexes
- Transaction date and status indexes
- Foreign key indexes for joins

### Connection Pooling

Configured in `lib/db/connection.ts`:

- Max connections: 20 (configurable via `DB_POOL_MAX`)
- Idle timeout: 30 seconds
- Connection timeout: 10 seconds

### Query Optimization

- Prepared statements used throughout
- Transaction support for data integrity
- Automatic query logging in development mode

## 🚀 Production Deployment

### Database Migration

1. Export schema: `pg_dump -s doganhubstore > schema.sql`
2. Import to production: `psql -h production-host -d doganhubstore < schema.sql`
3. Update `.env` with production credentials
4. Enable SSL: `POSTGRES_SSL=true`

### Environment Variables

Ensure all required variables are set:

```env
POSTGRES_HOST=your-production-host
POSTGRES_PORT=5432
POSTGRES_DB=doganhubstore_prod
POSTGRES_USER=prod_user
POSTGRES_PASSWORD=strong-password-here
POSTGRES_SSL=true
DB_POOL_MAX=50
```

### Security Checklist

- ✅ Use strong database passwords
- ✅ Enable SSL for database connections
- ✅ Restrict database access by IP
- ✅ Use read-only users for reporting
- ✅ Enable audit logging
- ✅ Regular backups configured

## 📞 Support

For issues or questions:

1. Check the test connections page: `/en/test-connections`
2. Review server console logs
3. Verify environment variables
4. Check database connectivity

## 🎯 Next Steps

1. ✅ Database setup complete
2. ✅ Finance service connected
3. ⏳ Connect AI Analytics engine
4. ⏳ Set up Theme Management tables
5. ⏳ Configure production database
6. ⏳ Set up automated backups

---

**Last Updated**: November 11, 2025  
**Version**: 1.0  
**Status**: 🟢 Finance DB Connected, Other Services Ready
