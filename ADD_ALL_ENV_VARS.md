# 🔐 Add All Environment Variables to Vercel

## ✅ Quick Method - Vercel Dashboard

### Step 1: Go to Vercel Dashboard

```
https://vercel.com/dashboard → donganksa/saudi-store → Settings → Environment Variables
```

### Step 2: Add Each Variable

**Copy from:** `VERCEL_ENV_VARS_PRODUCTION.txt`

**For each variable:**

1. Click "Add New"
2. **Key:** (variable name)
3. **Value:** (variable value)
4. **Environment:** Select "Production"
5. Click "Save"

---

## 📋 Variables to Add (9 total)

### Critical (Must Add)

1. **JWT_SECRET** = `fe9fd0e777a2e0d7560d38f99e7711551f45c071954765f194ae3c246a6aaee5`
2. **NEXTAUTH_SECRET** = `yI0dfqt0DU6gs5bpSMesQOhzGjEFsDExG/mHx31g4tI=`
3. **NEXTAUTH_URL** = `https://saudi-store-l9a1p16w5-donganksa.vercel.app`

### Application

1. **NODE_ENV** = `production`
2. **NEXT_PUBLIC_APP_URL** = `https://saudi-store-l9a1p16w5-donganksa.vercel.app`
3. **NEXT_PUBLIC_API_URL** = `https://saudi-store-l9a1p16w5-donganksa.vercel.app/api`

### Database (Already in vercel.json, but add for consistency)

1. **DATABASE_URL** = `postgres://f9b01b016f6065e1f9d62776a95e03ccb3773e35f2ba4d5ec6f6bbc1afaa2e46:sk_ZDb_YXE5HdKoY5VayB3tN@db.prisma.io:5432/postgres?sslmode=require`
2. **POSTGRES_URL** = `postgres://f9b01b016f6065e1f9d62776a95e03ccb3773e35f2ba4d5ec6f6bbc1afaa2e46:sk_ZDb_YXE5HdKoY5VayB3tN@db.prisma.io:5432/postgres?sslmode=require`
3. **PRISMA_DATABASE_URL** = `prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19aRGJfWVhFNUhkS29ZNVZheUIzdE4iLCJhcGlfa2V5IjoiMDFLQTI2MDZLUDJDVkpYU1laWFhTVlFCWFAiLCJ0ZW5hbnRfaWQiOiJmOWIwMWIwMTZmNjA2NWUxZjlkNjI3NzZhOTVlMDNjY2IzNzczZTM1ZjJiYTRkNWVjNmY2YmJjMWFmYWEyZTQ2IiwiaW50ZXJuYWxfc2VjcmV0IjoiOWU1MWIyYjQtNzU3OS00ZmZhLTllMWEtYmFiYTVlMTQxYjdmIn0.4ZQEin9USH0TBlfgFmW_DVhaBy_fOTzlhsUJGn1SdSE`

---

## 🚀 After Adding Variables

### Redeploy

```bash
cd d:\Projects\SBG
vercel --prod
```

---

## ✅ Verification

After redeploying, test:

1. **Health:** <https://saudi-store-l9a1p16w5-donganksa.vercel.app/api/health/simple>
2. **App:** <https://saudi-store-l9a1p16w5-donganksa.vercel.app>
3. **Dashboard:** <https://saudi-store-l9a1p16w5-donganksa.vercel.app/ar/dashboard>

---

**Status:** 📋 **Ready to Add - Copy from VERCEL_ENV_VARS_PRODUCTION.txt**
