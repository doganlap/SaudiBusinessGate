# 📊 Pages Created vs Loaded Status

## Quick Summary

| Metric | Count |
|--------|-------|
| **Page Files Created** | 71 files |
| **Pages Exported** | 69 exports |
| **Pages in Navigator** | 53 paths |
| **Pages NOT in Navigator** | ~16 pages |
| **Routes Defined** | 191 routes |
| **Coverage** | 77% loaded |

---

## ✅ Pages Loaded in Navigator (53)

All navigation items are defined in:
**File**: `apps/web/src/components/layout/MultiTenantNavigation.jsx`

### By Role:
- **Platform Admin**: 23 navigation items
- **Tenant Admin**: 18 navigation items  
- **Team Member**: 12 navigation items

---

## ❌ Pages NOT Loaded in Navigator (~16)

### Missing Functional Pages:
1. EvidenceUploadPage - `/app/evidence/upload`
2. SystemHealthDashboard - `/app/system/health`
3. DatabasePage - `/app/database`
4. APIManagementPage - `/app/system/api`
5. DocumentManagementPage - `/app/documents` (partially - only in tenant context)
6. TaskDashboard - `/app/tasks/board`
7. ModernAdvancedDashboard - `/app/dashboard/advanced`
8. RegulatoryMarketDashboard - `/app/dashboard/regulatory-market`

### Detail/Form Pages (Intentionally Not in Nav):
- OrganizationDetails - Accessed via Organizations list
- OrganizationForm - Accessed via "New" button
- AssessmentPage - Accessed via Assessments list
- AssessmentDetailsCollaborative - Accessed via Assessment details

### Auth/Public Pages (Separate Access):
- LoginPage, StoryDrivenRegistration - Direct URLs
- LandingPage, NotFoundPage - Public pages
- PartnerLanding, PartnerAppLayout - Partner path
- PocLanding, PocAppLayout - POC path

---

## 🎯 Action Items

### Add to Navigator (High Priority):
1. Evidence Upload
2. System Health
3. Database Management
4. API Management
5. Document Management (direct link)
6. Task Board View

**File to Edit**: `apps/web/src/components/layout/MultiTenantNavigation.jsx`

---

**Status**: 77% of functional pages loaded in navigator
**Next Step**: Add missing functional pages to navigation

