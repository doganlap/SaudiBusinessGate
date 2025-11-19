# 🚀 Deployment Guide: dogan-ai.com

## Complete GRC Control Administration Platform Deployment

This guide will help you deploy the complete GRC Control Administration system to `dogan-ai.com` using GitHub and cloud platforms.

## 📋 Prerequisites

- GitHub account with access to `doganlap/Saudistore` repository
- Cloud platform account (Vercel recommended)
- Domain `dogan-ai.com` configured
- PostgreSQL database (cloud-hosted)

## 🔧 Step-by-Step Deployment

### 1. Repository Setup

```bash
# Clone the current implementation
cd d:\Projects\DoganHubStore

# Add Saudistore as remote
git remote add saudistore https://github.com/doganlap/Saudistore.git

# Create deployment branch
git checkout -b deploy-to-dogan-ai

# Commit all changes
git add .
git commit -m "feat: Complete GRC Control Administration Platform

✅ Database Schema (10+ tables)
✅ API Layer (10+ endpoints) 
✅ UI Components (5+ pages)
✅ Workflows (5 engines)
✅ AI Automation & CCM
✅ Reports & Analytics
✅ Multi-tenant & Bilingual (AR/EN)"

# Push to Saudistore repository
git push saudistore deploy-to-dogan-ai:main
```

### 2. Cloud Platform Setup (Vercel)

#### A. Install Vercel CLI

```bash
npm install -g vercel
vercel login
```

#### B. Link Project

```bash
vercel link
# Select: doganlap/Saudistore
# Set project name: dogan-ai-grc-platform
```

#### C. Configure Domain

```bash
vercel domains add dogan-ai.com
vercel domains add www.dogan-ai.com
```

### 3. Environment Variables Setup

Configure these in Vercel Dashboard or CLI:

```bash
# Application
vercel env add NEXT_PUBLIC_APP_URL production
# Value: https://dogan-ai.com

vercel env add NODE_ENV production
# Value: production

# Database (PostgreSQL)
vercel env add POSTGRES_HOST production
# Value: your-production-db-host

vercel env add POSTGRES_DB production
# Value: dogan_grc_production

vercel env add POSTGRES_USER production
# Value: your-db-user

vercel env add POSTGRES_PASSWORD production
# Value: your-secure-password

# Security
vercel env add JWT_SECRET production
# Value: your-super-secure-jwt-secret

# Optional: Stripe (if using billing)
vercel env add STRIPE_SECRET_KEY production
# Value: sk_live_your_stripe_key
```

### 4. Database Setup

#### A. Create Production Database

```sql
-- Connect to your PostgreSQL instance
CREATE DATABASE dogan_grc_production;
CREATE USER grc_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE dogan_grc_production TO grc_user;
```

#### B. Run Schema Migration

```bash
# Upload and run the schema file
psql -h your-db-host -U grc_user -d dogan_grc_production -f database/schema/20-grc-controls-schema.sql
```

### 5. Deploy to Production

```bash
# Deploy to production
vercel --prod

# Or use GitHub Actions (automatic on push to main)
git push saudistore main
```

## 🌐 Post-Deployment Configuration

### 1. DNS Configuration

Point your domain to Vercel:

```
A Record: @ → 76.76.19.61
CNAME: www → cname.vercel-dns.com
```

### 2. SSL Certificate

Vercel automatically provisions SSL certificates for custom domains.

### 3. Performance Optimization

- Enable Vercel Analytics
- Configure CDN settings
- Set up monitoring

## 🔍 Verification Steps

### 1. Health Check

```bash
curl https://dogan-ai.com/api/health
```

### 2. GRC Module Access

- Visit: `https://dogan-ai.com/en/grc`
- Verify: Dashboard loads with KPIs
- Test: Navigation between modules

### 3. API Endpoints

```bash
# Test controls API
curl -H "x-tenant-id: default-tenant" https://dogan-ai.com/api/grc/controls

# Test frameworks API  
curl -H "x-tenant-id: default-tenant" https://dogan-ai.com/api/grc/frameworks

# Test analytics API
curl -H "x-tenant-id: default-tenant" https://dogan-ai.com/api/grc/analytics
```

## 📊 Features Available

### ✅ Complete GRC Platform

- **Control Management**: Full lifecycle management
- **Framework Compliance**: NCA, SAMA, PDPL support
- **Testing & Effectiveness**: DE/OE testing workflows
- **Exception Management**: Risk-based approvals
- **Continuous Monitoring**: CCM with AI alerts
- **Reports & Analytics**: Compliance dashboards

### ✅ Enterprise Features

- **Multi-tenant**: Complete tenant isolation
- **Bilingual**: Arabic/English support
- **RBAC**: Role-based access control ready
- **Audit Trail**: Complete activity logging
- **AI Automation**: Intelligent scheduling
- **Real-time**: Live data and notifications

## 🔧 Maintenance

### Database Backups

```bash
# Daily backup script
pg_dump -h your-db-host -U grc_user dogan_grc_production > backup_$(date +%Y%m%d).sql
```

### Monitoring

- Set up Vercel Analytics
- Configure error tracking (Sentry)
- Monitor API performance
- Track user engagement

### Updates

```bash
# Deploy updates
git push saudistore main
# Automatic deployment via GitHub Actions
```

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check environment variables
   - Verify database credentials
   - Ensure database is accessible from Vercel

2. **API Endpoints Not Working**
   - Check API routes in `/api/grc/`
   - Verify tenant-id headers
   - Review server logs in Vercel

3. **UI Not Loading**
   - Check build logs
   - Verify Next.js configuration
   - Review browser console errors

### Support Contacts

- Technical: <tech@dogan-ai.com>
- Platform: <platform@dogan-ai.com>
- Emergency: +966-xxx-xxx-xxxx

## 🎉 Success

Your GRC Control Administration Platform is now live at:
**<https://dogan-ai.com>**

### Key URLs

- **Dashboard**: <https://dogan-ai.com/en/grc>
- **Controls**: <https://dogan-ai.com/en/grc/controls>  
- **Frameworks**: <https://dogan-ai.com/en/grc/frameworks>
- **Testing**: <https://dogan-ai.com/en/grc/testing>
- **Reports**: <https://dogan-ai.com/en/grc/reports>

The platform includes complete bilingual support, multi-tenant architecture, and enterprise-grade security features ready for production use.
