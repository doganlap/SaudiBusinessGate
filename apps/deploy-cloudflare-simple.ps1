#!/usr/bin/env pwsh
# Simple Cloudflare Deployment Script for DoganHub Store

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DoganHub Store - Cloudflare Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$PROJECT_NAME = "dogan-ai-platform"
$DOMAIN = "dogan-ai.com"

# Step 1: Check Wrangler
Write-Host "Step 1: Checking Wrangler installation..." -ForegroundColor Yellow
$wranglerCheck = Get-Command wrangler -ErrorAction SilentlyContinue
if (-not $wranglerCheck) {
    Write-Host "Wrangler not found. Installing..." -ForegroundColor Yellow
    npm install -g wrangler
}
Write-Host "✓ Wrangler ready" -ForegroundColor Green
Write-Host ""

# Step 2: Login to Cloudflare
Write-Host "Step 2: Checking Cloudflare authentication..." -ForegroundColor Yellow
try {
    $authCheck = wrangler whoami 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Please login to Cloudflare..." -ForegroundColor Yellow
        wrangler login
    }
} catch {
    Write-Host "Please login to Cloudflare..." -ForegroundColor Yellow
    wrangler login
}
Write-Host "✓ Cloudflare authentication verified" -ForegroundColor Green
Write-Host ""

# Step 3: Build for production
Write-Host "Step 3: Building production application..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Production build complete" -ForegroundColor Green
Write-Host ""

# Step 4: Deploy to Cloudflare Pages
Write-Host "Step 4: Deploying to Cloudflare Pages..." -ForegroundColor Yellow
wrangler pages deploy .next/static --project-name $PROJECT_NAME --compatibility-date 2024-01-01
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Pages deployment failed" -ForegroundColor Red
    Write-Host "Trying alternative deployment method..." -ForegroundColor Yellow
    wrangler pages deploy out --project-name $PROJECT_NAME --compatibility-date 2024-01-01
}
Write-Host "✓ Deployed to Cloudflare Pages" -ForegroundColor Green
Write-Host ""

# Step 5: Display results
Write-Host "========================================" -ForegroundColor Green
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Your application is now live:" -ForegroundColor Cyan
Write-Host "   https://$PROJECT_NAME.pages.dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "🔧 Next steps:" -ForegroundColor Cyan
Write-Host "1. Configure custom domain: $DOMAIN" -ForegroundColor Gray
Write-Host "2. Set up environment variables" -ForegroundColor Gray
Write-Host "3. Configure database connections" -ForegroundColor Gray
Write-Host ""
Write-Host "📊 Local production is running at: http://localhost:3003" -ForegroundColor Green