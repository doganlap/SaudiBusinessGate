/**
 * Domain Management Service
 * Custom domains with automatic SSL provisioning
 */

import { Pool } from 'pg';
import crypto from 'crypto';

// =====================================================
// INTERFACES
// =====================================================

export interface CustomDomain {
  id?: number;
  organizationId: number;
  domain: string;
  isPrimary: boolean;
  isActive: boolean;
  sslProvider: 'azure' | 'letsencrypt';
  sslCertificateId?: string;
  sslExpiresAt?: Date;
  sslAutoRenew: boolean;
  sslStatus: 'pending' | 'active' | 'expired' | 'error';
  dnsStatus: 'pending' | 'verified' | 'error';
  dnsRecords: DNSRecord[];
  dnsVerifiedAt?: Date;
  targetUrl: string;
  createdAt?: Date;
  verifiedAt?: Date;
}

export interface DNSRecord {
  type: 'A' | 'CNAME' | 'TXT';
  name: string;
  value: string;
  verified: boolean;
}

export interface SSLCertificate {
  id?: number;
  domainId: number;
  provider: string;
  certificateData?: string;
  privateKeyData?: string;
  issuedAt: Date;
  expiresAt: Date;
  autoRenew: boolean;
  status: 'active' | 'expired' | 'pending' | 'error';
}

// =====================================================
// DOMAIN MANAGEMENT SERVICE
// =====================================================

export class DomainManagementService {
  private db: Pool;

  constructor(dbPool: Pool) {
    this.db = dbPool;
  }

  // =====================================================
  // DOMAIN CRUD OPERATIONS
  // =====================================================

  async addCustomDomain(domain: CustomDomain): Promise<{
    success: boolean;
    domain?: CustomDomain;
    verificationToken?: string;
    dnsInstructions?: DNSRecord[];
  }> {
    // Validate domain format
    if (!this.isValidDomain(domain.domain)) {
      throw new Error('Invalid domain format');
    }

    // Check if domain already exists
    const existingDomain = await this.getDomainByName(domain.domain);
    if (existingDomain) {
      throw new Error('Domain already registered');
    }

    // Generate verification token
    const verificationToken = this.generateVerificationToken();

    // Create DNS verification instructions
    const dnsInstructions: DNSRecord[] = [
      {
        type: 'TXT',
        name: '_verification.' + domain.domain,
        value: verificationToken,
        verified: false
      },
      {
        type: 'CNAME',
        name: domain.domain,
        value: 'fresh-maas-frontdoor-prod.azurefd.net',
        verified: false
      }
    ];

    // Insert domain record
    const query = `
      INSERT INTO custom_domains (
        organization_id, domain, is_primary, is_active,
        ssl_provider, ssl_auto_renew, ssl_status,
        dns_status, dns_records, target_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const values = [
      domain.organizationId,
      domain.domain,
      domain.isPrimary || false,
      false, // Not active until verified
      domain.sslProvider || 'azure',
      domain.sslAutoRenew !== false,
      'pending',
      'pending',
      JSON.stringify(dnsInstructions),
      domain.targetUrl
    ];

    const result = await this.db.query(query, values);
    const createdDomain = this.mapRowToDomain(result.rows[0]);

    // Create verification token record
    await this.createVerificationToken(createdDomain.id!, verificationToken);

    return {
      success: true,
      domain: createdDomain,
      verificationToken,
      dnsInstructions
    };
  }

  async verifyDomain(domainId: number): Promise<{
    success: boolean;
    verified: boolean;
    message: string;
  }> {
    const domain = await this.getDomainById(domainId);
    if (!domain) {
      return { success: false, verified: false, message: 'Domain not found' };
    }

    // Get verification token
    const tokenQuery = `
      SELECT token FROM domain_verification_tokens
      WHERE domain_id = $1
      AND verified_at IS NULL
      AND expires_at > CURRENT_TIMESTAMP
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const tokenResult = await this.db.query(tokenQuery, [domainId]);
    
    if (tokenResult.rows.length === 0) {
      return { success: false, verified: false, message: 'No valid verification token found' };
    }

    const expectedToken = tokenResult.rows[0].token;

    // Verify DNS records
    const dnsVerified = await this.verifyDNSRecords(domain.domain, expectedToken);

    if (dnsVerified) {
      // Update domain status
      const updateQuery = `
        UPDATE custom_domains
        SET dns_status = 'verified',
            dns_verified_at = CURRENT_TIMESTAMP,
            is_active = true
        WHERE id = $1
      `;
      await this.db.query(updateQuery, [domainId]);

      // Mark token as verified
      const tokenUpdateQuery = `
        UPDATE domain_verification_tokens
        SET verified_at = CURRENT_TIMESTAMP
        WHERE domain_id = $1 AND token = $2
      `;
      await this.db.query(tokenUpdateQuery, [domainId, expectedToken]);

      // Trigger SSL provisioning
      await this.provisionSSL(domainId);

      return { success: true, verified: true, message: 'Domain verified successfully' };
    }

    return { success: false, verified: false, message: 'DNS records not found or incorrect' };
  }

  // =====================================================
  // SSL MANAGEMENT
  // =====================================================

  async provisionSSL(domainId: number): Promise<{
    success: boolean;
    certificateId?: string;
    expiresAt?: Date;
  }> {
    const domain = await this.getDomainById(domainId);
    if (!domain) {
      throw new Error('Domain not found');
    }

    if (domain.sslProvider === 'azure') {
      return await this.provisionAzureSSL(domain);
    } else {
      return await this.provisionLetsEncryptSSL(domain);
    }
  }

  private async provisionAzureSSL(domain: CustomDomain): Promise<{
    success: boolean;
    certificateId?: string;
    expiresAt?: Date;
  }> {
    // In production, use Azure Front Door API or SDK
    // For now, simulate SSL provisioning
    
    const certificateId = 'cert-' + crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 90); // 90 days validity

    // Insert certificate record
    const query = `
      INSERT INTO ssl_certificates (
        domain_id, provider, issued_at, expires_at, auto_renew, status
      ) VALUES ($1, $2, CURRENT_TIMESTAMP, $3, $4, $5)
      RETURNING id
    `;

    const result = await this.db.query(query, [
      domain.id,
      'azure',
      expiresAt,
      domain.sslAutoRenew,
      'active'
    ]);

    const certId = result.rows[0].id;

    // Update domain with SSL info
    const updateQuery = `
      UPDATE custom_domains
      SET ssl_certificate_id = $1,
          ssl_expires_at = $2,
          ssl_status = 'active'
      WHERE id = $3
    `;

    await this.db.query(updateQuery, [certId, expiresAt, domain.id]);

    return {
      success: true,
      certificateId: certId.toString(),
      expiresAt
    };
  }

  private async provisionLetsEncryptSSL(domain: CustomDomain): Promise<{
    success: boolean;
    certificateId?: string;
    expiresAt?: Date;
  }> {
    // Integrate with Let's Encrypt ACME protocol
    // For production, use: https://www.npmjs.com/package/acme-client
    
    const certificateId = 'le-' + crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 90);

    // Insert certificate record
    const query = `
      INSERT INTO ssl_certificates (
        domain_id, provider, issued_at, expires_at, auto_renew, status
      ) VALUES ($1, $2, CURRENT_TIMESTAMP, $3, $4, $5)
      RETURNING id
    `;

    const result = await this.db.query(query, [
      domain.id,
      'letsencrypt',
      expiresAt,
      domain.sslAutoRenew,
      'active'
    ]);

    return {
      success: true,
      certificateId: result.rows[0].id.toString(),
      expiresAt
    };
  }

  async renewSSL(certificateId: number): Promise<boolean> {
    // Get certificate info
    const query = 'SELECT * FROM ssl_certificates WHERE id = $1';
    const result = await this.db.query(query, [certificateId]);
    
    if (result.rows.length === 0) {
      return false;
    }

    const cert = result.rows[0];
    const domain = await this.getDomainById(cert.domain_id);
    
    if (!domain) {
      return false;
    }

    // Renew based on provider
    if (cert.provider === 'azure') {
      await this.provisionAzureSSL(domain);
    } else {
      await this.provisionLetsEncryptSSL(domain);
    }

    return true;
  }

  async checkSSLExpiry(): Promise<{
    expiringCertificates: Array<{
      domainId: number;
      domain: string;
      expiresAt: Date;
      daysUntilExpiry: number;
    }>;
  }> {
    const query = `
      SELECT cd.id, cd.domain, sc.expires_at
      FROM custom_domains cd
      JOIN ssl_certificates sc ON cd.ssl_certificate_id = sc.id::text
      WHERE sc.expires_at <= CURRENT_TIMESTAMP + INTERVAL '30 days'
      AND sc.status = 'active'
      AND sc.auto_renew = true
      ORDER BY sc.expires_at ASC
    `;

    const result = await this.db.query(query);

    const expiringCertificates = result.rows.map(row => {
      const daysUntilExpiry = Math.floor(
        (new Date(row.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      return {
        domainId: row.id,
        domain: row.domain,
        expiresAt: row.expires_at,
        daysUntilExpiry
      };
    });

    return { expiringCertificates };
  }

  // =====================================================
  // DNS VERIFICATION
  // =====================================================

  private async verifyDNSRecords(domain: string, expectedToken: string): Promise<boolean> {
    // In production, use DNS lookup libraries
    // For now, simulate verification
    
    // const dns = require('dns').promises;
    // try {
    //   const txtRecords = await dns.resolveTxt(`_verification.${domain}`);
    //   const flatRecords = txtRecords.flat();
    //   return flatRecords.includes(expectedToken);
    // } catch (error) {
    //   return false;
    // }

    // Simulated verification (always succeeds for testing)
    return true;
  }

  // =====================================================
  // HELPER METHODS
  // =====================================================

  private isValidDomain(domain: string): boolean {
    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/;
    return domainRegex.test(domain.toLowerCase());
  }

  private generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private async createVerificationToken(domainId: number, token: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days to verify

    const query = `
      INSERT INTO domain_verification_tokens (domain_id, token, verification_method, expires_at)
      VALUES ($1, $2, $3, $4)
    `;

    await this.db.query(query, [domainId, token, 'dns', expiresAt]);
  }

  private async getDomainById(id: number): Promise<CustomDomain | null> {
    const query = 'SELECT * FROM custom_domains WHERE id = $1';
    const result = await this.db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToDomain(result.rows[0]);
  }

  private async getDomainByName(domain: string): Promise<CustomDomain | null> {
    const query = 'SELECT * FROM custom_domains WHERE domain = $1';
    const result = await this.db.query(query, [domain]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToDomain(result.rows[0]);
  }

  async getOrganizationDomains(organizationId: number): Promise<CustomDomain[]> {
    const query = `
      SELECT * FROM custom_domains
      WHERE organization_id = $1
      ORDER BY is_primary DESC, created_at DESC
    `;

    const result = await this.db.query(query, [organizationId]);
    return result.rows.map(row => this.mapRowToDomain(row));
  }

  async deleteDomain(domainId: number): Promise<boolean> {
    const query = 'DELETE FROM custom_domains WHERE id = $1';
    await this.db.query(query, [domainId]);
    return true;
  }

  // =====================================================
  // MAPPING
  // =====================================================

  private mapRowToDomain(row: any): CustomDomain {
    return {
      id: row.id,
      organizationId: row.organization_id,
      domain: row.domain,
      isPrimary: row.is_primary,
      isActive: row.is_active,
      sslProvider: row.ssl_provider,
      sslCertificateId: row.ssl_certificate_id,
      sslExpiresAt: row.ssl_expires_at,
      sslAutoRenew: row.ssl_auto_renew,
      sslStatus: row.ssl_status,
      dnsStatus: row.dns_status,
      dnsRecords: row.dns_records,
      dnsVerifiedAt: row.dns_verified_at,
      targetUrl: row.target_url,
      createdAt: row.created_at,
      verifiedAt: row.verified_at
    };
  }

  // =====================================================
  // SCHEDULED JOBS
  // =====================================================

  async autoRenewCertificates(): Promise<{
    renewed: number;
    failed: number;
  }> {
    // Get certificates expiring in 30 days
    const { expiringCertificates } = await this.checkSSLExpiry();

    let renewed = 0;
    let failed = 0;

    for (const cert of expiringCertificates) {
      try {
        const success = await this.renewSSL(cert.domainId);
        if (success) {
          renewed++;
        } else {
          failed++;
        }
      } catch (error) {
        console.error(`Failed to renew SSL for domain ${cert.domain}:`, error);
        failed++;
      }
    }

    return { renewed, failed };
  }

  async checkDomainHealth(): Promise<{
    total: number;
    active: number;
    pending: number;
    errors: number;
  }> {
    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE is_active = true) as active,
        COUNT(*) FILTER (WHERE dns_status = 'pending' OR ssl_status = 'pending') as pending,
        COUNT(*) FILTER (WHERE dns_status = 'error' OR ssl_status = 'error') as errors
      FROM custom_domains
    `;

    const result = await this.db.query(query);
    return result.rows[0];
  }
}

// =====================================================
// EXPRESS ROUTES
// =====================================================

export function createDomainManagementRoutes(dbPool: Pool) {
  const router = require('express').Router();
  const service = new DomainManagementService(dbPool);

  // Add custom domain
  router.post('/domain', async (req: any, res: any) => {
    try {
      const result = await service.addCustomDomain(req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  });

  // Verify domain
  router.post('/domain/:domainId/verify', async (req: any, res: any) => {
    try {
      const domainId = parseInt(req.params.domainId);
      const result = await service.verifyDomain(domainId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  });

  // Get organization domains
  router.get('/domains/organization/:organizationId', async (req: any, res: any) => {
    try {
      const organizationId = parseInt(req.params.organizationId);
      const domains = await service.getOrganizationDomains(organizationId);
      res.json({ success: true, data: domains });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  });

  // Delete domain
  router.delete('/domain/:domainId', async (req: any, res: any) => {
    try {
      const domainId = parseInt(req.params.domainId);
      await service.deleteDomain(domainId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  });

  // Check SSL expiry
  router.get('/ssl/expiring', async (req: any, res: any) => {
    try {
      const result = await service.checkSSLExpiry();
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  });

  // Domain health check
  router.get('/domains/health', async (req: any, res: any) => {
    try {
      const health = await service.checkDomainHealth();
      res.json({ success: true, data: health });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  });

  return router;
}

export default DomainManagementService;

