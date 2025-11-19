# Quick Database Setup Guide

## Current Issue

The database connection in your `.env` file is pointing to a remote Neon database that is not accessible.

## Quick Solution: Use Local PostgreSQL

### Step 1: Install PostgreSQL (if not installed)

**Windows:**

- Download from: <https://www.postgresql.org/download/windows/>
- Or use Chocolatey: `choco install postgresql`

**Mac:**

```bash
brew install postgresql
brew services start postgresql
```

**Linux:**

```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Step 2: Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE doganhubstore;

# Exit
\q
```

### Step 3: Update .env File

Open `.env` file and update `DATABASE_URL`:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/doganhubstore
```

Replace `your_password` with your PostgreSQL password.

### Step 4: Run Setup

```bash
npm run db:configure
```

Or manually:

```bash
npm run db:setup:full
```

## Alternative: Use Docker PostgreSQL

If you have Docker installed:

```bash
# Run PostgreSQL in Docker
docker run --name saudi-store-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=doganhubstore \
  -p 5432:5432 \
  -d postgres:14

# Update .env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/doganhubstore

# Run setup
npm run db:configure
```

## Alternative: Use Remote Database

If you want to use a remote database (Neon, Supabase, etc.):

1. Create a new database on your provider
2. Get the connection string
3. Update `.env`:

   ```env
   DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require
   ```

4. Run setup:

   ```bash
   npm run db:configure
   ```

## Verify Setup

After running setup, verify:

```bash
# Test connection
npm run db:test

# View database
npm run db:studio
```

## Troubleshooting

### "password authentication failed"

- Check your PostgreSQL password
- Update `.env` with correct credentials

### "Can't reach database server"

- Ensure PostgreSQL is running
- Check firewall settings
- Verify host and port in `.env`

### "relation already exists"

- This is normal if re-running migrations
- Tables will be skipped if they exist
