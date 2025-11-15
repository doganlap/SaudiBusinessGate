# ⚡ Quick Start - Dynamic Multi-tenant System
## Get Saudi Store Running in 10 Minutes

---

## 🚀 Step 1: Database Setup (2 minutes)

```bash
# Set your database URL
set DATABASE_URL=postgresql://user:pass@localhost:5432/saudistore

# Run all schema files
cd database\schema
psql %DATABASE_URL% -f 01_tenants_and_users.sql
psql %DATABASE_URL% -f 02_demo_poc_requests.sql
psql %DATABASE_URL% -f 03_multitenant_advanced.sql
psql %DATABASE_URL% -f 04_seed_data.sql
```

**What this creates:**
- ✅ 10 database tables
- ✅ 4 subscription plans (Free, Professional, Enterprise, White-label)
- ✅ 17 modules (CRM, Sales, Finance, HR, AI, etc.)
- ✅ 11 default roles (Owner, Admin, Manager, User, etc.)

---

## 🔧 Step 2: Environment Configuration (1 minute)

Create `.env.local`:

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/saudistore
JWT_SECRET=your-secret-key-change-in-production
NEXTAUTH_URL=http://localhost:3003
NEXTAUTH_SECRET=another-secret-key
REDIS_URL=redis://localhost:6379
```

---

## 📦 Step 3: Install Dependencies (2 minutes)

```bash
npm install
```

---

## 🏗️ Step 4: Build & Run (3 minutes)

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

Visit: `http://localhost:3003`

---

## 🧪 Step 5: Test the System (2 minutes)

### Create Test Tenant

```sql
-- Create tenant
INSERT INTO tenants (name, slug, subscription_tier) 
VALUES ('Test Company', 'test-company', 'professional');

-- Get tenant_id
SELECT id FROM tenants WHERE slug = 'test-company';

-- Create owner user
INSERT INTO users (tenant_id, email, password_hash, full_name, role, user_type)
VALUES (
  'tenant-id-from-above',
  'owner@test.com',
  '$2a$10$ABC123...', -- bcrypt hash of 'password'
  'Test Owner',
  'owner',
  'regular'
);

-- Enable modules for tenant
INSERT INTO tenant_modules (tenant_id, module_id, is_enabled)
SELECT 
  'tenant-id-from-above',
  id,
  TRUE
FROM modules
WHERE slug IN ('dashboard', 'crm', 'sales', 'finance', 'analytics');
```

### Test Login

```bash
curl -X POST http://localhost:3003/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@test.com",
    "password": "password"
  }'
```

### Get Navigation

```bash
curl -X GET http://localhost:3003/api/navigation \
  -H "Authorization: Bearer <token-from-login>"
```

---

## 📱 Step 6: Use in Your App

### Add Dynamic Sidebar

```tsx
// app/[lng]/(platform)/layout.tsx
import { DynamicSidebar } from '@/components/navigation/DynamicSidebar';

export default function PlatformLayout({ children }) {
  return (
    <div className="flex h-screen">
      <DynamicSidebar />
      <main className="flex-1 overflow-auto p-6">
        {children}
      </main>
    </div>
  );
}
```

### Use Navigation Hook

```tsx
'use client';
import { useNavigation } from '@/hooks/useNavigation';

export default function MyPage() {
  const { navigation, metadata, isLoading } = useNavigation();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Plan: {metadata?.subscriptionTier}</h1>
      <p>Modules: {metadata?.enabledModules.join(', ')}</p>
    </div>
  );
}
```

---

## 🎯 What You Get

### ✅ Complete Multi-tenant System
- Tenant isolation
- Subscription management
- Module-based access
- Team collaboration
- Role-based permissions

### ✅ Dynamic Features
- Routes generated from permissions
- Navigation auto-generated
- Upgrade prompts for locked features
- White-label support
- Reseller program

### ✅ 17 Modules Ready
```
Core:          Dashboard, CRM
Operations:    Sales, Procurement
Finance & HR:  Finance, HR, Billing
Governance:    GRC
Analytics:     Analytics, Reports
AI:            AI Agents, Workflows
Integration:   Integrations, API Dashboard
Tools:         Monitoring, Tools
```

### ✅ 4 Subscription Tiers
```
Free:         $0    - 3 users, 2 modules
Professional: $499  - 25 users, 7 modules
Enterprise:   $1,999 - 100 users, 12 modules
Reseller:     $4,999 - 500 users, all modules + reselling
```

---

## 🔥 Next Steps

### Customize Modules
Edit `database/schema/04_seed_data.sql` to add your modules

### Add New Routes
Edit `lib/routing/DynamicRouter.ts` → `MODULE_ROUTES`

### Customize Navigation
Edit `lib/routing/NavigationGenerator.ts` → `MODULE_METADATA`

### Setup White-label
```sql
INSERT INTO white_label_configs (tenant_id, company_name, logo_url, primary_color, custom_domain)
VALUES ('tenant-id', 'My Brand', 'https://...', '#0ea5e9', 'app.mybrand.com');
```

### Enable Reseller
```sql
INSERT INTO reseller_configs (reseller_tenant_id, reseller_code, commission_rate)
VALUES ('tenant-id', 'RESELL2025', 20.00);
```

---

## 📚 Documentation

- **Full Guide:** `/docs/DYNAMIC_ROUTING_SYSTEM.md`
- **Database Schema:** `/database/schema/`
- **API Routes:** `/app/api/`
- **Components:** `/components/navigation/`

---

## 🐛 Troubleshooting

### Database Connection Failed
```bash
# Check PostgreSQL is running
psql --version
pg_isready

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### JWT Token Invalid
```bash
# Check JWT_SECRET is set
echo %JWT_SECRET%

# Generate new secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Module Not Showing
```sql
-- Check module is enabled
SELECT tm.*, m.name 
FROM tenant_modules tm
JOIN modules m ON tm.module_id = m.id
WHERE tm.tenant_id = 'your-tenant-id';

-- Enable module
INSERT INTO tenant_modules (tenant_id, module_id, is_enabled)
VALUES ('tenant-id', 'module-id', TRUE);
```

---

**🇸🇦 Saudi Store - The 1st Autonomous Store in the World**

**Ready in 10 minutes!** ⚡
