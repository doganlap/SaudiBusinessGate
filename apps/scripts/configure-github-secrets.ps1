# GitHub Secrets Configuration Script
# This script helps configure GitHub repository secrets using GitHub CLI

param(
    [Parameter(Mandatory=$false)]
    [string]$Repository = "DoganHubStore/DoganHubStore",
    
    [Parameter(Mandatory=$false)]
    [string]$SecretsFile = ".env.secrets",
    
    [Parameter(Mandatory=$false)]
    [string]$MonitoringFile = ".env.monitoring"
)

Write-Host "🔐 GitHub Secrets Configuration" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check if GitHub CLI is installed
Write-Host "Checking GitHub CLI installation..." -ForegroundColor Yellow
try {
    $ghVersion = gh --version
    Write-Host "✓ GitHub CLI installed" -ForegroundColor Green
} catch {
    Write-Host "✗ GitHub CLI not found" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install GitHub CLI:" -ForegroundColor Yellow
    Write-Host "  Windows: winget install --id GitHub.cli" -ForegroundColor Gray
    Write-Host "  Or download from: https://cli.github.com/" -ForegroundColor Gray
    Write-Host ""
    Write-Host "After installation, run: gh auth login" -ForegroundColor Yellow
    exit 1
}

# Check if authenticated
Write-Host "Checking GitHub authentication..." -ForegroundColor Yellow
$authStatus = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Not authenticated with GitHub" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please authenticate with GitHub CLI:" -ForegroundColor Yellow
    Write-Host "  gh auth login" -ForegroundColor Gray
    Write-Host ""
    exit 1
}
Write-Host "✓ Authenticated with GitHub" -ForegroundColor Green
Write-Host ""

# Check repository access
Write-Host "Checking repository access: $Repository..." -ForegroundColor Yellow
$repoCheck = gh repo view $Repository 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Cannot access repository: $Repository" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please check:" -ForegroundColor Yellow
    Write-Host "  1. Repository name is correct (owner/repo)" -ForegroundColor Gray
    Write-Host "  2. You have admin access to the repository" -ForegroundColor Gray
    Write-Host "  3. GitHub CLI is authenticated with correct account" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Current authenticated user:" -ForegroundColor Yellow
    gh api user --jq .login
    Write-Host ""
    exit 1
}
Write-Host "✓ Repository access confirmed" -ForegroundColor Green
Write-Host ""

# Collect secrets to configure
Write-Host "📋 Collecting secrets to configure..." -ForegroundColor Yellow
Write-Host ""

$secretsToAdd = @{}

# Read from .env.secrets if exists
if (Test-Path $SecretsFile) {
    Write-Host "Reading from $SecretsFile..." -ForegroundColor Gray
    $content = Get-Content $SecretsFile -Raw
    $lines = $content -split "`n" | Where-Object { $_ -match "^[A-Z_]+=.+" }
    
    foreach ($line in $lines) {
        if ($line -match "^([A-Z_]+)=(.+)$") {
            $key = $matches[1]
            $value = $matches[2].Trim()
            $secretsToAdd[$key] = $value
        }
    }
    Write-Host "  ✓ Found $($secretsToAdd.Count) secrets" -ForegroundColor Green
}

# Read from .env.monitoring if exists
if (Test-Path $MonitoringFile) {
    Write-Host "Reading from $MonitoringFile..." -ForegroundColor Gray
    $content = Get-Content $MonitoringFile -Raw
    $lines = $content -split "`n" | Where-Object { $_ -match "^[A-Z_]+=.+" }
    
    $monitoringCount = 0
    foreach ($line in $lines) {
        if ($line -match "^([A-Z_]+)=(.+)$") {
            $key = $matches[1]
            $value = $matches[2].Trim()
            $secretsToAdd[$key] = $value
            $monitoringCount++
        }
    }
    Write-Host "  ✓ Found $monitoringCount monitoring secrets" -ForegroundColor Green
}

Write-Host ""

# Prompt for additional required secrets
Write-Host "🔑 Additional Required Secrets" -ForegroundColor Yellow
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "The following secrets need to be configured manually." -ForegroundColor White
Write-Host "Press Enter to skip any secret you want to configure later." -ForegroundColor Gray
Write-Host ""

# Azure credentials
Write-Host "Azure Credentials:" -ForegroundColor Cyan
Write-Host "Run this command to get the value:" -ForegroundColor Gray
Write-Host '  az ad sp create-for-rbac --name "DoganHub-GitHub" --role contributor --sdk-auth' -ForegroundColor DarkGray
Write-Host ""
$azureCredentials = Read-Host "AZURE_CREDENTIALS (JSON)"
if ($azureCredentials) { $secretsToAdd["AZURE_CREDENTIALS"] = $azureCredentials }

# ACR credentials
Write-Host ""
Write-Host "Azure Container Registry:" -ForegroundColor Cyan
$acrName = Read-Host "ACR Name (e.g., doganhubstore)"
if ($acrName) {
    Write-Host "Getting ACR credentials..." -ForegroundColor Gray
    $acrLoginServer = az acr show --name $acrName --query loginServer -o tsv 2>$null
    $acrUsername = az acr credential show --name $acrName --query username -o tsv 2>$null
    $acrPassword = az acr credential show --name $acrName --query "passwords[0].value" -o tsv 2>$null
    
    if ($acrLoginServer) {
        $secretsToAdd["AZURE_CONTAINER_REGISTRY"] = $acrLoginServer
        Write-Host "  ✓ AZURE_CONTAINER_REGISTRY: $acrLoginServer" -ForegroundColor Green
    }
    if ($acrUsername) {
        $secretsToAdd["AZURE_CONTAINER_REGISTRY_USERNAME"] = $acrUsername
        Write-Host "  ✓ AZURE_CONTAINER_REGISTRY_USERNAME: $acrUsername" -ForegroundColor Green
    }
    if ($acrPassword) {
        $secretsToAdd["AZURE_CONTAINER_REGISTRY_PASSWORD"] = $acrPassword
        Write-Host "  ✓ AZURE_CONTAINER_REGISTRY_PASSWORD: ****" -ForegroundColor Green
    }
}

# Database URLs
Write-Host ""
Write-Host "Database Connections:" -ForegroundColor Cyan
$dbStaging = Read-Host "DATABASE_URL_STAGING (PostgreSQL connection string)"
if ($dbStaging) { $secretsToAdd["DATABASE_URL_STAGING"] = $dbStaging }

$dbProduction = Read-Host "DATABASE_URL_PRODUCTION (PostgreSQL connection string)"
if ($dbProduction) { $secretsToAdd["DATABASE_URL_PRODUCTION"] = $dbProduction }

# Sentry
Write-Host ""
Write-Host "Sentry Error Tracking:" -ForegroundColor Cyan
Write-Host "Create project at: https://sentry.io" -ForegroundColor Gray
$sentryDsn = Read-Host "SENTRY_DSN (from Sentry project settings)"
if ($sentryDsn) {
    $secretsToAdd["SENTRY_DSN"] = $sentryDsn
    $secretsToAdd["NEXT_PUBLIC_SENTRY_DSN"] = $sentryDsn
}

# Slack webhook
Write-Host ""
Write-Host "Slack Notifications:" -ForegroundColor Cyan
Write-Host "Create webhook at: https://api.slack.com/apps" -ForegroundColor Gray
$slackWebhook = Read-Host "SLACK_WEBHOOK"
if ($slackWebhook) { $secretsToAdd["SLACK_WEBHOOK"] = $slackWebhook }

# Codecov
Write-Host ""
Write-Host "Codecov Token:" -ForegroundColor Cyan
Write-Host "Get token from: https://codecov.io" -ForegroundColor Gray
$codecovToken = Read-Host "CODECOV_TOKEN"
if ($codecovToken) { $secretsToAdd["CODECOV_TOKEN"] = $codecovToken }

Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "📤 Uploading Secrets to GitHub" -ForegroundColor Yellow
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

$uploadedCount = 0
$failedSecrets = @()

foreach ($secretName in $secretsToAdd.Keys) {
    $secretValue = $secretsToAdd[$secretName]
    
    Write-Host "  Uploading $secretName..." -ForegroundColor Gray
    
    # Use GitHub CLI to set secret
    $result = echo $secretValue | gh secret set $secretName --repo $Repository 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ $secretName uploaded" -ForegroundColor Green
        $uploadedCount++
    } else {
        Write-Host "  ✗ Failed to upload $secretName" -ForegroundColor Red
        $failedSecrets += $secretName
    }
}

Write-Host ""
Write-Host "✓ Uploaded $uploadedCount/$($secretsToAdd.Count) secrets" -ForegroundColor Green

if ($failedSecrets.Count -gt 0) {
    Write-Host "⚠ Failed to upload: $($failedSecrets -join ', ')" -ForegroundColor Yellow
}
Write-Host ""

# Create environments
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "🌍 Creating GitHub Environments" -ForegroundColor Yellow
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Creating 'staging' environment..." -ForegroundColor Gray
gh api repos/$Repository/environments/staging --method PUT --silent 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Staging environment created" -ForegroundColor Green
} else {
    Write-Host "⚠ Could not create staging environment (may already exist)" -ForegroundColor Yellow
}

Write-Host "Creating 'production' environment..." -ForegroundColor Gray
gh api repos/$Repository/environments/production --method PUT --silent 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Production environment created" -ForegroundColor Green
} else {
    Write-Host "⚠ Could not create production environment (may already exist)" -ForegroundColor Yellow
}

Write-Host ""

# Summary
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "✅ GitHub Configuration Complete" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Summary:" -ForegroundColor Yellow
Write-Host "  Secrets uploaded: $uploadedCount" -ForegroundColor White
Write-Host "  Environments created: staging, production" -ForegroundColor White
Write-Host ""

Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Verify secrets in GitHub:" -ForegroundColor White
Write-Host "   https://github.com/$Repository/settings/secrets/actions" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Configure branch protection:" -ForegroundColor White
Write-Host "   https://github.com/$Repository/settings/branches" -ForegroundColor Gray
Write-Host "   - Protect 'main' branch" -ForegroundColor Gray
Write-Host "   - Require pull request reviews" -ForegroundColor Gray
Write-Host "   - Require status checks" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Configure environment protection:" -ForegroundColor White
Write-Host "   https://github.com/$Repository/settings/environments" -ForegroundColor Gray
Write-Host "   - Add reviewers for production deployments" -ForegroundColor Gray
Write-Host "   - Set deployment branch patterns" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Test CI/CD pipeline:" -ForegroundColor White
Write-Host "   - Create a test branch" -ForegroundColor Gray
Write-Host "   - Make a commit and push" -ForegroundColor Gray
Write-Host "   - Create pull request to develop" -ForegroundColor Gray
Write-Host "   - Verify Actions run successfully" -ForegroundColor Gray
Write-Host ""

if ($failedSecrets.Count -gt 0) {
    Write-Host "⚠ Some secrets failed to upload. Please add them manually:" -ForegroundColor Yellow
    foreach ($secret in $failedSecrets) {
        Write-Host "  - $secret" -ForegroundColor Gray
    }
    Write-Host ""
}

Write-Host "✅ Configuration Complete!" -ForegroundColor Green
Write-Host ""
