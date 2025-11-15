@echo off
echo Checking DoganHub Store build status...
echo.

cd /d "D:\Projects\DoganHubStore"

echo Checking for build output...
if exist ".next\BUILD_ID" (
    echo ✓ Build completed successfully!
    echo Build ID:
    type ".next\BUILD_ID"
    echo.
    if exist ".next\standalone" (
        echo ✓ Standalone build created
    )
    if exist ".next\server" (
        echo ✓ Server build created
    )
    if exist ".next\static" (
        echo ✓ Static assets created
    )
) else (
    echo ⏳ Build still in progress or not started...
)

echo.
echo Checking for running processes...
tasklist /FI "IMAGENAME eq node.exe" 2>nul | find /I "node.exe" >nul
if %ERRORLEVEL% EQU 0 (
    echo ✓ Node.js processes are running
    tasklist /FI "IMAGENAME eq node.exe"
) else (
    echo ✗ No Node.js processes found
)

echo.
pause
