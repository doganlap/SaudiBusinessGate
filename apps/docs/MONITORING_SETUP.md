# Monitoring Configuration Guide

This document provides step-by-step instructions for configuring Application Insights and Sentry monitoring.

---

## 1. Azure Application Insights Setup

### Step 1: Create Application Insights Resource

```bash
# Create Application Insights resource in Azure
az monitor app-insights component create \
  --app saudistore-appinsights \
  --location eastus \
  --resource-group SaudiStoreProd \
  --kind web \
  --application-type web
```

### Step 2: Get Connection String

```bash
# Get the connection string
az monitor app-insights component show \
  --app saudistore-appinsights \
  --resource-group SaudiStoreProd \
  --query "connectionString" -o tsv
```

**Output example**:
```
InstrumentationKey=12345678-1234-1234-1234-123456789012;IngestionEndpoint=https://eastus-8.in.applicationinsights.azure.com/;LiveEndpoint=https://eastus.livediagnostics.monitor.azure.com/
```

### Step 3: Add to Environment Variables

Create or update `.env.local`:

```env
# Azure Application Insights
NEXT_PUBLIC_APPLICATIONINSIGHTS_CONNECTION_STRING=InstrumentationKey=12345678-1234-1234-1234-123456789012;IngestionEndpoint=https://eastus-8.in.applicationinsights.azure.com/;LiveEndpoint=https://eastus.livediagnostics.monitor.azure.com/
```

### Step 4: Add to Azure Container Apps

```bash
# Add as environment variable to Container App
az containerapp update \
  --name doganhub-app \
  --resource-group DoganHubProd \
  --set-env-vars "NEXT_PUBLIC_APPLICATIONINSIGHTS_CONNECTION_STRING=InstrumentationKey=..."
```

### Step 5: Initialize in Application

Update `app/layout.tsx`:

```typescript
import { initAppInsights } from '@/lib/monitoring/app-insights';

// Initialize Application Insights
if (typeof window !== 'undefined') {
  initAppInsights();
}
```

### Step 6: Verify Telemetry

1. Deploy your application
2. Navigate to Azure Portal → Application Insights → doganhub-appinsights
3. Check **Live Metrics** for real-time data
4. Check **Logs** for custom events:
   ```kusto
   customEvents
   | where timestamp > ago(1h)
   | order by timestamp desc
   | take 100
   ```

---

## 2. Sentry Setup

### Step 1: Create Sentry Project

1. Go to [sentry.io](https://sentry.io) and sign in
2. Click **Projects** → **Create Project**
3. Select **Next.js** as platform
4. Name: `doganhub-production`
5. Click **Create Project**

### Step 2: Get DSN

1. After creating project, you'll see the DSN
2. Or navigate to: **Settings** → **Projects** → **doganhub-production** → **Client Keys (DSN)**
3. Copy the DSN

**Example DSN**:
```
https://abc123def456ghi789jkl012mno345p@o1234567.ingest.sentry.io/7654321
```

### Step 3: Add to Environment Variables

Update `.env.local`:

```env
# Sentry Error Tracking
NEXT_PUBLIC_SENTRY_DSN=https://abc123def456ghi789jkl012mno345p@o1234567.ingest.sentry.io/7654321
SENTRY_DSN=https://abc123def456ghi789jkl012mno345p@o1234567.ingest.sentry.io/7654321
SENTRY_AUTH_TOKEN=sntrys_your_auth_token_here
```

### Step 4: Initialize Sentry

Create `sentry.client.config.ts` in project root:

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Capture Replay for 10% of all sessions,
  // plus 100% of sessions with an error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Note: if you want to override the automatic release value, do not set a
  // `release` value here - use the environment variable `SENTRY_RELEASE`, so
  // that it will also get attached to your source maps
  environment: process.env.NODE_ENV,
});
```

Create `sentry.server.config.ts` in project root:

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  environment: process.env.NODE_ENV,
});
```

Create `sentry.edge.config.ts` in project root:

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  environment: process.env.NODE_ENV,
});
```

### Step 5: Update next.config.js

Add Sentry configuration:

```javascript
const { withSentryConfig } = require('@sentry/nextjs');

const moduleExports = {
  // Your existing Next.js config
};

const sentryWebpackPluginOptions = {
  // Suppresses source map uploading logs during build
  silent: true,
  org: "doganhub",
  project: "doganhub-production",
};

module.exports = withSentryConfig(moduleExports, sentryWebpackPluginOptions);
```

### Step 6: Add to Azure Container Apps

```bash
# Add Sentry DSN to Container App
az containerapp update \
  --name doganhub-app \
  --resource-group DoganHubProd \
  --set-env-vars \
    "NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/..." \
    "SENTRY_DSN=https://...@sentry.io/..." \
    "SENTRY_AUTH_TOKEN=sntrys_..."
```

### Step 7: Test Error Tracking

Create a test error:

```typescript
// Add this to any page for testing
if (typeof window !== 'undefined') {
  window.testSentryError = () => {
    throw new Error('Test Sentry Error');
  };
}
```

Then in browser console:
```javascript
testSentryError()
```

Check Sentry dashboard for the error.

---

## 3. Alerting Configuration

### Step 1: Configure Slack Webhook

1. Go to your Slack workspace
2. Navigate to: [api.slack.com/apps](https://api.slack.com/apps)
3. Click **Create New App** → **From scratch**
4. Name: `DoganHub Alerts`
5. Select your workspace
6. Click **Incoming Webhooks** → Toggle **Activate Incoming Webhooks**
7. Click **Add New Webhook to Workspace**
8. Select channel: `#doganhub-alerts`
9. Copy the webhook URL

### Step 2: Configure Email SMTP

Update `.env.local`:

```env
# Email Alerts
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=alerts@doganhub.com
SMTP_PASS=your_app_password
ALERT_EMAIL_FROM=alerts@doganhub.com
ALERT_EMAIL_TO=devops@doganhub.com,admin@doganhub.com
```

**Gmail Setup**:
1. Enable 2-factor authentication
2. Generate App Password: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Use app password as `SMTP_PASS`

### Step 3: Configure PagerDuty (Optional)

1. Go to [pagerduty.com](https://pagerduty.com)
2. Navigate to **Services** → **Service Directory** → **New Service**
3. Name: `DoganHub Production`
4. Integration Type: **Events API V2**
5. Copy the **Integration Key**

Update `.env.local`:

```env
# PagerDuty
PAGERDUTY_INTEGRATION_KEY=your_integration_key_here
```

### Step 4: Configure Twilio SMS (Optional)

1. Go to [twilio.com](https://twilio.com)
2. Create account or sign in
3. Get **Account SID** and **Auth Token** from dashboard
4. Purchase a phone number

Update `.env.local`:

```env
# Twilio SMS Alerts
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_FROM_NUMBER=+1234567890
ALERT_SMS_TO=+1234567890,+0987654321
```

### Step 5: Add to Azure Container Apps

```bash
# Add alerting configuration
az containerapp update \
  --name doganhub-app \
  --resource-group DoganHubProd \
  --set-env-vars \
    "SLACK_WEBHOOK_URL=https://hooks.slack.com/services/..." \
    "SMTP_HOST=smtp.gmail.com" \
    "SMTP_PORT=587" \
    "SMTP_USER=alerts@doganhub.com" \
    "SMTP_PASS=app_password"
```

### Step 6: Test Alerting

Create `scripts/test-alerts.js`:

```javascript
import { sendAlert } from '../lib/monitoring/alerting.js';

// Test Slack alert
await sendAlert('test', {
  message: 'Test alert from DoganHub monitoring',
  severity: 'info',
  timestamp: new Date().toISOString(),
});

console.log('✅ Test alert sent!');
```

Run:
```bash
node scripts/test-alerts.js
```

---

## 4. Application Insights Queries

### Common Queries

**1. Request Performance**:
```kusto
requests
| where timestamp > ago(24h)
| summarize 
    AvgDuration = avg(duration),
    P95Duration = percentile(duration, 95),
    P99Duration = percentile(duration, 99),
    RequestCount = count()
    by bin(timestamp, 1h)
| render timechart
```

**2. Error Rate**:
```kusto
requests
| where timestamp > ago(24h)
| summarize 
    TotalRequests = count(),
    FailedRequests = countif(success == false)
    by bin(timestamp, 1h)
| extend ErrorRate = (FailedRequests * 100.0) / TotalRequests
| render timechart
```

**3. Top Slow Requests**:
```kusto
requests
| where timestamp > ago(24h)
| where duration > 1000
| order by duration desc
| take 20
| project timestamp, name, url, duration, resultCode
```

**4. Custom Events**:
```kusto
customEvents
| where timestamp > ago(24h)
| where name == "user_action"
| summarize count() by tostring(customDimensions.action)
| order by count_ desc
```

**5. Exceptions**:
```kusto
exceptions
| where timestamp > ago(24h)
| summarize count() by type, outerMessage
| order by count_ desc
```

---

## 5. Create Azure Dashboards

### Step 1: Create Dashboard

```bash
# Create a new dashboard
az portal dashboard create \
  --name "DoganHub Production Monitoring" \
  --resource-group DoganHubProd \
  --location eastus
```

### Step 2: Add Tiles

1. Navigate to Azure Portal
2. Click **Dashboard** → **DoganHub Production Monitoring**
3. Click **Edit** → **Add tile**

**Add these tiles**:
- Request Rate (Line chart from App Insights)
- Response Time (Line chart from App Insights)
- Failed Requests (Metric from App Insights)
- CPU Usage (Container App metric)
- Memory Usage (Container App metric)
- Active Connections (PostgreSQL metric)
- Cache Hit Rate (Redis metric)

### Step 3: Pin Common Queries

1. Run a query in Application Insights
2. Click **Pin to dashboard**
3. Select **DoganHub Production Monitoring**

---

## 6. Alert Rules in Azure

### Create Alert Rules

```bash
# High response time alert
az monitor metrics alert create \
  --name "High Response Time" \
  --resource-group DoganHubProd \
  --scopes /subscriptions/{sub-id}/resourceGroups/DoganHubProd/providers/Microsoft.Insights/components/doganhub-appinsights \
  --condition "avg requests/duration > 2000" \
  --window-size 5m \
  --evaluation-frequency 1m \
  --action-group AlertActionGroup

# High error rate alert
az monitor metrics alert create \
  --name "High Error Rate" \
  --resource-group DoganHubProd \
  --scopes /subscriptions/{sub-id}/resourceGroups/DoganHubProd/providers/Microsoft.Insights/components/doganhub-appinsights \
  --condition "avg requests/failed > 50" \
  --window-size 5m \
  --evaluation-frequency 1m \
  --action-group AlertActionGroup
```

---

## 7. Verification Checklist

- [ ] Application Insights resource created
- [ ] Connection string configured
- [ ] Telemetry visible in Azure Portal
- [ ] Live Metrics showing data
- [ ] Sentry project created
- [ ] Sentry DSN configured
- [ ] Test error captured in Sentry
- [ ] Slack webhook configured
- [ ] Test alert received in Slack
- [ ] Email SMTP configured (optional)
- [ ] PagerDuty configured (optional)
- [ ] Twilio SMS configured (optional)
- [ ] Azure dashboard created
- [ ] Alert rules configured
- [ ] All environment variables in Container Apps

---

**Last Updated**: November 12, 2025
**Document Version**: 1.0
