/**
 * License Service for Saudi Store Platform
 * Handles license enforcement, feature access control, and usage tracking
 */

import { Pool } from 'pg';
import { RBACService } from '../auth/rbac-service';

// Database service interface for license operations
interface IDbService {
  query(sql: string, params?: any[]): Promise<{ rows: any[] }>;
}

class DatabaseService implements IDbService {
  constructor(private pool: Pool) {}

  async query(sql: string, params: any[] = []): Promise<{ rows: any[] }> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(sql, params);
      return { rows: result.rows };
    } finally {
      client.release();
    }
  }
}

export interface TenantLicense {
  tenantId: string;
  licenseCode: 'basic' | 'professional' | 'enterprise' | 'platform';
  features: string[];
  dashboards: string[];
  kpiLimit: number;
  maxUsers: number;
  maxStorageGB: number;
  maxApiCallsPerMonth: number;
  validUntil: Date;
  autoRenew: boolean;
  status: 'active' | 'expired' | 'suspended' | 'trial';
  gracePeriodDays: number;
}

export interface FeatureUsage {
  featureCode: string;
  currentUsage: number;
  limit: number;
  usagePercentage: number;
  isOverLimit: boolean;
}

export interface LicenseValidationResult {
  isValid: boolean;
  hasFeature: boolean;
  canUseFeature: boolean;
  reason?: string;
  upgradeRequired?: boolean;
  suggestedPlan?: string;
}

export class LicenseService {
  constructor(
    private dbService: IDbService,
    private rbacService: RBACService
  ) {}

  /**
   * Get tenant license information
   */
  async getTenantLicense(tenantId: string): Promise<TenantLicense | null> {
    try {
      const result = await this.dbService.query(
        `SELECT 
          tl.*,
          lp.features,
          lp.max_users,
          lp.max_storage_gb,
          lp.max_api_calls_per_month,
          lp.max_kpis
        FROM tenant_licenses tl
        JOIN license_plans lp ON tl.license_code = lp.code
        WHERE tl.tenant_id = $1 AND tl.is_active = true
        ORDER BY tl.created_at DESC
        LIMIT 1`,
        [tenantId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return this.mapToTenantLicense(result.rows[0]);
    } catch (error) {
      console.error('Error fetching tenant license:', error);
      throw new Error('Failed to fetch tenant license');
    }
  }

  /**
   * Check if tenant has access to a specific feature
   */
  async checkFeatureAccess(
    tenantId: string,
    featureCode: string,
    userId?: string
  ): Promise<LicenseValidationResult> {
    try {
      const license = await this.getTenantLicense(tenantId);
      
      if (!license) {
        return {
          isValid: false,
          hasFeature: false,
          canUseFeature: false,
          reason: 'No valid license found',
          upgradeRequired: true,
          suggestedPlan: 'basic'
        };
      }

      // Check license validity
      if (!this.isLicenseValid(license)) {
        return {
          isValid: false,
          hasFeature: false,
          canUseFeature: false,
          reason: 'License expired or suspended',
          upgradeRequired: true
        };
      }

      // Check if license includes feature
      const hasFeature = license.features.includes(featureCode);
      if (!hasFeature) {
        return {
          isValid: true,
          hasFeature: false,
          canUseFeature: false,
          reason: 'Feature not included in current plan',
          upgradeRequired: true,
          suggestedPlan: this.getSuggestedUpgrade(license.licenseCode, featureCode)
        };
      }

      // Check usage limits
      const usageCheck = await this.checkUsageLimit(tenantId, featureCode);
      if (usageCheck.isOverLimit) {
        return {
          isValid: true,
          hasFeature: true,
          canUseFeature: false,
          reason: 'Usage limit exceeded',
          upgradeRequired: true
        };
      }

      // If user-specific check required, validate RBAC
      if (userId) {
        const userRoles = await this.rbacService.getUserRoles(parseInt(userId), parseInt(tenantId));
        const userRole = userRoles[0]?.name || 'user'; // Get first role or default
        const hasPermission = await this.rbacService.checkPermission(
          parseInt(userId),
          featureCode,
          parseInt(tenantId)
        );
        
        if (!hasPermission) {
          return {
            isValid: true,
            hasFeature: true,
            canUseFeature: false,
            reason: 'User role does not have permission for this feature'
          };
        }
      }

      return {
        isValid: true,
        hasFeature: true,
        canUseFeature: true
      };

    } catch (error) {
      console.error('Error checking feature access:', error);
      throw new Error('Failed to check feature access');
    }
  }

  /**
   * Track feature usage for analytics and billing
   */
  async trackUsage(
    tenantId: string,
    featureCode: string,
    value: number = 1,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      
      await this.dbService.query(
        `INSERT INTO tenant_license_usage 
        (tenant_id, feature_code, usage_value, period_month, metadata, recorded_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        ON CONFLICT (tenant_id, feature_code, period_month)
        DO UPDATE SET 
          usage_value = tenant_license_usage.usage_value + $3,
          metadata = COALESCE(tenant_license_usage.metadata, '{}') || $5,
          last_updated = NOW()`,
        [tenantId, featureCode, value, currentMonth, JSON.stringify(metadata || {})]
      );

      // Check for upgrade opportunities
      await this.checkUpgradeOpportunity(tenantId, featureCode);

    } catch (error) {
      console.error('Error tracking usage:', error);
      // Don't throw here - usage tracking failure shouldn't break the feature
    }
  }

  /**
   * Get current usage against limits for all features
   */
  async getUsageLimits(tenantId: string): Promise<Record<string, FeatureUsage>> {
    try {
      const license = await this.getTenantLicense(tenantId);
      if (!license) {
        return {};
      }

      const currentMonth = new Date().toISOString().slice(0, 7);
      
      const usageData = await this.dbService.query(
        `SELECT 
          tlu.feature_code,
          COALESCE(tlu.usage_value, 0) as current_usage,
          lf.max_usage as usage_limit,
          CASE 
            WHEN lf.max_usage = 0 THEN 0 
            ELSE (COALESCE(tlu.usage_value, 0)::float / NULLIF(lf.max_usage, 0) * 100)
          END as usage_percentage
        FROM license_features lf
        LEFT JOIN tenant_license_usage tlu ON lf.feature_code = tlu.feature_code 
          AND tlu.tenant_id = $1 AND tlu.period_month = $2
        WHERE lf.license_plan = $3`,
        [tenantId, currentMonth, license.licenseCode]
      );

      return usageData.rows.reduce((acc: Record<string, FeatureUsage>, row: any) => {
        acc[row.feature_code] = {
          featureCode: row.feature_code,
          currentUsage: parseInt(row.current_usage),
          limit: parseInt(row.usage_limit),
          usagePercentage: parseFloat(row.usage_percentage || 0),
          isOverLimit: parseInt(row.current_usage) > parseInt(row.usage_limit) && parseInt(row.usage_limit) > 0
        };
        return acc;
      }, {} as Record<string, FeatureUsage>);

    } catch (error) {
      console.error('Error fetching usage limits:', error);
      throw new Error('Failed to fetch usage limits');
    }
  }

  /**
   * Get available KPIs for dashboard based on license
   */
  async getAvailableKPIs(
    tenantId: string,
    userRole: string,
    dashboardType: string
  ): Promise<string[]> {
    try {
      const license = await this.getTenantLicense(tenantId);
      if (!license) {
        return [];
      }

      // Get KPIs based on license and role
      const result = await this.dbService.query(
        `SELECT DISTINCT k.kpi_code
        FROM dashboard_kpis k
        JOIN kpi_access_rules kar ON k.kpi_code = kar.kpi_code
        WHERE kar.license_plan = $1 
          AND kar.user_role = $2
          AND k.dashboard_type = $3
          AND k.is_active = true
        ORDER BY k.display_order`,
        [license.licenseCode, userRole, dashboardType]
      );

      let availableKPIs = result.rows.map((row: any) => row.kpi_code);

      // Apply KPI limits based on license
      if (license.kpiLimit > 0 && availableKPIs.length > license.kpiLimit) {
        availableKPIs = availableKPIs.slice(0, license.kpiLimit);
      }

      return availableKPIs;

    } catch (error) {
      console.error('Error fetching available KPIs:', error);
      throw new Error('Failed to fetch available KPIs');
    }
  }

  /**
   * Check if license allows dashboard access
   */
  async checkDashboardAccess(
    tenantId: string,
    dashboardType: string,
    userRole: string
  ): Promise<boolean> {
    try {
      const license = await this.getTenantLicense(tenantId);
      if (!license) {
        return false;
      }

      // Check if dashboard is included in license
      if (!license.dashboards.includes(dashboardType)) {
        return false;
      }

      // Check role permissions  
      const hasRoleAccess = await this.rbacService.checkPermission(
        1, // Placeholder user ID - should be passed from context
        `dashboard.${dashboardType}`,
        parseInt(tenantId)
      );

      return hasRoleAccess;

    } catch (error) {
      console.error('Error checking dashboard access:', error);
      return false;
    }
  }

  /**
   * Get upgrade suggestions based on usage patterns
   */
  async getUpgradeSuggestions(tenantId: string): Promise<{
    shouldUpgrade: boolean;
    suggestedPlan: string;
    reasons: string[];
    potentialSavings?: number;
  }> {
    try {
      const license = await this.getTenantLicense(tenantId);
      if (!license) {
        return { shouldUpgrade: false, suggestedPlan: '', reasons: [] };
      }

      const usage = await this.getUsageLimits(tenantId);
      const reasons: string[] = [];
      let suggestedPlan = license.licenseCode;

      // Check for usage-based upgrade needs
      for (const [featureCode, featureUsage] of Object.entries(usage)) {
        if (featureUsage.usagePercentage > 80) {
          reasons.push(`${featureCode} usage is at ${featureUsage.usagePercentage.toFixed(1)}%`);
          
          if (license.licenseCode === 'basic' && featureUsage.usagePercentage > 90) {
            suggestedPlan = 'professional';
          } else if (license.licenseCode === 'professional' && featureUsage.usagePercentage > 90) {
            suggestedPlan = 'enterprise';
          }
        }
      }

      // Check for feature requests that require upgrade
      const requestedFeatures = await this.getRequestedFeatures(tenantId);
      if (requestedFeatures.length > 0) {
        reasons.push(`Requested features: ${requestedFeatures.join(', ')}`);
        const newPlan = this.getMinimumPlanForFeatures(requestedFeatures);
        if (['basic', 'professional', 'enterprise', 'platform'].includes(newPlan)) {
          suggestedPlan = newPlan as 'basic' | 'professional' | 'enterprise' | 'platform';
        }
      }

      return {
        shouldUpgrade: reasons.length > 0 && suggestedPlan !== license.licenseCode,
        suggestedPlan,
        reasons,
        potentialSavings: await this.calculatePotentialSavings(tenantId, suggestedPlan)
      };

    } catch (error) {
      console.error('Error getting upgrade suggestions:', error);
      return { shouldUpgrade: false, suggestedPlan: '', reasons: [] };
    }
  }

  // Private helper methods

  private isLicenseValid(license: TenantLicense): boolean {
    if (license.status === 'suspended') {
      return false;
    }

    if (license.status === 'expired') {
      const gracePeriod = new Date(license.validUntil);
      gracePeriod.setDate(gracePeriod.getDate() + license.gracePeriodDays);
      return new Date() <= gracePeriod;
    }

    return license.status === 'active' || license.status === 'trial';
  }

  private mapToTenantLicense(dbRow: any): TenantLicense {
    return {
      tenantId: dbRow.tenant_id,
      licenseCode: dbRow.license_code,
      features: dbRow.features || [],
      dashboards: dbRow.allowed_dashboards || [],
      kpiLimit: dbRow.max_kpis || 0,
      maxUsers: dbRow.max_users || 0,
      maxStorageGB: dbRow.max_storage_gb || 0,
      maxApiCallsPerMonth: dbRow.max_api_calls_per_month || 0,
      validUntil: new Date(dbRow.valid_until),
      autoRenew: dbRow.auto_renew || false,
      status: dbRow.status || 'active',
      gracePeriodDays: dbRow.grace_period_days || 7
    };
  }

  private async checkUsageLimit(tenantId: string, featureCode: string): Promise<FeatureUsage> {
    const usage = await this.getUsageLimits(tenantId);
    return usage[featureCode] || {
      featureCode,
      currentUsage: 0,
      limit: 0,
      usagePercentage: 0,
      isOverLimit: false
    };
  }

  private getSuggestedUpgrade(currentPlan: string, featureCode: string): string {
    // Simple upgrade logic - can be enhanced based on feature matrix
    const upgradeMatrix: Record<string, string> = {
      'basic': 'professional',
      'professional': 'enterprise',
      'enterprise': 'platform'
    };

    return upgradeMatrix[currentPlan] || 'professional';
  }

  private async checkUpgradeOpportunity(tenantId: string, featureCode: string): Promise<void> {
    try {
      const usage = await this.checkUsageLimit(tenantId, featureCode);
      
      // Create upgrade opportunity record if usage is high
      if (usage.usagePercentage > 85) {
        await this.dbService.query(
          `INSERT INTO upgrade_opportunities (tenant_id, feature_code, usage_percentage, created_at)
          VALUES ($1, $2, $3, NOW())
          ON CONFLICT (tenant_id, feature_code) 
          DO UPDATE SET 
            usage_percentage = $3,
            updated_at = NOW()`,
          [tenantId, featureCode, usage.usagePercentage]
        );
      }
    } catch (error) {
      console.error('Error checking upgrade opportunity:', error);
    }
  }

  private async getRequestedFeatures(tenantId: string): Promise<string[]> {
    try {
      const result = await this.dbService.query(
        `SELECT DISTINCT feature_code 
        FROM feature_requests 
        WHERE tenant_id = $1 AND status = 'pending'`,
        [tenantId]
      );

      return result.rows.map((row: any) => row.feature_code);
    } catch (error) {
      return [];
    }
  }

  private getMinimumPlanForFeatures(features: string[]): string {
    // Enhanced logic based on feature requirements
    const enterpriseFeatures = ['advanced_analytics', 'custom_reports', 'api_access'];
    const professionalFeatures = ['team_dashboards', 'bulk_operations'];
    
    if (features.some(f => enterpriseFeatures.includes(f))) {
      return 'enterprise';
    } else if (features.some(f => professionalFeatures.includes(f))) {
      return 'professional';
    }
    
    return 'basic';
  }

  private async calculatePotentialSavings(tenantId: string, suggestedPlan: string): Promise<number> {
    // Placeholder for savings calculation logic
    // Could calculate based on current usage vs new plan efficiency
    return 0;
  }

  /**
   * Get expiring licenses
   */
  async getExpiringLicenses(days: number): Promise<any[]> {
    try {
      const result = await this.dbService.query(
        `SELECT * FROM licenses 
         WHERE status = 'active' 
         AND expires_at IS NOT NULL 
         AND expires_at <= CURRENT_DATE + INTERVAL '${days} days'`,
        []
      );
      return result.rows;
    } catch (error) {
      console.error('Error getting expiring licenses:', error);
      return [];
    }
  }

  /**
   * Get active tenants with licenses
   */
  async getActiveTenantsWithLicenses(): Promise<any[]> {
    try {
      const result = await this.dbService.query(
        `SELECT DISTINCT tenant_id, license_code 
         FROM licenses 
         WHERE status = 'active'`,
        []
      );
      return result.rows;
    } catch (error) {
      console.error('Error getting active tenants:', error);
      return [];
    }
  }

  /**
   * Get renewal reminder candidates
   */
  async getRenewalReminderCandidates(): Promise<any[]> {
    try {
      const result = await this.dbService.query(
        `SELECT * FROM licenses 
         WHERE status = 'active' 
         AND auto_renew = true 
         AND expires_at IS NOT NULL 
         AND expires_at <= CURRENT_DATE + INTERVAL '30 days'`,
        []
      );
      return result.rows;
    } catch (error) {
      console.error('Error getting renewal candidates:', error);
      return [];
    }
  }

  /**
   * Get tenant context
   */
  async getTenantContext(tenantId: string): Promise<any> {
    try {
      const result = await this.dbService.query(
        `SELECT * FROM tenants 
         WHERE id = $1`,
        [tenantId]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting tenant context:', error);
      return null;
    }
  }

  /**
   * Get active licenses
   */
  async getActiveLicenses(): Promise<any[]> {
    try {
      const result = await this.dbService.query(
        `SELECT * FROM licenses 
         WHERE status = 'active'`,
        []
      );
      return result.rows;
    } catch (error) {
      console.error('Error getting active licenses:', error);
      return [];
    }
  }

  /**
   * Get weekly license metrics
   */
  async getWeeklyLicenseMetrics(weekStart: Date, reportDate: Date): Promise<any> {
    try {
      const result = await this.dbService.query(
        `SELECT 
           COUNT(*) as total_licenses,
           COUNT(CASE WHEN status = 'active' THEN 1 END) as active_licenses,
           COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired_licenses
         FROM licenses 
         WHERE created_at >= $1 AND created_at <= $2`,
        [weekStart, reportDate]
      );
      return result.rows[0] || { total_licenses: 0, active_licenses: 0, expired_licenses: 0 };
    } catch (error) {
      console.error('Error getting weekly metrics:', error);
      return { total_licenses: 0, active_licenses: 0, expired_licenses: 0 };
    }
  }

  /**
   * Get platform administrators
   */
  async getPlatformAdministrators(): Promise<any[]> {
    try {
      const result = await this.dbService.query(
        `SELECT * FROM users 
         WHERE role = 'platform_admin' 
         AND status = 'active'`,
        []
      );
      return result.rows;
    } catch (error) {
      console.error('Error getting platform administrators:', error);
      return [];
    }
  }

  /**
   * Get tenants for monthly billing
   */
  async getTenantsForMonthlyBilling(): Promise<any[]> {
    try {
      const result = await this.dbService.query(
        `SELECT DISTINCT tenant_id 
         FROM licenses 
         WHERE status = 'active' 
         AND billing_cycle = 'monthly'`,
        []
      );
      return result.rows;
    } catch (error) {
      console.error('Error getting tenants for billing:', error);
      return [];
    }
  }
}