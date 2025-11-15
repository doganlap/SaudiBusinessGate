#!/usr/bin/env pwsh
# Cloudflare Deployment Script for DoganHub Store
# Usage: .\deploy-to-cloudflare.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DoganHub Store - Cloudflare Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$ACCOUNT_ID = "66b51ac969911d4364f483d887a66c0f"
$PROJECT_NAME = "dogan-ai-platform"
$DOMAIN = "dogan-ai.com"

# Step 1: Check Wrangler authentication
Write-Host "Step 1: Checking Wrangler authentication..." -ForegroundColor Yellow
$authCheck = wrangler whoami 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Not logged in to Cloudflare. Please login..." -ForegroundColor Red
    wrangler login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Cloudflare login failed. Exiting..." -ForegroundColor Red
        exit 1
    }
}
Write-Host "✓ Cloudflare authentication verified" -ForegroundColor Green
Write-Host ""

# Step 2: Create R2 buckets if they don't exist
Write-Host "Step 2: Setting up R2 storage buckets..." -ForegroundColor Yellow
$buckets = @("dogan-ai-files", "dogan-ai-reports", "dogan-ai-files-preview", "dogan-ai-reports-preview")
foreach ($bucket in $buckets) {
    Write-Host "Creating bucket: $bucket" -ForegroundColor Gray
    wrangler r2 bucket create $bucket 2>$null
}
Write-Host "✓ R2 buckets configured" -ForegroundColor Green
Write-Host ""

# Step 3: Create D1 database
Write-Host "Step 3: Setting up D1 database..." -ForegroundColor Yellow
wrangler d1 create dogan-ai-db 2>$null
Write-Host "✓ D1 database configured" -ForegroundColor Green
Write-Host ""

# Step 4: Create KV namespaces
Write-Host "Step 4: Setting up KV namespaces..." -ForegroundColor Yellow
$kvNamespaces = @("dogan-ai-cache", "dogan-ai-sessions", "dogan-ai-analytics")
foreach ($kv in $kvNamespaces) {
    Write-Host "Creating KV namespace: $kv" -ForegroundColor Gray
    wrangler kv:namespace create $kv 2>$null
    wrangler kv:namespace create "$kv-preview" --preview 2>$null
}
Write-Host "✓ KV namespaces configured" -ForegroundColor Green
Write-Host ""

# Step 5: Set up secrets
Write-Host "Step 5: Setting up secrets..." -ForegroundColor Yellow
Write-Host "Please set the following secrets using wrangler secret put:" -ForegroundColor Cyan
Write-Host "  wrangler secret put JWT_SECRET" -ForegroundColor Gray
Write-Host "  wrangler secret put DATABASE_URL" -ForegroundColor Gray
Write-Host "  wrangler secret put OPENAI_API_KEY" -ForegroundColor Gray
Write-Host "  wrangler secret put STRIPE_SECRET_KEY" -ForegroundColor Gray
Write-Host ""
$response = Read-Host "Have you set up the required secrets? (y/n)"
if ($response -ne "y" -and $response -ne "Y") {
    Write-Host "Please set up secrets first, then run this script again." -ForegroundColor Yellow
    exit 0
}
Write-Host "✓ Secrets configured" -ForegroundColor Green
Write-Host ""

# Step 6: Build the application
Write-Host "Step 6: Building application..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Application built successfully" -ForegroundColor Green
Write-Host ""

# Step 7: Deploy to Cloudflare Pages
Write-Host "Step 7: Deploying to Cloudflare Pages..." -ForegroundColor Yellow
wrangler pages deploy .next/standalone --project-name $PROJECT_NAME --compatibility-date 2024-01-01
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Pages deployment failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Deployed to Cloudflare Pages" -ForegroundColor Green
Write-Host ""

# Step 8: Deploy Workers (if needed)
Write-Host "Step 8: Deploying Workers..." -ForegroundColor Yellow
if (Test-Path "src/cloudflare-worker.ts") {
    wrangler deploy
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Worker deployment failed" -ForegroundColor Red
    } else {
        Write-Host "✓ Worker deployed successfully" -ForegroundColor Green
    }
} else {
    Write-Host "⚠ No worker file found, skipping worker deployment" -ForegroundColor Yellow
}
Write-Host ""

# Step 9: Configure custom domain
Write-Host "Step 9: Domain configuration..." -ForegroundColor Yellow
Write-Host "To configure custom domain ($DOMAIN):" -ForegroundColor Cyan
Write-Host "1. Go to Cloudflare Dashboard > Pages > $PROJECT_NAME > Custom domains" -ForegroundColor Gray
Write-Host "2. Add custom domain: $DOMAIN" -ForegroundColor Gray
Write-Host "3. Update DNS records as prompted" -ForegroundColor Gray
Write-Host ""

# Step 10: Display deployment information
Write-Host "========================================" -ForegroundColor Green
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Project: $PROJECT_NAME" -ForegroundColor Cyan
Write-Host "Account ID: $ACCOUNT_ID" -ForegroundColor Cyan
Write-Host "Domain: https://$DOMAIN" -ForegroundColor Yellow
Write-Host ""
Write-Host "R2 Storage Endpoint:" -ForegroundColor Cyan
Write-Host "https://$ACCOUNT_ID.r2.cloudflarestorage.com" -ForegroundColor Yellow
Write-Host ""
Write-Host "Useful Commands:" -ForegroundColor Cyan
Write-Host "  View logs:     wrangler pages deployment tail --project-name $PROJECT_NAME" -ForegroundColor Gray
Write-Host "  List buckets:  wrangler r2 bucket list" -ForegroundColor Gray
Write-Host "  KV operations: wrangler kv:key list --namespace-id <namespace-id>" -ForegroundColor Gray
Write-Host "  D1 console:    wrangler d1 execute dogan-ai-db --command 'SELECT 1'" -ForegroundColor Gray
Write-Host ""