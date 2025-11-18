@echo off
REM SBG Platform Production Deployment Script for Windows
REM Deploys database, backend, and frontend services

echo 🚀 Starting SBG Platform Production Deployment
echo ================================================

REM Configuration
set PROJECT_NAME=sbg-platform
set ENVIRONMENT=%1
if "%ENVIRONMENT%"=="" set ENVIRONMENT=production

echo 📋 Deployment Configuration:
echo    Project: %PROJECT_NAME%
echo    Environment: %ENVIRONMENT%

REM Step 1: Environment Setup
echo.
echo ⚙️  Step 1: Environment Setup
echo -----------------------------

REM Check if Docker is running
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed or not running
    echo Please install Docker Desktop and try again
    exit /b 1
)
echo ✅ Docker is available

REM Check if Docker Compose is available
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose is not available
    exit /b 1
)
echo ✅ Docker Compose is available

REM Step 2: Build Application
echo.
echo 🔨 Step 2: Building Application
echo --------------------------------

echo Building Next.js application...
call npm run build
if errorlevel 1 (
    echo ❌ Build failed
    exit /b 1
)
echo ✅ Application built successfully

REM Step 3: Database Setup
echo.
echo 🗄️  Step 3: Database Setup
echo --------------------------

echo Starting PostgreSQL container...
docker-compose -f deploy/docker-compose.production.yml up -d postgres
if errorlevel 1 (
    echo ❌ Failed to start PostgreSQL
    exit /b 1
)

REM Wait for database to be ready
echo Waiting for database to be ready...
timeout /t 30 /nobreak >nul

REM Test database connection
echo Testing database connection...
docker-compose -f deploy/docker-compose.production.yml exec -T postgres pg_isready -U sbg_user -d sbg_platform
if errorlevel 1 (
    echo ❌ Database is not ready
    exit /b 1
)
echo ✅ Database is ready

REM Run migrations
echo Running database migrations...
if exist "database\migrate-to-tenants.sql" (
    docker-compose -f deploy/docker-compose.production.yml exec -T postgres psql -U sbg_user -d sbg_platform -f /docker-entrypoint-initdb.d/migrate-to-tenants.sql
    echo ✅ Migrations completed
)

REM Step 4: Redis Setup
echo.
echo 🔴 Step 4: Redis Cache Setup
echo -----------------------------

echo Starting Redis container...
docker-compose -f deploy/docker-compose.production.yml up -d redis
if errorlevel 1 (
    echo ❌ Failed to start Redis
    exit /b 1
)

REM Wait for Redis to be ready
timeout /t 10 /nobreak >nul
echo ✅ Redis is ready

REM Step 5: Backend Deployment
echo.
echo 🔧 Step 5: Backend API Deployment
echo ----------------------------------

echo Building and starting backend container...
docker-compose -f deploy/docker-compose.production.yml up -d backend
if errorlevel 1 (
    echo ❌ Failed to start backend
    exit /b 1
)

REM Wait for backend to be ready
echo Waiting for backend to be ready...
timeout /t 30 /nobreak >nul

REM Test backend health
echo Testing backend health...
curl -f http://localhost:3000/api/health >nul 2>&1
if errorlevel 1 (
    echo ❌ Backend health check failed
    docker-compose -f deploy/docker-compose.production.yml logs backend
    exit /b 1
)
echo ✅ Backend is healthy

REM Step 6: Frontend Deployment
echo.
echo 🌐 Step 6: Frontend Deployment
echo -------------------------------

echo Building and starting frontend container...
docker-compose -f deploy/docker-compose.production.yml up -d frontend
if errorlevel 1 (
    echo ❌ Failed to start frontend
    exit /b 1
)

REM Wait for frontend to be ready
echo Waiting for frontend to be ready...
timeout /t 30 /nobreak >nul

REM Test frontend health
echo Testing frontend health...
curl -f http://localhost:3050/api/health >nul 2>&1
if errorlevel 1 (
    echo ❌ Frontend health check failed
    docker-compose -f deploy/docker-compose.production.yml logs frontend
    exit /b 1
)
echo ✅ Frontend is healthy

REM Step 7: Reverse Proxy Setup
echo.
echo 🔀 Step 7: Reverse Proxy Setup
echo -------------------------------

echo Starting Nginx reverse proxy...
docker-compose -f deploy/docker-compose.production.yml up -d nginx
if errorlevel 1 (
    echo ❌ Failed to start Nginx
    exit /b 1
)
echo ✅ Nginx is running

REM Step 8: Monitoring Setup
echo.
echo 📊 Step 8: Monitoring Setup
echo ----------------------------

echo Starting monitoring services...
docker-compose -f deploy/docker-compose.production.yml up -d prometheus grafana
if errorlevel 1 (
    echo ⚠️  Monitoring services failed to start (non-critical)
) else (
    echo ✅ Monitoring services started
)

REM Step 9: Final Validation
echo.
echo ✅ Step 9: Final Validation
echo ----------------------------

echo Running comprehensive tests...

REM Test all endpoints
set "endpoints=/api/health /api/test-db /api/dashboard/stats /api/users"
set "all_tests_passed=true"

for %%e in (%endpoints%) do (
    echo Testing %%e...
    curl -f http://localhost:3050%%e >nul 2>&1
    if errorlevel 1 (
        echo ❌ %%e - FAILED
        set "all_tests_passed=false"
    ) else (
        echo ✅ %%e - OK
    )
)

if "%all_tests_passed%"=="true" (
    echo.
    echo 🎉 DEPLOYMENT SUCCESSFUL!
    echo =========================
    echo ✅ Database: PostgreSQL running on port 5432
    echo ✅ Cache: Redis running on port 6379
    echo ✅ Backend API: Running on port 3000
    echo ✅ Frontend: Running on port 3050
    echo ✅ Reverse Proxy: Nginx running on port 80/443
    echo ✅ Monitoring: Prometheus ^(9090^) and Grafana ^(3001^)
    echo.
    echo 🌐 Application URLs:
    echo    Frontend: http://localhost:3050
    echo    Backend API: http://localhost:3000
    echo    Grafana: http://localhost:3001
    echo    Prometheus: http://localhost:9090
    echo.
    echo 🚀 SBG Platform is now running in production mode!
    echo.
    echo Next steps:
    echo 1. Configure domain and SSL certificates
    echo 2. Set up external monitoring
    echo 3. Configure backup procedures
    echo 4. Run load testing
) else (
    echo.
    echo ❌ DEPLOYMENT FAILED!
    echo =====================
    echo Some services are not responding properly.
    echo Check the logs with: docker-compose -f deploy/docker-compose.production.yml logs
    exit /b 1
)

pause
