/**
 * Notification Service for License Management
 * Handles various types of notifications and alerts
 */

export interface LicenseExpiryAlert {
  licenseId: string;
  tenantId: string;
  daysUntilExpiry: number;
  urgency: 'low' | 'medium' | 'high';
  licenseType: string;
  expiryDate: Date;
}

export interface UsageWarnings {
  tenantId: string;
  warnings: any[];
  date: Date;
}

export interface JobFailureAlert {
  jobName: string;
  error: string;
  startTime: Date;
  endTime: Date;
}

export interface JobLongRunningAlert {
  jobName: string;
  runningTime: number;
  startTime: Date;
}

export interface JobRecentFailureAlert {
  jobName: string;
  error: string;
  failureTime: Date;
}

export class NotificationService {
  private emailService: any;
  private slackService: any;
  private webhookService: any;
  private inAppNotificationService: any;

  constructor() {
    this.emailService = this.initializeEmailService();
    this.slackService = this.initializeSlackService();
    this.webhookService = this.initializeWebhookService();
    this.inAppNotificationService = this.initializeInAppNotificationService();
  }

  /**
   * Send license expiry alerts through multiple channels
   */
  public async sendLicenseExpiryAlert(data: LicenseExpiryAlert): Promise<void> {
    try {
      // Send email notification
      await this.emailService.sendLicenseExpiryAlert(data);

      // Send in-app notification
      await this.inAppNotificationService.sendLicenseExpiryNotification(data);

      // Send webhook notification if configured
      if (await this.hasWebhookConfigured(data.tenantId, 'license_expiry')) {
        await this.webhookService.sendLicenseExpiryWebhook(data);
      }

      // Send Slack notification for urgent cases
      if (data.urgency === 'high') {
        await this.slackService.sendUrgentLicenseExpiryAlert(data);
      }

      console.log(`License expiry alert sent for tenant ${data.tenantId}`);
    } catch (error) {
      console.error('Failed to send license expiry alert:', error);
      throw error;
    }
  }

  /**
   * Send usage warnings to tenant administrators
   */
  public async sendUsageWarnings(data: UsageWarnings): Promise<void> {
    try {
      // Send email warning
      await this.emailService.sendUsageWarnings(data);

      // Send in-app notification
      await this.inAppNotificationService.sendUsageWarning(data);

      // Send webhook if configured
      if (await this.hasWebhookConfigured(data.tenantId, 'usage_warnings')) {
        await this.webhookService.sendUsageWarningsWebhook(data);
      }

      console.log(`Usage warnings sent for tenant ${data.tenantId}`);
    } catch (error) {
      console.error('Failed to send usage warnings:', error);
      throw error;
    }
  }

  /**
   * Send user limit warnings
   */
  public async sendUserLimitWarning(tenantId: string, violationData: any): Promise<void> {
    try {
      const notification = {
        type: 'user_limit_exceeded',
        tenantId,
        message: `User limit exceeded: ${violationData.currentUsers}/${violationData.limit} users`,
        severity: 'warning',
        data: violationData,
        timestamp: new Date()
      };

      await this.sendNotification(notification);
      console.log(`User limit warning sent for tenant ${tenantId}`);
    } catch (error) {
      console.error('Failed to send user limit warning:', error);
      throw error;
    }
  }

  /**
   * Send feature usage warnings
   */
  public async sendFeatureUsageWarning(tenantId: string, violationData: any): Promise<void> {
    try {
      const notification = {
        type: 'feature_usage_exceeded',
        tenantId,
        message: `Feature usage limit exceeded for: ${violationData.featureName}`,
        severity: 'warning',
        data: violationData,
        timestamp: new Date()
      };

      await this.sendNotification(notification);
      console.log(`Feature usage warning sent for tenant ${tenantId}`);
    } catch (error) {
      console.error('Failed to send feature usage warning:', error);
      throw error;
    }
  }

  /**
   * Send API limit warnings
   */
  public async sendApiLimitWarning(tenantId: string, violationData: any): Promise<void> {
    try {
      const notification = {
        type: 'api_limit_exceeded',
        tenantId,
        message: `API limit exceeded: ${violationData.currentCalls}/${violationData.limit} calls per ${violationData.period}`,
        severity: 'warning',
        data: violationData,
        timestamp: new Date()
      };

      await this.sendNotification(notification);
      console.log(`API limit warning sent for tenant ${tenantId}`);
    } catch (error) {
      console.error('Failed to send API limit warning:', error);
      throw error;
    }
  }

  /**
   * Send storage warnings
   */
  public async sendStorageWarning(tenantId: string, violationData: any): Promise<void> {
    try {
      const notification = {
        type: 'storage_limit_exceeded',
        tenantId,
        message: `Storage limit exceeded: ${violationData.currentStorage}/${violationData.limit} ${violationData.unit}`,
        severity: 'warning',
        data: violationData,
        timestamp: new Date()
      };

      await this.sendNotification(notification);
      console.log(`Storage warning sent for tenant ${tenantId}`);
    } catch (error) {
      console.error('Failed to send storage warning:', error);
      throw error;
    }
  }

  /**
   * Send job failure alerts to platform administrators
   */
  public async sendJobFailureAlert(data: JobFailureAlert): Promise<void> {
    try {
      // Send email alert
      await this.emailService.sendJobFailureAlert(data);

      // Send Slack alert for critical jobs
      if (this.isCriticalJob(data.jobName)) {
        await this.slackService.sendCriticalJobFailureAlert(data);
      }

      // Send in-app notification to platform admins
      await this.inAppNotificationService.sendJobFailureAlert(data);

      console.log(`Job failure alert sent for job ${data.jobName}`);
    } catch (error) {
      console.error('Failed to send job failure alert:', error);
      throw error;
    }
  }

  /**
   * Send long-running job alerts
   */
  public async sendJobLongRunningAlert(data: JobLongRunningAlert): Promise<void> {
    try {
      // Send email alert
      await this.emailService.sendJobLongRunningAlert(data);

      // Send in-app notification
      await this.inAppNotificationService.sendJobLongRunningAlert(data);

      console.log(`Long-running job alert sent for job ${data.jobName}`);
    } catch (error) {
      console.error('Failed to send long-running job alert:', error);
      throw error;
    }
  }

  /**
   * Send recent failure alerts
   */
  public async sendJobRecentFailureAlert(data: JobRecentFailureAlert): Promise<void> {
    try {
      const notification = {
        type: 'job_recent_failure',
        message: `Job ${data.jobName} failed recently: ${data.error}`,
        severity: 'error',
        data,
        timestamp: new Date()
      };

      await this.inAppNotificationService.sendSystemAlert(notification);
      console.log(`Recent failure alert sent for job ${data.jobName}`);
    } catch (error) {
      console.error('Failed to send recent failure alert:', error);
      throw error;
    }
  }

  /**
   * Generic notification sender
   */
  private async sendNotification(notification: any): Promise<void> {
    try {
      // Send email if severity is warning or higher
      if (['warning', 'error', 'critical'].includes(notification.severity)) {
        await this.emailService.sendGenericNotification(notification);
      }

      // Always send in-app notification
      await this.inAppNotificationService.sendNotification(notification);

      // Send webhook if configured
      if (notification.tenantId && await this.hasWebhookConfigured(notification.tenantId, notification.type)) {
        await this.webhookService.sendGenericWebhook(notification);
      }

      // Log notification
      await this.logNotification(notification);

    } catch (error) {
      console.error('Failed to send notification:', error);
      throw error;
    }
  }

  /**
   * Initialize services
   */
  private initializeEmailService(): any {
    // Return email service instance
    return {
      sendLicenseExpiryAlert: async (data: any) => console.log('Email: License expiry alert', data),
      sendUsageWarnings: async (data: any) => console.log('Email: Usage warnings', data),
      sendJobFailureAlert: async (data: any) => console.log('Email: Job failure alert', data),
      sendJobLongRunningAlert: async (data: any) => console.log('Email: Long-running job alert', data),
      sendGenericNotification: async (data: any) => console.log('Email: Generic notification', data)
    };
  }

  private initializeSlackService(): any {
    // Initialize Slack service
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    
    if (!webhookUrl) {
      return null;
    }

    return {
      sendUrgentLicenseExpiryAlert: async (data: any) => {
        console.log('Slack: Urgent license expiry alert', data);
      },
      sendCriticalJobFailureAlert: async (data: any) => {
        console.log('Slack: Critical job failure alert', data);
      }
    };
  }

  private initializeWebhookService(): any {
    return {
      sendLicenseExpiryWebhook: async (data: any) => {
        console.log('Webhook: License expiry', data);
      },
      sendUsageWarningsWebhook: async (data: any) => {
        console.log('Webhook: Usage warnings', data);
      },
      sendGenericWebhook: async (data: any) => {
        console.log('Webhook: Generic notification', data);
      }
    };
  }

  private initializeInAppNotificationService(): any {
    return {
      sendLicenseExpiryNotification: async (data: any) => {
        console.log('In-app: License expiry notification', data);
      },
      sendUsageWarning: async (data: any) => {
        console.log('In-app: Usage warning', data);
      },
      sendJobFailureAlert: async (data: any) => {
        console.log('In-app: Job failure alert', data);
      },
      sendJobLongRunningAlert: async (data: any) => {
        console.log('In-app: Long-running job alert', data);
      },
      sendSystemAlert: async (data: any) => {
        console.log('In-app: System alert', data);
      },
      sendNotification: async (data: any) => {
        console.log('In-app: Generic notification', data);
      }
    };
  }

  /**
   * Helper methods
   */
  private async hasWebhookConfigured(tenantId: string, eventType: string): Promise<boolean> {
    try {
      const { query } = require('@/lib/db/connection');
      const result = await query(
        'SELECT webhook_url FROM tenant_webhook_configs WHERE tenant_id = $1 AND event_type = $2 AND is_active = true',
        [tenantId, eventType]
      );
      return result.rows.length > 0;
    } catch (error) {
      console.error('Failed to check webhook configuration:', error);
      return false;
    }
  }

  private isCriticalJob(jobName: string): boolean {
    const criticalJobs = [
      'license-expiry-check',
      'monthly-billing-cycle',
      'license-compliance-check',
      'license-status-sync'
    ];
    return criticalJobs.includes(jobName);
  }

  private async logNotification(notification: any): Promise<void> {
    // Log notification for audit trail
    console.log('Notification logged:', {
      type: notification.type,
      severity: notification.severity,
      timestamp: notification.timestamp
    });
  }

  /**
   * Notification preferences management
   */
  public async updateNotificationPreferences(tenantId: string, preferences: any): Promise<void> {
    // Update notification preferences for a tenant
    console.log(`Updated notification preferences for tenant ${tenantId}`, preferences);
  }

  public async getNotificationPreferences(tenantId: string): Promise<any> {
    // Get notification preferences for a tenant
    return {
      email: true,
      inApp: true,

public async markNotificationAsRead(notificationId: string): Promise<void> {
try {
const { query } = require('@/lib/db/connection');
await query(
'UPDATE notifications SET read_at = NOW() WHERE id = $1',
[notificationId]
);
console.log(`Marked notification ${notificationId} as read`);
} catch (error) {
console.error('Failed to mark notification as read:', error);
}
}

/**
* Bulk notification operations
*/
public async sendBulkNotification(tenantIds: string[], notification: any): Promise<void> {
// Send notification to multiple tenants
for (const tenantId of tenantIds) {
await this.sendNotification({ ...notification, tenantId });
}
}

public async scheduleNotification(notification: any, scheduleTime: Date): Promise<string> {
// Schedule a notification for future delivery
const notificationId = `scheduled_${Date.now()}`;
console.log(`Scheduled notification ${notificationId} for ${scheduleTime}`);
return notificationId;
}

public async cancelScheduledNotification(notificationId: string): Promise<void> {
// Cancel a scheduled notification
console.log(`Cancelled scheduled notification ${notificationId}`);
}

/**
* Send general alert
*/
public async sendAlert(alert: {
tenantId: string;
type: string;
title: string;
message: string;
data?: any;
}): Promise<void> {
try {
const { tenantId, type, title, message, data } = alert;
  
// Send email notification
await this.emailService.send({
to: `admin@${tenantId}.com`, // This should be replaced with actual admin email
subject: title,
text: message,
html: `<h3>${title}</h3><p>${message}</p>`
});
  
// Log the alert
console.log(`Alert sent to tenant ${tenantId}: ${type} - ${title}`);
  
// Store in database for audit
// This would typically be stored in a notifications/alerts table
  
} catch (error) {
console.error('Failed to send alert:', error);
throw error;
}
    tenantId: string;
    type: string;
    title: string;
    message: string;
    data?: any;
  }): Promise<void> {
    try {
      const { tenantId, type, title, message, data } = alert;
      
      // Send email notification
      await this.emailService.send({
        to: `admin@${tenantId}.com`, // This should be replaced with actual admin email
        subject: title,
        text: message,
        html: `<h3>${title}</h3><p>${message}</p>`
      });
      
      // Log the alert
      console.log(`Alert sent to tenant ${tenantId}: ${type} - ${title}`);
      
      // Store in database for audit
      // This would typically be stored in a notifications/alerts table
      
    } catch (error) {
      console.error('Failed to send alert:', error);
      throw error;
    }
  }
}

export default NotificationService;