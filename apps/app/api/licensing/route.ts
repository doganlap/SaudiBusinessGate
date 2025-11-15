import { NextRequest, NextResponse } from 'next/server';
import { serviceRegistry } from '@/lib/services/registry';

interface License {
  id: string;
  userId: string;
  tenantId: string;
  licenseTypeId: string;
  licenseKey: string;
  type: 'basic' | 'professional' | 'enterprise' | 'owner';
  status: 'active' | 'expired' | 'suspended' | 'cancelled' | 'trial';
  startDate: string;
  endDate?: string;
  isOwner: boolean;
  currentUsers: number;
  maxUsers?: number;
  currentStorage: number;
  maxStorage?: number;
  monthlyCost: number;
  annualCost: number;
  features: string[];
  billingCycle: 'monthly' | 'annual' | 'one-time';
  autoRenew: boolean;
  trialDays?: number;
  usageStats: {
    transactions: number;
    apiCalls: number;
    storageUsed: number;
  };
}

interface LicenseType {
  id: string;
  code: string;
  name: string;
  nameAr: string;
  monthlyCost: number;
  annualCost: number;
  setupFee: number;
  features: string[];
  maxUsers?: number;
  maxStorage?: number;
  maxTransactions?: number;
  isActive: boolean;
  trialDays: number;
}

// Mock License Types
const mockLicenseTypes: LicenseType[] = [
  {
    id: 'lt-1',
    code: 'BASIC',
    name: 'Basic Plan',
    nameAr: 'الخطة الأساسية',
    monthlyCost: 99,
    annualCost: 990,
    setupFee: 0,
    features: ['dashboard', 'basic_reports'],
    maxUsers: 5,
    maxStorage: 10,
    maxTransactions: 1000,
    isActive: true,
    trialDays: 14
  },
  {
    id: 'lt-2',
    code: 'PROFESSIONAL',
    name: 'Professional Plan',
    nameAr: 'الخطة المهنية',
    monthlyCost: 299,
    annualCost: 2990,
    setupFee: 0,
    features: ['dashboard', 'advanced_reports', 'api_access'],
    maxUsers: 25,
    maxStorage: 100,
    maxTransactions: 10000,
    isActive: true,
    trialDays: 14
  },
  {
    id: 'lt-3',
    code: 'ENTERPRISE',
    name: 'Enterprise Plan',
    nameAr: 'الخطة المؤسسية',
    monthlyCost: 999,
    annualCost: 9990,
    setupFee: 500,
    features: ['dashboard', 'advanced_reports', 'api_access', 'custom_integrations'],
    maxUsers: 100,
    maxStorage: 1000,
    maxTransactions: 100000,
    isActive: true,
    trialDays: 30
  },
  {
    id: 'lt-4',
    code: 'OWNER',
    name: 'Owner Plan',
    nameAr: 'خطة المالك',
    monthlyCost: 0,
    annualCost: 0,
    setupFee: 0,
    features: ['all_features', 'full_access', 'unlimited_everything'],
    maxUsers: undefined,
    maxStorage: undefined,
    maxTransactions: undefined,
    isActive: true,
    trialDays: 0
  }
];

// Initialize services on first request
let servicesInitialized = false;
async function ensureServicesInitialized() {
  if (!servicesInitialized) {
    try {
      await serviceRegistry.initialize();
      servicesInitialized = true;
    } catch (error) {
      console.error('Failed to initialize licensing services:', error);
    }
  }
}

// Mock data fallback
const mockLicenses: License[] = [
  {
    id: 'lic-1',
    userId: 'user-1',
    tenantId: 'demo-tenant',
    licenseTypeId: 'lt-4',
    licenseKey: 'LIC-OWNER-DEMO-001',
    type: 'owner',
    status: 'active',
    startDate: '2024-01-01',
    isOwner: true,
    currentUsers: 1,
    currentStorage: 5.2,
    monthlyCost: 0,
    annualCost: 0,
    features: ['all_features', 'full_access'],
    billingCycle: 'one-time',
    autoRenew: false,
    usageStats: {
      transactions: 1250,
      apiCalls: 5680,
      storageUsed: 5.2
    }
  },
  {
    id: 'lic-2',
    userId: 'user-2',
    tenantId: 'demo-tenant',
    licenseTypeId: 'lt-2',
    licenseKey: 'LIC-PROF-DEMO-002',
    type: 'professional',
    status: 'active',
    startDate: '2024-01-15',
    endDate: '2025-01-15',
    isOwner: false,
    currentUsers: 12,
    maxUsers: 25,
    currentStorage: 45.8,
    maxStorage: 100,
    monthlyCost: 299,
    annualCost: 2990,
    features: ['dashboard', 'advanced_reports', 'api_access'],
    billingCycle: 'annual',
    autoRenew: true,
    usageStats: {
      transactions: 8750,
      apiCalls: 15420,
      storageUsed: 45.8
    }
  },
  {
    id: 'lic-3',
    userId: 'user-3',
    tenantId: 'demo-tenant',
    licenseTypeId: 'lt-1',
    licenseKey: 'LIC-BASIC-DEMO-003',
    type: 'basic',
    status: 'trial',
    startDate: '2024-01-20',
    endDate: '2024-02-03',
    isOwner: false,
    currentUsers: 3,
    maxUsers: 5,
    currentStorage: 2.1,
    maxStorage: 10,
    monthlyCost: 99,
    annualCost: 990,
    features: ['dashboard', 'basic_reports'],
    billingCycle: 'monthly',
    autoRenew: false,
    trialDays: 14,
    usageStats: {
      transactions: 245,
      apiCalls: 890,
      storageUsed: 2.1
    }
  }
];

export async function GET(request: NextRequest) {
  try {
    await ensureServicesInitialized();

    const { searchParams } = new URL(request.url);
    const tenantId = request.headers.get('x-tenant-id') || 'demo-tenant';

    // Try to get real data from database
    try {
      const licenses = await serviceRegistry.licensing.getTenantLicenses(tenantId);
      const stats = await serviceRegistry.licensing.getLicenseStats(tenantId);

      return NextResponse.json({
        success: true,
        data: licenses,
        licenseTypes: mockLicenseTypes,
        stats
      });
    } catch (dbError) {
      console.warn('Database unavailable for licensing, using fallback data:', dbError);

      // Fallback to mock data
      const tenantLicenses = mockLicenses.filter(license => license.tenantId === tenantId);
      const stats = {
        total: tenantLicenses.length,
        active: tenantLicenses.filter(l => l.status === 'active').length,
        trial: tenantLicenses.filter(l => l.status === 'trial').length,
        expired: tenantLicenses.filter(l => l.status === 'expired').length,
        suspended: tenantLicenses.filter(l => l.status === 'suspended').length,
        totalUsers: tenantLicenses.reduce((sum, l) => sum + l.currentUsers, 0),
        totalCost: tenantLicenses.reduce((sum, l) => {
          return sum + (l.billingCycle === 'annual' ? l.annualCost : l.monthlyCost * 12);
        }, 0),
        storageUsed: tenantLicenses.reduce((sum, l) => sum + l.currentStorage, 0)
      };

      return NextResponse.json({
        success: false,
        error: 'Database unavailable, using demo data',
        data: tenantLicenses,
        licenseTypes: mockLicenseTypes,
        stats
      });
    }

  } catch (error) {
    console.error('Licensing GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch licenses'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureServicesInitialized();

    const tenantId = request.headers.get('x-tenant-id') || 'demo-tenant';
    const body = await request.json();

    try {
      const licenseData = {
        tenantId,
        licenseId: body.licenseTypeId,
        contractId: body.contractId,
        invoiceId: body.invoiceId,
        startDate: new Date().toISOString(),
        endDate: body.billingCycle === 'annual'
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: body.startTrial ? 'trial' : 'active',
        autoRenew: body.autoRenew || false,
        billingCycle: body.billingCycle || 'monthly',
        monthlyCost: body.monthlyCost || 0,
        annualCost: body.annualCost || 0,
        currentUsers: body.currentUsers || 1,
        currentStorageGb: body.currentStorage || 0,
        currentApiCalls: body.currentApiCalls || 0,
        isTrial: body.startTrial || false,
        trialDaysRemaining: body.startTrial ? body.trialDays : undefined,
        isActive: true
      };

      const newLicense = await serviceRegistry.licensing.createTenantLicense(licenseData);
      return NextResponse.json({
        success: true,
        data: newLicense
      });
    } catch (dbError) {
      console.warn('Database unavailable for create license, operation not persisted:', dbError);
      return NextResponse.json({
        success: false,
        error: 'Database unavailable, license not created'
      });
    }

  } catch (error) {
    console.error('Licensing POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create license'
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await ensureServicesInitialized();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const tenantId = request.headers.get('x-tenant-id') || 'demo-tenant';
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'License ID is required' },
        { status: 400 }
      );
    }

    try {
      // Handle different actions
      if (body.action === 'renew') {
        const newEndDate = body.newEndDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
        const renewedLicense = await serviceRegistry.licensing.renewLicense(id, newEndDate, tenantId);
        if (renewedLicense) {
          return NextResponse.json({
            success: true,
            data: renewedLicense
          });
        } else {
          return NextResponse.json(
            { success: false, error: 'License not found' },
            { status: 404 }
          );
        }
      } else if (body.action === 'suspend') {
        const suspended = await serviceRegistry.licensing.suspendLicense(id, tenantId);
        if (suspended) {
          return NextResponse.json({
            success: true,
            message: 'License suspended successfully'
          });
        } else {
          return NextResponse.json(
            { success: false, error: 'License not found' },
            { status: 404 }
          );
        }
      } else {
        // General update
        const updatedLicense = await serviceRegistry.licensing.updateTenantLicense(id, body, tenantId);
        if (updatedLicense) {
          return NextResponse.json({
            success: true,
            data: updatedLicense
          });
        } else {
          return NextResponse.json(
            { success: false, error: 'License not found' },
            { status: 404 }
          );
        }
      }
    } catch (dbError) {
      console.warn('Database unavailable for update license, operation not persisted:', dbError);
      return NextResponse.json({
        success: false,
        error: 'Database unavailable, license not updated'
      });
    }

  } catch (error) {
    console.error('Licensing PATCH error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update license'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await ensureServicesInitialized();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const tenantId = request.headers.get('x-tenant-id') || 'demo-tenant';

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'License ID is required' },
        { status: 400 }
      );
    }

    try {
      const deleted = await serviceRegistry.licensing.deleteTenantLicense(id, tenantId);
      if (deleted) {
        return NextResponse.json({
          success: true,
          message: 'License deleted successfully'
        });
      } else {
        return NextResponse.json(
          { success: false, error: 'License not found' },
          { status: 404 }
        );
      }
    } catch (dbError) {
      console.warn('Database unavailable for delete license, operation not persisted:', dbError);
      return NextResponse.json({
        success: false,
        error: 'Database unavailable, license not deleted'
      });
    }

  } catch (error) {
    console.error('Licensing DELETE error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete license'
      },
      { status: 500 }
    );
  }
}
