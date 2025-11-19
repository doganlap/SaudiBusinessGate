# Deployment Guide - Database → Backend → Frontend

## ✅ Step 1: Database Deployment (COMPLETE)

### Prisma Cloud Database

- **Status**: ✅ Connected and synced
- **Host**: db.prisma.io:5432
- **Schema**: 14 models pushed successfully
- **Connection**: SSL enabled

```bash
✅ Database is in sync with Prisma schema
```

## 🔄 Step 2: Backend Deployment (IN PROGRESS)

### Build Process

Currently building Next.js production bundle with:

- Prisma Client generation
- Webpack optimization
- TypeScript compilation
- API routes compilation

### Backend Components

- **API Routes**: `/app/api/**/*.ts`
- **Server Components**: Next.js 16 App Router
- **Database Layer**: Prisma ORM
- **Authentication**: NextAuth.js
- **Cache**: Redis (localhost:6390)

## 📋 Step 3: Frontend Deployment (PENDING)

### Frontend Stack

- **Framework**: Next.js 16.0.1
- **UI**: React with Tailwind CSS
- **Components**: Shadcn/ui
- **Routing**: App Router with dynamic routes
- **i18n**: Multi-language support (EN/AR)

## 🚀 Deployment Options

### Option A: Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Option B: Docker Deployment

```bash
# Build Docker image
docker build -t saudi-store:latest .

# Run container
docker run -p 3050:3050 --env-file .env saudi-store:latest
```

### Option C: Manual Node Deployment

```bash
# Build
npm run build

# Start
npm start
```

## 🔐 Environment Variables Required

### Vercel Dashboard Settings

Add these in Vercel Project Settings → Environment Variables:

```bash
# Database
DATABASE_URL="postgres://...@db.prisma.io:5432/postgres?sslmode=require"
POSTGRES_URL="postgres://...@db.prisma.io:5432/postgres?sslmode=require"
PRISMA_DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/..."

# App Configuration
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-secret-here"

# Redis
REDIS_HOST="your-redis-host"
REDIS_PORT="6379"

# Stripe (if using)
STRIPE_PUBLISHABLE_KEY="pk_..."
STRIPE_SECRET_KEY="sk_..."

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email"
SMTP_PASSWORD="your-password"
```

## 📊 Deployment Checklist

### Database Layer ✅

- [x] Prisma schema created
- [x] Database credentials configured
- [x] Schema pushed to Prisma Cloud
- [x] Prisma Client generated
- [x] Database connection verified

### Backend Layer 🔄

- [x] Prisma generate in build script
- [x] API routes structured
- [ ] Build completion
- [ ] Environment variables set
- [ ] Backend testing

### Frontend Layer ⏳

- [x] Next.js configuration
- [x] Vercel.json configured
- [ ] Build completion
- [ ] Static assets optimization
- [ ] CDN configuration
- [ ] Domain setup

## 🧪 Post-Deployment Testing

### 1. Health Check

```bash
curl https://yourdomain.com/api/health
```

### 2. Database Connection

```bash
curl https://yourdomain.com/api/health/db
```

### 3. Authentication

```bash
# Test login endpoint
curl -X POST https://yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### 4. Frontend Routes

- Homepage: <https://yourdomain.com>
- English: <https://yourdomain.com/en>
- Arabic: <https://yourdomain.com/ar>
- Admin: <https://yourdomain.com/admin>

## 🔍 Monitoring

### Vercel Analytics

- Real-time monitoring
- Error tracking
- Performance metrics
- Function logs

### Prisma Accelerate

- Query performance
- Cache hit rates
- Connection pooling stats

## 🐛 Troubleshooting

### Build Fails

```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

### Database Connection Errors

```bash
# Verify DATABASE_URL
npx prisma db push

# Test connection
npx prisma studio
```

### Deployment Fails on Vercel

1. Check build logs in Vercel dashboard
2. Verify all environment variables are set
3. Ensure `postinstall` script runs
4. Check Node.js version compatibility

## 📈 Performance Optimization

### Database

- ✅ Prisma Accelerate enabled (global caching)
- ✅ Connection pooling configured
- ✅ Query optimization with indexes

### Backend

- API route caching
- Server-side rendering
- Incremental Static Regeneration

### Frontend

- Image optimization (Next.js Image)
- Code splitting
- Static asset CDN
- Gzip compression

## 🎯 Next Steps

1. **Wait for build to complete**
2. **Deploy to Vercel**: `vercel --prod`
3. **Set environment variables** in Vercel dashboard
4. **Test all API endpoints**
5. **Verify frontend routes**
6. **Configure custom domain**
7. **Enable SSL certificate**
8. **Set up monitoring**

## 📚 Documentation References

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
- [Prisma Accelerate](https://www.prisma.io/docs/accelerate)
