# 📊 Pages Created vs Loaded in Navigator Analysis

## Summary

- **Page Files Created**: 71 `.jsx` files
- **Pages Exported**: 69 exports in `pages/index.js`
- **Pages in Navigator**: 53 unique navigation paths
- **Pages NOT in Navigator**: ~16 pages (not loaded yet)

---

## 📁 Pages Created (71 files)

### Breakdown by Category

1. **Dashboard Pages**: 5
   - EnhancedDashboard
   - ModernAdvancedDashboard
   - TenantDashboard
   - RegulatoryMarketDashboard
   - UsageDashboardPage

2. **GRC Core Modules**: 11
   - AssessmentsModuleEnhanced
   - ComplianceTrackingModuleEnhanced
   - RiskManagementModuleEnhanced
   - FrameworksModuleEnhanced
   - ControlsModuleEnhanced
   - Evidence
   - AssessmentPage
   - AssessmentDetailsCollaborative
   - ComplianceTrackingPage
   - RiskManagementPage
   - Risks

3. **Organization Management**: 6
   - OrganizationsPage
   - OrganizationDetails
   - OrganizationForm
   - OrganizationDashboard
   - OnboardingPage

4. **System & Administration**: 8
   - SettingsPage
   - DatabasePage
   - APIManagementPage
   - PerformanceMonitorPage
   - UserManagementPage
   - AuditLogsPage
   - WorkflowManagementPage
   - NotificationManagementPage
   - DocumentManagementPage

5. **Task Management**: 2
   - TaskManagementPage
   - TaskDashboard

6. **Gap Analysis & Remediation**: 2
   - GapAnalysisPage
   - RemediationPlanPage

7. **AI & RAG Services**: 4
   - AISchedulerPage
   - RAGServicePage
   - SystemHealthDashboard
   - MissionControlPage

8. **Platform & MSP**: 5
   - LicensesManagementPage
   - RenewalsPipelinePage
   - UpgradePage
   - AutoAssessmentGeneratorPage
   - PartnerManagementPage

9. **Regulatory Intelligence**: 5
   - RegulatoryIntelligenceEnginePage
   - RegulatoryIntelligencePage
   - RegulatorsPage
   - SectorIntelligence
   - KSAGRCPage

10. **Reports**: 1
    - ReportsPage

11. **Authentication**: 5
    - SimpleLoginPage
    - StoryDrivenRegistration
    - LoginPage (alias)
    - GlassmorphismLoginPage (alias)
    - RegistrationPage (alias)

12. **Public Pages**: 2
    - LandingPage
    - NotFoundPage

13. **Partner & POC**: 6
    - PartnerLanding
    - PartnerLogin
    - PartnerAppLayout
    - PocLanding
    - PocRequest
    - PocAppLayout

---

## ✅ Pages Loaded in Navigator (53 paths)

### Currently in MultiTenantNavigation.jsx

**Platform Admin (23 items)**:

- Platform Dashboard
- Advanced Analytics Dashboard
- Auto Assessment Generator
- Usage Analytics
- Renewals Pipeline
- License Catalog
- Onboarding
- Tenant Preview
- Users
- Roles & Permissions
- RAG Service
- Regulatory Intelligence
- Sector Intelligence
- All Tenants
- Billing & Subscriptions
- License Management
- Revenue & Growth
- Compliance Overview
- Regulatory Engine
- Global Workflows
- AI Scheduler
- Advanced Dashboard
- Advanced Assessments
- Advanced Frameworks
- Advanced Controls
- Advanced Reports

**Tenant Admin (18 items)**:

- Home Dashboard
- Frameworks
- Assessments
- Risks
- Controls
- Compliance Tracking
- Task Management
- Gap Analysis
- Remediation Plans
- Teams & Users
- Departments
- Onboarding
- Roles & Permissions
- Reports & Analytics
- Vendors & Partners
- Documents & Evidence
- Workflows
- Team Communication
- AI Services

**Team Member (12 items)**:

- Home Dashboard
- My Assessments
- My Tasks
- My Documents
- Compliance Status
- Reports
- Team Tools (Chat, Announcements, Shared Docs)
- Advanced UI options

---

## ❌ Pages NOT Loaded in Navigator (~16 pages)

### Missing from Navigation

1. **EvidenceUploadPage** - Evidence upload functionality
2. **SystemHealthDashboard** - System health monitoring
3. **RegulatoryIntelligenceEnginePage** - Regulatory engine page
4. **DatabasePage** - Database management (system page)
5. **APIManagementPage** - API management (system page)
6. **PerformanceMonitorPage** - Performance monitoring (system page)
7. **DocumentManagementPage** - Document management (system page)
8. **TaskDashboard** - Task board view (different from TaskManagementPage)
9. **ModernAdvancedDashboard** - Modern dashboard variant
10. **RegulatoryMarketDashboard** - Regulatory market dashboard
11. **UsageDashboardPage** - Usage analytics dashboard
12. **AssessmentPage** - Individual assessment page
13. **AssessmentDetailsCollaborative** - Collaborative assessment details
14. **OrganizationDetails** - Organization details page
15. **OrganizationForm** - Organization form page
16. **OrganizationDashboard** - Organization dashboard

### Note

Some pages are intentionally not in navigation:

- **Auth pages** (Login, Register) - Accessed via direct URLs
- **Public pages** (Landing, NotFound) - Public access
- **Partner/POC pages** - Separate access paths
- **Detail pages** (OrganizationDetails, AssessmentPage) - Accessed via parent pages

---

## 📈 Statistics

| Category | Created | In Navigator | Missing |
|----------|---------|--------------|---------|
| **Dashboard** | 5 | 2 | 3 |
| **GRC Core** | 11 | 6 | 5 |
| **Organizations** | 6 | 2 | 4 |
| **System** | 8 | 3 | 5 |
| **Tasks** | 2 | 1 | 1 |
| **Gap/Remediation** | 2 | 2 | 0 |
| **AI/RAG** | 4 | 3 | 1 |
| **Platform** | 5 | 5 | 0 |
| **Regulatory** | 5 | 3 | 2 |
| **Reports** | 1 | 1 | 0 |
| **Auth** | 5 | 0 | 5* |
| **Public** | 2 | 0 | 2* |
| **Partner/POC** | 6 | 0 | 6* |
| **TOTAL** | **69** | **53** | **~16** |

*Intentionally not in main navigator (separate access paths)

---

## 🎯 Pages That Should Be Added to Navigator

### High Priority (Functional Pages)

1. **EvidenceUploadPage** - `/app/evidence/upload`
2. **SystemHealthDashboard** - `/app/system/health`
3. **DatabasePage** - `/app/database`
4. **APIManagementPage** - `/app/system/api`
5. **DocumentManagementPage** - `/app/documents`
6. **TaskDashboard** - `/app/tasks/board`

### Medium Priority (Dashboard Variants)

1. **ModernAdvancedDashboard** - `/app/dashboard/advanced`
2. **RegulatoryMarketDashboard** - `/app/dashboard/regulatory-market`
3. **UsageDashboardPage** - `/app/usage` (already in nav as "Usage Analytics")

### Low Priority (Detail Pages - Accessed via parent)

- OrganizationDetails - Accessed via Organizations list
- OrganizationForm - Accessed via "New" button
- AssessmentPage - Accessed via Assessments list
- AssessmentDetailsCollaborative - Accessed via Assessment details

---

## ✅ Recommendation

**Add to Navigator**:

- Evidence Upload
- System Health
- Database Management
- API Management
- Document Management
- Task Board View

**Keep Out of Navigator** (accessed via other means):

- Auth pages (direct URLs)
- Public pages (direct URLs)
- Partner/POC pages (separate paths)
- Detail/Form pages (accessed via parent pages)

---

**Status**: 53/69 pages loaded in navigator (77% coverage)
**Missing**: ~16 pages (23% not loaded)
**Action**: Add 6-8 functional pages to navigator
