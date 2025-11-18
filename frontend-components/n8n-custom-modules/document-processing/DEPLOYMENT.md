# Deployment Guide

Complete guide for deploying the Document Processing Module to various environments.

## Prerequisites

- Docker & Docker Compose (for Docker deployment)
- Kubernetes cluster (for K8s deployment)
- MongoDB (local or managed service)
- n8n instance or Docker image
- External credentials configured

## Local Development Deployment

### 1. Clone and Setup

```bash
cd n8n-custom-modules/document-processing
cp .env.example .env
```

### 2. Configure Environment

Edit `.env` with your settings:

```bash
# Database
DB_MONGODB_HOST=localhost
DB_MONGODB_PORT=27017
DB_MONGODB_PASSWORD=your_secure_password

# n8n
N8N_HOST=localhost
N8N_PORT=5678

# Services
SLACK_BOT_TOKEN=xoxb-...
SMTP_HOST=smtp.gmail.com
```

### 3. Start Services

```bash
# Install dependencies
npm install

# Validate configuration
npm run validate-config

# Start with Docker Compose
docker-compose up -d

# Monitor startup
docker-compose logs -f
```

### 4. Initialize Workflows

```bash
# Wait for services to be ready
sleep 30

# Import workflows
npm run import-workflows

# Access n8n UI
# http://localhost:5678
```

## Docker Deployment (Production)

### 1. Build Custom Image

```bash
docker build -t n8n-document-processing:latest .
docker tag n8n-document-processing:latest your-registry/n8n-document-processing:latest
docker push your-registry/n8n-document-processing:latest
```

### 2. Deploy with Docker Compose

```bash
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose logs -f n8n

# Check health
docker ps
curl http://localhost:5678/health
```

### 3. Backup Database

```bash
# Backup MongoDB
docker exec n8n-mongodb mongodump \
  --uri="mongodb://admin:password@localhost:27017/document_processing" \
  --out=/backups/mongo-backup

# Backup n8n data
docker exec n8n-app tar czf /backups/n8n-backup.tar.gz /home/node/.n8n
```

## Kubernetes Deployment (Enterprise)

### 1. Prepare Cluster

```bash
# Create namespace
kubectl create namespace n8n-document-processing

# Create secrets
kubectl create secret generic n8n-secrets \
  --from-literal=DB_MONGODB_PASSWORD=your_password \
  --from-literal=SLACK_BOT_TOKEN=xoxb-... \
  --from-literal=GOOGLE_DRIVE_API_KEY=... \
  -n n8n-document-processing

# Verify
kubectl get secrets -n n8n-document-processing
```

### 2. Deploy Application

```bash
# Apply configuration
kubectl apply -f k8s-deployment.yaml

# Monitor deployment
kubectl get pods -n n8n-document-processing
kubectl describe pod -n n8n-document-processing

# View logs
kubectl logs -f deployment/n8n-document-processing -n n8n-document-processing
```

### 3. Expose Service

```bash
# Get LoadBalancer IP
kubectl get svc -n n8n-document-processing

# Or use port-forward for testing
kubectl port-forward svc/n8n-app 5678:80 -n n8n-document-processing

# Access at http://localhost:5678
```

### 4. Configure Ingress (Optional)

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: n8n-ingress
  namespace: n8n-document-processing
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - n8n.example.com
    secretName: n8n-tls
  rules:
  - host: n8n.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: n8n-app
            port:
              number: 80
```

Apply with: `kubectl apply -f ingress.yaml`

## AWS Deployment (ECS/Fargate)

### 1. Create ECR Repository

```bash
aws ecr create-repository --repository-name n8n-document-processing

# Build and push image
docker build -t n8n-document-processing:latest .
docker tag n8n-document-processing:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/n8n-document-processing:latest
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/n8n-document-processing:latest
```

### 2. Create ECS Task Definition

```json
{
  "family": "n8n-document-processing",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "containerDefinitions": [
    {
      "name": "n8n",
      "image": "123456789.dkr.ecr.us-east-1.amazonaws.com/n8n-document-processing:latest",
      "portMappings": [
        {
          "containerPort": 5678,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "DB_MONGODB_HOST",
          "value": "mongodb.example.com"
        }
      ],
      "secrets": [
        {
          "name": "DB_MONGODB_PASSWORD",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:123456789:secret:db-password"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/n8n-document-processing",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

Register and deploy task.

## Google Cloud Deployment (Cloud Run)

```bash
# Build image
gcloud builds submit --tag gcr.io/PROJECT_ID/n8n-document-processing

# Deploy to Cloud Run
gcloud run deploy n8n-document-processing \
  --image gcr.io/PROJECT_ID/n8n-document-processing \
  --platform managed \
  --region us-central1 \
  --set-env-vars DB_MONGODB_HOST=mongodb.example.com \
  --memory 2Gi \
  --cpu 2

# View logs
gcloud run logs read n8n-document-processing --limit 50
```

## Terraform Infrastructure (IaC)

```hcl
# main.tf
terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }
}

provider "docker" {}

resource "docker_image" "n8n" {
  name = "n8n-document-processing:latest"
}

resource "docker_container" "n8n" {
  name  = "n8n-app"
  image = docker_image.n8n.repo_digest

  ports {
    internal = 5678
    external = 5678
  }

  env = [
    "DB_MONGODB_HOST=${var.mongodb_host}",
    "DB_MONGODB_PORT=27017",
    "DB_MONGODB_DATABASE=document_processing"
  ]

  volumes {
    host_path      = var.data_path
    container_path = "/home/node/.n8n"
  }
}
```

Deploy with: `terraform apply`

## Performance Tuning

### Node.js

```bash
# Increase memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Enable clustering
npm install cluster
```

### MongoDB

```javascript
// Configure for high throughput
db.adminCommand({
  setParameter: 1,
  maxIncomingConnections: 65535,
  wiredTigerEngineConfig: "cache_size=4GB"
});
```

### n8n

```env
# Configuration
N8N_EXECUTION_TIMEOUT=3600000
N8N_EXECUTION_DATA_MAX_AGE=7d
N8N_SYNC_INTERVAL=300000
EXECUTIONS_DATA_PRUNE_EVERY_MIN_COUNT=1000
```

## Monitoring Setup

### Prometheus

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'n8n'
    static_configs:
      - targets: ['localhost:5678']
  - job_name: 'mongodb'
    static_configs:
      - targets: ['localhost:9216']
```

### Grafana

Access at http://localhost:3000 (default: admin/admin)

1. Add Prometheus data source
2. Import dashboards
3. Setup alerts

## Backup & Recovery

### Automated Backups

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR

# Backup MongoDB
mongodump --uri="mongodb://..." --out=$BACKUP_DIR/mongo

# Backup n8n data
docker exec n8n-app tar czf - /home/node/.n8n > $BACKUP_DIR/n8n.tar.gz

# Upload to S3
aws s3 sync $BACKUP_DIR s3://my-backups/n8n/
```

Schedule with cron:
```cron
0 2 * * * /scripts/backup.sh
```

### Recovery

```bash
# Restore MongoDB
mongorestore --uri="mongodb://..." /backups/mongo/

# Restore n8n data
docker exec n8n-app tar xzf /backups/n8n.tar.gz -C /home/node/

# Restart service
docker-compose restart n8n
```

## Zero-Downtime Deployment

```bash
# 1. Deploy new version to secondary instance
docker pull n8n-document-processing:v2.0.0
docker run -d --name n8n-v2 ...

# 2. Test new version
curl http://localhost:5679/health

# 3. Switch traffic (using load balancer or DNS)
# Update load balancer to point to new instance

# 4. Stop old version
docker stop n8n-app
```

## Rollback Procedure

```bash
# If issues occur, rollback to previous version
docker-compose down
docker pull n8n-document-processing:v1.0.0
docker-compose up -d

# Verify
curl http://localhost:5678/health
```

## Troubleshooting

### Service Won't Start

```bash
# Check logs
docker-compose logs n8n

# Verify configuration
npm run validate-config

# Check MongoDB connectivity
mongosh mongodb://user:password@host:27017
```

### Performance Issues

```bash
# Monitor resources
docker stats n8n

# Check MongoDB indexes
db.processed_documents.getIndexes()

# Review logs for slow queries
```

### Data Loss

```bash
# Restore from backup
mongorestore --uri="..." /backups/mongo-backup/

# Verify data
db.processed_documents.count()
```

## Support

For deployment issues:
1. Check logs: `docker-compose logs`
2. Verify configuration: `npm run validate-config`
3. Test connectivity: `curl http://localhost:5678/health`
4. Review documentation: `README.md`# Deployment Guide

Complete guide for deploying the Document Processing Module to various environments.

## Prerequisites

- Docker & Docker Compose (for Docker deployment)
- Kubernetes cluster (for K8s deployment)
- MongoDB (local or managed service)
- n8n instance or Docker image
- External credentials configured

## Local Development Deployment

### 1. Clone and Setup

```bash
cd n8n-custom-modules/document-processing
cp .env.example .env
```

### 2. Configure Environment

Edit `.env` with your settings:

```bash
# Database
DB_MONGODB_HOST=localhost
DB_MONGODB_PORT=27017
DB_MONGODB_PASSWORD=your_secure_password

# n8n
N8N_HOST=localhost
N8N_PORT=5678

# Services
SLACK_BOT_TOKEN=xoxb-...
SMTP_HOST=smtp.gmail.com
```

### 3. Start Services

```bash
# Install dependencies
npm install

# Validate configuration
npm run validate-config

# Start with Docker Compose
docker-compose up -d

# Monitor startup
docker-compose logs -f
```

### 4. Initialize Workflows

```bash
# Wait for services to be ready
sleep 30

# Import workflows
npm run import-workflows

# Access n8n UI
# http://localhost:5678
```

## Docker Deployment (Production)

### 1. Build Custom Image

```bash
docker build -t n8n-document-processing:latest .
docker tag n8n-document-processing:latest your-registry/n8n-document-processing:latest
docker push your-registry/n8n-document-processing:latest
```

### 2. Deploy with Docker Compose

```bash
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose logs -f n8n

# Check health
docker ps
curl http://localhost:5678/health
```

### 3. Backup Database

```bash
# Backup MongoDB
docker exec n8n-mongodb mongodump \
  --uri="mongodb://admin:password@localhost:27017/document_processing" \
  --out=/backups/mongo-backup

# Backup n8n data
docker exec n8n-app tar czf /backups/n8n-backup.tar.gz /home/node/.n8n
```

## Kubernetes Deployment (Enterprise)

### 1. Prepare Cluster

```bash
# Create namespace
kubectl create namespace n8n-document-processing

# Create secrets
kubectl create secret generic n8n-secrets \
  --from-literal=DB_MONGODB_PASSWORD=your_password \
  --from-literal=SLACK_BOT_TOKEN=xoxb-... \
  --from-literal=GOOGLE_DRIVE_API_KEY=... \
  -n n8n-document-processing

# Verify
kubectl get secrets -n n8n-document-processing
```

### 2. Deploy Application

```bash
# Apply configuration
kubectl apply -f k8s-deployment.yaml

# Monitor deployment
kubectl get pods -n n8n-document-processing
kubectl describe pod -n n8n-document-processing

# View logs
kubectl logs -f deployment/n8n-document-processing -n n8n-document-processing
```

### 3. Expose Service

```bash
# Get LoadBalancer IP
kubectl get svc -n n8n-document-processing

# Or use port-forward for testing
kubectl port-forward svc/n8n-app 5678:80 -n n8n-document-processing

# Access at http://localhost:5678
```

### 4. Configure Ingress (Optional)

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: n8n-ingress
  namespace: n8n-document-processing
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - n8n.example.com
    secretName: n8n-tls
  rules:
  - host: n8n.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: n8n-app
            port:
              number: 80
```

Apply with: `kubectl apply -f ingress.yaml`

## AWS Deployment (ECS/Fargate)

### 1. Create ECR Repository

```bash
aws ecr create-repository --repository-name n8n-document-processing

# Build and push image
docker build -t n8n-document-processing:latest .
docker tag n8n-document-processing:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/n8n-document-processing:latest
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/n8n-document-processing:latest
```

### 2. Create ECS Task Definition

```json
{
  "family": "n8n-document-processing",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "containerDefinitions": [
    {
      "name": "n8n",
      "image": "123456789.dkr.ecr.us-east-1.amazonaws.com/n8n-document-processing:latest",
      "portMappings": [
        {
          "containerPort": 5678,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "DB_MONGODB_HOST",
          "value": "mongodb.example.com"
        }
      ],
      "secrets": [
        {
          "name": "DB_MONGODB_PASSWORD",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:123456789:secret:db-password"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/n8n-document-processing",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

Register and deploy task.

## Google Cloud Deployment (Cloud Run)

```bash
# Build image
gcloud builds submit --tag gcr.io/PROJECT_ID/n8n-document-processing

# Deploy to Cloud Run
gcloud run deploy n8n-document-processing \
  --image gcr.io/PROJECT_ID/n8n-document-processing \
  --platform managed \
  --region us-central1 \
  --set-env-vars DB_MONGODB_HOST=mongodb.example.com \
  --memory 2Gi \
  --cpu 2

# View logs
gcloud run logs read n8n-document-processing --limit 50
```

## Terraform Infrastructure (IaC)

```hcl
# main.tf
terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }
}

provider "docker" {}

resource "docker_image" "n8n" {
  name = "n8n-document-processing:latest"
}

resource "docker_container" "n8n" {
  name  = "n8n-app"
  image = docker_image.n8n.repo_digest

  ports {
    internal = 5678
    external = 5678
  }

  env = [
    "DB_MONGODB_HOST=${var.mongodb_host}",
    "DB_MONGODB_PORT=27017",
    "DB_MONGODB_DATABASE=document_processing"
  ]

  volumes {
    host_path      = var.data_path
    container_path = "/home/node/.n8n"
  }
}
```

Deploy with: `terraform apply`

## Performance Tuning

### Node.js

```bash
# Increase memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Enable clustering
npm install cluster
```

### MongoDB

```javascript
// Configure for high throughput
db.adminCommand({
  setParameter: 1,
  maxIncomingConnections: 65535,
  wiredTigerEngineConfig: "cache_size=4GB"
});
```

### n8n

```env
# Configuration
N8N_EXECUTION_TIMEOUT=3600000
N8N_EXECUTION_DATA_MAX_AGE=7d
N8N_SYNC_INTERVAL=300000
EXECUTIONS_DATA_PRUNE_EVERY_MIN_COUNT=1000
```

## Monitoring Setup

### Prometheus

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'n8n'
    static_configs:
      - targets: ['localhost:5678']
  - job_name: 'mongodb'
    static_configs:
      - targets: ['localhost:9216']
```

### Grafana

Access at http://localhost:3000 (default: admin/admin)

1. Add Prometheus data source
2. Import dashboards
3. Setup alerts

## Backup & Recovery

### Automated Backups

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR

# Backup MongoDB
mongodump --uri="mongodb://..." --out=$BACKUP_DIR/mongo

# Backup n8n data
docker exec n8n-app tar czf - /home/node/.n8n > $BACKUP_DIR/n8n.tar.gz

# Upload to S3
aws s3 sync $BACKUP_DIR s3://my-backups/n8n/
```

Schedule with cron:
```cron
0 2 * * * /scripts/backup.sh
```

### Recovery

```bash
# Restore MongoDB
mongorestore --uri="mongodb://..." /backups/mongo/

# Restore n8n data
docker exec n8n-app tar xzf /backups/n8n.tar.gz -C /home/node/

# Restart service
docker-compose restart n8n
```

## Zero-Downtime Deployment

```bash
# 1. Deploy new version to secondary instance
docker pull n8n-document-processing:v2.0.0
docker run -d --name n8n-v2 ...

# 2. Test new version
curl http://localhost:5679/health

# 3. Switch traffic (using load balancer or DNS)
# Update load balancer to point to new instance

# 4. Stop old version
docker stop n8n-app
```

## Rollback Procedure

```bash
# If issues occur, rollback to previous version
docker-compose down
docker pull n8n-document-processing:v1.0.0
docker-compose up -d

# Verify
curl http://localhost:5678/health
```

## Troubleshooting

### Service Won't Start

```bash
# Check logs
docker-compose logs n8n

# Verify configuration
npm run validate-config

# Check MongoDB connectivity
mongosh mongodb://user:password@host:27017
```

### Performance Issues

```bash
# Monitor resources
docker stats n8n

# Check MongoDB indexes
db.processed_documents.getIndexes()

# Review logs for slow queries
```

### Data Loss

```bash
# Restore from backup
mongorestore --uri="..." /backups/mongo-backup/

# Verify data
db.processed_documents.count()
```

## Support

For deployment issues:
1. Check logs: `docker-compose logs`
2. Verify configuration: `npm run validate-config`
3. Test connectivity: `curl http://localhost:5678/health`
4. Review documentation: `README.md`