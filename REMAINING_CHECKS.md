# 🔍 Remaining Checks & Verification

## ✅ Completed

1. ✅ Config consolidation to `config/`
2. ✅ Navigation consolidation to `components/layout/MultiTenantNavigation.jsx`
3. ✅ Component organization in `components/`
4. ✅ 18 config imports updated
5. ✅ Documentation created

---

## ⚠️ Remaining Items to Check

### 1. 🔴 Old Config Files Still Exist

**Location**: `apps/web/src/config/`

**Status**: ⚠️ Files still exist (should be removed or kept for backward compatibility)

**Files**:

- `apps/web/src/config/ecosystem.config.js` (duplicate - now in `config/`)
- `apps/web/src/config/loader.js` (duplicate - now in `config/`)
- `apps/web/src/config/serviceRouter.js` (duplicate - now in `config/`)
- `apps/web/src/config/theme.config.js` (duplicate - now in `config/`)
- `apps/web/src/config/rbac.config.js` (duplicate - now in `config/`)
- `apps/web/src/config/routeGroups.js` (duplicate - now in `config/`)
- `apps/web/src/config/processGuides.js` (duplicate - now in `config/`)
- `apps/web/src/config/agents.js` (duplicate - now in `config/`)
- `apps/web/src/config/brand.ts` (duplicate - now in `config/`)
- `apps/web/src/config/mockData.config.js` (not moved - may be needed)
- `apps/web/src/config/routes.jsx` (React Router specific - keep?)
- `apps/web/src/config/README.md` (documentation - keep?)

**Action Required**:

- [ ] Decide: Remove duplicates or keep for backward compatibility?
- [ ] If keeping, add deprecation notices
- [ ] If removing, verify no remaining imports

---

### 2. 🟡 Files Still Using Old Config Paths

**Status**: ⚠️ 10 files found using relative `../config/` paths

**Files**:

- `apps/web/src/services/grc-api/routes/regulatory-market.js`
- `apps/web/src/services/grc-api/routes/tenants.js`
- `apps/web/src/services/grc-api/routes/analytics-fixed.js`
- `apps/web/src/services/grc-api/routes/advanced-analytics.js`
- `apps/web/src/services/grc-api/routes/cross-database.js`
- `apps/web/src/services/grc-api/services/crossDatabaseOperations.js`
- `apps/web/src/services/grc-api/services/AutomatedTenantProvisioning.js`
- `apps/web/src/services/grc-api/routes/automated-provisioning.js`
- `apps/web/src/services/grc-api/routes/tenant-workflows.js`
- `apps/web/src/services/grc-api/services/autonomousAssessment.js`

**Action Required**:

- [ ] Update these 10 files to use consolidated `config/` paths
- [ ] Test that imports work correctly
- [ ] Verify no broken functionality

---

### 3. 🟡 Build Verification

**Status**: ⚠️ Not verified

**Action Required**:

- [ ] Run `npm run build` to verify no build errors
- [ ] Check for TypeScript errors
- [ ] Verify all imports resolve correctly
- [ ] Test that application starts: `npm run dev`
- [ ] Verify no runtime errors

---

### 4. 🟡 Component Duplicates

**Status**: ⚠️ Need to verify

**Potential Duplicates**:

- `apps/web/src/components/` vs `components/`
- `app/components/` vs `components/`

**Action Required**:

- [ ] Compare component files between locations
- [ ] Identify unique components that should be moved
- [ ] Remove duplicates or consolidate
- [ ] Update all imports to use `components/`

---

### 5. 🟡 TypeScript Path Mappings

**Status**: ✅ Configured, but need verification

**Current Mappings**:

```json
"@/components/*": ["./components/*", "./src/components/*"]
```

**Action Required**:

- [ ] Verify all `@/components/*` imports work
- [ ] Check if `./src/components/*` path is needed
- [ ] Test imports in both Next.js and React Router apps

---

### 6. 🟡 Import Path Consistency

**Status**: ⚠️ Need to verify

**Action Required**:

- [ ] Check for any remaining `apps/web/src/config/` imports
- [ ] Check for any remaining `app/components/layout/MultiTenantNavigation` imports
- [ ] Check for any remaining `apps/web/src/components/layout/MultiTenantNavigation` imports
- [ ] Verify all use `components/layout/MultiTenantNavigation.jsx`

---

### 7. 🟡 Legacy App Cleanup

**Status**: ⚠️ `apps/web/` still exists

**Action Required**:

- [ ] Decide: Keep for backward compatibility or remove?
- [ ] If keeping, document it's legacy
- [ ] If removing, verify no critical dependencies
- [ ] Update documentation to clarify primary app

---

### 8. 🟡 Index Files

**Status**: ⚠️ Need verification

**Files**:

- `apps/web/src/pages/index.js` (React Router - keep for backward compatibility)

**Action Required**:

- [ ] Verify React Router index exports are correct
- [ ] Document that Next.js uses file-based routing (no index needed)
- [ ] Check if any other index files need updating

---

### 9. 🟡 Documentation Updates

**Status**: ⚠️ Need to verify completeness

**Action Required**:

- [ ] Verify `APP_STRUCTURE_AND_FEATURES.md` is complete
- [ ] Verify `ONE_APP_ONE_CONFIG_ONE_INDEX.md` is accurate
- [ ] Update README.md if needed
- [ ] Document any remaining legacy paths

---

### 10. 🟡 Testing

**Status**: ⚠️ Not verified

**Action Required**:

- [ ] Test navigation works correctly
- [ ] Test config loading works
- [ ] Test component imports work
- [ ] Test API routes work
- [ ] Test build process
- [ ] Test production build

---

## 📋 Priority Checklist

### High Priority (Must Do)

1. [ ] Update 10 files using old config paths
2. [ ] Verify build works: `npm run build`
3. [ ] Test application starts: `npm run dev`
4. [ ] Verify no broken imports

### Medium Priority (Should Do)

1. [ ] Decide on old config files (remove or keep)
2. [ ] Check for component duplicates
3. [ ] Verify TypeScript path mappings
4. [ ] Test all imports work correctly

### Low Priority (Nice to Have)

1. [ ] Clean up legacy app if not needed
2. [ ] Update all documentation
3. [ ] Add deprecation notices if keeping old files

---

## 🔧 Quick Fix Script Needed

Create a script to:

1. Update the 10 files using old config paths
2. Verify all imports
3. Check for duplicates
4. Generate a report

---

**Last Updated**: 2024  
**Status**: ⚠️ Verification Needed
