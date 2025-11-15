/**
 * GRC Control Exceptions API Endpoints
 * Control exceptions and compensating controls management
 */

import { NextRequest, NextResponse } from 'next/server';
import { GRCService } from '@/lib/services/grc.service';

const grcService = new GRCService();

// GET /api/grc/exceptions - List control exceptions
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
    const exceptions = await grcService.getControlExceptions(tenantId, controlId);

    return NextResponse.json({
      success: true,
      data: exceptions,
      meta: {
        total: exceptions.length,
        control_id: controlId
      }
    });

  } catch (error) {
    console.error('Error in GET /api/grc/exceptions:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch control exceptions',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/grc/exceptions - Create new control exception
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
    const requiredFields = ['control_id', 'exception_type', 'reason_en', 'start_date'];
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

    // Validate exception_type
    const validExceptionTypes = ['temporary', 'permanent', 'compensating'];
    if (!validExceptionTypes.includes(body.exception_type)) {
      return NextResponse.json(
        { error: 'Invalid exception_type. Must be one of: ' + validExceptionTypes.join(', ') },
        { status: 400 }
      );
    }

    // Validate dates
    const startDate = new Date(body.start_date);
    if (isNaN(startDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid start_date format' },
        { status: 400 }
      );
    }

    if (body.end_date) {
      const endDate = new Date(body.end_date);
      if (isNaN(endDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid end_date format' },
          { status: 400 }
        );
      }
      
      if (endDate <= startDate) {
        return NextResponse.json(
          { error: 'end_date must be after start_date' },
          { status: 400 }
        );
      }
    }

    const exception = await grcService.createControlException(tenantId, body, userId || undefined);

    return NextResponse.json({
      success: true,
      data: exception,
      message: 'Control exception created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/grc/exceptions:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create control exception',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
