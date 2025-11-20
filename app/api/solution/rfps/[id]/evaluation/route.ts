import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit } from '@/lib/middleware/rate-limit';
import { SolutionService } from '@/lib/services/solution.service';

export const GET = withRateLimit(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const tenantId = request.headers.get('x-tenant-id') || request.headers.get('tenant-id') || 'default';
    
    const rfp = await SolutionService.getRFPById(tenantId, id);
    
    if (!rfp) {
      return NextResponse.json({
        success: false,
        error: 'RFP not found'
      }, { status: 404 });
    }

    // Calculate detailed evaluation breakdown
    let strategicFit = 0;
    let revenuePotential = 0;
    let deliveryComplexity = 0;
    let timelineFeasibility = 0;

    // Strategic Fit (0-30)
    if (rfp.sector) strategicFit += 10;
    if (rfp.tags && rfp.tags.length > 0) strategicFit += 10;
    if (rfp.client_industry) strategicFit += 10;

    // Revenue Potential (0-30)
    if (rfp.client_name && rfp.client_name.length > 0) revenuePotential += 15;
    if (rfp.client_industry) revenuePotential += 15;

    // Delivery Complexity (0-20) - Inverse: lower complexity = higher score
    const complexity = rfp.description?.length || 0;
    if (complexity < 1000) deliveryComplexity = 20;
    else if (complexity < 5000) deliveryComplexity = 10;

    // Timeline Feasibility (0-20)
    if (rfp.submission_deadline) {
      const deadline = new Date(rfp.submission_deadline);
      const now = new Date();
      const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntilDeadline > 30) timelineFeasibility = 20;
      else if (daysUntilDeadline > 14) timelineFeasibility = 10;
    }

    const totalScore = strategicFit + revenuePotential + deliveryComplexity + timelineFeasibility;
    const winProbability = totalScore * 0.8;

    const evaluation = {
      score: totalScore,
      win_probability: winProbability,
      reasoning: `Strategic fit: ${strategicFit}/30, Revenue potential: ${revenuePotential}/30, Delivery complexity: ${deliveryComplexity}/20, Timeline feasibility: ${timelineFeasibility}/20`,
      breakdown: {
        strategic_fit: strategicFit,
        revenue_potential: revenuePotential,
        delivery_complexity: deliveryComplexity,
        timeline_feasibility: timelineFeasibility
      }
    };
    
    return NextResponse.json({
      success: true,
      data: evaluation
    });
  } catch (error) {
    console.error('Error fetching evaluation:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch evaluation',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
});

