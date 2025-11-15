/**
 * GRC Control Test Execution API
 * Execute control tests and record results
 */

import { NextRequest, NextResponse } from 'next/server';
import { GRCService } from '@/lib/services/grc.service';

const grcService = new GRCService();

// POST /api/grc/tests/[id]/execute - Execute control test
export async function POST(
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
    
    // Validate required fields
    if (!body.overall_result) {
      return NextResponse.json(
        { error: 'overall_result is required' },
        { status: 400 }
      );
    }

    // Validate overall_result
    const validResults = ['pass', 'partial', 'fail'];
    if (!validResults.includes(body.overall_result)) {
      return NextResponse.json(
        { error: 'Invalid overall_result. Must be one of: ' + validResults.join(', ') },
        { status: 400 }
      );
    }

    const executionData = {
      sample_results: body.sample_results,
      overall_result: body.overall_result,
      findings: body.findings,
      recommendations_en: body.recommendations_en,
      recommendations_ar: body.recommendations_ar
    };

    const test = await grcService.executeControlTest(
      tenantId, 
      id, 
      executionData, 
      userId || undefined
    );

    return NextResponse.json({
      success: true,
      data: test,
      message: 'Control test executed successfully'
    });

  } catch (error) {
    console.error('Error in POST /api/grc/tests/[id]/execute:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to execute control test',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
