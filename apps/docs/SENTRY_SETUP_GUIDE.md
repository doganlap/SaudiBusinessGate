# Sentry Project Setup Guide
# Step-by-step instructions for creating and configuring Sentry

## Prerequisites

- Sentry account (sign up at https://sentry.io)
- Access to create new projects in your Sentry organization

## Step 1: Create Sentry Account

1. Visit https://sentry.io
2. Click "Sign Up" or "Get Started"
3. Create account with email or GitHub/Google
4. Choose organization name (e.g., "Saudi Store")
5. Select plan:
   - **Developer Plan** (Free): 5K errors/month, 500 performance units
   - **Team Plan** ($26/month): 50K errors/month, 10K performance units
   - **Business Plan** (Custom): Unlimited

## Step 2: Create Project

### Using Web Interface

1. Log into Sentry dashboard
2. Click "Projects" in sidebar
3. Click "Create Project" button
   - **Project name**: `saudi-store` (or your preferred name)
   - **Platform**: Next.js
   - **Alert frequency**: "Alert me on every new issue"
   - **Project name**: `saudi-store` (or your preferred name)
   - **Team**: Select your default team
5. Click "Create Project"

### Using Sentry CLI (Alternative)

```bash
# Install Sentry CLI
npm install -g @sentry/cli

# Login to Sentry
sentry-cli login

# Create project
sentry-cli projects create \
  --org YOUR_ORG_SLUG \
  --team YOUR_TEAM_SLUG \
  --name saudi-store \
  --platform javascript-nextjs
```

## Step 3: Get DSN (Data Source Name)

### From Web Interface

1. After project creation, you'll see the DSN immediately
2. Or navigate to: **Settings** → **Projects** → **[Your Project]** → **Client Keys (DSN)**
3. Copy the DSN - it looks like:
   ```
   https://1234567890abcdef1234567890abcdef@o123456.ingest.sentry.io/1234567
   ```

### From CLI

```bash
sentry-cli projects list --org YOUR_ORG_SLUG
```

## Step 4: Configure Project Settings

### Error Tracking Settings

1. Go to **Settings** → **Projects** → **[Your Project]** → **General Settings**
2. Configure:
   - **Environment**: Set default to `development`
   - **Release Tracking**: Enable
   - **Source Maps**: Enable for better stack traces
   - **Event Grouping**: Use default configuration

### Performance Monitoring

1. Go to **Settings** → **Projects** → **[Your Project]** → **Performance**
2. Enable Performance Monitoring
3. Set sample rate:
   - **Development**: 100% (capture all transactions)
   - **Staging**: 50%
   - **Production**: 10% (adjust based on traffic)

### Session Replay

1. Go to **Settings** → **Projects** → **[Your Project]** → **Replays**
2. Enable Session Replay
3. Configure privacy settings:
   - **Block all media**: Recommended
   - **Block all text**: Consider for sensitive data
   - **Mask all text**: Alternative to blocking
4. Set replay sample rates:
   - **Error replays**: 100% (capture all errors)
   - **Session replays**: 10% (sample of normal sessions)

### Data Scrubbing

1. Go to **Settings** → **Projects** → **[Your Project]** → **Security & Privacy**
2. Enable data scrubbing:
   - ✅ Use default scrubbers
   - ✅ Scrub IP addresses
   - ✅ Prevent storing cookies
3. Add custom sensitive field names:
   ```
   password
   token
   secret
   api_key
   authorization
   credit_card
   ssn
   ```

## Step 5: Set Up Alerts

### Issue Alerts

1. Go to **Alerts** → **Create Alert**
2. Choose "Issues"
3. Configure alert conditions:

**Alert #1: New Issue**
- When: An event is first seen
- Action: Send notification to Slack + Email
- Frequency: Immediately

**Alert #2: High Error Rate**
- When: The issue is seen more than 100 times in 1 hour
- Action: Send notification to Slack + Email
- Frequency: Every 30 minutes

**Alert #3: Regression**
- When: The issue changes state from resolved to unresolved
- Action: Send notification to Slack + Email
- Frequency: Immediately

### Metric Alerts (Performance)

1. Go to **Alerts** → **Create Alert**
2. Choose "Number of Errors"
3. Configure:

**Alert #1: Error Spike**
- When: Number of events > 1000 in 5 minutes
- Environment: production
- Action: Send to Slack
- Frequency: Every 10 minutes

**Alert #2: Slow Transactions**
- When: Average transaction duration > 3000ms
- Environment: production
- Action: Send to Email
- Frequency: Every 30 minutes

## Step 6: Integrate with Tools

### Slack Integration

1. Go to **Settings** → **Integrations**
2. Find "Slack" and click "Add to Slack"
3. Authorize Sentry to access Slack
4. Select channel for notifications (e.g., `#alerts-production`)
5. Configure notification rules

### GitHub Integration

1. Go to **Settings** → **Integrations**
2. Find "GitHub" and click "Install"
3. Authorize Sentry to access GitHub
4. Select repositories to link
5. Enable features:
   - ✅ Commit tracking
   - ✅ Suspect commits
   - ✅ Issue linking
   - ✅ Stack trace linking

### Email Notifications

1. Go to **Settings** → **Account** → **Notifications**
2. Configure email preferences:
   - ✅ Workflow notifications
   - ✅ Deploy notifications
   - ✅ Issue alerts
3. Set frequency: Immediately for production, Daily digest for staging

## Step 7: Configure Environments

1. Go to **Settings** → **Projects** → **[Your Project]** → **Environments**
2. Add environments:
   - `development`
   - `staging`
   - `production`
3. Set hidden environments (optional):
   - Hide `development` from main views
   - Keep `staging` and `production` visible

## Step 8: Set Up Source Maps

### Automated Upload (Recommended)

Your `sentry.client.config.ts` and build configuration already handle this automatically when you deploy.

### Manual Upload (If Needed)

```bash
# Install Sentry CLI
npm install -g @sentry/cli

# Create auth token at https://sentry.io/settings/account/api/auth-tokens/
export SENTRY_AUTH_TOKEN=your_auth_token

# Upload source maps
sentry-cli releases new <release-version>
sentry-cli releases files <release-version> upload-sourcemaps .next
sentry-cli releases finalize <release-version>
```

## Step 9: Configure Release Tracking

1. Go to **Settings** → **Projects** → **[Your Project]** → **Release Tracking**
2. Enable:
   - ✅ Track releases
   - ✅ Associate commits with releases
   - ✅ Suggest suspect commits
3. Set up release health:
   - Monitor crash-free users
   - Monitor crash-free sessions

## Step 10: Test Integration

### Test Error Tracking

Add test button to your application:

```typescript
// Test error in your app
function testSentryError() {
  throw new Error("Sentry Test Error - Ignore");
}

// Test with user context
Sentry.setUser({ id: "test-user", email: "test@example.com" });
Sentry.captureException(new Error("Test with user context"));
```

### Test Performance Monitoring

```typescript
// Test custom transaction
const transaction = Sentry.startTransaction({
  name: "Test Transaction",
  op: "test",
});

// Do some work
await someAsyncOperation();

transaction.finish();
```

### Verify in Dashboard

1. Go to Sentry dashboard
2. Check "Issues" - you should see test errors
3. Check "Performance" - you should see test transactions
4. Check user is correctly identified in error details

## Generated Credentials

After completing setup, you'll have:

### DSN (Public)
```
https://[public-key]@[org].ingest.sentry.io/[project-id]
```
Used in: `NEXT_PUBLIC_SENTRY_DSN` and `SENTRY_DSN`

### Auth Token (Private)
Created at: https://sentry.io/settings/account/api/auth-tokens/
Used in: `SENTRY_AUTH_TOKEN` (for CI/CD)

### Organization Slug
Found in: Your Sentry URL
Example: `https://sentry.io/organizations/YOUR_ORG_SLUG/`
Used in: Sentry CLI commands

### Project Slug
Found in: Project settings
Example: `saudi-store`
Used in: Sentry CLI commands

## Environment Variables to Set

After completing setup, add these to your environment:

```bash
# .env.local (development)
   SENTRY_PROJECT=saudi-store
SENTRY_DSN=https://[public-key]@[org].ingest.sentry.io/[project-id]
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=doganhub-store

# GitHub Secrets (CI/CD)
SENTRY_DSN=https://[public-key]@[org].ingest.sentry.io/[project-id]
NEXT_PUBLIC_SENTRY_DSN=https://[public-key]@[org].ingest.sentry.io/[project-id]
SENTRY_AUTH_TOKEN=your-auth-token
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=saudi-store

# .env.monitoring (backup)
SENTRY_DSN=https://[public-key]@[org].ingest.sentry.io/[project-id]
NEXT_PUBLIC_SENTRY_DSN=https://[public-key]@[org].ingest.sentry.io/[project-id]
```

## Save Credentials Script

Create `.env.sentry` file:

```bash
# Sentry Project Credentials
# Generated: [DATE]

SENTRY_DSN=https://[public-key]@[org].ingest.sentry.io/[project-id]
NEXT_PUBLIC_SENTRY_DSN=https://[public-key]@[org].ingest.sentry.io/[project-id]
SENTRY_AUTH_TOKEN=your-auth-token
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=saudi-store
```

## Verification Checklist

- [ ] Sentry account created
- [ ] Project created with Next.js platform
- [ ] DSN obtained and saved
- [ ] Performance monitoring enabled
- [ ] Session replay configured
- [ ] Data scrubbing rules set
- [ ] Issue alerts configured
- [ ] Metric alerts configured
- [ ] Slack integration connected
- [ ] GitHub integration connected
- [ ] Email notifications configured
- [ ] Environments created (dev, staging, prod)
- [ ] Source maps configuration verified
- [ ] Release tracking enabled
- [ ] Test error sent and visible in dashboard
- [ ] Environment variables added to .env.local
- [ ] Secrets added to GitHub repository
- [ ] Credentials saved to .env.sentry

## Quick Commands

```bash
# Add Sentry DSN to GitHub Secrets
gh secret set SENTRY_DSN --repo YOUR_REPO
gh secret set NEXT_PUBLIC_SENTRY_DSN --repo YOUR_REPO
gh secret set SENTRY_AUTH_TOKEN --repo YOUR_REPO

# Test Sentry CLI
sentry-cli --version
sentry-cli info

# List projects
sentry-cli projects list

# Send test event
sentry-cli send-event -m "Test message from CLI"
```

## Troubleshooting

### Issue: DSN not working

**Solution**: Verify DSN format and check project settings

```bash
# Test DSN
curl -X POST 'https://[org].ingest.sentry.io/api/[project-id]/store/' \
  -H 'X-Sentry-Auth: Sentry sentry_key=[public-key]' \
  -d '{"message":"Test"}'
```

### Issue: Source maps not uploading

**Solution**: Check auth token permissions and Next.js config

```javascript
// next.config.js
module.exports = {
  sentry: {
    disableServerWebpackPlugin: false,
    disableClientWebpackPlugin: false,
  },
}
```

### Issue: Too many events

**Solution**: Adjust sample rates in code

```typescript
Sentry.init({
  tracesSampleRate: 0.1, // Reduce from 1.0
  replaysSessionSampleRate: 0.1,
});
```

## Resources

- **Sentry Dashboard**: https://sentry.io
- **Documentation**: https://docs.sentry.io
- **Next.js Integration**: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **Source Maps Guide**: https://docs.sentry.io/platforms/javascript/sourcemaps/
- **Performance Monitoring**: https://docs.sentry.io/product/performance/
- **Session Replay**: https://docs.sentry.io/product/session-replay/

## Support

- **Community Forum**: https://forum.sentry.io
- **GitHub Issues**: https://github.com/getsentry/sentry-javascript
- **Email Support**: support@sentry.io (paid plans)
- **Status Page**: https://status.sentry.io

---

**Next Step**: After completing Sentry setup, run the GitHub Secrets configuration script to add all credentials.
