import { NextRequest, NextResponse } from 'next/server';

interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  industry: string;
  status: 'active' | 'inactive' | 'prospect' | 'churned';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  totalValue: number;
  lastOrder: string;
  createdAt: string;
  assignedTo: string;
  notes: string;
  tenantId: string;
}

const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'John Smith',
    company: 'TechCorp Solutions',
    email: 'john.smith@techcorp.com',
    phone: '+1 (555) 123-4567',
    address: '123 Business Ave',
    city: 'San Francisco',
    country: 'USA',
    industry: 'Technology',
    status: 'active',
    tier: 'gold',
    totalValue: 250000,
    lastOrder: '2024-01-10',
    createdAt: '2023-06-15T10:00:00Z',
    assignedTo: 'Sarah Johnson',
    notes: 'Key enterprise customer, high satisfaction',
    tenantId: 'default-tenant'
  },
  {
    id: '2',
    name: 'Emily Davis',
    company: 'Innovate.io',
    email: 'emily.davis@innovate.io',
    phone: '+1 (555) 987-6543',
    address: '456 Innovation Blvd',
    city: 'Austin',
    country: 'USA',
    industry: 'Software',
    status: 'active',
    tier: 'silver',
    totalValue: 125000,
    lastOrder: '2024-01-08',
    createdAt: '2023-09-20T09:15:00Z',
    assignedTo: 'Mike Chen',
    notes: 'Growing startup, potential for upsell',
    tenantId: 'default-tenant'
  },
  {
    id: '3',
    name: 'Robert Wilson',
    company: 'Global Manufacturing',
    email: 'r.wilson@globalmfg.com',
    phone: '+1 (555) 456-7890',
    address: '789 Industrial Way',
    city: 'Detroit',
    country: 'USA',
    industry: 'Manufacturing',
    status: 'prospect',
    tier: 'bronze',
    totalValue: 0,
    lastOrder: '',
    createdAt: '2024-01-15T14:45:00Z',
    assignedTo: 'Alex Rodriguez',
    notes: 'New prospect, evaluating our solutions',
    tenantId: 'default-tenant'
  }
];

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('tenant-id') || 'default-tenant';
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const tier = searchParams.get('tier');
    
    let tenantCustomers = mockCustomers.filter(customer => customer.tenantId === tenantId);
    
    if (status) {
      tenantCustomers = tenantCustomers.filter(customer => customer.status === status);
    }
    
    if (tier) {
      tenantCustomers = tenantCustomers.filter(customer => customer.tier === tier);
    }
    
    const totalCustomers = tenantCustomers.length;
    const activeCustomers = tenantCustomers.filter(c => c.status === 'active').length;
    const totalValue = tenantCustomers.reduce((sum, c) => sum + c.totalValue, 0);
    
    return NextResponse.json({
      success: true,
      customers: tenantCustomers,
      total: totalCustomers,
      summary: {
        totalCustomers,
        activeCustomers,
        totalValue,
        avgCustomerValue: totalValue / totalCustomers || 0,
        tierDistribution: {
          platinum: tenantCustomers.filter(c => c.tier === 'platinum').length,
          gold: tenantCustomers.filter(c => c.tier === 'gold').length,
          silver: tenantCustomers.filter(c => c.tier === 'silver').length,
          bronze: tenantCustomers.filter(c => c.tier === 'bronze').length
        }
      }
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = request.headers.get('tenant-id') || 'default-tenant';
    const body = await request.json();
    
    const newCustomer: Customer = {
      id: Date.now().toString(),
      ...body,
      tenantId,
      createdAt: new Date().toISOString(),
      status: 'prospect',
      tier: 'bronze',
      totalValue: 0,
      lastOrder: ''
    };
    
    mockCustomers.push(newCustomer);
    
    return NextResponse.json({
      success: true,
      customer: newCustomer,
      message: 'Customer created successfully'
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}
