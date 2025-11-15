import { NextRequest, NextResponse } from 'next/server';

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

const mockInventory: InventoryItem[] = [
  {
    id: '1', sku: 'OFF-001', name: 'Office Chairs', category: 'Furniture',
    description: 'Ergonomic office chairs with lumbar support', currentStock: 25, minStock: 10, maxStock: 50,
    unitPrice: 299, totalValue: 7475, location: 'Warehouse A', supplier: 'Furniture Solutions',
    lastRestocked: '2024-01-05', status: 'in-stock', movementType: 'medium'
  },
  {
    id: '2', sku: 'IT-002', name: 'Laptops', category: 'IT Equipment',
    description: 'Business laptops for development team', currentStock: 3, minStock: 5, maxStock: 20,
    unitPrice: 1299, totalValue: 3897, location: 'IT Storage', supplier: 'Tech Equipment Co',
    lastRestocked: '2024-01-10', status: 'low-stock', movementType: 'fast'
  },
  {
    id: '3', sku: 'SUP-003', name: 'Printer Paper', category: 'Office Supplies',
    description: 'A4 white printer paper, 500 sheets per pack', currentStock: 0, minStock: 20, maxStock: 100,
    unitPrice: 8, totalValue: 0, location: 'Supply Room', supplier: 'Office Supplies Inc',
    lastRestocked: '2023-12-15', status: 'out-of-stock', movementType: 'fast'
  },
  {
    id: '4', sku: 'OFF-004', name: 'Desk Lamps', category: 'Furniture',
    description: 'LED desk lamps with adjustable brightness', currentStock: 45, minStock: 15, maxStock: 30,
    unitPrice: 89, totalValue: 4005, location: 'Warehouse A', supplier: 'Furniture Solutions',
    lastRestocked: '2024-01-08', status: 'overstocked', movementType: 'slow'
  },
  {
    id: '5', sku: 'IT-005', name: 'Monitors', category: 'IT Equipment',
    description: '24-inch LED monitors for workstations', currentStock: 18, minStock: 10, maxStock: 25,
    unitPrice: 249, totalValue: 4482, location: 'IT Storage', supplier: 'Tech Equipment Co',
    lastRestocked: '2024-01-12', status: 'in-stock', movementType: 'medium'
  }
];

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('tenant-id') || 'default-tenant';
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    let filteredInventory = mockInventory;
    if (status && status !== 'all') {
      filteredInventory = mockInventory.filter(item => item.status === status);
    }
    
    const totalItems = mockInventory.length;
    const totalValue = mockInventory.reduce((sum, item) => sum + item.totalValue, 0);
    const lowStockItems = mockInventory.filter(item => item.status === 'low-stock' || item.status === 'out-of-stock').length;
    const inStockItems = mockInventory.filter(item => item.status === 'in-stock').length;
    
    return NextResponse.json({
      success: true,
      inventory: filteredInventory,
      summary: {
        totalItems,
        totalValue,
        lowStockItems,
        inStockItems,
        stockRate: Math.round((inStockItems / totalItems) * 100)
      }
    });
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
    const tenantId = request.headers.get('tenant-id') || 'default-tenant';
    const body = await request.json();
    
    const newItem: InventoryItem = {
      id: Date.now().toString(),
      ...body,
      totalValue: body.currentStock * body.unitPrice,
      status: body.currentStock <= body.minStock ? 'low-stock' : 
              body.currentStock === 0 ? 'out-of-stock' :
              body.currentStock > body.maxStock ? 'overstocked' : 'in-stock',
      lastRestocked: new Date().toISOString().split('T')[0]
    };
    
    mockInventory.push(newItem);
    
    return NextResponse.json({
      success: true,
      item: newItem,
      message: 'Inventory item created successfully'
    });
  } catch (error) {
    console.error('Error creating inventory item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create inventory item' },
      { status: 500 }
    );
  }
}
