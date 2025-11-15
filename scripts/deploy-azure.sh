#!/bin/bash
# Azure App Service Deployment Script
# DoganHub Store - Production Deployment

set -e

echo "======================================"
echo "Azure Deployment Script"
echo "DoganHub Store"
echo "======================================"

# Configuration
RESOURCE_GROUP="${AZURE_RESOURCE_GROUP:-DoganHub-RG}"
APP_NAME="${AZURE_APP_NAME:-doganhub-store}"
LOCATION="${AZURE_LOCATION:-eastus}"
SKU="${AZURE_SKU:-B1}"
RUNTIME="NODE|18-lts"

echo ""
echo "Configuration:"
echo "  Resource Group: $RESOURCE_GROUP"
echo "  App Name: $APP_NAME"
echo "  Location: $LOCATION"
echo "  SKU: $SKU"
echo ""

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "Error: Azure CLI is not installed"
    echo "Install from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Login to Azure (if not already logged in)
echo "[1/7] Checking Azure login status..."
if ! az account show &> /dev/null; then
    echo "Not logged in. Please login to Azure..."
    az login
fi

# Create resource group
echo ""
echo "[2/7] Creating resource group..."
az group create \
    --name $RESOURCE_GROUP \
    --location $LOCATION \
    --output table

# Create App Service Plan
echo ""
echo "[3/7] Creating App Service Plan..."
az appservice plan create \
    --name "${APP_NAME}-plan" \
    --resource-group $RESOURCE_GROUP \
    --location $LOCATION \
    --sku $SKU \
    --is-linux \
    --output table

# Create Web App
echo ""
echo "[4/7] Creating Web App..."
az webapp create \
    --name $APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --plan "${APP_NAME}-plan" \
    --runtime $RUNTIME \
    --output table

# Configure App Settings
echo ""
echo "[5/7] Configuring app settings..."
az webapp config appsettings set \
    --name $APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --settings \
        NODE_ENV=production \
        WEBSITE_NODE_DEFAULT_VERSION="18-lts" \
        SCM_DO_BUILD_DURING_DEPLOYMENT=true \
    --output table

# Configure startup command
echo ""
echo "[6/7] Configuring startup command..."
az webapp config set \
    --name $APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --startup-file "node_modules/.bin/next start" \
    --output table

# Deploy application
echo ""
echo "[7/7] Deploying application..."
az webapp up \
    --name $APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --location $LOCATION \
    --output table

# Get the URL
APP_URL=$(az webapp show \
    --name $APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --query defaultHostName \
    --output tsv)

echo ""
echo "======================================"
echo "Deployment Complete!"
echo "======================================"
echo ""
echo "Your app is running at: https://$APP_URL"
echo ""
echo "Next steps:"
echo "  1. Configure custom domain (optional)"
echo "  2. Set up SSL certificate"
echo "  3. Configure environment variables"
echo "  4. Set up database connection"
echo ""
