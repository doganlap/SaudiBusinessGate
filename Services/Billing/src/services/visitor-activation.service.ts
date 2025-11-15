import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { DatabaseService } from './database.service';
import { logger } from '../utils/logger';

export interface ActivationToken {
  tenantId: string;
  email: string;
  token: string;
  expiresAt: Date;
  used: boolean;
}

export interface VisitorActivationData {
  tenantId: string;
  email: string;
  name?: string;
  activatedAt: Date;
  source: string;
}

export class VisitorActivationService {
  private databaseService: DatabaseService;
  private emailTransporter: nodemailer.Transporter;

  constructor() {
    this.databaseService = new DatabaseService();
    this.setupEmailTransporter();
  }

  /**
   * Setup email transporter
   */
  private setupEmailTransporter(): void {
    // Configure based on your email provider
    // This example uses SMTP configuration
    this.emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  /**
   * Generate activation token
   */
  async generateActivationToken(tenantId: string, email: string): Promise<string> {
    try {
      const tokenData = {
        tenantId,
        email,
        timestamp: Date.now(),
        random: crypto.randomBytes(16).toString('hex')
      };

      const secret = process.env.JWT_SECRET || 'default-secret';
      const token = jwt.sign(tokenData, secret, { 
        expiresIn: '7d' // Token expires in 7 days
      });

      // Store token in database
      await this.storeActivationToken(tenantId, email, token);

      logger.info('Activation token generated', { tenantId, email });
      return token;
    } catch (error) {
      logger.error('Failed to generate activation token', { error, tenantId, email });
      throw error;
    }
  }

  /**
   * Verify activation token
   */
  async verifyActivationToken(tenantId: string, token: string): Promise<boolean> {
    try {
      const secret = process.env.JWT_SECRET || 'default-secret';
      
      // Verify JWT token
      const decoded = jwt.verify(token, secret) as any;
      
      if (decoded.tenantId !== tenantId) {
        logger.warn('Token tenant ID mismatch', { tenantId, tokenTenantId: decoded.tenantId });
        return false;
      }

      // Check if token exists and is not used
      const storedToken = await this.getActivationToken(tenantId, token);
      
      if (!storedToken || storedToken.used || storedToken.expiresAt < new Date()) {
        logger.warn('Token invalid, used, or expired', { tenantId, token: token.substring(0, 10) + '...' });
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Failed to verify activation token', { error, tenantId });
      return false;
    }
  }

  /**
   * Send activation email
   */
  async sendActivationEmail(email: string, tenantId: string, activationToken: string): Promise<void> {
    try {
      const activationUrl = `${process.env.FRONTEND_URL}/activate?token=${activationToken}&tenant=${tenantId}`;
      
      const mailOptions = {
        from: process.env.FROM_EMAIL || 'noreply@saudistore.com',
        to: email,
        subject: 'Activate Your Saudi Store Account',
        html: this.generateActivationEmailTemplate(activationUrl, tenantId),
        text: `
          Welcome to Saudi Store!
          
          Please activate your account by clicking the following link:
          ${activationUrl}
          
          This link will expire in 7 days.
          
          If you didn't request this activation, please ignore this email.
          
          Best regards,
          The Saudi Store Team
        `
      };

      await this.emailTransporter.sendMail(mailOptions);
      
      logger.info('Activation email sent', { email, tenantId });
    } catch (error) {
      logger.error('Failed to send activation email', { error, email, tenantId });
      throw error;
    }
  }

  /**
   * Mark visitor as activated
   */
  async markVisitorActivated(tenantId: string, email: string): Promise<void> {
    try {
      // Mark all tokens for this tenant/email as used
      await this.markTokensAsUsed(tenantId, email);
      
      // Store visitor activation data
      await this.storeVisitorActivation({
        tenantId,
        email,
        activatedAt: new Date(),
        source: 'email_activation'
      });

      logger.info('Visitor marked as activated', { tenantId, email });
    } catch (error) {
      logger.error('Failed to mark visitor as activated', { error, tenantId, email });
      throw error;
    }
  }

  /**
   * Check if visitor is activated
   */
  async isVisitorActivated(tenantId: string, email: string): Promise<boolean> {
    try {
      const activation = await this.getVisitorActivation(tenantId, email);
      return activation !== null;
    } catch (error) {
      logger.error('Failed to check visitor activation status', { error, tenantId, email });
      return false;
    }
  }

  /**
   * Get visitor activation data
   */
  async getVisitorActivation(tenantId: string, email: string): Promise<VisitorActivationData | null> {
    try {
      const client = await this.databaseService['pool'].connect();
      
      try {
        const query = 'SELECT * FROM visitor_activations WHERE tenant_id = $1 AND email = $2';
        const result = await client.query(query, [tenantId, email]);

        if (result.rows.length === 0) {
          return null;
        }

        const row = result.rows[0];
        return {
          tenantId: row.tenant_id,
          email: row.email,
          name: row.name,
          activatedAt: row.activated_at,
          source: row.source
        };
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error('Failed to get visitor activation', { error, tenantId, email });
      throw error;
    }
  }

  /**
   * Store activation token in database
   */
  private async storeActivationToken(tenantId: string, email: string, token: string): Promise<void> {
    const client = await this.databaseService['pool'].connect();
    
    try {
      await client.query('BEGIN');

      // Create activation_tokens table if not exists
      await client.query(`
        CREATE TABLE IF NOT EXISTS activation_tokens (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          tenant_id VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          token TEXT NOT NULL,
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          used BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);

      // Create index
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_activation_tokens_tenant_email ON activation_tokens(tenant_id, email);
      `);

      // Insert token
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      await client.query(
        'INSERT INTO activation_tokens (tenant_id, email, token, expires_at) VALUES ($1, $2, $3, $4)',
        [tenantId, email, token, expiresAt]
      );

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get activation token from database
   */
  private async getActivationToken(tenantId: string, token: string): Promise<ActivationToken | null> {
    const client = await this.databaseService['pool'].connect();
    
    try {
      const query = 'SELECT * FROM activation_tokens WHERE tenant_id = $1 AND token = $2';
      const result = await client.query(query, [tenantId, token]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        tenantId: row.tenant_id,
        email: row.email,
        token: row.token,
        expiresAt: row.expires_at,
        used: row.used
      };
    } finally {
      client.release();
    }
  }

  /**
   * Mark tokens as used
   */
  private async markTokensAsUsed(tenantId: string, email: string): Promise<void> {
    const client = await this.databaseService['pool'].connect();
    
    try {
      await client.query(
        'UPDATE activation_tokens SET used = TRUE WHERE tenant_id = $1 AND email = $2',
        [tenantId, email]
      );
    } finally {
      client.release();
    }
  }

  /**
   * Store visitor activation data
   */
  private async storeVisitorActivation(data: VisitorActivationData): Promise<void> {
    const client = await this.databaseService['pool'].connect();
    
    try {
      await client.query('BEGIN');

      // Create visitor_activations table if not exists
      await client.query(`
        CREATE TABLE IF NOT EXISTS visitor_activations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          tenant_id VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          name VARCHAR(255),
          activated_at TIMESTAMP WITH TIME ZONE NOT NULL,
          source VARCHAR(100) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(tenant_id, email)
        )
      `);

      // Create index
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_visitor_activations_tenant_id ON visitor_activations(tenant_id);
      `);

      // Insert activation data
      await client.query(
        `INSERT INTO visitor_activations (tenant_id, email, name, activated_at, source) 
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (tenant_id, email) DO UPDATE SET
         activated_at = EXCLUDED.activated_at,
         source = EXCLUDED.source`,
        [data.tenantId, data.email, data.name, data.activatedAt, data.source]
      );

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Generate activation email template
   */
  private generateActivationEmailTemplate(activationUrl: string, tenantId: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Activate Your DoganHub Account</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; }
          .button { 
            display: inline-block; 
            background: #2563eb; 
            color: white; 
            padding: 12px 30px; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0; 
          }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Saudi Store!</h1>
          </div>
          
          <div class="content">
            <h2>Activate Your Account</h2>
            <p>Thank you for signing up for Saudi Store. To get started, please activate your account by clicking the button below:</p>
            
            <div style="text-align: center;">
              <a href="${activationUrl}" class="button">Activate Account</a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #2563eb;">${activationUrl}</p>
            
            <p><strong>This activation link will expire in 7 days.</strong></p>
            
            <h3>What's Next?</h3>
            <ul>
              <li>Complete your profile setup</li>
              <li>Explore our features with a free trial</li>
              <li>Choose a subscription plan that fits your needs</li>
            </ul>
            
            <p>If you didn't request this activation, please ignore this email.</p>
            
            <p>Best regards,<br>The Saudi Store Team</p>
          </div>
          
          <div class="footer">
            <p>Saudi Store - Your Business Management Platform</p>
            <p>Tenant ID: ${tenantId}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Clean up expired tokens
   */
  async cleanupExpiredTokens(): Promise<void> {
    try {
      const client = await this.databaseService['pool'].connect();
      
      try {
        await client.query('DELETE FROM activation_tokens WHERE expires_at < NOW()');
        logger.info('Expired activation tokens cleaned up');
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error('Failed to cleanup expired tokens', { error });
    }
  }
}
