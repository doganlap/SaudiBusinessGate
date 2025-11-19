import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/connection';
import { getServerSession } from 'next-auth/next';

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

    if (status && status !== 'all') {
        whereClause += ` AND status = $${paramIndex++}`;
        params.push(status);
      }

      const result = await query(`
        SELECT 
          id, vendor_code, vendor_name, vendor_name_ar, vendor_type,
          contact_person, email, phone, address, city, country,
          tax_id, commercial_registration, payment_terms, status, rating,
          created_at
        FROM vendors
        ${whereClause}
        ORDER BY created_at DESC
      `, params);

      // Get order statistics for each vendor
      const vendors: Vendor[] = await Promise.all(result.rows.map(async (row: any) => {
        const orderStats = await query(`
          SELECT 
            COUNT(*) as total_orders,
            COALESCE(SUM(total_amount), 0) as total_value,
            MAX(order_date) as last_order_date
          FROM purchase_orders
          WHERE vendor_id = $1 AND tenant_id = $2
        `, [row.id, tenantId]);

        const stats = orderStats.rows[0] || { total_orders: 0, total_value: 0, last_order_date: null };

        return {
          id: row.id.toString(),
          name: row.vendor_name_ar || row.vendor_name,
          contactPerson: row.contact_person || '',
          email: row.email || '',
          phone: row.phone || '',
          address: row.address || '',
          city: row.city || '',
          country: row.country || 'SA',
          category: row.vendor_type || '',
          status: (row.status || 'pending') as 'active' | 'inactive' | 'pending' | 'blacklisted',
          rating: row.rating || 0,
          totalOrders: parseInt(stats.total_orders || '0'),
          totalValue: Number(stats.total_value || 0),
          lastOrder: stats.last_order_date ? new Date(stats.last_order_date).toISOString().split('T')[0] : '',
          paymentTerms: row.payment_terms || '',
          deliveryTime: '',
          notes: ''
        };
      }));

      const activeVendors = vendors.filter(v => v.status === 'active');
      const totalValue = vendors.reduce((sum, v) => sum + v.totalValue, 0);
      const avgRating = vendors.filter(v => v.rating > 0).length > 0
        ? vendors.filter(v => v.rating > 0).reduce((sum, v) => sum + v.rating, 0) / vendors.filter(v => v.rating > 0).length
        : 0;
    
    return NextResponse.json({
      success: true,
        vendors,
      summary: {
          totalVendors: vendors.length,
          activeVendors: activeVendors.length,
        totalValue,
        avgRating: Math.round(avgRating * 10) / 10
        },
        source: 'database'
      });
    } catch (error: any) {
      if (error.code === '42P01') {
        return NextResponse.json({
          success: true,
          vendors: [],
          summary: {
            totalVendors: 0,
            activeVendors: 0,
            totalValue: 0,
            avgRating: 0
          },
          source: 'empty'
        });
      }
      throw error;
    }
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
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = request.headers.get('x-tenant-id') || (session.user as any).tenantId || 'default-tenant';
    const body = await request.json();
    
    const {
      vendor_name, vendor_name_ar, vendor_type, contact_person,
      email, phone, address, city, country = 'SA',
      tax_id, commercial_registration, payment_terms, status = 'pending'
    } = body;

    if (!vendor_name || !email) {
      return NextResponse.json(
        { success: false, error: 'vendor_name and email are required' },
        { status: 400 }
      );
    }

    // Generate vendor code
    const countResult = await query('SELECT COUNT(*) as count FROM vendors WHERE tenant_id = $1', [tenantId]);
    const count = parseInt(countResult.rows[0]?.count || '0');
    const vendorCode = `VEND-${String(count + 1).padStart(3, '0')}`;

    try {
      const result = await query(`
        INSERT INTO vendors (
          tenant_id, vendor_code, vendor_name, vendor_name_ar, vendor_type,
          contact_person, email, phone, address, city, country,
          tax_id, commercial_registration, payment_terms, status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW())
        RETURNING id, vendor_code, vendor_name, vendor_name_ar, vendor_type,
          contact_person, email, phone, address, city, country, status, rating
      `, [
        tenantId, vendorCode, vendor_name, vendor_name_ar || vendor_name, vendor_type || '',
        contact_person || '', email, phone || '', address || '', city || '', country,
        tax_id || '', commercial_registration || '', payment_terms || '', status
      ]);
    
    const newVendor: Vendor = {
        id: result.rows[0].id.toString(),
        name: result.rows[0].vendor_name_ar || result.rows[0].vendor_name,
        contactPerson: result.rows[0].contact_person || '',
        email: result.rows[0].email,
        phone: result.rows[0].phone || '',
        address: result.rows[0].address || '',
        city: result.rows[0].city || '',
        country: result.rows[0].country || 'SA',
        category: result.rows[0].vendor_type || '',
        status: (result.rows[0].status || 'pending') as 'active' | 'inactive' | 'pending' | 'blacklisted',
        rating: result.rows[0].rating || 0,
      totalOrders: 0,
      totalValue: 0,
        lastOrder: '',
        paymentTerms: payment_terms || '',
        deliveryTime: '',
        notes: ''
    };
    
    return NextResponse.json({
      success: true,
      vendor: newVendor,
      message: 'Vendor created successfully'
      }, { status: 201 });
    } catch (error: any) {
      if (error.code === '42P01') {
        return NextResponse.json(
          { success: false, error: 'Vendors table not found. Please run database migrations.' },
          { status: 503 }
        );
      }
      if (error.code === '23505') {
        return NextResponse.json(
          { success: false, error: 'Vendor with this code already exists' },
          { status: 409 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Error creating vendor:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create vendor' },
      { status: 500 }
    );
  }
}
