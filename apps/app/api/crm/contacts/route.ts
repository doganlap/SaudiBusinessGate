import { NextRequest, NextResponse } from 'next/server';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  location: string;
  type: 'lead' | 'customer' | 'partner' | 'vendor';
  status: 'active' | 'inactive';
  lastContact: string;
  assignedTo: string;
  tags: string[];
  tenantId: string;
}

const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@techcorp.com',
    phone: '+1-555-0123',
    company: 'TechCorp',
    position: 'CTO',
    location: 'San Francisco, CA',
    type: 'customer',
    status: 'active',
    lastContact: '2024-01-15',
    assignedTo: 'Sarah Johnson',
    tags: ['VIP', 'Enterprise'],
    tenantId: 'default-tenant'
  },
  {
    id: '2',
    name: 'Emily Davis',
    email: 'emily@startup.io',
    phone: '+1-555-0456',
    company: 'Startup Inc',
    position: 'CEO',
    location: 'Austin, TX',
    type: 'lead',
    status: 'active',
    lastContact: '2024-01-14',
    assignedTo: 'Mike Chen',
    tags: ['Hot Lead'],
    tenantId: 'default-tenant'
  }
];

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('tenant-id') || 'default-tenant';
    const tenantContacts = mockContacts.filter(contact => contact.tenantId === tenantId);
    
    return NextResponse.json({
      success: true,
      contacts: tenantContacts,
      total: tenantContacts.length,
      summary: {
        totalContacts: tenantContacts.length,
        customers: tenantContacts.filter(c => c.type === 'customer').length,
        leads: tenantContacts.filter(c => c.type === 'lead').length,
        partners: tenantContacts.filter(c => c.type === 'partner').length
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch contacts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = request.headers.get('tenant-id') || 'default-tenant';
    const body = await request.json();
    
    const newContact: Contact = {
      id: Date.now().toString(),
      ...body,
      tenantId,
      lastContact: new Date().toISOString().split('T')[0],
      status: 'active'
    };
    
    mockContacts.push(newContact);
    
    return NextResponse.json({
      success: true,
      contact: newContact,
      message: 'Contact created successfully'
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create contact' }, { status: 500 });
  }
}
