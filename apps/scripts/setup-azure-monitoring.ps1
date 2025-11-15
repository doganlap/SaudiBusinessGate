# Azure Application Insights Setup Script
# This script creates all necessary Azure monitoring resources

param(
    [Parameter(Mandatory=$false)]
    [string]$ResourceGroup = "SaudiStoreProd",
    
    [Parameter(Mandatory=$false)]
    [string]$Location = "eastus",
    
    [Parameter(Mandatory=$false)]
    [string]$AppInsightsName = "saudistore-appinsights",
    
    [Parameter(Mandatory=$false)]
    [string]$WorkspaceName = "saudistore-logs"
)

Write-Host "🔷 Azure Application Insights Setup" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if Azure CLI is installed
Write-Host "Checking Azure CLI installation..." -ForegroundColor Yellow
try {
    $azVersion = az version --output json | ConvertFrom-Json
    Write-Host "✓ Azure CLI version: $($azVersion.'azure-cli')" -ForegroundColor Green
} catch {
    Write-Host "✗ Azure CLI not found. Please install: https://aka.ms/InstallAzureCli" -ForegroundColor Red
    exit 1
}

# Check if logged in
Write-Host "Checking Azure login status..." -ForegroundColor Yellow
$account = az account show 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Not logged in to Azure. Running 'az login'..." -ForegroundColor Yellow
    az login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Azure login failed" -ForegroundColor Red
        exit 1
    }
}

$accountInfo = az account show | ConvertFrom-Json
Write-Host "✓ Logged in as: $($accountInfo.user.name)" -ForegroundColor Green
Write-Host "✓ Subscription: $($accountInfo.name)" -ForegroundColor Green
Write-Host ""

# Create Resource Group if it doesn't exist
Write-Host "Checking resource group: $ResourceGroup" -ForegroundColor Yellow
$rgExists = az group exists --name $ResourceGroup
if ($rgExists -eq "false") {
    Write-Host "Creating resource group: $ResourceGroup" -ForegroundColor Yellow
    az group create --name $ResourceGroup --location $Location
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Resource group created" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to create resource group" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✓ Resource group exists" -ForegroundColor Green
}
Write-Host ""

# Create Log Analytics Workspace
Write-Host "Creating Log Analytics Workspace: $WorkspaceName" -ForegroundColor Yellow
$workspace = az monitor log-analytics workspace create `
    --resource-group $ResourceGroup `
    --workspace-name $WorkspaceName `
    --location $Location `
    --output json 2>$null | ConvertFrom-Json

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Log Analytics Workspace created" -ForegroundColor Green
    $workspaceId = $workspace.id
} else {
    # Workspace might already exist, try to get it
    Write-Host "Workspace might exist, retrieving..." -ForegroundColor Yellow
    $workspace = az monitor log-analytics workspace show `
        --resource-group $ResourceGroup `
        --workspace-name $WorkspaceName `
        --output json | ConvertFrom-Json
    $workspaceId = $workspace.id
    Write-Host "✓ Using existing workspace" -ForegroundColor Green
}
Write-Host ""

# Create Application Insights
Write-Host "Creating Application Insights: $AppInsightsName" -ForegroundColor Yellow
$appInsights = az monitor app-insights component create `
    --app $AppInsightsName `
    --location $Location `
    --resource-group $ResourceGroup `
    --kind web `
    --application-type web `
    --workspace $workspaceId `
    --output json 2>$null | ConvertFrom-Json

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Application Insights created" -ForegroundColor Green
} else {
    # Might already exist, try to get it
    Write-Host "Application Insights might exist, retrieving..." -ForegroundColor Yellow
    $appInsights = az monitor app-insights component show `
        --app $AppInsightsName `
        --resource-group $ResourceGroup `
        --output json | ConvertFrom-Json
    Write-Host "✓ Using existing Application Insights" -ForegroundColor Green
}
Write-Host ""

# Get connection string and instrumentation key
Write-Host "Retrieving Application Insights credentials..." -ForegroundColor Yellow
$connectionString = $appInsights.connectionString
$instrumentationKey = $appInsights.instrumentationKey
$appId = $appInsights.appId

Write-Host "✓ Connection string retrieved" -ForegroundColor Green
Write-Host ""

# Display results
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "✅ Application Insights Setup Complete" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Application Insights Details:" -ForegroundColor Yellow
Write-Host "Name: $AppInsightsName" -ForegroundColor White
Write-Host "Resource Group: $ResourceGroup" -ForegroundColor White
Write-Host "Location: $Location" -ForegroundColor White
Write-Host "App ID: $appId" -ForegroundColor White
Write-Host ""
Write-Host "🔑 Credentials (save these securely):" -ForegroundColor Yellow
Write-Host ""
Write-Host "Connection String:" -ForegroundColor Cyan
Write-Host $connectionString -ForegroundColor White
Write-Host ""
Write-Host "Instrumentation Key:" -ForegroundColor Cyan
Write-Host $instrumentationKey -ForegroundColor White
Write-Host ""

# Save to file
$envFile = ".env.monitoring"
Write-Host "Saving credentials to $envFile..." -ForegroundColor Yellow
@"
# Azure Application Insights Credentials
# Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

NEXT_PUBLIC_APPLICATIONINSIGHTS_CONNECTION_STRING=$connectionString
APPLICATIONINSIGHTS_INSTRUMENTATION_KEY=$instrumentationKey
APPLICATIONINSIGHTS_APP_ID=$appId
"@ | Out-File -FilePath $envFile -Encoding UTF8

Write-Host "✓ Credentials saved to $envFile" -ForegroundColor Green
Write-Host ""

# Create alert rules
Write-Host "Creating alert rules..." -ForegroundColor Yellow

# Create action group for alerts
$actionGroupName = "doganhub-alerts"
Write-Host "Creating action group: $actionGroupName" -ForegroundColor Yellow

# Note: You'll need to configure email/SMS/webhook receivers manually or via additional commands
$actionGroup = az monitor action-group create `
    --name $actionGroupName `
    --resource-group $ResourceGroup `
    --short-name "DH-Alerts" `
    --output json 2>$null | ConvertFrom-Json

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Action group created" -ForegroundColor Green
} else {
    Write-Host "⚠ Action group might already exist or need manual configuration" -ForegroundColor Yellow
}
Write-Host ""

# Next steps
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Add connection string to your environment variables:" -ForegroundColor White
Write-Host "   - Copy from $envFile" -ForegroundColor Gray
Write-Host "   - Add to .env.local for local development" -ForegroundColor Gray
Write-Host "   - Add to GitHub Secrets for CI/CD" -ForegroundColor Gray
Write-Host "   - Add to Azure Container Apps environment variables" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Configure alert action group:" -ForegroundColor White
Write-Host "   az monitor action-group update --name $actionGroupName --resource-group $ResourceGroup \" -ForegroundColor Gray
Write-Host "     --add-action email admin alerts@doganhub.com" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Verify telemetry in Azure Portal:" -ForegroundColor White
Write-Host "   https://portal.azure.com/#@/resource$($appInsights.id)/overview" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Test telemetry:" -ForegroundColor White
Write-Host "   - Deploy your application with the connection string" -ForegroundColor Gray
Write-Host "   - Check Live Metrics in Application Insights" -ForegroundColor Gray
Write-Host "   - Run sample queries in Logs section" -ForegroundColor Gray
Write-Host ""

Write-Host "✅ Setup Complete!" -ForegroundColor Green
