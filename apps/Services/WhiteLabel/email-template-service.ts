/**
 * Email Template Service
 * Branded email templates with white-label support
 */

import { Pool } from 'pg';
import nodemailer from 'nodemailer';

// =====================================================
// INTERFACES
// =====================================================

export interface EmailTemplate {
  id?: number;
  templateName: string;
  templateCategory: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables: string[];
  organizationId?: number;
  isDefault: boolean;
  isActive: boolean;
}

export interface SendEmailParams {
  to: string | string[];
  templateName: string;
  variables: Record<string, any>;
  organizationId: number;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

// =====================================================
// EMAIL TEMPLATE SERVICE
// =====================================================

export class EmailTemplateService {
  private db: Pool;
  private transporter: nodemailer.Transporter;

  constructor(dbPool: Pool) {
    this.db = dbPool;
    this.initializeMailer();
  }

  private initializeMailer(): void {
    // Configure email transporter
    // For production, use Azure Communication Services or SendGrid
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.office365.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });
  }

  // =====================================================
  // TEMPLATE MANAGEMENT
  // =====================================================

  async getTemplate(
    templateName: string,
    organizationId?: number
  ): Promise<EmailTemplate | null> {
    let query = `
      SELECT * FROM email_templates
      WHERE template_name = $1
      AND is_active = true
    `;

    const values: any[] = [templateName];

    if (organizationId) {
      // Try organization-specific template first
      query += ' AND organization_id = $2 ORDER BY is_default DESC LIMIT 1';
      values.push(organizationId);
    } else {
      // Get default template
      query += ' AND organization_id IS NULL AND is_default = true LIMIT 1';
    }

    const result = await this.db.query(query, values);

    if (result.rows.length === 0) {
      // Fallback to default template if organization-specific not found
      if (organizationId) {
        return this.getTemplate(templateName);
      }
      return null;
    }

    return this.mapRowToTemplate(result.rows[0]);
  }

  async createTemplate(template: EmailTemplate): Promise<EmailTemplate> {
    const query = `
      INSERT INTO email_templates (
        template_name, template_category, subject, html_content, text_content,
        variables, organization_id, is_default, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      template.templateName,
      template.templateCategory,
      template.subject,
      template.htmlContent,
      template.textContent,
      JSON.stringify(template.variables),
      template.organizationId,
      template.isDefault || false,
      template.isActive !== false
    ];

    const result = await this.db.query(query, values);
    return this.mapRowToTemplate(result.rows[0]);
  }

  async updateTemplate(templateId: number, updates: Partial<EmailTemplate>): Promise<EmailTemplate> {
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.subject) {
      setClauses.push(`subject = $${paramCount++}`);
      values.push(updates.subject);
    }
    if (updates.htmlContent) {
      setClauses.push(`html_content = $${paramCount++}`);
      values.push(updates.htmlContent);
    }
    if (updates.textContent !== undefined) {
      setClauses.push(`text_content = $${paramCount++}`);
      values.push(updates.textContent);
    }
    if (updates.variables) {
      setClauses.push(`variables = $${paramCount++}`);
      values.push(JSON.stringify(updates.variables));
    }
    if (updates.isActive !== undefined) {
      setClauses.push(`is_active = $${paramCount++}`);
      values.push(updates.isActive);
    }

    setClauses.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(templateId);

    const query = `
      UPDATE email_templates
      SET ${setClauses.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await this.db.query(query, values);
    return this.mapRowToTemplate(result.rows[0]);
  }

  // =====================================================
  // EMAIL RENDERING
  // =====================================================

  private renderTemplate(template: string, variables: Record<string, any>): string {
    let rendered = template;

    // Replace {{variable}} with actual values
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      rendered = rendered.replace(regex, String(value));
    });

    return rendered;
  }

  private async applyWhiteLabelBranding(
    html: string,
    organizationId: number
  ): Promise<string> {
    // Get organization theme
    const themeQuery = `
      SELECT logo_primary, colors, company_name
      FROM white_label_themes
      WHERE organization_id = $1 AND is_active = true
      LIMIT 1
    `;

    const result = await this.db.query(themeQuery, [organizationId]);

    if (result.rows.length === 0) {
      return html; // No branding available
    }

    const theme = result.rows[0];

    // Replace branding placeholders
    html = html.replace(/{{companyLogo}}/g, theme.logo_primary || '');
    html = html.replace(/{{companyName}}/g, theme.company_name || '');
    
    // Apply brand colors
    if (theme.colors) {
      html = html.replace(/{{primaryColor}}/g, theme.colors.primary || '#6366f1');
      html = html.replace(/{{secondaryColor}}/g, theme.colors.secondary || '#8b5cf6');
    }

    return html;
  }

  // =====================================================
  // SENDING EMAILS
  // =====================================================

  async sendEmail(params: SendEmailParams): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    try {
      // Get template
      const template = await this.getTemplate(params.templateName, params.organizationId);
      
      if (!template) {
        throw new Error(`Template not found: ${params.templateName}`);
      }

      // Render template with variables
      let htmlContent = this.renderTemplate(template.htmlContent, params.variables);
      let textContent = template.textContent 
        ? this.renderTemplate(template.textContent, params.variables)
        : undefined;
      let subject = this.renderTemplate(template.subject, params.variables);

      // Apply white-label branding
      if (params.organizationId) {
        htmlContent = await this.applyWhiteLabelBranding(htmlContent, params.organizationId);
      }

      // Send email
      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@doganhub.com',
        to: Array.isArray(params.to) ? params.to.join(',') : params.to,
        subject,
        html: htmlContent,
        text: textContent,
        attachments: params.attachments
      });

      // Log email send
      await this.logEmailSend(
        params.organizationId,
        template.id!,
        Array.isArray(params.to) ? params.to[0] : params.to,
        subject,
        'sent'
      );

      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error) {
      // Log failure
      const template = await this.getTemplate(params.templateName, params.organizationId);
      if (template) {
        await this.logEmailSend(
          params.organizationId,
          template.id!,
          Array.isArray(params.to) ? params.to[0] : params.to,
          '',
          'failed',
          (error as Error).message
        );
      }

      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  async sendBulkEmail(
    recipients: string[],
    templateName: string,
    variables: Record<string, any>,
    organizationId: number
  ): Promise<{
    sent: number;
    failed: number;
    errors: string[];
  }> {
    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const recipient of recipients) {
      const result = await this.sendEmail({
        to: recipient,
        templateName,
        variables,
        organizationId
      });

      if (result.success) {
        sent++;
      } else {
        failed++;
        errors.push(`${recipient}: ${result.error}`);
      }

      // Rate limiting - wait 100ms between emails
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return { sent, failed, errors };
  }

  // =====================================================
  // EMAIL LOGGING
  // =====================================================

  private async logEmailSend(
    organizationId: number,
    templateId: number,
    recipientEmail: string,
    subject: string,
    status: string,
    errorMessage?: string
  ): Promise<void> {
    const query = `
      INSERT INTO email_send_log (
        organization_id, template_id, recipient_email, subject, status, error_message
      ) VALUES ($1, $2, $3, $4, $5, $6)
    `;

    await this.db.query(query, [
      organizationId,
      templateId,
      recipientEmail,
      subject,
      status,
      errorMessage
    ]);
  }

  async updateEmailStatus(
    logId: number,
    status: 'sent' | 'opened' | 'clicked' | 'failed'
  ): Promise<void> {
    let updateField = 'status';
    let updateValue: any = status;

    if (status === 'opened') {
      updateField = 'opened_at';
      updateValue = 'CURRENT_TIMESTAMP';
    } else if (status === 'clicked') {
      updateField = 'clicked_at';
      updateValue = 'CURRENT_TIMESTAMP';
    }

    const query = `UPDATE email_send_log SET ${updateField} = $1 WHERE id = $2`;
    await this.db.query(query, [updateValue, logId]);
  }

  // =====================================================
  // ANALYTICS
  // =====================================================

  async getEmailStats(organizationId: number, days: number = 30): Promise<{
    totalSent: number;
    totalOpened: number;
    totalClicked: number;
    totalFailed: number;
    openRate: number;
    clickRate: number;
  }> {
    const query = `
      SELECT 
        COUNT(*) as total_sent,
        COUNT(*) FILTER (WHERE opened_at IS NOT NULL) as total_opened,
        COUNT(*) FILTER (WHERE clicked_at IS NOT NULL) as total_clicked,
        COUNT(*) FILTER (WHERE status = 'failed') as total_failed
      FROM email_send_log
      WHERE organization_id = $1
      AND created_at >= CURRENT_TIMESTAMP - INTERVAL '${days} days'
    `;

    const result = await this.db.query(query, [organizationId]);
    const stats = result.rows[0];

    return {
      totalSent: parseInt(stats.total_sent) || 0,
      totalOpened: parseInt(stats.total_opened) || 0,
      totalClicked: parseInt(stats.total_clicked) || 0,
      totalFailed: parseInt(stats.total_failed) || 0,
      openRate: stats.total_sent > 0 ? (stats.total_opened / stats.total_sent) * 100 : 0,
      clickRate: stats.total_sent > 0 ? (stats.total_clicked / stats.total_sent) * 100 : 0
    };
  }

  // =====================================================
  // HELPER METHODS
  // =====================================================

  private mapRowToTemplate(row: any): EmailTemplate {
    return {
      id: row.id,
      templateName: row.template_name,
      templateCategory: row.template_category,
      subject: row.subject,
      htmlContent: row.html_content,
      textContent: row.text_content,
      variables: row.variables,
      organizationId: row.organization_id,
      isDefault: row.is_default,
      isActive: row.is_active
    };
  }
}

export default EmailTemplateService;

