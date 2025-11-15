# Vercel Deployment Guide - DoganHub Store

## Prerequisites

- [x] Vercel account created at https://vercel.com
- [x] GitHub repository connected
- [x] Node.js 18+ installed locally for testing
- [x] Environment variables prepared

## Quick Deployment (Recommended)

### Option 1: Deploy via Vercel Dashboard

1. **Import Project**
   ```
   - Go to https://vercel.com/new
   - Click "Import Git Repository"
   - Select your GitHub repository: DoganHubStore
   - Framework: Next.js (auto-detected)
   - Root Directory: ./
   ```

2. **Configure Build Settings**
   ```
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   Development Command: npm run dev
   ```

3. **Add Environment Variables**
   Click "Environment Variables" and add:
   ```bash
   # Application
   NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
   NODE_ENV=production
   
   # Authentication
   NEXTAUTH_URL=https://your-domain.vercel.app
   NEXTAUTH_SECRET=your-secret-key-here
   JWT_SECRET=your-jwt-secret-here
   
   # Database (Use Vercel Postgres or external)
   DATABASE_URL=postgresql://user:pass@host:5432/db
   
   # Redis (Use Upstash Redis or external)
   REDIS_HOST=your-redis-host
   REDIS_PORT=6379
   REDIS_PASSWORD=your-redis-password
   
   # Stripe
   STRIPE_SECRET_KEY=sk_live_your_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_key
   
   # Optional: Email
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email
   SMTP_PASSWORD=your-password
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait 2-5 minutes for build
   - Your app will be live at `https://your-project.vercel.app`

### Option 2: Deploy via CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy to Production**
   ```bash
   # From project root
   cd D:\Projects\DoganHubStore
   
   # Deploy
   vercel --prod
   ```

4. **Follow the prompts**
   ```
   ? Set up and deploy? [Y/n] Y
   ? Which scope? Your Team/Account
   ? Link to existing project? [y/N] N
   ? What's your project's name? doganhub-store
   ? In which directory is your code located? ./
   ```

### Option 3: GitHub Integration (Automatic)

1. **Connect Repository**
   - Go to Vercel Dashboard
   - Click "New Project" → "Import Git Repository"
   - Authorize GitHub access
   - Select DoganHubStore repository

2. **Configure Auto-Deploy**
   - Production Branch: `main`
   - Preview Branches: `develop`, feature branches
   - Build Configuration: Auto-detected (Next.js)

3. **Every Push Deploys Automatically**
   ```bash
   git push origin main  # Deploys to production
   git push origin develop  # Deploys preview
   ```

## Database Setup for Production

### Option 1: Vercel Postgres (Recommended)

1. **Add Vercel Postgres**
   ```
   - Go to your project in Vercel
   - Click "Storage" tab
   - Click "Create Database"
   - Select "Postgres"
   - Choose plan (Hobby = Free)
   ```

2. **Environment Variables Auto-Added**
   Vercel automatically adds:
   ```
   POSTGRES_URL
   POSTGRES_PRISMA_URL
   POSTGRES_URL_NON_POOLING
   DATABASE_URL
   ```

3. **Run Migrations**
   ```bash
   # Connect to your Vercel Postgres
   vercel env pull .env.local
   
   # Run schema setup
   psql $DATABASE_URL < database/schema.sql
   psql $DATABASE_URL < database/seed.sql
   ```

### Option 2: External PostgreSQL

Use any PostgreSQL provider:
- **Supabase** (Free tier available)
- **Railway** (Free tier available)
- **Neon** (Free serverless Postgres)
- **AWS RDS**
- **Azure Database for PostgreSQL**

Add connection string to Vercel environment variables:
```bash
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

## Redis Setup for Production

### Option 1: Upstash Redis (Recommended for Vercel)

1. **Create Upstash Account**
   - Go to https://upstash.com
   - Create free account
   - Create new Redis database

2. **Get Connection Details**
   ```
   REDIS_HOST=your-region.upstash.io
   REDIS_PORT=6379
   REDIS_PASSWORD=your-password
   REDIS_URL=redis://:password@host:6379
   ```

3. **Add to Vercel**
   - Project Settings → Environment Variables
   - Add all Redis variables

### Option 2: Redis Labs / Other Providers

- **Redis Labs** (Free tier available)
- **AWS ElastiCache**
- **Azure Cache for Redis**

## Environment Variables Setup

### Required Variables

```bash
# Application
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production

# Auth (MUST be unique in production!)
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 32)

# Database
DATABASE_URL=postgresql://...

# Redis
REDIS_HOST=...
REDIS_PORT=6379
REDIS_PASSWORD=...
```

### Optional Variables

```bash
# Stripe
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASSWORD=...

# Monitoring
SENTRY_DSN=...
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=...
```

## Custom Domain Setup

1. **Add Domain in Vercel**
   ```
   Project Settings → Domains → Add Domain
   Enter: doganhubstore.com
   ```

2. **Configure DNS**
   Add these records to your domain registrar:
   ```
   Type  Name  Value
   A     @     76.76.21.21
   CNAME www   cname.vercel-dns.com
   ```

3. **SSL Certificate**
   - Automatically provisioned by Vercel
   - Free Let's Encrypt SSL
   - Auto-renewal

## Post-Deployment Checklist

- [ ] Application loads correctly
- [ ] Database connection working
- [ ] Redis cache working
- [ ] Authentication working
- [ ] API endpoints responding
- [ ] Health check endpoint: `/api/health`
- [ ] Static assets loading
- [ ] Images optimized
- [ ] Bilingual support working (English/Arabic)
- [ ] Stripe integration working (if configured)

## Testing Production Build Locally

Before deploying, test production build:

```bash
# Build for production
npm run build

# Start production server
npm start

# Open browser
# http://localhost:3050/en/dashboard
```

Test these pages:
- `/en/dashboard` - Main dashboard
- `/ar/dashboard` - Arabic dashboard
- `/api/health` - Health check
- `/en/billing` - Billing page
- `/en/auth/signin` - Sign in page

## Performance Optimization

### 1. Enable Image Optimization
Already configured in `next.config.js`

### 2. Enable Caching
Vercel automatically caches:
- Static assets (31536000s)
- API responses (configurable)
- Build outputs

### 3. Edge Functions
Consider moving API routes to edge:
```typescript
export const runtime = 'edge';
```

## Monitoring and Logging

### 1. Vercel Analytics
```bash
# Install
npm install @vercel/analytics

# Add to app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
<Analytics />
```

### 2. Vercel Speed Insights
```bash
npm install @vercel/speed-insights
```

### 3. Error Tracking (Sentry)
Already integrated - just add `SENTRY_DSN` env variable

## Rollback Procedure

If deployment has issues:

1. **Via Dashboard**
   ```
   Deployments → Previous Deployment → Promote to Production
   ```

2. **Via CLI**
   ```bash
   vercel rollback
   ```

## Troubleshooting

### Build Fails

1. **Check build logs**
   - Vercel Dashboard → Deployments → Failed Build → Logs

2. **Common issues**
   ```bash
   # TypeScript errors
   npm run build  # Test locally first
   
   # Missing dependencies
   npm install
   
   # Environment variables
   Check all required vars are set
   ```

### Runtime Errors

1. **Check function logs**
   - Dashboard → Functions → Select function → Logs

2. **Common issues**
   - Database connection timeout: Check DATABASE_URL
   - Redis connection: Check REDIS_* variables
   - 500 errors: Check application logs

### Performance Issues

1. **Check metrics**
   - Dashboard → Analytics → Performance

2. **Optimize**
   - Enable ISR (Incremental Static Regeneration)
   - Add database connection pooling
   - Implement Redis caching

## Cost Estimation

### Vercel Pricing
- **Hobby Plan**: Free
  - 100GB bandwidth
  - Unlimited deployments
  - Automatic HTTPS
  - Good for testing

- **Pro Plan**: $20/month
  - 1TB bandwidth
  - Advanced analytics
  - Password protection
  - Recommended for production

### Database Costs
- **Vercel Postgres**: Free tier → $24/month
- **Upstash Redis**: Free tier → $10/month
- **Total**: Can start free, scale as needed

## Security Checklist

- [ ] HTTPS enabled (automatic)
- [ ] Environment secrets not in code
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] Input validation on all forms
- [ ] SQL injection prevention
- [ ] XSS protection enabled

## Support Resources

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Vercel Support: https://vercel.com/support
- Community: https://github.com/vercel/next.js/discussions

## Quick Commands Reference

```bash
# Deploy to production
vercel --prod

# Deploy preview
vercel

# Check deployment status
vercel ls

# View logs
vercel logs

# Pull environment variables
vercel env pull

# Link local project
vercel link

# Get deployment URL
vercel inspect

# Remove deployment
vercel remove [deployment-url]
```

---

**Ready to Deploy?**

Run: `vercel --prod` from project root!

Your production-ready Next.js application will be live in minutes.
