# Document Processing Module for n8n

Production-ready document processing automation module with 5 interconnected workflows for complete document lifecycle management.

## Features

### ✅ Core Workflows

1. **Document Processor API** - RESTful API for document processing
   - POST endpoint: Upload and process documents
   - GET endpoint: Retrieve processed documents
   - Support for: invoices, contracts, reports, letters, forms
   - Automatic field extraction and categorization
   - MongoDB storage with full audit trail

2. **Document Processor UI** - Web interface for document management
   - Document upload interface
   - Library browser with search/filter
   - Processing results viewer
   - Analytics dashboard

3. **Document Analyzer** - Automated analysis and reporting
   - Scheduled analysis (every 15 minutes)
   - Document statistics and trends
   - Slack notifications with formatted reports
   - Google Sheets integration for historical tracking

4. **Document Transformer** - Format conversion service
   - Bidirectional format conversion
   - Supported formats: JSON, XML, YAML, CSV, Markdown, HTML, Text
   - Input validation and error handling
   - MongoDB storage of transformations

5. **Invoice Generator** - Automated invoice workflow
   - PDF generation from templates
   - Google Drive storage
   - Email delivery
   - Accounting system integration
   - Slack notifications

## Technology Stack

- **Automation Engine**: n8n (open-source workflow automation)
- **Database**: MongoDB (document storage)
- **File Storage**: Google Drive
- **Messaging**: Slack
- **Email**: SMTP
- **Container**: Docker + Docker Compose
- **Orchestration**: Kubernetes (optional)

## Prerequisites

- Node.js 16+ or Docker
- MongoDB (local or cloud)
- n8n instance
- Optional: Google Drive, Slack, SMTP credentials

## Quick Start

### Option 1: Local Installation

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Validate configuration
npm run validate-config

# Import workflows
npm run import-workflows

# Start n8n
npm start
```

Access n8n at: http://localhost:5678

### Option 2: Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f n8n

# Stop services
docker-compose down
```

### Option 3: Kubernetes

```bash
# Deploy to Kubernetes cluster
npm run deploy:k8s

# Check deployment status
kubectl get pods -l app=n8n-document-processing

# View logs
kubectl logs -f deployment/n8n-document-processing
```

## Configuration

### Environment Variables

```env
# Database
DB_MONGODB_HOST=localhost
DB_MONGODB_PORT=27017
DB_MONGODB_DATABASE=document_processing
DB_MONGODB_USERNAME=
DB_MONGODB_PASSWORD=

# n8n
N8N_PORT=5678
N8N_HOST=localhost
N8N_PROTOCOL=http
N8N_WEBHOOK_URL=http://localhost:5678/

# Credentials
SLACK_BOT_TOKEN=xoxb-...
GOOGLE_DRIVE_API_KEY=...
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=notifications@example.com
SMTP_PASSWORD=...

# Monitoring
LOG_LEVEL=info
LOG_FORMAT=json
```

## API Documentation

### Document Processor API Endpoints

#### POST /webhook/document-processor-api

Process a new document.

**Request:**
```bash
curl -X POST http://localhost:5678/webhook/document-processor-api \
  -H "Content-Type: application/json" \
  -d '{
    "documentType": "invoice",
    "content": "Invoice #12345\nDate: 2024-01-15\nAmount: $1,250.00",
    "metadata": {
      "source": "email",
      "sender": "vendor@example.com"
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "documentId": "DOC-1705315600000-456",
  "message": "Document processed successfully",
  "processingResults": {
    "extracted_fields": {
      "invoiceNumber": "INV-2024010001",
      "date": "2024-01-15",
      "amount": 1250.00,
      "vendor": "Example Vendor"
    },
    "category": "business_expense"
  }
}
```

#### GET /webhook/document-processor-api

Retrieve processed documents.

**Request:**
```bash
curl -X GET http://localhost:5678/webhook/document-processor-api
```

**Response:**
```json
{
  "success": true,
  "documents": [
    {
      "documentId": "DOC-1705315600000-456",
      "documentType": "invoice",
      "timestamp": "2024-01-15T10:30:00Z",
      "processingResults": {...}
    }
  ]
}
```

### Document Transformer Endpoints

#### POST /webhook/transform

Transform document between formats.

**Request:**
```bash
curl -X POST http://localhost:5678/webhook/transform \
  -H "Content-Type: application/json" \
  -d '{
    "sourceFormat": "json",
    "targetFormat": "csv",
    "content": "{\"name\": \"John\", \"email\": \"john@example.com\"}"
  }'
```

### Invoice Generator Endpoints

#### POST /webhook/generate-invoice

Generate and send invoice.

**Request:**
```bash
curl -X POST http://localhost:5678/webhook/generate-invoice \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Acme Corp",
    "customerEmail": "billing@acme.com",
    "items": [
      {"description": "Consulting", "quantity": 10, "unitPrice": 150},
      {"description": "Development", "quantity": 5, "unitPrice": 200}
    ],
    "taxRate": 10,
    "dueDate": "2024-02-15"
  }'
```

## Database Schema

### Collections

#### processed_documents
```json
{
  "_id": ObjectId,
  "documentId": "DOC-...",
  "documentType": "invoice|contract|report|letter|form",
  "content": "...",
  "processingResults": {...},
  "processingMetadata": {
    "processingTime": 1500,
    "processingDate": "2024-01-15T10:30:00Z",
    "processorVersion": "1.0.0"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### analytics
```json
{
  "_id": "document_analytics",
  "timestamp": "2024-01-15T10:45:00Z",
  "typeStats": {
    "invoice": {"count": 150, "averageProcessingTime": 1200},
    "contract": {"count": 45, "averageProcessingTime": 2100}
  },
  "overallStats": {
    "totalDocuments": 250,
    "documentTypeDistribution": [...]
  }
}
```

## Deployment Guide

### Production Checklist

- [ ] Environment variables configured
- [ ] MongoDB credentials verified
- [ ] All external credentials (Slack, Google, SMTP) configured
- [ ] SSL/TLS certificates installed
- [ ] Logging and monitoring configured
- [ ] Backup strategy implemented
- [ ] Load testing completed
- [ ] Security audit passed

### Step 1: Prepare Infrastructure

```bash
# Create MongoDB database and collections
docker run -d \
  --name mongodb \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  -p 27017:27017 \
  mongo:latest

# Create collections and indexes
mongosh mongodb://admin:password@localhost:27017/document_processing <<EOF
db.createCollection("processed_documents")
db.createCollection("analytics")
db.processed_documents.createIndex({ "timestamp": -1 })
db.processed_documents.createIndex({ "documentType": 1 })
db.analytics.createIndex({ "timestamp": -1 })
EOF
```

### Step 2: Deploy n8n

```bash
# Using Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# Using Kubernetes
kubectl apply -f k8s-deployment.prod.yaml
```

### Step 3: Import Workflows

```bash
# Validate configuration
npm run validate-config

# Import all workflows
npm run import-workflows
```

### Step 4: Configure Credentials

Access n8n UI at http://localhost:5678:

1. Go to Credentials
2. Create new credentials for:
   - MongoDB
   - Slack
   - Google Drive
   - SMTP

3. Activate all workflows in Settings

### Step 5: Enable Monitoring

```bash
# Start monitoring services
docker-compose -f docker-compose.monitoring.yml up -d

# Access Prometheus: http://localhost:9090
# Access Grafana: http://localhost:3000
```

## Monitoring & Logging

### Health Checks

```bash
# Check n8n health
curl http://localhost:5678/health

# Check MongoDB
mongosh mongodb://admin:password@localhost:27017/admin --eval "db.adminCommand('ping')"
```

### Metrics Tracked

- Document processing throughput (docs/minute)
- Average processing time per document type
- Error rate and error types
- Workflow execution count and duration
- Database query performance
- API response times

### Log Files

- n8n logs: `/home/node/.n8n/logs/`
- MongoDB logs: `docker logs mongodb`
- Application logs: `logs/app.json`

## Troubleshooting

### Issue: MongoDB Connection Failed

```bash
# Verify MongoDB is running
docker ps | grep mongodb

# Test connection
mongosh mongodb://user:password@host:27017

# Check credentials in .env
grep DB_MONGODB .env
```

### Issue: Workflows Not Triggering

1. Verify workflow is activated in n8n UI
2. Check webhook URL: http://localhost:5678/webhook/[workflow-name]
3. Test webhook: `curl -X POST http://localhost:5678/webhook/[workflow-name]`
4. Review n8n logs: `docker logs n8n`

### Issue: Slow Document Processing

1. Check MongoDB indexes: `db.processed_documents.getIndexes()`
2. Monitor n8n resources: `docker stats n8n`
3. Review processing code in workflow nodes
4. Increase n8n memory: Update `docker-compose.yml`

### Issue: Email Not Sending

1. Verify SMTP credentials in .env
2. Check firewall rules for SMTP port
3. Enable "Less secure apps" if using Gmail
4. Review n8n logs for SMTP errors

## Performance Optimization

### MongoDB

```javascript
// Recommended indexes
db.processed_documents.createIndex({ "timestamp": -1 })
db.processed_documents.createIndex({ "documentType": 1 })
db.processed_documents.createIndex({ "status": 1 })
db.processed_documents.createIndex({ "documentId": 1 }, { unique: true })

// Archive old documents
db.processed_documents.deleteMany({
  timestamp: { $lt: new Date(Date.now() - 90*24*60*60*1000) }
})
```

### n8n

- Set `EXECUTIONS_DATA_MAX_AGE`: 7d
- Enable `N8N_SYNC_INTERVAL`: 300000 (5 minutes)
- Use webhook instead of polling
- Configure resource limits

### API Rate Limiting

Add rate limiting middleware to prevent abuse:

```bash
# Max 1000 requests per hour
curl -H "X-API-Key: your-key" http://localhost:5678/webhook/document-processor-api
```

## Backup & Recovery

### Automated Backups

```bash
# Backup MongoDB daily at 2 AM
0 2 * * * mongodump --uri="mongodb://user:password@host:27017/document_processing" --out=/backups/$(date +\%Y\%m\%d)

# Backup n8n data
0 3 * * * docker exec n8n tar czf /backups/n8n-$(date +\%Y\%m\%d).tar.gz /home/node/.n8n/
```

### Recovery Procedure

```bash
# Restore MongoDB
mongorestore --uri="mongodb://user:password@host:27017/document_processing" /backups/20240115/

# Restart n8n
docker-compose restart n8n
```

## Security Best Practices

- ✅ Use strong MongoDB passwords
- ✅ Enable MongoDB authentication
- ✅ Use HTTPS/TLS in production
- ✅ Implement API key authentication
- ✅ Enable CORS only for trusted domains
- ✅ Rotate credentials regularly
- ✅ Enable n8n 2FA
- ✅ Monitor and audit workflow executions
- ✅ Keep n8n and dependencies updated

## Support & Resources

- n8n Documentation: https://docs.n8n.io/
- MongoDB Documentation: https://docs.mongodb.com/
- Issue Tracker: https://github.com/yourorg/n8n-document-processing/issues
- Email: support@yourorg.com

## License

ISC

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

See CONTRIBUTING.md for detailed guidelines.# Document Processing Module for n8n

Production-ready document processing automation module with 5 interconnected workflows for complete document lifecycle management.

## Features

### ✅ Core Workflows

1. **Document Processor API** - RESTful API for document processing
   - POST endpoint: Upload and process documents
   - GET endpoint: Retrieve processed documents
   - Support for: invoices, contracts, reports, letters, forms
   - Automatic field extraction and categorization
   - MongoDB storage with full audit trail

2. **Document Processor UI** - Web interface for document management
   - Document upload interface
   - Library browser with search/filter
   - Processing results viewer
   - Analytics dashboard

3. **Document Analyzer** - Automated analysis and reporting
   - Scheduled analysis (every 15 minutes)
   - Document statistics and trends
   - Slack notifications with formatted reports
   - Google Sheets integration for historical tracking

4. **Document Transformer** - Format conversion service
   - Bidirectional format conversion
   - Supported formats: JSON, XML, YAML, CSV, Markdown, HTML, Text
   - Input validation and error handling
   - MongoDB storage of transformations

5. **Invoice Generator** - Automated invoice workflow
   - PDF generation from templates
   - Google Drive storage
   - Email delivery
   - Accounting system integration
   - Slack notifications

## Technology Stack

- **Automation Engine**: n8n (open-source workflow automation)
- **Database**: MongoDB (document storage)
- **File Storage**: Google Drive
- **Messaging**: Slack
- **Email**: SMTP
- **Container**: Docker + Docker Compose
- **Orchestration**: Kubernetes (optional)

## Prerequisites

- Node.js 16+ or Docker
- MongoDB (local or cloud)
- n8n instance
- Optional: Google Drive, Slack, SMTP credentials

## Quick Start

### Option 1: Local Installation

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Validate configuration
npm run validate-config

# Import workflows
npm run import-workflows

# Start n8n
npm start
```

Access n8n at: http://localhost:5678

### Option 2: Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f n8n

# Stop services
docker-compose down
```

### Option 3: Kubernetes

```bash
# Deploy to Kubernetes cluster
npm run deploy:k8s

# Check deployment status
kubectl get pods -l app=n8n-document-processing

# View logs
kubectl logs -f deployment/n8n-document-processing
```

## Configuration

### Environment Variables

```env
# Database
DB_MONGODB_HOST=localhost
DB_MONGODB_PORT=27017
DB_MONGODB_DATABASE=document_processing
DB_MONGODB_USERNAME=
DB_MONGODB_PASSWORD=

# n8n
N8N_PORT=5678
N8N_HOST=localhost
N8N_PROTOCOL=http
N8N_WEBHOOK_URL=http://localhost:5678/

# Credentials
SLACK_BOT_TOKEN=xoxb-...
GOOGLE_DRIVE_API_KEY=...
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=notifications@example.com
SMTP_PASSWORD=...

# Monitoring
LOG_LEVEL=info
LOG_FORMAT=json
```

## API Documentation

### Document Processor API Endpoints

#### POST /webhook/document-processor-api

Process a new document.

**Request:**
```bash
curl -X POST http://localhost:5678/webhook/document-processor-api \
  -H "Content-Type: application/json" \
  -d '{
    "documentType": "invoice",
    "content": "Invoice #12345\nDate: 2024-01-15\nAmount: $1,250.00",
    "metadata": {
      "source": "email",
      "sender": "vendor@example.com"
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "documentId": "DOC-1705315600000-456",
  "message": "Document processed successfully",
  "processingResults": {
    "extracted_fields": {
      "invoiceNumber": "INV-2024010001",
      "date": "2024-01-15",
      "amount": 1250.00,
      "vendor": "Example Vendor"
    },
    "category": "business_expense"
  }
}
```

#### GET /webhook/document-processor-api

Retrieve processed documents.

**Request:**
```bash
curl -X GET http://localhost:5678/webhook/document-processor-api
```

**Response:**
```json
{
  "success": true,
  "documents": [
    {
      "documentId": "DOC-1705315600000-456",
      "documentType": "invoice",
      "timestamp": "2024-01-15T10:30:00Z",
      "processingResults": {...}
    }
  ]
}
```

### Document Transformer Endpoints

#### POST /webhook/transform

Transform document between formats.

**Request:**
```bash
curl -X POST http://localhost:5678/webhook/transform \
  -H "Content-Type: application/json" \
  -d '{
    "sourceFormat": "json",
    "targetFormat": "csv",
    "content": "{\"name\": \"John\", \"email\": \"john@example.com\"}"
  }'
```

### Invoice Generator Endpoints

#### POST /webhook/generate-invoice

Generate and send invoice.

**Request:**
```bash
curl -X POST http://localhost:5678/webhook/generate-invoice \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Acme Corp",
    "customerEmail": "billing@acme.com",
    "items": [
      {"description": "Consulting", "quantity": 10, "unitPrice": 150},
      {"description": "Development", "quantity": 5, "unitPrice": 200}
    ],
    "taxRate": 10,
    "dueDate": "2024-02-15"
  }'
```

## Database Schema

### Collections

#### processed_documents
```json
{
  "_id": ObjectId,
  "documentId": "DOC-...",
  "documentType": "invoice|contract|report|letter|form",
  "content": "...",
  "processingResults": {...},
  "processingMetadata": {
    "processingTime": 1500,
    "processingDate": "2024-01-15T10:30:00Z",
    "processorVersion": "1.0.0"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### analytics
```json
{
  "_id": "document_analytics",
  "timestamp": "2024-01-15T10:45:00Z",
  "typeStats": {
    "invoice": {"count": 150, "averageProcessingTime": 1200},
    "contract": {"count": 45, "averageProcessingTime": 2100}
  },
  "overallStats": {
    "totalDocuments": 250,
    "documentTypeDistribution": [...]
  }
}
```

## Deployment Guide

### Production Checklist

- [ ] Environment variables configured
- [ ] MongoDB credentials verified
- [ ] All external credentials (Slack, Google, SMTP) configured
- [ ] SSL/TLS certificates installed
- [ ] Logging and monitoring configured
- [ ] Backup strategy implemented
- [ ] Load testing completed
- [ ] Security audit passed

### Step 1: Prepare Infrastructure

```bash
# Create MongoDB database and collections
docker run -d \
  --name mongodb \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  -p 27017:27017 \
  mongo:latest

# Create collections and indexes
mongosh mongodb://admin:password@localhost:27017/document_processing <<EOF
db.createCollection("processed_documents")
db.createCollection("analytics")
db.processed_documents.createIndex({ "timestamp": -1 })
db.processed_documents.createIndex({ "documentType": 1 })
db.analytics.createIndex({ "timestamp": -1 })
EOF
```

### Step 2: Deploy n8n

```bash
# Using Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# Using Kubernetes
kubectl apply -f k8s-deployment.prod.yaml
```

### Step 3: Import Workflows

```bash
# Validate configuration
npm run validate-config

# Import all workflows
npm run import-workflows
```

### Step 4: Configure Credentials

Access n8n UI at http://localhost:5678:

1. Go to Credentials
2. Create new credentials for:
   - MongoDB
   - Slack
   - Google Drive
   - SMTP

3. Activate all workflows in Settings

### Step 5: Enable Monitoring

```bash
# Start monitoring services
docker-compose -f docker-compose.monitoring.yml up -d

# Access Prometheus: http://localhost:9090
# Access Grafana: http://localhost:3000
```

## Monitoring & Logging

### Health Checks

```bash
# Check n8n health
curl http://localhost:5678/health

# Check MongoDB
mongosh mongodb://admin:password@localhost:27017/admin --eval "db.adminCommand('ping')"
```

### Metrics Tracked

- Document processing throughput (docs/minute)
- Average processing time per document type
- Error rate and error types
- Workflow execution count and duration
- Database query performance
- API response times

### Log Files

- n8n logs: `/home/node/.n8n/logs/`
- MongoDB logs: `docker logs mongodb`
- Application logs: `logs/app.json`

## Troubleshooting

### Issue: MongoDB Connection Failed

```bash
# Verify MongoDB is running
docker ps | grep mongodb

# Test connection
mongosh mongodb://user:password@host:27017

# Check credentials in .env
grep DB_MONGODB .env
```

### Issue: Workflows Not Triggering

1. Verify workflow is activated in n8n UI
2. Check webhook URL: http://localhost:5678/webhook/[workflow-name]
3. Test webhook: `curl -X POST http://localhost:5678/webhook/[workflow-name]`
4. Review n8n logs: `docker logs n8n`

### Issue: Slow Document Processing

1. Check MongoDB indexes: `db.processed_documents.getIndexes()`
2. Monitor n8n resources: `docker stats n8n`
3. Review processing code in workflow nodes
4. Increase n8n memory: Update `docker-compose.yml`

### Issue: Email Not Sending

1. Verify SMTP credentials in .env
2. Check firewall rules for SMTP port
3. Enable "Less secure apps" if using Gmail
4. Review n8n logs for SMTP errors

## Performance Optimization

### MongoDB

```javascript
// Recommended indexes
db.processed_documents.createIndex({ "timestamp": -1 })
db.processed_documents.createIndex({ "documentType": 1 })
db.processed_documents.createIndex({ "status": 1 })
db.processed_documents.createIndex({ "documentId": 1 }, { unique: true })

// Archive old documents
db.processed_documents.deleteMany({
  timestamp: { $lt: new Date(Date.now() - 90*24*60*60*1000) }
})
```

### n8n

- Set `EXECUTIONS_DATA_MAX_AGE`: 7d
- Enable `N8N_SYNC_INTERVAL`: 300000 (5 minutes)
- Use webhook instead of polling
- Configure resource limits

### API Rate Limiting

Add rate limiting middleware to prevent abuse:

```bash
# Max 1000 requests per hour
curl -H "X-API-Key: your-key" http://localhost:5678/webhook/document-processor-api
```

## Backup & Recovery

### Automated Backups

```bash
# Backup MongoDB daily at 2 AM
0 2 * * * mongodump --uri="mongodb://user:password@host:27017/document_processing" --out=/backups/$(date +\%Y\%m\%d)

# Backup n8n data
0 3 * * * docker exec n8n tar czf /backups/n8n-$(date +\%Y\%m\%d).tar.gz /home/node/.n8n/
```

### Recovery Procedure

```bash
# Restore MongoDB
mongorestore --uri="mongodb://user:password@host:27017/document_processing" /backups/20240115/

# Restart n8n
docker-compose restart n8n
```

## Security Best Practices

- ✅ Use strong MongoDB passwords
- ✅ Enable MongoDB authentication
- ✅ Use HTTPS/TLS in production
- ✅ Implement API key authentication
- ✅ Enable CORS only for trusted domains
- ✅ Rotate credentials regularly
- ✅ Enable n8n 2FA
- ✅ Monitor and audit workflow executions
- ✅ Keep n8n and dependencies updated

## Support & Resources

- n8n Documentation: https://docs.n8n.io/
- MongoDB Documentation: https://docs.mongodb.com/
- Issue Tracker: https://github.com/yourorg/n8n-document-processing/issues
- Email: support@yourorg.com

## License

ISC

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

See CONTRIBUTING.md for detailed guidelines.