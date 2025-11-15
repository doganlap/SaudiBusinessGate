/**
 * GRC Frameworks API Endpoints
 * Regulatory frameworks management (NCA, SAMA, PDPL, ISO, etc.)
 */

import { NextRequest, NextResponse } from 'next/server';
import { GRCService } from '@/lib/services/grc.service';

const grcService = new GRCService();

// GET /api/grc/frameworks - List all frameworks
export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id');
    
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID is required' },
        { status: 400 }
      );
    }

    const frameworks = await grcService.getFrameworks(tenantId);

    return NextResponse.json({
      success: true,
      data: frameworks,
      meta: {
        total: frameworks.length
      }
    });

  } catch (error) {
    console.error('Error in GET /api/grc/frameworks:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch frameworks',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
