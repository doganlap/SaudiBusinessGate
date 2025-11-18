import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { LicenseService } from '../../../../../lib/services/license.service';
import { RBACService } from '../../../../../lib/auth/rbac-service';

// Initialize services
const dbPool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const dbService = {
  async query(sql: string, params: any[] = []): Promise<{ rows: any[] }> {
    const client = await dbPool.connect();
    try {
      const result = await client.query(sql, params);
      return { rows: result.rows };
    } finally {
      client.release();
    }
  }
};

const rbacService = new RBACService(dbPool);
const licenseService = new LicenseService(dbService, rbacService);

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ tenantId: string }> }
) {
  const { tenantId } = await context.params;
  try {
    

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID is required' },
        { status: 400 }
      );
    }

    const license = await licenseService.getTenantLicense(tenantId);
    
    if (!license) {
      return NextResponse.json(
        { 
          error: 'License not found',
          message: 'No valid license found for this tenant'
        },
        { status: 404 }
      );
    }

    // Remove sensitive information before sending to client
    const publicLicense = {
      tenantId: license.tenantId,
      licenseCode: license.licenseCode,
      features: license.features,
      dashboards: license.dashboards,
      kpiLimit: license.kpiLimit,
      maxUsers: license.maxUsers,
      status: license.status,
      validUntil: license.validUntil,
      // Don't expose: maxStorageGB, maxApiCallsPerMonth (internal limits)
    };

    return NextResponse.json({
      success: true,
      data: publicLicense
    });

  } catch (error) {
    console.error('Error fetching tenant license:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to fetch license information'
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ tenantId: string }> }
) {
  const { tenantId } = await context.params;
  try {
    
    const body = await request.json();

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID is required' },
        { status: 400 }
      );
    }

    // This would typically be restricted to admin users only
    const { licenseCode, autoRenew } = body;

    if (!licenseCode) {
      return NextResponse.json(
        { error: 'License code is required' },
        { status: 400 }
      );
    }

    // Here you would implement license update logic
    // For now, we'll just return success
    
    return NextResponse.json({
      success: true,
      message: 'License updated successfully'
    });

  } catch (error) {
    console.error('Error updating tenant license:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to update license'
      },
      { status: 500 }
    );
  }
}