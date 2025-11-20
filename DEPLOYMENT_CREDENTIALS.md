# 🔐 Deployment Credentials

## Saudi Business Gate Enterprise - Default Credentials

### ⚠️ IMPORTANT: Change these credentials in production!

---

## 📊 Database Credentials

### PostgreSQL Database

- **Host**: `localhost` (or `postgres` in Docker network)
- **Port**: `5432`
- **Database**: `doganhubstore`
- **Username**: `postgres`
- **Password**: `postgres` ⚠️ **CHANGE THIS IN PRODUCTION**
- **Connection String**: 
  ```
  postgresql://postgres:postgres@postgres:5432/doganhubstore
  ```

---

## 🔒 Application Secrets

### NextAuth Configuration

- **NEXTAUTH_URL**: `http://localhost:3000` (or `https://your-domain.com` in production)
- **NEXTAUTH_SECRET**: `doganhub-production-secret-2025-change-this` ⚠️ **CHANGE THIS**
- **JWT_SECRET**: `doganhub-jwt-secret-2025-change-this` ⚠️ **CHANGE THIS**

### Generate New Secrets

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate JWT_SECRET
openssl rand -base64 32
```

---

## 🔑 Redis Cache

- **Host**: `localhost` (or `redis` in Docker network)
- **Port**: `6390` (external) / `6379` (internal)
- **Connection String**: `redis://redis:6379`
- **Password**: None (default) ⚠️ **SET PASSWORD IN PRODUCTION**

---

## 📝 Environment Variables Template

Create `.env.production` file:

```env
# Database
DATABASE_URL=postgresql://postgres:CHANGE_PASSWORD@postgres:5432/doganhubstore
POSTGRES_USER=postgres
POSTGRES_PASSWORD=CHANGE_THIS_PASSWORD
POSTGRES_DB=doganhubstore

# Redis
REDIS_URL=redis://redis:6379
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=CHANGE_IF_NEEDED

# Application
NODE_ENV=production
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=GENERATE_NEW_SECRET_HERE
JWT_SECRET=GENERATE_NEW_SECRET_HERE
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://your-domain.com/api

# Security
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=true
ENABLE_ERROR_TRACKING=true
```

---

## 🚀 Quick Setup for Production

### 1. Update Docker Compose Credentials

Edit `docker-compose.yml`:

```yaml
postgres:
  environment:
    POSTGRES_USER: your_secure_username
    POSTGRES_PASSWORD: your_secure_password
    POSTGRES_DB: your_database_name
```

### 2. Generate Secure Secrets

```bash
# Generate secrets
NEXTAUTH_SECRET=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 32)

echo "NEXTAUTH_SECRET=$NEXTAUTH_SECRET"
echo "JWT_SECRET=$JWT_SECRET"
```

### 3. Update Application Environment

Update `docker-compose.yml` app service:

```yaml
app:
  environment:
    DATABASE_URL: postgresql://your_secure_username:your_secure_password@postgres:5432/your_database_name
    NEXTAUTH_SECRET: your_generated_secret
    JWT_SECRET: your_generated_secret
```

### 4. Secure Redis (Optional but Recommended)

Add to `docker-compose.yml` redis service:

```yaml
redis:
  command: redis-server --requirepass your_redis_password --appendonly yes
```

Then update app environment:
```yaml
REDIS_URL: redis://:your_redis_password@redis:6379
```

---

## 🔐 First-Time Admin Access

After deployment, you may need to:

1. **Create Admin User**:
   - Access the registration page
   - Or use database seed scripts

2. **Default Admin Credentials** (if seeded):
   - Check your seed scripts or migration files
   - Usually created via `/api/auth/register` endpoint

3. **Reset Admin Password**:
   - Use database query to update user
   - Or use password reset functionality

---

## ⚠️ Security Checklist

- [ ] Change PostgreSQL username and password
- [ ] Generate new NEXTAUTH_SECRET
- [ ] Generate new JWT_SECRET
- [ ] Set Redis password (if using in production)
- [ ] Update all connection strings
- [ ] Use SSL/TLS for database connections in production
- [ ] Restrict database access to application only
- [ ] Enable firewall rules
- [ ] Set up database backups
- [ ] Rotate secrets periodically

---

## 📞 Support

For production deployment assistance, refer to `DOCKER_DEPLOYMENT.md`

