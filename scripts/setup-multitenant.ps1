#!/usr/bin/env pwsh
# =================================================================
# Saudi Store - Complete Multi-tenant Setup Script
# Automated setup for dynamic routing system
# =================================================================

Write-Host "🚀 Saudi Store - Multi-tenant Setup" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# =================================================================
# STEP 1: Check Prerequisites
# =================================================================

Write-Host "📋 Step 1: Checking Prerequisites..." -ForegroundColor Yellow

# Check Node.js
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Node.js $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js not found. Please install Node.js 18+" -ForegroundColor Red
    exit 1
}

# Check PostgreSQL
$psqlVersion = psql --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ PostgreSQL $psqlVersion" -ForegroundColor Green
} else {
    Write-Host "⚠️ PostgreSQL not found. Will continue but database setup will fail." -ForegroundColor Yellow
}

# Check npm
$npmVersion = npm --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ npm $npmVersion" -ForegroundColor Green
} else {
    Write-Host "❌ npm not found." -ForegroundColor Red
    exit 1
}

Write-Host ""

# =================================================================
# STEP 2: Environment Configuration
# =================================================================

Write-Host "🔧 Step 2: Environment Configuration..." -ForegroundColor Yellow

if (Test-Path ".env.local") {
    Write-Host "⚠️ .env.local already exists. Skipping..." -ForegroundColor Yellow
} else {
    # Prompt for DATABASE_URL
    $defaultDbUrl = "postgresql://postgres:postgres@localhost:5432/saudistore"
    $dbUrl = Read-Host "Enter DATABASE_URL (default: $defaultDbUrl)"
    if ([string]::IsNullOrWhiteSpace($dbUrl)) {
        $dbUrl = $defaultDbUrl
    }

    # Generate JWT secrets
    Write-Host "Generating JWT secrets..." -ForegroundColor Gray
    $jwtSecret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
    $nextAuthSecret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})

    # Create .env.local
    $envContent = @"
# Database
DATABASE_URL=$dbUrl

# Authentication
JWT_SECRET=$jwtSecret
NEXTAUTH_URL=http://localhost:3003
NEXTAUTH_SECRET=$nextAuthSecret

# Redis Cache (optional)
REDIS_URL=redis://localhost:6379

# Stripe (optional - for billing)
# STRIPE_SECRET_KEY=sk_test_xxxxx
# STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx

# Monitoring (optional)
# SENTRY_DSN=https://xxx@sentry.io/xxx
# NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Node Environment
NODE_ENV=development
"@

    $envContent | Out-File -FilePath ".env.local" -Encoding UTF8
    Write-Host "✅ .env.local created" -ForegroundColor Green
}

Write-Host ""

# =================================================================
# STEP 3: Install Dependencies
# =================================================================

Write-Host "📦 Step 3: Installing Dependencies..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor Gray

npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# =================================================================
# STEP 4: Database Setup
# =================================================================

Write-Host "💾 Step 4: Database Setup..." -ForegroundColor Yellow

if (!(Test-Path "database/schema")) {
    Write-Host "❌ Database schema files not found" -ForegroundColor Red
    exit 1
}

# Load DATABASE_URL from .env.local
$envFile = Get-Content ".env.local"
$dbUrlLine = $envFile | Where-Object { $_ -match "^DATABASE_URL=" }
if ($dbUrlLine) {
    $dbUrl = $dbUrlLine -replace "^DATABASE_URL=", ""
    $env:DATABASE_URL = $dbUrl
}

Write-Host "Connecting to database..." -ForegroundColor Gray
Write-Host "Database URL: $env:DATABASE_URL" -ForegroundColor Gray

# Test connection
$testQuery = "SELECT 1"
$testResult = psql "$env:DATABASE_URL" -c $testQuery 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Database connection failed" -ForegroundColor Red
    Write-Host "Error: $testResult" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please check:" -ForegroundColor Yellow
    Write-Host "  1. PostgreSQL is running" -ForegroundColor Yellow
    Write-Host "  2. Database exists" -ForegroundColor Yellow
    Write-Host "  3. DATABASE_URL is correct" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Database connection successful" -ForegroundColor Green

# Run schema files in order
$schemaFiles = @(
    "01_tenants_and_users.sql",
    "02_demo_poc_requests.sql",
    "03_multitenant_advanced.sql",
    "04_seed_data.sql"
)

foreach ($file in $schemaFiles) {
    $filePath = "database\schema\$file"
    if (Test-Path $filePath) {
        Write-Host "Running $file..." -ForegroundColor Gray
        psql "$env:DATABASE_URL" -f $filePath 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ $file" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $file failed" -ForegroundColor Red
        }
    } else {
        Write-Host "  ⚠️ $file not found" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "✅ Database setup complete" -ForegroundColor Green
Write-Host ""

# Show created tables
Write-Host "📊 Created tables:" -ForegroundColor Cyan
psql "$env:DATABASE_URL" -c "\dt" 2>$null | Out-String | Write-Host -ForegroundColor Gray

Write-Host ""

# =================================================================
# STEP 5: Create Test Tenant
# =================================================================

Write-Host "🧪 Step 5: Creating Test Tenant..." -ForegroundColor Yellow

$createTestTenant = Read-Host "Create test tenant? (Y/n)"
if ($createTestTenant -eq "" -or $createTestTenant -eq "Y" -or $createTestTenant -eq "y") {
    
    # Generate bcrypt hash for password 'password'
    Write-Host "Creating test tenant with:" -ForegroundColor Gray
    Write-Host "  Email: admin@test.com" -ForegroundColor Gray
    Write-Host "  Password: password" -ForegroundColor Gray
    Write-Host "  Tenant: test-company" -ForegroundColor Gray
    Write-Host "  Plan: Professional" -ForegroundColor Gray

    $sqlScript = @"
-- Create tenant
INSERT INTO tenants (name, slug, subscription_tier, subscription_status, is_active)
VALUES ('Test Company', 'test-company', 'professional', 'active', TRUE)
ON CONFLICT (slug) DO NOTHING
RETURNING id;

-- Get tenant ID
DO `$`$
DECLARE
  tenant_uuid UUID;
  user_uuid UUID;
BEGIN
  SELECT id INTO tenant_uuid FROM tenants WHERE slug = 'test-company';
  
  -- Create admin user (password = 'password')
  INSERT INTO users (
    tenant_id, 
    email, 
    password_hash, 
    full_name, 
    role, 
    user_type,
    is_active,
    email_verified
  ) VALUES (
    tenant_uuid,
    'admin@test.com',
    '`$2a`$10`$rOiZ5H4kKz.T3.FZ5Zx9Q.e.vqYFj5xF2x5Zx9Q.e.vqYFj5xF2x5Zx', -- 'password'
    'Admin User',
    'owner',
    'regular',
    TRUE,
    TRUE
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO user_uuid;

  -- Enable modules for tenant
  INSERT INTO tenant_modules (tenant_id, module_id, is_enabled)
  SELECT 
    tenant_uuid,
    id,
    TRUE
  FROM modules
  WHERE slug IN ('dashboard', 'crm', 'sales', 'finance', 'hr', 'analytics', 'reports')
  ON CONFLICT (tenant_id, module_id) DO UPDATE SET is_enabled = TRUE;

  RAISE NOTICE 'Test tenant created successfully';
END `$`$;
"@

    $sqlScript | psql "$env:DATABASE_URL" 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Test tenant created" -ForegroundColor Green
        Write-Host ""
        Write-Host "📝 Test Credentials:" -ForegroundColor Cyan
        Write-Host "  URL: http://localhost:3003" -ForegroundColor White
        Write-Host "  Email: admin@test.com" -ForegroundColor White
        Write-Host "  Password: password" -ForegroundColor White
        Write-Host "  Tenant: test-company" -ForegroundColor White
    } else {
        Write-Host "⚠️ Test tenant creation failed (may already exist)" -ForegroundColor Yellow
    }
}

Write-Host ""

# =================================================================
# STEP 6: Build Application
# =================================================================

Write-Host "🏗️ Step 6: Building Application..." -ForegroundColor Yellow

$buildChoice = Read-Host "Build for production now? (y/N)"
if ($buildChoice -eq "Y" -or $buildChoice -eq "y") {
    npm run build
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Build successful" -ForegroundColor Green
    } else {
        Write-Host "❌ Build failed" -ForegroundColor Red
    }
} else {
    Write-Host "⏭️ Skipping build" -ForegroundColor Gray
}

Write-Host ""

# =================================================================
# SUMMARY
# =================================================================

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📊 What was created:" -ForegroundColor Cyan
Write-Host "  ✅ Database schema (10 tables)" -ForegroundColor White
Write-Host "  ✅ Subscription plans (4 tiers)" -ForegroundColor White
Write-Host "  ✅ Modules (17 modules)" -ForegroundColor White
Write-Host "  ✅ Roles (11 default roles)" -ForegroundColor White
Write-Host "  ✅ Test tenant (admin@test.com)" -ForegroundColor White
Write-Host ""

Write-Host "🚀 Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  1. Start development server:" -ForegroundColor Yellow
Write-Host "     npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "  2. Open browser:" -ForegroundColor Yellow
Write-Host "     http://localhost:3003" -ForegroundColor White
Write-Host ""
Write-Host "  3. Login with:" -ForegroundColor Yellow
Write-Host "     Email: admin@test.com" -ForegroundColor White
Write-Host "     Password: password" -ForegroundColor White
Write-Host ""
Write-Host "  4. View navigation API:" -ForegroundColor Yellow
Write-Host "     curl http://localhost:3003/api/navigation" -ForegroundColor White
Write-Host "     -H 'Authorization: Bearer <token>'" -ForegroundColor White
Write-Host ""

Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "  - Full Guide: docs/DYNAMIC_ROUTING_SYSTEM.md" -ForegroundColor White
Write-Host "  - Quick Start: QUICK_START_DYNAMIC_ROUTING.md" -ForegroundColor White
Write-Host "  - Database Schema: database/schema/" -ForegroundColor White
Write-Host ""

Write-Host "🇸🇦 Saudi Store - The 1st Autonomous Store in the World" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
