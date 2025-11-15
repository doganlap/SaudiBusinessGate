/**
 * Alerting Configuration
 * Define alerting rules and thresholds
 */

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  metric: string;
  threshold: number;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  duration: number; // in seconds
  severity: 'critical' | 'warning' | 'info';
  channels: string[];
  enabled: boolean;
}

/**
 * Pre-configured alert rules
 */
export const ALERT_RULES: AlertRule[] = [
  // Performance Alerts
  {
    id: 'high-response-time',
    name: 'High API Response Time',
    description: 'API response time exceeds 500ms',
    metric: 'api.response_time',
    threshold: 500,
    operator: 'gt',
    duration: 300, // 5 minutes
    severity: 'warning',
    channels: ['slack', 'email'],
    enabled: true
  },
  {
    id: 'critical-response-time',
    name: 'Critical API Response Time',
    description: 'API response time exceeds 2000ms',
    metric: 'api.response_time',
    threshold: 2000,
    operator: 'gt',
    duration: 60, // 1 minute
    severity: 'critical',
    channels: ['slack', 'email', 'pagerduty'],
    enabled: true
  },

  // Error Rate Alerts
  {
    id: 'high-error-rate',
    name: 'High Error Rate',
    description: 'Error rate exceeds 5%',
    metric: 'api.error_rate',
    threshold: 5,
    operator: 'gt',
    duration: 300,
    severity: 'warning',
    channels: ['slack', 'email'],
    enabled: true
  },
  {
    id: 'critical-error-rate',
    name: 'Critical Error Rate',
    description: 'Error rate exceeds 10%',
    metric: 'api.error_rate',
    threshold: 10,
    operator: 'gt',
    duration: 60,
    severity: 'critical',
    channels: ['slack', 'email', 'pagerduty'],
    enabled: true
  },

  // Resource Utilization Alerts
  {
    id: 'high-cpu-usage',
    name: 'High CPU Usage',
    description: 'CPU usage exceeds 80%',
    metric: 'system.cpu_usage',
    threshold: 80,
    operator: 'gt',
    duration: 600, // 10 minutes
    severity: 'warning',
    channels: ['slack'],
    enabled: true
  },
  {
    id: 'high-memory-usage',
    name: 'High Memory Usage',
    description: 'Memory usage exceeds 85%',
    metric: 'system.memory_usage',
    threshold: 85,
    operator: 'gt',
    duration: 600,
    severity: 'warning',
    channels: ['slack'],
    enabled: true
  },

  // Database Alerts
  {
    id: 'high-db-connections',
    name: 'High Database Connections',
    description: 'Database connections exceed 80% of pool',
    metric: 'database.connections',
    threshold: 16, // 80% of max 20
    operator: 'gt',
    duration: 300,
    severity: 'warning',
    channels: ['slack', 'email'],
    enabled: true
  },
  {
    id: 'slow-queries',
    name: 'Slow Database Queries',
    description: 'Database query time exceeds 1000ms',
    metric: 'database.query_time',
    threshold: 1000,
    operator: 'gt',
    duration: 300,
    severity: 'warning',
    channels: ['slack'],
    enabled: true
  },

  // Cache Performance
  {
    id: 'low-cache-hit-rate',
    name: 'Low Cache Hit Rate',
    description: 'Cache hit rate below 70%',
    metric: 'cache.hit_rate',
    threshold: 70,
    operator: 'lt',
    duration: 600,
    severity: 'warning',
    channels: ['slack'],
    enabled: true
  },

  // Security Alerts
  {
    id: 'multiple-failed-logins',
    name: 'Multiple Failed Login Attempts',
    description: 'More than 5 failed login attempts in 5 minutes',
    metric: 'security.failed_logins',
    threshold: 5,
    operator: 'gt',
    duration: 300,
    severity: 'warning',
    channels: ['slack', 'email', 'security-team'],
    enabled: true
  },
  {
    id: 'rate-limit-exceeded',
    name: 'Rate Limit Exceeded',
    description: 'Too many rate limit violations',
    metric: 'security.rate_limit_violations',
    threshold: 100,
    operator: 'gt',
    duration: 300,
    severity: 'warning',
    channels: ['slack'],
    enabled: true
  },

  // Business Metrics
  {
    id: 'payment-failures',
    name: 'High Payment Failure Rate',
    description: 'Payment failure rate exceeds 10%',
    metric: 'business.payment_failure_rate',
    threshold: 10,
    operator: 'gt',
    duration: 600,
    severity: 'critical',
    channels: ['slack', 'email', 'finance-team'],
    enabled: true
  },

  // Availability Alerts
  {
    id: 'service-down',
    name: 'Service Down',
    description: 'Service health check failing',
    metric: 'service.health',
    threshold: 1,
    operator: 'lt',
    duration: 60,
    severity: 'critical',
    channels: ['slack', 'email', 'pagerduty', 'sms'],
    enabled: true
  }
];

/**
 * Alert notification channels configuration
 */
export const ALERT_CHANNELS = {
  slack: {
    webhook: process.env.SLACK_WEBHOOK_URL,
    enabled: !!process.env.SLACK_WEBHOOK_URL
  },
  email: {
    smtp: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      user: process.env.SMTP_USER,
      password: process.env.SMTP_PASSWORD,
    },
    from: process.env.FROM_EMAIL || 'alerts@dogan-ai.com',
    to: process.env.ALERT_EMAIL || 'devops@dogan-ai.com',
    enabled: !!process.env.SMTP_HOST
  },
  pagerduty: {
    integrationKey: process.env.PAGERDUTY_INTEGRATION_KEY,
    enabled: !!process.env.PAGERDUTY_INTEGRATION_KEY
  },
  sms: {
    provider: 'twilio',
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: process.env.ALERT_PHONE_NUMBER,
    enabled: !!process.env.TWILIO_ACCOUNT_SID
  }
};

/**
 * Send alert notification
 */
export async function sendAlert(rule: AlertRule, value: number, timestamp: Date) {
  const message = formatAlertMessage(rule, value, timestamp);

  for (const channel of rule.channels) {
    try {
      switch (channel) {
        case 'slack':
          await sendSlackAlert(message, rule.severity);
          break;
        case 'email':
          await sendEmailAlert(message, rule);
          break;
        case 'pagerduty':
          await sendPagerDutyAlert(message, rule);
          break;
        case 'sms':
          await sendSMSAlert(message);
          break;
        default:
          console.warn(`Unknown alert channel: ${channel}`);
      }
    } catch (error) {
      console.error(`Failed to send alert to ${channel}:`, error);
    }
  }
}

/**
 * Format alert message
 */
function formatAlertMessage(rule: AlertRule, value: number, timestamp: Date): string {
  const emoji = rule.severity === 'critical' ? '🚨' : rule.severity === 'warning' ? '⚠️' : 'ℹ️';
  
  return `${emoji} **${rule.name}**

**Severity:** ${rule.severity.toUpperCase()}
**Description:** ${rule.description}
**Current Value:** ${value}
**Threshold:** ${rule.threshold}
**Time:** ${timestamp.toISOString()}

**Action Required:** Please investigate immediately.`;
}

/**
 * Send Slack alert
 */
async function sendSlackAlert(message: string, severity: string) {
  if (!ALERT_CHANNELS.slack.enabled) return;

  const color = severity === 'critical' ? '#FF0000' : severity === 'warning' ? '#FFA500' : '#0000FF';

  await fetch(ALERT_CHANNELS.slack.webhook!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      attachments: [{
        color,
        text: message,
        footer: 'Saudi Store Monitoring',
        ts: Math.floor(Date.now() / 1000)
      }]
    })
  });
}

/**
 * Send email alert
 */
async function sendEmailAlert(message: string, rule: AlertRule) {
  if (!ALERT_CHANNELS.email.enabled) return;

  // Email sending logic (implement with nodemailer or your email service)
  console.log('Email alert would be sent:', message);
}

/**
 * Send PagerDuty alert
 */
async function sendPagerDutyAlert(message: string, rule: AlertRule) {
  if (!ALERT_CHANNELS.pagerduty.enabled) return;

  await fetch('https://events.pagerduty.com/v2/enqueue', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      routing_key: ALERT_CHANNELS.pagerduty.integrationKey,
      event_action: 'trigger',
      payload: {
        summary: rule.name,
        severity: rule.severity,
        source: 'Saudi Store',
        custom_details: { message }
      }
    })
  });
}

/**
 * Send SMS alert
 */
async function sendSMSAlert(message: string) {
  if (!ALERT_CHANNELS.sms.enabled) return;

  // SMS sending logic (implement with Twilio or your SMS service)
  console.log('SMS alert would be sent:', message);
}

export default {
  rules: ALERT_RULES,
  channels: ALERT_CHANNELS,
  sendAlert,
};
