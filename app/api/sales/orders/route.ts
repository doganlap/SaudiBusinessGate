import { NextRequest, NextResponse } from 'next/server';
import { ContractsOrdersService } from '@/lib/services/contracts-orders.service';

export async function GET(req: NextRequest) {
  try {
    const tenantId = req.headers.get('x-tenant-id') || req.headers.get('tenant-id') || 'default';
    
    const { searchParams } = new URL(req.url);
    const filters = {
      status: searchParams.get('status') || undefined,
      quote_id: searchParams.get('quote_id') ? parseInt(searchParams.get('quote_id')!) : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
    };

    const orders = await ContractsOrdersService.getOrders(tenantId, filters);
    
    return NextResponse.json({
      success: true,
      data: orders,
      total: orders.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch orders',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const tenantId = req.headers.get('x-tenant-id') || req.headers.get('tenant-id') || 'default';
    const body = await req.json();
    
    // Validate required fields
    const requiredFields = ['customer_id', 'order_number', 'quote_id'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({
          success: false,
          error: `Missing required field: ${field}`
        }, { status: 400 });
      }
    }
    
    const newOrder = await ContractsOrdersService.createOrder(tenantId, body);
    return NextResponse.json({
      success: true,
      data: newOrder,
      message: 'Order created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create order',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}