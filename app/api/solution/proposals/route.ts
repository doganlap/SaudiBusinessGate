import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit } from '@/lib/middleware/rate-limit';
import { SolutionService } from '@/lib/services/solution.service';
import { multiLayerCache } from '@/lib/services/multi-layer-cache.service';

export const GET = withRateLimit(async (request: NextRequest) => {
  try {
    const tenantId = request.headers.get('x-tenant-id') || request.headers.get('tenant-id') || 'default';
    const { searchParams } = new URL(request.url);
    const rfpId = searchParams.get('rfp_id') || undefined;
    
    const proposals = await SolutionService.getProposals(tenantId, rfpId);
    
    return NextResponse.json({
      success: true,
      data: proposals,
      total: proposals.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching proposals:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch proposals',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
});

export const POST = withRateLimit(async (request: NextRequest) => {
  try {
    const tenantId = request.headers.get('x-tenant-id') || request.headers.get('tenant-id') || 'default';
    const body = await request.json();
    
    const { rfp_id, solution_design_id, title, content_blocks, pricing, compliance, localization, status } = body;
    
    if (!rfp_id || !solution_design_id || !title) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: rfp_id, solution_design_id, title'
      }, { status: 400 });
    }
    
    const proposal = await SolutionService.createProposal(tenantId, rfp_id, solution_design_id, {
      title,
      content_blocks: content_blocks || [],
      pricing,
      compliance,
      localization,
      status: status || 'draft'
    });
    
    // Clear cache
    await multiLayerCache.invalidatePattern(`solution:*:${tenantId}:*`);
    
    // Update RFP status
    await SolutionService.updateRFP(tenantId, rfp_id, { status: 'proposal' });
    
    return NextResponse.json({
      success: true,
      data: proposal,
      message: 'Proposal created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating proposal:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create proposal',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
});

