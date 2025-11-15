# Quick Localhost Diagnosis - DoganHubStore
# تشخيص سريع للاتصال المحلي

Write-Host "🔍 DoganHubStore - Quick Connection Diagnosis" -ForegroundColor Green
Write-Host "تشخيص سريع لمشاكل الاتصال - المتجر السعودي" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Yellow

# 1. Check what's listening on target ports
Write-Host "`n1️⃣ Checking listening ports..." -ForegroundColor Cyan
$targetPorts = @(3050, 3000, 5173, 5174)
$listening = @()

foreach ($port in $targetPorts) {
    try {
        $conn = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
        if ($conn) {
            $processName = (Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue).ProcessName
            $listening += [PSCustomObject]@{
                Port = $port
                Address = $conn.LocalAddress
                Process = "$($conn.OwningProcess) ($processName)"
            }
        }
    } catch {
        # Port not in use
    }
}

if ($listening) {
    Write-Host "✅ Found services:" -ForegroundColor Green
    $listening | Format-Table -AutoSize
} else {
    Write-Host "❌ No services listening on ports: $($targetPorts -join ', ')" -ForegroundColor Red
}

# 2. Test basic connectivity
Write-Host "`n2️⃣ Testing basic connectivity..." -ForegroundColor Cyan
$testUrls = @(
    "http://localhost:3050/",
    "http://127.0.0.1:3050/",
    "http://localhost:3000/",
    "http://127.0.0.1:3000/"
)

foreach ($url in $testUrls) {
    try {
        $response = Invoke-WebRequest -Uri $url -TimeoutSec 2 -ErrorAction Stop
        Write-Host "✅ $url - Status: $($response.StatusCode)" -ForegroundColor Green
    } catch {
        $errorType = if ($_.Exception.Message -match "connection.*refused") { "CONNECTION_REFUSED" }
                    elseif ($_.Exception.Message -match "timeout") { "TIMEOUT" }
                    elseif ($_.Exception.Message -match "resolve") { "DNS_ERROR" }
                    else { "OTHER" }
        Write-Host "❌ $url - Error: $errorType" -ForegroundColor Red
    }
}

# 3. Check DoganHubStore project status
Write-Host "`n3️⃣ Checking DoganHubStore project..." -ForegroundColor Cyan
$projectPath = "d:\Projects\DoganHubStore"

if (Test-Path $projectPath) {
    Set-Location $projectPath
    Write-Host "✅ Project found at: $projectPath" -ForegroundColor Green
    
    # Check package.json
    if (Test-Path "package.json") {
        $pkg = Get-Content "package.json" | ConvertFrom-Json
        Write-Host "✅ Package: $($pkg.name) v$($pkg.version)" -ForegroundColor Green
        
        if ($pkg.scripts.dev) {
            Write-Host "✅ Dev script: $($pkg.scripts.dev)" -ForegroundColor Green
        } else {
            Write-Host "⚠️ No dev script found" -ForegroundColor Yellow
        }
    }
    
    # Check node_modules
    if (Test-Path "node_modules") {
        Write-Host "✅ node_modules exists" -ForegroundColor Green
    } else {
        Write-Host "❌ node_modules missing - run 'npm install'" -ForegroundColor Red
    }
    
    # Check Next.js
    if (Test-Path "node_modules\.bin\next.cmd") {
        Write-Host "✅ Next.js binary found" -ForegroundColor Green
    } else {
        Write-Host "❌ Next.js binary missing" -ForegroundColor Red
    }
    
} else {
    Write-Host "❌ Project not found at: $projectPath" -ForegroundColor Red
}

# 4. Environment check
Write-Host "`n4️⃣ Environment check..." -ForegroundColor Cyan

# Node.js version
try {
    $nodeVersion = node --version 2>$null
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found or not in PATH" -ForegroundColor Red
}

# NPM version
try {
    $npmVersion = npm --version 2>$null
    Write-Host "✅ NPM: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ NPM not found" -ForegroundColor Red
}

# Check proxy settings
$noProxy = $env:NO_PROXY
if ($noProxy) {
    Write-Host "✅ NO_PROXY: $noProxy" -ForegroundColor Green
} else {
    Write-Host "⚠️ NO_PROXY not set" -ForegroundColor Yellow
}

# 5. Quick recommendations
Write-Host "`n5️⃣ Quick fix recommendations:" -ForegroundColor Cyan

if (-not $listening) {
    Write-Host "🚀 Start the server:" -ForegroundColor Yellow
    Write-Host "   cd d:\Projects\DoganHubStore" -ForegroundColor White
    Write-Host "   npm run dev" -ForegroundColor White
    Write-Host "   # OR" -ForegroundColor Gray
    Write-Host "   npx next dev -H 0.0.0.0 -p 3050" -ForegroundColor White
}

if (-not (Test-Path "$projectPath\node_modules")) {
    Write-Host "📦 Install dependencies:" -ForegroundColor Yellow
    Write-Host "   cd d:\Projects\DoganHubStore" -ForegroundColor White
    Write-Host "   npm install" -ForegroundColor White
}

Write-Host "`n🔧 Run full fix script:" -ForegroundColor Yellow
Write-Host "   .\scripts\fix-localhost.ps1" -ForegroundColor White

Write-Host "`n🌐 Try these URLs once server is running:" -ForegroundColor Yellow
Write-Host "   http://127.0.0.1:3050/" -ForegroundColor White
Write-Host "   http://localhost:3050/" -ForegroundColor White

Write-Host "`n✅ Diagnosis complete!" -ForegroundColor Green
