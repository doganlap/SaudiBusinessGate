import { NextRequest, NextResponse } from 'next/server';
import { ProposalsService } from '@/lib/services/proposals.service';

export async function GET(req: NextRequest) {
  try {
    const tenantId = req.headers.get('x-tenant-id') || req.headers.get('tenant-id') || 'default';
    
    const { searchParams } = new URL(req.url);
    const filters = {
      status: searchParams.get('status') || undefined,
      deal_id: searchParams.get('deal_id') ? parseInt(searchParams.get('deal_id')!) : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
    };

    const proposals = await ProposalsService.getProposals(tenantId, filters);
    
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
}

export async function POST(req: NextRequest) {
  try {
    const tenantId = req.headers.get('x-tenant-id') || req.headers.get('tenant-id') || 'default';
    const body = await req.json();
    
    // Validate required fields
    const requiredFields = ['deal_id', 'proposal_number', 'title', 'content'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({
          success: false,
          error: `Missing required field: ${field}`
        }, { status: 400 });
      }
    }
    
    const newProposal = await ProposalsService.createProposal(tenantId, body);
    return NextResponse.json({
      success: true,
      data: newProposal,
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
}