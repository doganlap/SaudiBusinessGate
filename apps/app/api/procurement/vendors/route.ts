import { NextRequest, NextResponse } from 'next/server';

interface Vendor {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  category: string;
  status: 'active' | 'inactive' | 'pending' | 'blacklisted';
  rating: number;
  totalOrders: number;
  totalValue: number;
  lastOrder: string;
  paymentTerms: string;
  deliveryTime: string;
  notes: string;
}

const mockVendors: Vendor[] = [
  {
    id: '1', name: 'Office Supplies Inc', contactPerson: 'John Smith', 
    email: 'john@officesupplies.com', phone: '+1-555-0123', address: '123 Business Ave',
    city: 'New York', country: 'USA', category: 'Office Supplies', status: 'active',
    rating: 4.5, totalOrders: 45, totalValue: 125000, lastOrder: '2024-01-10',
    paymentTerms: 'Net 30', deliveryTime: '3-5 days', notes: 'Reliable supplier'
  },
  {
    id: '2', name: 'Tech Equipment Co', contactPerson: 'Sarah Johnson',
    email: 'sarah@techequip.com', phone: '+1-555-0456', address: '456 Tech Blvd',
    city: 'San Francisco', country: 'USA', category: 'IT Equipment', status: 'active',
    rating: 4.8, totalOrders: 28, totalValue: 350000, lastOrder: '2024-01-08',
    paymentTerms: 'Net 15', deliveryTime: '1-2 weeks', notes: 'Premium quality'
  },
  {
    id: '3', name: 'Furniture Solutions', contactPerson: 'Mike Chen',
    email: 'mike@furniture.com', phone: '+1-555-0789', address: '789 Design St',
    city: 'Chicago', country: 'USA', category: 'Furniture', status: 'active',
    rating: 4.2, totalOrders: 15, totalValue: 85000, lastOrder: '2024-01-05',
    paymentTerms: 'Net 45', deliveryTime: '2-3 weeks', notes: 'Custom designs available'
  },
  {
    id: '4', name: 'Cleaning Services Pro', contactPerson: 'Lisa Anderson',
    email: 'lisa@cleanpro.com', phone: '+1-555-0321', address: '321 Service Rd',
    city: 'Boston', country: 'USA', category: 'Services', status: 'pending',
    rating: 0, totalOrders: 0, totalValue: 0, lastOrder: '',
    paymentTerms: 'Net 30', deliveryTime: 'Same day', notes: 'New vendor evaluation'
  }
];

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('tenant-id') || 'default-tenant';
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    let filteredVendors = mockVendors;
    if (status && status !== 'all') {
      filteredVendors = mockVendors.filter(vendor => vendor.status === status);
    }
    
    const totalVendors = mockVendors.length;
    const activeVendors = mockVendors.filter(v => v.status === 'active').length;
    const totalValue = mockVendors.reduce((sum, v) => sum + v.totalValue, 0);
    const avgRating = mockVendors.filter(v => v.rating > 0).reduce((sum, v) => sum + v.rating, 0) / 
                     mockVendors.filter(v => v.rating > 0).length || 0;
    
    return NextResponse.json({
      success: true,
      vendors: filteredVendors,
      summary: {
        totalVendors,
        activeVendors,
        totalValue,
        avgRating: Math.round(avgRating * 10) / 10
      }
    });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch vendors' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = request.headers.get('tenant-id') || 'default-tenant';
    const body = await request.json();
    
    const newVendor: Vendor = {
      id: Date.now().toString(),
      ...body,
      status: 'pending',
      rating: 0,
      totalOrders: 0,
      totalValue: 0,
      lastOrder: ''
    };
    
    mockVendors.push(newVendor);
    
    return NextResponse.json({
      success: true,
      vendor: newVendor,
      message: 'Vendor created successfully'
    });
  } catch (error) {
    console.error('Error creating vendor:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create vendor' },
      { status: 500 }
    );
  }
}
