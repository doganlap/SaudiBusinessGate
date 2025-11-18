import { PoolClient } from 'pg';
import { BaseDatabaseService } from '../db/base-service';

interface License {
  id: string;
  licenseName: string;
  sku: string;
  description: string;
  price: number;
  tier: string;
  billingCycle: string;
  maxUsers?: number;
  maxStorageGb?: number;
  maxApiCalls?: number;
  featuresIncluded: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TenantLicense {
  id: string;
  tenantId: string;
  licenseId: string;
  contractId?: string;
  invoiceId?: string;
  licenseKey: string;
  startDate: string;
  endDate: string;
  status: string;
  autoRenew: boolean;
  billingCycle: string;
  monthlyCost?: number;
  annualCost?: number;
  currentUsers: number;
  currentStorageGb: number;
  currentApiCalls: number;
  isTrial: boolean;
  trialDaysRemaining?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export class LicensingService extends BaseDatabaseService {
  constructor() {
    super('tenant_licenses');
  }

  // Get all tenant licenses with license details
  async getTenantLicenses(tenantId: string, client?: PoolClient): Promise<any[]> {
    try {
      const queryText = `
        SELECT
          tl.*,
          l.license_name,
          l.sku,
          l.tier,
          l.description,
          l.price,
          l.billing_cycle as license_billing_cycle,
          l.max_users,
          l.max_storage_gb,
          l.max_api_calls,
          l.features_included,
          l.is_active as license_is_active,
          ARRAY(
            SELECT lf.feature_name
            FROM license_features lf
            JOIN license_feature_map lfm ON lf.id = lfm.feature_id
            WHERE lfm.license_id = l.id AND lfm.is_enabled = true
          ) as available_features,
          CASE
            WHEN tl.end_date < NOW() THEN 'expired'
            WHEN tl.trial_days_remaining <= 0 AND tl.is_trial THEN 'trial_expired'
            ELSE tl.status
          END as computed_status
        FROM tenant_licenses tl
        JOIN licenses l ON tl.license_id = l.id
        WHERE tl.tenant_id = $1 AND tl.is_active = true
        ORDER BY tl.created_at DESC
      `;

      const result = client
        ? await client.query(queryText, [tenantId])
        : await this.query(queryText, [tenantId]);

      return result.rows.map((row: any) => ({
        ...row,
        features_included: row.featuresincluded || [],
        available_features: row.available_features || [],
        usage_stats: {
          transactions: 0, // Would be calculated from actual usage data
          api_calls: row.current_api_calls || 0,
          storage_used: row.current_storage_gb || 0
        }
      }));
    } catch (error) {
      console.error('Error getting tenant licenses:', error);
      return [];
    }
  }

  // Create tenant license
  async createTenantLicense(
    licenseData: Omit<TenantLicense, 'id' | 'createdAt' | 'updatedAt' | 'licenseKey'>,
    client?: PoolClient
  ): Promise<TenantLicense | null> {
    try {
      // Generate license key
      const licenseKey = await this.generateLicenseKey();

      const data = {
        ...licenseData,
        license_key: licenseKey,
        current_users: licenseData.currentUsers || 0,
        current_storage_gb: licenseData.currentStorageGb || 0,
        current_api_calls: licenseData.currentApiCalls || 0,
        is_trial: licenseData.isTrial || false,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return await this.create(data, licenseData.tenantId, client);
    } catch (error) {
      console.error('Error creating tenant license:', error);
      return null;
    }
  }

  // Update tenant license
  async updateTenantLicense(
    id: string,
    updates: Partial<TenantLicense>,
    tenantId: string,
    client?: PoolClient
  ): Promise<TenantLicense | null> {
    try {
      const data = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      return await this.update(id, data, tenantId, client);
    } catch (error) {
      console.error('Error updating tenant license:', error);
      return null;
    }
  }

  // Suspend tenant license
  async suspendLicense(id: string, tenantId: string, client?: PoolClient): Promise<boolean> {
    try {
      const data = {
        status: 'suspended',
        updated_at: new Date().toISOString()
      };

      const result = await this.update(id, data, tenantId, client);
      return result !== null;
    } catch (error) {
      console.error('Error suspending license:', error);
      return false;
    }
  }

  // Renew tenant license
  async renewLicense(
    id: string,
    newEndDate: string,
    tenantId: string,
    client?: PoolClient
  ): Promise<TenantLicense | null> {
    try {
      // Get current license
      const currentLicense = await this.findById(id, tenantId, client);
      if (!currentLicense) return null;

      // Calculate new dates
      const startDate = new Date(currentLicense.end_date);
      const endDate = new Date(newEndDate);

      const data = {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        status: 'active',
        updated_at: new Date().toISOString()
      };

      return await this.update(id, data, tenantId, client);
    } catch (error) {
      console.error('Error renewing license:', error);
      return null;
    }
  }

  // Delete tenant license
  async deleteTenantLicense(id: string, tenantId: string, client?: PoolClient): Promise<boolean> {
    try {
      const data = {
        is_active: false,
        status: 'cancelled',
        updated_at: new Date().toISOString()
      };

      // Soft delete by marking as inactive
      const result = await this.update(id, data, tenantId, client);
      return result !== null;
    } catch (error) {
      console.error('Error deleting tenant license:', error);
      return false;
    }
  }

  // Get license statistics
  async getLicenseStats(tenantId?: string, client?: PoolClient): Promise<any> {
    try {
      let queryText = `
        SELECT
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
          COUNT(CASE WHEN status = 'trial' THEN 1 END) as trial,
          COUNT(CASE WHEN status = 'expired' OR (end_date < NOW()) THEN 1 END) as expired,
          COUNT(CASE WHEN status = 'suspended' THEN 1 END) as suspended,
          SUM(current_users) as total_users,
          SUM(COALESCE(monthly_cost, annual_cost / 12, 0)) as total_cost,
          SUM(current_storage_gb) as storage_used
        FROM tenant_licenses
        WHERE is_active = true
      `;

      let params: any[] = [];
      if (tenantId) {
        queryText += ' AND tenant_id = $1';
        params = [tenantId];
      }

      const result = client
        ? await client.query(queryText, params)
        : await this.query(queryText, params);

      return result.rows[0] || {
        total: 0,
        active: 0,
        trial: 0,
        expired: 0,
        suspended: 0,
        total_users: 0,
        total_cost: 0,
        storage_used: 0
      };
    } catch (error) {
      console.error('Error getting license stats:', error);
      return {
        total: 0,
        active: 0,
        trial: 0,
        expired: 0,
        suspended: 0,
        total_users: 0,
        total_cost: 0,
        storage_used: 0
      };
    }
  }

  // Check license limits
  async checkLicenseLimits(
    tenantId: string,
    feature: 'users' | 'storage' | 'api_calls',
    client?: PoolClient
  ): Promise<{ allowed: number; used: number; remaining: number }> {
    try {
      const licenses = await this.getTenantLicenses(tenantId, client);
      let allowed = 0;
      let used = 0;

      for (const license of licenses) {
        if (license.status !== 'active') continue;

        switch (feature) {
          case 'users':
            if (license.max_users) allowed += license.max_users;
            used += license.current_users;
            break;
          case 'storage':
            if (license.max_storage_gb) allowed += license.max_storage_gb;
            used += license.current_storage_gb;
            break;
          case 'api_calls':
            if (license.max_api_calls) allowed += license.max_api_calls;
            used += license.current_api_calls;
            break;
        }
      }

      return {
        allowed,
        used,
        remaining: Math.max(0, allowed - used)
      };
    } catch (error) {
      console.error('Error checking license limits:', error);
      return { allowed: 0, used: 0, remaining: 0 };
    }
  }

  // Validate license key
  async validateLicenseKey(licenseKey: string, tenantId?: string, client?: PoolClient): Promise<boolean> {
    try {
      let queryText = `
        SELECT COUNT(*) as count
        FROM tenant_licenses
        WHERE license_key = $1 AND is_active = true AND status = 'active'
      `;

      let params: any[] = [licenseKey];

      if (tenantId) {
        queryText += ' AND tenant_id = $2';
        params.push(tenantId);
      }

      const result = client
        ? await client.query(queryText, params)
        : await this.query(queryText, params);

      return parseInt(result.rows[0].count) > 0;
    } catch (error) {
      console.error('Error validating license key:', error);
      return false;
    }
  }

  // Generate unique license key
  private async generateLicenseKey(): Promise<string> {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let key = '';
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      key = 'LIC-';
      for (let i = 0; i < 16; i++) {
        if (i % 4 === 0 && i > 0) key += '-';
        key += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      isUnique = await this.validateLicenseKey(key);
      attempts++;
    }

    return key;
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.query('SELECT 1 FROM tenant_licenses LIMIT 1');
      return true;
    } catch (error) {
      console.error('Licensing service health check failed:', error);
      return false;
    }
  }

  private async query(text: string, params?: any[]): Promise<any> {
    const { query } = await import('../db/connection');
    return query(text, params);
  }
}
