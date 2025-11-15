@echo off
echo ========================================
echo Production Readiness Validation
echo DoganHub Store
echo ========================================
echo.

set ERROR_COUNT=0
set WARNING_COUNT=0

echo [1/10] Checking required files...
if exist "package.json" (echo   OK: package.json) else (echo   FAIL: package.json missing && set /a ERROR_COUNT+=1)
if exist "next.config.js" (echo   OK: next.config.js) else (echo   FAIL: next.config.js missing && set /a ERROR_COUNT+=1)
if exist "tsconfig.json" (echo   OK: tsconfig.json) else (echo   FAIL: tsconfig.json missing && set /a ERROR_COUNT+=1)
if exist "vercel.json" (echo   OK: vercel.json) else (echo   WARN: vercel.json missing && set /a WARNING_COUNT+=1)
if exist ".vercelignore" (echo   OK: .vercelignore) else (echo   WARN: .vercelignore missing && set /a WARNING_COUNT+=1)

echo.
echo [2/10] Checking directory structure...
if exist "app" (echo   OK: app/) else (echo   FAIL: app/ missing && set /a ERROR_COUNT+=1)
if exist "components" (echo   OK: components/) else (echo   FAIL: components/ missing && set /a ERROR_COUNT+=1)
if exist "lib" (echo   OK: lib/) else (echo   FAIL: lib/ missing && set /a ERROR_COUNT+=1)
if exist "public" (echo   OK: public/) else (echo   FAIL: public/ missing && set /a ERROR_COUNT+=1)

echo.
echo [3/10] Checking environment files...
if exist ".env.local" (echo   OK: .env.local exists) else (echo   WARN: .env.local missing - create from .env.example && set /a WARNING_COUNT+=1)
if exist ".env.production" (echo   OK: .env.production) else (echo   INFO: .env.production not found ^(optional^))

echo.
echo [4/10] Checking Node modules...
if exist "node_modules" (
    echo   OK: node_modules exists
) else (
    echo   FAIL: node_modules missing - run: npm install
    set /a ERROR_COUNT+=1
)

echo.
echo [5/10] Validating package.json scripts...
findstr /C:"\"build\"" package.json >nul
if %ERRORLEVEL% EQU 0 (echo   OK: build script exists) else (echo   FAIL: build script missing && set /a ERROR_COUNT+=1)
findstr /C:"\"start\"" package.json >nul
if %ERRORLEVEL% EQU 0 (echo   OK: start script exists) else (echo   FAIL: start script missing && set /a ERROR_COUNT+=1)
findstr /C:"\"dev\"" package.json >nul
if %ERRORLEVEL% EQU 0 (echo   OK: dev script exists) else (echo   FAIL: dev script missing && set /a ERROR_COUNT+=1)

echo.
echo [6/10] Checking critical dependencies...
if exist "node_modules\next" (echo   OK: Next.js installed) else (echo   FAIL: Next.js missing && set /a ERROR_COUNT+=1)
if exist "node_modules\react" (echo   OK: React installed) else (echo   FAIL: React missing && set /a ERROR_COUNT+=1)
if exist "node_modules\typescript" (echo   OK: TypeScript installed) else (echo   FAIL: TypeScript missing && set /a ERROR_COUNT+=1)

echo.
echo [7/10] Checking API routes...
if exist "app\api" (
    echo   OK: API routes directory exists
    dir /B /S "app\api\*.ts" 2>nul | find /C ".ts" > temp_count.txt
    set /p API_COUNT=<temp_count.txt
    del temp_count.txt
    echo   INFO: Found API route files
) else (
    echo   WARN: app\api directory not found
    set /a WARNING_COUNT+=1
)

echo.
echo [8/10] Checking health endpoint...
if exist "app\api\health\route.ts" (
    echo   OK: Health check endpoint exists
) else (
    echo   WARN: Health check endpoint missing - recommended for production
    set /a WARNING_COUNT+=1
)

echo.
echo [9/10] Testing TypeScript compilation...
echo   Running type check...
call npx tsc --noEmit 2>nul
if %ERRORLEVEL% EQU 0 (
    echo   OK: TypeScript compilation successful
) else (
    echo   WARN: TypeScript has errors - check with: npx tsc --noEmit
    set /a WARNING_COUNT+=1
)

echo.
echo [10/10] Checking build configuration...
findstr /C:"output.*standalone" next.config.js >nul
if %ERRORLEVEL% EQU 0 (echo   OK: Standalone output configured) else (echo   INFO: Not using standalone output)
findstr /C:"typescript" next.config.js >nul
if %ERRORLEVEL% EQU 0 (echo   OK: TypeScript config present) else (echo   INFO: Default TypeScript config)

echo.
echo ========================================
echo Validation Summary
echo ========================================
echo   Errors: %ERROR_COUNT%
echo   Warnings: %WARNING_COUNT%
echo.

if %ERROR_COUNT% EQU 0 (
    if %WARNING_COUNT% EQU 0 (
        echo   STATUS: READY FOR PRODUCTION
        echo.
        echo   Next steps:
        echo   1. Build: npm run build
        echo   2. Test locally: npm start
        echo   3. Deploy: vercel --prod
    ) else (
        echo   STATUS: READY WITH WARNINGS
        echo.
        echo   Review warnings above and fix if needed
        echo   You can still deploy: vercel --prod
    )
) else (
    echo   STATUS: NOT READY
    echo.
    echo   Fix errors above before deploying
    exit /b 1
)

echo.
pause
