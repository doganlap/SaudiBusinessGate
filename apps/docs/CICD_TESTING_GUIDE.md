# CI/CD Pipeline Testing Guide
# Comprehensive testing procedures for GitHub Actions pipeline

## Overview

This guide covers testing the complete CI/CD pipeline from code commit to production deployment. The pipeline includes 7 stages:

1. **Code Quality** - Linting, formatting, type checking
2. **Testing** - Unit, integration, and E2E tests
3. **Build** - Next.js application build
4. **Docker** - Container image build and push
5. **Deploy Staging** - Automated staging deployment
6. **Performance Testing** - Load and performance tests
7. **Deploy Production** - Manual production deployment

## Prerequisites

Before testing the pipeline:

- [ ] All GitHub Secrets configured (17 secrets)
- [ ] Azure resources created (App Insights, Key Vault, Container Registry)
- [ ] Sentry project created and configured
- [ ] Staging environment provisioned
- [ ] Production environment provisioned
- [ ] Branch protection rules configured
- [ ] GitHub environments created (staging, production)

## Pipeline Architecture

```yaml
# .github/workflows/ci-cd.yml structure
Trigger: Push to develop or main, Pull requests

Jobs:
  1. code-quality (runs on: ubuntu-latest)
     - Checkout code
     - Setup Node.js 18.x
     - Install dependencies
     - Run ESLint
     - Run Prettier check
     - Run TypeScript check
     
  2. test (runs on: ubuntu-latest, needs: code-quality)
     - Checkout code
     - Setup Node.js
     - Setup PostgreSQL service
     - Setup Redis service
     - Run migrations
     - Run unit tests
     - Run integration tests
     - Run E2E tests
     - Upload coverage to Codecov
     
  3. build (runs on: ubuntu-latest, needs: test)
     - Checkout code
     - Setup Node.js
     - Build Next.js application
     - Upload build artifacts
     
  4. docker (runs on: ubuntu-latest, needs: build)
     - Login to Azure Container Registry
     - Build Docker image
     - Tag image (git SHA + branch)
     - Push to ACR
     - Scan image for vulnerabilities
     
  5. deploy-staging (runs on: ubuntu-latest, needs: docker, if: branch == develop)
     - Download Docker image
     - Deploy to Azure Container Apps (staging)
     - Update environment variables
     - Run health checks
     - Send Slack notification
     
  6. performance-test (runs on: ubuntu-latest, needs: deploy-staging)
     - Run Lighthouse audit
     - Run load tests (k6)
     - Check performance budgets
     - Upload performance reports
     
  7. deploy-production (runs on: ubuntu-latest, needs: performance-test, if: branch == main)
     - Require manual approval
     - Deploy to Azure Container Apps (production)
     - Run smoke tests
     - Send Slack notification
```

## Test Scenarios

### Scenario 1: Feature Branch Testing

Test the pipeline on a feature branch to verify code quality and tests.

**Steps:**

1. Create feature branch:
```bash
git checkout develop
git pull origin develop
git checkout -b feature/test-cicd
```

2. Make a small change:
```bash
# Edit a file
echo "// Test CI/CD" >> app/page.tsx

# Commit
git add .
git commit -m "test: verify CI/CD pipeline"

# Push
git push origin feature/test-cicd
```

3. Monitor pipeline:
   - Go to: https://github.com/YOUR_REPO/actions
   - Find your workflow run
   - Verify jobs execute in order

**Expected Results:**

- ✅ `code-quality` job completes successfully
- ✅ `test` job runs all test suites
- ✅ `build` job creates Next.js build
- ⏭️ `docker` job skipped (not on develop/main)
- ⏭️ Deployment jobs skipped

**Success Criteria:**

- All jobs pass within 10 minutes
- No linting errors
- All tests pass
- Build completes without errors
- Code coverage uploaded to Codecov

### Scenario 2: Pull Request to Develop

Test the full pipeline including Docker build on PR to develop.

**Steps:**

1. Create pull request:
```bash
# From your feature branch
gh pr create --base develop --title "Test CI/CD Pipeline" --body "Testing complete pipeline"
```

2. Monitor PR checks:
   - Go to PR page
   - View "Checks" tab
   - Verify all checks run

3. Review pipeline logs:
   - Click on each check
   - Review job logs
   - Verify no warnings or errors

**Expected Results:**

- ✅ All jobs from Scenario 1
- ✅ `docker` job builds and pushes image
- ✅ PR checks show green status
- ⏭️ Deployment skipped (not merged yet)

**Success Criteria:**

- Docker image built successfully
- Image pushed to ACR
- Image tagged with PR SHA
- Security scan completes
- All PR checks pass

### Scenario 3: Merge to Develop (Staging Deployment)

Test automated staging deployment.

**Steps:**

1. Merge pull request:
```bash
# Via GitHub UI or CLI
gh pr merge --merge --delete-branch
```

2. Monitor staging deployment:
   - Go to Actions tab
   - Find "Deploy to Staging" workflow
   - Monitor deployment progress

3. Verify staging environment:
```bash
# Check health endpoint
curl https://doganhub-staging.azurecontainerapps.io/api/health

# Check application
open https://doganhub-staging.azurecontainerapps.io
```

4. Monitor Application Insights:
   - Go to Azure Portal
   - Open Application Insights
   - Check Live Metrics
   - Verify telemetry incoming

**Expected Results:**

- ✅ All previous jobs pass
- ✅ `deploy-staging` job completes
- ✅ Container app updated in Azure
- ✅ Health check returns 200 OK
- ✅ Application accessible
- ✅ Telemetry visible in App Insights

**Success Criteria:**

- Deployment completes in < 5 minutes
- Zero downtime during deployment
- Health checks pass
- Application responds correctly
- No errors in Sentry
- Slack notification received

### Scenario 4: Performance Testing

Verify automated performance tests after staging deployment.

**Steps:**

1. Wait for `performance-test` job to start automatically

2. Monitor performance tests:
   - View job logs in real-time
   - Check Lighthouse scores
   - Review load test results

3. Download performance reports:
```bash
# Via GitHub CLI
gh run download <run-id> --name performance-reports
```

4. Review performance metrics:
   - Lighthouse scores
   - Response times
   - Error rates
   - Resource usage

**Expected Results:**

- ✅ Lighthouse performance score > 90
- ✅ All pages load in < 3 seconds
- ✅ Load test handles 100 concurrent users
- ✅ Error rate < 1%
- ✅ Performance budgets met

**Success Criteria:**

- All performance tests pass
- No performance regressions
- Reports uploaded as artifacts
- Budgets not exceeded

### Scenario 5: Production Deployment

Test manual production deployment process.

**Steps:**

1. Create release PR:
```bash
git checkout develop
git pull origin develop
git checkout -b release/v1.0.0

# Update version
npm version minor

git push origin release/v1.0.0
gh pr create --base main --title "Release v1.0.0" --body "Production release"
```

2. Merge to main:
```bash
gh pr merge --merge
```

3. Approve production deployment:
   - Go to Actions tab
   - Find "Deploy to Production" job
   - Click "Review deployments"
   - Select "production" environment
   - Click "Approve and deploy"

4. Monitor production deployment:
   - Watch deployment logs
   - Monitor health checks
   - Verify application

5. Verify production:
```bash
# Health check
curl https://doganhub.azurecontainerapps.io/api/health

# Smoke tests
curl https://doganhub.azurecontainerapps.io/api/auth/status
curl https://doganhub.azurecontainerapps.io/api/health/db
```

**Expected Results:**

- ✅ Manual approval required before deploy
- ✅ Production deployment completes
- ✅ Zero-downtime deployment
- ✅ Health checks pass
- ✅ Smoke tests pass
- ✅ Monitoring active

**Success Criteria:**

- Deployment requires approval
- Rollback plan available
- Production accessible
- No errors reported
- Monitoring data flowing
- Slack notification sent

## Verification Checklist

### Pipeline Configuration

- [ ] Workflow file exists at `.github/workflows/ci-cd.yml`
- [ ] All 17 GitHub Secrets configured
- [ ] Environments created (staging, production)
- [ ] Branch protection enabled on main
- [ ] Required status checks configured
- [ ] CODEOWNERS file configured

### Code Quality Job

- [ ] ESLint runs successfully
- [ ] Prettier check passes
- [ ] TypeScript compilation succeeds
- [ ] No linting errors
- [ ] Job completes in < 2 minutes

### Test Job

- [ ] PostgreSQL service starts
- [ ] Redis service starts
- [ ] Database migrations run
- [ ] Unit tests pass (100+ tests)
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Code coverage > 80%
- [ ] Coverage uploaded to Codecov
- [ ] Job completes in < 8 minutes

### Build Job

- [ ] Dependencies installed
- [ ] Environment variables loaded
- [ ] Next.js build succeeds
- [ ] Build artifacts created
- [ ] Static files generated
- [ ] Build size within budget
- [ ] Job completes in < 5 minutes

### Docker Job

- [ ] ACR login successful
- [ ] Docker image builds
- [ ] Image tagged correctly (SHA + branch)
- [ ] Image pushed to ACR
- [ ] Security scan runs
- [ ] No critical vulnerabilities
- [ ] Job completes in < 6 minutes

### Staging Deployment

- [ ] Image pulled from ACR
- [ ] Container app updated
- [ ] Environment variables set
- [ ] Health check passes
- [ ] Application accessible
- [ ] Database connectivity verified
- [ ] Redis connectivity verified
- [ ] Deployment completes in < 5 minutes

### Performance Testing

- [ ] Lighthouse audit runs
- [ ] Performance score > 90
- [ ] Accessibility score > 90
- [ ] Best practices score > 90
- [ ] SEO score > 90
- [ ] Load tests complete
- [ ] Response times acceptable
- [ ] Error rate < 1%

### Production Deployment

- [ ] Manual approval required
- [ ] Approval granted by authorized user
- [ ] Deployment starts after approval
- [ ] Zero downtime deployment
- [ ] Health checks pass
- [ ] Smoke tests pass
- [ ] Monitoring active
- [ ] No errors in first hour

### Notifications

- [ ] Slack notifications sent
- [ ] Deployment status communicated
- [ ] Error notifications working
- [ ] Success notifications working

### Monitoring & Observability

- [ ] Application Insights receiving data
- [ ] Sentry capturing errors (if any)
- [ ] Custom metrics logging
- [ ] Performance metrics tracked
- [ ] User sessions recorded
- [ ] Alerts configured and working

## Troubleshooting

### Issue: Code Quality Job Fails

**Symptoms:**
- ESLint errors
- TypeScript compilation errors
- Prettier check fails

**Solutions:**

```bash
# Run locally to reproduce
npm run lint
npm run type-check
npm run format:check

# Fix issues
npm run lint:fix
npm run format:write

# Verify
npm run lint
npm run type-check
```

### Issue: Tests Fail in CI

**Symptoms:**
- Tests pass locally but fail in CI
- Database connection errors
- Redis connection errors

**Solutions:**

1. Check service configuration in workflow:
```yaml
services:
  postgres:
    image: postgres:15
    env:
      POSTGRES_PASSWORD: test
    ports:
      - 5432:5432
```

2. Verify environment variables:
```yaml
env:
  DATABASE_URL: postgresql://postgres:test@localhost:5432/test
  REDIS_URL: redis://localhost:6379
```

3. Check test timeouts:
```typescript
// jest.config.js
module.exports = {
  testTimeout: 30000, // Increase for CI
};
```

### Issue: Docker Build Fails

**Symptoms:**
- Image build fails
- ACR authentication fails
- Push to registry fails

**Solutions:**

1. Verify ACR credentials:
```bash
az acr login --name YOUR_ACR_NAME
```

2. Check Dockerfile:
```bash
# Build locally
docker build -t test .

# Test run
docker run -p 3000:3000 test
```

3. Verify GitHub Secrets:
```bash
# Check secrets exist
gh secret list
```

### Issue: Staging Deployment Fails

**Symptoms:**
- Container app won't start
- Health checks fail
- Application errors

**Solutions:**

1. Check container logs:
```bash
az containerapp logs show \
  --name doganhub-staging \
  --resource-group DoganHubProd \
  --tail 100
```

2. Verify environment variables:
```bash
az containerapp show \
  --name doganhub-staging \
  --resource-group DoganHubProd \
  --query properties.template.containers[0].env
```

3. Test health endpoint:
```bash
curl -v https://doganhub-staging.azurecontainerapps.io/api/health
```

### Issue: Performance Tests Fail

**Symptoms:**
- Lighthouse scores below threshold
- Load tests timeout
- High error rates

**Solutions:**

1. Check performance budget:
```javascript
// lighthouse.config.js
budgets: [{
  resourceSizes: [{
    resourceType: 'total',
    budget: 500, // Adjust if needed
  }],
}],
```

2. Review load test configuration:
```javascript
// k6-load-test.js
export let options = {
  stages: [
    { duration: '30s', target: 50 }, // Reduce load if needed
    { duration: '1m', target: 100 },
  ],
};
```

3. Monitor during test:
```bash
# Application Insights live metrics
az monitor app-insights metrics show \
  --app doganhub-appinsights \
  --resource-group DoganHubProd \
  --metric requests/count
```

### Issue: Production Approval Not Working

**Symptoms:**
- No approval button visible
- Approval timeout
- Unauthorized to approve

**Solutions:**

1. Check environment protection rules:
   - Go to: Settings → Environments → production
   - Verify required reviewers configured
   - Ensure you're in the reviewers list

2. Check branch protection:
   - Go to: Settings → Branches → main
   - Verify protection rules active

3. Verify permissions:
   - Ensure you have "Write" access to repository
   - Check organization/repository settings

## Performance Benchmarks

Expected pipeline execution times:

| Job | Expected Duration | Maximum Duration |
|-----|------------------|------------------|
| Code Quality | 1-2 minutes | 3 minutes |
| Test | 5-8 minutes | 10 minutes |
| Build | 3-5 minutes | 7 minutes |
| Docker | 4-6 minutes | 8 minutes |
| Deploy Staging | 3-5 minutes | 7 minutes |
| Performance Test | 5-7 minutes | 10 minutes |
| Deploy Production | 3-5 minutes | 7 minutes |
| **Total** | **24-38 minutes** | **52 minutes** |

## Rollback Procedures

### Rollback Staging Deployment

```bash
# List previous revisions
az containerapp revision list \
  --name doganhub-staging \
  --resource-group DoganHubProd \
  --output table

# Activate previous revision
az containerapp revision activate \
  --name doganhub-staging \
  --resource-group DoganHubProd \
  --revision doganhub-staging--<previous-revision>
```

### Rollback Production Deployment

```bash
# Emergency rollback
az containerapp revision activate \
  --name doganhub-production \
  --resource-group DoganHubProd \
  --revision doganhub-production--<previous-revision>

# Verify rollback
curl https://doganhub.azurecontainerapps.io/api/health
```

## Monitoring During Deployment

### Real-time Monitoring Dashboard

```bash
# Watch deployment logs
az containerapp logs tail \
  --name doganhub-staging \
  --resource-group DoganHubProd \
  --follow

# Monitor Application Insights
az monitor app-insights metrics show \
  --app doganhub-appinsights \
  --resource-group DoganHubProd \
  --metric requests/count \
  --interval PT1M

# Check error rate
az monitor app-insights metrics show \
  --app doganhub-appinsights \
  --resource-group DoganHubProd \
  --metric requests/failed \
  --interval PT1M
```

### Key Metrics to Monitor

- **Response Time**: < 500ms (p95)
- **Error Rate**: < 1%
- **CPU Usage**: < 70%
- **Memory Usage**: < 80%
- **Request Rate**: Monitor for anomalies
- **Database Connections**: Monitor pool usage

## Success Metrics

Pipeline is considered successful when:

- ✅ All jobs complete without errors
- ✅ Code quality standards met
- ✅ All tests pass (100% success rate)
- ✅ Code coverage > 80%
- ✅ Build completes successfully
- ✅ Docker image built and pushed
- ✅ Staging deployment successful
- ✅ Performance benchmarks met
- ✅ Production deployment approved and completed
- ✅ Health checks pass post-deployment
- ✅ No errors in first 30 minutes
- ✅ Monitoring data flowing correctly
- ✅ Notifications sent successfully

## Next Steps

After successful pipeline testing:

1. **Document Results**: Record pipeline execution times and any issues
2. **Optimize**: Identify bottlenecks and optimize slow jobs
3. **Automate Further**: Add more automated tests and checks
4. **Monitor**: Set up dashboards for ongoing monitoring
5. **Iterate**: Continuously improve pipeline based on learnings

## Resources

- **GitHub Actions Docs**: https://docs.github.com/en/actions
- **Azure Container Apps**: https://docs.microsoft.com/azure/container-apps/
- **Lighthouse**: https://developers.google.com/web/tools/lighthouse
- **k6 Load Testing**: https://k6.io/docs/
- **Codecov**: https://docs.codecov.io/

---

**Status**: Ready for testing after all prerequisites completed
