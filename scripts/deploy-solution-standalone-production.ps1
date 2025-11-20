# Solution Module - Standalone Production Deployment Script
# PowerShell script for Windows

param(
    [switch]$Build,
    [switch]$Stop,
    [switch]$Logs
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Solution Module - Standalone Production Deployment" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

# Check Docker
Write-Host "Checking Docker..." -ForegroundColor Blue
try {
    docker ps | Out-Null
    Write-Host "  ✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Check Docker Compose
Write-Host "Checking Docker Compose..." -ForegroundColor Blue
try {
    docker-compose --version | Out-Null
    Write-Host "  ✅ Docker Compose is available" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Docker Compose is not available." -ForegroundColor Red
    exit 1
}

# Stop if requested
if ($Stop) {
    Write-Host "Stopping services..." -ForegroundColor Yellow
    docker-compose down --remove-orphans
    Write-Host "  ✅ Services stopped" -ForegroundColor Green
    exit 0
}

# Show logs if requested
if ($Logs) {
    Write-Host "Showing logs..." -ForegroundColor Yellow
    docker-compose logs -f app
    exit 0
}

# Check if database schema file exists
$SolutionSchemaFile = "database\create-solution-tables.sql"
if (-not (Test-Path $SolutionSchemaFile)) {
    Write-Host "  ⚠️  Solution schema file not found: $SolutionSchemaFile" -ForegroundColor Yellow
    Write-Host "  Will use existing database setup" -ForegroundColor Gray
} else {
    Write-Host "  ✅ Solution schema file found" -ForegroundColor Green
}

# Check docker-compose.yml
if (-not (Test-Path "docker-compose.yml")) {
    Write-Host "  ❌ docker-compose.yml not found" -ForegroundColor Red
    exit 1
}

Write-Host "  ✅ docker-compose.yml found" -ForegroundColor Green
Write-Host ""

# Build if requested
if ($Build) {
    Write-Host "Building Docker images..." -ForegroundColor Blue
    docker-compose build --no-cache
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ❌ Build failed" -ForegroundColor Red
        exit 1
    }
    Write-Host "  ✅ Images built successfully" -ForegroundColor Green
    Write-Host ""
}

# Stop existing containers
Write-Host "Stopping existing containers..." -ForegroundColor Blue
docker-compose down --remove-orphans 2>$null
Write-Host "  ✅ Containers stopped" -ForegroundColor Green
Write-Host ""

# Start services
Write-Host "Starting services..." -ForegroundColor Blue
docker-compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ❌ Failed to start services" -ForegroundColor Red
    exit 1
}
Write-Host "  ✅ Services started" -ForegroundColor Green
Write-Host ""

# Wait for services to be ready
Write-Host "Waiting for services to initialize..." -ForegroundColor Blue
Start-Sleep -Seconds 10

# Initialize Solution tables if needed
Write-Host "Initializing Solution module tables..." -ForegroundColor Blue
$InitResult = docker-compose exec -T postgres psql -U postgres -d doganhubstore -f /docker-entrypoint-initdb.d/create-solution-tables.sql 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Solution tables initialized" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Could not auto-initialize tables (may already exist)" -ForegroundColor Yellow
    Write-Host "  Manual initialization: docker-compose exec postgres psql -U postgres -d doganhubstore -f /docker-entrypoint-initdb.d/create-solution-tables.sql" -ForegroundColor Gray
}
Write-Host ""

# Check service status
Write-Host "Service Status:" -ForegroundColor Blue
docker-compose ps
Write-Host ""

# Check health
Write-Host "Checking application health..." -ForegroundColor Blue
Start-Sleep -Seconds 5

try {
    $HealthCheck = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -TimeoutSec 5 -UseBasicParsing -ErrorAction SilentlyContinue
    if ($HealthCheck.StatusCode -eq 200) {
        Write-Host "  ✅ Application is healthy" -ForegroundColor Green
    }
} catch {
    Write-Host "  ⚠️  Health check failed (may still be starting)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "✅ Deployment Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Access Application:" -ForegroundColor Cyan
Write-Host "  Main App:    http://localhost:3000" -ForegroundColor White
Write-Host "  Solution:    http://localhost:3000/en/solution" -ForegroundColor White
Write-Host "  RFP Intake:  http://localhost:3000/en/solution/rfps/new" -ForegroundColor White
Write-Host "  Analytics:   http://localhost:3000/en/solution/analytics" -ForegroundColor White
Write-Host ""
Write-Host "Useful Commands:" -ForegroundColor Cyan
Write-Host "  View logs:   .\scripts\deploy-solution-standalone-production.ps1 -Logs" -ForegroundColor Gray
Write-Host "  Stop:        .\scripts\deploy-solution-standalone-production.ps1 -Stop" -ForegroundColor Gray
Write-Host "  Rebuild:     .\scripts\deploy-solution-standalone-production.ps1 -Build" -ForegroundColor Gray
Write-Host ""

