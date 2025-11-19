# Vercel Deployment Guide

## Prerequisites

1. ✅ Prisma schema created (`prisma/schema.prisma`)
2. ✅ Prisma Client generated
3. ✅ Database pushed to Prisma Cloud
4. ✅ Prisma Studio running locally (<http://localhost:5555>)

## Vercel Environment Variables

Add these to your Vercel project settings:

### Database Configuration

```bash
DATABASE_URL="postgres://5c14248d5aebd915b6084d0636fc4c85595664c415106e699d547c9ea7791153:sk_6UR_JLitplkcRsbjYJjDx@db.prisma.io:5432/postgres?sslmode=require"

POSTGRES_URL="postgres://5c14248d5aebd915b6084d0636fc4c85595664c415106e699d547c9ea7791153:sk_6UR_JLitplkcRsbjYJjDx@db.prisma.io:5432/postgres?sslmode=require"

PRISMA_DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza182VVJfSkxpdHBsa2NSc2JqWUpqRHgiLCJhcGlfa2V5IjoiMDFLOVpaSkIwM0MyRldORzhLTlo5MEhGVlMiLCJ0ZW5hbnRfaWQiOiI1YzE0MjQ4ZDVhZWJkOTE1YjYwODRkMDYzNmZjNGM4NTU5NTY2NGM0MTUxMDZlNjk5ZDU0N2M5ZWE3NzkxMTUzIiwiaW50ZXJuYWxfc2VjcmV0IjoiZTY4YzliNzktZTU5ZS00M2E0LWJlNTYtOTY3ZTM3ZTVjNjhiIn0.Abia-36FwCUE5dZu50l5oE8MFga4f3fz51NJM2cIrVk"
```

### Additional Variables (copy from .env.local)

```bash
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-nextauth-secret
STRIPE_PUBLISHABLE_KEY=your-stripe-key
STRIPE_SECRET_KEY=your-stripe-secret
```

## Deployment Steps

### Option 1: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### Option 2: GitHub Integration

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

## Prisma Studio Access

### Local Development

```bash
npx prisma studio
# Opens at http://localhost:5555
```

### Production Database

```bash
# View production data locally
npx prisma studio
# Make sure .env has production DATABASE_URL
```

## Post-Deployment Checklist

- [ ] Verify DATABASE_URL in Vercel environment
- [ ] Test database connection
- [ ] Run Prisma migrations if needed
- [ ] Monitor Prisma Accelerate metrics
- [ ] Check application logs

## Database Schema Overview

- **14 Models**: Tenants, Users, Teams, Roles, Modules, Subscriptions
- **Multi-tenant Architecture**: Full isolation per tenant
- **White-label Support**: Custom branding per tenant
- **Reseller Management**: Commission tracking
- **Subscription Plans**: 4 tiers with module access
- **17 Modules**: CRM, HR, Finance, Analytics, etc.

## Useful Commands

```bash
# Generate Prisma Client
npx prisma generate

# Push schema changes
npx prisma db push

# Open Prisma Studio
npx prisma studio

# View database structure
npx prisma db pull

# Format schema file
npx prisma format
```

## Troubleshooting

### Build fails on Vercel

- Ensure `postinstall` script runs `prisma generate`
- Check DATABASE_URL is set in Vercel
- Verify Prisma version matches locally

### Database connection errors

- Confirm SSL mode is enabled (`sslmode=require`)
- Check Prisma Cloud credentials
- Verify network access to db.prisma.io

### Prisma Studio won't open

- Ensure .env file exists with DATABASE_URL
- Check port 5555 is available
- Try `npx prisma studio --port 5556`
