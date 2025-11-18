# Enterprise Document Processing - Complete Integration Guide

## 🎯 Overview

This document provides comprehensive instructions for integrating all enterprise services with the Document Processing Module:

- ✅ **Azure Services** (Storage, Cognitive Services, OpenAI)
- ✅ **Microsoft 365** (Outlook, OneDrive, SharePoint)
- ✅ **Gmail & Google Workspace**
- ✅ **SAP Integration**
- ✅ **OpenAI & Custom LLMs**
- ✅ **Local Folder Storage**

---

## 📋 Quick Setup Checklist

- [ ] Azure Account Setup
- [ ] Microsoft 365 Tenant Configuration
- [ ] Gmail OAuth Setup
- [ ] SAP System Preparation
- [ ] OpenAI API Key
- [ ] Environment Configuration
- [ ] Database Setup
- [ ] Service Testing
- [ ] Deployment

---

## 🔧 1. Azure Services Setup

### 1.1 Create Azure Storage Account

```bash
# Using Azure CLI
az storage account create \
  --name yourstorageaccount \
  --resource-group your-resource-group \
  --location eastus \
  --sku Standard_LRS

# Get connection string
az storage account show-connection-string \
  --name yourstorageaccount \
  --resource-group your-resource-group
```

**Add to `.env`:**
```
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=...
AZURE_STORAGE_ACCOUNT_NAME=yourstorageaccount
AZURE_STORAGE_ACCOUNT_KEY=your_account_key
```

### 1.2 Create Cognitive Services

```bash
# Form Recognizer (Document Analysis)
az cognitiveservices account create \
  --name your-form-recognizer \
  --resource-group your-resource-group \
  --kind FormRecognizer \
  --sku F0 \
  --location eastus

# Get endpoint and key
az cognitiveservices account keys list \
  --name your-form-recognizer \
  --resource-group your-resource-group
```

**Add to `.env`:**
```
AZURE_FORM_RECOGNIZER_ENDPOINT=https://your-form-recognizer.cognitiveservices.azure.com/
AZURE_FORM_RECOGNIZER_KEY=your_api_key

AZURE_TEXT_ANALYTICS_ENDPOINT=https://your-text-analytics.cognitiveservices.azure.com/
AZURE_TEXT_ANALYTICS_KEY=your_api_key

AZURE_TRANSLATOR_ENDPOINT=https://api.cognitive.microsofttranslator.com
AZURE_TRANSLATOR_KEY=your_api_key
```

### 1.3 Create Azure OpenAI Resource

```bash
# Create Azure OpenAI resource
az cognitiveservices account create \
  --name your-openai-resource \
  --resource-group your-resource-group \
  --kind OpenAI \
  --sku S0 \
  --location eastus

# Deploy model
az cognitiveservices account deployment create \
  --name your-openai-resource \
  --resource-group your-resource-group \
  --deployment-name gpt4-deployment \
  --model-name gpt-4 \
  --model-version "0613"
```

**Add to `.env`:**
```
AZURE_OPENAI_ENDPOINT=https://your-openai-resource.openai.azure.com/
AZURE_OPENAI_KEY=your_openai_key
AZURE_OPENAI_DEPLOYMENT_NAME=gpt4-deployment
```

### 1.4 Create Service Principal for Microsoft Graph

```bash
# Create service principal
az ad sp create-for-rbac \
  --name document-processing-sp \
  --role "Directory.ReadWrite.All" \
  --scopes "/subscriptions/your-subscription-id"
```

**Add to `.env`:**
```
MICROSOFT_TENANT_ID=your_tenant_id
MICROSOFT_CLIENT_ID=your_client_id
MICROSOFT_CLIENT_SECRET=your_client_secret
AZURE_SUBSCRIPTION_ID=your_subscription_id
AZURE_RESOURCE_GROUP=your_resource_group
```

---

## 📧 2. Gmail & Outlook Setup

### 2.1 Gmail OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project: `Document Processing`
3. Enable APIs:
   - Gmail API
   - Google Drive API
4. Create OAuth 2.0 Client ID (Desktop application)
5. Download credentials

**Add to `.env`:**
```
GMAIL_CLIENT_ID=your_client_id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your_client_secret
GMAIL_REDIRECT_URI=https://yourdomain.com/auth/gmail/callback
GMAIL_USER_EMAIL=your_email@gmail.com
```

### 2.2 Outlook/Office365 Setup

1. Go to [Azure AD App Registrations](https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade)
2. Register new application
3. Grant permissions:
   - Mail.Send
   - Mail.Read
   - Files.ReadWrite
   - Sites.ReadWrite.All
4. Create client secret

**Add to `.env`:**
```
OUTLOOK_CLIENT_ID=your_outlook_client_id
OUTLOOK_CLIENT_SECRET=your_outlook_client_secret
OUTLOOK_TENANT_ID=your_tenant_id
OUTLOOK_REDIRECT_URI=https://yourdomain.com/auth/outlook/callback
OUTLOOK_USER_EMAIL=your_email@domain.com

SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USERNAME=your_email@domain.com
SMTP_PASSWORD=your_app_password
```

---

## 📁 3. SharePoint & OneDrive Setup

### 3.1 Get SharePoint Site Details

```bash
# Using Microsoft Graph CLI
mgc sites list --all

# Get site ID
mgc sites get --site-id "contoso.sharepoint.com:/sites/yoursite"

# Get drive ID
mgc drives list --site-id "your_site_id"
```

### 3.2 Configure SharePoint Access

Grant the service principal these permissions:
- Sites.Manage.All
- Files.ReadWrite.All
- Directory.ReadWrite.All

**Add to `.env`:**
```
SHAREPOINT_SITE_URL=https://yourorg.sharepoint.com/sites/DocumentProcessing
SHAREPOINT_SITE_ID=your_site_id
SHAREPOINT_LIBRARY_NAME=Shared Documents
SHAREPOINT_DEFAULT_FOLDER=/DocumentProcessing

ONEDRIVE_DRIVE_ID=your_drive_id
ONEDRIVE_DEFAULT_FOLDER=/DocumentProcessing
```

---

## 💼 4. SAP Integration Setup

### 4.1 SAP OData Service Configuration

1. Enable SAP Gateway services
2. Create RFC function modules for:
   - Purchase Order creation
   - Invoice posting
   - Vendor master retrieval
   - Material master retrieval

3. Create OData services for:
   - `/odata/v4/PurchasingOrderService`
   - `/odata/v4/AccountingDocumentService`
   - `/odata/v4/VendorService`
   - `/odata/v4/MaterialService`

### 4.2 Create SAP User Account

```
SAP Console > SM04 (User Maintenance)

Username: DOC_PROCESSING
Password: Strong_Password_32_Chars
Roles: 
  - MM_BUYER (Purchasing)
  - FI_ACCOUNTANT (Finance)
  - SD_SALES (Sales) [Optional]
```

**Add to `.env`:**
```
SAP_API_GATEWAY_URL=https://sap-gateway.yourdomain.com:8243/api/v1
SAP_USERNAME=DOC_PROCESSING
SAP_PASSWORD=your_sap_password
SAP_CLIENT=100
SAP_LANGUAGE=EN
SAP_COMPANY_CODE=1000
SAP_DEFAULT_PLANT=1000
SAP_DEFAULT_STORAGE_LOCATION=0001
SAP_DEFAULT_PO_ORG=1000
SAP_DEFAULT_PO_GROUP=001
SAP_DEFAULT_GL_ACCOUNT=100000
SAP_DEFAULT_COST_CENTER=CC001
```

### 4.3 Test SAP Connection

```bash
curl -X GET \
  "https://sap-gateway.yourdomain.com:8243/api/v1/odata/v4/CompanyCodeService" \
  -u DOC_PROCESSING:password \
  -H "Accept: application/json"
```

---

## 🤖 5. OpenAI & LLM Setup

### 5.1 OpenAI Configuration

1. Go to [OpenAI Platform](https://platform.openai.com)
2. Create API key
3. Set billing and rate limits

**Add to `.env`:**
```
OPENAI_API_KEY=sk-your_openai_api_key
OPENAI_API_VERSION=2024-02-01
OPENAI_MODEL_DEFAULT=gpt-4
OPENAI_MODEL_FAST=gpt-3.5-turbo
OPENAI_TEMPERATURE=0.3
OPENAI_MAX_TOKENS=2000
```

### 5.2 Custom LLM Integration

For local or custom LLM deployments:

```json
{
  "CUSTOM_LLM_ENDPOINTS": {
    "local_llm": {
      "url": "http://llm-server:8000/api/generate",
      "apiKey": "your_local_llm_key",
      "headers": {
        "X-Custom-Header": "value"
      }
    },
    "anthropic_claude": {
      "url": "https://api.anthropic.com/v1/messages",
      "apiKey": "your_anthropic_key",
      "headers": {}
    }
  }
}
```

---

## 📁 6. Folder Storage Setup

### 6.1 Configure Local Storage

```bash
# Create storage directories
mkdir -p /var/document-processing/documents/{incoming,processed,archive,errors}

# Set permissions
chmod 755 /var/document-processing/documents
chown app:app /var/document-processing/documents
```

**Add to `.env`:**
```
FOLDER_STORAGE_BASE_PATH=/var/document-processing/documents
FOLDER_STORAGE_ARCHIVE_DAYS=90
FOLDER_STORAGE_MAX_SIZE_GB=1000
FOLDER_STORAGE_RETENTION_DAYS=365
FOLDER_STORAGE_ENCRYPTION_ENABLED=true
FOLDER_STORAGE_ENCRYPTION_KEY=your_encryption_key_min_32_chars
```

### 6.2 Network Folder Setup (UNC paths)

For Windows network folders:

```
FOLDER_STORAGE_BASE_PATH=\\server\share\documents
FOLDER_STORAGE_USERNAME=domain\username
FOLDER_STORAGE_PASSWORD=network_password
```

---

## 🗄️ 7. Database Setup

### 7.1 MongoDB Configuration

```bash
# Create MongoDB containers/instances
docker run -d \
  --name document-processing-db \
  -e MONGO_INITDB_ROOT_USERNAME=app_user \
  -e MONGO_INITDB_ROOT_PASSWORD=your_password \
  -p 27017:27017 \
  mongo:7.0

# Create databases and users
mongo admin --username root --password

> use document_processing
> db.createUser({
    user: "app_user",
    pwd: "your_password",
    roles: ["readWrite", "dbOwner"]
  })

> use n8n
> db.createUser({
    user: "n8n_user",
    pwd: "your_password",
    roles: ["readWrite", "dbOwner"]
  })
```

**Add to `.env`:**
```
DB_MONGODB_HOST=mongodb
DB_MONGODB_PORT=27017
DB_MONGODB_DATABASE=document_processing
DB_MONGODB_USERNAME=app_user
DB_MONGODB_PASSWORD=your_password
```

### 7.2 Redis Configuration

```bash
# Docker
docker run -d \
  --name document-processing-cache \
  -e REDIS_PASSWORD=your_password \
  -p 6379:6379 \
  redis:7-alpine redis-server --requirepass your_password
```

**Add to `.env`:**
```
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=your_password
```

---

## 🧪 8. Testing Services

### 8.1 Test Azure Connection

```bash
# Create test script: test-azure.js
const AzureService = require('./lib/services/azure-service');
const config = require('dotenv').config().parsed;

const azure = new AzureService(config);

// Test upload
const testFile = {
  filename: 'test.pdf',
  buffer: Buffer.from('test content'),
  size: 12,
  mimetype: 'application/pdf'
};

azure.uploadDocument(testFile, 'test-container')
  .then(result => console.log('✅ Azure: OK', result))
  .catch(error => console.error('❌ Azure: FAILED', error));
```

### 8.2 Test Email Connection

```bash
# test-email.js
const EmailService = require('./lib/services/email-service');
const config = require('dotenv').config().parsed;

const email = new EmailService(config);

email.sendEmailSMTP(
  'test@example.com',
  'Test Email',
  '<p>This is a test email</p>'
)
  .then(result => console.log('✅ Email: OK', result))
  .catch(error => console.error('❌ Email: FAILED', error));
```

### 8.3 Test SAP Connection

```bash
# test-sap.js
const SAPService = require('./lib/services/sap-service');
const config = require('dotenv').config().parsed;

const sap = new SAPService(config);

sap.getVendorData('1000')
  .then(result => console.log('✅ SAP: OK', result))
  .catch(error => console.error('❌ SAP: FAILED', error));
```

### 8.4 Run All Tests

```bash
npm run test
npm run test:integration
```

---

## 🚀 9. Deployment

### 9.1 Docker Deployment

```bash
# Build image
docker build -t document-processing:latest .

# Run container
docker-compose -f docker-compose.prod.yml up -d

# Check services
docker-compose logs -f document-processing
```

### 9.2 Kubernetes Deployment

```bash
# Create secrets
kubectl create secret generic document-processing-env \
  --from-env-file=.env \
  -n production

# Deploy
kubectl apply -f k8s-deployment.yaml -n production

# Verify
kubectl get pods -n production
kubectl logs -f deployment/document-processing -n production
```

### 9.3 Verify All Services

```bash
# Check health
curl -X GET https://yourdomain.com/health

# Check metrics
curl -X GET https://yourdomain.com/metrics

# Test API
curl -X POST https://yourdomain.com/api/documents/analyze \
  -H "Authorization: Bearer your_token" \
  -F "document=@test.pdf"
```

---

## 📋 Service Configuration Matrix

| Service | Required | Config Variables | Fallback |
|---------|----------|------------------|----------|
| Azure Storage | Yes | AZURE_STORAGE_* | Folder Storage |
| Azure Cognitive | Yes | AZURE_FORM_RECOGNIZER_* | OpenAI |
| Gmail | Optional | GMAIL_* | SMTP |
| Outlook | Optional | OUTLOOK_* | SMTP |
| SMTP | Optional | SMTP_* | None |
| SharePoint | Optional | SHAREPOINT_* | OneDrive |
| OneDrive | Optional | ONEDRIVE_* | Folder Storage |
| SAP | Optional | SAP_* | Database |
| OpenAI | Yes | OPENAI_* | Custom LLM |
| Custom LLM | Optional | CUSTOM_LLM_* | OpenAI |
| Folder Storage | Yes | FOLDER_STORAGE_* | None |

---

## 🔐 Security Best Practices

1. **Credentials Management**
   ```bash
   # Use environment variables or secrets manager
   # Never commit .env files
   # Rotate credentials every 90 days
   ```

2. **API Keys**
   ```bash
   # Generate strong API keys
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   
   # Store in Azure Key Vault or similar
   ```

3. **TLS/SSL**
   ```bash
   # Generate certificates
   openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365
   
   # Update .env
   TLS_ENABLED=true
   TLS_CERT_PATH=/etc/ssl/certs/server.crt
   TLS_KEY_PATH=/etc/ssl/private/server.key
   ```

4. **IP Whitelisting**
   ```bash
   SECURITY_IP_WHITELIST_ENABLED=true
   SECURITY_IP_WHITELIST=10.0.0.0/8,172.16.0.0/12
   ```

---

## 📊 Monitoring & Logging

### 9.1 Enable Prometheus Metrics

```bash
# Access metrics
curl http://localhost:9090/metrics

# View Grafana dashboard
# Navigate to: http://localhost:3000
# Username: admin
# Password: from .env GRAFANA_ADMIN_PASSWORD
```

### 9.2 Enable ELK Stack

```bash
# Elasticsearch
docker run -d -p 9200:9200 \
  -e "discovery.type=single-node" \
  docker.elastic.co/elasticsearch/elasticsearch:8.0.0

# Kibana
docker run -d -p 5601:5601 \
  -e "ELASTICSEARCH_HOSTS=http://elasticsearch:9200" \
  docker.elastic.co/kibana/kibana:8.0.0
```

---

## ✅ Verification Checklist

- [ ] All Azure services accessible
- [ ] Email services working
- [ ] SharePoint & OneDrive connected
- [ ] SAP system responding
- [ ] OpenAI API responding
- [ ] MongoDB connected
- [ ] Redis connected
- [ ] N8N workflows loaded
- [ ] Metrics collecting
- [ ] Logs being generated
- [ ] Backups running
- [ ] Health checks passing

---

## 🆘 Troubleshooting

### Connection Issues

```bash
# Test Azure
az storage blob list --container-name documents --account-name youraccount

# Test SAP
curl -u username:password https://sap-gateway:8243/api/v1/odata/v4/$metadata

# Test OpenAI
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models

# Test Email
node -e "require('./lib/services/email-service').testConnection()"
```

### Performance Issues

```bash
# Check MongoDB
db.stats()
db.collection.find().explain("executionStats")

# Check Redis
redis-cli info stats
redis-cli monitor

# Check Node.js
node --prof app.js
node --prof-process isolate-*.log > profile.txt
```

---

## 📞 Support & Resources

- [Azure Documentation](https://docs.microsoft.com/azure)
- [Microsoft Graph API](https://docs.microsoft.com/graph)
- [Gmail API](https://developers.google.com/gmail/api)
- [SAP OData](https://www.odata.org)
- [OpenAI Documentation](https://platform.openai.com/docs)

---

**Last Updated:** 2024  
**Version:** 2.0.0  
**Status:** Production Ready