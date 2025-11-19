# 🔍 Navigation Pages Not Appearing - Diagnostic Checklist

## Potential Issues

### 1. **User Role Not Set**

- Navigation depends on `user?.role`
- Defaults to `'team_member'` if not set
- **Check**: Browser console for `user` object

### 2. **Advanced UI Disabled**

- Advanced UI sections have `visible: advancedEnabled`
- `advancedEnabled` is `false` for `team_member` by default
- **Check**: `localStorage.getItem('enable_advanced_ui')`

### 3. **Sections Filtered Out**

- Sections with no items AND no path are filtered out
- Empty sections won't render
- **Check**: Navigation array length

### 4. **Collapsed Groups**

- All groups default to `collapsed: true`
- Items are hidden until group is expanded
- **Check**: Click on group headers to expand

### 5. **Search Filter Active**

- If search term is set, items are filtered
- **Check**: Clear search box at top of sidebar

### 6. **Sidebar Not Open**

- Sidebar might be collapsed
- **Check**: Click menu icon to expand

### 7. **Stats Object Empty**

- Badge counts depend on `stats` object
- Navigation still works but badges show 0
- **Check**: `stats` object in state

### 8. **Tenant Context Missing**

- Some paths use `tenantContext?.id`
- Defaults to `{ id: 1, name: 'Default' }` if missing
- **Check**: `currentTenant` in state

## Debug Steps

### Step 1: Check Browser Console

```javascript
// Open DevTools (F12) and check:
console.log('User:', user);
console.log('Role:', user?.role);
console.log('Stats:', stats);
console.log('Current Tenant:', currentTenant);
```

### Step 2: Check Navigation Array

The console should show:

```
Navigation for role: [role] [navigation array]
```

### Step 3: Check Advanced UI Setting

```javascript
localStorage.getItem('enable_advanced_ui')
// Should be 'true' to see Advanced UI sections
```

### Step 4: Verify Sidebar State

- Sidebar should be open (not collapsed)
- Search box should be empty
- Groups should be expanded (click to expand)

## Quick Fixes

### Fix 1: Enable Advanced UI

```javascript
localStorage.setItem('enable_advanced_ui', 'true');
// Then refresh page
```

### Fix 2: Set User Role (for testing)

```javascript
// In browser console:
// This depends on your auth system
```

### Fix 3: Expand All Groups

- Click on each group header to expand
- Groups default to collapsed

### Fix 4: Clear Search

- Clear any text in the search box
- This removes filtering

## Expected Navigation Structure

### For `team_member`

- Home Dashboard
- My Assessments
- My Tasks
- Task Board (NEW)
- My Documents
- Compliance Status
- Reports
- Team Tools (collapsed)
- Advanced UI (collapsed, if enabled)

### For `tenant_admin`

- Home Dashboard
- GRC Core Modules (expanded by default)
  - Frameworks
  - Assessments
  - Risks
  - Controls
  - Compliance Tracking
  - Task Management
  - Task Board (NEW)
  - Gap Analysis
  - Remediation Plans
  - Evidence Upload (NEW)
- Organization Management (collapsed)
  - Teams & Users
  - Departments
  - Onboarding
  - Roles & Permissions
  - Document Management (NEW)
- Reports & Analytics
- Vendors & Partners
- Documents & Evidence
- Workflows
- Team Communication (collapsed)
- Advanced UI (collapsed, if enabled)
  - Modern Advanced Dashboard (NEW)
  - Regulatory Market Dashboard (NEW)

### For `platform_admin`

- Platform Dashboard
- License Management (collapsed)
- Onboarding & Preview
- Users & Access (collapsed)
- AI & Intelligence (collapsed)
- Tenant Management
- Platform Analytics (collapsed)
- Platform Automation (collapsed)
- System Management (collapsed) (NEW)
  - Database Management (NEW)
  - API Management (NEW)
  - System Health (NEW)
- Advanced UI (collapsed, if enabled)
  - Modern Advanced Dashboard (NEW)
  - Regulatory Market Dashboard (NEW)
- Administration

## Next Steps

1. **Open browser console** (F12)
2. **Check the debug log**: "Navigation for role: ..."
3. **Verify user role** is set correctly
4. **Check if groups are collapsed** (click to expand)
5. **Enable Advanced UI** if needed: `localStorage.setItem('enable_advanced_ui', 'true')`
6. **Clear search filter** if active
7. **Expand sidebar** if collapsed
