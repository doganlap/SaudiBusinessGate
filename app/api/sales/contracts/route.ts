import { NextRequest, NextResponse } from 'next/server';
import { ContractsOrdersService } from '@/lib/services/contracts-orders.service';

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

    const contracts = await ContractsOrdersService.getContracts(tenantId, filters);
    
    return NextResponse.json({
      success: true,
      data: contracts,
      total: contracts.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching contracts:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch contracts',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const tenantId = req.headers.get('x-tenant-id') || req.headers.get('tenant-id') || 'default';
    const body = await req.json();
    
    // Validate required fields
    const requiredFields = ['deal_id', 'contract_number', 'start_date', 'end_date'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({
          success: false,
          error: `Missing required field: ${field}`
        }, { status: 400 });
      }
    }
    
    const newContract = await ContractsOrdersService.createContract(tenantId, body);
    return NextResponse.json({
      success: true,
      data: newContract,
      message: 'Contract created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating contract:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create contract',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}