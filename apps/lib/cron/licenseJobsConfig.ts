/**
 * License Management Cron Jobs Configuration
 * Handles automated renewal reminders, usage aggregation, and license expiry monitoring
 * 
 * Schedule Patterns:
 * - Daily: '0 0 * * *'     // Every day at midnight
 * - Weekly: '0 0 * * 0'    // Every Sunday at midnight
 * - Monthly: '0 0 1 * *'   // First day of month at midnight
 * - Hourly: '0 * * * *'    // Every hour
 */

import { LicenseService } from '../services/license.service';
import { EmailService } from '../services/email.service';
import { BillingService } from '../services/billing.service';
import { UsageService } from '../services/usage.service';
import { NotificationService } from '../services/notification.service';
import { DatabaseService } from '../services/database.service';

interface CronJobConfig {
  name: string;
  schedule: string;
  description: string;
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
  handler: () => Promise<void>;
}

export class LicenseJobsConfig {
  private licenseService: LicenseService;
  private emailService: EmailService;
  private billingService: BillingService;
  private usageService: UsageService;
  private notificationService: NotificationService;
  private dbService: DatabaseService;

  constructor() {
    this.licenseService = new LicenseService();
    this.emailService = new EmailService();
    this.billingService = new BillingService();
    this.usageService = new UsageService();
    this.notificationService = new NotificationService();
    this.dbService = new DatabaseService();
  }

  /**
   * Complete list of license management cron jobs
   */
  getCronJobs(): CronJobConfig[] {
    return [
      // Daily Jobs
      {
        name: 'license-expiry-check',
        schedule: '0 2 * * *', // Daily at 2:00 AM
        description: 'Check for upcoming license expirations and send alerts',
        enabled: true,
        handler: this.handleExpiryCheck.bind(this)
      },
      {
        name: 'usage-data-aggregation',
        schedule: '0 1 * * *', // Daily at 1:00 AM
        description: 'Aggregate daily usage data for all tenants',
        enabled: true,
        handler: this.handleUsageAggregation.bind(this)
      },
      {
        name: 'renewal-reminders',
        schedule: '0 9 * * *', // Daily at 9:00 AM
        description: 'Send renewal reminders to tenants',
        enabled: true,
        handler: this.handleRenewalReminders.bind(this)
      },
      {
        name: 'license-compliance-check',
        schedule: '0 3 * * *', // Daily at 3:00 AM
        description: 'Check license compliance and usage limits',
        enabled: true,
        handler: this.handleComplianceCheck.bind(this)
      },

      // Weekly Jobs
      {
        name: 'weekly-usage-report',
        schedule: '0 8 * * 1', // Monday at 8:00 AM
        description: 'Generate weekly usage reports for platform admins',
        enabled: true,
        handler: this.handleWeeklyUsageReport.bind(this)
      },
      {
        name: 'renewal-pipeline-update',
        schedule: '0 10 * * 1', // Monday at 10:00 AM
        description: 'Update renewal pipeline and sales forecasts',
        enabled: true,
        handler: this.handleRenewalPipelineUpdate.bind(this)
      },

      // Monthly Jobs
      {
        name: 'monthly-billing-cycle',
        schedule: '0 0 1 * *', // First day of month at midnight
        description: 'Process monthly billing cycles and invoices',
        enabled: true,
        handler: this.handleMonthlyBilling.bind(this)
      },
      {
        name: 'license-audit',
        schedule: '0 6 1 * *', // First day of month at 6:00 AM
        description: 'Perform comprehensive license audit and reconciliation',
        enabled: true,
        handler: this.handleLicenseAudit.bind(this)
      },
      {
        name: 'upgrade-recommendations',
        schedule: '0 12 15 * *', // 15th of month at noon
        description: 'Generate upgrade recommendations based on usage patterns',
        enabled: true,
        handler: this.handleUpgradeRecommendations.bind(this)
      },

      // Hourly Jobs
      {
        name: 'license-status-sync',
        schedule: '0 * * * *', // Every hour
        description: 'Sync license status with external billing systems',
        enabled: true,
        handler: this.handleLicenseStatusSync.bind(this)
      },
      {
        name: 'usage-threshold-monitoring',
        schedule: '15 * * * *', // Every hour at 15 minutes past
        description: 'Monitor usage thresholds and send warnings',
        enabled: true,
        handler: this.handleUsageThresholdMonitoring.bind(this)
      }
    ];
  }

  /**
   * Daily License Expiry Check
   * Identifies licenses expiring in 30, 15, 7, 3, 1 days and sends notifications
   */
  private async handleExpiryCheck(): Promise<void> {
    try {
      console.log('Starting license expiry check...');
      
      const expiryThresholds = [30, 15, 7, 3, 1]; // days before expiry
      
      for (const days of expiryThresholds) {
        const expiringLicenses = await this.licenseService.getExpiringLicenses(days);
        
        for (const license of expiringLicenses) {
          // Send notification based on urgency
          const urgencyLevel = days <= 7 ? 'high' : days <= 15 ? 'medium' : 'low';
          
          await this.notificationService.sendLicenseExpiryAlert({
            licenseId: license.id,
            tenantId: license.tenantId,
            daysUntilExpiry: days,
            urgency: urgencyLevel,
            licenseType: license.licenseType,
            expiryDate: license.expiryDate
          });

          // Log expiry alert
          await this.dbService.logLicenseEvent({
            licenseId: license.id,
            eventType: 'expiry_alert',
            eventData: { daysUntilExpiry: days, urgency: urgencyLevel },
            timestamp: new Date()
          });
        }
      }
      
      console.log('License expiry check completed');
    } catch (error) {
      console.error('Error in license expiry check:', error);
      throw error;
    }
  }

  /**
   * Daily Usage Data Aggregation
   * Collects and processes usage data for analytics and billing
   */
  private async handleUsageAggregation(): Promise<void> {
    try {
      console.log('Starting usage data aggregation...');
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      // Get all active tenants
      const activeTenants = await this.licenseService.getActiveTenantsWithLicenses();
      
      for (const tenant of activeTenants) {
        // Aggregate usage data for the tenant
        const usageData = await this.usageService.aggregateUsageForDate(tenant.id, yesterday);
        
        // Store aggregated data
        await this.dbService.storeDailyUsageAggregation({
          tenantId: tenant.id,
          date: yesterday,
          usageData,
          createdAt: new Date()
        });
        
        // Check for usage limit warnings
        const usageWarnings = await this.usageService.checkUsageLimits(tenant.id, usageData);
        
        if (usageWarnings.length > 0) {
          await this.notificationService.sendUsageWarnings({
            tenantId: tenant.id,
            warnings: usageWarnings,
            date: yesterday
          });
        }
      }
      
      console.log('Usage data aggregation completed');
    } catch (error) {
      console.error('Error in usage data aggregation:', error);
      throw error;
    }
  }

  /**
   * Daily Renewal Reminders
   * Sends personalized renewal reminders based on renewal timeline
   */
  private async handleRenewalReminders(): Promise<void> {
    try {
      console.log('Starting renewal reminders...');
      
      // Get licenses that need renewal reminders
      const renewalCandidates = await this.licenseService.getRenewalReminderCandidates();
      
      for (const license of renewalCandidates) {
        // Calculate appropriate reminder type based on time until renewal
        const daysUntilRenewal = this.calculateDaysUntilRenewal(license.renewalDate);
        const reminderType = this.determineReminderType(daysUntilRenewal);
        
        if (reminderType) {
          // Get tenant context for personalization
          const tenantContext = await this.licenseService.getTenantContext(license.tenantId);
          const usageStats = await this.usageService.getUsageStats(license.tenantId, 30); // last 30 days
          
          await this.emailService.sendRenewalReminder({
            licenseId: license.id,
            tenantId: license.tenantId,
            reminderType,
            daysUntilRenewal,
            usageStats,
            tenantContext,
            personalizedContent: await this.generatePersonalizedRenewalContent(license, usageStats)
          });
          
          // Update reminder tracking
          await this.dbService.updateReminderStatus(license.id, reminderType, new Date());
        }
      }
      
      console.log('Renewal reminders completed');
    } catch (error) {
      console.error('Error in renewal reminders:', error);
      throw error;
    }
  }

  /**
   * Daily License Compliance Check
   * Monitors license compliance and usage violations
   */
  private async handleComplianceCheck(): Promise<void> {
    try {
      console.log('Starting license compliance check...');
      
      const activeLicenses = await this.licenseService.getActiveLicenses();
      
      for (const license of activeLicenses) {
        // Check various compliance criteria
        const complianceResults = await Promise.all([
          this.usageService.checkUserLimits(license.tenantId, license.userLimit),
          this.usageService.checkFeatureUsage(license.tenantId, license.enabledFeatures),
          this.usageService.checkApiLimits(license.tenantId, license.apiLimits),
          this.usageService.checkStorageLimits(license.tenantId, license.storageLimit)
        ]);
        
        const violations = complianceResults.filter(result => !result.compliant);
        
        if (violations.length > 0) {
          // Handle violations
          await this.handleComplianceViolations(license, violations);
        }
        
        // Log compliance check
        await this.dbService.logComplianceCheck({
          licenseId: license.id,
          tenantId: license.tenantId,
          checkDate: new Date(),
          compliant: violations.length === 0,
          violations: violations.map(v => v.violationType)
        });
      }
      
      console.log('License compliance check completed');
    } catch (error) {
      console.error('Error in license compliance check:', error);
      throw error;
    }
  }

  /**
   * Weekly Usage Report Generation
   * Creates comprehensive usage analytics for platform administrators
   */
  private async handleWeeklyUsageReport(): Promise<void> {
    try {
      console.log('Starting weekly usage report generation...');
      
      const reportDate = new Date();
      const weekStart = new Date(reportDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      // Generate comprehensive usage analytics
      const weeklyReport = await this.usageService.generateWeeklyReport(weekStart, reportDate);
      
      // Include license metrics
      const licenseMetrics = await this.licenseService.getWeeklyLicenseMetrics(weekStart, reportDate);
      
      // Combine data into comprehensive report
      const fullReport = {
        ...weeklyReport,
        licenseMetrics,
        reportPeriod: { start: weekStart, end: reportDate },
        generatedAt: new Date()
      };
      
      // Send report to platform administrators
      const platformAdmins = await this.licenseService.getPlatformAdministrators();
      
      for (const admin of platformAdmins) {
        await this.emailService.sendWeeklyUsageReport(admin.email, fullReport);
      }
      
      // Store report for historical reference
      await this.dbService.storeWeeklyReport(fullReport);
      
      console.log('Weekly usage report generation completed');
    } catch (error) {
      console.error('Error in weekly usage report generation:', error);
      throw error;
    }
  }

  /**
   * Monthly Billing Cycle Processing
   * Handles automated billing, invoice generation, and payment processing
   */
  private async handleMonthlyBilling(): Promise<void> {
    try {
      console.log('Starting monthly billing cycle...');
      
      const billingDate = new Date();
      const previousMonth = new Date(billingDate.getFullYear(), billingDate.getMonth() - 1, 1);
      
      // Get all tenants due for billing
      const tenantsForBilling = await this.licenseService.getTenantsForMonthlyBilling();
      
      for (const tenant of tenantsForBilling) {
        // Calculate billing amount based on usage and license
        const billingCalculation = await this.billingService.calculateMonthlyBilling({
          tenantId: tenant.id,
          billingPeriod: { start: previousMonth, end: billingDate },
          includeUsageCharges: true
        });
        
        // Generate invoice
        const invoice = await this.billingService.generateInvoice({
          tenantId: tenant.id,
          billingCalculation,
          dueDate: new Date(billingDate.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
          invoiceDate: billingDate
        });
        
        // Process automatic payment if enabled
        if (tenant.autoPayEnabled) {
          await this.billingService.processAutomaticPayment(invoice.id);
        } else {
          // Send payment reminder
          await this.emailService.sendInvoiceNotification({
            tenantId: tenant.id,
            invoice,
            paymentDueDate: invoice.dueDate
          });
        }
        
        // Log billing event
        await this.dbService.logBillingEvent({
          tenantId: tenant.id,
          invoiceId: invoice.id,
          eventType: 'monthly_billing_processed',
          amount: billingCalculation.totalAmount,
          billingDate
        });
      }
      
      console.log('Monthly billing cycle completed');
    } catch (error) {
      console.error('Error in monthly billing cycle:', error);
      throw error;
    }
  }

  /**
   * Helper Methods
   */
  private calculateDaysUntilRenewal(renewalDate: Date): number {
    const today = new Date();
    const diffTime = renewalDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private determineReminderType(days: number): string | null {
    if (days <= 7) return 'urgent';
    if (days <= 30) return 'upcoming';
    if (days <= 60) return 'early';
    return null; // Too early for reminder
  }

  private async generatePersonalizedRenewalContent(license: any, usageStats: any): Promise<string> {
    // Generate AI-powered personalized renewal content based on usage patterns
    return `Based on your ${usageStats.avgDailyUsers} daily active users and ${usageStats.featureUsage.mostUsed} most-used features, we recommend considering our enhanced plan for better value.`;
  }

  private async handleComplianceViolations(license: any, violations: any[]): Promise<void> {
    // Handle different types of compliance violations
    for (const violation of violations) {
      switch (violation.violationType) {
        case 'user_limit_exceeded':
          await this.notificationService.sendUserLimitWarning(license.tenantId, violation.data);
          break;
        case 'feature_usage_exceeded':
          await this.notificationService.sendFeatureUsageWarning(license.tenantId, violation.data);
          break;
        case 'api_limit_exceeded':
          await this.notificationService.sendApiLimitWarning(license.tenantId, violation.data);
          break;
        case 'storage_limit_exceeded':
          await this.notificationService.sendStorageWarning(license.tenantId, violation.data);
          break;
      }
    }
  }
}

export default LicenseJobsConfig;