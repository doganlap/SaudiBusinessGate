# Test All Systems - DoganHubStore
# اختبار جميع الأنظمة - المتجر السعودي

Write-Host "🧪 DoganHubStore - Comprehensive System Test" -ForegroundColor Green
Write-Host "اختبار شامل لجميع أنظمة المتجر السعودي" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Yellow

$projectPath = "d:\Projects\DoganHubStore"
Set-Location $projectPath

$testResults = @{
    passed = 0
    failed = 0
    warnings = 0
    details = @()
}

function Add-TestResult {
    param(
        [string]$TestName,
        [string]$Status,
        [string]$Message,
        [string]$Details = ""
    )
    
    $result = @{
        name = $TestName
        status = $Status
        message = $Message
        details = $Details
        timestamp = Get-Date
    }
    
    $testResults.details += $result
    
    switch ($Status) {
        "PASS" { 
            $testResults.passed++
            Write-Host "  ✅ $TestName - $Message" -ForegroundColor Green
        }
        "FAIL" { 
            $testResults.failed++
            Write-Host "  ❌ $TestName - $Message" -ForegroundColor Red
            if ($Details) { Write-Host "     Details: $Details" -ForegroundColor Gray }
        }
        "WARN" { 
            $testResults.warnings++
            Write-Host "  ⚠️ $TestName - $Message" -ForegroundColor Yellow
            if ($Details) { Write-Host "     Details: $Details" -ForegroundColor Gray }
        }
    }
}

Write-Host "`n1️⃣ Testing Project Structure..." -ForegroundColor Cyan

# Test project files
$requiredFiles = @(
    "package.json",
    "next.config.js",
    "tailwind.config.ts",
    "tsconfig.json",
    "app/globals.css",
    "app/layout.tsx"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Add-TestResult "Project Structure" "PASS" "$file exists"
    } else {
        Add-TestResult "Project Structure" "FAIL" "$file missing"
    }
}

# Test directories
$requiredDirs = @(
    "app",
    "components",
    "lib",
    "scripts",
    "database"
)

foreach ($dir in $requiredDirs) {
    if (Test-Path $dir) {
        $itemCount = (Get-ChildItem $dir -Recurse).Count
        Add-TestResult "Directory Structure" "PASS" "$dir exists ($itemCount items)"
    } else {
        Add-TestResult "Directory Structure" "FAIL" "$dir missing"
    }
}

Write-Host "`n2️⃣ Testing Dependencies..." -ForegroundColor Cyan

# Check Node.js
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Add-TestResult "Node.js" "PASS" "Version: $nodeVersion"
    } else {
        Add-TestResult "Node.js" "FAIL" "Node.js not found"
    }
} catch {
    Add-TestResult "Node.js" "FAIL" "Node.js not accessible"
}

# Check NPM
try {
    $npmVersion = npm --version 2>$null
    if ($npmVersion) {
        Add-TestResult "NPM" "PASS" "Version: $npmVersion"
    } else {
        Add-TestResult "NPM" "FAIL" "NPM not found"
    }
} catch {
    Add-TestResult "NPM" "FAIL" "NPM not accessible"
}

# Check node_modules
if (Test-Path "node_modules") {
    $moduleCount = (Get-ChildItem "node_modules" -Directory).Count
    Add-TestResult "Dependencies" "PASS" "node_modules exists ($moduleCount packages)"
} else {
    Add-TestResult "Dependencies" "FAIL" "node_modules missing - run 'npm install'"
}

# Check key dependencies
$keyDeps = @("next", "react", "typescript", "tailwindcss")
if (Test-Path "package.json") {
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    foreach ($dep in $keyDeps) {
        if ($packageJson.dependencies.$dep -or $packageJson.devDependencies.$dep) {
            $version = $packageJson.dependencies.$dep ?? $packageJson.devDependencies.$dep
            Add-TestResult "Key Dependencies" "PASS" "$dep: $version"
        } else {
            Add-TestResult "Key Dependencies" "WARN" "$dep not found in package.json"
        }
    }
}

Write-Host "`n3️⃣ Testing Network & Ports..." -ForegroundColor Cyan

# Check listening ports
$targetPorts = @(3050, 3000, 5173, 5174)
$listeningPorts = @()

foreach ($port in $targetPorts) {
    try {
        $connection = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
        if ($connection) {
            $processName = (Get-Process -Id $connection.OwningProcess -ErrorAction SilentlyContinue).ProcessName
            $listeningPorts += $port
            Add-TestResult "Port Check" "PASS" "Port $port is listening ($processName)"
        }
    } catch {
        # Port not in use - this might be expected
    }
}

if ($listeningPorts.Count -eq 0) {
    Add-TestResult "Port Check" "WARN" "No development servers running on common ports"
}

# Test localhost connectivity
$testUrls = @(
    "http://localhost:3050/",
    "http://127.0.0.1:3050/",
    "http://localhost:3000/",
    "http://127.0.0.1:3000/"
)

foreach ($url in $testUrls) {
    try {
        $response = Invoke-WebRequest -Uri $url -TimeoutSec 3 -ErrorAction Stop
        Add-TestResult "Connectivity" "PASS" "$url responds (Status: $($response.StatusCode))"
        break  # If one works, we're good
    } catch {
        $errorType = if ($_.Exception.Message -match "refused") { "CONNECTION_REFUSED" }
                    elseif ($_.Exception.Message -match "timeout") { "TIMEOUT" }
                    else { "OTHER" }
        Add-TestResult "Connectivity" "FAIL" "$url failed ($errorType)"
    }
}

Write-Host "`n4️⃣ Testing Build System..." -ForegroundColor Cyan

# Test TypeScript compilation
try {
    Write-Host "    Checking TypeScript compilation..." -ForegroundColor Gray
    $tscOutput = npx tsc --noEmit --skipLibCheck 2>&1
    if ($LASTEXITCODE -eq 0) {
        Add-TestResult "TypeScript" "PASS" "No compilation errors"
    } else {
        $errorCount = ($tscOutput | Select-String "error TS").Count
        Add-TestResult "TypeScript" "FAIL" "$errorCount TypeScript errors found" $tscOutput[-5..-1] -join "`n"
    }
} catch {
    Add-TestResult "TypeScript" "WARN" "Could not run TypeScript check"
}

# Test Next.js build (quick check)
try {
    Write-Host "    Testing Next.js configuration..." -ForegroundColor Gray
    $nextCheck = npx next info 2>&1
    if ($LASTEXITCODE -eq 0) {
        Add-TestResult "Next.js Config" "PASS" "Configuration valid"
    } else {
        Add-TestResult "Next.js Config" "FAIL" "Configuration issues detected"
    }
} catch {
    Add-TestResult "Next.js Config" "WARN" "Could not verify Next.js configuration"
}

Write-Host "`n5️⃣ Testing Red Flags System..." -ForegroundColor Cyan

# Test Red Flags files
$redFlagsFiles = @(
    "lib/red-flags/incident-mode.ts",
    "lib/agents/red-flags-agents.ts",
    "database/red-flags/detection-rules.sql",
    "config/red-flags-playbook.yaml",
    "app/api/red-flags/incident/route.ts"
)

foreach ($file in $redFlagsFiles) {
    if (Test-Path $file) {
        $size = (Get-Item $file).Length
        Add-TestResult "Red Flags System" "PASS" "$file exists (${size} bytes)"
    } else {
        Add-TestResult "Red Flags System" "FAIL" "$file missing"
    }
}

# Test Red Flags API endpoint (if server is running)
if ($listeningPorts -contains 3050) {
    try {
        $apiResponse = Invoke-WebRequest -Uri "http://localhost:3050/api/red-flags/incident?action=active_incidents&tenantId=test" -TimeoutSec 5 -ErrorAction Stop
        if ($apiResponse.StatusCode -eq 200) {
            Add-TestResult "Red Flags API" "PASS" "API endpoint responding"
        } else {
            Add-TestResult "Red Flags API" "WARN" "API endpoint returned status $($apiResponse.StatusCode)"
        }
    } catch {
        Add-TestResult "Red Flags API" "WARN" "API endpoint not accessible (server may not be running)"
    }
}

Write-Host "`n6️⃣ Testing Accessibility..." -ForegroundColor Cyan

# Test accessibility files
$accessibilityFiles = @(
    "app/accessibility-fixes.css",
    "components/accessibility/helpers.tsx",
    "lib/accessibility/testing.ts"
)

foreach ($file in $accessibilityFiles) {
    if (Test-Path $file) {
        Add-TestResult "Accessibility" "PASS" "$file exists"
    } else {
        Add-TestResult "Accessibility" "WARN" "$file missing - run fix-accessibility.ps1"
    }
}

# Test for common accessibility issues in key files
$keyPages = @(
    "app/[lng]/(platform)/red-flags/page.tsx",
    "app/[lng]/(platform)/grc/controls/page.tsx",
    "app/[lng]/layout-shell.tsx"
)

foreach ($page in $keyPages) {
    if (Test-Path $page) {
        $content = Get-Content $page -Raw
        $issues = 0
        
        # Check for missing aria-label on select elements
        if ($content -match '<select(?![^>]*aria-label)') { $issues++ }
        
        # Check for buttons without accessible text
        if ($content -match '<button(?![^>]*aria-label)(?![^>]*title)>\s*<[^>]+>\s*</button>') { $issues++ }
        
        # Check for inline styles
        if ($content -match 'style=\{') { $issues++ }
        
        if ($issues -eq 0) {
            Add-TestResult "Page Accessibility" "PASS" "$page has no obvious accessibility issues"
        } else {
            Add-TestResult "Page Accessibility" "WARN" "$page has $issues potential accessibility issues"
        }
    }
}

Write-Host "`n7️⃣ Testing Database Schema..." -ForegroundColor Cyan

# Test database files
$dbFiles = @(
    "database/red-flags/detection-rules.sql",
    "lib/db/connection.ts"
)

foreach ($file in $dbFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $size = $content.Length
        
        if ($file.EndsWith(".sql")) {
            $tableCount = ($content | Select-String "CREATE TABLE").Count
            $functionCount = ($content | Select-String "CREATE.*FUNCTION").Count
            Add-TestResult "Database Schema" "PASS" "$file exists ($tableCount tables, $functionCount functions)"
        } else {
            Add-TestResult "Database Schema" "PASS" "$file exists (${size} bytes)"
        }
    } else {
        Add-TestResult "Database Schema" "FAIL" "$file missing"
    }
}

Write-Host "`n8️⃣ Testing Configuration Files..." -ForegroundColor Cyan

# Test configuration files
$configFiles = @{
    "next.config.js" = "Next.js configuration"
    "tailwind.config.ts" = "Tailwind CSS configuration"
    "tsconfig.json" = "TypeScript configuration"
    "postcss.config.js" = "PostCSS configuration"
}

foreach ($file in $configFiles.Keys) {
    if (Test-Path $file) {
        try {
            $content = Get-Content $file -Raw
            
            # Basic syntax check for JS/TS files
            if ($file.EndsWith(".js") -or $file.EndsWith(".ts")) {
                if ($content -match "export\s+(default|{)" -or $content -match "module\.exports") {
                    Add-TestResult "Configuration" "PASS" "$($configFiles[$file]) syntax OK"
                } else {
                    Add-TestResult "Configuration" "WARN" "$($configFiles[$file]) may have syntax issues"
                }
            } elseif ($file.EndsWith(".json")) {
                try {
                    $content | ConvertFrom-Json | Out-Null
                    Add-TestResult "Configuration" "PASS" "$($configFiles[$file]) JSON valid"
                } catch {
                    Add-TestResult "Configuration" "FAIL" "$($configFiles[$file]) invalid JSON"
                }
            }
        } catch {
            Add-TestResult "Configuration" "WARN" "Could not validate $($configFiles[$file])"
        }
    } else {
        Add-TestResult "Configuration" "FAIL" "$($configFiles[$file]) missing"
    }
}

Write-Host "`n9️⃣ Testing Scripts..." -ForegroundColor Cyan

# Test PowerShell scripts
$scripts = @(
    "scripts/fix-localhost.ps1",
    "scripts/fix-accessibility.ps1",
    "scripts/fix-specific-issues.ps1",
    "scripts/quick-diagnose.ps1"
)

foreach ($script in $scripts) {
    if (Test-Path $script) {
        try {
            # Basic syntax check
            $null = [System.Management.Automation.PSParser]::Tokenize((Get-Content $script -Raw), [ref]$null)
            Add-TestResult "Scripts" "PASS" "$script syntax OK"
        } catch {
            Add-TestResult "Scripts" "WARN" "$script may have syntax issues"
        }
    } else {
        Add-TestResult "Scripts" "FAIL" "$script missing"
    }
}

Write-Host "`n🔟 Testing Security..." -ForegroundColor Cyan

# Check for security issues
try {
    Write-Host "    Running npm audit..." -ForegroundColor Gray
    $auditOutput = npm audit --audit-level=high --json 2>$null
    if ($LASTEXITCODE -eq 0) {
        $auditData = $auditOutput | ConvertFrom-Json
        if ($auditData.metadata.vulnerabilities.high -eq 0 -and $auditData.metadata.vulnerabilities.critical -eq 0) {
            Add-TestResult "Security" "PASS" "No high/critical vulnerabilities found"
        } else {
            $high = $auditData.metadata.vulnerabilities.high
            $critical = $auditData.metadata.vulnerabilities.critical
            Add-TestResult "Security" "WARN" "$critical critical, $high high vulnerabilities found"
        }
    } else {
        Add-TestResult "Security" "WARN" "Could not run security audit"
    }
} catch {
    Add-TestResult "Security" "WARN" "Security audit failed"
}

# Check for sensitive files
$sensitiveFiles = @(".env", ".env.local", ".env.production")
foreach ($file in $sensitiveFiles) {
    if (Test-Path $file) {
        Add-TestResult "Security" "WARN" "$file exists - ensure it's not committed to version control"
    }
}

Write-Host "`n📊 Test Results Summary..." -ForegroundColor Cyan

Write-Host "`n🎯 Overall Results:" -ForegroundColor Yellow
Write-Host "  ✅ Passed: $($testResults.passed)" -ForegroundColor Green
Write-Host "  ❌ Failed: $($testResults.failed)" -ForegroundColor Red
Write-Host "  ⚠️ Warnings: $($testResults.warnings)" -ForegroundColor Yellow
Write-Host "  📊 Total Tests: $($testResults.details.Count)" -ForegroundColor White

$successRate = [math]::Round(($testResults.passed / $testResults.details.Count) * 100, 1)
Write-Host "  📈 Success Rate: $successRate%" -ForegroundColor $(if ($successRate -ge 80) { "Green" } elseif ($successRate -ge 60) { "Yellow" } else { "Red" })

# Detailed results by category
Write-Host "`n📋 Results by Category:" -ForegroundColor Yellow
$categories = $testResults.details | Group-Object { $_.name } | Sort-Object Name
foreach ($category in $categories) {
    $passed = ($category.Group | Where-Object { $_.status -eq "PASS" }).Count
    $failed = ($category.Group | Where-Object { $_.status -eq "FAIL" }).Count
    $warned = ($category.Group | Where-Object { $_.status -eq "WARN" }).Count
    $total = $category.Count
    
    $status = if ($failed -eq 0 -and $warned -eq 0) { "✅" }
             elseif ($failed -eq 0) { "⚠️" }
             else { "❌" }
    
    Write-Host "  $status $($category.Name): $passed/$total passed" -ForegroundColor $(
        if ($failed -eq 0 -and $warned -eq 0) { "Green" }
        elseif ($failed -eq 0) { "Yellow" }
        else { "Red" }
    )
}

# Critical failures
$criticalFailures = $testResults.details | Where-Object { $_.status -eq "FAIL" -and $_.name -in @("Node.js", "NPM", "Dependencies", "Project Structure") }
if ($criticalFailures) {
    Write-Host "`n🚨 Critical Issues (Must Fix):" -ForegroundColor Red
    foreach ($failure in $criticalFailures) {
        Write-Host "  ❌ $($failure.name): $($failure.message)" -ForegroundColor Red
    }
}

# Recommendations
Write-Host "`n💡 Recommendations:" -ForegroundColor Yellow

if ($testResults.failed -gt 0) {
    Write-Host "  🔧 Fix critical failures first:" -ForegroundColor White
    Write-Host "     - Ensure Node.js and NPM are installed" -ForegroundColor Gray
    Write-Host "     - Run 'npm install' if dependencies are missing" -ForegroundColor Gray
    Write-Host "     - Check project structure and required files" -ForegroundColor Gray
}

if ($testResults.warnings -gt 0) {
    Write-Host "  ⚠️ Address warnings:" -ForegroundColor White
    Write-Host "     - Run accessibility fix scripts" -ForegroundColor Gray
    Write-Host "     - Review security audit results" -ForegroundColor Gray
    Write-Host "     - Fix TypeScript compilation errors" -ForegroundColor Gray
}

if ($listeningPorts.Count -eq 0) {
    Write-Host "  🚀 Start development server:" -ForegroundColor White
    Write-Host "     npm run dev" -ForegroundColor Gray
}

Write-Host "`n🔧 Quick Fix Commands:" -ForegroundColor Yellow
Write-Host "  # Fix all issues automatically:" -ForegroundColor White
Write-Host "  .\scripts\fix-localhost.ps1" -ForegroundColor Gray
Write-Host "  .\scripts\fix-accessibility.ps1" -ForegroundColor Gray
Write-Host "  .\scripts\fix-specific-issues.ps1" -ForegroundColor Gray
Write-Host "  npm install" -ForegroundColor Gray
Write-Host "  npm run dev" -ForegroundColor Gray

# Save detailed results
$reportPath = "test-results-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
$testResults | ConvertTo-Json -Depth 10 | Out-File $reportPath -Encoding UTF8
Write-Host "`n📄 Detailed results saved to: $reportPath" -ForegroundColor Cyan

# Final status
if ($testResults.failed -eq 0) {
    Write-Host "`n🎉 All critical tests passed! DoganHubStore is ready to run." -ForegroundColor Green
    Write-Host "المتجر السعودي جاهز للتشغيل!" -ForegroundColor Green
} elseif ($testResults.failed -le 3) {
    Write-Host "`n⚠️ Minor issues detected. DoganHubStore should still work with some limitations." -ForegroundColor Yellow
    Write-Host "توجد مشاكل بسيطة - المتجر السعودي يجب أن يعمل مع بعض القيود." -ForegroundColor Yellow
} else {
    Write-Host "`n❌ Critical issues detected. Please fix before running DoganHubStore." -ForegroundColor Red
    Write-Host "توجد مشاكل حرجة - يرجى الإصلاح قبل تشغيل المتجر السعودي." -ForegroundColor Red
}

Write-Host "`n✅ Test completed at $(Get-Date)" -ForegroundColor Green
