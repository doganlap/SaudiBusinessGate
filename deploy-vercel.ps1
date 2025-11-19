# Vercel Production Deployment Script
Write-Host "🚀 Deploying to Vercel Production..." -ForegroundColor Cyan
Write-Host ""

# Check if logged in
Write-Host "📋 Checking Vercel login status..." -ForegroundColor Yellow
$loggedIn = vercel whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Not logged in. Please login first:" -ForegroundColor Yellow
    Write-Host "   vercel login" -ForegroundColor White
    exit 1
}

Write-Host "✅ Logged in to Vercel" -ForegroundColor Green
Write-Host ""

# Deploy to production
Write-Host "🌐 Deploying to production..." -ForegroundColor Cyan
Write-Host ""

vercel --prod

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Check deployment URL in output above" -ForegroundColor White
    Write-Host "2. Test: https://your-project.vercel.app/api/health" -ForegroundColor White
    Write-Host "3. Verify environment variables in Vercel dashboard" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Deployment failed. Check errors above." -ForegroundColor Red
    Write-Host ""
}

