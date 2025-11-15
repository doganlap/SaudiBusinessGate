import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { LicenseService } from '../../../../lib/services/license.service';
import { RBACService } from '../../../../lib/auth/rbac-service';

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, featureCode, userId } = body;

    if (!tenantId || !featureCode) {
      return NextResponse.json(
        { error: 'Tenant ID and feature code are required' },
        { status: 400 }
      );
    }

    const validation = await licenseService.checkFeatureAccess(
      tenantId,
      featureCode,
      userId
    );

    return NextResponse.json({
      success: true,
      data: validation
    });

  } catch (error) {
    console.error('Error checking feature access:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to check feature access'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const featureCode = searchParams.get('featureCode');
    const userId = searchParams.get('userId');

    if (!tenantId || !featureCode) {
      return NextResponse.json(
        { error: 'Tenant ID and feature code are required' },
        { status: 400 }
      );
    }

    const validation = await licenseService.checkFeatureAccess(
      tenantId,
      featureCode,
      userId || undefined
    );

    return NextResponse.json({
      success: true,
      data: validation
    });

  } catch (error) {
    console.error('Error checking feature access:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to check feature access'
      },
      { status: 500 }
    );
  }
}