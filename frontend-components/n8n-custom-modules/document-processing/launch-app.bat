@echo off
REM Document Processor - Desktop Launcher
REM This script starts the server and opens the app in browser

setlocal enabledelayedexpansion

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo ❌ ERROR: Node.js is not installed or not in PATH
    echo.
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if MongoDB is running
netstat -ano | findstr :27017 >nul 2>&1
if errorlevel 1 (
    echo.
    echo ⚠️  WARNING: MongoDB might not be running on port 27017
    echo.
    echo Please ensure MongoDB is running:
    echo   • If using local MongoDB: Start MongoDB service
    echo   • If using Docker: Run: docker run -d -p 27017:27017 mongo:latest
    echo.
    echo Press any key to continue anyway...
    pause >nul
)

REM Get the directory where this script is located
cd /d "%~dp0"

echo.
echo ========================================
echo   Document Processor - Launcher
echo ========================================
echo.
echo 📁 Location: %cd%
echo 📦 Node.js: 
node --version
echo 📊 MongoDB Port: 27017
echo.

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules\" (
    echo 📥 Installing dependencies (first time only)...
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo ❌ ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
    echo.
)

REM Start the server
echo 🚀 Starting Document Processor Server...
echo    Admin Panel: http://localhost:3002/admin
echo    Document Processor: http://localhost:3002/document-processor
echo    Health Check: http://localhost:3002/health
echo.
echo 💡 Keep this window open. Close it to stop the server.
echo.

REM Start the server in the background and get the PID
start /b npm start >app.log 2>&1
set SERVER_PID=%ERRORLEVEL%

REM Wait a moment for server to start
timeout /t 3 /nobreak

REM Check if server is running
netstat -ano | findstr :3002 >nul 2>&1
if errorlevel 1 (
    echo.
    echo ❌ ERROR: Server failed to start on port 3002
    echo.
    echo Checking logs...
    type app.log
    echo.
    pause
    exit /b 1
)

REM Open browser to the app
echo 🌐 Opening Document Processor in browser...
start http://localhost:3002/document-processor

echo.
echo ✅ Server is running!
echo.
echo Press Ctrl+C to stop the server
echo.

REM Keep the window open and running
:wait_loop
netstat -ano | findstr :3002 >nul 2>&1
if errorlevel 1 (
    echo.
    echo ⚠️  Server stopped unexpectedly. Check app.log for details.
    pause
    exit /b 1
)
timeout /t 10 >nul
goto wait_loop