## Scope
- Run a root-level dependency vulnerability audit and kick off pre-production checks
- Use the existing npm-based workflow detected at `d:\Projects\DoganHubStore` (`package-lock.json` present)

## Key Findings (read-only review)
- Package manager: npm (`package-lock.json` present)
- Scripts available:
  - Build: `build` in `package.json:13`
  - Lint: `lint` in `package.json:17`
  - Production validator: `validate:production` in `package.json:34`
  - Tests: `test:ci` in `package.json:29`, `test:integration` in `package.json:33`, `test:e2e` in `package.json:35`, `test:all` in `package.json:39`
- Jest config path mismatch:
  - Scripts reference `__tests__/jest.config.js` (`package.json:26-33`), but only `jest.config.cjs` exists (`jest.config.cjs:1-30`). This will cause `npm run test`/`test:ci` to fail until fixed.
- Readiness validator checks env/config/API/DB/monitoring/build (`scripts/validate-production.ts:18-238`, `241-301`).
- Security headers configured (`next.config.js:87-105`).
- `.env.local` exists with development values. For production, rotate secrets and set production URLs.

## Plan
### Phase 1 — Dependency Audit
1. Clean install to respect lockfile: `npm ci`.
2. Run audit: `npm audit --json` and capture the JSON report.
3. Triage by severity and ecosystem. Prefer `npm audit fix` for safe updates; use `npm audit fix --force` only if non-breaking.
4. Generate a short remediation list (packages, target versions, reason).

### Phase 2 — Test Config Correction
1. Update test scripts in `package.json` to use `jest.config.cjs` (instead of `__tests__/jest.config.js`):
   - `package.json:26-33` and any other `jest --config` occurrences.
2. Verify Jest picks up tests in `tests/**` per `jest.config.cjs:5-7,25`.

### Phase 3 — Readiness Validation
1. Run `npm run validate:production` and review output:
   - Env vars: `DATABASE_URL`, `JWT_SECRET`, `NEXTAUTH_SECRET`, `NEXT_PUBLIC_APP_URL` (`scripts/validate-production.ts:22-50`).
   - Required files: `next.config.js`, `tsconfig.json`, `vercel.json`, `docker-compose.yml`, `.env.local` (`scripts/validate-production.ts:57-88`).
   - API health endpoints (assumes server running): (`scripts/validate-production.ts:91-136`).
   - Build integrity: name/version/scripts (`scripts/validate-production.ts:201-239`).

### Phase 4 — Quality Gates
1. Lint: `npm run lint` (`package.json:17`).
2. Tests (CI mode): `npm run test:ci` (`package.json:29`).
3. Integration/API subsets if needed: `npm run test:integration`, `npm run test:api` (`package.json:30,33`).
4. Optional E2E: `npm run test:e2e` (`package.json:35`) if Playwright tests are ready.

### Phase 5 — Build Verification
1. Typecheck happens during Next build (types not ignored): `next.config.js:11-13`.
2. Build: `npm run build` (`package.json:13`) and verify it completes.

### Phase 6 — Outdated & Upgrade Strategy
1. Identify outdated: `npm outdated`.
2. Upgrade minor/patch where safe; schedule major upgrades with tests.

### Phase 7 — Secrets & Environment
1. Replace development secrets in `.env.local` with production values and move to your deployment secret store.
2. Ensure monitoring keys are set (`NEXT_PUBLIC_SENTRY_DSN`, GA) for `scripts/validate-production.ts:171-199`.

## Deliverables
- Audit JSON report and prioritized remediation list
- Updated `package.json` test scripts pointing to `jest.config.cjs`
- Readiness validation report output
- Lint/test/build results suitable for CI gating

## Confirmation
- Approve this plan and I will execute the audit, fix the test script config, and run the readiness checks end-to-end, then deliver the reports and recommendations.