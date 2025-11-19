# Page Registration Fix - Summary

## Problem Identified
Newly added pages, scripts, and features were not showing in the app UI because they were not properly registered in the application's routing and navigation system.

## Root Causes
1. **Missing Exports**: Several pages were imported directly in `App.jsx` but were NOT exported from the centralized `pages/index.js` file
2. **Missing Navigation Links**: New pages were not added to the navigation menus (Sidebar and MultiTenantNavigation)
3. **Inconsistent Import Pattern**: Some pages used direct imports instead of the centralized export pattern

## Pages Fixed
The following pages were missing from the exports and have now been added:

1. **OnboardingPage** - Organization onboarding flow
2. **OrganizationDashboard** - Organization-specific dashboard
3. **AssessmentPage** - Individual assessment details
4. **EvidenceUploadPage** - Evidence upload interface
5. **TaskManagementPage** - Task management interface
6. **TaskDashboard** - Task dashboard/board view
7. **GapAnalysisPage** - Gap analysis tool
8. **RemediationPlanPage** - Remediation planning interface

## Changes Made

### 1. Updated `apps/web/src/pages/index.js`
Added exports for all missing pages:
- Added to Organization Management section: `OnboardingPage`, `OrganizationDashboard`
- Added to GRC Core Modules section: `AssessmentPage`
- Added to Controls section: `EvidenceUploadPage`
- Added new sections: Task Management, Gap Analysis & Remediation

### 2. Updated `apps/web/src/App.jsx`
- Removed direct imports of pages
- Added all pages to centralized import from `./pages`
- All pages now follow consistent import pattern

### 3. Updated Navigation Menus

#### `apps/web/src/components/layout/Sidebar.jsx`
- Added "Onboarding" to Governance section
- Added "Task Management", "Gap Analysis", and "Remediation Plans" to Compliance Operations section

#### `apps/web/src/components/layout/MultiTenantNavigation.jsx`
- Added "Task Management", "Gap Analysis", and "Remediation Plans" to GRC Core Modules for tenant_admin
- Added "Onboarding" to Organization Management for tenant_admin

## How to Add New Pages in the Future

To ensure new pages appear in the app UI, follow these steps:

### Step 1: Create the Page Component
Create your page component in the appropriate directory under `apps/web/src/pages/`

### Step 2: Export from Centralized Index
Add the export to `apps/web/src/pages/index.js` in the appropriate section:
```javascript
export { default as YourNewPage } from './your-folder/YourNewPage.jsx';
```

### Step 3: Import in App.jsx
Add the import to the centralized import statement in `apps/web/src/App.jsx`:
```javascript
import {
  // ... other imports
  YourNewPage,
} from './pages';
```

### Step 4: Add Route in App.jsx
Add the route definition in the Routes section:
```javascript
<Route path="your-path" element={<YourNewPage />} />
```

### Step 5: Add to Navigation
Add navigation links in:
- `apps/web/src/components/layout/Sidebar.jsx` - Add to appropriate navigation group
- `apps/web/src/components/layout/MultiTenantNavigation.jsx` - Add to appropriate role's navigation

### Step 6: Clear Build Cache (if needed)
If pages still don't appear after adding:
```bash
# Clear Next.js cache
rm -rf .next
rm -rf node_modules/.cache

# Rebuild
npm run build
```

## Verification Checklist
- [x] All pages exported from `pages/index.js`
- [x] All pages imported in `App.jsx` from centralized index
- [x] All routes defined in `App.jsx`
- [x] Navigation links added to Sidebar
- [x] Navigation links added to MultiTenantNavigation
- [x] No linter errors

## Testing
After these changes:
1. Restart the development server
2. Clear browser cache if needed
3. Navigate to the new pages via:
   - Direct URL (e.g., `/app/tasks`)
   - Navigation menu
   - Search in sidebar

## Notes
- The app uses React Router for routing (not Next.js routing)
- Pages are organized by feature in subdirectories
- Navigation is role-based (platform_admin, tenant_admin, team_member)
- Always use the centralized export pattern for consistency

