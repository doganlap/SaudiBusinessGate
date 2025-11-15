@echo off
REM Saudi Store - Database Schema Setup
REM Run all database migrations in order

echo ========================================
echo Saudi Store - Database Setup
echo ========================================
echo.

cd /d "%~dp0"

REM Check if DATABASE_URL is set
if "%DATABASE_URL%"=="" (
    echo ERROR: DATABASE_URL environment variable is not set!
    echo.
    echo Please set DATABASE_URL in your .env file:
    echo DATABASE_URL=postgresql://user:password@localhost:5432/saudistore
    echo.
    pause
    exit /b 1
)

echo Database URL: %DATABASE_URL%
echo.
echo Running database migrations...
echo.

REM Run schema files in order
echo [1/2] Creating tenants and users tables...
psql "%DATABASE_URL%" -f "database\schema\01_tenants_and_users.sql"
if %errorlevel% neq 0 (
    echo ERROR: Failed to create tenants and users tables
    pause
    exit /b 1
)
echo SUCCESS: Tenants and users tables created
echo.

echo [2/2] Creating demo, POC, and partner tables...
psql "%DATABASE_URL%" -f "database\schema\02_demo_poc_requests.sql"
if %errorlevel% neq 0 (
    echo ERROR: Failed to create demo/POC tables
    pause
    exit /b 1
)
echo SUCCESS: Demo/POC tables created
echo.

echo ========================================
echo Database Setup Complete!
echo ========================================
echo.
echo Tables created:
echo - tenants
echo - users
echo - demo_requests
echo - poc_requests
echo - partner_invitations
echo.
echo Next steps:
echo 1. Verify tables: psql "%DATABASE_URL%" -c "\dt"
echo 2. Create initial admin user
echo 3. Test API endpoints
echo.

pause
