/**
 * GRC Framework Sections API Endpoints
 * Framework sections/requirements management
 */

import { NextRequest, NextResponse } from 'next/server';
import { GRCService } from '@/lib/services/grc.service';

const grcService = new GRCService();

// GET /api/grc/frameworks/[id]/sections - Get framework sections
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const tenantId = request.headers.get('x-tenant-id');
    
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID is required' },
        { status: 400 }
      );
    }

    const sections = await grcService.getFrameworkSections(tenantId, id);

    return NextResponse.json({
      success: true,
      data: sections,
      meta: {
        framework_id: id,
        total: sections.length
      }
    });

  } catch (error) {
    console.error('Error in GET /api/grc/frameworks/[id]/sections:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch framework sections',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
