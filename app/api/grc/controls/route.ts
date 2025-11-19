/**
 * GRC Controls API Endpoints
 * RESTful API for Control Management System
 * Multi-tenant, RBAC-enabled, Bilingual support
 */

import { NextRequest, NextResponse } from 'next/server';
import { GRCService } from '@/lib/services/grc.service';

const grcService = new GRCService();

import { getServerSession } from 'next-auth/next';

// GET /api/grc/controls - List controls with filtering
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tenantId = request.headers.get('x-tenant-id') || (session.user as any).tenantId || 'default-tenant';

    // Extract filters from query parameters
    const filters = {
      domain: searchParams.get('domain') || undefined,
      status: searchParams.get('status') || undefined,
      criticality: searchParams.get('criticality') || undefined,
      owner_id: searchParams.get('owner_id') || undefined,
      framework_id: searchParams.get('framework_id') || undefined,
    };

    // Remove undefined values
    Object.keys(filters).forEach(key => {
      if (filters[key as keyof typeof filters] === undefined) {
        delete filters[key as keyof typeof filters];
      }
    });

    const controls = await grcService.getControls(tenantId, filters);

    return NextResponse.json({
      success: true,
      data: controls,
      meta: {
        total: controls.length,
        filters: filters
      }
    });

  } catch (error) {
    console.error('Error in GET /api/grc/controls:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch controls',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/grc/controls - Create new control
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = request.headers.get('x-tenant-id') || (session.user as any).tenantId || 'default-tenant';
    const userId = (session.user as any).id || request.headers.get('x-user-id');

    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['code', 'title_en', 'objective_en', 'domain', 'control_type', 'control_nature', 'frequency'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          missing_fields: missingFields
        },
        { status: 400 }
      );
    }

    // Validate enum values
    const validControlTypes = ['Preventive', 'Detective', 'Corrective'];
    const validControlNatures = ['Manual', 'Automated', 'Semi-automated'];
    const validFrequencies = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annual', 'On-event'];
    const validCriticalities = ['Critical', 'High', 'Medium', 'Low'];

    if (!validControlTypes.includes(body.control_type)) {
      return NextResponse.json(
        { error: 'Invalid control_type. Must be one of: ' + validControlTypes.join(', ') },
        { status: 400 }
      );
    }

    if (!validControlNatures.includes(body.control_nature)) {
      return NextResponse.json(
        { error: 'Invalid control_nature. Must be one of: ' + validControlNatures.join(', ') },
        { status: 400 }
      );
    }

    if (!validFrequencies.includes(body.frequency)) {
      return NextResponse.json(
        { error: 'Invalid frequency. Must be one of: ' + validFrequencies.join(', ') },
        { status: 400 }
      );
    }

    if (body.criticality && !validCriticalities.includes(body.criticality)) {
      return NextResponse.json(
        { error: 'Invalid criticality. Must be one of: ' + validCriticalities.join(', ') },
        { status: 400 }
      );
    }

    const control = await grcService.createControl(tenantId, body, userId || undefined);

    return NextResponse.json({
      success: true,
      data: control,
      message: 'Control created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/grc/controls:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create control',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
