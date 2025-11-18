@echo off
REM Document Processor - Electron App Setup
REM This script helps you build the standalone Electron application

setlocal enabledelayedexpansion

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo ❌ ERROR: Node.js is not installed
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo Choose the LTS version and make sure to add it to PATH
    pause
    exit /b 1
)

REM Get the directory where this script is located
cd /d "%~dp0"

echo.
echo ========================================
echo   Document Processor - Electron Setup
echo ========================================
echo.
echo 📦 Node version: 
node --version
echo 📦 npm version:
npm --version
echo.
echo ✅ Prerequisites verified!
echo.

REM Menu
:menu
echo.
echo ========================================
echo   What would you like to do?
echo ========================================
echo.
echo 1. Run in Development Mode (test in Electron)
echo 2. Build Windows Installer + Portable
echo 3. Build Windows Installer Only
echo 4. Build Portable Exe Only
echo 5. Install Electron Dependencies
echo 6. View Help
echo 7. Exit
echo.
set /p choice="Enter your choice (1-7): "

if "%choice%"=="1" goto dev_mode
if "%choice%"=="2" goto build_both
if "%choice%"=="3" goto build_installer
if "%choice%"=="4" goto build_portable
if "%choice%"=="5" goto install_deps
if "%choice%"=="6" goto help_menu
if "%choice%"=="7" goto exit_script

echo.
echo ❌ Invalid choice. Please try again.
goto menu

REM ==== DEV MODE ====
:dev_mode
echo.
echo 🚀 Starting in Development Mode...
echo.
echo This will:
echo   1. Start the Express server
echo   2. Launch Electron app with DevTools
echo   3. Allow you to test the app
echo.
echo Close the Electron window to exit
echo.

if not exist "node_modules\" (
    echo 📥 Installing dependencies (first time only)...
    call npm install
    if errorlevel 1 (
        echo.
        echo ❌ Failed to install dependencies
        pause
        goto menu
    )
)

call npm run dev
if errorlevel 1 (
    echo.
    echo ❌ Error running dev mode
    pause
    goto menu
)

echo.
echo ✅ Dev mode closed
echo.
pause
goto menu

REM ==== BUILD BOTH ====
:build_both
echo.
echo 📦 Building Windows Installer + Portable Exe...
echo.
echo This will create:
echo   • DocumentProcessor-2.0.0.exe (Installer)
echo   • DocumentProcessor-2.0.0-portable.exe (Standalone)
echo.
echo Location: dist/
echo.
echo This may take 2-5 minutes...
echo.
pause

if not exist "node_modules\" (
    echo 📥 Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo.
        echo ❌ Failed to install dependencies
        pause
        goto menu
    )
)

echo 🔨 Building application...
call npm run build:app:win
if errorlevel 1 (
    echo.
    echo ❌ Build failed!
    pause
    goto menu
)

echo.
echo ✅ Build complete!
echo.
echo Your installers are ready in the 'dist' folder:
echo.
dir dist\*.exe /B
echo.
pause
goto menu

REM ==== BUILD INSTALLER ONLY ====
:build_installer
echo.
echo 📦 Building Windows Installer Only...
echo.
echo This will create: DocumentProcessor-2.0.0.exe
echo Location: dist/
echo.
echo This may take 1-2 minutes...
echo.
pause

if not exist "node_modules\" (
    echo 📥 Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo.
        echo ❌ Failed to install dependencies
        pause
        goto menu
    )
)

echo 🔨 Building NSIS installer...
call npm run build:app:win -- --nsis
if errorlevel 1 (
    echo.
    echo ❌ Build failed!
    pause
    goto menu
)

echo.
echo ✅ Installer created!
echo.
dir dist\*.exe /B
echo.
pause
goto menu

REM ==== BUILD PORTABLE ====
:build_portable
echo.
echo 📦 Building Portable Exe Only...
echo.
echo This will create: DocumentProcessor-2.0.0-portable.exe
echo Location: dist/
echo.
echo Single file, no installation needed!
echo.
echo This may take 1-2 minutes...
echo.
pause

if not exist "node_modules\" (
    echo 📥 Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo.
        echo ❌ Failed to install dependencies
        pause
        goto menu
    )
)

echo 🔨 Building portable executable...
call npm run build:app:win -- --portable
if errorlevel 1 (
    echo.
    echo ❌ Build failed!
    pause
    goto menu
)

echo.
echo ✅ Portable exe created!
echo.
dir dist\*.exe /B
echo.
pause
goto menu

REM ==== INSTALL DEPS ====
:install_deps
echo.
echo 📥 Installing Electron Dependencies...
echo.
echo Installing:
echo   • electron
echo   • electron-builder
echo   • electron-is-dev
echo   • concurrently
echo   • wait-on
echo.
echo This may take 2-3 minutes...
echo.
pause

call npm install electron electron-builder electron-is-dev concurrently wait-on --save-dev

if errorlevel 1 (
    echo.
    echo ❌ Installation failed!
    pause
    goto menu
)

echo.
echo ✅ Dependencies installed successfully!
echo.
pause
goto menu

REM ==== HELP MENU ====
:help_menu
echo.
echo ========================================
echo   Help - Electron Application Guide
echo ========================================
echo.
echo 📋 QUICK START:
echo   1. Choose option 1 to test in development
echo   2. Choose option 2 to build for distribution
echo   3. Share the .exe file from dist/ folder
echo.
echo 🎯 DEVELOPMENT MODE (Option 1):
echo   • Starts Express server + Electron
echo   • Opens app with DevTools enabled
echo   • Good for testing features
echo   • Close window to exit
echo.
echo 📦 BUILD OPTIONS:
echo   Option 2: Create both installer + portable
echo   Option 3: Create installer only (~150MB)
echo   Option 4: Create portable exe only (~120MB)
echo.
echo 🔧 INSTALLERS:
echo   • Installer (.exe): Full setup wizard experience
echo   • Portable (.exe): Single file, no installation
echo.
echo 📁 OUTPUT LOCATION:
echo   All built files go to: dist/
echo.
echo 💾 FILE SIZES:
echo   Installer: ~150MB (includes Node.js runtime)
echo   Portable: ~120MB
echo.
echo 📚 FULL DOCUMENTATION:
echo   Read: ELECTRON-APP-SETUP.md
echo.
echo.
pause
goto menu

REM ==== EXIT ====
:exit_script
echo.
echo 👋 Goodbye!
echo.
exit /b 0