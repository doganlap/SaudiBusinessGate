# 🚀 Saudi Store - Multi-tenant Dynamic Routing System

## The 1st Autonomous Store in the World - من السعودية إلى العالم 🇸🇦

**Version:** 2.0.0  
**Last Updated:** November 14, 2025  
**Status:** ✅ Production Ready

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [Dynamic Router](#dynamic-router)
5. [Navigation System](#navigation-system)
6. [Subscription Plans](#subscription-plans)
7. [Module System](#module-system)
8. [White-label Configuration](#white-label)
9. [Reseller Program](#reseller)
10. [API Documentation](#api)
11. [Frontend Integration](#frontend)
12. [Deployment](#deployment)

---

## 🎯 Overview

Saudi Store implements a **complete multi-tenant, multi-team, multi-role dynamic routing system** with:

### ✅ Features Implemented

- ✅ **Multi-tenancy**: Complete tenant isolation with subscription management
- ✅ **Multi-team**: Teams within tenants with role-based access
- ✅ **Multi-role**: Flexible role system with 11 default roles + custom roles
- ✅ **Dynamic Router**: Routes generated based on user permissions and subscription
- ✅ **Navigation Generator**: Auto-generate menus from enabled modules
- ✅ **Module System**: 17 modules (CRM, Sales, Finance, HR, GRC, AI, etc.)
- ✅ **Subscription Plans**: 4 tiers (Free, Professional, Enterprise, White-label)
- ✅ **White-label Support**: Custom branding, domains, and CSS/JS
- ✅ **Reseller Program**: Commission tracking and client management
- ✅ **Reusable SaaS Product**: Ready to sell with subscription model

### 🎨 UI Components Included

- ✅ Dynamic Sidebar with permissions
- ✅ Breadcrumb navigation
- ✅ User menu dropdown
- ✅ Quick actions menu
- ✅ Module upgrade prompts

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     MULTI-TENANT PLATFORM                   │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  Tenant A    │  │  Tenant B    │  │  Tenant C    │    │
│  │  (Free)      │  │  (Pro)       │  │  (Enterprise)│    │
│  │              │  │              │  │              │    │
│  │  • 3 users   │  │  • 25 users  │  │  • 100 users │    │
│  │  • 1 team    │  │  • 5 teams   │  │  • 20 teams  │    │
│  │  • CRM only  │  │  • 7 modules │  │  • All mods  │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    DYNAMIC ROUTER                           │
│                                                             │
│  • Check subscription tier                                  │
│  • Validate module access                                   │
│  • Verify role permissions                                  │
│  • Generate accessible routes                               │
│  • Build navigation menu                                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERFACE                           │
│                                                             │
│  [Sidebar]           [Main Content]        [Header]        │
│  • Dashboard         • Module pages        • User menu     │
│  • CRM ▼             • Dynamic content     • Quick actions │
│    - Customers       • Team pages          • Notifications │
│    - Leads           • Settings            • Search        │
│  • Sales             • Reports                             │
│  • Finance ⬆️        • Analytics                            │
│  • (upgrade)                                                │
└─────────────────────────────────────────────────────────────┘
```

---

## 💾 Database Schema

### Core Tables (10 tables)

#### 1. **subscription_plans**

```sql
- id (UUID, PK)
- name, slug, display_name (JSONB)
- price_monthly, price_yearly
- plan_type (free, trial, standard, professional, enterprise, whitelabel)
- max_users, max_teams, max_storage_gb
- enabled_modules (JSONB array)
- features (JSONB)
- allow_white_label, allow_reselling
```

#### 2. **modules**

```sql
- id (UUID, PK)
- name, slug, display_name (JSONB)
- module_type (core, addon, premium, enterprise)
- category (operations, finance, hr, governance, ai, etc.)
- base_path (/crm, /sales, etc.)
- monthly_price (for addons)
- is_active, is_beta
```

#### 3. **tenants**

```sql
- id (UUID, PK)
- name, slug, domain
- subscription_tier (free, professional, enterprise, whitelabel)
- subscription_status (active, trial, suspended)
- max_users, max_teams, max_storage_gb
- features (JSONB)
- is_active
```

#### 4. **users**

```sql
- id (UUID, PK)
- tenant_id (FK → tenants)
- email, password_hash, full_name
- role (owner, admin, manager, user, viewer, partner)
- user_type (regular, demo, poc, partner, internal)
- permissions (JSONB array)
- is_active
```

#### 5. **teams**

```sql
- id (UUID, PK)
- tenant_id (FK → tenants)
- name, slug
- team_type (department, project, cross_functional, temporary)
- parent_team_id (self-reference)
- team_lead_id (FK → users)
- is_active
```

#### 6. **roles**

```sql
- id (UUID, PK)
- tenant_id (FK → tenants, NULL = system-wide)
- name, slug, display_name (JSONB)
- role_type (system, tenant, team, custom)
- role_level (1-10, higher = more power)
- permissions (JSONB array: ['users:read', 'crm:*'])
- module_access (JSONB: {crm: 'full', sales: 'read'})
- is_default, is_system
```

#### 7. **user_teams**

```sql
- id (UUID, PK)
- user_id (FK → users)
- team_id (FK → teams)
- role_id (FK → roles)
- team_permissions (JSONB)
- joined_at
```

#### 8. **tenant_modules**

```sql
- id (UUID, PK)
- tenant_id (FK → tenants)
- module_id (FK → modules)
- is_enabled
- module_settings (JSONB)
- is_trial, trial_ends_at
```

#### 9. **white_label_configs**

```sql
- id (UUID, PK)
- tenant_id (FK → tenants)
- company_name, logo_url, favicon_url
- primary_color, secondary_color
- custom_domain, domain_verified
- custom_css, custom_js
- hide_powered_by
```

#### 10. **reseller_configs**

```sql
- id (UUID, PK)
- reseller_tenant_id (FK → tenants)
- reseller_code (unique)
- commission_rate (20% default)
- max_clients
- can_white_label, can_manage_clients
- total_revenue, total_commission_earned
```

### Database Setup

```bash
# Run database schema
cd database
psql $DATABASE_URL -f schema/01_tenants_and_users.sql
psql $DATABASE_URL -f schema/02_demo_poc_requests.sql
psql $DATABASE_URL -f schema/03_multitenant_advanced.sql
psql $DATABASE_URL -f schema/04_seed_data.sql
```

---

## 🚦 Dynamic Router

### Usage Example

```typescript
import DynamicRouter, { loadUserContext } from '@/lib/routing/DynamicRouter';

// Load user context
const userContext = await loadUserContext(userId, tenantId);

// Create router instance
const router = new DynamicRouter(userContext);

// Check if user can access a route
const access = router.canAccessRoute('/finance/invoices');
if (access.allowed) {
  // Allow access
} else {
  // Redirect to access.redirect with access.reason
}

// Get all accessible routes
const routes = router.getAccessibleRoutes();
// → ['/dashboard', '/crm', '/crm/customers', '/sales', ...]

// Build route with tenant context
const url = router.buildRoute('/crm/customers/:id', { id: '123' });
// → '/my-tenant/crm/customers/123'
```

### Route Configuration

Routes are defined in `lib/routing/DynamicRouter.ts`:

```typescript
export const MODULE_ROUTES: Record<string, RouteConfig[]> = {
  crm: [
    {
      path: '/crm',
      module: 'crm',
      requiredPermission: 'crm:read',
      minimumRoleLevel: 3,
    },
    {
      path: '/crm/customers/:id',
      module: 'crm',
      requiredPermission: 'crm:read',
      minimumRoleLevel: 3,
    },
  ],
  finance: [
    {
      path: '/finance',
      module: 'finance',
      requiredPermission: 'finance:read',
      minimumRoleLevel: 5,
      subscriptionTiers: ['professional', 'enterprise', 'whitelabel'],
    },
  ],
  // ... 15+ more modules
};
```

---

## 🧭 Navigation System

### Generate Navigation Menu

```typescript
import { NavigationGenerator } from '@/lib/routing/NavigationGenerator';

const generator = new NavigationGenerator(userContext);

// Get grouped navigation
const navigation = generator.generateNavigation();
/*
[
  {
    id: 'core',
    label: 'Core',
    labelAr: 'الأساسي',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        labelAr: 'لوحة التحكم',
        path: '/my-tenant/dashboard',
        icon: 'LayoutDashboard',
        children: []
      }
    ]
  },
  {
    id: 'operations',
    label: 'Operations',
    labelAr: 'العمليات',
    items: [...]
  }
]
*/

// Get breadcrumbs
const breadcrumbs = generator.generateBreadcrumbs('/crm/customers/123');
/*
[
  { label: 'Dashboard', labelAr: 'لوحة التحكم', path: '/dashboard' },
  { label: 'CRM', labelAr: 'إدارة العملاء', path: '/crm' },
  { label: 'Customers', labelAr: 'العملاء', path: '/crm/customers' },
  { label: 'Details', labelAr: 'التفاصيل', path: '/crm/customers/123' }
]
*/

// Get quick actions
const quickActions = generator.generateQuickActions();
/*
[
  { id: 'new-customer', label: 'New Customer', path: '/crm/customers/new' },
  { id: 'new-deal', label: 'New Deal', path: '/sales/deals/new' },
]
*/
```

---

## 💳 Subscription Plans

### Available Plans

| Plan | Price/Month | Users | Teams | Modules | Features |
|------|------------|-------|-------|---------|----------|
| **Free** | $0 | 3 | 1 | 2 (Dashboard, CRM) | Basic features |
| **Professional** | $499 | 25 | 5 | 7 modules | AI agents, Custom domain, Analytics |
| **Enterprise** | $1,999 | 100 | 20 | 12 modules | White-label, SSO, Dedicated support |
| **White-label Reseller** | $4,999 | 500 | 100 | All modules | Resell with your brand, Commission tracking |

### Upgrade Check

```typescript
// Check if user needs to upgrade
const canAccess = router.canAccessRoute('/ai-agents');

if (!canAccess.allowed && canAccess.reason?.includes('Upgrade')) {
  // Show upgrade modal
  showUpgradeModal(canAccess.redirect);
}
```

---

## 📦 Module System

### Available Modules (17 total)

#### Core Modules (included in all plans)

- ✅ **Dashboard** - Overview and metrics
- ✅ **CRM** - Customer relationship management

#### Operations Modules

- ✅ **Sales** - Sales pipeline and deals
- ✅ **Procurement** - Purchase orders _(Professional+)_

#### Finance & HR

- ✅ **Finance** - Accounting and invoices _(Professional+)_
- ✅ **HR** - Employee management
- ✅ **Billing** - Subscription billing

#### Governance

- ✅ **GRC** - Governance, Risk & Compliance _(Enterprise+)_

#### Analytics

- ✅ **Analytics** - Business intelligence
- ✅ **Reports** - Custom reporting

#### AI & Automation

- ✅ **AI Agents** - Intelligent automation _(Professional+)_
- ✅ **Workflows** - Process automation _(Professional+)_

#### Integration

- ✅ **Integrations** - Third-party apps _(Professional+)_
- ✅ **API Dashboard** - API management _(Professional+)_

#### Tools

- ✅ **Monitoring** - System monitoring _(Enterprise+)_
- ✅ **Tools** - Utilities

### Enable Module for Tenant

```sql
INSERT INTO tenant_modules (tenant_id, module_id, is_enabled)
SELECT 
  'tenant-uuid',
  id,
  TRUE
FROM modules
WHERE slug IN ('crm', 'sales', 'finance');
```

---

## 🎨 White-label Configuration

### Setup White-label

```sql
INSERT INTO white_label_configs (
  tenant_id,
  company_name,
  logo_url,
  primary_color,
  custom_domain,
  hide_powered_by
) VALUES (
  'tenant-uuid',
  'My Company Store',
  'https://cdn.example.com/logo.png',
  '#0ea5e9',
  'store.mycompany.com',
  TRUE
);
```

### Features Included

- ✅ Custom logo and branding
- ✅ Custom color scheme
- ✅ Custom domain
- ✅ Custom CSS/JS injection
- ✅ Custom email templates
- ✅ Hide "Powered by Saudi Store"
- ✅ Custom footer

---

## 💰 Reseller Program

### Setup Reseller Account

```sql
INSERT INTO reseller_configs (
  reseller_tenant_id,
  reseller_name,
  reseller_code,
  commission_rate,
  can_white_label,
  can_manage_clients
) VALUES (
  'reseller-tenant-uuid',
  'My Reseller Company',
  'RESELLER2025',
  20.00, -- 20% commission
  TRUE,
  TRUE
);
```

### Commission Tracking

```typescript
// When client subscribes through reseller
const clientSubscription = await createSubscription({
  tenantId: clientTenantId,
  planId: planId,
  resellerId: resellerTenantId,
});

// Commission automatically calculated
// Reseller earns 20% of subscription revenue
```

---

## 🔌 API Documentation

### Authentication Endpoints

```bash
# Login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password"
}

# Get current user
GET /api/auth/me
Authorization: Bearer <token>
```

### Navigation Endpoint

```bash
# Get dynamic navigation
GET /api/navigation
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "navigation": [...],      # Grouped navigation
    "flatNavigation": [...],  # Flat list
    "userMenu": [...],        # User dropdown
    "quickActions": [...],    # Quick actions
    "metadata": {
      "tenantId": "...",
      "subscriptionTier": "professional",
      "enabledModules": ["crm", "sales", ...]
    }
  }
}
```

### Demo/POC Endpoints

```bash
# Create demo request
POST /api/public/demo/request

# Create POC request
POST /api/public/poc/request

# Partner login
POST /api/partner/auth/login
```

---

## 💻 Frontend Integration

### Use Dynamic Sidebar

```tsx
import { DynamicSidebar } from '@/components/navigation/DynamicSidebar';

export default function Layout({ children }) {
  return (
    <div className="flex h-screen">
      <DynamicSidebar />
      <main className="flex-1 overflow-y-auto">
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
      <h1>Welcome to {metadata?.subscriptionTier} plan</h1>
      <nav>
        {navigation.map(group => (
          <div key={group.id}>
            <h3>{group.label}</h3>
            <ul>
              {group.items.map(item => (
                <li key={item.id}>
                  <a href={item.path}>{item.label}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );
}
```

### Check Module Access

```tsx
import { useCanAccessModule } from '@/hooks/useNavigation';

export default function FinancePage() {
  const canAccessFinance = useCanAccessModule('finance');

  if (!canAccessFinance) {
    return <UpgradePrompt module="finance" />;
  }

  return <FinanceDashboard />;
}
```

---

## 🚀 Deployment

### Environment Variables Required

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/saudistore

# Authentication
JWT_SECRET=your-strong-secret-key
NEXTAUTH_URL=https://saudistore.com
NEXTAUTH_SECRET=another-strong-secret

# Redis (for caching)
REDIS_URL=redis://localhost:6379

# Stripe (for billing)
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx

# Monitoring
SENTRY_DSN=https://xxx@sentry.io/xxx
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Build and Deploy

```bash
# Install dependencies
npm install

# Run database migrations
cd database && ./setup-database.bat

# Build production
npm run build

# Start production server
npm start

# Or deploy to Vercel
vercel --prod
```

---

## 📊 Features Summary

### ✅ Complete Multi-tenant System

- [x] Tenant isolation
- [x] Subscription management (4 tiers)
- [x] Module-based access control
- [x] Team-based collaboration
- [x] Role-based permissions (11 default + custom)
- [x] Dynamic routing based on permissions
- [x] Auto-generated navigation menus
- [x] White-label branding
- [x] Reseller commission tracking
- [x] Reusable SaaS product

### ✅ UI Components

- [x] Dynamic sidebar with collapsible groups
- [x] Breadcrumb navigation
- [x] User menu dropdown
- [x] Quick actions menu
- [x] Upgrade prompts for restricted features

### ✅ Developer Tools

- [x] TypeScript types for all structures
- [x] React hooks for easy integration
- [x] API endpoints for navigation
- [x] Database seed data
- [x] Complete documentation

---

## 🎯 Recommended Use Cases

### Startup / Small Business

**Plan:** Professional ($499/month)

- 25 users, 5 teams
- 7 core modules (CRM, Sales, Finance, HR, Analytics, AI, Workflows)
- Perfect for growing teams

### Enterprise

**Plan:** Enterprise ($1,999/month)

- 100 users, 20 teams
- All 12 modules
- White-label option
- SSO and dedicated support

### SaaS Reseller

**Plan:** White-label Reseller ($4,999/month)

- Sell to 500+ clients
- Full white-label branding
- 20% commission on all subscriptions
- Client management portal

---

## 📞 Support

**Documentation:** `/docs/`  
**API Reference:** `/docs/API_GUIDE.md`  
**Database Schema:** `/database/schema/`  
**Issue Tracker:** GitHub Issues

---

**🇸🇦 Saudi Store - The 1st Autonomous Store in the World from Saudi Arabia**

**Status:** ✅ Production Ready  
**Version:** 2.0.0  
**Last Updated:** November 14, 2025
