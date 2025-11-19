# Database Setup Instructions

## Overview

This guide will help you set up the database and run migrations for the Saudi Store application.

## Prerequisites

1. **PostgreSQL Database** - You need a PostgreSQL database (local or remote)
2. **Environment Variables** - Set `DATABASE_URL` in your `.env` file

## Step 1: Configure Database Connection

Create or update your `.env` file with the database connection:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/saudistore
```

For remote databases (like Neon, Supabase, etc.):

```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname?sslmode=require
```

## Step 2: Run Database Setup

### Option A: Automated Setup (Recommended)

Run the comprehensive setup script that will:

1. Test database connection
2. Create all required tables (CRM, Procurement, HR, GRC, etc.)
3. Seed the database with initial data
4. Verify the setup

```bash
npm run db:setup:full
```

Or:

```bash
npm run db:migrate:sql
```

### Option B: Manual Setup

#### 2.1 Run Prisma Migrations (for core tables)

```bash
npm run db:migrate
```

If Prisma migrate fails due to connection issues, you can use:

```bash
npm run db:push
```

#### 2.2 Run SQL Migrations (for module tables)

The following SQL files need to be run to create module-specific tables:

```bash
# Using psql (if you have PostgreSQL client installed)
psql $DATABASE_URL -f database/create-crm-tables.sql
psql $DATABASE_URL -f database/create-sales-tables.sql
psql $DATABASE_URL -f database/create-hr-tables.sql
psql $DATABASE_URL -f database/create-finance-tables.sql
psql $DATABASE_URL -f database/create-grc-tables.sql
psql $DATABASE_URL -f database/create-procurement-tables.sql
```

Or run all at once:

```bash
psql $DATABASE_URL -f database/create-all-tables.sql
```

#### 2.3 Seed the Database

```bash
npm run db:seed:all
```

This will:

- Create subscription plans
- Create modules
- Create sample tenants (Saudi companies)
- Create sample users
- Create sample data for all modules (CRM, Finance, HR, etc.)

## Step 3: Verify Setup

### Check Database Connection

```bash
npm run db:test
```

### View Database in Prisma Studio

```bash
npm run db:studio
```

This will open a web interface where you can browse and edit your database.

### Verify Tables Exist

Connect to your database and run:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

You should see tables like:

- `customers` (CRM)
- `vendors`, `inventory_items`, `purchase_orders` (Procurement)
- `employees` (HR)
- `controls`, `frameworks` (GRC)
- `tenants`, `users` (Core)
- And many more...

## Troubleshooting

### Database Connection Failed

**Error**: `Can't reach database server`

**Solutions**:

1. Check if PostgreSQL is running
2. Verify `DATABASE_URL` in `.env` file
3. Check firewall settings
4. For remote databases, ensure SSL is configured correctly

### Tables Already Exist

**Error**: `relation already exists`

**Solutions**:

- This is normal if you're re-running migrations
- The script will skip existing tables
- If you need a fresh start, reset the database:

  ```bash
  npm run db:reset
  ```

### Seed Script Fails

**Error**: `Foreign key constraint violation`

**Solutions**:

1. Ensure all tables are created first
2. Run migrations in order
3. Check if required data exists (e.g., tenants before users)

## Testing the Application

After setup is complete:

1. **Start the development server**:

   ```bash
   npm run dev
   ```

2. **Test API endpoints**:
   - Visit: `http://localhost:3050/api/crm/customers`
   - Visit: `http://localhost:3050/api/procurement/vendors`
   - Visit: `http://localhost:3050/api/hr/employees`

3. **Test Frontend Pages**:
   - Visit: `http://localhost:3050/dashboard`
   - Visit: `http://localhost:3050/crm`
   - Visit: `http://localhost:3050/procurement`

## Next Steps

1. ✅ Database is set up
2. ✅ Tables are created
3. ✅ Data is seeded
4. 🚀 Start developing!

For more information, see:

- `IMPLEMENTATION_COMPLETE.md` - Implementation details
- `prisma/schema.prisma` - Database schema
- `prisma/seed-complete.ts` - Seed data structure
