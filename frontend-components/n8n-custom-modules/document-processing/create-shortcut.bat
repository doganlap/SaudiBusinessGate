@echo off
REM Desktop Shortcut Creator - Wrapper Script
REM This batch file calls the PowerShell script to create desktop shortcuts

setlocal enabledelayedexpansion

cls
echo.
echo ========================================
echo  Document Processor - Desktop Shortcut
echo ========================================
echo.
echo Setting up desktop and Start Menu shortcuts...
echo.

REM Get the current directory
set "CURRENT_DIR=%cd%"
set "SCRIPT_DIR=%~dp0"

REM Navigate to script directory
cd /d "%SCRIPT_DIR%"

REM Run PowerShell to execute the create-shortcut.ps1 script
powershell -NoProfile -ExecutionPolicy Bypass -File "create-shortcut.ps1"

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo SUCCESS! Desktop shortcut created!
    echo ========================================
    echo.
    echo You should now see a "Document Processor" icon on your desktop.
    echo Click it to launch the application.
    echo.
) else (
    echo.
    echo ========================================
    echo ERROR: Failed to create desktop shortcut
    echo ========================================
    echo.
    echo Please ensure:
    echo - You have administrator privileges
    echo - PowerShell scripts are allowed on this computer
    echo - create-shortcut.ps1 exists in this directory
    echo.
)

cd /d "%CURRENT_DIR%"
pause