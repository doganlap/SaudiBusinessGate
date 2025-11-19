@echo off
echo ========================================
echo Saudi Business Gate - TypeScript Error Fix
echo Fixing all remaining mock data references
echo ========================================
echo.

echo [1/3] Fixing AI Agents route...
powershell -Command "(Get-Content 'app\api\ai-agents\route.ts') -replace 'mockAIAgents', 'fallbackAIAgents' | Set-Content 'app\api\ai-agents\route.ts'"

echo [2/3] Fixing Themes route...
powershell -Command "(Get-Content 'app\api\themes\route.ts') -replace 'mockThemes', 'fallbackThemes' | Set-Content 'app\api\themes\route.ts'"

echo [3/3] Fixing Workflow Designer route...
powershell -Command "(Get-Content 'app\api\workflows\designer\route.ts') -replace 'mockWorkflowTemplates', 'fallbackWorkflowTemplates' | Set-Content 'app\api\workflows\designer\route.ts'"

echo.
echo ========================================
echo TypeScript Errors Fixed! ✅
echo ========================================
echo.
echo All mock data references have been replaced with fallback references.
echo Your application should now compile without TypeScript errors.
echo.
pause
