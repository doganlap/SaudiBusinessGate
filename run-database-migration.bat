@echo off
echo ========================================
echo Saudi Business Gate - Database Migration
echo Missing Tables Creation Script
echo ========================================
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js found. Checking npm packages...
if not exist node_modules (
    echo Installing npm packages...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install npm packages
        pause
        exit /b 1
    )
)

echo.
echo Checking environment variables...
if not exist .env (
    if not exist .env.local (
        echo WARNING: No .env or .env.local file found
        echo Please ensure DATABASE_URL is set in your environment
        echo.
    )
)

echo.
echo ========================================
echo RUNNING DATABASE MIGRATION
echo ========================================
echo.
echo This will create the following tables:
echo   - ai_agents (AI agent management)
echo   - themes (Theme customization)
echo   - tenant_webhook_configs (Webhook configurations)
echo   - notifications (Notification system)
echo   - workflow_templates (Workflow management)
echo   - workflow_executions (Workflow execution tracking)
echo.

set /p confirm="Do you want to proceed? (y/N): "
if /i not "%confirm%"=="y" (
    echo Migration cancelled.
    pause
    exit /b 0
)

echo.
echo Running migration script...
node scripts/run-database-migration.js

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo MIGRATION COMPLETED SUCCESSFULLY!
    echo ========================================
    echo.
    echo Your database now has all required tables for production.
    echo The application can now use real database operations instead of mock data.
    echo.
) else (
    echo.
    echo ========================================
    echo MIGRATION FAILED!
    echo ========================================
    echo.
    echo Please check the error messages above and:
    echo 1. Verify your DATABASE_URL is correct
    echo 2. Ensure the database is accessible
    echo 3. Check database permissions
    echo.
)

pause
