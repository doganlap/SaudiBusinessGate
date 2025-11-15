# Final Check Script for GRC Control Administration App
# Run this before deployment to dogan-ai.com

Write-Host "🔍 Final Check: GRC Control Administration Platform" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

# Check 1: Project Structure
Write-Host "`n📁 Checking Project Structure..." -ForegroundColor Yellow
$requiredFiles = @(
    "database/schema/20-grc-controls-schema.sql",
    "lib/services/grc.service.ts",
    "lib/workflows/grc-workflows.ts", 
    "lib/automation/grc-scheduler.ts",
    "app/[lng]/(platform)/grc/page.tsx",
    "app/[lng]/(platform)/grc/controls/page.tsx",
    "app/[lng]/(platform)/grc/frameworks/page.tsx",
    "app/[lng]/(platform)/grc/testing/page.tsx",
    "app/[lng]/(platform)/grc/reports/page.tsx",
    "app/api/grc/controls/route.ts",
    "app/api/grc/frameworks/route.ts",
    "app/api/grc/tests/route.ts",
    "app/api/grc/exceptions/route.ts",
    "app/api/grc/analytics/route.ts",
    "app/api/grc/alerts/route.ts"
)

$missingFiles = @()
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file" -ForegroundColor Red
        $missingFiles += $file
    }
}

# Check 2: Dependencies
Write-Host "`n📦 Checking Dependencies..." -ForegroundColor Yellow
if (Test-Path "package.json") {
    $package = Get-Content "package.json" | ConvertFrom-Json
    $requiredDeps = @("next", "react", "typescript", "tailwindcss", "lucide-react", "pg")
    
    foreach ($dep in $requiredDeps) {
        if ($package.dependencies.$dep -or $package.devDependencies.$dep) {
            Write-Host "  ✅ $dep installed" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $dep missing" -ForegroundColor Red
        }
    }
} else {
    Write-Host "  ❌ package.json not found" -ForegroundColor Red
}

# Check 3: TypeScript Compilation
Write-Host "`n🔧 Checking TypeScript..." -ForegroundColor Yellow
try {
    $tscResult = npx tsc --noEmit 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ TypeScript compilation successful" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  TypeScript issues found:" -ForegroundColor Yellow
        Write-Host $tscResult -ForegroundColor Gray
    }
} catch {
    Write-Host "  ❌ TypeScript check failed" -ForegroundColor Red
}

# Check 4: Environment Configuration
Write-Host "`n⚙️  Checking Environment Files..." -ForegroundColor Yellow
$envFiles = @(".env.example", ".env.production")
foreach ($envFile in $envFiles) {
    if (Test-Path $envFile) {
        Write-Host "  ✅ $envFile exists" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $envFile missing" -ForegroundColor Red
    }
}

# Check 5: Database Schema
Write-Host "`n🗄️  Checking Database Schema..." -ForegroundColor Yellow
if (Test-Path "database/schema/20-grc-controls-schema.sql") {
    $schemaContent = Get-Content "database/schema/20-grc-controls-schema.sql" -Raw
    $requiredTables = @("controls", "frameworks", "control_tests", "control_exceptions", "ccm_alerts")
    
    foreach ($table in $requiredTables) {
        if ($schemaContent -match "CREATE TABLE.*$table") {
            Write-Host "  ✅ Table '$table' defined" -ForegroundColor Green
        } else {
            Write-Host "  ❌ Table '$table' missing" -ForegroundColor Red
        }
    }
} else {
    Write-Host "  ❌ Database schema file missing" -ForegroundColor Red
}

# Check 6: API Endpoints
Write-Host "`n🌐 Checking API Routes..." -ForegroundColor Yellow
$apiRoutes = @(
    "app/api/grc/controls/route.ts",
    "app/api/grc/frameworks/route.ts", 
    "app/api/grc/tests/route.ts",
    "app/api/grc/exceptions/route.ts",
    "app/api/grc/analytics/route.ts"
)

foreach ($route in $apiRoutes) {
    if (Test-Path $route) {
        $content = Get-Content $route -Raw
        if ($content -match "export async function GET" -and $content -match "NextResponse") {
            Write-Host "  ✅ $route properly configured" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  $route may have issues" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  ❌ $route missing" -ForegroundColor Red
    }
}

# Check 7: UI Pages
Write-Host "`n🎨 Checking UI Pages..." -ForegroundColor Yellow
$uiPages = @(
    "app/[lng]/(platform)/grc/page.tsx",
    "app/[lng]/(platform)/grc/controls/page.tsx",
    "app/[lng]/(platform)/grc/frameworks/page.tsx",
    "app/[lng]/(platform)/grc/testing/page.tsx",
    "app/[lng]/(platform)/grc/reports/page.tsx"
)

foreach ($page in $uiPages) {
    if (Test-Path $page) {
        $content = Get-Content $page -Raw
        if ($content -match "export default function" -and $content -match "useState") {
            Write-Host "  ✅ $page properly configured" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  $page may have issues" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  ❌ $page missing" -ForegroundColor Red
    }
}

# Check 8: Navigation Integration
Write-Host "`n🧭 Checking Navigation..." -ForegroundColor Yellow
if (Test-Path "components/navigation/MainNavigation.tsx") {
    $navContent = Get-Content "components/navigation/MainNavigation.tsx" -Raw
    if ($navContent -match "grc" -and $navContent -match "Shield") {
        Write-Host "  ✅ GRC module integrated in navigation" -ForegroundColor Green
    } else {
        Write-Host "  ❌ GRC module not found in navigation" -ForegroundColor Red
    }
} else {
    Write-Host "  ❌ Navigation component missing" -ForegroundColor Red
}

# Summary
Write-Host "`n📊 Final Check Summary" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan

if ($missingFiles.Count -eq 0) {
    Write-Host "✅ All required files present" -ForegroundColor Green
} else {
    Write-Host "❌ Missing files: $($missingFiles.Count)" -ForegroundColor Red
    foreach ($file in $missingFiles) {
        Write-Host "   - $file" -ForegroundColor Red
    }
}

Write-Host "`n🚀 Ready for Deployment Check:" -ForegroundColor Yellow
Write-Host "1. Run 'npm run build' to test production build" -ForegroundColor White
Write-Host "2. Test locally with 'npm run dev'" -ForegroundColor White
Write-Host "3. Verify all GRC pages load correctly" -ForegroundColor White
Write-Host "4. Test API endpoints with sample data" -ForegroundColor White
Write-Host "5. Review deployment configuration files" -ForegroundColor White

Write-Host "`n⚠️  IMPORTANT: Do not deploy until you approve!" -ForegroundColor Red
Write-Host "Run final tests and give approval before deployment to dogan-ai.com" -ForegroundColor Yellow
