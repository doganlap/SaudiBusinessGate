# Pre-Deployment Checklist for Azure Production

## ✅ Code Quality & Build

- [x] Fixed TypeScript iteration error in `lib/middleware/security.ts`
- [x] Installed missing dependencies (`zod`, type definitions)
- [x] Added 'use client' directives to client-side components
- [x] Fixed font import issues in `app/layout.tsx`
- [ ] Production build completed successfully (`npm run build`)
- [ ] All TypeScript errors resolved
- [ ] All linting warnings addressed (non-critical)

## ✅ Docker Configuration

- [x] Dockerfile configured with standalone output
- [x] Health check endpoint configured
- [x] Multi-stage build for optimized image size
- [x] Proper user permissions (non-root)
- [ ] Local Docker build test passed
- [ ] Container runs successfully on localhost:3000

## ✅ Environment Variables (Azure Portal)

### Required Variables
- [ ] `POSTGRES_HOST` - Azure PostgreSQL server hostname
- [ ] `POSTGRES_DB` - Database name
- [ ] `POSTGRES_USER` - Database username
- [ ] `POSTGRES_PASSWORD` - Database password (use Key Vault)
- [ ] `JWT_SECRET` - Secure random string (min 32 chars)
- [ ] `NEXTAUTH_SECRET` - Secure random string (min 32 chars)
- [ ] `NEXTAUTH_URL` - Production URL (https://dogan-ai.com)

### Optional but Recommended
- [ ] `REDIS_URL` - Redis cache connection string
- [ ] `SENTRY_DSN` - Error tracking (Sentry)
- [ ] `STRIPE_SECRET_KEY` - Payment integration
- [ ] `SMTP_HOST` - Email notifications
- [ ] `SMTP_USER` - Email username
- [ ] `SMTP_PASSWORD` - Email password

## ✅ Azure Resources

### Azure Container Registry (ACR)
- [ ] ACR created: `doganhubregistry.azurecr.io`
- [ ] Admin user enabled
- [ ] Logged in: `az acr login --name doganhubregistry`

### Azure Web App / Container App
- [ ] Resource Group: `doganhub-store-rg`
- [ ] Web App created: `doganhub-store-app`
- [ ] Container settings configured
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate configured
- [ ] Managed Identity enabled (for Key Vault access)

### Azure PostgreSQL Database
- [ ] Server created with SSL enforcement
- [ ] Database created: `dogan_grc_production`
- [ ] Firewall rules configured (allow Azure services)
- [ ] Connection string tested
- [ ] Migrations applied

### Azure Key Vault (Recommended)
- [ ] Key Vault created
- [ ] Secrets stored (JWT_SECRET, DB passwords, etc.)
- [ ] Web App granted access via Managed Identity

## ✅ Database Setup

- [ ] PostgreSQL server accessible from Azure
- [ ] Database schema created
- [ ] Initial migrations applied
- [ ] Seed data loaded (if needed)
- [ ] Backup strategy configured

## ✅ Security Checks

- [ ] HTTPS enforced
- [ ] Security headers configured (in `next.config.js`)
- [ ] Rate limiting enabled
- [ ] CORS configured properly
- [ ] Environment variables secured (not in code)
- [ ] Secrets in Azure Key Vault

## ✅ Monitoring & Logging

- [ ] Application Insights configured
- [ ] Log streaming enabled
- [ ] Health check endpoint responding: `/api/health`
- [ ] Error tracking (Sentry) configured
- [ ] Alerts configured for critical errors

## ✅ Performance

- [ ] CDN configured (Azure Front Door or Cloudflare)
- [ ] Image optimization enabled
- [ ] Redis cache configured
- [ ] Static files served from CDN

## 🚀 Deployment Steps

1. **Build & Test Locally**
   ```powershell
   npm run build
   .\docker-build-test.ps1
   ```

2. **Deploy to Azure**
   ```powershell
   .\deploy-to-azure.ps1
   ```

3. **Verify Deployment**
   ```powershell
   # Check logs
   az webapp log tail --name doganhub-store-app --resource-group doganhub-store-rg
   
   # Test health endpoint
   curl https://dogan-ai.com/api/health
   ```

4. **Post-Deployment Testing**
   - [ ] Homepage loads correctly
   - [ ] User authentication works
   - [ ] Database connectivity verified
   - [ ] API endpoints responding
   - [ ] RTL/i18n working (Arabic/English)
   - [ ] Admin dashboard accessible

## 📊 Critical Endpoints to Test

- `GET /api/health` - Health check
- `POST /api/auth/signin` - Authentication
- `GET /api/user/profile` - User profile
- `GET /api/licenses` - License management
- `GET /api/billing/invoices` - Billing

## 🔄 Rollback Plan

If deployment fails:
```powershell
# Revert to previous image
az webapp config container set \
  --name doganhub-store-app \
  --resource-group doganhub-store-rg \
  --docker-custom-image-name doganhubregistry.azurecr.io/doganhub-store:previous-tag
```

## 📝 Post-Deployment

- [ ] Update DNS if needed
- [ ] Notify stakeholders
- [ ] Monitor error rates for 24 hours
- [ ] Document any issues encountered
- [ ] Update deployment documentation

## 🆘 Support Contacts

- Azure Support: https://portal.azure.com/#blade/Microsoft_Azure_Support/HelpAndSupportBlade
- Application Logs: Azure Portal → App Service → Log Stream
- Database: Azure Portal → PostgreSQL → Monitoring

---

**Last Updated:** 2025-11-12
**Deployment Script:** `deploy-to-azure.ps1`
**Test Script:** `docker-build-test.ps1`
