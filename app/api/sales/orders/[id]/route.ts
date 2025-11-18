import { NextRequest, NextResponse } from 'next/server';
import { ContractsOrdersService } from '@/lib/services/contracts-orders.service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const tenantId = req.headers.get('x-tenant-id') || req.headers.get('tenant-id') || 'default';

  try {
    const order = await ContractsOrdersService.getOrderById(tenantId, id);
    if (!order) {
      return NextResponse.json({
        success: false,
        error: 'Order not found'
      }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      data: order,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch order',
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
    const updatedOrder = await ContractsOrdersService.updateOrder(tenantId, id, body);
    if (!updatedOrder) {
      return NextResponse.json({
        success: false,
        error: 'Order not found'
      }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      data: updatedOrder,
      message: 'Order updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update order',
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
    const deleted = await ContractsOrdersService.deleteOrder(tenantId, id);
    if (!deleted) {
      return NextResponse.json({
        success: false,
        error: 'Order not found'
      }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      message: 'Order deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete order',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}