import { NextRequest, NextResponse } from 'next/server';
import { ContractsOrdersService } from '@/lib/services/contracts-orders.service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const tenantId = req.headers.get('x-tenant-id') || req.headers.get('tenant-id') || 'default';

  try {
    const contract = await ContractsOrdersService.getContractById(tenantId, id);
    if (!contract) {
      return NextResponse.json({
        success: false,
        error: 'Contract not found'
      }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      data: contract,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching contract:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch contract',
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
    const updatedContract = await ContractsOrdersService.updateContract(tenantId, id, body);
    if (!updatedContract) {
      return NextResponse.json({
        success: false,
        error: 'Contract not found'
      }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      data: updatedContract,
      message: 'Contract updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating contract:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update contract',
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
    const deleted = await ContractsOrdersService.deleteContract(tenantId, id);
    if (!deleted) {
      return NextResponse.json({
        success: false,
        error: 'Contract not found'
      }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      message: 'Contract deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error deleting contract:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete contract',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}