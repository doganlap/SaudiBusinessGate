# 🗺️ Route Mapping Documentation

## Current State: Dual Routing Systems

This document maps all routes to their respective routing systems and identifies gaps for migration.

---

## 📍 React Router Routes (`apps/web/src/App.jsx`)

### Public Routes

| Route | Component | Status | Next.js Equivalent |
|-------|-----------|--------|-------------------|
| `/` | Redirect to `/app` or external | ✅ Active | `app/page.tsx` (redirects to `/[lng]`) |
| `/welcome` | Redirect to `/` | ✅ Active | - |
| `/login` | `LoginPage` | ✅ Active | `app/auth/signin/page.tsx` |
| `/login-glass` | `LoginPage` | ✅ Active | `app/auth/signin/page.tsx` |
| `/register` | `StoryDrivenRegistration` | ✅ Active | `app/[lng]/register/page.tsx` |
| `/landing` | External redirect | ✅ Active | `app/landing/page.tsx` |
| `/home` | External redirect | ✅ Active | - |

### Partner Access Routes

| Route | Component | Status | Next.js Equivalent |
|-------|-----------|--------|-------------------|
| `/partner` | `PartnerLanding` | ✅ Active | ❌ **MISSING** |
| `/partner/login` | Redirect | ✅ Active | ❌ **MISSING** |
| `/partner/app/*` | `PartnerAppLayout` | ✅ Active | ❌ **MISSING** |

### POC Access Routes

| Route | Component | Status | Next.js Equivalent |
|-------|-----------|--------|-------------------|
| `/poc` | `PocLanding` | ✅ Active | ❌ **MISSING** |
| `/poc/request` | `PocRequest` | ✅ Active | ❌ **MISSING** |
| `/poc/app/*` | `PocAppLayout` | ✅ Active | ❌ **MISSING** |

### Advanced Dashboard Routes

| Route | Component | Status | Next.js Equivalent |
|-------|-----------|--------|-------------------|
| `/advanced` | `AdvancedAppShell` | ✅ Active | ❌ **MISSING** |
| `/advanced/assessments` | `AdvancedAssessmentManager` | ✅ Active | ❌ **MISSING** |
| `/advanced/frameworks` | `AdvancedFrameworkManager` | ✅ Active | ❌ **MISSING** |

### Main App Routes (`/app/*`)

| Route | Component | Status | Next.js Equivalent |
|-------|-----------|--------|-------------------|
| `/app` | `EnhancedDashboard` | ✅ Active | `app/[lng]/(platform)/dashboard/page.tsx` ✅ |
| `/app/dashboard` | `EnhancedDashboard` | ✅ Active | `app/[lng]/(platform)/dashboard/page.tsx` ✅ |
| `/app/dashboard/legacy` | `Dashboard` | ✅ Active | ❌ **MISSING** |
| `/app/dashboard/advanced` | `AdvancedGRCDashboard` | ✅ Active | ❌ **MISSING** |
| `/app/dashboard/tenant` | `TenantDashboard` | ✅ Active | ❌ **MISSING** |
| `/app/dashboard/regulatory-market` | `RegulatoryMarketDashboard` | ✅ Active | ❌ **MISSING** |

### GRC Module Routes

| Route | Component | Status | Next.js Equivalent |
|-------|-----------|--------|-------------------|
| `/app/assessments` | `AssessmentsModuleEnhanced` | ✅ Active | ❌ **MISSING** |
| `/app/assessments/:id` | `AssessmentPage` | ✅ Active | ❌ **MISSING** |
| `/app/assessments/:id/report` | `AssessmentDetailsCollaborative` | ✅ Active | ❌ **MISSING** |
| `/app/frameworks` | `FrameworksModuleEnhanced` | ✅ Active | `app/[lng]/(platform)/grc/frameworks/page.tsx` ✅ |
| `/app/frameworks/:id` | `FrameworksModuleEnhanced` | ✅ Active | ❌ **MISSING** (dynamic) |
| `/app/controls` | `ControlsModuleEnhanced` | ✅ Active | `app/[lng]/(platform)/grc/controls/page.tsx` ✅ |
| `/app/controls/:id` | `ControlsModuleEnhanced` | ✅ Active | ❌ **MISSING** (dynamic) |
| `/app/risks` | `RiskManagementModuleEnhanced` | ✅ Active | ❌ **MISSING** |
| `/app/risks/:id` | `RiskManagementModuleEnhanced` | ✅ Active | ❌ **MISSING** (dynamic) |
| `/app/compliance` | `ComplianceTrackingModuleEnhanced` | ✅ Active | ❌ **MISSING** |
| `/app/compliance/:id` | `ComplianceTrackingModuleEnhanced` | ✅ Active | ❌ **MISSING** (dynamic) |
| `/app/evidence` | `Evidence` | ✅ Active | ❌ **MISSING** |
| `/app/evidence/upload` | `EvidenceUploadPage` | ✅ Active | ❌ **MISSING** |
| `/app/evidence/:id` | `Evidence` | ✅ Active | ❌ **MISSING** (dynamic) |

### Organization & Tenant Routes

| Route | Component | Status | Next.js Equivalent |
|-------|-----------|--------|-------------------|
| `/app/organizations` | `OrganizationsPage` | ✅ Active | ❌ **MISSING** |
| `/app/organizations/new` | `OrganizationForm` | ✅ Active | ❌ **MISSING** |
| `/app/organizations/:id` | `OrganizationDetails` | ✅ Active | ❌ **MISSING** (dynamic) |
| `/app/organizations/:id/dashboard` | `OrganizationDashboard` | ✅ Active | ❌ **MISSING** (dynamic) |
| `/app/onboarding` | `OnboardingPage` | ✅ Active | ❌ **MISSING** |

### User & Access Management

| Route | Component | Status | Next.js Equivalent |
|-------|-----------|--------|-------------------|
| `/app/users` | `UserManagementPage` | ✅ Active | `app/[lng]/(platform)/platform/users/page.tsx` ✅ |
| `/app/users/:id` | `UserManagementPage` | ✅ Active | ❌ **MISSING** (dynamic) |
| `/app/audit` | `AuditLogsPage` | ✅ Active | `app/[lng]/(platform)/audit-logs/page.tsx` ✅ |

### Reports & Analytics

| Route | Component | Status | Next.js Equivalent |
|-------|-----------|--------|-------------------|
| `/app/reports` | `ReportsPage` | ✅ Active | ❌ **MISSING** |
| `/app/reports/compliance` | `ComplianceTrackingModuleEnhanced` | ✅ Active | ❌ **MISSING** |
| `/app/reports/risk` | `RiskManagementModuleEnhanced` | ✅ Active | ❌ **MISSING** |
| `/app/reports/frameworks` | `FrameworksModuleEnhanced` | ✅ Active | `app/[lng]/(platform)/grc/reports/page.tsx` ✅ |
| `/app/reports/assessments` | `AssessmentsModuleEnhanced` | ✅ Active | ❌ **MISSING** |

### System Management

| Route | Component | Status | Next.js Equivalent |
|-------|-----------|--------|-------------------|
| `/app/settings` | `SettingsPage` | ✅ Active | `app/[lng]/(platform)/platform/settings/page.tsx` ✅ |
| `/app/database` | `DatabasePage` | ✅ Active | ❌ **MISSING** |
| `/app/system` | `DatabasePage` | ✅ Active | ❌ **MISSING** |
| `/app/system/health` | `PerformanceMonitorPage` | ✅ Active | ❌ **MISSING** |
| `/app/system/api` | `APIManagementPage` | ✅ Active | `app/[lng]/(platform)/platform/api-status/page.tsx` ✅ |

### Workflows & Automation

| Route | Component | Status | Next.js Equivalent |
|-------|-----------|--------|-------------------|
| `/app/workflows` | `WorkflowManagementPage` | ✅ Active | `app/[lng]/(platform)/workflows/designer/page.tsx` ✅ |
| `/app/workflows/:id` | `WorkflowManagementPage` | ✅ Active | ❌ **MISSING** (dynamic) |

### Task Management

| Route | Component | Status | Next.js Equivalent |
|-------|-----------|--------|-------------------|
| `/app/tasks` | `TaskDashboard` | ✅ Active | `app/[lng]/(platform)/pm/tasks/page.tsx` ✅ |
| `/app/tasks/board` | `TaskDashboard` | ✅ Active | ❌ **MISSING** |
| `/app/tasks/list` | `TaskManagementPage` | ✅ Active | ❌ **MISSING** |
| `/app/tasks/:id` | `TaskManagementPage` | ✅ Active | ❌ **MISSING** (dynamic) |

### Gap Analysis & Remediation

| Route | Component | Status | Next.js Equivalent |
|-------|-----------|--------|-------------------|
| `/app/gaps` | `GapAnalysisPage` | ✅ Active | ❌ **MISSING** |
| `/app/gaps/:id` | `GapAnalysisPage` | ✅ Active | ❌ **MISSING** (dynamic) |
| `/app/remediation` | `RemediationPlanPage` | ✅ Active | ❌ **MISSING** |
| `/app/remediation/:id` | `RemediationPlanPage` | ✅ Active | ❌ **MISSING** (dynamic) |

### AI & RAG Services

| Route | Component | Status | Next.js Equivalent |
|-------|-----------|--------|-------------------|
| `/app/ai` | `AISchedulerPage` | ✅ Active | `app/[lng]/(platform)/ai-agents/page.tsx` ✅ |
| `/app/ai/scheduler` | `AISchedulerPage` | ✅ Active | ❌ **MISSING** |
| `/app/ai/rag` | `RAGServicePage` | ✅ Active | ❌ **MISSING** |
| `/app/rag` | `RAGServicePage` | ✅ Active | ❌ **MISSING** |
| `/app/mission-control` | `MissionControlPage` | ✅ Active | ❌ **MISSING** |
| `/app/chat` | `MissionControlPage` | ✅ Active | ❌ **MISSING** |

### Regulatory Intelligence

| Route | Component | Status | Next.js Equivalent |
|-------|-----------|--------|-------------------|
| `/app/regulatory` | `RegulatoryIntelligencePage` | ✅ Active | ❌ **MISSING** |
| `/app/regulatory/ksa` | `KSAGRCPage` | ✅ Active | ❌ **MISSING** |
| `/app/regulatory/sectors` | `SectorIntelligence` | ✅ Active | ❌ **MISSING** |
| `/app/regulators` | `RegulatorsPage` | ✅ Active | ❌ **MISSING** |

### License & Renewal Management

| Route | Component | Status | Next.js Equivalent |
|-------|-----------|--------|-------------------|
| `/app/licenses` | `LicensesManagementPage` | ✅ Active | `app/[lng]/(platform)/licenses/management/page.tsx` ✅ |
| `/app/licenses/:id` | `LicensesManagementPage` | ✅ Active | ❌ **MISSING** (dynamic) |
| `/app/renewals` | `RenewalsPipelinePage` | ✅ Active | `app/[lng]/(platform)/licenses/renewals/page.tsx` ✅ |
| `/app/usage` | `UsageDashboardPage` | ✅ Active | `app/[lng]/(platform)/licenses/usage/page.tsx` ✅ |
| `/app/upgrade` | `UpgradePage` | ✅ Active | `app/[lng]/(platform)/licenses/upgrade/page.tsx` ✅ |

### Finance Routes (React Router)

| Route | Component | Status | Next.js Equivalent |
|-------|-----------|--------|-------------------|
| `/app/finance` | ❌ Not in React Router | - | `app/[lng]/(platform)/finance/page.tsx` ✅ |
| `/app/finance/accounts` | ❌ Not in React Router | - | `app/[lng]/(platform)/finance/accounts/page.tsx` ✅ |
| `/app/finance/budgets` | ❌ Not in React Router | - | `app/[lng]/(platform)/finance/budgets/page.tsx` ✅ |
| `/app/finance/transactions` | ❌ Not in React Router | - | `app/[lng]/(platform)/finance/transactions/page.tsx` ✅ |

### CRM Routes (React Router)

| Route | Component | Status | Next.js Equivalent |
|-------|-----------|--------|-------------------|
| `/app/crm` | ❌ Not in React Router | - | `app/[lng]/(platform)/crm/page.tsx` ✅ |
| `/app/crm/contacts` | ❌ Not in React Router | - | `app/[lng]/(platform)/crm/contacts/page.tsx` ✅ |
| `/app/crm/customers` | ❌ Not in React Router | - | `app/[lng]/(platform)/crm/customers/page.tsx` ✅ |

### Sales Routes (React Router)

| Route | Component | Status | Next.js Equivalent |
|-------|-----------|--------|-------------------|
| `/app/sales` | ❌ Not in React Router | - | `app/[lng]/(platform)/sales/page.tsx` ✅ |
| `/app/sales/pipeline` | ❌ Not in React Router | - | `app/[lng]/(platform)/sales/pipeline/page.tsx` ✅ |
| `/app/sales/deals` | ❌ Not in React Router | - | `app/[lng]/(platform)/sales/deals/page.tsx` ✅ |

### HR Routes (React Router)

| Route | Component | Status | Next.js Equivalent |
|-------|-----------|--------|-------------------|
| `/app/hr` | ❌ Not in React Router | - | `app/[lng]/(platform)/hr/page.tsx` ✅ |
| `/app/hr/employees` | ❌ Not in React Router | - | `app/[lng]/(platform)/hr/employees/page.tsx` ✅ |
| `/app/hr/payroll` | ❌ Not in React Router | - | `app/[lng]/(platform)/hr/payroll/page.tsx` ✅ |

### Procurement Routes (React Router)

| Route | Component | Status | Next.js Equivalent |
|-------|-----------|--------|-------------------|
| `/app/procurement` | ❌ Not in React Router | - | `app/[lng]/(platform)/procurement/page.tsx` ✅ |
| `/app/procurement/inventory` | ❌ Not in React Router | - | `app/[lng]/(platform)/procurement/inventory/page.tsx` ✅ |
| `/app/procurement/orders` | ❌ Not in React Router | - | `app/[lng]/(platform)/procurement/orders/page.tsx` ✅ |

---

## 📍 Next.js App Router Routes (`app/[lng]/(platform)/`)

### Already Migrated Routes ✅

- ✅ Dashboard: `/[lng]/(platform)/dashboard`
- ✅ Finance: `/[lng]/(platform)/finance/*`
- ✅ CRM: `/[lng]/(platform)/crm/*`
- ✅ Sales: `/[lng]/(platform)/sales/*`
- ✅ HR: `/[lng]/(platform)/hr/*`
- ✅ Procurement: `/[lng]/(platform)/procurement/*`
- ✅ GRC: `/[lng]/(platform)/grc/*` (partial)
- ✅ Analytics: `/[lng]/(platform)/analytics/*`
- ✅ Platform: `/[lng]/(platform)/platform/*`
- ✅ Licenses: `/[lng]/(platform)/licenses/*`
- ✅ Workflows: `/[lng]/(platform)/workflows/designer`
- ✅ AI Agents: `/[lng]/(platform)/ai-agents`
- ✅ Project Management: `/[lng]/(platform)/pm/*`

---

## 🎯 Migration Priority

### Phase 1: Critical Missing Routes (High Priority)

1. **Partner & POC Routes** - Business critical
2. **GRC Enhanced Modules** - Core functionality
3. **Assessments** - High usage
4. **Evidence Management** - Important feature
5. **Gap Analysis & Remediation** - Key workflows

### Phase 2: Important Routes (Medium Priority)

1. **Advanced Dashboard Routes**
2. **Dynamic Routes** (`:id` parameters)
3. **Reports & Analytics** (missing variants)
4. **System Management** (database, health)
5. **Task Management** (board/list views)

### Phase 3: Nice-to-Have Routes (Low Priority)

1. **Legacy route variants**
2. **Route aliases** (enhanced/legacy)
3. **External integration routes**
4. **Public API documentation routes**

---

## 📊 Statistics

- **React Router Routes**: ~192 routes
- **Next.js App Router Pages**: ~80 pages
- **Missing in Next.js**: ~112 routes
- **Already Migrated**: ~80 routes
- **Migration Progress**: ~42%

---

**Last Updated**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
