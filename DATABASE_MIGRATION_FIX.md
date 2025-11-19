# 🔧 Database Schema Migration Fix

## ⚠️ **Issue Detected**

Your Prisma schema has been updated with required columns, but the database already contains test data that doesn't have these columns:

### **Missing Columns:**
- `tenants.updatedAt` - Required DateTime field
- `users.fullName` - Required String field  
- `users.passwordHash` - Required String field
- `users.tenantId` - Required String field
- `users.updatedAt` - Required DateTime field

**Existing Data**: 1 row in `tenants` table, 1 row in `users` table

---

## ✅ **SOLUTION: Development Database Reset**

Since you're using a development/test database (`db.prisma.io`) and preparing for production deployment, the cleanest solution is to reset the development database and start fresh.

### **Option 1: Force Reset (Recommended for Dev)**

**⚠️ WARNING: This will delete ALL existing data in your development database!**

```bash
cd d:\Projects\SBG

# Reset database and apply new schema
npx prisma db push --force-reset

# Or use migrate reset (resets and runs seeders)
npx prisma migrate reset --force
```

**What this does:**
1. Drops ALL tables in the database
2. Recreates tables with your current schema
3. Applies all changes
4. Runs seed scripts (if configured)

**After reset, seed with fresh data:**
```bash
# Generate Prisma Client
npx prisma generate

# Run seeders (if you have them)
npx prisma db seed

# Or run your custom seed scripts
npm run seed:all
```

---

## 🔄 **Option 2: Manual Migration (For Production Later)**

When deploying to production with real data, use proper migrations:

### **Step 1: Make Columns Optional First**

Update `prisma/schema.prisma` temporarily to make new columns optional:

```prisma
model Tenant {
  // ... other fields
  updatedAt DateTime? @updatedAt  // Add ? to make optional
}

model User {
  // ... other fields
  tenantId      String?           // Make optional temporarily
  passwordHash  String?           // Make optional temporarily
  fullName      String?           // Make optional temporarily
  updatedAt     DateTime? @updatedAt  // Make optional temporarily
}
```

### **Step 2: Create Migration**

```bash
# Create migration with optional fields
npx prisma migrate dev --name add_missing_columns_optional

# This adds the columns as nullable
```

### **Step 3: Populate Data with SQL**

```sql
-- Update existing data with default values
UPDATE tenants 
SET "updatedAt" = "createdAt" 
WHERE "updatedAt" IS NULL;

UPDATE users
SET 
  "fullName" = 'Legacy User',
  "passwordHash" = '$2b$10$default.hash.placeholder',
  "tenantId" = (SELECT id FROM tenants LIMIT 1),
  "updatedAt" = "createdAt"
WHERE "fullName" IS NULL;
```

### **Step 4: Make Required Again**

Revert schema changes (remove `?` to make required):

```prisma
model Tenant {
  updatedAt DateTime @updatedAt  // Remove ?
}

model User {
  tenantId      String          // Remove ?
  passwordHash  String          // Remove ?
  fullName      String          // Remove ?
  updatedAt     DateTime @updatedAt  // Remove ?
}
```

### **Step 5: Final Migration**

```bash
npx prisma migrate dev --name make_columns_required
```

---

## 🎯 **RECOMMENDED ACTION FOR YOUR SITUATION**

Since you're preparing for **production deployment** and using a **test database**, use **Option 1 (Force Reset)**:

```bash
cd d:\Projects\SBG

# 1. Reset development database (deletes test data)
npx prisma db push --force-reset

# 2. Generate Prisma Client
npx prisma generate

# 3. Seed with Saudi Business Gate data (optional)
npx prisma db seed
```

**Why this is safe:**
- ✅ You're using a development database (`db.prisma.io`)
- ✅ Only has 1 test row (no production data)
- ✅ Cleanest way to sync schema
- ✅ Fresh start for production deployment
- ✅ You'll use a different database URL for production anyway

---

## 📋 **FOR PRODUCTION DEPLOYMENT**

When deploying to production with Vercel:

### **1. Use Separate Production Database**

```bash
# In Vercel Dashboard → Environment Variables
DATABASE_URL="postgresql://prod-user:pass@prod-host:5432/prod-db"
```

**DO NOT** use the same database URL as development!

### **2. Run Migrations on Production Database**

```bash
# After first deployment, run migrations
npx prisma migrate deploy

# This applies all migrations without resetting
```

### **3. Seed Production Database (if needed)**

```bash
# Only if you need initial data
npx prisma db seed
```

---

## 🛠️ **EXECUTE THE FIX NOW**

Run these commands to fix your development database:

```powershell
cd d:\Projects\SBG

Write-Host "⚠️  WARNING: This will delete ALL data in development database!" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to cancel, or Enter to continue..." -ForegroundColor Yellow
pause

# Reset database and apply new schema
npx prisma db push --force-reset

# Generate Prisma Client
npx prisma generate

Write-Host "✅ Database schema updated successfully!" -ForegroundColor Green
Write-Host "✅ Prisma Client generated" -ForegroundColor Green

# Optional: Seed database
Write-Host "`n📊 Seed database with initial data? (Y/N)" -ForegroundColor Cyan
$seed = Read-Host
if ($seed -eq "Y" -or $seed -eq "y") {
    npm run seed:all
    Write-Host "✅ Database seeded successfully!" -ForegroundColor Green
}

Write-Host "`n🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Verify database structure: npx prisma studio" -ForegroundColor White
Write-Host "2. Test API connections: npm run dev" -ForegroundColor White
Write-Host "3. Deploy to Vercel: vercel --prod" -ForegroundColor White
```

---

## ⚡ **QUICK FIX (Copy-Paste)**

```bash
cd d:\Projects\SBG && npx prisma db push --force-reset && npx prisma generate
```

This single command will:
1. Reset your development database
2. Apply current schema  
3. Generate Prisma Client
4. Make you ready to deploy

---

## 🔍 **VERIFY THE FIX**

After running the reset:

```bash
# Check database structure
npx prisma studio

# Test database connection
npx prisma db execute --stdin < database/test-connection.sql

# Or test via API
npm run dev
# Then visit: http://localhost:3000/api/test-db
```

---

## 📊 **DATABASE STRUCTURE AFTER FIX**

Your database will have these tables with correct schema:

### **Tenants Table:**
```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  slug VARCHAR(100) UNIQUE,
  -- ... other fields
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()  -- ✅ NOW INCLUDED
);
```

### **Users Table:**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),  -- ✅ NOW INCLUDED
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),  -- ✅ NOW INCLUDED
  full_name VARCHAR(255),      -- ✅ NOW INCLUDED
  -- ... other fields
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()  -- ✅ NOW INCLUDED
);
```

---

## 🚀 **AFTER FIX: READY FOR DEPLOYMENT**

Once database is fixed:

```bash
# 1. Commit the fix
git add .
git commit -m "fix: Reset development database schema

- Applied Prisma schema changes
- Fixed missing required columns
- Database ready for production deployment"

# 2. Deploy to Vercel
vercel --prod

# 3. Set production DATABASE_URL in Vercel
# 4. Run production migrations
npx prisma migrate deploy
```

---

## ⚠️ **IMPORTANT REMINDERS**

### **Development vs Production:**
- **Development DB** (`db.prisma.io`): ✅ Safe to reset
- **Production DB**: ⚠️ NEVER use --force-reset!

### **For Production:**
- Use separate database URL
- Use `prisma migrate deploy` (not push --force-reset)
- Test migrations on staging first
- Always backup before migrations

### **Environment Variables:**
```bash
# Development (.env)
DATABASE_URL="postgresql://dev-db..."

# Production (Vercel Dashboard)
DATABASE_URL="postgresql://prod-db..."
```

---

## ✅ **SOLUTION SUMMARY**

| Step | Command | Result |
|------|---------|--------|
| **1. Reset Dev DB** | `npx prisma db push --force-reset` | Clean schema |
| **2. Generate Client** | `npx prisma generate` | Updated types |
| **3. Seed (Optional)** | `npm run seed:all` | Initial data |
| **4. Verify** | `npx prisma studio` | Check structure |
| **5. Deploy** | `vercel --prod` | Production ready |

**Status**: ✅ **Ready to execute** 🚀

---

**Created**: November 19, 2025  
**Issue**: Schema migration with existing data  
**Solution**: Development database reset  
**Production**: Use separate DB with proper migrations
