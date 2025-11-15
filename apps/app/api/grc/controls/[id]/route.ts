/**
 * GRC Control by ID API Endpoints
 * Individual control management operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { GRCService } from '@/lib/services/grc.service';

const grcService = new GRCService();

// GET /api/grc/controls/[id] - Get control by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tenantId = request.headers.get('x-tenant-id');
    
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID is required' },
        { status: 400 }
      );
    }

    const control = await grcService.getControlById(tenantId, id);

    if (!control) {
      return NextResponse.json(
        { error: 'Control not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: control
    });

  } catch (error) {
    console.error('Error in GET /api/grc/controls/[id]:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch control',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/grc/controls/[id] - Update control
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const tenantId = request.headers.get('x-tenant-id');
    const userId = request.headers.get('x-user-id');
    
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Validate enum values if provided
    const validControlTypes = ['Preventive', 'Detective', 'Corrective'];
    const validControlNatures = ['Manual', 'Automated', 'Semi-automated'];
    const validFrequencies = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annual', 'On-event'];
    const validCriticalities = ['Critical', 'High', 'Medium', 'Low'];
    const validStatuses = ['draft', 'design_review', 'ready', 'operating', 'changed', 'retired'];

    if (body.control_type && !validControlTypes.includes(body.control_type)) {
      return NextResponse.json(
        { error: 'Invalid control_type. Must be one of: ' + validControlTypes.join(', ') },
        { status: 400 }
      );
    }

    if (body.control_nature && !validControlNatures.includes(body.control_nature)) {
      return NextResponse.json(
        { error: 'Invalid control_nature. Must be one of: ' + validControlNatures.join(', ') },
        { status: 400 }
      );
    }

    if (body.frequency && !validFrequencies.includes(body.frequency)) {
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

    if (body.status && !validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') },
        { status: 400 }
      );
    }

    const control = await grcService.updateControl(tenantId, id, body, userId || undefined);

    return NextResponse.json({
      success: true,
      data: control,
      message: 'Control updated successfully'
    });

  } catch (error) {
    console.error('Error in PUT /api/grc/controls/[id]:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update control',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
