# API TRACKING DASHBOARD

**DoganHubStore Enterprise - Complete API Inventory**

## ?? OVERVIEW STATISTICS

| Metric | Count |
|--------|-------|
| **Total APIs** | 95 |
| **Database-Connected** | 78 (82%) |
| **Mock/External** | 17 (18%) |
| **Unique UI Components** | 65+ |
| **Database Tables Used** | 35+ |

---

## ??? MODULE BREAKDOWN

### 1. Authentication & Authorization (5 APIs)

| API | DB | UI Component | File |
|-----|----|--------------| |
| POST /api/auth/[...nextauth] | ? | Login Page | app/api/auth/[...nextauth]/route.ts |
| POST /api/auth/login | ? | Login Form | app/api/auth/login/route.ts |
| GET /api/auth/me | ? | Header Navigation | app/api/auth/me/route.ts |
| POST /api/auth/sync-user | ? | N/A | app/api/auth/sync-user/route.ts |
| POST /api/auth/register | ? | Registration Form | app/api/auth/register/route.ts |

**Tables**: `users`, `accounts`, `sessions`, `verification_tokens`, `audit_logs`, `organizations`

---

### 2. Analytics & KPIs (10 APIs)

| API | DB | UI Component | File |
|-----|----|--------------| |
| GET /api/analytics/kpis/business | ? | **BusinessKpiDashboard** | app/api/analytics/kpis/business/route.ts |
| GET /api/analytics/forecast/sales | ? | Sales Forecast Widget | app/api/analytics/forecast/sales/route.ts |
| GET /api/analytics/customer-analytics | ? | Customer Analytics Dashboard | app/api/analytics/customer-analytics/route.ts |
| GET /api/analytics/financial-analytics | ? | Financial Dashboard | app/api/analytics/financial-analytics/route.ts |
| POST /api/analytics/ai-insights | ? | AI Insights Panel | app/api/analytics/ai-insights/route.ts |
| GET /api/analytics/real-time | ? | Real-time Dashboard | app/api/analytics/real-time/route.ts |
| POST /api/analytics/churn-prediction | ? | Churn Analysis | app/api/analytics/churn-prediction/route.ts |
| POST /api/analytics/lead-scoring | ? | Lead Score Widget | app/api/analytics/lead-scoring/route.ts |
| POST /api/analytics/anomaly-detection | ? | Anomaly Alerts | app/api/analytics/anomaly-detection/route.ts |
| GET /api/analytics/trend-analysis | ? | Trend Charts | app/api/analytics/trend-analysis/route.ts |

**Tables**: `transactions`, `users`, `organizations`, `audit_logs`, `contacts`, `deals`

**Connected UI**:

- `app/dashboard/components/BusinessKpiDashboard.tsx` ? **Main KPI Consumer**
- `app/analytics/customers/page.tsx`
- `app/analytics/financial/page.tsx`
- `app/dashboard/components/AIInsightsPanel.tsx`

---

### 3. Reports Module (9 APIs)

| API | DB | UI Component | File |
|-----|----|--------------| |
| GET /api/reports/templates | ? | **Report Builder Step 1** | app/api/reports/templates/route.ts |
| POST /api/reports/preview | ? | **Report Builder Step 4** | app/api/reports/preview/route.ts |
| GET /api/reports | ? | Reports List | app/api/reports/route.ts |
| POST /api/reports | ? | Report Builder | app/api/reports/route.ts |
| POST /api/reports/[reportId]/execute | ? | **Report Viewer** | app/api/reports/[reportId]/execute/route.ts |
| GET /api/reports/[reportId] | ? | Report Details | app/api/reports/[reportId]/route.ts |
| PUT /api/reports/[reportId] | ? | Report Editor | app/api/reports/[reportId]/route.ts |
| DELETE /api/reports/[reportId] | ? | Reports List | app/api/reports/[reportId]/route.ts |
| POST /api/reports/export/[format] | ? | Report Viewer | app/api/reports/export/[format]/route.ts |

**Tables**: `custom_reports`, plus varies by template (users, transactions, audit_logs, organizations)

**Connected UI**:

- `app/reports/builder/components/ReportBuilderForm.tsx` ? **Main Report Builder**
- `app/reports/[reportId]/components/ReportViewer.tsx` ? **Main Report Viewer**
- `app/reports/builder/page.tsx`
- `app/reports/[reportId]/page.tsx`
- `app/reports/page.tsx`

---

### 4. Finance Module (13 APIs)

| API | DB | UI Component | File |
|-----|----|--------------| |
| GET /api/finance/invoices | ? | **Financial Hub** | app/api/finance/invoices/route.ts |
| POST /api/finance/invoices | ? | Invoice Creator | app/api/finance/invoices/route.ts |
| GET /api/finance/invoices/[id] | ? | Invoice Details | app/api/finance/invoices/[id]/route.ts |
| GET /api/finance/accounts | ? | Chart of Accounts | app/api/finance/accounts/route.ts |
| POST /api/finance/accounts | ? | Account Creator | app/api/finance/accounts/route.ts |
| GET /api/finance/budgets | ? | Budget Dashboard | app/api/finance/budgets/route.ts |
| POST /api/finance/budgets | ? | Budget Creator | app/api/finance/budgets/route.ts |
| GET /api/finance/transactions | ? | Transaction List | app/api/finance/transactions/route.ts |
| POST /api/finance/transactions | ? | Transaction Form | app/api/finance/transactions/route.ts |
| GET /api/finance/journal-entries | ? | Journal Entries | app/api/finance/journal-entries/route.ts |
| POST /api/finance/journal-entries | ? | Journal Entry Form | app/api/finance/journal-entries/route.ts |
| GET /api/finance/stats | ? | Finance Dashboard | app/api/finance/stats/route.ts |
| GET /api/finance/reports | ? | Finance Reports | app/api/finance/reports/route.ts |

**Tables**: `invoices`, `invoice_line_items`, `chart_of_accounts`, `budgets`, `transactions`, `journal_entries`, `deals`, `payments`

**Connected UI**:

- `app/finance/hub/components/FinancialHubClient.tsx` ? **Main Finance UI**
- `app/finance/invoices/[id]/page.tsx`
- `app/finance/accounts/page.tsx`
- `app/finance/budgets/page.tsx`
- `app/finance/transactions/page.tsx`

---

### 5. CRM Module (11 APIs)

| API | DB | UI Component | File |
|-----|----|--------------| |
| GET /api/crm/contacts | ? | Contacts List | app/api/crm/contacts/route.ts |
| POST /api/crm/contacts | ? | Contact Form | app/api/crm/contacts/route.ts |
| GET /api/crm/contacts/[id] | ? | Contact Details | app/api/crm/contacts/[id]/route.ts |
| GET /api/crm/pipeline | ? | **Pipeline Board** | app/api/crm/pipeline/route.ts |
| GET /api/crm/deals | ? | Deals List | app/api/crm/deals/route.ts |
| POST /api/crm/deals | ? | Deal Creator | app/api/crm/deals/route.ts |
| PATCH /api/crm/deals/[dealId]/stage | ? | **Pipeline Board** (Drag) | app/api/crm/deals/[dealId]/stage/route.ts |
| POST /api/crm/deals/[dealId]/quote | ? | Quote Creator | app/api/crm/deals/[dealId]/quote/route.ts |
| GET /api/crm/activities | ? | Activity Timeline | app/api/crm/activities/route.ts |
| POST /api/crm/activities | ? | Activity Logger | app/api/crm/activities/route.ts |
| GET /api/crm/customers | ? | Customer List | app/api/crm/customers/route.ts |

**Tables**: `contacts`, `deals`, `quotes`, `quote_line_items`, `activities`, `customers`

**Connected UI**:

- `app/crm/pipeline/components/PipelineBoard.tsx` ? **Main CRM UI (Kanban)**
- `app/crm/contacts/page.tsx`
- `app/crm/deals/page.tsx`
- `app/crm/deals/[dealId]/components/QuoteForm.tsx`

---

### 6. Billing & Licensing (9 APIs)

| API | DB | UI Component | File |
|-----|----|--------------| |
| GET /api/billing/plans | ? | Pricing Page | app/api/billing/plans/route.ts |
| POST /api/billing/checkout | ? | Checkout Page | app/api/billing/checkout/route.ts |
| GET /api/billing/portal | ? | Billing Portal | app/api/billing/portal/route.ts |
| POST /api/billing/activate | ? | Activation Page | app/api/billing/activate/route.ts |
| POST /api/billing/send-activation | ? | Admin Panel | app/api/billing/send-activation/route.ts |
| GET /api/billing/subscription/[tenantId] | ? | Settings Page | app/api/billing/subscription/[tenantId]/route.ts |
| GET /api/license/check | ? | **All Protected Pages** | app/api/license/check/route.ts |
| GET /api/license/tenant/[tenantId] | ? | License Dashboard | app/api/license/tenant/[tenantId]/route.ts |
| GET /api/license/usage/[tenantId] | ? | Usage Dashboard | app/api/license/usage/[tenantId]/route.ts |

**Tables**: `subscriptions`, `licenses`, `license_usage_logs`

**Connected UI**:

- `hooks/useLicensedDashboard.ts` ? **Main License Hook (used everywhere)**
- `app/billing/pricing/page.tsx`
- `app/billing/activate/page.tsx`
- `app/settings/billing/page.tsx`

---

### 7. GRC (Governance, Risk, Compliance) (11 APIs)

| API | DB | UI Component | File |
|-----|----|--------------| |
| GET /api/grc/controls | ? | Controls List | app/api/grc/controls/route.ts |
| POST /api/grc/controls | ? | Control Creator | app/api/grc/controls/route.ts |
| GET /api/grc/controls/[id] | ? | Control Details | app/api/grc/controls/[id]/route.ts |
| GET /api/grc/frameworks | ? | Frameworks List | app/api/grc/frameworks/route.ts |
| GET /api/grc/frameworks/[id]/sections | ? | Framework Details | app/api/grc/frameworks/[id]/sections/route.ts |
| GET /api/grc/tests | ? | Tests List | app/api/grc/tests/route.ts |
| POST /api/grc/tests | ? | Test Creator | app/api/grc/tests/route.ts |
| POST /api/grc/tests/[id]/execute | ? | Test Executor | app/api/grc/tests/[id]/execute/route.ts |
| GET /api/grc/exceptions | ? | Exceptions List | app/api/grc/exceptions/route.ts |
| POST /api/grc/exceptions | ? | Exception Form | app/api/grc/exceptions/route.ts |
| GET /api/grc/alerts | ? | Alerts Dashboard | app/api/grc/alerts/route.ts |

**Tables**: `grc_controls`, `grc_frameworks`, `grc_framework_sections`, `grc_tests`, `grc_test_results`, `grc_exceptions`, `grc_alerts`

**Connected UI**:

- `app/grc/controls/page.tsx`
- `app/grc/frameworks/page.tsx`
- `app/grc/tests/page.tsx`
- `app/grc/dashboard/page.tsx`

---

### 8. HR Module (6 APIs)

| API | DB | UI Component | File |
|-----|----|--------------| |
| GET /api/hr/employees | ? | Employee List | app/api/hr/employees/route.ts |
| POST /api/hr/employees | ? | Employee Form | app/api/hr/employees/route.ts |
| GET /api/hr/attendance | ? | Attendance Dashboard | app/api/hr/attendance/route.ts |
| POST /api/hr/attendance | ? | Attendance Logger | app/api/hr/attendance/route.ts |
| GET /api/hr/payroll | ? | Payroll Dashboard | app/api/hr/payroll/route.ts |
| POST /api/hr/payroll | ? | Payroll Processor | app/api/hr/payroll/route.ts |

**Tables**: `employees`, `attendance_records`, `payroll_records`

**Connected UI**:

- `app/hr/employees/page.tsx`
- `app/hr/attendance/page.tsx`
- `app/hr/payroll/page.tsx`

---

### 9. Dashboard & Stats (3 APIs)

| API | DB | UI Component | File |
|-----|----|--------------| |
| GET /api/dashboard/stats | ? | **Main Dashboard** | app/api/dashboard/stats/route.ts |
| GET /api/dashboard/activity | ? | Activity Feed | app/api/dashboard/activity/route.ts |
| GET /api/dashboard/widgets | ? | Dashboard | app/api/dashboard/widgets/route.ts |

**Tables**: Multiple aggregated tables, `audit_logs`, `activities`, `user_preferences`

**Connected UI**:

- `app/dashboard/page.tsx` ? **Main Dashboard Page**
- `app/dashboard/components/ActivityFeed.tsx`

---

### 10. AI & Agents (5 APIs)

| API | DB | UI Component | File |
|-----|----|--------------| |
| POST /api/ai-agents | ? | AI Assistant | app/api/ai-agents/route.ts |
| POST /api/agents/self-healing | ? | System Monitor | app/api/agents/self-healing/route.ts |
| POST /api/ai/finance-agents | ? | Finance Dashboard | app/api/ai/finance-agents/route.ts |
| POST /api/llm/generate | ? | Content Generator | app/api/llm/generate/route.ts |
| GET /api/ai/config | ? | AI Settings | app/api/ai/config/route.ts |

**Tables**: `agent_execution_logs`, `transactions`, `invoices`, `ai_configurations`

**Connected UI**:

- `app/components/AIAssistant.tsx`
- `app/admin/monitoring/page.tsx`
- `app/tools/content-generator/page.tsx`

---

### 11. Integrations & Webhooks (3 APIs)

| API | DB | UI Component | File |
|-----|----|--------------| |
| GET /api/integrations/webhooks | ? | Webhooks List | app/api/integrations/webhooks/route.ts |
| POST /api/integrations/webhooks | ? | Webhook Creator | app/api/integrations/webhooks/route.ts |
| DELETE /api/integrations/webhooks/[id] | ? | Webhooks List | app/api/integrations/webhooks/[id]/route.ts |

**Tables**: `webhooks`

**Connected UI**:

- `app/integrations/webhooks/page.tsx`
- `app/integrations/webhooks/create/page.tsx`

---

### 12. Themes & White-Label (2 APIs)

| API | DB | UI Component | File |
|-----|----|--------------| |
| GET /api/themes/[organizationId] | ? | **All Pages (Global)** | app/api/themes/[organizationId]/route.ts |
| PUT /api/themes/[organizationId] | ? | Theme Editor | app/api/themes/[organizationId]/route.ts |

**Tables**: `organization_themes`

**Connected UI**:

- `app/layout.tsx` (ThemeProvider) ? **GLOBAL**
- `app/settings/theme/page.tsx`

---

### 13. Workflows (3 APIs)

| API | DB | UI Component | File |
|-----|----|--------------| |
| GET /api/workflows | ? | Workflows List | app/api/workflows/route.ts |
| POST /api/workflows | ? | Workflow Builder | app/api/workflows/route.ts |
| POST /api/workflows/[id]/execute | ? | Workflow Details | app/api/workflows/[id]/execute/route.ts |

**Tables**: `workflows`, `workflow_executions`

**Connected UI**:

- `app/workflows/page.tsx`
- `app/workflows/create/page.tsx`
- `app/workflows/[id]/page.tsx`

---

### 14. Platform Management (1 API)

| API | DB | UI Component | File |
|-----|----|--------------| |
| GET /api/platform/owner-permissions | ? | Admin Dashboard | app/api/platform/owner-permissions/route.ts |

**Tables**: `permissions`, `roles`

**Connected UI**:

- `app/admin/permissions/page.tsx`

---

### 15. Payment (1 API)

| API | DB | UI Component | File |
|-----|----|--------------| |
| POST /api/payment | ? | Payment Form | app/api/payment/route.ts |

**Tables**: `transactions`, `payments`

**Connected UI**:

- `app/payments/checkout/page.tsx`

---

## ?? KEY API-TO-UI MAPPINGS

### Most Important Connections

#### 1. **Dashboard Ecosystem**

```
/api/analytics/kpis/business
  ?
app/dashboard/components/BusinessKpiDashboard.tsx
  ?
app/dashboard/page.tsx
```

#### 2. **Report Builder Flow**

```
/api/reports/templates (Step 1: Select Template)
  ?
/api/reports/preview (Step 4: Preview)
  ?
POST /api/reports (Save)
  ?
/api/reports/[id]/execute (View)
  ?
app/reports/builder/components/ReportBuilderForm.tsx
app/reports/[reportId]/components/ReportViewer.tsx
```

#### 3. **CRM Pipeline**

```
/api/crm/pipeline (Load)
  ?
/api/crm/deals/[id]/stage (Update)
  ?
app/crm/pipeline/components/PipelineBoard.tsx
```

#### 4. **Finance Hub**

```
/api/finance/invoices (Load)
/api/crm/deals (Load)
  ?
app/finance/hub/components/FinancialHubClient.tsx
```

#### 5. **License System (Global)**

```
/api/license/check
  ?
hooks/useLicensedDashboard.ts
  ?
ALL Protected Components
```

---

## ?? FILE LOCATIONS

### API Routes

- All in `app/api/` directory
- Follow Next.js 13+ App Router pattern
- Each route.ts exports GET, POST, PUT, DELETE handlers

### UI Components

- Pages: `app/[module]/page.tsx`
- Components: `app/[module]/components/`
- Hooks: `hooks/`

### Services

- `Services/AI/` - AI & Analytics engines
- `Services/Security/` - Authorization
- `Services/Reports/` - Query builder
- `Services/Finance/` - Finance logic
- `Services/CRM/` - CRM logic
- `Services/Workflow/` - Workflow engine
- `Services/Performance/` - Caching
- `Services/WhiteLabel/` - Theme management

---

## ?? QUICK REFERENCE

### To add a new API

1. Create `app/api/[module]/[endpoint]/route.ts`
2. Add to this tracking table
3. Create UI component in `app/[module]/components/`
4. Update `API_MASTER_TRACKING_TABLE.csv`

### To find API usage

1. Search `API_MASTER_TRACKING_TABLE.csv` for endpoint
2. Check UI_File_Path column for consuming component
3. Check File_Path column for API implementation

---

**Last Updated**: 2025-01-11  
**Total APIs Tracked**: 95  
**Completion**: 100%
