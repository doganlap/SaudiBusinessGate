/**
 * Email Service for License Management
 * Handles all email notifications for licenses, renewals, and billing
 */

export interface RenewalReminderData {
  licenseId: string;
  tenantId: string;
  reminderType: 'early' | 'upcoming' | 'urgent';
  daysUntilRenewal: number;
  usageStats: any;
  tenantContext: any;
  personalizedContent: string;
}

export interface LicenseExpiryAlert {
  licenseId: string;
  tenantId: string;
  daysUntilExpiry: number;
  urgency: 'low' | 'medium' | 'high';
  licenseType: string;
  expiryDate: Date;
}

export interface UsageWarningData {
  tenantId: string;
  warnings: any[];
  date: Date;
}

export interface InvoiceNotification {
  tenantId: string;
  invoice: any;
  paymentDueDate: Date;
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

export class EmailService {
  private emailProvider: any;
  private templates: Map<string, any>;

  constructor() {
    this.emailProvider = this.initializeEmailProvider();
    this.templates = this.loadEmailTemplates();
  }

  /**
   * Send renewal reminder emails
   */
  public async sendRenewalReminder(data: RenewalReminderData): Promise<void> {
    try {
      const template = this.templates.get(`renewal_reminder_${data.reminderType}`);
      const emailContent = await this.renderTemplate(template, data);

      await this.sendEmail({
        to: await this.getTenantContactEmails(data.tenantId),
        subject: this.getRenewalReminderSubject(data),
        html: emailContent.html,
        text: emailContent.text,
        templateName: `renewal_reminder_${data.reminderType}`,
        metadata: {
          licenseId: data.licenseId,
          tenantId: data.tenantId,
          reminderType: data.reminderType
        }
      });

    } catch (error) {
      console.error('Failed to send renewal reminder:', error);
      throw error;
    }
  }

  /**
   * Send license expiry alerts
   */
  public async sendLicenseExpiryAlert(data: LicenseExpiryAlert): Promise<void> {
    try {
      const template = this.templates.get(`expiry_alert_${data.urgency}`);
      const emailContent = await this.renderTemplate(template, data);

      await this.sendEmail({
        to: await this.getTenantAdminEmails(data.tenantId),
        subject: this.getExpiryAlertSubject(data),
        html: emailContent.html,
        text: emailContent.text,
        templateName: `expiry_alert_${data.urgency}`,
        metadata: {
          licenseId: data.licenseId,
          tenantId: data.tenantId,
          daysUntilExpiry: data.daysUntilExpiry
        }
      });

    } catch (error) {
      console.error('Failed to send license expiry alert:', error);
      throw error;
    }
  }

  /**
   * Send usage warnings
   */
  public async sendUsageWarnings(data: UsageWarningData): Promise<void> {
    try {
      const template = this.templates.get('usage_warnings');
      const emailContent = await this.renderTemplate(template, data);

      await this.sendEmail({
        to: await this.getTenantAdminEmails(data.tenantId),
        subject: 'Usage Limit Warning - Action Required',
        html: emailContent.html,
        text: emailContent.text,
        templateName: 'usage_warnings',
        metadata: {
          tenantId: data.tenantId,
          warningCount: data.warnings.length
        }
      });

    } catch (error) {
      console.error('Failed to send usage warnings:', error);
      throw error;
    }
  }

  /**
   * Send weekly usage report to platform admins
   */
  public async sendWeeklyUsageReport(adminEmail: string, report: any): Promise<void> {
    try {
      const template = this.templates.get('weekly_usage_report');
      const emailContent = await this.renderTemplate(template, report);

      await this.sendEmail({
        to: [adminEmail],
        subject: `Weekly Usage Report - ${report.reportPeriod.start.toDateString()}`,
        html: emailContent.html,
        text: emailContent.text,
        templateName: 'weekly_usage_report',
        metadata: {
          reportPeriod: report.reportPeriod,
          totalTenants: report.totalTenants
        }
      });

    } catch (error) {
      console.error('Failed to send weekly usage report:', error);
      throw error;
    }
  }

  /**
   * Send invoice notifications
   */
  public async sendInvoiceNotification(data: InvoiceNotification): Promise<void> {
    try {
      const template = this.templates.get('invoice_notification');
      const emailContent = await this.renderTemplate(template, data);

      await this.sendEmail({
        to: await this.getTenantBillingEmails(data.tenantId),
        subject: `Invoice ${data.invoice.invoiceNumber} - Payment Due`,
        html: emailContent.html,
        text: emailContent.text,
        templateName: 'invoice_notification',
        metadata: {
          tenantId: data.tenantId,
          invoiceId: data.invoice.id,
          amount: data.invoice.totalAmount
        }
      });

    } catch (error) {
      console.error('Failed to send invoice notification:', error);
      throw error;
    }
  }

  /**
   * Send job failure alerts to platform administrators
   */
  public async sendJobFailureAlert(data: JobFailureAlert): Promise<void> {
    try {
      const template = this.templates.get('job_failure_alert');
      const emailContent = await this.renderTemplate(template, data);

      const platformAdmins = await this.getPlatformAdminEmails();

      await this.sendEmail({
        to: platformAdmins,
        subject: `ALERT: Cron Job Failed - ${data.jobName}`,
        html: emailContent.html,
        text: emailContent.text,
        templateName: 'job_failure_alert',
        priority: 'high',
        metadata: {
          jobName: data.jobName,
          errorMessage: data.error
        }
      });

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
      const template = this.templates.get('job_long_running_alert');
      const emailContent = await this.renderTemplate(template, data);

      const platformAdmins = await this.getPlatformAdminEmails();

      await this.sendEmail({
        to: platformAdmins,
        subject: `WARNING: Long Running Job - ${data.jobName}`,
        html: emailContent.html,
        text: emailContent.text,
        templateName: 'job_long_running_alert',
        metadata: {
          jobName: data.jobName,
          runningTimeHours: Math.round(data.runningTime / (1000 * 60 * 60))
        }
      });

    } catch (error) {
      console.error('Failed to send long-running job alert:', error);
      throw error;
    }
  }

  /**
   * Private helper methods
   */
  private initializeEmailProvider(): any {
    // Initialize email provider (SendGrid, AWS SES, etc.)
    const provider = process.env.EMAIL_PROVIDER || 'sendgrid';
    
    switch (provider) {
      case 'sendgrid':
        return this.initializeSendGrid();
      case 'ses':
        return this.initializeAWSSES();
      default:
        return this.initializeSMTP();
    }
  }

  private initializeSendGrid(): any {
    return {
      apiKey: process.env.SENDGRID_API_KEY,
      fromEmail: process.env.FROM_EMAIL || 'noreply@doganhubstore.com',
      fromName: process.env.FROM_NAME || 'DoganHubStore'
    };
  }

  private initializeAWSSES(): any {
    return {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
      fromEmail: process.env.FROM_EMAIL || 'noreply@doganhubstore.com'
    };
  }

  private initializeSMTP(): any {
    return {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      },
      fromEmail: process.env.FROM_EMAIL || 'noreply@doganhubstore.com'
    };
  }

  private loadEmailTemplates(): Map<string, any> {
    const templates = new Map();

    // Load all email templates
    templates.set('renewal_reminder_early', {
      subject: 'License Renewal Reminder - {{daysUntilRenewal}} days remaining',
      htmlTemplate: this.getRenewalReminderTemplate('early'),
      textTemplate: this.getRenewalReminderTextTemplate('early')
    });

    templates.set('renewal_reminder_upcoming', {
      subject: 'License Renewal Due Soon - {{daysUntilRenewal}} days remaining',
      htmlTemplate: this.getRenewalReminderTemplate('upcoming'),
      textTemplate: this.getRenewalReminderTextTemplate('upcoming')
    });

    templates.set('renewal_reminder_urgent', {
      subject: 'URGENT: License Expires in {{daysUntilRenewal}} days',
      htmlTemplate: this.getRenewalReminderTemplate('urgent'),
      textTemplate: this.getRenewalReminderTextTemplate('urgent')
    });

    // Add more templates...
    
    return templates;
  }

  private async renderTemplate(template: any, data: any): Promise<{ html: string; text: string }> {
    // Simple template rendering - in production use a proper template engine
    let html = template.htmlTemplate;
    let text = template.textTemplate;

    // Replace placeholders
    Object.keys(data).forEach(key => {
      const value = data[key];
      html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
      text = text.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });

    return { html, text };
  }

  private async sendEmail(emailData: any): Promise<void> {
    // Implementation would depend on the email provider
    console.log('Sending email:', {
      to: emailData.to,
      subject: emailData.subject,
      template: emailData.templateName
    });

    // Log email for tracking
    await this.logEmailSent(emailData);
  }

  private async logEmailSent(emailData: any): Promise<void> {
    // Log email sending for audit and tracking
    console.log('Email logged:', {
      recipients: emailData.to.length,
      template: emailData.templateName,
      timestamp: new Date()
    });
  }

  private async getTenantContactEmails(tenantId: string): Promise<string[]> {
    // Get contact emails for the tenant
    return [`contact@tenant-${tenantId}.com`]; // Mock implementation
  }

  private async getTenantAdminEmails(tenantId: string): Promise<string[]> {
    // Get admin emails for the tenant
    return [`admin@tenant-${tenantId}.com`]; // Mock implementation
  }

  private async getTenantBillingEmails(tenantId: string): Promise<string[]> {
    // Get billing emails for the tenant
    return [`billing@tenant-${tenantId}.com`]; // Mock implementation
  }

  private async getPlatformAdminEmails(): Promise<string[]> {
    // Get platform administrator emails
    return ['admin@doganhubstore.com', 'ops@doganhubstore.com']; // Mock implementation
  }

  private getRenewalReminderSubject(data: RenewalReminderData): string {
    switch (data.reminderType) {
      case 'early':
        return `License Renewal Reminder - ${data.daysUntilRenewal} days remaining`;
      case 'upcoming':
        return `License Renewal Due Soon - ${data.daysUntilRenewal} days remaining`;
      case 'urgent':
        return `URGENT: License Expires in ${data.daysUntilRenewal} days`;
      default:
        return 'License Renewal Reminder';
    }
  }

  private getExpiryAlertSubject(data: LicenseExpiryAlert): string {
    return `License Expiry Alert - ${data.daysUntilExpiry} days remaining (${data.urgency.toUpperCase()} priority)`;
  }

  private getRenewalReminderTemplate(type: string): string {
    // Return HTML template based on reminder type
    return `
    <html>
      <body>
        <h2>License Renewal Reminder</h2>
        <p>Your license renewal is ${type} with {{daysUntilRenewal}} days remaining.</p>
        <p>{{personalizedContent}}</p>
        <p>Please contact us to renew your license.</p>
      </body>
    </html>
    `;
  }

  private getRenewalReminderTextTemplate(type: string): string {
    // Return text template based on reminder type
    return `
    License Renewal Reminder
    
    Your license renewal is ${type} with {{daysUntilRenewal}} days remaining.
    {{personalizedContent}}
    
    Please contact us to renew your license.
    `;
  }

  // ===================== BILLING EMAIL TEMPLATES =====================

  async sendSubscriptionConfirmation(params: {
    tenantId: string;
    planName: string;
    amount: number;
    billingPeriod: 'monthly' | 'annual';
    subscriptionId: string;
  }): Promise<boolean> {
    try {
      const template = this.getBillingTemplate('subscription_confirmation');
      const subject = `Subscription Confirmed - ${params.planName}`;
      
      const content = template
        .replace('{{planName}}', params.planName)
        .replace('{{amount}}', `$${params.amount}`)
        .replace('{{billingPeriod}}', params.billingPeriod)
        .replace('{{subscriptionId}}', params.subscriptionId);

      await this.sendEmail({
        to: await this.getTenantAdminEmails(params.tenantId),
        subject,
        html: content,
        templateName: 'subscription_confirmation',
        metadata: {
          tenantId: params.tenantId,
          subscriptionId: params.subscriptionId
        }
      });
      return true;
    } catch (error) {
      console.error('Failed to send subscription confirmation:', error);
      return false;
    }
  }

  async sendSubscriptionUpdate(params: {
    tenantId: string;
    planName: string;
    amount: number;
    billingPeriod: 'monthly' | 'annual';
    subscriptionId: string;
  }): Promise<boolean> {
    try {
      const template = this.getBillingTemplate('subscription_update');
      const subject = `Subscription Updated - ${params.planName}`;
      
      const content = template
        .replace('{{planName}}', params.planName)
        .replace('{{amount}}', `$${params.amount}`)
        .replace('{{billingPeriod}}', params.billingPeriod)
        .replace('{{subscriptionId}}', params.subscriptionId);

      await this.sendEmail(params.tenantId, subject, content);
      return true;
    } catch (error) {
      console.error('Failed to send subscription update:', error);
      return false;
    }
  }

  async sendSubscriptionCancellation(params: {
    tenantId: string;
    subscriptionId: string;
    endDate: Date;
  }): Promise<boolean> {
    try {
      const template = this.getBillingTemplate('subscription_cancellation');
      const subject = 'Subscription Cancelled';
      
      const content = template
        .replace('{{subscriptionId}}', params.subscriptionId)
        .replace('{{endDate}}', params.endDate.toLocaleDateString());

      await this.sendEmail(params.tenantId, subject, content);
      return true;
    } catch (error) {
      console.error('Failed to send subscription cancellation:', error);
      return false;
    }
  }

  async sendInvoice(params: {
    tenantId: string;
    invoiceId: string;
    amount: number;
    dueDate: Date;
    invoiceUrl?: string;
  }): Promise<boolean> {
    try {
      const template = this.getBillingTemplate('invoice');
      const subject = `Invoice ${params.invoiceId} - Due ${params.dueDate.toLocaleDateString()}`;
      
      const content = template
        .replace('{{invoiceId}}', params.invoiceId)
        .replace('{{amount}}', `$${params.amount}`)
        .replace('{{dueDate}}', params.dueDate.toLocaleDateString())
        .replace('{{invoiceUrl}}', params.invoiceUrl || '');

      await this.sendEmail(params.tenantId, subject, content);
      return true;
    } catch (error) {
      console.error('Failed to send invoice:', error);
      return false;
    }
  }

  async sendPaymentConfirmation(params: {
    tenantId: string;
    amount: number;
    invoiceId: string;
  }): Promise<boolean> {
    try {
      const template = this.getBillingTemplate('payment_confirmation');
      const subject = `Payment Confirmation - $${params.amount}`;
      
      const content = template
        .replace('{{amount}}', `$${params.amount}`)
        .replace('{{invoiceId}}', params.invoiceId);

      await this.sendEmail(params.tenantId, subject, content);
      return true;
    } catch (error) {
      console.error('Failed to send payment confirmation:', error);
      return false;
    }
  }

  async sendPaymentFailed(params: {
    tenantId: string;
    amount: number;
    invoiceId: string;
    retryUrl?: string;
  }): Promise<boolean> {
    try {
      const template = this.getBillingTemplate('payment_failed');
      const subject = `Payment Failed - Action Required`;
      
      const content = template
        .replace('{{amount}}', `$${params.amount}`)
        .replace('{{invoiceId}}', params.invoiceId)
        .replace('{{retryUrl}}', params.retryUrl || '');

      await this.sendEmail(params.tenantId, subject, content);
      return true;
    } catch (error) {
      console.error('Failed to send payment failed notification:', error);
      return false;
    }
  }

  async sendUsageOverageAlert(params: {
    tenantId: string;
    charges: any;
    usageData: any;
  }): Promise<boolean> {
    try {
      const template = this.getBillingTemplate('usage_overage');
      const subject = `Usage Overage Alert - Additional Charges Apply`;
      
      const content = template
        .replace('{{totalCharges}}', `$${params.charges.total}`)
        .replace('{{chargeItems}}', params.charges.items.map((item: any) => `${item.description}: $${item.amount}`).join('\n'));

      await this.sendEmail(params.tenantId, subject, content);
      return true;
    } catch (error) {
      console.error('Failed to send usage overage alert:', error);
      return false;
    }
  }

  private getBillingTemplate(type: string): string {
    const templates = {
      subscription_confirmation: `
        <h2>Subscription Confirmed!</h2>
        <p>Your subscription to {{planName}} has been confirmed.</p>
        <p><strong>Amount:</strong> {{amount}}</p>
        <p><strong>Billing Period:</strong> {{billingPeriod}}</p>
        <p><strong>Subscription ID:</strong> {{subscriptionId}}</p>
        <p>Thank you for your business!</p>
      `,
      subscription_update: `
        <h2>Subscription Updated</h2>
        <p>Your subscription has been updated to {{planName}}.</p>
        <p><strong>New Amount:</strong> {{amount}}</p>
        <p><strong>Billing Period:</strong> {{billingPeriod}}</p>
        <p><strong>Subscription ID:</strong> {{subscriptionId}}</p>
      `,
      subscription_cancellation: `
        <h2>Subscription Cancelled</h2>
        <p>Your subscription ({{subscriptionId}}) has been cancelled.</p>
        <p>Service will continue until {{endDate}}.</p>
        <p>We're sorry to see you go!</p>
      `,
      invoice: `
        <h2>New Invoice</h2>
        <p><strong>Invoice ID:</strong> {{invoiceId}}</p>
        <p><strong>Amount Due:</strong> {{amount}}</p>
        <p><strong>Due Date:</strong> {{dueDate}}</p>
        <p><a href="{{invoiceUrl}}">View Invoice</a></p>
      `,
      payment_confirmation: `
        <h2>Payment Received</h2>
        <p>Thank you! We have received your payment.</p>
        <p><strong>Amount:</strong> {{amount}}</p>
        <p><strong>Invoice:</strong> {{invoiceId}}</p>
      `,
      payment_failed: `
        <h2>Payment Failed</h2>
        <p>Your payment of {{amount}} for invoice {{invoiceId}} has failed.</p>
        <p>Please update your payment method and try again.</p>
        <p><a href="{{retryUrl}}">Retry Payment</a></p>
      `,
      usage_overage: `
        <h2>Usage Overage Alert</h2>
        <p>Your usage has exceeded plan limits, resulting in additional charges:</p>
        <p>{{chargeItems}}</p>
        <p><strong>Total Additional Charges:</strong> {{totalCharges}}</p>
      `
    };

    return templates[type as keyof typeof templates] || '';
  }
}

export default EmailService;