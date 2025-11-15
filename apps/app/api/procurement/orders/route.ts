import { NextRequest, NextResponse } from 'next/server';

interface PurchaseOrder {
  id: string;
  orderNumber: string;
  vendor: string;
  description: string;
  totalAmount: number;
  status: 'draft' | 'pending' | 'approved' | 'ordered' | 'received' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  requestedBy: string;
  approvedBy?: string;
  orderDate: string;
  expectedDelivery: string;
  category: string;
  items: number;
  tenantId: string;
}

const mockOrders: PurchaseOrder[] = [
  {
    id: '1',
    orderNumber: 'PO-2024-001',
    vendor: 'Office Supplies Inc',
    description: 'Monthly office supplies order',
    totalAmount: 2500,
    status: 'approved',
    priority: 'medium',
    requestedBy: 'Sarah Johnson',
    approvedBy: 'John Doe',
    orderDate: '2024-01-15',
    expectedDelivery: '2024-01-22',
    category: 'Office Supplies',
    items: 15,
    tenantId: 'default-tenant'
  },
  {
    id: '2',
    orderNumber: 'PO-2024-002',
    vendor: 'Tech Equipment Co',
    description: 'New laptops for development team',
    totalAmount: 15000,
    status: 'pending',
    priority: 'high',
    requestedBy: 'Mike Chen',
    orderDate: '2024-01-16',
    expectedDelivery: '2024-01-30',
    category: 'IT Equipment',
    items: 5,
    tenantId: 'default-tenant'
  }
];

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('tenant-id') || 'default-tenant';
    const tenantOrders = mockOrders.filter(order => order.tenantId === tenantId);
    
    return NextResponse.json({
      success: true,
      orders: tenantOrders,
      total: tenantOrders.length,
      summary: {
        totalOrders: tenantOrders.length,
        pendingApproval: tenantOrders.filter(o => o.status === 'pending').length,
        completed: tenantOrders.filter(o => o.status === 'received').length,
        totalValue: tenantOrders.reduce((sum, o) => sum + o.totalAmount, 0)
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = request.headers.get('tenant-id') || 'default-tenant';
    const body = await request.json();
    
    const newOrder: PurchaseOrder = {
      id: Date.now().toString(),
      ...body,
      tenantId,
      orderNumber: `PO-${new Date().getFullYear()}-${String(mockOrders.length + 1).padStart(3, '0')}`,
      status: 'draft',
      orderDate: new Date().toISOString().split('T')[0]
    };
    
    mockOrders.push(newOrder);
    
    return NextResponse.json({
      success: true,
      order: newOrder,
      message: 'Purchase order created successfully'
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create order' }, { status: 500 });
  }
}
