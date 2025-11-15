@echo off
echo ========================================
echo DoganHub Store - Validation & Rebuild
echo ========================================
echo.

cd /d "D:\Projects\DoganHubStore"

echo [1/7] Checking paths...
if exist "app" (echo   ✓ app/) else (echo   ✗ app/ MISSING && exit /b 1)
if exist "components" (echo   ✓ components/) else (echo   ✗ components/ MISSING && exit /b 1)
if exist "lib" (echo   ✓ lib/) else (echo   ✗ lib/ MISSING && exit /b 1)
if exist "types" (echo   ✓ types/) else (echo   ✗ types/ MISSING && exit /b 1)
if exist "styles" (echo   ✓ styles/) else (echo   ✗ styles/ MISSING && exit /b 1)
if exist "public" (echo   ✓ public/) else (echo   ✗ public/ MISSING && exit /b 1)
if exist "Services" (echo   ✓ Services/) else (echo   ✗ Services/ MISSING && exit /b 1)
if not exist "hooks" mkdir hooks
echo   ✓ All directories validated!

echo.
echo [2/7] Checking configuration files...
if exist "package.json" (echo   ✓ package.json) else (echo   ✗ package.json MISSING && exit /b 1)
if exist "next.config.js" (echo   ✓ next.config.js) else (echo   ✗ next.config.js MISSING && exit /b 1)
if exist "tsconfig.json" (echo   ✓ tsconfig.json) else (echo   ✗ tsconfig.json MISSING && exit /b 1)
if exist ".env.local" (echo   ✓ .env.local) else (echo   ⚠ .env.local MISSING)
echo   ✓ Configuration files validated!

echo.
echo [3/7] Checking dependencies...
if exist "node_modules\next" (
    echo   ✓ Next.js installed
) else (
    echo   ✗ Dependencies not installed
    echo   Installing dependencies...
    call npm install
)

echo.
echo [4/7] Cleaning build cache...
if exist ".next" (
    rmdir /S /Q .next 2>nul
    echo   ✓ Cache cleared
) else (
    echo   ✓ No cache to clear
)

echo.
echo [5/7] Killing stale processes...
taskkill /F /IM node.exe 2>nul >nul
echo   ✓ Processes cleaned

echo.
echo [6/7] Building application...
echo   This may take 2-5 minutes...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo   ✗ Build failed!
    pause
    exit /b 1
)
echo   ✓ Build successful!

echo.
echo [7/7] Starting development server...
echo   Opening http://localhost:3050/en
start "" http://localhost:3050/en
call npm run dev

pause
