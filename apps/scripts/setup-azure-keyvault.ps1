# Azure Key Vault Setup and Secret Migration Script
# This script creates Key Vault and migrates secrets from .env.secrets

param(
    [Parameter(Mandatory=$false)]
    [string]$ResourceGroup = "SaudiStoreProd",
    
    [Parameter(Mandatory=$false)]
    [string]$Location = "eastus",
    
    [Parameter(Mandatory=$false)]
    [string]$KeyVaultName = "saudistore-kv",
    
    [Parameter(Mandatory=$false)]
    [string]$SecretsFile = ".env.secrets"
)

Write-Host "🔐 Azure Key Vault Setup & Secret Migration" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
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
$currentUserId = $accountInfo.user.name
Write-Host ""

# Check if secrets file exists
if (-not (Test-Path $SecretsFile)) {
    Write-Host "✗ Secrets file not found: $SecretsFile" -ForegroundColor Red
    Write-Host "Please run 'node scripts/generate-secrets.js' first" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ Found secrets file: $SecretsFile" -ForegroundColor Green
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

# Create Key Vault (name must be globally unique)
Write-Host "Creating Key Vault: $KeyVaultName" -ForegroundColor Yellow
Write-Host "Note: Key Vault names must be globally unique" -ForegroundColor Gray

$keyVault = az keyvault create `
    --name $KeyVaultName `
    --resource-group $ResourceGroup `
    --location $Location `
    --enable-rbac-authorization false `
    --output json 2>$null | ConvertFrom-Json

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Key Vault created successfully" -ForegroundColor Green
    $vaultUri = $keyVault.properties.vaultUri
} else {
    # Key Vault might already exist
    Write-Host "Key Vault might exist or name taken, retrieving..." -ForegroundColor Yellow
    $keyVault = az keyvault show `
        --name $KeyVaultName `
        --resource-group $ResourceGroup `
        --output json 2>$null | ConvertFrom-Json
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Using existing Key Vault" -ForegroundColor Green
        $vaultUri = $keyVault.properties.vaultUri
    } else {
        Write-Host "✗ Failed to create/retrieve Key Vault" -ForegroundColor Red
        Write-Host "Try a different name (must be globally unique)" -ForegroundColor Yellow
        exit 1
    }
}
Write-Host ""

# Get current user object ID for access policy
Write-Host "Setting up access policies..." -ForegroundColor Yellow
$currentUser = az ad signed-in-user show --output json | ConvertFrom-Json
$objectId = $currentUser.id

# Set access policy for current user
az keyvault set-policy `
    --name $KeyVaultName `
    --object-id $objectId `
    --secret-permissions get list set delete backup restore recover purge `
    --output none

Write-Host "✓ Access policy configured for current user" -ForegroundColor Green
Write-Host ""

# Parse secrets from .env.secrets file
Write-Host "Reading secrets from $SecretsFile..." -ForegroundColor Yellow
$secretsContent = Get-Content $SecretsFile -Raw
$secretLines = $secretsContent -split "`n" | Where-Object { $_ -match "^[A-Z_]+=.+" }

$secrets = @{}
foreach ($line in $secretLines) {
    if ($line -match "^([A-Z_]+)=(.+)$") {
        $key = $matches[1]
        $value = $matches[2].Trim()
        $secrets[$key] = $value
    }
}

Write-Host "✓ Found $($secrets.Count) secrets to migrate" -ForegroundColor Green
Write-Host ""

# Migrate secrets to Key Vault
Write-Host "Migrating secrets to Key Vault..." -ForegroundColor Yellow
Write-Host ""

$migratedCount = 0
$failedSecrets = @()

foreach ($secretName in $secrets.Keys) {
    $secretValue = $secrets[$secretName]
    
    # Convert secret name to Key Vault format (lowercase, hyphens)
    $kvSecretName = $secretName.ToLower().Replace("_", "-")
    
    Write-Host "  Migrating $secretName -> $kvSecretName..." -ForegroundColor Gray
    
    $result = az keyvault secret set `
        --vault-name $KeyVaultName `
        --name $kvSecretName `
        --value $secretValue `
        --output none 2>$null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ $kvSecretName migrated" -ForegroundColor Green
        $migratedCount++
    } else {
        Write-Host "  ✗ Failed to migrate $kvSecretName" -ForegroundColor Red
        $failedSecrets += $secretName
    }
}

Write-Host ""
Write-Host "✓ Migrated $migratedCount/$($secrets.Count) secrets" -ForegroundColor Green

if ($failedSecrets.Count -gt 0) {
    Write-Host "⚠ Failed to migrate: $($failedSecrets -join ', ')" -ForegroundColor Yellow
}
Write-Host ""

# Generate reference configuration
Write-Host "Generating Key Vault reference configuration..." -ForegroundColor Yellow

$kvReferences = @"
# Azure Key Vault References
# Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
# 
# Use these references in your application configuration
# Format: @Microsoft.KeyVault(SecretUri={vaultUri}secrets/{secret-name}/)

"@

foreach ($secretName in $secrets.Keys) {
    $kvSecretName = $secretName.ToLower().Replace("_", "-")
    $kvReferences += "`n$secretName=@Microsoft.KeyVault(SecretUri=${vaultUri}secrets/${kvSecretName}/)"
}

$kvReferencesFile = ".env.keyvault-references"
$kvReferences | Out-File -FilePath $kvReferencesFile -Encoding UTF8
Write-Host "✓ Key Vault references saved to $kvReferencesFile" -ForegroundColor Green
Write-Host ""

# Generate Azure Container Apps configuration
Write-Host "Generating Azure Container Apps commands..." -ForegroundColor Yellow

$containerAppCommands = @"
# Azure Container Apps Environment Variables Configuration
# Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
#
# Run these commands to configure your Container App with Key Vault secrets

# Enable managed identity for Container App
az containerapp identity assign \
  --name doganhub-app \
  --resource-group $ResourceGroup \
  --system-assigned

# Get the managed identity principal ID
PRINCIPAL_ID=`$(az containerapp show \
  --name doganhub-app \
  --resource-group $ResourceGroup \
  --query identity.principalId -o tsv)

# Grant Key Vault access to managed identity
az keyvault set-policy \
  --name $KeyVaultName \
  --object-id `$PRINCIPAL_ID \
  --secret-permissions get list

# Update Container App with Key Vault references
az containerapp update \
  --name doganhub-app \
  --resource-group $ResourceGroup \
  --set-env-vars \
"@

foreach ($secretName in $secrets.Keys) {
    $kvSecretName = $secretName.ToLower().Replace("_", "-")
    $containerAppCommands += "`n    $secretName=secretref:$kvSecretName \"
}

$containerAppCommands += @"


# Configure secrets from Key Vault
az containerapp secret set \
  --name doganhub-app \
  --resource-group $ResourceGroup \
  --secrets \
"@

foreach ($secretName in $secrets.Keys) {
    $kvSecretName = $secretName.ToLower().Replace("_", "-")
    $containerAppCommands += "`n    $kvSecretName=keyvaultref:${vaultUri}secrets/${kvSecretName}/,identityref:system \"
}

$containerAppFile = "azure-container-app-keyvault-setup.sh"
$containerAppCommands | Out-File -FilePath $containerAppFile -Encoding UTF8
Write-Host "✓ Container App commands saved to $containerAppFile" -ForegroundColor Green
Write-Host ""

# Display results
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "✅ Key Vault Setup Complete" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔐 Key Vault Details:" -ForegroundColor Yellow
Write-Host "Name: $KeyVaultName" -ForegroundColor White
Write-Host "Resource Group: $ResourceGroup" -ForegroundColor White
Write-Host "Location: $Location" -ForegroundColor White
Write-Host "Vault URI: $vaultUri" -ForegroundColor White
Write-Host "Secrets Migrated: $migratedCount" -ForegroundColor White
Write-Host ""

Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Configure Azure Container Apps:" -ForegroundColor White
Write-Host "   bash $containerAppFile" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Update GitHub Secrets:" -ForegroundColor White
Write-Host "   Add these to GitHub repository secrets:" -ForegroundColor Gray
Write-Host "   - AZURE_KEY_VAULT_NAME: $KeyVaultName" -ForegroundColor Gray
Write-Host "   - AZURE_KEY_VAULT_URI: $vaultUri" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Update local development:" -ForegroundColor White
Write-Host "   Keep using .env.local with actual secret values" -ForegroundColor Gray
Write-Host "   Production will use Key Vault references" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Test Key Vault access:" -ForegroundColor White
Write-Host "   az keyvault secret show --vault-name $KeyVaultName --name jwt-secret" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Set up secret rotation:" -ForegroundColor White
Write-Host "   Configure automatic secret rotation in Azure Portal" -ForegroundColor Gray
Write-Host "   Recommended: Rotate secrets every 90 days" -ForegroundColor Gray
Write-Host ""
Write-Host "6. Secure the secrets file:" -ForegroundColor White
Write-Host "   ⚠ Delete .env.secrets after verifying Key Vault migration" -ForegroundColor Yellow
Write-Host "   rm .env.secrets" -ForegroundColor Gray
Write-Host ""

Write-Host "✅ Migration Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🔗 Access Key Vault in Azure Portal:" -ForegroundColor Cyan
Write-Host "https://portal.azure.com/#@/resource$($keyVault.id)/overview" -ForegroundColor White
Write-Host ""
