# Production Configuration & Deployment Guide

## Overview
This guide covers all production processes, configuration, security, and operational procedures for the Document Processing Module.

---

## ✅ Production Checklist

### Infrastructure & Prerequisites
- [ ] 2GB+ RAM, 20GB+ disk space available
- [ ] MongoDB 5.0+ installed and configured
- [ ] Redis 6.0+ installed and configured
- [ ] n8n 1.0+ installed and configured
- [ ] Docker & Docker Compose available (for container deployment)
- [ ] Node.js 18+ installed
- [ ] All required ports available (5678, 6379, 27017, 3000, 9090)

### Security Requirements
- [ ] All placeholder credentials replaced with secure values
- [ ] TLS/SSL certificates generated and installed
- [ ] JWT_SECRET configured (minimum 32 characters)
- [ ] API_KEY configured (minimum 32 characters)
- [ ] ENCRYPTION_KEY configured and backed up securely
- [ ] Database user created with minimal permissions
- [ ] Firewall rules configured to restrict access
- [ ] CORS_ORIGIN restricted to known domains only

### Configuration Files
- [ ] `.env` file created (copy from `.env.example`)
- [ ] All `CHANGE_ME_*` values updated
- [ ] Database credentials secured (use secrets manager)
- [ ] API credentials configured (Slack, SMTP, Google)
- [ ] Logging destination configured
- [ ] Monitoring endpoints configured

### Database Setup
- [ ] MongoDB authentication enabled
- [ ] Replica set configured (if HA required)
- [ ] Collections created with schema validation
- [ ] Indexes optimized
- [ ] Backup user created with read-only access
- [ ] Data retention policies configured

### Application Setup
- [ ] All dependencies installed (`npm install`)
- [ ] Configuration validated (`node validate-config.js`)
- [ ] Health checks configured and working
- [ ] Audit logging enabled
- [ ] Error alerting configured
- [ ] Rate limiting enabled
- [ ] CORS properly configured

### Monitoring & Alerting
- [ ] Prometheus configured and scraping metrics
- [ ] Grafana dashboards created
- [ ] Alert rules configured
- [ ] Error notification email configured
- [ ] Slack alerting configured
- [ ] Log aggregation configured
- [ ] Performance baseline established

### Backup & Recovery
- [ ] Backup schedule configured
- [ ] Backup destination verified and accessible
- [ ] Backup encryption configured
- [ ] Backup compression enabled
- [ ] Recovery procedure tested
- [ ] Backup retention policy set

### Testing
- [ ] Unit tests passing (`npm test`)
- [ ] Integration tests passing
- [ ] Load tests performed (100+ docs/min)
- [ ] Failover tested
- [ ] Recovery tested
- [ ] API endpoints tested with authentication
- [ ] Error handling verified

### Documentation
- [ ] Runbook created for operations team
- [ ] Incident response plan documented
- [ ] Rollback procedures documented
- [ ] Escalation procedures documented
- [ ] Team trained on procedures

---

## Environment Variables - Production Values

```bash
# Database - Use strong passwords
DB_MONGODB_PASSWORD=generate_strong_password_here
DB_BACKUP_PASSWORD=generate_strong_password_here

# Authentication - Generate using: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=generate_32_char_secret_key_here
API_KEY=generate_32_char_api_key_here
ENCRYPTION_KEY=generate_32_char_encryption_key_here

# Slack Integration
SLACK_BOT_TOKEN=xoxb-your-real-token
SLACK_CHANNEL=C01234567890
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/REAL/WEBHOOK

# SMTP Configuration
SMTP_USERNAME=your-email@yourdomain.com
SMTP_PASSWORD=your-app-specific-password
SMTP_FROM=noreply@yourdomain.com

# Security
TLS_ENABLED=true
TLS_CERT_PATH=/etc/ssl/certs/domain.crt
TLS_KEY_PATH=/etc/ssl/private/domain.key

# Monitoring
GRAFANA_ADMIN_PASSWORD=generate_strong_password
ERROR_NOTIFICATION_EMAIL=devops@yourdomain.com

# Deployment
NODE_ENV=production
DEPLOYMENT_ENV=production
DEPLOYMENT_REGION=your-region
CLUSTER_NAME=your-cluster-name
```

---

## Secrets Management

### Option 1: Environment Variables (Simple)
```bash
# Create secure .env file
cp .env.example .env
# Edit with actual values
nano .env
# Restrict file permissions
chmod 600 .env
```

### Option 2: Docker Secrets (Swarm)
```bash
# Create secrets
echo "strong_password" | docker secret create db_password -
# Reference in docker-compose.prod.yml
# Use: db_password_file: /run/secrets/db_password
```

### Option 3: Kubernetes Secrets
```bash
# Create secret from file
kubectl create secret generic db-credentials --from-file=.env

# Reference in deployment
envFrom:
  - secretRef:
      name: db-credentials
```

### Option 4: HashiCorp Vault
```bash
# Store secrets in Vault
vault kv put secret/document-processing \
  db_password="strong_password" \
  api_key="generated_api_key"

# Retrieve at runtime (setup-vault.sh provided)
```

---

## Database Initialization

### Automated (Recommended)
```bash
# Uses mongodb-init.js automatically
docker-compose -f docker-compose.prod.yml up -d

# Verify
make db-status
```

### Manual
```bash
# Connect to MongoDB
mongosh

# Initialize collections and indexes
db = db.getSiblingDB('document_processing')
// Run contents of mongodb-init.js
```

---

## SSL/TLS Configuration

### Generate Self-Signed Certificate (Testing Only)
```bash
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
```

### Use Let's Encrypt (Production)
```bash
# Using Certbot
certbot certonly --standalone -d yourdomain.com
# Copy to /etc/ssl/certs/
# Update TLS_CERT_PATH and TLS_KEY_PATH in .env
```

### Configure in Docker
```bash
# In docker-compose.prod.yml
volumes:
  - /etc/ssl/certs/:/etc/ssl/certs/
  - /etc/ssl/private/:/etc/ssl/private/
```

---

## Security Hardening

### Network Security
```bash
# Restrict MongoDB to internal network only
DB_MONGODB_HOST=mongodb  # Use container name, not exposed port

# Whitelist API access
CORS_ORIGIN=https://yourdomain.com

# Enable TLS
TLS_ENABLED=true

# Use strong headers
Security-Headers: strict-transport-security, x-frame-options, etc.
```

### Data Security
```bash
# Enable encryption at rest
DATA_ENCRYPTION_ENABLED=true
ENCRYPTION_KEY=your-secure-key

# Enable audit logging
AUDIT_LOGGING_ENABLED=true

# Set retention policies
DOCUMENT_RETENTION_DAYS=90
AUDIT_LOG_RETENTION_DAYS=365
```

### Access Control
```bash
# API key rotation
API_KEY=new_key  # Change quarterly

# Session management
JWT_EXPIRATION=24h  # Short-lived tokens

# Rate limiting
API_RATE_LIMIT=1000  # Per hour
API_RATE_WINDOW=3600
```

---

## Monitoring & Observability

### Prometheus Metrics
```bash
# Access Prometheus
http://yourserver:9090

# Key metrics to monitor
- n8n_workflow_execution_duration_seconds
- mongodb_connections
- redis_memory_used_bytes
- http_request_duration_seconds
```

### Grafana Dashboards
```bash
# Access Grafana
http://yourserver:3000
# Username: admin
# Password: from .env GRAFANA_ADMIN_PASSWORD

# Create dashboards for:
- Workflow execution rates and times
- Document processing statistics
- Error rates and types
- API response times
- Database performance
- Resource utilization
```

### Alerting Rules
```yaml
# Configure in prometheus/alerts.yml
groups:
  - name: Document Processing
    rules:
      - alert: HighErrorRate
        expr: rate(errors_total[5m]) > 0.05
        for: 5m
        
      - alert: DocumentProcessingTimeout
        expr: histogram_quantile(0.95, processing_duration_seconds) > 300
        
      - alert: DatabaseConnectionFailed
        expr: mongodb_up == 0
```

---

## Backup & Disaster Recovery

### Automated Backups
```bash
# Already configured in .env
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 3 * * *  # Daily at 3 AM
BACKUP_RETENTION_DAYS=30
BACKUP_COMPRESSION=true
BACKUP_ENCRYPTION=true

# Verify backup
make backup-list
make backup-verify BACKUP_NAME=backup-2024-01-15
```

### Manual Backup
```bash
make backup-create BACKUP_NAME=pre-deployment-backup
# or
node -e "const backup = require('./lib/backup'); ..."
```

### Restore Procedure
```bash
# Stop application
docker-compose down

# Restore from backup
make backup-restore BACKUP_NAME=backup-2024-01-15

# Start application
docker-compose -f docker-compose.prod.yml up -d

# Verify
make health
```

### Point-in-Time Recovery
```bash
# With MongoDB oplog enabled:
mongorestore --oplogReplay \
  --oplogFile /backups/oplog.bson \
  /path/to/dump
```

---

## Performance Tuning

### Database Optimization
```env
# Connection pooling
DB_MONGODB_POOL_SIZE=20
DB_MONGODB_TIMEOUT=30000

# Query optimization
# Ensure indexes are created (see mongodb-init.js)
# Use explain() for slow queries

# TTL for automatic cleanup
# Indexes with expireAfterSeconds are auto-configured
```

### Caching Strategy
```env
ENABLE_CACHING=true
CACHE_TTL=3600  # 1 hour

# Redis memory
REDIS_MAXMEMORY=2gb
REDIS_MAXMEMORY_POLICY=allkeys-lru
```

### Document Processing
```env
MAX_CONCURRENT_DOCUMENTS=10
BATCH_SIZE=100
PROCESSING_TIMEOUT=300000  # 5 minutes

# Consider for high load:
# - Increase worker count in n8n
# - Use load balancer
# - Horizontal scaling
```

---

## High Availability Setup

### Multi-Node Deployment
```yaml
# docker-compose.prod.yml with load balancer
services:
  loadbalancer:
    image: nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - n8n-1
      - n8n-2
      - n8n-3

  n8n-1:
    image: n8n
    environment:
      N8N_PORT=5678
      N8N_INSTANCE_ID=instance-1

  n8n-2:
    image: n8n
    environment:
      N8N_PORT=5678
      N8N_INSTANCE_ID=instance-2

  # MongoDB replica set and Redis already configured
```

### Kubernetes HA
```bash
# Already configured in k8s-deployment.yaml
# Features:
# - MongoDB StatefulSet (3 replicas)
# - n8n Deployment (3+ replicas)
# - Persistent volumes for data
# - Network policies for security
# - Horizontal Pod Autoscaler

kubectl apply -f k8s-deployment.yaml
kubectl get pods -n document-processing
kubectl logs -f deployment/n8n-deployment -n document-processing
```

---

## Incident Response

### Common Issues & Resolution

**High Memory Usage**
```bash
# Check processes
make health

# Review logs
make logs level=error

# Restart if needed
make restart

# Scale up if persistent
# Increase DATABASE_POOL_MAX, reduce BATCH_SIZE
```

**Database Connectivity**
```bash
# Verify MongoDB
docker exec mongodb mongosh --eval "db.adminCommand('ping')"

# Check network
docker network inspect document-processing_default

# Reset connection
make restart
```

**Slow Document Processing**
```bash
# Check workflows
curl http://localhost:5678/api/v1/workflows

# Monitor metrics
http://yourserver:9090/graph?expr=processing_duration_seconds

# Optimize or scale
```

---

## Deployment Procedure

### Pre-Deployment
```bash
# Run all checks
./scripts/pre-deployment-check.sh

# Expected: All checks passing ✓

# Backup current state
make backup-create BACKUP_NAME=pre-deployment-$(date +%s)
```

### Deployment Steps
```bash
# 1. Pull latest configuration
git pull origin main

# 2. Update services
docker-compose -f docker-compose.prod.yml pull

# 3. Run migrations (if any)
make migrate

# 4. Start services
docker-compose -f docker-compose.prod.yml up -d

# 5. Verify
make health
make smoke-tests
```

### Rollback
```bash
# If issues detected
docker-compose -f docker-compose.prod.yml down

# Restore previous backup
make backup-restore BACKUP_NAME=pre-deployment-XXXXXXXXX

# Start with previous version
docker-compose -f docker-compose.prod.yml up -d

# Notify team
```

---

## Maintenance Schedule

### Daily
- Monitor health checks
- Review error logs
- Check backup completion

### Weekly
- Performance analysis
- Security patch reviews
- Audit log review

### Monthly
- Full backup verification and recovery test
- Dependency updates
- Capacity planning review

### Quarterly
- Security audit
- API key rotation
- Performance tuning review
- Team training/refresher

---

## Support & Escalation

### On-Call Support Contacts
```
Level 1: ops-team@yourdomain.com
Level 2: devops-lead@yourdomain.com
Level 3: CTO@yourdomain.com
```

### Documentation Links
- Runbook: /docs/runbook.md
- API Reference: /API_EXAMPLES.md
- Troubleshooting: /TROUBLESHOOTING.md
- Architecture: /docs/architecture.md

### Useful Commands
```bash
make help                    # All available commands
make health                  # Full health check
make logs                    # View logs
make backup-create          # Create backup
make monitor                # Open Grafana dashboard
make db-status              # Database status
```

---

## Production Success Metrics

- ✅ 99.9% uptime
- ✅ <2 second average processing time
- ✅ 100+ documents/minute throughput
- ✅ <0.5% error rate
- ✅ All backups completing daily
- ✅ All security controls passing
- ✅ All audit logs being collected
- ✅ Alerts functioning correctly

---

**Last Updated**: 2024
**Version**: 2.0.0
**Status**: Production Ready