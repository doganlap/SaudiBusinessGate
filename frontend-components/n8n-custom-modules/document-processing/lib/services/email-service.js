/**
 * Email Service Integration
 * Handles Gmail, Outlook, and SMTP email operations
 */

const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const { Client } = require('@microsoft/microsoft-graph-client');
const { TokenCredentialAuthenticationProvider } = require('@microsoft/microsoft-graph-client/authProviders/tokenCredentialAuthenticationProvider');
const { ClientSecretCredential } = require('@azure/identity');
const logger = require('../logger');
const { EmailServiceError } = require('../error-handler');

class EmailService {
  constructor(config) {
    this.config = config;
    this.initializeProviders();
  }

  initializeProviders() {
    try {
      // Gmail OAuth2
      this.gmail = new google.auth.OAuth2(
        this.config.GMAIL_CLIENT_ID,
        this.config.GMAIL_CLIENT_SECRET,
        this.config.GMAIL_REDIRECT_URI
      );

      // Outlook/Microsoft Graph
      const credential = new ClientSecretCredential(
        this.config.MICROSOFT_TENANT_ID,
        this.config.MICROSOFT_CLIENT_ID,
        this.config.MICROSOFT_CLIENT_SECRET
      );

      this.outlookClient = Client.initWithMiddleware({
        authProvider: new TokenCredentialAuthenticationProvider({ credential, scopes: ['https://graph.microsoft.com/.default'] })
      });

      // SMTP (Gmail/Outlook as fallback)
      this.smtpTransporter = nodemailer.createTransport({
        host: this.config.SMTP_HOST,
        port: this.config.SMTP_PORT,
        secure: this.config.SMTP_SECURE === 'true',
        auth: {
          user: this.config.SMTP_USERNAME,
          pass: this.config.SMTP_PASSWORD
        }
      });

      logger.info('Email service providers initialized');
    } catch (error) {
      logger.error(`Failed to initialize email providers: ${error.message}`);
      throw new EmailServiceError(`Email service initialization failed: ${error.message}`);
    }
  }

  /**
   * Send email via SMTP
   */
  async sendEmailSMTP(to, subject, htmlContent, attachments = []) {
    try {
      const mailOptions = {
        from: this.config.SMTP_FROM,
        to,
        subject,
        html: htmlContent,
        attachments: attachments.map(att => ({
          filename: att.filename,
          content: att.content,
          contentType: att.contentType
        }))
      };

      const info = await this.smtpTransporter.sendMail(mailOptions);

      logger.info(`Email sent via SMTP: ${subject}`, {
        to,
        messageId: info.messageId
      });

      return {
        success: true,
        provider: 'SMTP',
        messageId: info.messageId,
        response: info.response
      };
    } catch (error) {
      logger.error(`Failed to send SMTP email: ${error.message}`);
      throw new EmailServiceError(`SMTP send failed: ${error.message}`);
    }
  }

  /**
   * Send email via Gmail
   */
  async sendEmailGmail(to, subject, htmlContent, attachments = []) {
    try {
      const gmail = google.gmail({ version: 'v1', auth: this.gmail });
      
      let message = `To: ${to}\r\nSubject: ${subject}\r\nContent-Type: text/html; charset="UTF-8"\r\n\r\n${htmlContent}`;

      if (attachments.length > 0) {
        const boundary = '==boundary==';
        message = `To: ${to}\r\nSubject: ${subject}\r\nMIME-Version: 1.0\r\nContent-Type: multipart/mixed; boundary="${boundary}"\r\n\r\n--${boundary}\r\nContent-Type: text/html; charset="UTF-8"\r\n\r\n${htmlContent}`;

        for (const attachment of attachments) {
          message += `\r\n--${boundary}\r\nContent-Type: ${attachment.contentType}\r\nContent-Disposition: attachment; filename="${attachment.filename}"\r\nContent-Transfer-Encoding: base64\r\n\r\n${attachment.content.toString('base64')}`;
        }
        message += `\r\n--${boundary}--`;
      }

      const encodedMessage = Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

      const res = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage
        }
      });

      logger.info(`Email sent via Gmail: ${subject}`, {
        to,
        messageId: res.data.id
      });

      return {
        success: true,
        provider: 'Gmail',
        messageId: res.data.id
      };
    } catch (error) {
      logger.error(`Failed to send Gmail email: ${error.message}`);
      throw new EmailServiceError(`Gmail send failed: ${error.message}`);
    }
  }

  /**
   * Send email via Outlook
   */
  async sendEmailOutlook(to, subject, htmlContent, attachments = []) {
    try {
      const message = {
        subject,
        body: {
          contentType: 'HTML',
          content: htmlContent
        },
        toRecipients: [{ emailAddress: { address: to } }],
        attachments: attachments.map(att => ({
          '@odata.type': '#microsoft.graph.fileAttachment',
          name: att.filename,
          contentBytes: att.content.toString('base64')
        }))
      };

      const res = await this.outlookClient
        .api('/me/sendMail')
        .post({ message });

      logger.info(`Email sent via Outlook: ${subject}`, {
        to
      });

      return {
        success: true,
        provider: 'Outlook',
        response: res
      };
    } catch (error) {
      logger.error(`Failed to send Outlook email: ${error.message}`);
      throw new EmailServiceError(`Outlook send failed: ${error.message}`);
    }
  }

  /**
   * Read emails from Gmail
   */
  async readEmailsGmail(maxResults = 10, query = '') {
    try {
      const gmail = google.gmail({ version: 'v1', auth: this.gmail });

      const res = await gmail.users.messages.list({
        userId: 'me',
        maxResults,
        q: query
      });

      const messages = [];
      for (const message of res.data.messages || []) {
        const msg = await gmail.users.messages.get({
          userId: 'me',
          id: message.id
        });

        messages.push({
          id: message.id,
          threadId: message.threadId,
          snippet: msg.data.snippet,
          headers: msg.data.payload?.headers || [],
          body: msg.data.payload?.body?.data
        });
      }

      logger.info(`Read ${messages.length} emails from Gmail`);

      return {
        success: true,
        provider: 'Gmail',
        messages,
        count: messages.length
      };
    } catch (error) {
      logger.error(`Failed to read Gmail emails: ${error.message}`);
      throw new EmailServiceError(`Gmail read failed: ${error.message}`);
    }
  }

  /**
   * Read emails from Outlook
   */
  async readEmailsOutlook(maxResults = 10, filter = '') {
    try {
      const query = `/me/mailFolders/inbox/messages?$top=${maxResults}`;
      const res = await this.outlookClient
        .api(query)
        .get();

      const messages = (res.value || []).map(msg => ({
        id: msg.id,
        subject: msg.subject,
        from: msg.from?.emailAddress?.address,
        receivedDateTime: msg.receivedDateTime,
        bodyPreview: msg.bodyPreview,
        hasAttachments: msg.hasAttachments
      }));

      logger.info(`Read ${messages.length} emails from Outlook`);

      return {
        success: true,
        provider: 'Outlook',
        messages,
        count: messages.length
      };
    } catch (error) {
      logger.error(`Failed to read Outlook emails: ${error.message}`);
      throw new EmailServiceError(`Outlook read failed: ${error.message}`);
    }
  }

  /**
   * Attach document to email
   */
  async attachDocumentToEmail(documentPath, emailTo, subject, body) {
    try {
      const fs = require('fs');
      const attachment = {
        filename: documentPath.split('/').pop(),
        content: fs.readFileSync(documentPath),
        contentType: this.getContentType(documentPath)
      };

      return await this.sendEmailSMTP(emailTo, subject, body, [attachment]);
    } catch (error) {
      logger.error(`Failed to attach document: ${error.message}`);
      throw new EmailServiceError(`Document attachment failed: ${error.message}`);
    }
  }

  /**
   * Get content type from file extension
   */
  getContentType(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const types = {
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      xls: 'application/vnd.ms-excel',
      csv: 'text/csv',
      txt: 'text/plain'
    };
    return types[ext] || 'application/octet-stream';
  }
}

module.exports = EmailService;