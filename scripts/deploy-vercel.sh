#!/bin/bash
# Vercel Deployment Script
# DoganHub Store - Production Deployment

set -e

echo "======================================"
echo "Vercel Deployment"
echo "DoganHub Store"
echo "======================================"

# Configuration
PROJECT_NAME="${VERCEL_PROJECT_NAME:-doganhub-store}"
ORG_ID="${VERCEL_ORG_ID}"
TOKEN="${VERCEL_TOKEN}"

if [ -z "$TOKEN" ]; then
    echo "Error: VERCEL_TOKEN must be set"
    exit 1
fi

echo ""
echo "Configuration:"
echo "  Project: $PROJECT_NAME"
echo ""

# Install Vercel CLI if not installed
if ! command -v vercel &> /dev/null; then
    echo "[1/3] Installing Vercel CLI..."
    npm install -g vercel
fi

# Link project
echo ""
echo "[2/3] Linking project..."
vercel link --yes --token=$TOKEN

# Deploy to production
echo ""
echo "[3/3] Deploying to production..."
vercel --prod --token=$TOKEN

echo ""
echo "======================================"
echo "Deployment Complete!"
echo "======================================"
echo ""
echo "Your app is now live on Vercel"
echo "Run 'vercel --help' for more commands"
echo ""
