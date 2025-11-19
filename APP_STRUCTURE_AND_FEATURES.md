# 📱 Application Structure, Content & Features

## 🏗️ Application Architecture

### Primary Application: Next.js App Router

**Location**: `app/`  
**Framework**: Next.js 16 with App Router  
**Routing**: File-based routing with internationalization  
**Language Support**: Arabic (RTL) & English (LTR)

---

## 📁 Directory Structure

```
D:\Projects\SBG\
├── app/                                    # ✅ PRIMARY APP (Next.js App Router)
│   ├── [lng]/                              # Internationalized routes (ar/en)
│   │   ├── (platform)/                     # Main platform pages
│   │   │   ├── dashboard/                  # Dashboard pages
│   │   │   ├── finance/                    # Finance module
│   │   │   ├── sales/                      # Sales module
│   │   │   ├── hr/                         # HR module
│   │   │   ├── procurement/                # Procurement module
│   │   │   ├── crm/                        # CRM module
│   │   │   ├── grc/                        # GRC module
│   │   │   ├── pm/                         # Project Management
│   │   │   ├── analytics/                  # Analytics
│   │   │   ├── ai-agents/                  # AI Agents
│   │   │   ├── workflows/                  # Workflows
│   │   │   ├── billing/                    # Billing
│   │   │   ├── licensing/                  # Licensing
│   │   │   └── ...                        # Other modules
│   │   ├── auth/                           # Authentication
│   │   ├── register/                      # Registration
│   │   ├── login/                         # Login
│   │   ├── marketplace/                   # Marketplace
│   │   └── appstore/                      # App Store
│   ├── api/                                # ✅ API Routes (140 endpoints)
│   │   ├── finance/                       # Finance API
│   │   ├── auth/                          # Authentication API
│   │   ├── grc/                           # GRC API
│   │   ├── workflows/                     # Workflows API
│   │   ├── ai/                            # AI Services API
│   │   └── ...                            # Other API routes
│   ├── components/                        # Next.js components
│   ├── layout.tsx                         # Root layout
│   └── page.tsx                           # Root page
│
├── components/                             # ✅ SHARED COMPONENTS (Single source)
│   ├── layout/                            # Layout components
│   │   ├── MultiTenantNavigation.jsx      # ✅ Single navigation source
│   │   ├── Sidebar.jsx
│   │   ├── EnhancedAppShell.jsx
│   │   └── ...
│   ├── finance/                           # Finance components
│   ├── ui/                                # UI primitives
│   ├── auth/                              # Auth components
│   ├── common/                            # Common utilities
│   └── ...                                # Other shared components
│
├── config/                                 # ✅ CONFIGURATION (Single source)
│   ├── api.config.ts                      # API configuration
│   ├── database.config.ts                 # Database configuration
│   ├── redis.config.ts                    # Redis configuration
│   ├── ecosystem.config.js                # Ecosystem config
│   ├── loader.js                          # Config loader
│   ├── serviceRouter.js                   # Service router
│   ├── theme.config.js                    # Theme configuration
│   ├── rbac.config.js                     # RBAC configuration
│   ├── routeGroups.js                     # Route groups
│   ├── processGuides.js                   # Process guides
│   ├── agents.js                          # AI agents config
│   └── brand.ts                           # Brand configuration
│
├── lib/                                    # Utility libraries
│   ├── db.ts                              # Database client
│   ├── redis.ts                           # Redis client
│   ├── auth/                              # Auth utilities
│   └── utils/                             # Helper functions
│
├── Services/                               # Business logic services
│   ├── Billing/                           # Billing services
│   ├── Licenses/                          # License management
│   └── ...                                # Other services
│
├── prisma/                                 # Database schema
│   └── schema.prisma                      # Prisma schema
│
├── apps/web/                               # ⚠️ LEGACY (React Router)
│   └── src/                               # React Router app (backward compatibility)
│
└── public/                                 # Static assets
```

---

## 🎯 Core Features & Modules

### 1. 📊 Dashboard & Analytics

**Path**: `app/[lng]/(platform)/dashboard/`

- **Enhanced Dashboard**: Advanced analytics with KPIs, heatmaps, trends
- **Modern Advanced Dashboard**: Modern UI with real-time data
- **Regulatory Market Dashboard**: Regulatory intelligence visualization
- **Usage Dashboard**: Platform usage analytics
- **Tenant Dashboard**: Multi-tenant dashboard views

**Components**: `components/dashboard/`

---

### 2. 💰 Finance Module

**Path**: `app/[lng]/(platform)/finance/`

**Pages**:

- `/finance` - Finance dashboard
- `/finance/accounts` - Chart of accounts
- `/finance/transactions` - Transaction management
- `/finance/journal` - Journal entries
- `/finance/invoices` - Invoice management
- `/finance/bills` - Bills & payments
- `/finance/budgets` - Budget management
- `/finance/tax` - Tax management
- `/finance/banking` - Bank reconciliation
- `/finance/cost-centers` - Cost center tracking
- `/finance/cash-flow` - Cash flow statements
- `/finance/analytics` - Financial analytics
- `/finance/reports` - Financial reports

**API Routes**: `app/api/finance/`

- `/api/finance/accounts` - Account management
- `/api/finance/transactions` - Transaction CRUD
- `/api/finance/journal-entries` - Journal entries
- `/api/finance/invoices` - Invoice management
- `/api/finance/tax` - Tax calculations
- `/api/finance/reports` - Financial reports
- `/api/finance/zatca` - ZATCA compliance (Saudi Arabia)

**Components**: `components/finance/`

**Features**:

- ✅ ZATCA Compliance (Saudi Arabia e-invoicing)
- ✅ Multi-currency support (SAR default)
- ✅ Real-time financial analytics
- ✅ Automated reconciliation
- ✅ Budget tracking and variance analysis

---

### 3. 📈 Sales Module

**Path**: `app/[lng]/(platform)/sales/`

**Pages**:

- `/sales` - Sales dashboard
- `/sales/pipeline` - Sales pipeline
- `/sales/deals` - Deal management
- `/sales/leads` - Lead management
- `/sales/quotes` - Quote management
- `/sales/orders` - Order management
- `/sales/contracts` - Contract management
- `/sales/proposals` - Proposal management
- `/sales/rfqs` - RFQ management

**Features**:

- Sales pipeline visualization
- Lead scoring and qualification
- Quote generation and tracking
- Order management
- Contract lifecycle management

---

### 4. 👥 HR Module

**Path**: `app/[lng]/(platform)/hr/`

**Pages**:

- `/hr` - HR dashboard
- `/hr/employees` - Employee management
- `/hr/payroll` - Payroll processing
- `/hr/attendance` - Attendance tracking

**Features**:

- Employee database
- Payroll processing
- Attendance tracking
- Leave management
- Performance reviews

---

### 5. 🛒 Procurement Module

**Path**: `app/[lng]/(platform)/procurement/`

**Pages**:

- `/procurement` - Procurement dashboard
- `/procurement/orders` - Purchase orders
- `/procurement/vendors` - Vendor management
- `/procurement/inventory` - Inventory management

**Features**:

- Purchase order management
- Vendor onboarding and management
- Inventory tracking
- Supplier relationship management

---

### 6. 🤝 CRM Module

**Path**: `app/[lng]/(platform)/crm/`

**Pages**:

- `/crm` - CRM dashboard
- `/crm/customers` - Customer management
- `/crm/contacts` - Contact management
- `/crm/deals` - Deal management
- `/crm/activities` - Activity tracking

**Features**:

- Customer relationship management
- Contact database
- Deal pipeline
- Activity tracking
- Customer communication

---

### 7. 🛡️ GRC Module (Governance, Risk & Compliance)

**Path**: `app/[lng]/(platform)/grc/`

**Pages**:

- `/grc` - GRC dashboard
- `/grc/frameworks` - Framework management
- `/grc/controls` - Control management
- `/grc/testing` - Testing & validation
- `/grc/reports` - GRC reports

**Features**:

- Framework mapping (ISO 27001, NIST, SOC 2, GDPR, SAMA)
- Risk assessment and management
- Control testing and validation
- Compliance tracking
- Gap analysis
- Evidence management

---

### 8. 📋 Project Management

**Path**: `app/[lng]/(platform)/pm/`

**Pages**:

- `/pm/projects` - Project management
- `/pm/tasks` - Task management
- `/pm/timesheets` - Timesheet tracking

**Features**:

- Project planning and tracking
- Task assignment and tracking
- Time tracking
- Resource management

---

### 9. 🤖 AI & Automation

**Path**: `app/[lng]/(platform)/ai-agents/`

**Pages**:

- `/ai-agents` - AI agents dashboard
- `/analytics/ai-insights` - AI insights
- `/ai-finance-agents` - Finance AI agents
- `/vectorize` - Vectorization service

**API Routes**: `app/api/ai/`

- `/api/ai/generate` - AI text generation
- `/api/ai/config` - AI configuration
- `/api/ai/rag` - RAG service

**Features**:

- AI-powered insights
- Automated workflows
- Natural language processing
- RAG (Retrieval-Augmented Generation)
- AI agents for various modules

---

### 10. 🔄 Workflows

**Path**: `app/[lng]/(platform)/workflows/`

**Pages**:

- `/workflows` - Workflow management
- `/workflows/designer` - Workflow designer
- `/workflows/[id]` - Workflow details
- `/workflows/create` - Create workflow

**API Routes**: `app/api/workflows/`

- `/api/workflows` - Workflow CRUD
- `/api/workflows/[id]/execute` - Execute workflow

**Features**:

- Visual workflow designer
- Automated approval processes
- Workflow execution engine
- Task assignment and delegation

---

### 11. 💳 Billing & Licensing

**Path**: `app/[lng]/(platform)/billing/` & `/licensing/`

**Pages**:

- `/billing` - Billing dashboard
- `/licensing` - License management
- `/licenses/management` - License management
- `/licenses/usage` - Usage tracking
- `/licenses/renewals` - Renewal pipeline
- `/licenses/upgrade` - Upgrade management

**Features**:

- Subscription management
- License tracking
- Usage analytics
- Renewal pipeline
- Upgrade management

---

### 12. 📊 Analytics

**Path**: `app/[lng]/(platform)/analytics/`

**Pages**:

- `/analytics/financial-analytics` - Financial analytics
- `/analytics/customer-analytics` - Customer analytics
- `/analytics/ai-insights` - AI-powered insights

**Features**:

- Advanced analytics dashboards
- Real-time data visualization
- Predictive analytics
- Custom report generation

---

### 13. 🔐 Authentication & Authorization

**Path**: `app/[lng]/auth/` & `app/[lng]/login/`

**Pages**:

- `/login` - Login page
- `/register` - Registration page
- `/auth/signin` - Sign in

**API Routes**: `app/api/auth/`

- `/api/auth/signin` - Sign in
- `/api/auth/signout` - Sign out
- `/api/auth/session` - Session management

**Features**:

- Multi-factor authentication
- Role-based access control (RBAC)
- Session management
- Password reset
- User management

---

### 14. ⚙️ System Management

**Path**: `app/[lng]/(platform)/platform/`

**Pages**:

- `/platform/api-status` - API status monitoring
- `/audit-logs` - Audit logs
- `/red-flags` - Red flags management

**Features**:

- System health monitoring
- API status tracking
- Audit logging
- Security monitoring
- Performance monitoring

---

## 🔗 Updated Paths After Consolidation

### Configuration Paths

**Before**: `apps/web/src/config/*`  
**After**: `config/*`

**Updated Files** (18 files):

- All imports now use: `require('../../../../config/loader.js')` or relative paths to `config/`

### Navigation Paths

**Before**: Multiple `MultiTenantNavigation.jsx` files  
**After**: `components/layout/MultiTenantNavigation.jsx`

**Updated Files**:

- `apps/web/src/components/layout/Sidebar.jsx`
- `app/components/layout/Sidebar.jsx`
- `apps/web/src/components/layout/EnhancedAppShell.jsx`
- `app/components/layout/EnhancedAppShell.jsx`
- `apps/web/src/components/layout/AdvancedAppShell.jsx`
- `app/components/layout/AdvancedAppShell.jsx`
- `apps/web/src/components/Navigation/ModernSlideNavigator.jsx`
- `app/components/Navigation/ModernSlideNavigator.jsx`

**Import Pattern**:

```javascript
import { getNavigationForRole, RoleActivationPanel } from '../../../../components/layout/MultiTenantNavigation';
```

### Component Paths

**Location**: `components/` (shared location)

**TypeScript Path Mapping**:

```json
"@/components/*": [
  "./components/*",
  "./src/components/*"
]
```

**Usage**:

```typescript
import { Component } from '@/components/...';
```

---

## 📊 Application Statistics

### Pages

- **Total Pages**: 161 pages
- **Internationalized**: All pages support Arabic (RTL) and English (LTR)
- **API Routes**: 140 API endpoints

### Modules

- **Finance**: 13 pages + 7 API routes
- **Sales**: 9 pages
- **HR**: 4 pages
- **Procurement**: 4 pages
- **CRM**: 5 pages
- **GRC**: 5 pages
- **Project Management**: 3 pages
- **AI & Automation**: 4 pages
- **Workflows**: 4 pages
- **Billing & Licensing**: 6 pages
- **Analytics**: 3 pages
- **System Management**: 3 pages

### Configuration

- **Config Files**: 12 files in `config/`
- **Consolidated**: 9 files moved from `apps/web/src/config/`
- **Updated Imports**: 18 files

### Components

- **Shared Components**: `components/` (single source)
- **Layout Components**: `components/layout/`
- **UI Components**: `components/ui/`
- **Feature Components**: `components/features/`

---

## 🌐 Internationalization (i18n)

**Supported Languages**:

- Arabic (ar) - RTL
- English (en) - LTR

**Routing Pattern**: `/[lng]/(platform)/...`

**Examples**:

- `/ar/finance` - Finance in Arabic
- `/en/finance` - Finance in English
- `/ar/dashboard` - Dashboard in Arabic
- `/en/dashboard` - Dashboard in English

---

## 🔧 Technology Stack

### Frontend

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Components**: Shadcn UI
- **Icons**: Lucide React
- **State Management**: React Context API
- **Routing**: Next.js App Router (file-based)

### Backend

- **API**: Next.js API Routes
- **Database**: PostgreSQL (via Prisma)
- **ORM**: Prisma
- **Cache**: Redis
- **Authentication**: NextAuth.js

### Development

- **Language**: TypeScript + JavaScript
- **Package Manager**: npm
- **Build Tool**: Next.js
- **Type Checking**: TypeScript

---

## 🚀 Key Features

### ✅ Multi-Tenancy

- Platform admin, tenant admin, and team member roles
- Tenant isolation
- Role-based navigation
- Tenant-specific data

### ✅ Saudi Arabia Compliance

- ZATCA e-invoicing compliance
- SAR currency default
- Arabic (RTL) support
- Saudi Arabia timezone (Asia/Riyadh)
- Phone code (+966)

### ✅ Zero Mock Data

- All pages use real API services
- No fallback mock data
- Graceful error handling
- Empty states instead of mocks

### ✅ Production Ready

- Pre-production testing
- Error handling
- Logging and monitoring
- Security headers
- Performance optimization

---

## 📝 File Organization

### App Router Structure

```
app/
├── [lng]/                    # Language parameter
│   └── (platform)/          # Platform route group
│       └── [module]/        # Module pages
│           └── page.tsx     # Page component
├── api/                     # API routes
│   └── [module]/           # Module API
│       └── route.ts        # API handler
└── layout.tsx               # Root layout
```

### Component Organization

```
components/
├── layout/                  # Layout components
├── ui/                      # UI primitives
├── [module]/               # Module-specific components
└── common/                  # Common utilities
```

### Config Organization

```
config/
├── api.config.ts           # API configuration
├── database.config.ts      # Database configuration
├── redis.config.ts         # Redis configuration
└── [feature].config.js     # Feature-specific configs
```

---

## 🔄 Migration Status

### ✅ Completed

- Config consolidation to `config/`
- Navigation consolidation to `components/layout/MultiTenantNavigation.jsx`
- Component organization in `components/`
- Import path updates (18 files)

### ⚠️ Legacy Support

- `apps/web/` (React Router) - Kept for backward compatibility
- `apps/web/src/pages/index.js` - React Router page exports

---

## 📚 Documentation

- **Structure**: This file
- **Consolidation**: `ONE_APP_ONE_CONFIG_ONE_INDEX.md`
- **Status**: `CONSOLIDATION_STATUS.md`
- **API**: API routes documented in `app/api/`

---

**Last Updated**: 2024  
**Version**: 2.0.0  
**Status**: ✅ Production Ready
