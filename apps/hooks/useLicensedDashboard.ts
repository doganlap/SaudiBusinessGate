/**
 * License-aware dashboard hook for Saudi Store Platform
 * Provides license filtering, feature access checking, and upgrade prompts
 */

import { useState, useEffect, useCallback } from 'react';

export interface TenantLicense {
  tenantId: string;
  licenseCode: 'basic' | 'professional' | 'enterprise' | 'platform';
  features: string[];
  dashboards: string[];
  kpiLimit: number;
  maxUsers: number;
  status: 'active' | 'expired' | 'suspended' | 'trial';
  validUntil: string;
}

export interface FeatureUsage {
  featureCode: string;
  currentUsage: number;
  limit: number;
  usagePercentage: number;
  isOverLimit: boolean;
}

export interface UpgradePrompt {
  message: string;
  upgradeUrl: string;
  suggestedPlan: string;
  featureCode: string;
}

export interface LicensedKPI {
  id: string;
  name: string;
  value: any;
  requiredFeature: string;
  requiredRole?: string;
  isPremium: boolean;
  category?: string;
  description?: string;
}

export interface UseLicensedDashboardReturn {
  // License data
  license: TenantLicense | null;
  usage: Record<string, FeatureUsage>;
  loading: boolean;
  error: string | null;
  
  // License filtering functions
  filterKPIsByLicense: (kpis: LicensedKPI[]) => LicensedKPI[];
  filterFeaturesByLicense: (features: string[]) => string[];
  
  // Feature access checking
  hasFeature: (featureCode: string) => boolean;
  canUseFeature: (featureCode: string) => Promise<boolean>;
  checkFeatureAccess: (featureCode: string, userId?: string) => Promise<{
    allowed: boolean;
    reason?: string;
    upgradeRequired?: boolean;
  }>;
  
  // Upgrade functionality
  getUpgradePrompt: (featureCode: string) => UpgradePrompt | null;
  shouldShowUpgrade: (featureCode: string) => boolean;
  
  // Usage tracking
  trackUsage: (featureCode: string, value?: number, metadata?: Record<string, any>) => Promise<void>;
  
  // Utility functions
  refresh: () => Promise<void>;
  isLicenseValid: () => boolean;
  getUsageWarnings: () => string[];
}

export function useLicensedDashboard(
  tenantId: string,
  userRole: string,
  options: {
    autoRefresh?: boolean;
    refreshInterval?: number;
    enableUsageTracking?: boolean;
  } = {}
): UseLicensedDashboardReturn {
  
  const {
    autoRefresh = true,
    refreshInterval = 5 * 60 * 1000, // 5 minutes
    enableUsageTracking = true
  } = options;

  // State
  const [license, setLicense] = useState<TenantLicense | null>(null);
  const [usage, setUsage] = useState<Record<string, FeatureUsage>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch license data
  const fetchLicense = useCallback(async () => {
    try {
      setError(null);
      
      const response = await fetch(`/api/license/tenant/${tenantId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-cache'
      });

      if (!response.ok) {
        if (response.status === 404) {
          setError('No license found for this tenant');
          setLicense(null);
          return;
        }
        throw new Error(`Failed to fetch license: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setLicense(data.data);
      } else {
        throw new Error(data.message || 'Failed to load license data');
      }
    } catch (err) {
      console.error('Error fetching license:', err);
      setError(err instanceof Error ? err.message : 'Failed to load license');
    }
  }, [tenantId]);

  // Fetch usage data
  const fetchUsage = useCallback(async () => {
    try {
      const response = await fetch(`/api/license/usage/${tenantId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-cache'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUsage(data.data.usage || {});
        }
      }
    } catch (err) {
      console.error('Error fetching usage:', err);
      // Don't set error for usage fetch - it's not critical
    }
  }, [tenantId]);

  // Refresh all data
  const refresh = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchLicense(), fetchUsage()]);
    setLoading(false);
  }, [fetchLicense, fetchUsage]);

  // Initial load
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchUsage(); // Only refresh usage, license changes less frequently
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchUsage]);

  // License filtering functions
  const filterKPIsByLicense = useCallback((kpis: LicensedKPI[]): LicensedKPI[] => {
    if (!license) return [];

    const filtered = kpis.filter(kpi => {
      // Check if license includes required feature
      const hasLicenseFeature = license.features.includes(kpi.requiredFeature);
      
      // Check role requirement if specified
      const hasRoleAccess = !kpi.requiredRole || userRole === kpi.requiredRole || 
                           ['super_admin', 'platform_admin'].includes(userRole);

      return hasLicenseFeature && hasRoleAccess;
    });

    // Apply KPI limits based on license
    if (license.kpiLimit > 0 && filtered.length > license.kpiLimit) {
      return filtered.slice(0, license.kpiLimit);
    }

    return filtered;
  }, [license, userRole]);

  const filterFeaturesByLicense = useCallback((features: string[]): string[] => {
    if (!license) return [];
    return features.filter(feature => license.features.includes(feature));
  }, [license]);

  // Feature access checking
  const hasFeature = useCallback((featureCode: string): boolean => {
    return license?.features.includes(featureCode) || false;
  }, [license]);

  const canUseFeature = useCallback(async (featureCode: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/license/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenantId,
          featureCode,
          userRole
        })
      });

      if (!response.ok) return false;

      const data = await response.json();
      return data.success && data.data.canUseFeature;
    } catch {
      return false;
    }
  }, [tenantId, userRole]);

  const checkFeatureAccess = useCallback(async (
    featureCode: string,
    userId?: string
  ): Promise<{
    allowed: boolean;
    reason?: string;
    upgradeRequired?: boolean;
  }> => {
    try {
      const response = await fetch('/api/license/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenantId,
          featureCode,
          userId
        })
      });

      if (!response.ok) {
        return { allowed: false, reason: 'License check failed' };
      }

      const data = await response.json();
      if (data.success) {
        return {
          allowed: data.data.canUseFeature,
          reason: data.data.reason,
          upgradeRequired: data.data.upgradeRequired
        };
      }

      return { allowed: false, reason: 'Invalid response' };
    } catch (error) {
      console.error('Feature access check failed:', error);
      return { allowed: false, reason: 'Check failed' };
    }
  }, [tenantId]);

  // Upgrade functionality
  const getUpgradePrompt = useCallback((featureCode: string): UpgradePrompt | null => {
    if (!license || license.features.includes(featureCode)) {
      return null; // Feature is available
    }

    const upgradeMap: Record<string, string> = {
      'basic': 'professional',
      'professional': 'enterprise',
      'enterprise': 'platform'
    };

    const suggestedPlan = upgradeMap[license.licenseCode] || 'professional';

    return {
      message: `Upgrade to ${suggestedPlan} to access this feature`,
      upgradeUrl: `/billing/upgrade?feature=${featureCode}&current=${license.licenseCode}&suggested=${suggestedPlan}`,
      suggestedPlan,
      featureCode
    };
  }, [license]);

  const shouldShowUpgrade = useCallback((featureCode: string): boolean => {
    return getUpgradePrompt(featureCode) !== null;
  }, [getUpgradePrompt]);

  // Usage tracking
  const trackUsage = useCallback(async (
    featureCode: string,
    value: number = 1,
    metadata?: Record<string, any>
  ): Promise<void> => {
    if (!enableUsageTracking) return;

    try {
      await fetch(`/api/license/usage/${tenantId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          featureCode,
          value,
          metadata: {
            ...metadata,
            userRole,
            timestamp: new Date().toISOString()
          }
        })
      });

      // Refresh usage data after tracking
      fetchUsage();
    } catch (error) {
      console.error('Failed to track usage:', error);
      // Don't throw - usage tracking failures shouldn't break functionality
    }
  }, [enableUsageTracking, tenantId, userRole, fetchUsage]);

  // Utility functions
  const isLicenseValid = useCallback((): boolean => {
    if (!license) return false;

    if (license.status === 'suspended') return false;

    if (license.status === 'expired') {
      // Check if still in grace period (implementation would check grace period)
      const validUntil = new Date(license.validUntil);
      const now = new Date();
      const gracePeriod = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
      return (now.getTime() - validUntil.getTime()) <= gracePeriod;
    }

    return license.status === 'active' || license.status === 'trial';
  }, [license]);

  const getUsageWarnings = useCallback((): string[] => {
    const warnings: string[] = [];

    Object.values(usage).forEach(featureUsage => {
      if (featureUsage.usagePercentage > 90) {
        warnings.push(`${featureUsage.featureCode} usage at ${featureUsage.usagePercentage.toFixed(1)}%`);
      }
    });

    return warnings;
  }, [usage]);

  return {
    // Data
    license,
    usage,
    loading,
    error,

    // Filtering functions
    filterKPIsByLicense,
    filterFeaturesByLicense,

    // Feature access
    hasFeature,
    canUseFeature,
    checkFeatureAccess,

    // Upgrade functionality
    getUpgradePrompt,
    shouldShowUpgrade,

    // Usage tracking
    trackUsage,

    // Utilities
    refresh,
    isLicenseValid,
    getUsageWarnings
  };
}

export default useLicensedDashboard;