import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit } from '@/lib/middleware/rate-limit';
import { SolutionService } from '@/lib/services/solution.service';

export const POST = withRateLimit(async (request: NextRequest) => {
  try {
    const tenantId = request.headers.get('x-tenant-id') || request.headers.get('tenant-id') || 'default';
    const body = await request.json();
    
    const { rfp_id, solution_design_id, content_type, language } = body;
    
    if (!rfp_id || !solution_design_id || !content_type) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: rfp_id, solution_design_id, content_type'
      }, { status: 400 });
    }

    const content = await SolutionService.generateProposalContent(
      tenantId,
      rfp_id,
      solution_design_id,
      content_type,
      language || 'en'
    );
    
    return NextResponse.json({
      success: true,
      data: { content },
      message: 'Content generated successfully'
    });
  } catch (error) {
    console.error('Error generating content:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate content',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
});

