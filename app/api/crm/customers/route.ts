import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/connection';
import { getServerSession } from 'next-auth/next';

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

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const tier = searchParams.get('tier');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Get tenant ID from session or header
    const tenantId = request.headers.get('x-tenant-id') || (session.user as any).tenantId;

    // Build query with filters
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (tenantId) {
      whereClause += ` AND tenant_id = $${paramIndex++}`;
      params.push(tenantId);
    }

    if (status) {
      whereClause += ` AND status = $${paramIndex++}`;
      params.push(status);
    }

    if (tier) {
      whereClause += ` AND tier = $${paramIndex++}`;
      params.push(tier);
    }

    // Try to fetch from database (customers table)
    try {
      const customersQuery = `
        SELECT 
          id, name, company, email, phone, address, city, country, 
          industry, status, tier, total_value, last_order, 
          created_at, assigned_to, notes, tenant_id
        FROM customers
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
      `;
      params.push(limit, offset);

      const result = await query(customersQuery, params);
      const customers = result.rows.map((row: any) => ({
        id: row.id.toString(),
        name: row.name || '',
        company: row.company || '',
        email: row.email || '',
        phone: row.phone || '',
        address: row.address || '',
        city: row.city || '',
        country: row.country || 'SA',
        industry: row.industry || '',
        status: row.status || 'prospect',
        tier: row.tier || 'bronze',
        totalValue: Number(row.total_value || 0),
        lastOrder: row.last_order || '',
        createdAt: row.created_at?.toISOString() || new Date().toISOString(),
        assignedTo: row.assigned_to || '',
        notes: row.notes || '',
        tenantId: row.tenant_id || tenantId
      }));

      // Get totals
      const countQuery = `SELECT COUNT(*) as total FROM customers ${whereClause}`;
      const countResult = await query(countQuery, params.slice(0, params.length - 2));
      const total = parseInt(countResult.rows[0]?.total || '0');

      const activeCustomers = customers.filter(c => c.status === 'active').length;
      const totalValue = customers.reduce((sum, c) => sum + c.totalValue, 0);

      return NextResponse.json({
        success: true,
        customers,
        total,
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        },
        summary: {
          totalCustomers: total,
          activeCustomers,
          totalValue,
          avgCustomerValue: total > 0 ? totalValue / total : 0,
          tierDistribution: {
            platinum: customers.filter(c => c.tier === 'platinum').length,
            gold: customers.filter(c => c.tier === 'gold').length,
            silver: customers.filter(c => c.tier === 'silver').length,
            bronze: customers.filter(c => c.tier === 'bronze').length
          }
        }
      });
    } catch (dbError) {
      // If customers table doesn't exist, return empty result
      console.warn('Customers table not found, returning empty result:', dbError);
      return NextResponse.json({
        success: true,
        customers: [],
        total: 0,
        pagination: { page, limit, totalPages: 0 },
        summary: {
          totalCustomers: 0,
          activeCustomers: 0,
          totalValue: 0,
          avgCustomerValue: 0,
          tierDistribution: { platinum: 0, gold: 0, silver: 0, bronze: 0 }
        }
      });
    }
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
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = request.headers.get('x-tenant-id') || (session.user as any).tenantId;
    const body = await request.json();
    
    const {
      name,
      company,
      email,
      phone,
      address,
      city,
      country = 'SA',
      industry,
      status = 'prospect',
      tier = 'bronze',
      assignedTo,
      notes
    } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    try {
      const insertQuery = `
        INSERT INTO customers (
          tenant_id, name, company, email, phone, address, city, country,
          industry, status, tier, assigned_to, notes, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
        RETURNING id, name, company, email, phone, address, city, country,
          industry, status, tier, total_value, last_order,
          created_at, assigned_to, notes, tenant_id
      `;

      const result = await query(insertQuery, [
        tenantId,
        name || '',
        company || '',
        email,
        phone || '',
        address || '',
        city || '',
        country,
        industry || '',
        status,
        tier,
        assignedTo || '',
        notes || ''
      ]);

      const newCustomer = {
        id: result.rows[0].id.toString(),
        name: result.rows[0].name || '',
        company: result.rows[0].company || '',
        email: result.rows[0].email,
        phone: result.rows[0].phone || '',
        address: result.rows[0].address || '',
        city: result.rows[0].city || '',
        country: result.rows[0].country || 'SA',
        industry: result.rows[0].industry || '',
        status: result.rows[0].status || 'prospect',
        tier: result.rows[0].tier || 'bronze',
        totalValue: Number(result.rows[0].total_value || 0),
        lastOrder: result.rows[0].last_order || '',
        createdAt: result.rows[0].created_at?.toISOString() || new Date().toISOString(),
        assignedTo: result.rows[0].assigned_to || '',
        notes: result.rows[0].notes || '',
        tenantId: result.rows[0].tenant_id || tenantId
      };

      return NextResponse.json({
        success: true,
        customer: newCustomer,
        message: 'Customer created successfully'
      }, { status: 201 });
    } catch (dbError: any) {
      if (dbError.code === '42P01') {
        // Table doesn't exist
        return NextResponse.json(
          { success: false, error: 'Customers table not found. Please run database migrations.' },
          { status: 503 }
        );
      }
      if (dbError.code === '23505') {
        // Unique constraint violation
        return NextResponse.json(
          { success: false, error: 'Customer with this email already exists' },
          { status: 409 }
        );
      }
      throw dbError;
    }
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = request.headers.get('x-tenant-id') || (session.user as any).tenantId;
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    try {
      // Delete customer from database
      const deleteQuery = `DELETE FROM customers WHERE id = $1 AND tenant_id = $2`;
      const result = await query(deleteQuery, [body.id, tenantId]);

      if (result.rowCount === 0) {
        return NextResponse.json(
          { success: false, error: 'Customer not found or already deleted' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { success: true, message: 'Customer deleted successfully' },
        { 
          status: 200,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
            'Pragma': 'no-cache'
          }
        }
      );
    } catch (dbError: any) {
      if (dbError.code === '42P01') {
        return NextResponse.json(
          { success: false, error: 'Customers table not found' },
          { status: 503 }
        );
      }
      throw dbError;
    }
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete customer' },
      { status: 500 }
    );
  }
}
