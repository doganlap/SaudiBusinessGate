@echo off
REM Saudi Store - Project Inventory Generator
REM This script creates a comprehensive inventory of all project files

echo ========================================
echo Saudi Store - Project Inventory
echo ========================================
echo.

cd /d "%~dp0"

echo Setting execution policy for this session...
powershell -Command "Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass"

echo.
echo Running inventory scan...
echo.

powershell -ExecutionPolicy Bypass -File ".\scripts\make-inventory.ps1"

echo.
echo ========================================
echo Inventory files created:
echo - project-inventory.csv (detailed list)
echo - project-inventory-by-extension.csv (summary)
echo ========================================
echo.

pause
