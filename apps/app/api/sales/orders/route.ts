import { NextRequest, NextResponse } from 'next/server';
import { ContractsOrdersService } from '@/lib/services/contracts-orders.service';

export async function GET(req: NextRequest) {
  const tenantId = req.headers.get('tenant-id');
  if (!tenantId) {
    return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 });
  }

  try {
    const orders = await ContractsOrdersService.getOrders(tenantId);
    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const tenantId = req.headers.get('tenant-id');
  if (!tenantId) {
    return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const newOrder = await ContractsOrdersService.createOrder(tenantId, body);
    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}