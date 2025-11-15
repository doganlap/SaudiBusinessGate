#!/usr/bin/env pwsh
# Local Docker Build and Test Script
# Usage: .\docker-build-test.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DoganHub Store - Local Docker Build" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$IMAGE_NAME = "doganhub-store"
$TAG = "test"
$CONTAINER_NAME = "doganhub-store-test"
$PORT = 3000

# Step 1: Stop and remove existing container if running
Write-Host "Step 1: Cleaning up existing containers..." -ForegroundColor Yellow
docker stop $CONTAINER_NAME 2>$null
docker rm $CONTAINER_NAME 2>$null
Write-Host "✓ Cleanup complete" -ForegroundColor Green
Write-Host ""

# Step 2: Build the Docker image
Write-Host "Step 2: Building Docker image..." -ForegroundColor Yellow
Write-Host "This may take several minutes..." -ForegroundColor Gray
docker build -t ${IMAGE_NAME}:${TAG} .
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Docker build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Docker image built successfully" -ForegroundColor Green
Write-Host ""

# Step 3: Run the container
Write-Host "Step 3: Starting Docker container..." -ForegroundColor Yellow
docker run -d `
    --name $CONTAINER_NAME `
    -p ${PORT}:3000 `
    -e NODE_ENV=production `
    -e NEXT_PUBLIC_APP_URL=http://localhost:${PORT} `
    ${IMAGE_NAME}:${TAG}

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to start container" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Container started successfully" -ForegroundColor Green
Write-Host ""

# Step 4: Wait for the application to start
Write-Host "Step 4: Waiting for application to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Step 5: Check container logs
Write-Host "Step 5: Checking container logs..." -ForegroundColor Yellow
docker logs $CONTAINER_NAME --tail 20
Write-Host ""

# Step 6: Test health endpoint
Write-Host "Step 6: Testing application health..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:${PORT}/api/health" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ Health check passed" -ForegroundColor Green
    } else {
        Write-Host "✗ Health check failed with status: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Health check failed: $_" -ForegroundColor Red
}
Write-Host ""

# Step 7: Display information
Write-Host "========================================" -ForegroundColor Green
Write-Host "Docker Build & Test Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Container Name: $CONTAINER_NAME" -ForegroundColor Cyan
Write-Host "Application URL: http://localhost:${PORT}" -ForegroundColor Yellow
Write-Host ""
Write-Host "Useful Commands:" -ForegroundColor Cyan
Write-Host "  View logs:      docker logs $CONTAINER_NAME -f" -ForegroundColor Gray
Write-Host "  Stop container: docker stop $CONTAINER_NAME" -ForegroundColor Gray
Write-Host "  Remove:         docker rm $CONTAINER_NAME" -ForegroundColor Gray
Write-Host "  Shell access:   docker exec -it $CONTAINER_NAME /bin/sh" -ForegroundColor Gray
Write-Host ""
