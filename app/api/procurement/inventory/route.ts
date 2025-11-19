import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/connection';
import { getServerSession } from 'next-auth/next';

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  description: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unitPrice: number;
  totalValue: number;
  location: string;
  supplier: string;
  lastRestocked: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'overstocked';
  movementType: 'fast' | 'medium' | 'slow';
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
    const category = searchParams.get('category');

    try {
      let whereClause = 'WHERE tenant_id = $1';
      const params: any[] = [tenantId];
      let paramIndex = 2;

      if (category) {
        whereClause += ` AND category = $${paramIndex++}`;
        params.push(category);
      }

      const result = await query(`
        SELECT 
          id, item_code, item_name, item_name_ar, category, subcategory,
          unit_of_measure, description, sku, barcode,
          current_stock, min_stock_level, max_stock_level, reorder_point,
          unit_cost, selling_price, currency, location, status, vendor_id
        FROM inventory_items
        ${whereClause}
        ORDER BY item_name
      `, params);

      // Get vendor names and last restocked date
      const inventory: InventoryItem[] = await Promise.all(result.rows.map(async (row: any) => {
        let vendorName = '';
        let lastRestocked = '';

        if (row.vendor_id) {
          const vendorResult = await query('SELECT vendor_name FROM vendors WHERE id = $1', [row.vendor_id]);
          vendorName = vendorResult.rows[0]?.vendor_name || '';
        }

        // Get last receiving note date
        const receivingResult = await query(`
          SELECT MAX(rn.receiving_date) as last_restocked
          FROM receiving_notes rn
          JOIN receiving_note_items rni ON rn.id = rni.receiving_note_id
          WHERE rni.inventory_item_id = $1 AND rn.tenant_id = $2
        `, [row.id, tenantId]);
        lastRestocked = receivingResult.rows[0]?.last_restocked 
          ? new Date(receivingResult.rows[0].last_restocked).toISOString().split('T')[0]
          : '';

        // Determine status
        let status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'overstocked' = 'in-stock';
        if (row.current_stock === 0) {
          status = 'out-of-stock';
        } else if (row.current_stock <= row.min_stock_level) {
          status = 'low-stock';
        } else if (row.max_stock_level && row.current_stock > row.max_stock_level) {
          status = 'overstocked';
        }

        // Determine movement type (simplified - would need historical data)
        const movementType: 'fast' | 'medium' | 'slow' = 
          row.current_stock < row.min_stock_level * 2 ? 'fast' :
          row.current_stock > row.max_stock_level * 0.8 ? 'slow' : 'medium';

        return {
          id: row.id.toString(),
          sku: row.item_code || row.sku || '',
          name: row.item_name_ar || row.item_name,
          category: row.category || '',
          description: row.description || '',
          currentStock: Number(row.current_stock || 0),
          minStock: Number(row.min_stock_level || 0),
          maxStock: Number(row.max_stock_level || 0),
          unitPrice: Number(row.unit_cost || 0),
          totalValue: Number(row.current_stock || 0) * Number(row.unit_cost || 0),
          location: row.location || '',
          supplier: vendorName,
          lastRestocked,
          status,
          movementType
        };
      }));

      // Apply status filter if provided
      let filteredInventory = inventory;
    if (status && status !== 'all') {
        filteredInventory = inventory.filter(item => item.status === status);
    }
    
      const totalItems = inventory.length;
      const totalValue = inventory.reduce((sum, item) => sum + item.totalValue, 0);
      const lowStockItems = inventory.filter(item => item.status === 'low-stock' || item.status === 'out-of-stock').length;
      const inStockItems = inventory.filter(item => item.status === 'in-stock').length;
    
    return NextResponse.json({
      success: true,
      inventory: filteredInventory,
      summary: {
        totalItems,
        totalValue,
        lowStockItems,
        inStockItems,
          stockRate: totalItems > 0 ? Math.round((inStockItems / totalItems) * 100) : 0
        },
        source: 'database'
      });
    } catch (error: any) {
      if (error.code === '42P01') {
        return NextResponse.json({
          success: true,
          inventory: [],
          summary: {
            totalItems: 0,
            totalValue: 0,
            lowStockItems: 0,
            inStockItems: 0,
            stockRate: 0
          },
          source: 'empty'
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch inventory' },
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
      item_name, item_name_ar, category, subcategory, unit_of_measure,
      description, sku, current_stock, min_stock_level, max_stock_level,
      unit_cost, selling_price, location, vendor_id
    } = body;

    if (!item_name) {
      return NextResponse.json(
        { success: false, error: 'item_name is required' },
        { status: 400 }
      );
    }

    // Generate item code
    const countResult = await query('SELECT COUNT(*) as count FROM inventory_items WHERE tenant_id = $1', [tenantId]);
    const count = parseInt(countResult.rows[0]?.count || '0');
    const itemCode = `INV-${String(count + 1).padStart(3, '0')}`;

    try {
      const result = await query(`
        INSERT INTO inventory_items (
          tenant_id, item_code, item_name, item_name_ar, category, subcategory,
          unit_of_measure, description, sku, current_stock, min_stock_level,
          max_stock_level, unit_cost, selling_price, currency, location, status, vendor_id, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW())
        RETURNING id, item_code, item_name, item_name_ar, category, current_stock,
          min_stock_level, max_stock_level, unit_cost, location, status
      `, [
        tenantId, itemCode, item_name, item_name_ar || item_name, category || '',
        subcategory || '', unit_of_measure || 'piece', description || '', sku || itemCode,
        current_stock || 0, min_stock_level || 0, max_stock_level || 0,
        unit_cost || 0, selling_price || 0, 'SAR', location || '', 'active', vendor_id || null
      ]);
    
    const newItem: InventoryItem = {
        id: result.rows[0].id.toString(),
        sku: result.rows[0].item_code,
        name: result.rows[0].item_name_ar || result.rows[0].item_name,
        category: result.rows[0].category || '',
        description: description || '',
        currentStock: Number(result.rows[0].current_stock || 0),
        minStock: Number(result.rows[0].min_stock_level || 0),
        maxStock: Number(result.rows[0].max_stock_level || 0),
        unitPrice: Number(result.rows[0].unit_cost || 0),
        totalValue: Number(result.rows[0].current_stock || 0) * Number(result.rows[0].unit_cost || 0),
        location: result.rows[0].location || '',
        supplier: '',
        lastRestocked: '',
        status: result.rows[0].current_stock === 0 ? 'out-of-stock' :
                result.rows[0].current_stock <= result.rows[0].min_stock_level ? 'low-stock' : 'in-stock',
        movementType: 'medium'
      };
    
    return NextResponse.json({
      success: true,
      item: newItem,
      message: 'Inventory item created successfully'
      }, { status: 201 });
    } catch (error: any) {
      if (error.code === '42P01') {
        return NextResponse.json(
          { success: false, error: 'Inventory items table not found. Please run database migrations.' },
          { status: 503 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Error creating inventory item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create inventory item' },
      { status: 500 }
    );
  }
}
