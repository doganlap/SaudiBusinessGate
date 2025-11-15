@echo off
REM =====================================================
REM DoganHub Store - Complete Production Deployment
REM =====================================================

echo ========================================
echo DoganHub Store - Production Deployment
echo ========================================
echo.

REM Step 1: Clean previous builds
echo Step 1: Cleaning previous builds...
docker-compose down --volumes --remove-orphans 2>nul
docker system prune -f 2>nul
if exist .next rmdir /s /q .next 2>nul
if exist dist rmdir /s /q dist 2>nul
echo ✓ Cleanup completed

REM Step 2: Install all dependencies
echo.
echo Step 2: Installing dependencies...
npm ci --include=dev
if %errorlevel% neq 0 (
    echo ✗ Dependency installation failed
    pause
    exit /b 1
)
echo ✓ Dependencies installed

REM Step 3: Build production application
echo.
echo Step 3: Building production application...
set NODE_ENV=production
set NEXT_TELEMETRY_DISABLED=1
set GENERATE_SOURCEMAP=false
npm run build
if %errorlevel% neq 0 (
    echo ✗ Production build failed
    pause
    exit /b 1
)
echo ✓ Production build completed

REM Step 4: Build and start Docker containers
echo.
echo Step 4: Building Docker containers...
docker-compose up --build -d
if %errorlevel% neq 0 (
    echo ✗ Docker deployment failed
    pause
    exit /b 1
)
echo ✓ Docker containers started

REM Step 5: Wait for services to be ready
echo.
echo Step 5: Waiting for services to start...
timeout /t 30 /nobreak > nul

REM Step 6: Verify deployment
echo.
echo Step 6: Verifying deployment...
curl -s http://localhost:3003 > nul
if %errorlevel% equ 0 (
    echo ✓ Application is running at http://localhost:3003
) else (
    echo ⚠ Application might still be starting...
)

REM Step 7: Show container status
echo.
echo Step 7: Container Status:
docker-compose ps

echo.
echo ========================================
echo Production Deployment Summary:
echo ========================================
echo Main Application: http://localhost:3003
echo English Interface: http://localhost:3003/en
echo Arabic Interface: http://localhost:3003/ar
echo Billing Management: http://localhost:3003/en/billing
echo Database: PostgreSQL on port 5432
echo Cache: Redis on port 6390
echo ========================================
echo.
echo Press any key to continue...
pause > nul