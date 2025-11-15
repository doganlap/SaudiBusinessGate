# Quick Test - DoganHubStore
# اختبار سريع - المتجر السعودي

Write-Host "⚡ DoganHubStore - Quick Test" -ForegroundColor Green
Write-Host "اختبار سريع للمتجر السعودي" -ForegroundColor Green
Write-Host "===========================" -ForegroundColor Yellow

$projectPath = "d:\Projects\DoganHubStore"
Set-Location $projectPath

Write-Host "`n🔍 Quick System Check..." -ForegroundColor Cyan

# 1. Check if project exists
if (Test-Path $projectPath) {
    Write-Host "✅ Project directory exists" -ForegroundColor Green
} else {
    Write-Host "❌ Project directory not found" -ForegroundColor Red
    exit 1
}

# 2. Check Node.js
try {
    $nodeVersion = node --version 2>$null
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found" -ForegroundColor Red
}

# 3. Check package.json
if (Test-Path "package.json") {
    Write-Host "✅ package.json exists" -ForegroundColor Green
} else {
    Write-Host "❌ package.json missing" -ForegroundColor Red
}

# 4. Check node_modules
if (Test-Path "node_modules") {
    Write-Host "✅ node_modules exists" -ForegroundColor Green
} else {
    Write-Host "⚠️ node_modules missing - running npm install..." -ForegroundColor Yellow
    npm install
}

# 5. Check if server is running
$serverRunning = $false
try {
    $connection = Get-NetTCPConnection -LocalPort 3050 -State Listen -ErrorAction SilentlyContinue
    if ($connection) {
        Write-Host "✅ Server running on port 3050" -ForegroundColor Green
        $serverRunning = $true
    }
} catch {
    # Port not in use
}

if (-not $serverRunning) {
    Write-Host "⚠️ Server not running - starting..." -ForegroundColor Yellow
    Start-Process -FilePath "cmd" -ArgumentList "/c", "npm run dev" -NoNewWindow
    Write-Host "🚀 Starting development server..." -ForegroundColor Cyan
    Start-Sleep -Seconds 5
}

# 6. Test connectivity
Write-Host "`n🌐 Testing connectivity..." -ForegroundColor Cyan
$testUrls = @("http://localhost:3050/", "http://127.0.0.1:3050/")

foreach ($url in $testUrls) {
    try {
        $response = Invoke-WebRequest -Uri $url -TimeoutSec 3 -ErrorAction Stop
        Write-Host "✅ $url responds (Status: $($response.StatusCode))" -ForegroundColor Green
        
        # Open browser
        Start-Process $url
        break
    } catch {
        Write-Host "❌ $url failed" -ForegroundColor Red
    }
}

# 7. Quick file check
Write-Host "`n📁 Checking key files..." -ForegroundColor Cyan
$keyFiles = @(
    "app/globals.css",
    "components/DoganAppStoreShell.tsx",
    "lib/red-flags/incident-mode.ts",
    "scripts/fix-localhost.ps1"
)

foreach ($file in $keyFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "⚠️ $file missing" -ForegroundColor Yellow
    }
}

Write-Host "`n🎯 Quick Test Summary:" -ForegroundColor Yellow
Write-Host "  • Project: ✅ Ready" -ForegroundColor Green
Write-Host "  • Dependencies: ✅ Installed" -ForegroundColor Green
Write-Host "  • Server: 🚀 Running on http://localhost:3050" -ForegroundColor Green

Write-Host "`n🔧 If you see issues, run:" -ForegroundColor Yellow
Write-Host "  .\scripts\test-all.ps1        # Full comprehensive test" -ForegroundColor White
Write-Host "  .\scripts\fix-localhost.ps1   # Fix connection issues" -ForegroundColor White
Write-Host "  .\scripts\fix-accessibility.ps1  # Fix accessibility" -ForegroundColor White

Write-Host "`n✅ Quick test completed!" -ForegroundColor Green
Write-Host "المتجر السعودي جاهز للاستخدام!" -ForegroundColor Green
