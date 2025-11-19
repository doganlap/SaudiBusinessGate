# 🚀 Migration Plan: React Router → Next.js App Router

## Goal

Consolidate routing to Next.js App Router for better SEO, performance, and modern architecture.

---

## Strategy

### Option 1: Gradual Migration (Recommended) ✅

- Keep both systems running during migration
- Migrate routes incrementally
- Redirect React Router routes to Next.js equivalents
- Remove React Router after complete migration

### Option 2: Big Bang Migration

- Migrate all routes at once
- Higher risk, faster completion
- Requires extensive testing

**We'll use Option 1 (Gradual Migration)**

---

## Migration Phases

### Phase 1: Foundation (Week 1)

**Goal**: Set up migration infrastructure

1. ✅ Create route mapping documentation
2. ✅ Create migration plan
3. ⏳ Set up redirect middleware
4. ⏳ Create migration tracking system
5. ⏳ Set up testing framework

**Deliverables**:

- Route mapping document
- Migration plan
- Redirect middleware
- Migration tracker

---

### Phase 2: Critical Routes (Week 2-3)

**Goal**: Migrate business-critical routes

#### 2.1 Partner & POC Routes

- [ ] Create `app/partner/page.tsx`
- [ ] Create `app/partner/app/[slug]/page.tsx`
- [ ] Create `app/poc/page.tsx`
- [ ] Create `app/poc/request/page.tsx`
- [ ] Create `app/poc/app/[slug]/page.tsx`
- [ ] Add redirects from React Router

#### 2.2 GRC Enhanced Modules

- [ ] Create `app/[lng]/(platform)/assessments/page.tsx`
- [ ] Create `app/[lng]/(platform)/assessments/[id]/page.tsx`
- [ ] Create `app/[lng]/(platform)/assessments/[id]/report/page.tsx`
- [ ] Create `app/[lng]/(platform)/risks/page.tsx`
- [ ] Create `app/[lng]/(platform)/risks/[id]/page.tsx`
- [ ] Create `app/[lng]/(platform)/compliance/page.tsx`
- [ ] Create `app/[lng]/(platform)/compliance/[id]/page.tsx`
- [ ] Create `app/[lng]/(platform)/evidence/page.tsx`
- [ ] Create `app/[lng]/(platform)/evidence/upload/page.tsx`
- [ ] Create `app/[lng]/(platform)/evidence/[id]/page.tsx`

#### 2.3 Gap Analysis & Remediation

- [ ] Create `app/[lng]/(platform)/gaps/page.tsx`
- [ ] Create `app/[lng]/(platform)/gaps/[id]/page.tsx`
- [ ] Create `app/[lng]/(platform)/remediation/page.tsx`
- [ ] Create `app/[lng]/(platform)/remediation/[id]/page.tsx`

**Deliverables**:

- Partner/POC routes migrated
- GRC modules migrated
- Gap analysis routes migrated

---

### Phase 3: Dynamic Routes (Week 4-5)

**Goal**: Migrate all dynamic routes with `:id` parameters

#### 3.1 Framework Dynamic Routes

- [ ] Create `app/[lng]/(platform)/frameworks/[id]/page.tsx`
- [ ] Create `app/[lng]/(platform)/frameworks/[id]/edit/page.tsx`

#### 3.2 Controls Dynamic Routes

- [ ] Create `app/[lng]/(platform)/grc/controls/[id]/page.tsx`
- [ ] Create `app/[lng]/(platform)/grc/controls/[id]/edit/page.tsx`

#### 3.3 Organization Dynamic Routes

- [ ] Create `app/[lng]/(platform)/organizations/page.tsx`
- [ ] Create `app/[lng]/(platform)/organizations/new/page.tsx`
- [ ] Create `app/[lng]/(platform)/organizations/[id]/page.tsx`
- [ ] Create `app/[lng]/(platform)/organizations/[id]/dashboard/page.tsx`
- [ ] Create `app/[lng]/(platform)/organizations/[id]/edit/page.tsx`

#### 3.4 User Dynamic Routes

- [ ] Create `app/[lng]/(platform)/platform/users/[id]/page.tsx`
- [ ] Create `app/[lng]/(platform)/platform/users/[id]/edit/page.tsx`

#### 3.5 License Dynamic Routes

- [ ] Create `app/[lng]/(platform)/licenses/[id]/page.tsx`

#### 3.6 Workflow Dynamic Routes

- [ ] Create `app/[lng]/(platform)/workflows/[id]/page.tsx`

#### 3.7 Task Dynamic Routes

- [ ] Create `app/[lng]/(platform)/pm/tasks/[id]/page.tsx`
- [ ] Create `app/[lng]/(platform)/pm/tasks/board/page.tsx`
- [ ] Create `app/[lng]/(platform)/pm/tasks/list/page.tsx`

**Deliverables**:

- All dynamic routes migrated
- Proper parameter handling
- Edit/create views

---

### Phase 4: Advanced Features (Week 6)

**Goal**: Migrate advanced dashboard and system routes

#### 4.1 Advanced Dashboard Routes

- [ ] Create `app/[lng]/(platform)/dashboard/advanced/page.tsx`
- [ ] Create `app/[lng]/(platform)/dashboard/tenant/page.tsx`
- [ ] Create `app/[lng]/(platform)/dashboard/regulatory-market/page.tsx`
- [ ] Create `app/[lng]/(platform)/advanced/page.tsx`
- [ ] Create `app/[lng]/(platform)/advanced/assessments/page.tsx`
- [ ] Create `app/[lng]/(platform)/advanced/frameworks/page.tsx`

#### 4.2 System Management

- [ ] Create `app/[lng]/(platform)/system/page.tsx`
- [ ] Create `app/[lng]/(platform)/system/database/page.tsx`
- [ ] Create `app/[lng]/(platform)/system/health/page.tsx`
- [ ] Create `app/[lng]/(platform)/system/api/page.tsx`

#### 4.3 Reports & Analytics

- [ ] Create `app/[lng]/(platform)/reports/page.tsx`
- [ ] Create `app/[lng]/(platform)/reports/compliance/page.tsx`
- [ ] Create `app/[lng]/(platform)/reports/risk/page.tsx`
- [ ] Create `app/[lng]/(platform)/reports/assessments/page.tsx`

#### 4.4 Regulatory Intelligence

- [ ] Create `app/[lng]/(platform)/regulatory/page.tsx`
- [ ] Create `app/[lng]/(platform)/regulatory/ksa/page.tsx`
- [ ] Create `app/[lng]/(platform)/regulatory/sectors/page.tsx`
- [ ] Create `app/[lng]/(platform)/regulators/page.tsx`

#### 4.5 AI & RAG Services

- [ ] Create `app/[lng]/(platform)/ai/scheduler/page.tsx`
- [ ] Create `app/[lng]/(platform)/ai/rag/page.tsx`
- [ ] Create `app/[lng]/(platform)/rag/page.tsx`
- [ ] Create `app/[lng]/(platform)/mission-control/page.tsx`
- [ ] Create `app/[lng]/(platform)/chat/page.tsx`

**Deliverables**:

- Advanced features migrated
- System management routes
- Complete reports section

---

### Phase 5: Cleanup & Optimization (Week 7)

**Goal**: Remove React Router and optimize

1. ⏳ Verify all routes migrated
2. ⏳ Add redirects from React Router to Next.js
3. ⏳ Update navigation components
4. ⏳ Remove React Router dependencies
5. ⏳ Update documentation
6. ⏳ Performance testing
7. ⏳ SEO verification

**Deliverables**:

- React Router removed
- All routes in Next.js
- Performance optimized
- SEO verified

---

## Migration Checklist Template

For each route migration:

- [ ] Create Next.js page file
- [ ] Copy component logic
- [ ] Update imports (Next.js patterns)
- [ ] Add metadata (SEO)
- [ ] Add loading states
- [ ] Add error handling
- [ ] Test route functionality
- [ ] Add redirect from React Router
- [ ] Update navigation links
- [ ] Update documentation

---

## Redirect Strategy

### Middleware Approach (Recommended)

Create `middleware.ts` to redirect React Router routes:

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Redirect React Router routes to Next.js equivalents
  const redirects: Record<string, string> = {
    '/app/dashboard': '/ar/dashboard',
    '/app/assessments': '/ar/assessments',
    // ... more redirects
  };
  
  if (redirects[pathname]) {
    return NextResponse.redirect(new URL(redirects[pathname], request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/app/:path*', '/partner/:path*', '/poc/:path*'],
};
```

---

## Testing Strategy

1. **Unit Tests**: Test each migrated route
2. **Integration Tests**: Test route interactions
3. **E2E Tests**: Test complete user flows
4. **Performance Tests**: Verify SSR/SSG performance
5. **SEO Tests**: Verify metadata and indexing

---

## Rollback Plan

If issues arise:

1. Keep React Router routes active
2. Disable Next.js redirects
3. Revert problematic migrations
4. Fix issues in isolation
5. Re-migrate after fixes

---

## Success Metrics

- ✅ All routes migrated
- ✅ Zero broken links
- ✅ SEO scores improved
- ✅ Performance improved
- ✅ React Router removed
- ✅ Documentation updated

---

**Created**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**Status**: Planning Phase
