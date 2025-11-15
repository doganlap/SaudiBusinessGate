#!/usr/bin/env pwsh
# Production Deployment Script for Azure Container Registry and Azure Web App
# Usage: .\deploy-to-azure.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DoganHub Store - Azure Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$REGISTRY_NAME = "doganhubregistry"
$RESOURCE_GROUP = "doganhub-store-rg"
$IMAGE_NAME = "doganhub-store"
$WEB_APP_NAME = "doganhub-store-app"
$TAG = "latest"

# Step 1: Check if logged in to Azure
Write-Host "Step 1: Checking Azure login status..." -ForegroundColor Yellow
$azAccount = az account show 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Not logged in to Azure. Please login..." -ForegroundColor Red
    az login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Azure login failed. Exiting..." -ForegroundColor Red
        exit 1
    }
}
Write-Host "✓ Azure login verified" -ForegroundColor Green
Write-Host ""

# Step 2: Build the Docker image
Write-Host "Step 2: Building Docker image..." -ForegroundColor Yellow
docker build -t ${IMAGE_NAME}:${TAG} .
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Docker build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Docker image built successfully" -ForegroundColor Green
Write-Host ""

# Step 3: Login to Azure Container Registry
Write-Host "Step 3: Logging in to Azure Container Registry..." -ForegroundColor Yellow
az acr login --name $REGISTRY_NAME
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ ACR login failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ ACR login successful" -ForegroundColor Green
Write-Host ""

# Step 4: Tag the image for ACR
Write-Host "Step 4: Tagging image for Azure Container Registry..." -ForegroundColor Yellow
$ACR_LOGIN_SERVER = "${REGISTRY_NAME}.azurecr.io"
docker tag ${IMAGE_NAME}:${TAG} ${ACR_LOGIN_SERVER}/${IMAGE_NAME}:${TAG}
docker tag ${IMAGE_NAME}:${TAG} ${ACR_LOGIN_SERVER}/${IMAGE_NAME}:$(Get-Date -Format "yyyyMMdd-HHmmss")
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Image tagging failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Image tagged successfully" -ForegroundColor Green
Write-Host ""

# Step 5: Push the image to ACR
Write-Host "Step 5: Pushing image to Azure Container Registry..." -ForegroundColor Yellow
docker push ${ACR_LOGIN_SERVER}/${IMAGE_NAME}:${TAG}
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Image push failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Image pushed successfully" -ForegroundColor Green
Write-Host ""

# Step 6: Deploy to Azure Web App
Write-Host "Step 6: Deploying to Azure Web App..." -ForegroundColor Yellow
az webapp config container set `
    --name $WEB_APP_NAME `
    --resource-group $RESOURCE_GROUP `
    --docker-custom-image-name ${ACR_LOGIN_SERVER}/${IMAGE_NAME}:${TAG} `
    --docker-registry-server-url https://${ACR_LOGIN_SERVER}

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Azure Web App deployment failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Deployed to Azure Web App successfully" -ForegroundColor Green
Write-Host ""

# Step 7: Restart the Web App
Write-Host "Step 7: Restarting Azure Web App..." -ForegroundColor Yellow
az webapp restart --name $WEB_APP_NAME --resource-group $RESOURCE_GROUP
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Web App restart failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Web App restarted successfully" -ForegroundColor Green
Write-Host ""

# Step 8: Get the Web App URL
Write-Host "Step 8: Getting Web App URL..." -ForegroundColor Yellow
$webAppUrl = az webapp show --name $WEB_APP_NAME --resource-group $RESOURCE_GROUP --query "defaultHostName" -o tsv
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your application is now running at:" -ForegroundColor Cyan
Write-Host "https://$webAppUrl" -ForegroundColor Yellow
Write-Host ""
Write-Host "To view logs, run:" -ForegroundColor Cyan
Write-Host "az webapp log tail --name $WEB_APP_NAME --resource-group $RESOURCE_GROUP" -ForegroundColor Yellow
Write-Host ""
