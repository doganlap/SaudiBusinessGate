# Production Deployment - Quick Start Guide
**30-Minute Critical Fixes**

## 🚨 STOP! Do These First

### 1. Fix Build Error (5 minutes)
```bash
# Open this file
code lib/red-flags/incident-mode.ts
```

Replace lines 1-28 with:
```typescript
import { query, transaction, getPool } from '@/lib/db/connection';
import { PoolClient } from 'pg';

export interface IncidentContext {
  tenantId: string;
  flagType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  entityId: string;
  entityType: string;
  detectedAt: Date;
  evidence: Record<string, any>;
  actorId?: string;
}

export interface IncidentResponse {
  incidentId: string;
  containmentActions: string[];
  notificationsSent: string[];
  evidenceSnapshot: string;
  nextSteps: string[];
}

class IncidentModeService {
  async activateIncidentMode(context: IncidentContext): Promise<IncidentResponse> {
    const incidentId = `INC-${Date.now()}-${context.flagType}`;

    try {
      return await transaction(async (client: PoolClient) => {
```

Then find all `this.db` references and replace with direct `client.query()` calls.

Test:
```bash
npm run build
```

---

### 2. Create Database Migration (5 minutes)
```bash
# Create initial migration
npx prisma migrate dev --name initial_schema

# This will create: prisma/migrations/[timestamp]_initial_schema/migration.sql
```

---

### 3. Configure Stripe (10 minutes)

**Get Keys:**
1. Go to https://dashboard.stripe.com/apikeys
2. Click "Create restricted key" or use existing
3. Copy the keys

**Update .env.production:**
```env
STRIPE_SECRET_KEY=sk_live_YOUR_ACTUAL_KEY_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_ACTUAL_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
```

**Set up webhook:**
1. Go to https://dashboard.stripe.com/webhooks
2. Click "+ Add endpoint"
3. URL: `https://doganhubstore.com/api/billing/webhooks`
4. Events to send: Select all `checkout.session.*` and `customer.subscription.*`
5. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

---

### 4. Configure Email (10 minutes)

**Option A: Gmail (Fastest)**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
```

Get app password: https://myaccount.google.com/apppasswords

**Option B: SendGrid (Better)**
```bash
# Sign up at https://sendgrid.com
# Create API key
```

```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Test:**
```bash
node -e "
const nodemailer = require('nodemailer');
const transport = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: { user: 'your-email@gmail.com', pass: 'your-app-password' }
});
transport.sendMail({
  from: 'your-email@gmail.com',
  to: 'your-email@gmail.com',
  subject: 'Test',
  text: 'Works!'
}).then(() => console.log('✓ Email sent!')).catch(console.error);
"
```

---

## ✅ Verify Everything Works

```bash
# 1. Build should succeed
npm run build

# 2. Should see:
# ✓ Compiled successfully
# ✓ Collecting page data
# ✓ Generating static pages
# ✓ Finalizing page optimization

# 3. Start production server locally
npm run start

# 4. Test in browser:
# http://localhost:3051
```

---

## 🚀 Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy to production
vercel --prod

# Add environment variables (do this in Vercel dashboard)
# Go to: https://vercel.com/your-project/settings/environment-variables
```

**Add these variables in Vercel dashboard:**
```
DATABASE_URL (from .env.production)
NEXTAUTH_SECRET (from .env.production)
STRIPE_SECRET_KEY (your real key)
STRIPE_WEBHOOK_SECRET (from Stripe dashboard)
SMTP_USER (your email config)
SMTP_PASSWORD (your email config)
```

---

## 📋 Post-Deployment Test

**Test these URLs:**
```bash
# Health check
curl https://doganhubstore.com/api/health

# Platform status
curl https://doganhubstore.com/api/platform/status

# Test auth
# Open https://doganhubstore.com/auth/signin
```

---

## 🆘 If Something Breaks

**Build fails?**
```bash
# Check the error message
npm run build 2>&1 | grep -A 5 "Error"

# Common fix: clear cache
rm -rf .next
npm run build
```

**Deployment fails?**
```bash
# Check Vercel logs
vercel logs

# Redeploy
vercel --prod --force
```

**Database connection fails?**
```bash
# Test connection
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.\$queryRaw\`SELECT 1\`.then(r => console.log('✓ DB connected:', r)).catch(console.error);
"
```

**Stripe not working?**
- Verify keys are correct (no extra spaces)
- Check webhook is configured
- Use Stripe test mode first: `sk_test_...`

---

## 🎯 Success Checklist

After deployment, verify:
- [ ] Site loads: https://doganhubstore.com
- [ ] Can create account
- [ ] Can login
- [ ] Dashboard shows data
- [ ] No console errors
- [ ] Stripe test payment works
- [ ] Email notifications send

---

## 📞 Need Help?

**Common Issues:**

1. **"Database connection failed"**
   - Check `DATABASE_URL` in Vercel env vars
   - Verify Supabase is allowing connections

2. **"Stripe error: Invalid API key"**
   - Make sure you're using `sk_live_` not `sk_test_` for production
   - No spaces before/after the key

3. **"Email not sending"**
   - Verify SMTP credentials
   - Check Gmail "Less secure app access" if using Gmail
   - Try SendGrid instead (more reliable)

4. **"Build timeout"**
   - Vercel free tier has 45s limit
   - Upgrade to Pro ($20/month) for 15min limit

---

**Time to Complete:** ~30 minutes
**Next:** See [PRODUCTION_DEPLOYMENT_ACTION_PLAN.md](PRODUCTION_DEPLOYMENT_ACTION_PLAN.md) for full details
