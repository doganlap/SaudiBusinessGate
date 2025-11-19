# Production Setup Instructions

## Complete Database Setup

### Step 1: Create All Database Tables

Run the following commands to create all module tables:

```bash
# Create CRM tables
psql -d your_database -f database/create-crm-tables.sql

# Create Sales tables
psql -d your_database -f database/create-sales-tables.sql

# Create HR tables
psql -d your_database -f database/create-hr-tables.sql

# Create Finance tables
psql -d your_database -f database/create-finance-tables.sql

# Create GRC tables
psql -d your_database -f database/create-grc-tables.sql

# Create Procurement tables
psql -d your_database -f database/create-procurement-tables.sql
```

Or run all at once (if your psql supports \i):

```bash
psql -d your_database -f database/create-all-tables.sql
```

### Step 2: Seed Database

```bash
# Seed core platform data (tenants, users, modules, subscriptions)
npm run db:seed:complete

# Seed all module data (CRM, Sales, HR, Finance, GRC, Procurement)
npm run db:seed:modules

# Or seed everything at once
npm run db:seed:all
```

### Step 3: Verify Setup

1. Check that tables were created:

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%customers%' OR table_name LIKE '%deals%' 
OR table_name LIKE '%employees%' OR table_name LIKE '%invoices%';
```

1. Check that data was seeded:

```sql
SELECT COUNT(*) FROM tenants;
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM customers;
SELECT COUNT(*) FROM deals;
SELECT COUNT(*) FROM employees;
```

## API Routes Status

### ✅ Using Real Database

- `/api/dashboard/stats` - Real database queries
- `/api/analytics/kpis/business` - Real analytics engine
- `/api/analytics/forecast/sales` - Real AI analytics
- `/api/crm/customers` - Real database queries
- `/api/sales/pipeline` - Real database queries
- `/api/hr/employees` - Real database queries
- `/api/finance/invoices` - Real database (via CompleteFinanceService)

### 🚧 Still Using Mocks (Need Update)

- `/api/grc/*` - Need to update to use real database
- `/api/procurement/*` - Need to update to use real database
- Other module-specific routes

## Testing

### Test API Endpoints

```bash
# Test dashboard stats
curl http://localhost:3050/api/dashboard/stats

# Test CRM customers
curl http://localhost:3050/api/crm/customers

# Test sales pipeline
curl http://localhost:3050/api/sales/pipeline

# Test HR employees
curl http://localhost:3050/api/hr/employees
```

### Login Credentials

After seeding, use these credentials:

- **Email**: `mohammed.otaibi@riyadh-trade.sa`
- **Password**: `Password123!`

## Next Steps

1. **Update GRC API routes** - Replace mock data with real database queries
2. **Update Procurement API routes** - Replace mock data with real database queries
3. **Update frontend pages** - Ensure all pages fetch from real APIs
4. **Remove mock data files** - Clean up after all modules are migrated

## Troubleshooting

### Tables Not Found Error

If you see `42P01` error (table does not exist):

- Run the appropriate SQL script from `database/` folder
- Check that DATABASE_URL is set correctly

### No Data Returned

- Run seeding scripts: `npm run db:seed:all`
- Check tenant_id matches in your session
- Verify database connection

### Connection Issues

- Check DATABASE_URL environment variable
- Verify database is running and accessible
- Check firewall/network settings
