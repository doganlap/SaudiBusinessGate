# Quick Start Guide

Get the Document Processing Module running in minutes.

## 30-Minute Setup

### 1. Prerequisites (5 min)

- Docker & Docker Compose installed
- 2GB disk space
- Port 5678 and 27017 available

### 2. Clone & Configure (5 min)

```bash
cd n8n-custom-modules/document-processing

# Create configuration from template
cp .env.example .env

# Optional: Customize settings
nano .env
```

Key settings to update:
- `DB_MONGODB_PASSWORD`: Change from "changeme"
- `SLACK_BOT_TOKEN`: Add your Slack token (optional)
- `SMTP_*`: Add your email settings (optional)

### 3. Start Services (3 min)

```bash
# Start all containers
docker-compose up -d

# Wait for services to be ready
sleep 10

# Verify services are running
docker-compose ps
```

You should see 5 healthy services:
- n8n-mongodb
- n8n-app
- n8n-redis
- n8n-prometheus
- n8n-grafana

### 4. Access n8n (1 min)

Open browser to: **http://localhost:5678**

First-time setup:
- Create admin user
- Set admin password
- Accept terms

### 5. Import Workflows (10 min)

In n8n UI, import workflows manually or via API:

```bash
curl -X POST http://localhost:5678/api/v1/workflows/import \
  -H "Content-Type: application/json" \
  -H "X-N8N-API-KEY: $ADMIN_API_KEY" \
  -d @document-processor-api.json
```

### 6. Configure Credentials (5 min)

In n8n UI, go to **Credentials** and add:

**MongoDB Credentials:**
- Host: `mongodb`
- Port: `27017`
- Database: `document_processing`
- Username: `admin`
- Password: (from .env)

**Slack (optional):**
- Bot Token: (from .env)

**SMTP (optional):**
- Host: `smtp.gmail.com`
- Port: `587`
- Username: (your email)
- Password: (app password)

### 7. Activate Workflows

For each workflow:
1. Click on workflow
2. Click "Active" toggle in top-right
3. Click "Save"

Workflows to activate:
- Document Processor API
- Document Processor UI
- Document Analyzer
- Document Transformer
- Invoice Generator

## First Test

### Test Document Processing

```bash
curl -X POST http://localhost:5678/webhook/document-processor-api \
  -H "Content-Type: application/json" \
  -d '{
    "documentType": "invoice",
    "content": "INVOICE #001\nDate: 2024-01-15\nAmount: $1,000"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "documentId": "DOC-1705...",
  "message": "Document processed successfully"
}
```

### View Processed Documents

```bash
curl -X GET http://localhost:5678/webhook/document-processor-api
```

## Access Services

| Service | URL | Credentials |
|---------|-----|-------------|
| n8n UI | http://localhost:5678 | Your admin user |
| Grafana | http://localhost:3000 | admin / admin |
| Prometheus | http://localhost:9090 | None |
| MongoDB | mongodb://admin:changeme@localhost:27017 | admin / changeme |

## Verify Setup

```bash
# Check all containers are healthy
docker-compose ps

# View logs
docker-compose logs -f n8n

# Test database
mongosh mongodb://admin:changeme@localhost:27017

# Test API health
curl http://localhost:5678/health
```

## Next Steps

1. **Try API Examples:**
   ```bash
   # Process a contract
   curl -X POST http://localhost:5678/webhook/document-processor-api \
     -H "Content-Type: application/json" \
     -d '{"documentType": "contract", "content": "..."}'
   ```

2. **Generate Invoice:**
   ```bash
   curl -X POST http://localhost:5678/webhook/generate-invoice \
     -H "Content-Type: application/json" \
     -d '{...}'
   ```

3. **Configure External Services:**
   - Add Slack credentials for notifications
   - Add Google Drive for file storage
   - Add SMTP for email delivery

4. **Monitor Performance:**
   - Visit Grafana: http://localhost:3000
   - Check Prometheus metrics: http://localhost:9090

5. **Read Documentation:**
   - See API_EXAMPLES.md for complete API reference
   - See DEPLOYMENT.md for production setup
   - See TROUBLESHOOTING.md for common issues

## Stopping Services

```bash
# Stop all containers
docker-compose down

# Stop and remove all data
docker-compose down -v

# Stop specific service
docker-compose stop n8n
```

## Restarting Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart n8n

# Full restart (clear cache)
docker-compose down
docker-compose up -d
```

## Troubleshooting Quick Fixes

**n8n won't start:**
```bash
docker-compose logs n8n
docker-compose restart n8n
```

**MongoDB won't connect:**
```bash
docker-compose logs mongodb
docker-compose restart mongodb
```

**Workflows not triggering:**
1. Verify workflow is activated (toggle ON)
2. Check n8n health: `curl http://localhost:5678/health`
3. Restart n8n: `docker-compose restart n8n`

**Port already in use:**
```bash
# Change port in .env
N8N_PORT=5679
docker-compose restart n8n
```

## Support

For detailed help:
- README.md - Full documentation
- DEPLOYMENT.md - Production setup
- TROUBLESHOOTING.md - Common issues
- API_EXAMPLES.md - API reference

## Performance

Default setup handles:
- 100+ documents/minute
- <2 second processing time
- 1000+ total documents

For higher loads, see DEPLOYMENT.md for optimization.

## Security Notes

⚠️ **This is a development setup. For production:**

1. Change all default passwords
2. Enable HTTPS/TLS
3. Configure authentication
4. Set up firewall rules
5. Enable backups
6. Monitor resources
7. Use secrets manager

See DEPLOYMENT.md for production checklist.

## Tips

- Keep .env secrets safe
- Monitor logs regularly
- Back up MongoDB frequently
- Test workflows before activating
- Use API keys for external access
- Configure alerts for failures

Ready to dive deeper? Check out the full documentation!# Quick Start Guide

Get the Document Processing Module running in minutes.

## 30-Minute Setup

### 1. Prerequisites (5 min)

- Docker & Docker Compose installed
- 2GB disk space
- Port 5678 and 27017 available

### 2. Clone & Configure (5 min)

```bash
cd n8n-custom-modules/document-processing

# Create configuration from template
cp .env.example .env

# Optional: Customize settings
nano .env
```

Key settings to update:
- `DB_MONGODB_PASSWORD`: Change from "changeme"
- `SLACK_BOT_TOKEN`: Add your Slack token (optional)
- `SMTP_*`: Add your email settings (optional)

### 3. Start Services (3 min)

```bash
# Start all containers
docker-compose up -d

# Wait for services to be ready
sleep 10

# Verify services are running
docker-compose ps
```

You should see 5 healthy services:
- n8n-mongodb
- n8n-app
- n8n-redis
- n8n-prometheus
- n8n-grafana

### 4. Access n8n (1 min)

Open browser to: **http://localhost:5678**

First-time setup:
- Create admin user
- Set admin password
- Accept terms

### 5. Import Workflows (10 min)

In n8n UI, import workflows manually or via API:

```bash
curl -X POST http://localhost:5678/api/v1/workflows/import \
  -H "Content-Type: application/json" \
  -H "X-N8N-API-KEY: $ADMIN_API_KEY" \
  -d @document-processor-api.json
```

### 6. Configure Credentials (5 min)

In n8n UI, go to **Credentials** and add:

**MongoDB Credentials:**
- Host: `mongodb`
- Port: `27017`
- Database: `document_processing`
- Username: `admin`
- Password: (from .env)

**Slack (optional):**
- Bot Token: (from .env)

**SMTP (optional):**
- Host: `smtp.gmail.com`
- Port: `587`
- Username: (your email)
- Password: (app password)

### 7. Activate Workflows

For each workflow:
1. Click on workflow
2. Click "Active" toggle in top-right
3. Click "Save"

Workflows to activate:
- Document Processor API
- Document Processor UI
- Document Analyzer
- Document Transformer
- Invoice Generator

## First Test

### Test Document Processing

```bash
curl -X POST http://localhost:5678/webhook/document-processor-api \
  -H "Content-Type: application/json" \
  -d '{
    "documentType": "invoice",
    "content": "INVOICE #001\nDate: 2024-01-15\nAmount: $1,000"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "documentId": "DOC-1705...",
  "message": "Document processed successfully"
}
```

### View Processed Documents

```bash
curl -X GET http://localhost:5678/webhook/document-processor-api
```

## Access Services

| Service | URL | Credentials |
|---------|-----|-------------|
| n8n UI | http://localhost:5678 | Your admin user |
| Grafana | http://localhost:3000 | admin / admin |
| Prometheus | http://localhost:9090 | None |
| MongoDB | mongodb://admin:changeme@localhost:27017 | admin / changeme |

## Verify Setup

```bash
# Check all containers are healthy
docker-compose ps

# View logs
docker-compose logs -f n8n

# Test database
mongosh mongodb://admin:changeme@localhost:27017

# Test API health
curl http://localhost:5678/health
```

## Next Steps

1. **Try API Examples:**
   ```bash
   # Process a contract
   curl -X POST http://localhost:5678/webhook/document-processor-api \
     -H "Content-Type: application/json" \
     -d '{"documentType": "contract", "content": "..."}'
   ```

2. **Generate Invoice:**
   ```bash
   curl -X POST http://localhost:5678/webhook/generate-invoice \
     -H "Content-Type: application/json" \
     -d '{...}'
   ```

3. **Configure External Services:**
   - Add Slack credentials for notifications
   - Add Google Drive for file storage
   - Add SMTP for email delivery

4. **Monitor Performance:**
   - Visit Grafana: http://localhost:3000
   - Check Prometheus metrics: http://localhost:9090

5. **Read Documentation:**
   - See API_EXAMPLES.md for complete API reference
   - See DEPLOYMENT.md for production setup
   - See TROUBLESHOOTING.md for common issues

## Stopping Services

```bash
# Stop all containers
docker-compose down

# Stop and remove all data
docker-compose down -v

# Stop specific service
docker-compose stop n8n
```

## Restarting Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart n8n

# Full restart (clear cache)
docker-compose down
docker-compose up -d
```

## Troubleshooting Quick Fixes

**n8n won't start:**
```bash
docker-compose logs n8n
docker-compose restart n8n
```

**MongoDB won't connect:**
```bash
docker-compose logs mongodb
docker-compose restart mongodb
```

**Workflows not triggering:**
1. Verify workflow is activated (toggle ON)
2. Check n8n health: `curl http://localhost:5678/health`
3. Restart n8n: `docker-compose restart n8n`

**Port already in use:**
```bash
# Change port in .env
N8N_PORT=5679
docker-compose restart n8n
```

## Support

For detailed help:
- README.md - Full documentation
- DEPLOYMENT.md - Production setup
- TROUBLESHOOTING.md - Common issues
- API_EXAMPLES.md - API reference

## Performance

Default setup handles:
- 100+ documents/minute
- <2 second processing time
- 1000+ total documents

For higher loads, see DEPLOYMENT.md for optimization.

## Security Notes

⚠️ **This is a development setup. For production:**

1. Change all default passwords
2. Enable HTTPS/TLS
3. Configure authentication
4. Set up firewall rules
5. Enable backups
6. Monitor resources
7. Use secrets manager

See DEPLOYMENT.md for production checklist.

## Tips

- Keep .env secrets safe
- Monitor logs regularly
- Back up MongoDB frequently
- Test workflows before activating
- Use API keys for external access
- Configure alerts for failures

Ready to dive deeper? Check out the full documentation!