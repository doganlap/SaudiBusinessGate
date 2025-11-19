import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/connection';
import { getServerSession } from 'next-auth/next';

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

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = request.headers.get('x-tenant-id') || (session.user as any).tenantId || 'default-tenant';
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    try {
      let whereClause = 'WHERE tenant_id = $1';
      const params: any[] = [tenantId];
      let paramIndex = 2;

      if (status) {
        whereClause += ` AND status = $${paramIndex++}`;
        params.push(status);
      }

      const result = await query(`
        SELECT 
          po.id, po.po_number, po.vendor_id, po.vendor_name, po.order_date,
          po.expected_delivery_date, po.delivery_date, po.status, po.total_amount,
          po.created_by, po.approved_by, po.approved_at, po.created_at,
          COUNT(poi.id) as item_count
        FROM purchase_orders po
        LEFT JOIN purchase_order_items poi ON po.id = poi.purchase_order_id
        ${whereClause}
        GROUP BY po.id
        ORDER BY po.order_date DESC
      `, params);

      const orders: PurchaseOrder[] = result.rows.map((row: any) => ({
        id: row.id.toString(),
        orderNumber: row.po_number,
        vendor: row.vendor_name || '',
        description: '',
        totalAmount: Number(row.total_amount || 0),
        status: (row.status || 'draft') as 'draft' | 'pending' | 'approved' | 'ordered' | 'received' | 'cancelled',
        priority: 'medium',
        requestedBy: row.created_by || '',
        approvedBy: row.approved_by || undefined,
        orderDate: row.order_date ? new Date(row.order_date).toISOString().split('T')[0] : '',
        expectedDelivery: row.expected_delivery_date ? new Date(row.expected_delivery_date).toISOString().split('T')[0] : '',
        category: '',
        items: parseInt(row.item_count || '0'),
        tenantId: tenantId
      }));

      const pendingApproval = orders.filter(o => o.status === 'pending').length;
      const completed = orders.filter(o => o.status === 'received').length;
      const totalValue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    
    return NextResponse.json({
      success: true,
        orders,
        total: orders.length,
        summary: {
          totalOrders: orders.length,
          pendingApproval,
          completed,
          totalValue
        },
        source: 'database'
      });
    } catch (error: any) {
      if (error.code === '42P01') {
        return NextResponse.json({
          success: true,
          orders: [],
          total: 0,
      summary: {
            totalOrders: 0,
            pendingApproval: 0,
            completed: 0,
            totalValue: 0
          },
          source: 'empty'
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = request.headers.get('x-tenant-id') || (session.user as any).tenantId || 'default-tenant';
    const body = await request.json();
    
    const {
      vendor_id, vendor_name, order_date, expected_delivery_date,
      items, subtotal, vat_amount, discount_amount, shipping_cost, total_amount
    } = body;

    if (!vendor_id && !vendor_name) {
      return NextResponse.json(
        { success: false, error: 'vendor_id or vendor_name is required' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'items array is required' },
        { status: 400 }
      );
    }

    // Generate PO number
    const countResult = await query('SELECT COUNT(*) as count FROM purchase_orders WHERE tenant_id = $1', [tenantId]);
    const count = parseInt(countResult.rows[0]?.count || '0');
    const poNumber = `PO-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

    try {
      // Create purchase order
      const poResult = await query(`
        INSERT INTO purchase_orders (
          tenant_id, po_number, vendor_id, vendor_name, order_date,
          expected_delivery_date, status, subtotal, vat_amount, discount_amount,
          shipping_cost, total_amount, currency, created_by, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
        RETURNING id, po_number, vendor_name, order_date, status, total_amount
      `, [
        tenantId, poNumber, vendor_id || null, vendor_name || '', order_date || new Date(),
        expected_delivery_date || null, 'draft', subtotal || 0, vat_amount || 0,
        discount_amount || 0, shipping_cost || 0, total_amount || 0, 'SAR',
        (session.user as any).email || 'system'
      ]);

      const poId = poResult.rows[0].id;

      // Insert order items
      for (const item of items) {
        await query(`
          INSERT INTO purchase_order_items (
            purchase_order_id, inventory_item_id, item_description, item_code,
            quantity, unit_price, discount_percent, vat_percent, line_total, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        `, [
          poId, item.inventory_item_id || null, item.description || '',
          item.item_code || '', item.quantity || 0, item.unit_price || 0,
          item.discount_percent || 0, item.vat_percent || 15,
          item.line_total || (item.quantity * item.unit_price)
        ]);
      }
    
    const newOrder: PurchaseOrder = {
        id: poId.toString(),
        orderNumber: poResult.rows[0].po_number,
        vendor: poResult.rows[0].vendor_name,
        description: '',
        totalAmount: Number(poResult.rows[0].total_amount),
      status: 'draft',
        priority: 'medium',
        requestedBy: (session.user as any).email || 'system',
        orderDate: poResult.rows[0].order_date ? new Date(poResult.rows[0].order_date).toISOString().split('T')[0] : '',
        expectedDelivery: expected_delivery_date || '',
        category: '',
        items: items.length,
        tenantId: tenantId
      };
    
    return NextResponse.json({
      success: true,
      order: newOrder,
      message: 'Purchase order created successfully'
      }, { status: 201 });
    } catch (error: any) {
      if (error.code === '42P01') {
        return NextResponse.json(
          { success: false, error: 'Purchase orders table not found. Please run database migrations.' },
          { status: 503 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
