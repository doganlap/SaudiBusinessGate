@echo off
echo ========================================
echo DoganHub Store - Project Restructure
echo ========================================
echo.

cd /d "D:\Projects\DoganHubStore\apps"

echo Step 1: Creating professional directory structure...
if not exist "..\docs" mkdir "..\docs"
if not exist "..\scripts" mkdir "..\scripts"
if not exist "..\database" mkdir "..\database"
if not exist "..\config" mkdir "..\config"
echo   Done!

echo.
echo Step 2: Moving core files to root...
if exist "package.json" copy /Y "package.json" "..\package.json" >nul
if exist "package-lock.json" copy /Y "package-lock.json" "..\package-lock.json" >nul
if exist "next.config.js" copy /Y "next.config.js" "..\next.config.js" >nul
if exist "tsconfig.json" copy /Y "tsconfig.json" "..\tsconfig.json" >nul
if exist "tailwind.config.ts" copy /Y "tailwind.config.ts" "..\tailwind.config.ts" >nul
if exist ".env.local" copy /Y ".env.local" "..\.env.local" >nul
if exist ".babelrc" copy /Y ".babelrc" "..\.babelrc" >nul
if exist "docker-compose.yml" copy /Y "docker-compose.yml" "..\docker-compose.yml" >nul
if exist "Dockerfile" copy /Y "Dockerfile" "..\Dockerfile" >nul
echo   Core files moved!

echo.
echo Step 3: Moving directories...
if exist "app" xcopy /E /I /Y "app" "..\app" >nul
if exist "components" xcopy /E /I /Y "components" "..\components" >nul
if exist "lib" xcopy /E /I /Y "lib" "..\lib" >nul
if exist "public" xcopy /E /I /Y "public" "..\public" >nul
if exist "styles" xcopy /E /I /Y "styles" "..\styles" >nul
if exist "types" xcopy /E /I /Y "types" "..\types" >nul
if exist "Services" xcopy /E /I /Y "Services" "..\Services" >nul
echo   Directories moved!

echo.
echo Step 4: Organizing documentation...
for %%f in (*.md) do (
    copy /Y "%%f" "..\docs\%%f" >nul 2>&1
)
echo   Documentation organized!

echo.
echo Step 5: Organizing scripts...
for %%f in (*.ps1 *.bat *.sh) do (
    copy /Y "%%f" "..\scripts\%%f" >nul 2>&1
)
echo   Scripts organized!

echo.
echo Step 6: Organizing database files...
for %%f in (*.sql) do (
    copy /Y "%%f" "..\database\%%f" >nul 2>&1
)
echo   Database files organized!

echo.
echo ========================================
echo Restructure Complete!
echo ========================================
echo.
echo New Structure:
echo   + Root: D:\Projects\DoganHubStore\
echo   + Documentation: docs/
echo   + Scripts: scripts/
echo   + Database: database/
echo   + Configuration: config/
echo.
echo Dev Server: http://localhost:3050
echo.
pause