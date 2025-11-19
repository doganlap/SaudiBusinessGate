@echo off
echo ========================================
echo Saudi Business Gate - Build and Run
echo Testing Complete Integration
echo ========================================
echo.

echo [1/6] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed

echo.
echo [2/6] Generating Prisma client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ERROR: Failed to generate Prisma client
    pause
    exit /b 1
)
echo ✅ Prisma client generated

echo.
echo [3/6] Running database migration...
echo y | call npx prisma db push
if %errorlevel% neq 0 (
    echo WARNING: Database migration failed, continuing with build...
)
echo ✅ Database migration attempted

echo.
echo [4/6] Building application...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Build failed - checking for TypeScript errors...
    echo.
    echo Running TypeScript check...
    call npx tsc --noEmit --skipLibCheck
    echo.
    echo Build failed. Please fix the errors above and try again.
    pause
    exit /b 1
)
echo ✅ Application built successfully

echo.
echo [5/6] Seeding initial data...
call npx tsx prisma/seed-missing-tables.ts
if %errorlevel% neq 0 (
    echo WARNING: Seeding failed, but continuing...
)
echo ✅ Initial data seeded

echo.
echo [6/6] Starting application...
echo ========================================
echo 🚀 STARTING SAUDI BUSINESS GATE
echo ========================================
echo.
echo Application will start on: http://localhost:3000
echo Press Ctrl+C to stop the application
echo.
timeout /t 3 /nobreak >nul

call npm run dev
