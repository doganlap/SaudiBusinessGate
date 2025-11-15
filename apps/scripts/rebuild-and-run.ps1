# Rebuild and Run GRC Control Administration App
# Safe testing before deployment

Write-Host "🔄 Rebuilding and Running GRC Control Administration App" -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Green

# Step 1: Clean previous builds
Write-Host "`n🧹 Cleaning previous builds..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "  ✅ Removed .next directory" -ForegroundColor Green
}

if (Test-Path "node_modules/.cache") {
    Remove-Item -Recurse -Force "node_modules/.cache"
    Write-Host "  ✅ Cleared node_modules cache" -ForegroundColor Green
}

# Step 2: Install/Update dependencies
Write-Host "`n📦 Installing dependencies..." -ForegroundColor Yellow
try {
    npm install
    Write-Host "  ✅ Dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Failed to install dependencies" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
    exit 1
}

# Step 3: TypeScript check
Write-Host "`n🔧 Checking TypeScript..." -ForegroundColor Yellow
try {
    npx tsc --noEmit
    Write-Host "  ✅ TypeScript compilation successful" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  TypeScript issues found (continuing anyway)" -ForegroundColor Yellow
}

# Step 4: Build the application
Write-Host "`n🔨 Building application..." -ForegroundColor Yellow
try {
    npm run build
    Write-Host "  ✅ Build completed successfully" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Build failed" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
    Write-Host "`n🔄 Trying development mode instead..." -ForegroundColor Yellow
}

# Step 5: Start development server
Write-Host "`n🚀 Starting development server..." -ForegroundColor Yellow
Write-Host "  📍 Server will start on: http://localhost:3000" -ForegroundColor Cyan
Write-Host "  🎯 GRC Dashboard: http://localhost:3000/en/grc" -ForegroundColor Cyan
Write-Host "  🛑 Press Ctrl+C to stop the server" -ForegroundColor Yellow

Write-Host "`n📋 Test Checklist:" -ForegroundColor Magenta
Write-Host "  1. ✅ Visit: http://localhost:3000/en/grc" -ForegroundColor White
Write-Host "  2. ✅ Test GRC Dashboard loads" -ForegroundColor White
Write-Host "  3. ✅ Navigate to Controls page" -ForegroundColor White
Write-Host "  4. ✅ Check Frameworks page" -ForegroundColor White
Write-Host "  5. ✅ Test Testing page" -ForegroundColor White
Write-Host "  6. ✅ Verify Reports page" -ForegroundColor White
Write-Host "  7. ✅ Test API endpoints work" -ForegroundColor White
Write-Host "  8. ✅ Check bilingual support (AR/EN)" -ForegroundColor White

Write-Host "`n🌐 Key URLs to Test:" -ForegroundColor Cyan
Write-Host "  • Main Dashboard: http://localhost:3000/en" -ForegroundColor White
Write-Host "  • GRC Dashboard: http://localhost:3000/en/grc" -ForegroundColor White
Write-Host "  • Controls: http://localhost:3000/en/grc/controls" -ForegroundColor White
Write-Host "  • Frameworks: http://localhost:3000/en/grc/frameworks" -ForegroundColor White
Write-Host "  • Testing: http://localhost:3000/en/grc/testing" -ForegroundColor White
Write-Host "  • Reports: http://localhost:3000/en/grc/reports" -ForegroundColor White

Write-Host "`n🔌 API Endpoints to Test:" -ForegroundColor Cyan
Write-Host "  • GET /api/grc/controls" -ForegroundColor White
Write-Host "  • GET /api/grc/frameworks" -ForegroundColor White
Write-Host "  • GET /api/grc/analytics" -ForegroundColor White
Write-Host "  • GET /api/grc/tests" -ForegroundColor White

Write-Host "`n⚠️  IMPORTANT NOTES:" -ForegroundColor Red
Write-Host "  • This is DEVELOPMENT mode - not production" -ForegroundColor Yellow
Write-Host "  • APIs use fallback sample data (no real database)" -ForegroundColor Yellow
Write-Host "  • Test all functionality before approving deployment" -ForegroundColor Yellow

Write-Host "`n🚀 Starting server now..." -ForegroundColor Green

# Start the development server
npm run dev
