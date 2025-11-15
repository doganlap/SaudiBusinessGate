import { NextRequest, NextResponse } from 'next/server';
import { ProposalsService } from '@/lib/services/proposals.service';

export async function GET(req: NextRequest) {
  const tenantId = req.headers.get('tenant-id');
  if (!tenantId) {
    return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 });
  }

  try {
    const proposals = await ProposalsService.getProposals(tenantId);
    return NextResponse.json({ proposals });
  } catch (error) {
    console.error('Error fetching proposals:', error);
    return NextResponse.json({ error: 'Failed to fetch proposals' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const tenantId = req.headers.get('tenant-id');
  if (!tenantId) {
    return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const newProposal = await ProposalsService.createProposal(tenantId, body);
    return NextResponse.json(newProposal, { status: 201 });
  } catch (error) {
    console.error('Error creating proposal:', error);
    return NextResponse.json({ error: 'Failed to create proposal' }, { status: 500 });
  }
}