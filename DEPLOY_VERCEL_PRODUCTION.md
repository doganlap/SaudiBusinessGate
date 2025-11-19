# 🚀 Deploy to Vercel Production - Step by Step

## ✅ Pre-Deployment Checklist

- [x] Vercel CLI installed (v48.10.3)
- [x] Application built successfully
- [x] Environment variables configured
- [x] Database connected
- [x] Security secrets generated

---

## 🚀 Quick Deployment (3 Steps)

### Step 1: Login to Vercel

```bash
cd d:\Projects\SBG
vercel login
```

### Step 2: Deploy to Production

```bash
vercel --prod
```

### Step 3: Set Environment Variables (if not already set)

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

---

## 📋 Required Environment Variables

Add these in Vercel Dashboard (Project Settings → Environment Variables):

### Critical (Required)

```bash
# Database (Already in vercel.json, but verify)
DATABASE_URL=postgres://f9b01b016f6065e1f9d62776a95e03ccb3773e35f2ba4d5ec6f6bbc1afaa2e46:sk_ZDb_YXE5HdKoY5VayB3tN@db.prisma.io:5432/postgres?sslmode=require

POSTGRES_URL=postgres://f9b01b016f6065e1f9d62776a95e03ccb3773e35f2ba4d5ec6f6bbc1afaa2e46:sk_ZDb_YXE5HdKoY5VayB3tN@db.prisma.io:5432/postgres?sslmode=require

PRISMA_DATABASE_URL=prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19aRGJfWVhFNUhkS29ZNVZheUIzdE4iLCJhcGlfa2V5IjoiMDFLQTI2MDZLUDJDVkpYU1laWFhTVlFCWFAiLCJ0ZW5hbnRfaWQiOiJmOWIwMWIwMTZmNjA2NWUxZjlkNjI3NzZhOTVlMDNjY2IzNzczZTM1ZjJiYTRkNWVjNmY2YmJjMWFmYWEyZTQ2IiwiaW50ZXJuYWxfc2VjcmV0IjoiOWU1MWIyYjQtNzU3OS00ZmZhLTllMWEtYmFiYTVlMTQxYjdmIn0.4ZQEin9USH0TBlfgFmW_DVhaBy_fOTzlhsUJGn1SdSE

# Authentication (From .env.production)
JWT_SECRET=<your-jwt-secret>
NEXTAUTH_SECRET=<your-nextauth-secret>
NEXTAUTH_URL=https://your-project.vercel.app

# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
NEXT_PUBLIC_API_URL=https://your-project.vercel.app/api
```

### Optional (Can add later)

```bash
# Redis (if using)
REDIS_URL=redis://...

# Email (if using)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASSWORD=your-password

# Stripe (if using payments)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
```

---

## 🎯 Deployment Commands

### Option 1: Direct Production Deploy

```bash
cd d:\Projects\SBG
vercel --prod
```

### Option 2: Using Deployment Script

```bash
cd d:\Projects\SBG
.\scripts\deploy-to-vercel.bat
```

### Option 3: Preview First, Then Production

```bash
# Deploy to preview
vercel

# If preview looks good, deploy to production
vercel --prod
```

---

## 📝 Deployment Process

1. **Vercel will:**
   - Detect Next.js framework
   - Run `npm install`
   - Run `npm run build`
   - Deploy to production

2. **Build will:**
   - Generate Prisma Client
   - Build Next.js application
   - Optimize assets
   - Create production bundle

3. **After deployment:**
   - Get production URL
   - SSL certificate auto-configured
   - CDN enabled globally
   - Monitoring enabled

---

## ✅ Post-Deployment Verification

### 1. Check Deployment Status

```bash
vercel ls
```

### 2. Test Health Endpoint

```bash
curl https://your-project.vercel.app/api/health
```

### 3. Test Application

- Open: `https://your-project.vercel.app`
- Should redirect to `/ar` (Arabic default)
- Test login/register
- Test API endpoints

---

## 🔧 Troubleshooting

### Build Fails

```bash
# Check build logs in Vercel dashboard
# Common issues:
- Missing environment variables
- Prisma Client not generated
- TypeScript errors
```

### Database Connection Issues

```bash
# Verify DATABASE_URL is correct
# Check SSL mode (sslmode=require)
# Test connection locally first
```

### Environment Variables Not Working

```bash
# Make sure variables are set for "Production"
# Redeploy after adding variables
vercel --prod
```

---

## 🌐 Custom Domain (Optional)

### Add Domain in Vercel

1. Go to Project Settings → Domains
2. Add your domain (e.g., saudistore.sa)
3. Update DNS records as shown
4. SSL auto-configured

### Update Environment Variables

```bash
NEXTAUTH_URL=https://your-domain.com
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

---

## 📊 What Gets Deployed

- ✅ 315 static pages
- ✅ 104+ API routes
- ✅ All components
- ✅ Database schema (via Prisma)
- ✅ Authentication system
- ✅ All modules (CRM, Finance, HR, etc.)

---

## 🚀 Ready to Deploy

Run this command:

```bash
cd d:\Projects\SBG
vercel --prod
```

**Status:** ✅ **Ready for Production Deployment**
