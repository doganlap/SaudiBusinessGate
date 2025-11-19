# 🎯 One App, One Config, One Index - Consolidation Plan

## Current Status

### ❌ Multiple Apps Found (3)

1. **`app/`** - Next.js App Router (Main - 161 pages, 140 API routes)
2. **`apps/web/`** - React Router (Legacy - 576 files)
3. **`apps/app/`** - Duplicate? (297 files)

### ❌ Multiple Config Locations (3)

1. **`config/`** - Root config (3 files: api, database, redis)
2. **`apps/web/src/config/`** - React Router config (multiple files)
3. **`app/components/`** - Next.js components (has some config?)

### ✅ Single Index File

- **`apps/web/src/pages/index.js`** - React Router pages index

### ❌ Multiple Component Locations (3)

1. **`components/`** - Root components (shared)
2. **`apps/web/src/components/`** - React Router components
3. **`app/components/`** - Next.js components

## Recommended Consolidation

### Primary App: `app/` (Next.js App Router)

- ✅ Modern Next.js 16 App Router
- ✅ 161 pages
- ✅ 140 API routes
- ✅ Internationalized routing `[lng]/(platform)/`
- ✅ Production-ready

### Actions Required

#### 1. Consolidate Config → `config/`

- ✅ Keep `config/` as single source
- ⚠️ Migrate `apps/web/src/config/` → `config/`
- ⚠️ Update all imports

#### 2. Consolidate Components → `components/`

- ✅ Already have shared `components/layout/MultiTenantNavigation.jsx`
- ⚠️ Migrate unique components from `apps/web/src/components/` → `components/`
- ⚠️ Migrate unique components from `app/components/` → `components/`
- ⚠️ Update all imports

#### 3. Create Single Index → `app/pages/index.ts` (or keep Next.js structure)

- Next.js uses file-based routing, no index needed
- React Router pages can be migrated to Next.js App Router

#### 4. Deprecate React Router App

- `apps/web/` can be kept for backward compatibility
- Gradually migrate routes to Next.js App Router
- Or remove if not needed

## Current Structure

```
D:\Projects\SBG\
├── app/                    # ✅ Next.js App Router (PRIMARY)
│   ├── [lng]/(platform)/  # Internationalized routes
│   ├── api/               # 140 API routes
│   └── components/         # Next.js components
├── apps/web/               # ⚠️ React Router (LEGACY)
│   ├── src/
│   │   ├── App.jsx        # React Router entry
│   │   ├── pages/         # React Router pages
│   │   └── config/        # React Router config
├── components/             # ✅ SHARED (Single source)
│   └── layout/
│       └── MultiTenantNavigation.jsx  # ✅ Already consolidated
└── config/                 # ✅ ROOT CONFIG (Single source)
    ├── api.config.ts
    ├── database.config.ts
    └── redis.config.ts
```

## Recommendation

**Keep Next.js App Router (`app/`) as primary app** and consolidate everything else to support it.

---

**Status**: ⚠️ Needs consolidation
**Primary App**: `app/` (Next.js)
**Target**: One app, one config, one index
