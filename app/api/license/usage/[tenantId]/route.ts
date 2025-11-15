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
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params;

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID is required' },
        { status: 400 }
      );
    }

    const usage = await licenseService.getUsageLimits(tenantId);
    const upgradeSuggestions = await licenseService.getUpgradeSuggestions(tenantId);

    return NextResponse.json({
      success: true,
      data: {
        usage,
        upgradeSuggestions,
        tenantId
      }
    });

  } catch (error) {
    console.error('Error fetching usage data:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to fetch usage data'
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params;
    const body = await request.json();

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID is required' },
        { status: 400 }
      );
    }

    const { featureCode, value = 1, metadata } = body;

    if (!featureCode) {
      return NextResponse.json(
        { error: 'Feature code is required' },
        { status: 400 }
      );
    }

    await licenseService.trackUsage(tenantId, featureCode, value, metadata);

    return NextResponse.json({
      success: true,
      message: 'Usage tracked successfully'
    });

  } catch (error) {
    console.error('Error tracking usage:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to track usage'
      },
      { status: 500 }
    );
  }
}