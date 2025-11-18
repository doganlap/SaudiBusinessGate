@echo off
echo =======================================
echo DoganHub Store - Build Validation
echo =======================================
echo.

cd /d "d:\Projects\SBG"

echo [1/6] Checking paths and directories...
if exist "app" (echo   OK: app/) else (echo   MISSING: app/ && exit /b 1)
if exist "components" (echo   OK: components/) else (echo   MISSING: components/ && exit /b 1)
if exist "lib" (echo   OK: lib/) else (echo   MISSING: lib/ && exit /b 1)
if exist "types" (echo   OK: types/) else (echo   MISSING: types/ && exit /b 1)
if not exist "hooks" mkdir hooks
echo   All paths validated!

echo.
echo [2/6] Checking configuration files...
if exist "package.json" (echo   OK: package.json) else (echo   MISSING: package.json && exit /b 1)
if exist "next.config.js" (echo   OK: next.config.js) else (echo   MISSING: next.config.js && exit /b 1)
if exist "tsconfig.json" (echo   OK: tsconfig.json) else (echo   MISSING: tsconfig.json && exit /b 1)
echo   Configuration files validated!

echo.
echo [3/6] Checking dependencies...
if not exist "node_modules\next" (
    echo   Installing dependencies...
    call npm install
) else (
    echo   OK: Dependencies installed
)

echo.
echo [4/6] Cleaning build cache...
if exist ".next" (
    rmdir /S /Q .next
    echo   Cache cleared
) else (
    echo   No cache to clear
)

echo.
echo [5/6] Building application...
echo   Building (this may take 2-5 minutes)...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo   BUILD FAILED!
    pause
    exit /b 1
)
echo   Build successful!

echo.
echo [6/6] Starting development server...
echo   Opening http://localhost:3050/en
start "" http://localhost:3050/en
call npm run dev

pause
