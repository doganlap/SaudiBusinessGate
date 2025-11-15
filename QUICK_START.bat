@echo off
echo ================================================
echo DoganHub Store - Quick Start Guide
echo ================================================
echo.

cd /d "D:\Projects\DoganHubStore"

:menu
cls
echo ================================================
echo DoganHub Store - Quick Actions
echo ================================================
echo.
echo [1] Start Development Server (Port 3050)
echo [2] Run System Verification
echo [3] Check Health Endpoint
echo [4] Start Docker Services
echo [5] Run Integration Tests
echo [6] Build for Production
echo [7] View System Status
echo [8] Exit
echo.
set /p choice="Select an option (1-8): "

if "%choice%"=="1" goto start_dev
if "%choice%"=="2" goto verify
if "%choice%"=="3" goto health
if "%choice%"=="4" goto docker
if "%choice%"=="5" goto test
if "%choice%"=="6" goto build
if "%choice%"=="7" goto status
if "%choice%"=="8" goto end
goto menu

:start_dev
echo.
echo Starting development server on port 3050...
echo.
start http://localhost:3050/en
npm run dev
goto menu

:verify
echo.
echo Running system verification...
echo.
node scripts\verify-system.cjs
echo.
pause
goto menu

:health
echo.
echo Checking health endpoint...
echo.
curl http://localhost:3050/api/health
echo.
echo.
pause
goto menu

:docker
echo.
echo Starting Docker services...
echo.
docker-compose up -d
echo.
echo Services started:
docker-compose ps
echo.
pause
goto menu

:test
echo.
echo Running integration tests...
echo.
npm run test:e2e
echo.
pause
goto menu

:build
echo.
echo Building for production...
echo.
npm run build
echo.
pause
goto menu

:status
echo.
echo ================================================
echo System Status
echo ================================================
echo.
echo Node Version:
node --version
echo.
echo NPM Version:
npm --version
echo.
echo Dependencies:
if exist node_modules (
    echo   INSTALLED
) else (
    echo   NOT INSTALLED - Run: npm install
)
echo.
echo Development Server:
netstat -an | findstr ":3050" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo   RUNNING on port 3050
) else (
    echo   NOT RUNNING
)
echo.
echo Docker Services:
docker-compose ps 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo   Docker not running or not configured
)
echo.
echo Build Directory:
if exist .next (
    echo   EXISTS - Last build completed
) else (
    echo   NOT FOUND - Run: npm run build
)
echo.
echo.
pause
goto menu

:end
echo.
echo Exiting...
echo.
exit /b 0
