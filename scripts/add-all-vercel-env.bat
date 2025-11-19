@echo off
REM Add all environment variables to Vercel using CLI
REM This script adds all required environment variables to Vercel production

echo 🔐 Adding All Environment Variables to Vercel Production
echo ========================================================
echo.

REM Get the latest deployment URL
for /f "tokens=*" %%i in ('vercel ls --json 2^>nul ^| findstr "url"') do set DEPLOYMENT_URL=%%i

REM Set deployment URL (update this with your actual URL)
set VERCEL_URL=https://saudi-store-l9a1p16w5-donganksa.vercel.app

echo Using Vercel URL: %VERCEL_URL%
echo.

echo Adding JWT_SECRET...
echo fe9fd0e777a2e0d7560d38f99e7711551f45c071954765f194ae3c246a6aaee5 | vercel env add JWT_SECRET production

echo Adding NEXTAUTH_SECRET...
echo yI0dfqt0DU6gs5bpSMesQOhzGjEFsDExG/mHx31g4tI= | vercel env add NEXTAUTH_SECRET production

echo Adding NEXTAUTH_URL...
echo %VERCEL_URL% | vercel env add NEXTAUTH_URL production

echo Adding NODE_ENV...
echo production | vercel env add NODE_ENV production

echo Adding NEXT_PUBLIC_APP_URL...
echo %VERCEL_URL% | vercel env add NEXT_PUBLIC_APP_URL production

echo Adding NEXT_PUBLIC_API_URL...
echo %VERCEL_URL%/api | vercel env add NEXT_PUBLIC_API_URL production

echo.
echo ✅ Environment variables added!
echo.
echo 🚀 Now redeploy:
echo    vercel --prod
echo.

pause

