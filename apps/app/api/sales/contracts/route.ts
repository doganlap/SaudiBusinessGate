import { NextRequest, NextResponse } from 'next/server';
import { ContractsOrdersService } from '@/lib/services/contracts-orders.service';

export async function GET(req: NextRequest) {
  const tenantId = req.headers.get('tenant-id');
  if (!tenantId) {
    return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 });
  }

  try {
    const contracts = await ContractsOrdersService.getContracts(tenantId);
    return NextResponse.json({ contracts });
  } catch (error) {
    console.error('Error fetching contracts:', error);
    return NextResponse.json({ error: 'Failed to fetch contracts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const tenantId = req.headers.get('tenant-id');
  if (!tenantId) {
    return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const newContract = await ContractsOrdersService.createContract(tenantId, body);
    return NextResponse.json(newContract, { status: 201 });
  } catch (error) {
    console.error('Error creating contract:', error);
    return NextResponse.json({ error: 'Failed to create contract' }, { status: 500 });
  }
}