/**
 * GRC Control Tests API Endpoints
 * Control testing management (Design & Operating Effectiveness)
 */

import { NextRequest, NextResponse } from 'next/server';
import { GRCService } from '@/lib/services/grc.service';

const grcService = new GRCService();

// GET /api/grc/tests - List control tests
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = request.headers.get('x-tenant-id');
    
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID is required' },
        { status: 400 }
      );
    }

    const controlId = searchParams.get('control_id') || undefined;
    const tests = await grcService.getControlTests(tenantId, controlId);

    return NextResponse.json({
      success: true,
      data: tests,
      meta: {
        total: tests.length,
        control_id: controlId
      }
    });

  } catch (error) {
    console.error('Error in GET /api/grc/tests:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch control tests',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/grc/tests - Create new control test
export async function POST(request: NextRequest) {
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
    
    // Validate required fields
    const requiredFields = ['control_id', 'test_type', 'test_name_en'];
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

    // Validate test_type
    const validTestTypes = ['design_effectiveness', 'operating_effectiveness'];
    if (!validTestTypes.includes(body.test_type)) {
      return NextResponse.json(
        { error: 'Invalid test_type. Must be one of: ' + validTestTypes.join(', ') },
        { status: 400 }
      );
    }

    const test = await grcService.createControlTest(tenantId, body, userId || undefined);

    return NextResponse.json({
      success: true,
      data: test,
      message: 'Control test created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/grc/tests:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create control test',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
