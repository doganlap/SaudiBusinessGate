@echo off
REM Saudi Store - UI Pages Deployment Validation
REM This script validates all UI pages are ready for deployment

echo ========================================
echo Saudi Store - Deployment Validation
echo ========================================
echo.

cd /d "%~dp0"

echo [1/7] Counting UI pages...
powershell -Command "Write-Host 'Total pages found:' -NoNewline; Write-Host ' ' -NoNewline; (Get-ChildItem -Path 'app' -Filter 'page.tsx' -Recurse | Where-Object { $_.FullName -notlike '*node_modules*' -and $_.FullName -notlike '*.next*' } | Measure-Object).Count" 

echo.
echo [2/7] Checking for duplicate pages in apps/app/...
if exist "apps\app" (
    echo WARNING: Duplicate app directory found!
    echo Please review: apps\app\
) else (
    echo SUCCESS: No duplicate directory found
)

echo.
echo [3/7] Validating TypeScript configuration...
if exist "tsconfig.json" (
    echo SUCCESS: tsconfig.json found
) else (
    echo ERROR: tsconfig.json missing!
)

echo.
echo [4/7] Checking Next.js configuration...
if exist "next.config.js" (
    echo SUCCESS: next.config.js found
) else (
    echo ERROR: next.config.js missing!
)

echo.
echo [5/7] Validating environment files...
if exist ".env.local" (
    echo SUCCESS: .env.local found
) else (
    echo WARNING: .env.local not found
)

if exist ".env.production" (
    echo SUCCESS: .env.production found
) else (
    echo WARNING: .env.production not found - create before deployment!
)

echo.
echo [6/7] Checking package.json scripts...
findstr /C:"\"build\"" package.json >nul
if %errorlevel% equ 0 (
    echo SUCCESS: build script configured
) else (
    echo ERROR: build script missing!
)

findstr /C:"\"start\"" package.json >nul
if %errorlevel% equ 0 (
    echo SUCCESS: start script configured
) else (
    echo ERROR: start script missing!
)

echo.
echo [7/7] Listing critical directories...
echo.
dir /AD /B app\api 2>nul && echo API routes: FOUND || echo API routes: MISSING
dir /AD /B app\[lng] 2>nul && echo i18n routes: FOUND || echo i18n routes: MISSING
dir /AD /B components 2>nul && echo Components: FOUND || echo Components: MISSING
dir /AD /B lib 2>nul && echo Libraries: FOUND || echo Libraries: MISSING

echo.
echo ========================================
echo Validation Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Review UI_PAGES_DEPLOYMENT_REPORT.md
echo 2. Run: npm run build
echo 3. Run: npm run test
echo 4. Deploy to staging first
echo.

pause
