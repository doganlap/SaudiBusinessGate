#!/bin/bash
# Cloudflare Pages Deployment Script
# DoganHub Store - Production Deployment

set -e

echo "======================================"
echo "Cloudflare Pages Deployment"
echo "DoganHub Store"
echo "======================================"

# Configuration
PROJECT_NAME="${CLOUDFLARE_PROJECT_NAME:-doganhub-store}"
ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID}"
API_TOKEN="${CLOUDFLARE_API_TOKEN}"

if [ -z "$ACCOUNT_ID" ] || [ -z "$API_TOKEN" ]; then
    echo "Error: CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN must be set"
    exit 1
fi

echo ""
echo "Configuration:"
echo "  Project: $PROJECT_NAME"
echo "  Account ID: ${ACCOUNT_ID:0:8}..."
echo ""

# Install Wrangler if not installed
if ! command -v wrangler &> /dev/null; then
    echo "[1/4] Installing Wrangler..."
    npm install -g wrangler
fi

# Build the application
echo ""
echo "[2/4] Building application..."
npm run build

# Deploy to Cloudflare Pages
echo ""
echo "[3/4] Deploying to Cloudflare Pages..."
wrangler pages deploy .next/standalone \
    --project-name=$PROJECT_NAME \
    --branch=main

# Get deployment URL
echo ""
echo "[4/4] Deployment complete!"
echo ""
echo "Your app is being deployed to Cloudflare Pages"
echo "Project: $PROJECT_NAME"
echo "URL: https://$PROJECT_NAME.pages.dev"
echo ""
