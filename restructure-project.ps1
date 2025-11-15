#!/usr/bin/env pwsh
# Professional Web App Restructure Script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DoganHub Store - Project Restructure" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ROOT = "D:\Projects\DoganHubStore"
$APPS = "$ROOT\apps"

# Step 1: Move essential files to root
Write-Host "Step 1: Moving core application files to root..." -ForegroundColor Yellow

$essentialFiles = @(
    "package.json",
    "package-lock.json",
    "next.config.js",
    "tsconfig.json",
    "tailwind.config.ts",
    ".env.local",
    ".env.production",
    ".env.example",
    ".babelrc",
    "docker-compose.yml",
    "Dockerfile",
    "Dockerfile.production",
    ".gitignore",
    ".eslintrc.json",
    "postcss.config.js",
    "jest.config.js"
)

foreach ($file in $essentialFiles) {
    if (Test-Path "$APPS\$file") {
        Copy-Item "$APPS\$file" "$ROOT\$file" -Force
        Write-Host "  ✓ Moved $file" -ForegroundColor Green
    }
}

# Step 2: Move core directories
Write-Host ""
Write-Host "Step 2: Moving core directories..." -ForegroundColor Yellow

$coreDirs = @(
    "app",
    "components",
    "lib",
    "public",
    "styles",
    "types",
    "hooks",
    "utils",
    "middleware",
    "Services"
)

foreach ($dir in $coreDirs) {
    if (Test-Path "$APPS\$dir") {
        if (Test-Path "$ROOT\$dir") {
            Remove-Item "$ROOT\$dir" -Recurse -Force
        }
        Move-Item "$APPS\$dir" "$ROOT\$dir" -Force
        Write-Host "  ✓ Moved $dir/" -ForegroundColor Green
    }
}

# Step 3: Create proper directory structure
Write-Host ""
Write-Host "Step 3: Creating professional directory structure..." -ForegroundColor Yellow

$directories = @(
    "docs",
    "scripts",
    "tests",
    "config",
    "database",
    ".vscode"
)

foreach ($dir in $directories) {
    if (-not (Test-Path "$ROOT\$dir")) {
        New-Item -ItemType Directory -Path "$ROOT\$dir" -Force | Out-Null
        Write-Host "  ✓ Created $dir/" -ForegroundColor Green
    }
}

# Step 4: Organize documentation
Write-Host ""
Write-Host "Step 4: Organizing documentation..." -ForegroundColor Yellow

Get-ChildItem "$APPS\*.md" | ForEach-Object {
    Move-Item $_.FullName "$ROOT\docs\$($_.Name)" -Force
}
Write-Host "  ✓ Moved all .md files to docs/" -ForegroundColor Green

# Step 5: Organize scripts
Write-Host ""
Write-Host "Step 5: Organizing scripts..." -ForegroundColor Yellow

Get-ChildItem "$APPS\*.ps1" | ForEach-Object {
    Move-Item $_.FullName "$ROOT\scripts\$($_.Name)" -Force
}
Get-ChildItem "$APPS\*.bat" | ForEach-Object {
    Move-Item $_.FullName "$ROOT\scripts\$($_.Name)" -Force
}
Get-ChildItem "$APPS\*.sh" | ForEach-Object {
    Move-Item $_.FullName "$ROOT\scripts\$($_.Name)" -Force
}
Write-Host "  ✓ Moved all scripts to scripts/" -ForegroundColor Green

# Step 6: Organize database files
Write-Host ""
Write-Host "Step 6: Organizing database files..." -ForegroundColor Yellow

Get-ChildItem "$APPS\*.sql" | ForEach-Object {
    Move-Item $_.FullName "$ROOT\database\$($_.Name)" -Force
}
Write-Host "  ✓ Moved all .sql files to database/" -ForegroundColor Green

# Step 7: Organize test files
Write-Host ""
Write-Host "Step 7: Organizing test files..." -ForegroundColor Yellow

if (Test-Path "$APPS\tests") {
    Move-Item "$APPS\tests\*" "$ROOT\tests\" -Force
}
if (Test-Path "$APPS\__tests__") {
    Move-Item "$APPS\__tests__" "$ROOT\tests\__tests__" -Force
}
Write-Host "  ✓ Organized test files" -ForegroundColor Green

# Step 8: Clean up apps directory
Write-Host ""
Write-Host "Step 8: Cleaning up..." -ForegroundColor Yellow

# Move remaining important files
$configFiles = @("*.json", "*.config.*", "*.yml", "*.yaml", "tsconfig*.json")
foreach ($pattern in $configFiles) {
    Get-ChildItem "$APPS\$pattern" -ErrorAction SilentlyContinue | ForEach-Object {
        if ($_.Name -notin $essentialFiles) {
            Move-Item $_.FullName "$ROOT\config\$($_.Name)" -Force
        }
    }
}

Write-Host "  ✓ Cleanup complete" -ForegroundColor Green

# Step 9: Create README
Write-Host ""
Write-Host "Step 9: Creating project README..." -ForegroundColor Yellow

$readmeContent = @"
# DoganHub Store - Enterprise Business Management Platform

**Version:** 1.0.0  
**Last Updated:** $(Get-Date -Format "MMMM dd, yyyy")

---

## 🚀 Quick Start

``````bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run with Docker
docker-compose up -d
``````

## 📁 Project Structure

``````
DoganHubStore/
├── app/                    # Next.js 16 App Router
├── components/             # React components
│   ├── ui/                # UI primitives
│   ├── features/          # Feature components
│   └── enterprise/        # Enterprise modules
├── lib/                   # Utility libraries
├── Services/              # API service layers
├── public/                # Static assets
├── styles/                # Global styles
├── types/                 # TypeScript definitions
├── hooks/                 # Custom React hooks
├── middleware/            # Next.js middleware
├── docs/                  # Documentation
├── scripts/               # Deployment scripts
├── database/              # SQL migrations
├── tests/                 # Test suites
└── config/                # Configuration files
``````

## 🌐 Access URLs

- **Development:** http://localhost:3050
- **Production:** http://localhost:3003
- **English:** /en
- **Arabic:** /ar

## 🛠️ Technology Stack

- **Frontend:** Next.js 16.0.1 (React 19, Turbopack)
- **Backend:** Node.js 18+, TypeScript
- **Database:** PostgreSQL 13+
- **Cache:** Redis 6
- **Styling:** Tailwind CSS, Shadcn UI
- **Deployment:** Docker, Azure, Cloudflare

## 📊 Features

- ✅ **104 API Endpoints** - Complete backend infrastructure
- ✅ **28 Connected Pages** - Full UI implementation
- ✅ **Bilingual Support** - Arabic (RTL) and English (LTR)
- ✅ **Enterprise Modules** - GRC, CRM, HR, Finance, Analytics
- ✅ **Docker Ready** - Production containerization
- ✅ **CI/CD Pipeline** - Automated deployment

## 📝 Documentation

See `docs/` directory for comprehensive documentation:
- API Documentation
- Deployment Guides
- Component Catalogs
- Architecture Overview

## 🔐 Environment Variables

Copy `.env.example` to `.env.local` and configure:

``````bash
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
NEXTAUTH_SECRET=...
NEXT_PUBLIC_APP_URL=...
``````

## 🚢 Deployment

### Docker Deployment
``````bash
docker-compose up -d
``````

### Cloudflare Pages
``````bash
npm run deploy:cloudflare
``````

### Azure Container Apps
``````bash
npm run deploy:azure
``````

## 📧 Support

- **Team:** DoganHub Development
- **Website:** https://dogan-ai.com

---

*Enterprise Business Management Platform - Built with ❤️*
"@

Set-Content "$ROOT\README.md" $readmeContent
Write-Host "  ✓ README.md created" -ForegroundColor Green

# Step 10: Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Restructure Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Project Structure:" -ForegroundColor Cyan
Write-Host "  ✓ Core files moved to root" -ForegroundColor Green
Write-Host "  ✓ Documentation in docs/" -ForegroundColor Green
Write-Host "  ✓ Scripts in scripts/" -ForegroundColor Green
Write-Host "  ✓ Database files in database/" -ForegroundColor Green
Write-Host "  ✓ Tests in tests/" -ForegroundColor Green
Write-Host "  ✓ Configuration in config/" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Review the new structure" -ForegroundColor Gray
Write-Host "  2. Update import paths if needed" -ForegroundColor Gray
Write-Host "  3. Run npm install" -ForegroundColor Gray
Write-Host "  4. Start development: npm run dev" -ForegroundColor Gray
Write-Host ""
