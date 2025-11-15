# Start Self-Healing Agent - DoganHubStore
# تشغيل وكيل الإصلاح الذاتي - المتجر السعودي

Write-Host "🤖 DoganHubStore - Self-Healing Agent" -ForegroundColor Green
Write-Host "وكيل الإصلاح الذاتي للمتجر السعودي" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Yellow

$projectPath = "d:\Projects\DoganHubStore"
Set-Location $projectPath

Write-Host "`n🔍 Initializing Self-Healing Agent..." -ForegroundColor Cyan

# Check if server is running
$serverRunning = $false
try {
    $connection = Get-NetTCPConnection -LocalPort 3050 -State Listen -ErrorAction SilentlyContinue
    if ($connection) {
        Write-Host "✅ Server already running on port 3050" -ForegroundColor Green
        $serverRunning = $true
    }
} catch {
    # Port not in use
}

if (-not $serverRunning) {
    Write-Host "🚀 Starting development server..." -ForegroundColor Yellow
    Start-Process -FilePath "cmd" -ArgumentList "/c", "npm run dev" -NoNewWindow
    Start-Sleep -Seconds 10
}

# Start Self-Healing Agent via API
Write-Host "`n🤖 Starting Self-Healing Agent..." -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3050/api/agents/self-healing" -Method POST -Body (@{
        action = "start"
    } | ConvertTo-Json) -ContentType "application/json" -TimeoutSec 10
    
    if ($response.success) {
        Write-Host "✅ Self-Healing Agent started successfully" -ForegroundColor Green
        Write-Host "   Status: $($response.status)" -ForegroundColor White
    } else {
        Write-Host "❌ Failed to start Self-Healing Agent" -ForegroundColor Red
    }
} catch {
    Write-Host "⚠️ Could not connect to API - starting manual healing..." -ForegroundColor Yellow
    
    # Manual healing process
    Write-Host "`n🔧 Running manual healing process..." -ForegroundColor Cyan
    
    # 1. Fix accessibility issues
    if (Test-Path "scripts\fix-accessibility.ps1") {
        Write-Host "  🔧 Fixing accessibility issues..." -ForegroundColor Yellow
        try {
            & ".\scripts\fix-accessibility.ps1"
            Write-Host "  ✅ Accessibility issues fixed" -ForegroundColor Green
        } catch {
            Write-Host "  ⚠️ Accessibility fix had issues" -ForegroundColor Yellow
        }
    }
    
    # 2. Fix specific issues
    if (Test-Path "scripts\fix-specific-issues.ps1") {
        Write-Host "  🔧 Fixing specific issues..." -ForegroundColor Yellow
        try {
            & ".\scripts\fix-specific-issues.ps1"
            Write-Host "  ✅ Specific issues fixed" -ForegroundColor Green
        } catch {
            Write-Host "  ⚠️ Specific fixes had issues" -ForegroundColor Yellow
        }
    }
    
    # 3. Fix localhost issues
    if (Test-Path "scripts\fix-localhost.ps1") {
        Write-Host "  🔧 Fixing localhost issues..." -ForegroundColor Yellow
        try {
            & ".\scripts\fix-localhost.ps1"
            Write-Host "  ✅ Localhost issues fixed" -ForegroundColor Green
        } catch {
            Write-Host "  ⚠️ Localhost fixes had issues" -ForegroundColor Yellow
        }
    }
}

# Monitor and display healing status
Write-Host "`n📊 Self-Healing Agent Status Monitor" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop monitoring..." -ForegroundColor Gray

$monitorCount = 0
while ($true) {
    try {
        Start-Sleep -Seconds 30
        $monitorCount++
        
        # Get status
        $statusResponse = Invoke-RestMethod -Uri "http://localhost:3050/api/agents/self-healing?action=status" -Method GET -TimeoutSec 5
        
        if ($statusResponse.success) {
            Write-Host "`n[$monitorCount] $(Get-Date -Format 'HH:mm:ss') - Agent Status: $($statusResponse.status)" -ForegroundColor Green
            
            # Get recent healing log
            $logResponse = Invoke-RestMethod -Uri "http://localhost:3050/api/agents/self-healing?action=log" -Method GET -TimeoutSec 5
            
            if ($logResponse.success -and $logResponse.log.Count -gt 0) {
                $recentActions = $logResponse.log | Select-Object -Last 3
                Write-Host "   Recent healing actions:" -ForegroundColor White
                foreach ($action in $recentActions) {
                    $status = if ($action.success) { "✅" } else { "❌" }
                    $time = [DateTime]::Parse($action.timestamp).ToString("HH:mm:ss")
                    Write-Host "   $status [$time] $($action.action)" -ForegroundColor Gray
                }
            }
        }
        
        # Perform manual checks every 5 minutes
        if ($monitorCount % 10 -eq 0) {
            Write-Host "`n🔍 Performing comprehensive health check..." -ForegroundColor Cyan
            
            # Trigger manual healing
            try {
                $healResponse = Invoke-RestMethod -Uri "http://localhost:3050/api/agents/self-healing" -Method POST -Body (@{
                    action = "heal_now"
                } | ConvertTo-Json) -ContentType "application/json" -TimeoutSec 30
                
                if ($healResponse.success) {
                    Write-Host "✅ Manual healing completed" -ForegroundColor Green
                    if ($healResponse.log -and $healResponse.log.Count -gt 0) {
                        Write-Host "   Actions taken:" -ForegroundColor White
                        foreach ($action in $healResponse.log) {
                            $status = if ($action.success) { "✅" } else { "❌" }
                            Write-Host "   $status $($action.action)" -ForegroundColor Gray
                        }
                    }
                }
            } catch {
                Write-Host "⚠️ Manual healing request failed" -ForegroundColor Yellow
            }
        }
        
    } catch {
        Write-Host "`n⚠️ [$monitorCount] $(Get-Date -Format 'HH:mm:ss') - Could not connect to Self-Healing Agent" -ForegroundColor Yellow
        
        # Try to restart server if it's down
        $serverCheck = Get-NetTCPConnection -LocalPort 3050 -State Listen -ErrorAction SilentlyContinue
        if (-not $serverCheck) {
            Write-Host "🚀 Server appears down - attempting restart..." -ForegroundColor Yellow
            Start-Process -FilePath "cmd" -ArgumentList "/c", "npm run dev" -NoNewWindow
        }
    }
}

Write-Host "`n🛑 Self-Healing Agent monitoring stopped" -ForegroundColor Red
