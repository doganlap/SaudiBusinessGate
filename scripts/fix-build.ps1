# Fix Docker Build Worker Error
Write-Host "Fixing Docker build worker error..." -ForegroundColor Green

# Backup current config
if (Test-Path "next.config.js") {
    Copy-Item "next.config.js" "next.config.backup.js" -Force
    Write-Host "Configuration backed up" -ForegroundColor Yellow
}

# Apply fixed config
if (Test-Path "next.config.fixed.js") {
    Copy-Item "next.config.fixed.js" "next.config.js" -Force
    Write-Host "Fixed configuration applied" -ForegroundColor Green
} else {
    Write-Host "Error: next.config.fixed.js not found!" -ForegroundColor Red
    exit 1
}

# Clean build
if (Test-Path ".next") {
    Remove-Item ".next" -Recurse -Force
    Write-Host "Cleaned .next directory" -ForegroundColor Yellow
}

# Build Docker image
Write-Host "Building Docker image..." -ForegroundColor Yellow
docker build --no-cache -f Dockerfile.fixed -t doganhub-fixed:latest .

if ($LASTEXITCODE -eq 0) {
    Write-Host "SUCCESS: Docker image built successfully!" -ForegroundColor Green
    Write-Host "Your build worker error has been resolved." -ForegroundColor Cyan
} else {
    Write-Host "ERROR: Docker build failed!" -ForegroundColor Red
    # Restore backup
    if (Test-Path "next.config.backup.js") {
        Copy-Item "next.config.backup.js" "next.config.js" -Force
    }
    exit 1
}
