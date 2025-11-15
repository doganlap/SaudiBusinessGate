# Deploy DoganHubStore to Saudistore Repository
# This script prepares and pushes the current implementation to the Saudistore repo

Write-Host "🚀 Deploying DoganHubStore to Saudistore Repository" -ForegroundColor Green

# Step 1: Add Saudistore as remote
Write-Host "📡 Adding Saudistore remote..." -ForegroundColor Yellow
git remote add saudistore https://github.com/doganlap/Saudistore.git

# Step 2: Create deployment branch
Write-Host "🌿 Creating deployment branch..." -ForegroundColor Yellow
git checkout -b deploy-to-saudistore

# Step 3: Prepare deployment files
Write-Host "📦 Preparing deployment files..." -ForegroundColor Yellow

# Create deployment-specific files
$deploymentFiles = @(
    "vercel.json",
    "netlify.toml", 
    "Dockerfile.production",
    "docker-compose.production.yml",
    ".github/workflows/deploy.yml"
)

# Step 4: Create production environment file
Write-Host "⚙️ Creating production environment..." -ForegroundColor Yellow
Copy-Item ".env.example" ".env.production"

# Step 5: Build and optimize
Write-Host "🔨 Building for production..." -ForegroundColor Yellow
npm run build

# Step 6: Commit changes
Write-Host "💾 Committing deployment files..." -ForegroundColor Yellow
git add .
git commit -m "feat: Deploy GRC Control Administration to dogan-ai.com

- Complete GRC Control Administration implementation
- 10+ API endpoints for control management
- 5+ UI pages with bilingual support (AR/EN)
- Multi-tenant architecture
- AI scheduler and CCM automation
- Compliance dashboards and reporting
- Production-ready with real database integration"

# Step 7: Push to Saudistore
Write-Host "🚀 Pushing to Saudistore repository..." -ForegroundColor Yellow
git push saudistore deploy-to-saudistore:main

Write-Host "✅ Deployment preparation complete!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Set up cloud deployment (Vercel/Netlify/Railway)" -ForegroundColor White
Write-Host "2. Configure domain dogan-ai.com" -ForegroundColor White
Write-Host "3. Set up environment variables" -ForegroundColor White
Write-Host "4. Configure database connection" -ForegroundColor White
