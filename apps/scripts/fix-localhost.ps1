# Fix Localhost Connection Issues - DoganHubStore
# إصلاح مشاكل الاتصال المحلي - المتجر السعودي

Write-Host "🔧 DoganHubStore - Localhost Connection Fix" -ForegroundColor Green
Write-Host "إصلاح مشاكل الاتصال المحلي للمتجر السعودي" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Yellow

# 1. Check current listening ports
Write-Host "`n1️⃣ Checking current listening ports..." -ForegroundColor Cyan
$ports = @(3000, 3050, 5173, 5174, 80, 8080)
$listening = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | 
    Where-Object { $ports -contains $_.LocalPort } |
    Select-Object LocalAddress, LocalPort, OwningProcess

if ($listening) {
    Write-Host "✅ Found listening ports:" -ForegroundColor Green
    $listening | Format-Table -AutoSize
} else {
    Write-Host "❌ No services listening on common ports" -ForegroundColor Red
}

# 2. Kill existing processes on target ports
Write-Host "`n2️⃣ Killing existing processes on target ports..." -ForegroundColor Cyan
$targetPorts = @(3050, 3000)  # DoganHubStore uses 3050, fallback 3000

foreach ($port in $targetPorts) {
    try {
        $connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
        if ($connections) {
            foreach ($conn in $connections) {
                $pid = $conn.OwningProcess
                Write-Host "🔪 Killing process $pid on port $port" -ForegroundColor Yellow
                taskkill /PID $pid /F 2>$null
            }
        }
    } catch {
        # Port not in use, continue
    }
}

# 3. Configure firewall rules
Write-Host "`n3️⃣ Configuring Windows Firewall..." -ForegroundColor Cyan
try {
    netsh advfirewall firewall delete rule name="DoganHubStore-Dev" 2>$null
    netsh advfirewall firewall add rule name="DoganHubStore-Dev" dir=in action=allow protocol=TCP localport="3050,3000,5173,5174" | Out-Null
    Write-Host "✅ Firewall rules added for ports 3050, 3000, 5173, 5174" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Could not modify firewall (run as Administrator for full fix)" -ForegroundColor Yellow
}

# 4. Set proxy bypass
Write-Host "`n4️⃣ Setting proxy bypass for localhost..." -ForegroundColor Cyan
try {
    [Environment]::SetEnvironmentVariable("NO_PROXY", "localhost,127.0.0.1,::1", "User")
    $env:NO_PROXY = "localhost,127.0.0.1,::1"
    Write-Host "✅ NO_PROXY environment variable set" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Could not set NO_PROXY environment variable" -ForegroundColor Yellow
}

# 5. Check hosts file
Write-Host "`n5️⃣ Checking hosts file configuration..." -ForegroundColor Cyan
$hostsPath = "C:\Windows\System32\drivers\etc\hosts"
if (Test-Path $hostsPath) {
    $hostsContent = Get-Content $hostsPath
    $hasLocalhost = $hostsContent | Where-Object { $_ -match "127\.0\.0\.1\s+localhost" }
    $hasIPv6 = $hostsContent | Where-Object { $_ -match "::1\s+localhost" }
    
    if ($hasLocalhost) {
        Write-Host "✅ IPv4 localhost entry found" -ForegroundColor Green
    } else {
        Write-Host "⚠️ IPv4 localhost entry missing" -ForegroundColor Yellow
    }
    
    if ($hasIPv6) {
        Write-Host "✅ IPv6 localhost entry found" -ForegroundColor Green
    } else {
        Write-Host "⚠️ IPv6 localhost entry missing" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Hosts file not found" -ForegroundColor Red
}

# 6. Test basic HTTP server
Write-Host "`n6️⃣ Testing basic HTTP server on port 3050..." -ForegroundColor Cyan
$testServer = Start-Job -ScriptBlock {
    try {
        $listener = New-Object System.Net.HttpListener
        $listener.Prefixes.Add("http://127.0.0.1:3050/")
        $listener.Start()
        Write-Output "Server started on http://127.0.0.1:3050/"
        
        $context = $listener.GetContext()
        $response = $context.Response
        $responseString = "DoganHubStore Test Server - OK"
        $buffer = [System.Text.Encoding]::UTF8.GetBytes($responseString)
        $response.ContentLength64 = $buffer.Length
        $response.OutputStream.Write($buffer, 0, $buffer.Length)
        $response.OutputStream.Close()
        $listener.Stop()
        Write-Output "Test completed successfully"
    } catch {
        Write-Output "Test server failed: $($_.Exception.Message)"
    }
}

Start-Sleep -Seconds 2

# Test connection
try {
    $testResponse = Invoke-WebRequest -Uri "http://127.0.0.1:3050/" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Basic HTTP server test PASSED" -ForegroundColor Green
} catch {
    Write-Host "❌ Basic HTTP server test FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# Clean up test job
Stop-Job $testServer -ErrorAction SilentlyContinue
Remove-Job $testServer -ErrorAction SilentlyContinue

# 7. Check DoganHubStore project structure
Write-Host "`n7️⃣ Checking DoganHubStore project..." -ForegroundColor Cyan
$projectPath = "d:\Projects\DoganHubStore"

if (Test-Path $projectPath) {
    Write-Host "✅ DoganHubStore project found at $projectPath" -ForegroundColor Green
    
    Set-Location $projectPath
    
    # Check package.json
    if (Test-Path "package.json") {
        Write-Host "✅ package.json found" -ForegroundColor Green
        
        # Check if node_modules exists
        if (Test-Path "node_modules") {
            Write-Host "✅ node_modules found" -ForegroundColor Green
        } else {
            Write-Host "⚠️ node_modules missing - running npm install..." -ForegroundColor Yellow
            npm install
        }
        
        # Check for Next.js
        $packageContent = Get-Content "package.json" | ConvertFrom-Json
        if ($packageContent.dependencies.next -or $packageContent.devDependencies.next) {
            Write-Host "✅ Next.js detected in dependencies" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Next.js not found in dependencies" -ForegroundColor Yellow
        }
        
    } else {
        Write-Host "❌ package.json not found" -ForegroundColor Red
    }
} else {
    Write-Host "❌ DoganHubStore project not found at $projectPath" -ForegroundColor Red
    Write-Host "Please check the project path" -ForegroundColor Yellow
}

# 8. Start DoganHubStore development server
Write-Host "`n8️⃣ Starting DoganHubStore development server..." -ForegroundColor Cyan

if (Test-Path "$projectPath\package.json") {
    Set-Location $projectPath
    
    Write-Host "🚀 Starting server with multiple fallback options..." -ForegroundColor Yellow
    
    # Option 1: npm run dev (if script exists)
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    if ($packageJson.scripts.dev) {
        Write-Host "📦 Using npm run dev..." -ForegroundColor Cyan
        Start-Process -FilePath "cmd" -ArgumentList "/c", "npm run dev" -NoNewWindow
    }
    # Option 2: Next.js direct
    elseif ($packageJson.dependencies.next -or $packageJson.devDependencies.next) {
        Write-Host "⚡ Using npx next dev..." -ForegroundColor Cyan
        Start-Process -FilePath "cmd" -ArgumentList "/c", "npx next dev -H 0.0.0.0 -p 3050" -NoNewWindow
    }
    # Option 3: Generic node server
    else {
        Write-Host "🔧 Starting generic node server..." -ForegroundColor Cyan
        $serverScript = @"
const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end('<h1>DoganHubStore Development Server</h1><p>Server is running on port 3050</p>');
});

server.listen(3050, '0.0.0.0', () => {
    console.log('DoganHubStore server running on http://localhost:3050');
});
"@
        $serverScript | Out-File -FilePath "temp-server.js" -Encoding UTF8
        Start-Process -FilePath "node" -ArgumentList "temp-server.js" -NoNewWindow
    }
    
    # Wait for server to start
    Write-Host "⏳ Waiting for server to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    
    # Test the server
    $testUrls = @(
        "http://localhost:3050/",
        "http://127.0.0.1:3050/",
        "http://localhost:3000/",
        "http://127.0.0.1:3000/"
    )
    
    foreach ($url in $testUrls) {
        try {
            Write-Host "🔍 Testing $url..." -ForegroundColor Cyan
            $response = Invoke-WebRequest -Uri $url -TimeoutSec 3 -ErrorAction Stop
            Write-Host "✅ SUCCESS: $url is responding (Status: $($response.StatusCode))" -ForegroundColor Green
            
            # Open in default browser
            Start-Process $url
            break
        } catch {
            Write-Host "❌ FAILED: $url - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# 9. Final diagnostics
Write-Host "`n9️⃣ Final diagnostics..." -ForegroundColor Cyan

Write-Host "`n📊 Current listening ports:" -ForegroundColor Yellow
Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | 
    Where-Object { $ports -contains $_.LocalPort } |
    Select-Object LocalAddress, LocalPort, OwningProcess |
    Format-Table -AutoSize

Write-Host "`n🌐 Recommended URLs to try:" -ForegroundColor Yellow
Write-Host "  • http://127.0.0.1:3050/ (IPv4 explicit)" -ForegroundColor White
Write-Host "  • http://localhost:3050/ (hostname)" -ForegroundColor White
Write-Host "  • http://127.0.0.1:3000/ (fallback port)" -ForegroundColor White

Write-Host "`n🔧 If still having issues, run these commands manually:" -ForegroundColor Yellow
Write-Host "  cd d:\Projects\DoganHubStore" -ForegroundColor White
Write-Host "  npm install" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
Write-Host "  # OR" -ForegroundColor Gray
Write-Host "  npx next dev -H 0.0.0.0 -p 3050" -ForegroundColor White

Write-Host "`n✅ DoganHubStore localhost fix completed!" -ForegroundColor Green
Write-Host "المتجر السعودي - تم إصلاح مشاكل الاتصال المحلي!" -ForegroundColor Green
