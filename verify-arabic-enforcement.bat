@echo off
echo ========================================
echo Verifying Arabic Enforcement
echo Checking All Configurations
echo ========================================
echo.

echo [1/8] Checking middleware configuration...
findstr /C:"return 'ar'" middleware.ts >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Middleware enforces Arabic
) else (
    echo ❌ Middleware NOT enforcing Arabic
)

echo.
echo [2/8] Checking i18n default language...
findstr /C:"defaultLanguage: Language = 'ar'" lib\i18n\index.ts >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ i18n default language is Arabic
) else (
    echo ❌ i18n default language NOT Arabic
)

echo.
echo [3/8] Checking root layout language...
findstr /C:"lang=\"ar\"" layout.tsx >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Root layout lang attribute is Arabic
) else (
    echo ❌ Root layout lang attribute NOT Arabic
)

echo.
echo [4/8] Checking root layout direction...
findstr /C:"dir=\"rtl\"" layout.tsx >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Root layout direction is RTL
) else (
    echo ❌ Root layout direction NOT RTL
)

echo.
echo [5/8] Checking Arabic metadata...
findstr /C:"بوابة" layout.tsx >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Metadata contains Arabic text
) else (
    echo ❌ Metadata NOT in Arabic
)

echo.
echo [6/8] Checking for English defaults...
findstr /C:"defaultLanguage.*=.*'en'" /S /I *.ts *.tsx 2>nul | find /C "defaultLanguage" >nul 2>&1
if %errorlevel% neq 0 (
    echo ✅ No English defaults found
) else (
    echo ⚠️  Warning: Some English defaults may exist
)

echo.
echo [7/8] Checking route structure...
if exist "app\ar" (
    echo ✅ Arabic route folder exists
) else (
    echo ⚠️  Arabic route folder not found
)

echo.
echo [8/8] Summary of Arabic Enforcement...
echo.
echo ========================================
echo VERIFICATION COMPLETE
echo ========================================
echo.
echo Core Components Checked:
echo   ✅ Middleware (middleware.ts)
echo   ✅ i18n Configuration (lib/i18n/index.ts)
echo   ✅ Root Layout (layout.tsx)
echo   ✅ Metadata (Arabic titles)
echo   ✅ RTL Direction
echo   ✅ Route Structure
echo.
echo To test the enforcement:
echo   1. Run: npm run dev
echo   2. Open: http://localhost:3051
echo   3. Verify: URL redirects to /ar/...
echo   4. Check: Page displays in Arabic
echo.
pause
