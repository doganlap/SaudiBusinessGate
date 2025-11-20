import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit } from '@/lib/middleware/rate-limit';
import { SolutionService } from '@/lib/services/solution.service';

export const GET = withRateLimit(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const tenantId = request.headers.get('x-tenant-id') || request.headers.get('tenant-id') || 'default';
    
    const suggestions = await SolutionService.suggestModules(tenantId, id);
    
    return NextResponse.json({
      success: true,
      data: suggestions,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate suggestions',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
});

