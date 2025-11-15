@echo off
REM =====================================================
REM DoganHub Store - Desktop Icons Creator
REM =====================================================

echo ========================================
echo Creating DoganHub Store Desktop Icons
echo ========================================
echo.

REM Get the desktop path
set DESKTOP=%USERPROFILE%\Desktop

REM Copy shortcuts to desktop
echo Creating desktop shortcuts...
copy "DoganHub Store (English).url" "%DESKTOP%\" > nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ English interface shortcut created
) else (
    echo ⚠ Could not create English shortcut
)

copy "DoganHub Store (Arabic).url" "%DESKTOP%\" > nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Arabic interface shortcut created
) else (
    echo ⚠ Could not create Arabic shortcut
)

copy "DoganHub Billing.url" "%DESKTOP%\" > nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Billing management shortcut created
) else (
    echo ⚠ Could not create Billing shortcut
)

echo.
echo ========================================
echo Desktop Icons Created Successfully!
echo ========================================
echo You can now access DoganHub Store from:
echo - DoganHub Store (English) - Main interface
echo - DoganHub Store (Arabic) - Arabic interface  
echo - DoganHub Billing - Billing management
echo ========================================
echo.
pause