@echo off
REM =================================================================
REM DEPLOYMENT SCRIPT FOR DOGAN-AI.COM
REM =================================================================
REM Automated deployment to Vercel with pre-deployment checks
REM =================================================================

echo ========================================
echo DoganHub Store Deployment Script
echo Target: dogan-ai.com
echo ========================================
echo.

REM Step 1: Check for .env file
echo [1/6] Checking environment configuration...
if not exist ".env" (
    echo ERROR: .env file not found!
    echo Please create .env file with database credentials.
    exit /b 1
)
echo ✓ Environment file found
echo.

REM Step 2: Check Prisma schema
echo [2/6] Validating Prisma schema...
if not exist "prisma\schema.prisma" (
    echo ERROR: Prisma schema not found!
    exit /b 1
)
echo ✓ Prisma schema validated
echo.

REM Step 3: Generate Prisma Client
echo [3/6] Generating Prisma Client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ERROR: Prisma Client generation failed!
    exit /b 1
)
echo ✓ Prisma Client generated
echo.

REM Step 4: Verify database connection
echo [4/6] Verifying database connection...
call npx prisma db push --skip-generate
if %errorlevel% neq 0 (
    echo ERROR: Database connection failed!
    echo Please check your DATABASE_URL in .env
    exit /b 1
)
echo ✓ Database connection verified
echo.

REM Step 5: Build application
echo [5/6] Building production application...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Build failed!
    echo Please fix build errors before deploying.
    exit /b 1
)
echo ✓ Build completed successfully
echo.

REM Step 6: Deploy to Vercel
echo [6/6] Deploying to Vercel...
echo.
echo Ready to deploy to production!
echo.
echo Domains configured:
echo   - dogan-ai.com
echo   - www.dogan-ai.com
echo   - saudistore.sa (additional)
echo.
echo IMPORTANT: Make sure you have set the following in Vercel:
echo   1. Environment variables (DATABASE_URL, etc.)
echo   2. Domain DNS records pointing to Vercel
echo.
set /p CONFIRM="Continue with deployment? (Y/N): "
if /i "%CONFIRM%" neq "Y" (
    echo Deployment cancelled.
    exit /b 0
)

echo.
echo Deploying to production...
call vercel --prod
if %errorlevel% neq 0 (
    echo ERROR: Deployment failed!
    echo Please check Vercel CLI is installed: npm i -g vercel
    exit /b 1
)

echo.
echo ========================================
echo ✓ DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Your application is now live at:
echo   → https://dogan-ai.com
echo   → https://www.dogan-ai.com
echo.
echo Next steps:
echo   1. Verify DNS propagation (may take 24-48 hours)
echo   2. Test API endpoints: https://dogan-ai.com/api/health
echo   3. Check Vercel dashboard for logs and analytics
echo   4. Open Prisma Studio to manage data: npx prisma studio
echo.
echo ========================================

exit /b 0
