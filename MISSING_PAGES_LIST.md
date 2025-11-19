# 📋 Missing Pages List - 12 Pages Not Yet Exported

**Date:** 2025-11-18  
**Status:** Pages in navigation but not exported in `pages/index.js`

---

## ⚠️ Missing Pages (12 Total)

### 1. **Risk Analytics**
- **Navigation Path:** `/app/risks/enhanced`
- **Navigation ID:** `risk-analytics`
- **Expected Export:** `RisksEnhancedPage` or `RiskAnalyticsPage`
- **Description:** Risk analysis and heatmaps

### 2. **Organizations List**
- **Navigation Path:** `/app/organizations/list`
- **Navigation ID:** `organizations-list`
- **Expected Export:** `OrganizationsListPage`
- **Description:** List all organizations

### 3. **Legacy Compliance**
- **Navigation Path:** `/app/compliance/legacy`
- **Navigation ID:** `legacy-compliance`
- **Expected Export:** `ComplianceLegacyPage` or `ComplianceTrackingPage` (legacy variant)
- **Description:** Original compliance tracking

### 4. **Legacy Risk Management**
- **Navigation Path:** `/app/risks/legacy`
- **Navigation ID:** `legacy-risk`
- **Expected Export:** `RisksLegacyPage` or `RiskManagementPage` (legacy variant)
- **Description:** Original risk management

### 5. **Risks List**
- **Navigation Path:** `/app/risks/list`
- **Navigation ID:** `risks-list`
- **Expected Export:** `RisksListPage`
- **Description:** Simple risks listing

### 6. **Collaborative Assessment**
- **Navigation Path:** `/app/assessments/:id/collaborative`
- **Navigation ID:** `assessment-collaborative`
- **Expected Export:** `AssessmentDetailsCollaborative` (may already exist but needs verification)
- **Description:** Real-time collaborative assessments

### 7. **Roles & Permissions**
- **Navigation Path:** `/app/settings/security`
- **Navigation ID:** `roles-permissions`
- **Expected Export:** `SettingsSecurityPage` or `RolesPermissionsPage`
- **Description:** Roles and permissions management

### 8. **Compliance Overview**
- **Navigation Path:** `/app/reports/compliance`
- **Navigation ID:** `compliance-overview`
- **Expected Export:** `ReportsCompliancePage` or `ComplianceOverviewPage`
- **Description:** Compliance overview report

### 9. **Risk Assessment** (Alternative)
- **Navigation Path:** `/app/risk-management`
- **Navigation ID:** `risk-management`
- **Expected Export:** `RiskAssessmentPage` or `RiskManagementPage`
- **Description:** Assess & treat risks

### 10. **Regulatory Intelligence** (Alternative Path)
- **Navigation Path:** `/app/regulatory-intelligence`
- **Navigation ID:** `regulatory-intelligence`
- **Expected Export:** `RegulatoryIntelligencePage` (may exist but path differs)
- **Description:** Regulatory updates

### 11. **Sector Intelligence** (Alternative Path)
- **Navigation Path:** `/app/sector-intelligence`
- **Navigation ID:** `sector-intelligence`
- **Expected Export:** `SectorIntelligence` (may exist but path differs)
- **Description:** Industry insights

### 12. **Regulatory Engine**
- **Navigation Path:** `/app/regulatory-engine`
- **Navigation ID:** `regulatory-engine`
- **Expected Export:** `RegulatoryEnginePage` or `RegulatoryIntelligenceEnginePage`
- **Description:** Intelligence engine

---

## 📊 Summary

### Missing Page Categories:
1. **Legacy Pages** (2): Legacy Compliance, Legacy Risk Management
2. **List Views** (2): Organizations List, Risks List
3. **Enhanced/Analytics** (2): Risk Analytics, Compliance Overview
4. **Alternative Paths** (3): Regulatory Intelligence, Sector Intelligence, Regulatory Engine
5. **Settings/Admin** (1): Roles & Permissions
6. **Collaborative** (1): Collaborative Assessment
7. **Risk Management** (1): Risk Assessment (alternative)

### Total: **12 Pages**

---

## 🔧 How to Fix

### Option 1: Create Missing Page Components
Create new page components for pages that don't exist yet.

### Option 2: Add Exports to `pages/index.js`
If pages exist but aren't exported, add them to the exports in `apps/web/src/pages/index.js`.

### Option 3: Map to Existing Pages
Some pages may already exist with different names - map navigation paths to existing exports.

---

## ✅ Next Steps

1. **Verify** which pages already exist but aren't exported
2. **Create** missing page components
3. **Export** all pages in `pages/index.js`
4. **Update** navigation if needed
5. **Test** all navigation links

---

**Last Updated:** 2025-11-18

