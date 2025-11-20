import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit } from '@/lib/middleware/rate-limit';
import { SolutionService } from '@/lib/services/solution.service';
import { multiLayerCache } from '@/lib/services/multi-layer-cache.service';

export const GET = withRateLimit(async (request: NextRequest) => {
  try {
    const tenantId = request.headers.get('x-tenant-id') || request.headers.get('tenant-id') || 'default';
    const { searchParams } = new URL(request.url);
    const rfpId = searchParams.get('rfp_id') || undefined;
    
    const designs = await SolutionService.getSolutionDesigns(tenantId, rfpId);
    
    return NextResponse.json({
      success: true,
      data: designs,
      total: designs.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching solution designs:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch solution designs',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
});

export const POST = withRateLimit(async (request: NextRequest) => {
  try {
    const tenantId = request.headers.get('x-tenant-id') || request.headers.get('tenant-id') || 'default';
    const body = await request.json();
    
    const { rfp_id, selected_modules, custom_modules, value_propositions, estimated_timeline, complexity_assessment } = body;
    
    if (!rfp_id || !selected_modules || !Array.isArray(selected_modules)) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: rfp_id, selected_modules'
      }, { status: 400 });
    }
    
    const design = await SolutionService.createSolutionDesign(tenantId, rfp_id, {
      selected_modules,
      custom_modules,
      value_propositions,
      estimated_timeline,
      complexity_assessment
    });
    
    // Clear cache
    await multiLayerCache.invalidatePattern(`solution:*:${tenantId}:*`);
    
    // Update RFP status
    await SolutionService.updateRFP(tenantId, rfp_id, { status: 'solution_design' });
    
    return NextResponse.json({
      success: true,
      data: design,
      message: 'Solution design created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating solution design:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create solution design',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
});

