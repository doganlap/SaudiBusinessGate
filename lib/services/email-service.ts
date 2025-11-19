/**
 * Email Service - Production-Ready Implementation
 * Supports both SMTP and SendGrid
 * 
 * Usage:
 * import { emailService } from '@/lib/services/email-service';
 * await emailService.sendEmail({ to, subject, html });
 */

import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content?: Buffer | string;
    path?: string;
  }>;
}

interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: any = null;
  private useSendGrid: boolean = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    // Check if SendGrid is configured
    if (process.env.SENDGRID_API_KEY) {
      this.useSendGrid = true;
      console.log('✅ Email Service: Using SendGrid');
      return;
    }

    // Fall back to SMTP if configured
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });
      console.log('✅ Email Service: Using SMTP');
      return;
    }

    console.warn('⚠️ Email Service: No email provider configured. Emails will be logged only.');
  }

  /**
   * Send email using configured provider
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      // If SendGrid is configured
      if (this.useSendGrid) {
        return await this.sendWithSendGrid(options);
      }

      // If SMTP is configured
      if (this.transporter) {
        return await this.sendWithSMTP(options);
      }

      // No email provider configured - log instead
      console.warn('⚠️ Email not sent (no provider configured):');
      console.warn('To:', options.to);
      console.warn('Subject:', options.subject);
      console.warn('HTML:', options.html.substring(0, 100) + '...');
      return false;
    } catch (error) {
      console.error('❌ Email send error:', error);
      return false;
    }
  }

  /**
   * Send email using SendGrid
   */
  private async sendWithSendGrid(options: EmailOptions): Promise<boolean> {
    try {
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);

      const msg = {
        to: options.to,
        from: options.from || process.env.SMTP_FROM_EMAIL || 'noreply@doganhub.com',
        subject: options.subject,
        text: options.text,
        html: options.html,
        cc: options.cc,
        bcc: options.bcc,
        replyTo: options.replyTo,
        attachments: options.attachments,
      };

      await sgMail.send(msg);
      console.log('✅ Email sent via SendGrid to:', options.to);
      return true;
    } catch (error) {
      console.error('❌ SendGrid error:', error);
      return false;
    }
  }

  /**
   * Send email using SMTP
   */
  private async sendWithSMTP(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      throw new Error('SMTP transporter not initialized');
    }

    try {
      const info = await this.transporter.sendMail({
        from: options.from || `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        cc: options.cc,
        bcc: options.bcc,
        replyTo: options.replyTo,
        attachments: options.attachments,
      });

      console.log('✅ Email sent via SMTP:', info.messageId);
      return true;
    } catch (error) {
      console.error('❌ SMTP error:', error);
      return false;
    }
  }

  /**
   * Verify email configuration
   */
  async verifyConnection(): Promise<boolean> {
    if (this.useSendGrid) {
      // SendGrid doesn't need verification
      return true;
    }

    if (this.transporter) {
      try {
        await this.transporter.verify();
        console.log('✅ SMTP connection verified');
        return true;
      } catch (error) {
        console.error('❌ SMTP verification failed:', error);
        return false;
      }
    }

    return false;
  }

  /**
   * Email Templates
   */

  /**
   * Welcome email template
   */
  getWelcomeEmail(name: string, lng: string = 'en'): EmailTemplate {
    const isArabic = lng === 'ar';
    
    return {
      subject: isArabic ? 'مرحباً بك في بوابة الأعمال السعودية' : 'Welcome to Saudi Business Gate',
      html: `
        <!DOCTYPE html>
        <html dir="${isArabic ? 'rtl' : 'ltr'}" lang="${lng}">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">${isArabic ? 'مرحباً بك!' : 'Welcome!'}</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #667eea;">${isArabic ? `مرحباً ${name}` : `Hello ${name}`}</h2>
            <p>${isArabic 
              ? 'شكراً لانضمامك إلى بوابة الأعمال السعودية - أول بوابة أعمال ذاتية التشغيل في المنطقة.' 
              : 'Thank you for joining Saudi Business Gate - The 1st Autonomous Business Gate in the Region.'
            }</p>
            <p>${isArabic 
              ? 'يمكنك الآن الوصول إلى جميع وحدات الأعمال المتقدمة لديك:' 
              : 'You now have access to all your advanced business modules:'
            }</p>
            <ul style="color: #666;">
              <li>${isArabic ? '📊 لوحة التحكم والتحليلات' : '📊 Dashboard & Analytics'}</li>
              <li>${isArabic ? '💰 الإدارة المالية' : '💰 Finance Management'}</li>
              <li>${isArabic ? '📈 إدارة المبيعات' : '📈 Sales Management'}</li>
              <li>${isArabic ? '👥 إدارة العملاء (CRM)' : '👥 CRM'}</li>
              <li>${isArabic ? '🤖 وكلاء الذكاء الاصطناعي' : '🤖 AI Agents'}</li>
            </ul>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/ar/dashboard" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                ${isArabic ? 'ابدأ الآن' : 'Get Started'}
              </a>
            </div>
            <p style="color: #999; font-size: 12px; text-align: center;">
              ${isArabic ? 'من السعودية إلى العالم 🇸🇦' : 'From Saudi Arabia to the World 🇸🇦'}
            </p>
          </div>
        </body>
        </html>
      `,
      text: isArabic 
        ? `مرحباً ${name},\n\nشكراً لانضمامك إلى بوابة الأعمال السعودية!`
        : `Hello ${name},\n\nThank you for joining Saudi Business Gate!`,
    };
  }

  /**
   * Password reset email template
   */
  getPasswordResetEmail(name: string, resetLink: string, lng: string = 'en'): EmailTemplate {
    const isArabic = lng === 'ar';
    
    return {
      subject: isArabic ? 'إعادة تعيين كلمة المرور' : 'Password Reset Request',
      html: `
        <!DOCTYPE html>
        <html dir="${isArabic ? 'rtl' : 'ltr'}" lang="${lng}">
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #f9f9f9; padding: 30px; border-radius: 10px;">
            <h2>${isArabic ? `مرحباً ${name}` : `Hello ${name}`}</h2>
            <p>${isArabic 
              ? 'لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بك.' 
              : 'We received a request to reset your password.'
            }</p>
            <p>${isArabic 
              ? 'انقر على الزر أدناه لإعادة تعيين كلمة المرور:' 
              : 'Click the button below to reset your password:'
            }</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                ${isArabic ? 'إعادة تعيين كلمة المرور' : 'Reset Password'}
              </a>
            </div>
            <p style="color: #999; font-size: 12px;">
              ${isArabic 
                ? 'هذا الرابط صالح لمدة ساعة واحدة فقط. إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذه الرسالة.' 
                : 'This link expires in 1 hour. If you didn\'t request a password reset, you can ignore this email.'
              }
            </p>
          </div>
        </body>
        </html>
      `,
      text: isArabic 
        ? `مرحباً ${name},\n\nلإعادة تعيين كلمة المرور، قم بزيارة: ${resetLink}`
        : `Hello ${name},\n\nTo reset your password, visit: ${resetLink}`,
    };
  }

  /**
   * Invoice email template
   */
  getInvoiceEmail(name: string, invoiceNumber: string, amount: string, lng: string = 'en'): EmailTemplate {
    const isArabic = lng === 'ar';
    
    return {
      subject: isArabic ? `فاتورة جديدة #${invoiceNumber}` : `New Invoice #${invoiceNumber}`,
      html: `
        <!DOCTYPE html>
        <html dir="${isArabic ? 'rtl' : 'ltr'}" lang="${lng}">
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #f9f9f9; padding: 30px; border-radius: 10px;">
            <h2>${isArabic ? `مرحباً ${name}` : `Hello ${name}`}</h2>
            <p>${isArabic 
              ? 'تم إصدار فاتورة جديدة:' 
              : 'A new invoice has been issued:'
            }</p>
            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p><strong>${isArabic ? 'رقم الفاتورة:' : 'Invoice Number:'}</strong> ${invoiceNumber}</p>
              <p><strong>${isArabic ? 'المبلغ:' : 'Amount:'}</strong> ${amount}</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/ar/finance/invoices" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                ${isArabic ? 'عرض الفاتورة' : 'View Invoice'}
              </a>
            </div>
          </div>
        </body>
        </html>
      `,
      text: isArabic 
        ? `فاتورة جديدة #${invoiceNumber}\nالمبلغ: ${amount}`
        : `New Invoice #${invoiceNumber}\nAmount: ${amount}`,
    };
  }
}

// Export singleton instance
export const emailService = new EmailService();
