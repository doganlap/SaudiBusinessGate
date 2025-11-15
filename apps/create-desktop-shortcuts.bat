@echo off
echo Creating desktop shortcuts for DoganHub Store...

set "DESKTOP=%USERPROFILE%\Desktop"

echo Copying DoganHub Store shortcuts to desktop...
copy "%~dp0DoganHub Store Local.lnk" "%DESKTOP%\DoganHub Store Local.lnk" >nul 2>&1
copy "%~dp0DoganHub Store Arabic.lnk" "%DESKTOP%\DoganHub Store Arabic.lnk" >nul 2>&1

echo.
echo ✅ Desktop shortcuts created successfully!
echo.
echo Available shortcuts:
echo - DoganHub Store Local (English): http://localhost:3003/en
echo - DoganHub Store Arabic: http://localhost:3003/ar
echo.
echo Starting DoganHub Store in browser...
start http://localhost:3003/en

pause