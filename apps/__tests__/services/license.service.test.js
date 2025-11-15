/**
 * Comprehensive Test Suite for License Service
 * Tests license management, validation, enforcement, and integration
 */

import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';
import LicenseService from '../../lib/services/license.service';
import { DatabaseService } from '../../lib/services/database.service';

// Mock dependencies
jest.mock('../../lib/services/database.service');

describe('LicenseService', () => {
  let licenseService;
  let mockDatabaseService;

  const mockTenantLicense = {
    id: 'lic-123',
    tenantId: 'tenant-123',
    type: 'professional',
    status: 'active',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    maxUsers: 50,
    maxStorage: 200,
    features: ['advanced_analytics', 'api_access', 'custom_integrations'],
    usage: {
      currentUsers: 25,
      currentStorage: 150
    }
  };

  const mockTenantBasic = {
    id: 'tenant-123',
    name: 'Test Tenant',
    email: 'test@example.com',
    status: 'active'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    licenseService = new LicenseService();
    mockDatabaseService = new DatabaseService();

    // Setup default mock implementations
    mockDatabaseService.getTenantLicense = jest.fn().mockResolvedValue(mockTenantLicense);
    mockDatabaseService.getTenant = jest.fn().mockResolvedValue(mockTenantBasic);
    mockDatabaseService.updateLicenseUsage = jest.fn().mockResolvedValue(true);
    mockDatabaseService.createLicenseEvent = jest.fn().mockResolvedValue(true);
    mockDatabaseService.getActiveUsers = jest.fn().mockResolvedValue(25);
    mockDatabaseService.getStorageUsage = jest.fn().mockResolvedValue(150);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('License Validation', () => {
    test('should validate active professional license', async () => {
      const isValid = await licenseService.validateLicense('tenant-123');
      
      expect(isValid).toBe(true);
      expect(mockDatabaseService.getTenantLicense).toHaveBeenCalledWith('tenant-123');
    });

    test('should reject expired license', async () => {
      const expiredLicense = {
        ...mockTenantLicense,
        endDate: new Date('2023-12-31'),
        status: 'expired'
      };
      mockDatabaseService.getTenantLicense.mockResolvedValue(expiredLicense);

      const isValid = await licenseService.validateLicense('tenant-123');
      
      expect(isValid).toBe(false);
      expect(mockDatabaseService.createLicenseEvent).toHaveBeenCalledWith({
        tenantId: 'tenant-123',
        type: 'validation_failed',
        reason: 'license_expired',
        timestamp: expect.any(Date)
      });
    });

    test('should reject suspended license', async () => {
      const suspendedLicense = {
        ...mockTenantLicense,
        status: 'suspended'
      };
      mockDatabaseService.getTenantLicense.mockResolvedValue(suspendedLicense);

      const isValid = await licenseService.validateLicense('tenant-123');
      
      expect(isValid).toBe(false);
      expect(mockDatabaseService.createLicenseEvent).toHaveBeenCalledWith({
        tenantId: 'tenant-123',
        type: 'validation_failed',
        reason: 'license_suspended',
        timestamp: expect.any(Date)
      });
    });

    test('should handle non-existent license', async () => {
      mockDatabaseService.getTenantLicense.mockResolvedValue(null);

      const isValid = await licenseService.validateLicense('tenant-999');
      
      expect(isValid).toBe(false);
      expect(mockDatabaseService.createLicenseEvent).toHaveBeenCalledWith({
        tenantId: 'tenant-999',
        type: 'validation_failed',
        reason: 'license_not_found',
        timestamp: expect.any(Date)
      });
    });
  });

  describe('Feature Access Control', () => {
    test('should grant access to licensed features', async () => {
      const hasAccess = await licenseService.hasFeatureAccess('tenant-123', 'advanced_analytics');
      
      expect(hasAccess).toBe(true);
    });

    test('should deny access to unlicensed features', async () => {
      const hasAccess = await licenseService.hasFeatureAccess('tenant-123', 'enterprise_sso');
      
      expect(hasAccess).toBe(false);
    });

    test('should deny feature access for invalid license', async () => {
      mockDatabaseService.getTenantLicense.mockResolvedValue(null);

      const hasAccess = await licenseService.hasFeatureAccess('tenant-999', 'advanced_analytics');
      
      expect(hasAccess).toBe(false);
    });

    test('should get all available features for license', async () => {
      const features = await licenseService.getAvailableFeatures('tenant-123');
      
      expect(features).toEqual(['advanced_analytics', 'api_access', 'custom_integrations']);
    });

    test('should return empty array for invalid license', async () => {
      mockDatabaseService.getTenantLicense.mockResolvedValue(null);

      const features = await licenseService.getAvailableFeatures('tenant-999');
      
      expect(features).toEqual([]);
    });
  });

  describe('Usage Limits Enforcement', () => {
    test('should allow user creation within limits', async () => {
      const canAddUser = await licenseService.canAddUser('tenant-123');
      
      expect(canAddUser).toBe(true);
      expect(mockDatabaseService.getActiveUsers).toHaveBeenCalledWith('tenant-123');
    });

    test('should deny user creation when at limit', async () => {
      mockDatabaseService.getActiveUsers.mockResolvedValue(50); // At the limit

      const canAddUser = await licenseService.canAddUser('tenant-123');
      
      expect(canAddUser).toBe(false);
    });

    test('should allow storage usage within limits', async () => {
      const canUseStorage = await licenseService.canUseStorage('tenant-123', 25);
      
      expect(canUseStorage).toBe(true);
      expect(mockDatabaseService.getStorageUsage).toHaveBeenCalledWith('tenant-123');
    });

    test('should deny storage usage when exceeding limits', async () => {
      const canUseStorage = await licenseService.canUseStorage('tenant-123', 75); // Would exceed 200GB limit
      
      expect(canUseStorage).toBe(false);
    });

    test('should calculate remaining user slots', async () => {
      const remaining = await licenseService.getRemainingUsers('tenant-123');
      
      expect(remaining).toBe(25); // 50 max - 25 current
    });

    test('should calculate remaining storage', async () => {
      const remaining = await licenseService.getRemainingStorage('tenant-123');
      
      expect(remaining).toBe(50); // 200 max - 150 current
    });
  });

  describe('License Usage Tracking', () => {
    test('should track user addition', async () => {
      await licenseService.trackUserAdded('tenant-123', 'user-456');
      
      expect(mockDatabaseService.updateLicenseUsage).toHaveBeenCalledWith('tenant-123', {
        currentUsers: 26 // incremented from 25
      });
      
      expect(mockDatabaseService.createLicenseEvent).toHaveBeenCalledWith({
        tenantId: 'tenant-123',
        type: 'user_added',
        userId: 'user-456',
        timestamp: expect.any(Date),
        usage: expect.objectContaining({ currentUsers: 26 })
      });
    });

    test('should track user removal', async () => {
      await licenseService.trackUserRemoved('tenant-123', 'user-456');
      
      expect(mockDatabaseService.updateLicenseUsage).toHaveBeenCalledWith('tenant-123', {
        currentUsers: 24 // decremented from 25
      });
      
      expect(mockDatabaseService.createLicenseEvent).toHaveBeenCalledWith({
        tenantId: 'tenant-123',
        type: 'user_removed',
        userId: 'user-456',
        timestamp: expect.any(Date),
        usage: expect.objectContaining({ currentUsers: 24 })
      });
    });

    test('should track storage usage increase', async () => {
      await licenseService.trackStorageUsed('tenant-123', 25);
      
      expect(mockDatabaseService.updateLicenseUsage).toHaveBeenCalledWith('tenant-123', {
        currentStorage: 175 // increased from 150
      });
    });

    test('should track storage usage decrease', async () => {
      await licenseService.trackStorageFreed('tenant-123', 50);
      
      expect(mockDatabaseService.updateLicenseUsage).toHaveBeenCalledWith('tenant-123', {
        currentStorage: 100 // decreased from 150
      });
    });
  });

  describe('License Upgrade/Downgrade', () => {
    test('should upgrade license successfully', async () => {
      const upgradedLicense = {
        ...mockTenantLicense,
        type: 'enterprise',
        maxUsers: 200,
        maxStorage: 1000,
        features: ['advanced_analytics', 'api_access', 'custom_integrations', 'enterprise_sso', 'priority_support']
      };

      mockDatabaseService.updateTenantLicense = jest.fn().mockResolvedValue(upgradedLicense);

      const result = await licenseService.upgradeLicense('tenant-123', 'enterprise');
      
      expect(mockDatabaseService.updateTenantLicense).toHaveBeenCalledWith('tenant-123', {
        type: 'enterprise',
        maxUsers: 200,
        maxStorage: 1000,
        features: ['advanced_analytics', 'api_access', 'custom_integrations', 'enterprise_sso', 'priority_support']
      });

      expect(mockDatabaseService.createLicenseEvent).toHaveBeenCalledWith({
        tenantId: 'tenant-123',
        type: 'license_upgraded',
        fromType: 'professional',
        toType: 'enterprise',
        timestamp: expect.any(Date)
      });

      expect(result).toEqual(upgradedLicense);
    });

    test('should handle downgrade with usage validation', async () => {
      // Current usage exceeds basic plan limits
      const downgradeLicense = {
        ...mockTenantLicense,
        type: 'basic',
        maxUsers: 10,
        maxStorage: 50,
        features: ['basic_analytics']
      };

      const canDowngrade = await licenseService.canDowngrade('tenant-123', 'basic');
      
      expect(canDowngrade).toBe(false); // Current usage (25 users, 150GB) exceeds basic limits
    });

    test('should allow downgrade when usage is within new limits', async () => {
      // Mock lower current usage
      mockDatabaseService.getActiveUsers.mockResolvedValue(8);
      mockDatabaseService.getStorageUsage.mockResolvedValue(30);

      const canDowngrade = await licenseService.canDowngrade('tenant-123', 'basic');
      
      expect(canDowngrade).toBe(true);
    });
  });

  describe('License Renewal', () => {
    test('should check license approaching expiration', async () => {
      const soonToExpire = {
        ...mockTenantLicense,
        endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) // 15 days from now
      };
      mockDatabaseService.getTenantLicense.mockResolvedValue(soonToExpire);

      const needsRenewal = await licenseService.checkRenewalNeeded('tenant-123');
      
      expect(needsRenewal).toBe(true);
    });

    test('should not flag license for renewal when far from expiration', async () => {
      const farFromExpiry = {
        ...mockTenantLicense,
        endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000) // 180 days from now
      };
      mockDatabaseService.getTenantLicense.mockResolvedValue(farFromExpiry);

      const needsRenewal = await licenseService.checkRenewalNeeded('tenant-123');
      
      expect(needsRenewal).toBe(false);
    });

    test('should extend license successfully', async () => {
      const extensionMonths = 12;
      const newEndDate = new Date('2025-12-31');
      
      mockDatabaseService.extendLicense = jest.fn().mockResolvedValue({
        ...mockTenantLicense,
        endDate: newEndDate
      });

      const result = await licenseService.extendLicense('tenant-123', extensionMonths);
      
      expect(mockDatabaseService.extendLicense).toHaveBeenCalledWith('tenant-123', extensionMonths);
      expect(mockDatabaseService.createLicenseEvent).toHaveBeenCalledWith({
        tenantId: 'tenant-123',
        type: 'license_extended',
        extensionMonths,
        newEndDate,
        timestamp: expect.any(Date)
      });
    });
  });

  describe('License Analytics', () => {
    test('should get comprehensive license stats', async () => {
      mockDatabaseService.getLicenseStats = jest.fn().mockResolvedValue({
        totalLicenses: 150,
        activeLicenses: 120,
        expiredLicenses: 20,
        suspendedLicenses: 10,
        licensesByType: {
          basic: 50,
          professional: 70,
          enterprise: 30
        },
        revenueByMonth: {
          '2024-01': 45000,
          '2024-02': 52000,
          '2024-03': 58000
        }
      });

      const stats = await licenseService.getLicenseAnalytics();
      
      expect(stats).toEqual({
        totalLicenses: 150,
        activeLicenses: 120,
        expiredLicenses: 20,
        suspendedLicenses: 10,
        licensesByType: {
          basic: 50,
          professional: 70,
          enterprise: 30
        },
        revenueByMonth: {
          '2024-01': 45000,
          '2024-02': 52000,
          '2024-03': 58000
        }
      });
    });

    test('should get tenant-specific usage analytics', async () => {
      mockDatabaseService.getTenantUsageHistory = jest.fn().mockResolvedValue([
        { date: '2024-01-01', users: 20, storage: 100 },
        { date: '2024-02-01', users: 25, storage: 150 },
        { date: '2024-03-01', users: 30, storage: 180 }
      ]);

      const usage = await licenseService.getTenantUsageAnalytics('tenant-123');
      
      expect(usage).toEqual([
        { date: '2024-01-01', users: 20, storage: 100 },
        { date: '2024-02-01', users: 25, storage: 150 },
        { date: '2024-03-01', users: 30, storage: 180 }
      ]);
    });
  });

  describe('Error Handling', () => {
    test('should handle database connection errors', async () => {
      const dbError = new Error('Database connection failed');
      mockDatabaseService.getTenantLicense.mockRejectedValue(dbError);

      await expect(
        licenseService.validateLicense('tenant-123')
      ).rejects.toThrow('Database connection failed');
    });

    test('should handle invalid tenant ID', async () => {
      await expect(
        licenseService.validateLicense('')
      ).rejects.toThrow('Tenant ID is required');
    });

    test('should handle invalid feature name', async () => {
      await expect(
        licenseService.hasFeatureAccess('tenant-123', '')
      ).rejects.toThrow('Feature name is required');
    });

    test('should handle negative storage values', async () => {
      await expect(
        licenseService.canUseStorage('tenant-123', -10)
      ).rejects.toThrow('Storage amount must be positive');
    });

    test('should handle corrupted license data gracefully', async () => {
      const corruptedLicense = {
        id: 'lic-123',
        tenantId: 'tenant-123',
        // Missing required fields
      };
      mockDatabaseService.getTenantLicense.mockResolvedValue(corruptedLicense);

      const isValid = await licenseService.validateLicense('tenant-123');
      
      expect(isValid).toBe(false);
      expect(mockDatabaseService.createLicenseEvent).toHaveBeenCalledWith({
        tenantId: 'tenant-123',
        type: 'validation_failed',
        reason: 'corrupted_license_data',
        timestamp: expect.any(Date)
      });
    });
  });

  describe('Integration with Billing Service', () => {
    test('should integrate with subscription creation', async () => {
      const subscriptionData = {
        tenantId: 'tenant-123',
        planId: 'professional',
        billingPeriod: 'monthly'
      };

      mockDatabaseService.createLicense = jest.fn().mockResolvedValue(mockTenantLicense);

      const license = await licenseService.createLicenseFromSubscription(subscriptionData);
      
      expect(mockDatabaseService.createLicense).toHaveBeenCalledWith({
        tenantId: 'tenant-123',
        type: 'professional',
        status: 'active',
        startDate: expect.any(Date),
        endDate: expect.any(Date), // Should be 1 month from now
        maxUsers: 50,
        maxStorage: 200,
        features: ['advanced_analytics', 'api_access', 'custom_integrations']
      });

      expect(license).toEqual(mockTenantLicense);
    });

    test('should handle subscription cancellation', async () => {
      mockDatabaseService.updateTenantLicense = jest.fn().mockResolvedValue({
        ...mockTenantLicense,
        status: 'canceled'
      });

      await licenseService.handleSubscriptionCancellation('tenant-123');
      
      expect(mockDatabaseService.updateTenantLicense).toHaveBeenCalledWith('tenant-123', {
        status: 'canceled',
        canceledAt: expect.any(Date)
      });

      expect(mockDatabaseService.createLicenseEvent).toHaveBeenCalledWith({
        tenantId: 'tenant-123',
        type: 'license_canceled',
        reason: 'subscription_canceled',
        timestamp: expect.any(Date)
      });
    });
  });
});