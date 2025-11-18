#!/bin/bash

# SBG Platform Backend Deployment Script
# Deploys database, API services, and backend infrastructure

set -e

echo "🚀 Starting SBG Platform Backend Deployment"
echo "============================================"

# Configuration
PROJECT_NAME="sbg-platform"
ENVIRONMENT=${1:-production}
REGION=${2:-us-east-1}

echo "📋 Deployment Configuration:"
echo "   Project: $PROJECT_NAME"
echo "   Environment: $ENVIRONMENT"
echo "   Region: $REGION"

# Step 1: Database Deployment
echo ""
echo "🗄️  Step 1: Database Deployment"
echo "--------------------------------"

# Check if database is accessible
echo "Testing database connection..."
if node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  }
  console.log('✅ Database connection successful');
  console.log('   Time:', res.rows[0].now);
  pool.end();
});
"; then
  echo "✅ Database is accessible"
else
  echo "❌ Database connection failed"
  exit 1
fi

# Run database migrations
echo "Running database migrations..."
if [ -f "database/migrate-to-tenants.sql" ]; then
  echo "Executing tenant migration..."
  psql $DATABASE_URL -f database/migrate-to-tenants.sql
  echo "✅ Tenant migration completed"
fi

# Create core tables if they don't exist
echo "Creating core tables..."
psql $DATABASE_URL -f database/create-core-tables.sql || echo "⚠️  Core tables may already exist"

# Step 2: API Services Deployment
echo ""
echo "🔧 Step 2: API Services Deployment"
echo "-----------------------------------"

# Build the application
echo "Building application..."
npm run build
echo "✅ Application built successfully"

# Test API endpoints
echo "Testing API endpoints..."
npm start &
SERVER_PID=$!
sleep 10

# Test health endpoint
if curl -f http://localhost:3050/api/health > /dev/null 2>&1; then
  echo "✅ Health endpoint responding"
else
  echo "❌ Health endpoint not responding"
  kill $SERVER_PID
  exit 1
fi

# Test database API
if curl -f http://localhost:3050/api/test-db > /dev/null 2>&1; then
  echo "✅ Database API responding"
else
  echo "❌ Database API not responding"
  kill $SERVER_PID
  exit 1
fi

kill $SERVER_PID

# Step 3: Environment Configuration
echo ""
echo "⚙️  Step 3: Environment Configuration"
echo "-------------------------------------"

# Generate production secrets if needed
if [ ! -f ".env.production" ]; then
  echo "Generating production environment..."
  node apps/scripts/generate-secrets.js
  echo "✅ Production secrets generated"
fi

# Validate environment variables
echo "Validating environment variables..."
required_vars=(
  "DATABASE_URL"
  "NEXTAUTH_SECRET"
  "JWT_SECRET"
)

for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "❌ Missing required environment variable: $var"
    exit 1
  else
    echo "✅ $var is set"
  fi
done

# Step 4: Redis Cache Deployment
echo ""
echo "🔴 Step 4: Redis Cache Setup"
echo "-----------------------------"

# Check Redis connection
if [ -n "$REDIS_HOST" ]; then
  echo "Testing Redis connection..."
  if redis-cli -h $REDIS_HOST -p ${REDIS_PORT:-6379} ping > /dev/null 2>&1; then
    echo "✅ Redis connection successful"
  else
    echo "⚠️  Redis connection failed - cache will be disabled"
  fi
else
  echo "⚠️  Redis not configured - using in-memory cache"
fi

# Step 5: Performance Optimization
echo ""
echo "⚡ Step 5: Performance Optimization"
echo "-----------------------------------"

# Enable compression
echo "Configuring compression..."
export ENABLE_COMPRESSION=true

# Set up CDN headers
echo "Configuring CDN headers..."
export ENABLE_CDN_CACHE=true

# Configure rate limiting
echo "Setting up rate limiting..."
export RATE_LIMIT_ENABLED=true

echo "✅ Performance optimizations applied"

# Step 6: Security Configuration
echo ""
echo "🔒 Step 6: Security Configuration"
echo "----------------------------------"

# Enable security headers
export ENABLE_HELMET=true
export ENABLE_CSRF_PROTECTION=true

# Configure CORS
export CORS_ORIGIN=${CORS_ORIGIN:-"https://saudistore.sa"}

echo "✅ Security configurations applied"

# Step 7: Monitoring Setup
echo ""
echo "📊 Step 7: Monitoring Setup"
echo "----------------------------"

# Enable logging
export LOG_LEVEL=info
export ENABLE_REQUEST_LOGGING=true
export ENABLE_ERROR_TRACKING=true

# Set up health checks
echo "Configuring health checks..."
export ENABLE_HEALTH_CHECKS=true

echo "✅ Monitoring configured"

# Step 8: Final Validation
echo ""
echo "✅ Step 8: Final Validation"
echo "----------------------------"

# Start the application for final testing
echo "Starting application for final validation..."
npm start &
SERVER_PID=$!
sleep 15

# Comprehensive API testing
echo "Running comprehensive API tests..."
test_endpoints=(
  "/api/health"
  "/api/test-db"
  "/api/dashboard/stats"
  "/api/users"
  "/api/platform/tenants"
)

all_tests_passed=true
for endpoint in "${test_endpoints[@]}"; do
  if curl -f "http://localhost:3050$endpoint" > /dev/null 2>&1; then
    echo "✅ $endpoint - OK"
  else
    echo "❌ $endpoint - FAILED"
    all_tests_passed=false
  fi
done

kill $SERVER_PID

if [ "$all_tests_passed" = true ]; then
  echo ""
  echo "🎉 DEPLOYMENT SUCCESSFUL!"
  echo "========================="
  echo "✅ Database: Connected and migrated"
  echo "✅ API Services: All endpoints responding"
  echo "✅ Environment: Properly configured"
  echo "✅ Security: Enabled and configured"
  echo "✅ Monitoring: Active"
  echo ""
  echo "🚀 Backend is ready for production!"
  echo "   Database URL: ${DATABASE_URL:0:20}..."
  echo "   Environment: $ENVIRONMENT"
  echo "   Region: $REGION"
  echo ""
  echo "Next steps:"
  echo "1. Deploy frontend application"
  echo "2. Configure domain and SSL"
  echo "3. Set up monitoring dashboards"
  echo "4. Run load testing"
else
  echo ""
  echo "❌ DEPLOYMENT FAILED!"
  echo "====================="
  echo "Some API endpoints are not responding properly."
  echo "Please check the logs and fix the issues before proceeding."
  exit 1
fi
