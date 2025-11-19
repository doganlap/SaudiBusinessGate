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
      await this.inAppNotificationService.sendNotification(notification);
      await this.emailService.sendGenericNotification(notification);
      console.log(`User limit warning sent for tenant ${tenantId}`);
    } catch (error) {
      console.error('Failed to send user limit warning:', error);
      throw error;
    }
  }

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
      await this.inAppNotificationService.sendNotification(notification);
      await this.emailService.sendGenericNotification(notification);
      console.log(`Feature usage warning sent for tenant ${tenantId}`);
    } catch (error) {
      console.error('Failed to send feature usage warning:', error);
      throw error;
    }
  }

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
      await this.inAppNotificationService.sendNotification(notification);
      await this.emailService.sendGenericNotification(notification);
      console.log(`API limit warning sent for tenant ${tenantId}`);
    } catch (error) {
      console.error('Failed to send API limit warning:', error);
      throw error;
    }
  }

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
      await this.inAppNotificationService.sendNotification(notification);
      await this.emailService.sendGenericNotification(notification);
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

  public async sendJobLongRunningAlert(data: JobLongRunningAlert): Promise<void> {
    try {
      await this.emailService.sendJobLongRunningAlert(data);
      await this.inAppNotificationService.sendJobLongRunningAlert(data);
      console.log(`Long-running job alert sent for job ${data.jobName}`);
    } catch (error) {
      console.error('Failed to send long-running job alert:', error);
      throw error;
    }
  }

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
   * Get notification history for a tenant
   */
  public async getNotificationHistory(tenantId: string, limit: number = 50): Promise<any[]> {
    try {
      const { query } = require('@/lib/db/connection');
      const result = await query(
        `SELECT id, type, message, severity, data, created_at, read_at 
         FROM notifications 
         WHERE tenant_id = $1 
         ORDER BY created_at DESC 
         LIMIT $2`,
        [tenantId, limit]
      );
      return result.rows;
    } catch (error) {
      console.error('Failed to get notification history:', error);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
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
   * Check if tenant has webhook configured for specific event type
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

  /**
   * Check if job is critical
   */
  private isCriticalJob(jobName: string): boolean {
    const criticalJobs = [
      'license-expiry-check',
      'monthly-billing-cycle',
      'license-compliance-check',
      'license-status-sync'
    ];
    return criticalJobs.includes(jobName);
  }

  /**
   * Initialize email service
   */
  private initializeEmailService(): any {
    return {
      sendLicenseExpiryAlert: async (data: any) => console.log('Email: License expiry alert', data),
      sendUsageWarnings: async (data: any) => console.log('Email: Usage warnings', data),
      sendJobFailureAlert: async (data: any) => console.log('Email: Job failure alert', data),
      sendJobLongRunningAlert: async (data: any) => console.log('Email: Long-running job alert', data),
      sendGenericNotification: async (data: any) => console.log('Email: Generic notification', data)
    };
  }

  /**
   * Initialize Slack service
   */
  private initializeSlackService(): any {
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

  /**
   * Initialize webhook service
   */
  private initializeWebhookService(): any {
    return {
      sendLicenseExpiryWebhook: async (data: any) => {
        console.log('Webhook: License expiry', data);
      },
      sendUsageWarningsWebhook: async (data: any) => {
        console.log('Webhook: Usage warnings', data);
      },
    };
  }

  /**
   * Initialize in-app notification service
   */
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
}

export default NotificationService;
