# 🐳 Docker Production Deployment Guide

## Saudi Business Gate Enterprise - Worldwide Deployment

### 🚀 Quick Start

#### 1. Build and Deploy

```bash
# Build the application
npm run build

# Build Docker image
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app
```

#### 2. Access the Application

- **Application**: http://localhost:3000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6390

### 🌍 Worldwide Access Configuration

#### For Production Deployment:

1. **Update Environment Variables** in `docker-compose.yml`:
   ```yaml
   NEXTAUTH_URL: https://your-domain.com
   NEXT_PUBLIC_APP_URL: https://your-domain.com
   NEXT_PUBLIC_API_URL: https://your-domain.com/api
   ```

2. **Expose Ports** (already configured):
   - Port 3000: Main application
   - Port 3051: Alternative port
   - Port 5432: PostgreSQL (optional, for external access)
   - Port 6390: Redis (optional, for external access)

3. **Use Reverse Proxy** (Recommended):
   - Nginx or Traefik for SSL/TLS termination
   - Load balancing for high availability
   - CDN for static assets

### 📋 Services Included

1. **app**: Next.js application (Port 3000)
2. **postgres**: PostgreSQL database (Port 5432)
3. **redis**: Redis cache (Port 6390)

### 🔧 Configuration

#### Environment Variables

Create `.env.production` file:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/doganhubstore
POSTGRES_URL=postgresql://postgres:postgres@postgres:5432/doganhubstore

# Redis
REDIS_URL=redis://redis:6379
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_CONNECTION_STRING=redis://redis:6379

# Application
NODE_ENV=production
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-key-here
JWT_SECRET=your-jwt-secret-here
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://your-domain.com/api

# Logging
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=true
ENABLE_ERROR_TRACKING=true
```

### 🛠️ Docker Commands

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Restart a service
docker-compose restart app

# Scale services (if needed)
docker-compose up -d --scale app=3

# Remove everything (including volumes)
docker-compose down -v
```

### 🔒 Security Recommendations

1. **Change Default Passwords**:
   - Update PostgreSQL password
   - Update Redis password (if needed)
   - Update NEXTAUTH_SECRET and JWT_SECRET

2. **Use SSL/TLS**:
   - Configure reverse proxy with SSL certificates
   - Use Let's Encrypt for free SSL

3. **Firewall Rules**:
   - Only expose necessary ports
   - Use internal Docker network for service communication

4. **Secrets Management**:
   - Use Docker secrets or environment variable files
   - Never commit secrets to version control

### 📊 Monitoring

- Health check endpoint: `/api/health`
- Database health: `/api/health/database`
- Redis health: `/api/health/redis`
- Performance metrics: `/api/health/performance`

### 🚀 Production Deployment Checklist

- [ ] Update all environment variables
- [ ] Change default passwords
- [ ] Configure SSL/TLS certificates
- [ ] Set up reverse proxy (Nginx/Traefik)
- [ ] Configure firewall rules
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Test health endpoints
- [ ] Load test the application
- [ ] Set up CI/CD pipeline

### 🌐 Cloud Deployment Options

#### AWS
- Use ECS or EKS for container orchestration
- RDS for PostgreSQL
- ElastiCache for Redis
- CloudFront for CDN

#### Google Cloud
- Cloud Run for serverless containers
- Cloud SQL for PostgreSQL
- Memorystore for Redis
- Cloud CDN for content delivery

#### Azure
- Azure Container Instances or AKS
- Azure Database for PostgreSQL
- Azure Cache for Redis
- Azure CDN

### 📝 Notes

- The application uses standalone output mode for optimal Docker deployment
- All services are connected via Docker network `doganhub_network`
- Volumes are used for persistent data storage
- Health checks are configured for all services

