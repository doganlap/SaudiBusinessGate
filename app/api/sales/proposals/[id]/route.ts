import { NextRequest, NextResponse } from 'next/server';
import { ProposalsService } from '@/lib/services/proposals.service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const tenantId = req.headers.get('x-tenant-id') || req.headers.get('tenant-id') || 'default';

  try {
    const proposal = await ProposalsService.getProposalById(tenantId, id);
    if (!proposal) {
      return NextResponse.json({
        success: false,
        error: 'Proposal not found'
      }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      data: proposal,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching proposal:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch proposal',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const tenantId = req.headers.get('x-tenant-id') || req.headers.get('tenant-id') || 'default';

  try {
    const body = await req.json();
    const updatedProposal = await ProposalsService.updateProposal(tenantId, id, body);
    if (!updatedProposal) {
      return NextResponse.json({
        success: false,
        error: 'Proposal not found'
      }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      data: updatedProposal,
      message: 'Proposal updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating proposal:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update proposal',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const tenantId = req.headers.get('x-tenant-id') || req.headers.get('tenant-id') || 'default';

  try {
    const deleted = await ProposalsService.deleteProposal(tenantId, id);
    if (!deleted) {
      return NextResponse.json({
        success: false,
        error: 'Proposal not found'
      }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      message: 'Proposal deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error deleting proposal:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete proposal',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}