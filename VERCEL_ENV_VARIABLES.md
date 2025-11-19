# 🔐 Vercel Environment Variables Setup

## ⚠️ Important: Set These in Vercel Dashboard

The `vercel.json` file has database URLs, but you **MUST** add these in Vercel Dashboard:

### Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables

## Required Variables

### 1. Authentication (CRITICAL)
```bash
JWT_SECRET=fe9fd0e777a2e0d7560d38f99e7711551f45c071954765f194ae3c246a6aaee5
NEXTAUTH_SECRET=yI0dfqt0DU6gs5bpSMesQOhzGjEFsDExG/mHx31g4tI=
NEXTAUTH_URL=https://your-project.vercel.app
```

**Note:** After first deployment, update `NEXTAUTH_URL` with your actual Vercel URL.

### 2. Application URLs
```bash
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
NEXT_PUBLIC_API_URL=https://your-project.vercel.app/api
```

### 3. Database (Already in vercel.json, but verify)
```bash
DATABASE_URL=postgres://f9b01b016f6065e1f9d62776a95e03ccb3773e35f2ba4d5ec6f6bbc1afaa2e46:sk_ZDb_YXE5HdKoY5VayB3tN@db.prisma.io:5432/postgres?sslmode=require
POSTGRES_URL=postgres://f9b01b016f6065e1f9d62776a95e03ccb3773e35f2ba4d5ec6f6bbc1afaa2e46:sk_ZDb_YXE5HdKoY5VayB3tN@db.prisma.io:5432/postgres?sslmode=require
PRISMA_DATABASE_URL=prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19aRGJfWVhFNUhkS29ZNVZheUIzdE4iLCJhcGlfa2V5IjoiMDFLQTI2MDZLUDJDVkpYU1laWFhTVlFCWFAiLCJ0ZW5hbnRfaWQiOiJmOWIwMWIwMTZmNjA2NWUxZjlkNjI3NzZhOTVlMDNjY2IzNzczZTM1ZjJiYTRkNWVjNmY2YmJjMWFmYWEyZTQ2IiwiaW50ZXJuYWxfc2VjcmV0IjoiOWU1MWIyYjQtNzU3OS00ZmZhLTllMWEtYmFiYTVlMTQxYjdmIn0.4ZQEin9USH0TBlfgFmW_DVhaBy_fOTzlhsUJGn1SdSE
```

## Steps to Add Variables

1. **Deploy first** (will get URL)
2. **Go to Vercel Dashboard**
3. **Settings → Environment Variables**
4. **Add each variable** (select "Production" environment)
5. **Redeploy** after adding variables

## Quick Deploy (After Setting Variables)

```bash
cd d:\Projects\SBG
vercel --prod
```

---

**Status:** ✅ **Configuration Updated - Ready to Deploy**

