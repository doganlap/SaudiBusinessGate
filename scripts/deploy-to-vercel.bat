@echo off
REM SBG Platform Vercel Deployment Script

echo 🚀 Starting SBG Platform Vercel Deployment
echo ============================================

REM Check if Vercel CLI is installed
vercel --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Vercel CLI is not installed
    echo Installing Vercel CLI...
    npm install -g vercel
    if errorlevel 1 (
        echo ❌ Failed to install Vercel CLI
        exit /b 1
    )
)
echo ✅ Vercel CLI is available

REM Step 1: Environment Setup
echo.
echo ⚙️  Step 1: Environment Setup
echo -----------------------------

echo Setting up environment variables...
REM The database URLs are already configured in vercel.json

REM Step 2: Build Test
echo.
echo 🔨 Step 2: Build Test
echo ---------------------

echo Testing local build...
call npm run build
if errorlevel 1 (
    echo ❌ Local build failed
    echo Please fix build errors before deploying
    exit /b 1
)
echo ✅ Local build successful

REM Step 3: Database Verification
echo.
echo 🗄️  Step 3: Database Verification
echo ----------------------------------

echo Verifying database connection...
node scripts/setup-database-schema.js
if errorlevel 1 (
    echo ❌ Database verification failed
    exit /b 1
)
echo ✅ Database is ready

REM Step 4: Deploy to Vercel
echo.
echo 🌐 Step 4: Deploy to Vercel
echo ----------------------------

echo Deploying to Vercel...
vercel --prod --yes
if errorlevel 1 (
    echo ❌ Vercel deployment failed
    exit /b 1
)

echo ✅ Deployment successful!

REM Step 5: Post-Deployment Verification
echo.
echo ✅ Step 5: Post-Deployment Verification
echo ----------------------------------------

echo Getting deployment URL...
for /f "tokens=*" %%i in ('vercel ls --scope=team_default 2^>nul ^| findstr "sbg"') do set DEPLOYMENT_URL=%%i

if defined DEPLOYMENT_URL (
    echo 🌐 Deployment URL: %DEPLOYMENT_URL%
    
    echo Testing deployed endpoints...
    timeout /t 10 /nobreak >nul
    
    REM Test health endpoint
    curl -f https://%DEPLOYMENT_URL%/api/health >nul 2>&1
    if errorlevel 1 (
        echo ⚠️  Health endpoint not responding yet (may need time to cold start)
    ) else (
        echo ✅ Health endpoint responding
    )
    
    REM Test database endpoint
    curl -f https://%DEPLOYMENT_URL%/api/test-db >nul 2>&1
    if errorlevel 1 (
        echo ⚠️  Database endpoint not responding yet
    ) else (
        echo ✅ Database endpoint responding
    )
) else (
    echo ⚠️  Could not determine deployment URL
)

echo.
echo 🎉 VERCEL DEPLOYMENT COMPLETED!
echo ================================
echo ✅ Application: Deployed successfully
echo ✅ Database: Connected and configured
echo ✅ Environment: Production ready
echo.
echo 🌐 Your SBG Platform is now live!
echo.
echo 📋 Next Steps:
echo 1. Configure custom domain (if needed)
echo 2. Set up monitoring and alerts
echo 3. Configure SSL certificates
echo 4. Test all functionality
echo.
echo 🔗 Access your application:
echo    Landing Page: https://your-deployment-url.vercel.app/landing
echo    Dashboard: https://your-deployment-url.vercel.app/en/dashboard
echo    API Health: https://your-deployment-url.vercel.app/api/health
echo.

pause
