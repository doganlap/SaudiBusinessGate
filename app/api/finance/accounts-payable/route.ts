import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getPool } from '@/lib/db/connection';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pool = getPool();
    const tenantId = request.headers.get('x-tenant-id') || 'default-tenant';
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const vendorId = searchParams.get('vendorId');

    let query = `
      SELECT 
        id,
        vendor_id,
        vendor_name,
        vendor_email,
        invoice_number,
        invoice_date,
        due_date,
        amount,
        paid_amount,
        balance,
        status,
        category,
        description,
        bill_id,
        created_at,
        updated_at
      FROM accounts_payable
      WHERE tenant_id = $1
    `;

    const params: any[] = [tenantId];

    if (status && status !== 'all') {
      query += ` AND status = $${params.length + 1}`;
      params.push(status);
    }

    if (vendorId) {
      query += ` AND vendor_id = $${params.length + 1}`;
      params.push(vendorId);
    }

    query += ` ORDER BY due_date ASC, created_at DESC`;

    const result = await pool.query(query, params);

    const payables = result.rows.map((row: any) => ({
      id: row.id,
      vendorName: row.vendor_name,
      invoiceNumber: row.invoice_number,
      invoiceDate: row.invoice_date,
      dueDate: row.due_date,
      amount: parseFloat(row.amount || 0),
      paidAmount: parseFloat(row.paid_amount || 0),
      balance: parseFloat(row.balance || 0),
      status: row.status,
      category: row.category || 'Uncategorized',
      description: row.description || ''
    }));

    return NextResponse.json({
      success: true,
      data: payables,
      payables: payables
    });
  } catch (error) {
    console.error('Error fetching accounts payable:', error);
    return NextResponse.json(
      { error: 'Failed to fetch accounts payable', message: error instanceof Error ? error.message : 'Unknown error' },
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

    const pool = getPool();
    const tenantId = request.headers.get('x-tenant-id') || 'default-tenant';
    const body = await request.json();

    const {
      vendor_id,
      vendor_name,
      vendor_email,
      invoice_number,
      invoice_date,
      due_date,
      amount,
      category,
      description,
      bill_id
    } = body;

    // Check if invoice number already exists
    const checkQuery = `SELECT id FROM accounts_payable WHERE tenant_id = $1 AND invoice_number = $2`;
    const checkResult = await pool.query(checkQuery, [tenantId, invoice_number]);
    
    if (checkResult.rows.length > 0) {
      return NextResponse.json(
        { error: 'Invoice number already exists' },
        { status: 400 }
      );
    }

    const query = `
      INSERT INTO accounts_payable (
        tenant_id, vendor_id, vendor_name, vendor_email,
        invoice_number, invoice_date, due_date, amount,
        category, description, bill_id, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

    const result = await pool.query(query, [
      tenantId,
      vendor_id || null,
      vendor_name,
      vendor_email || null,
      invoice_number,
      invoice_date,
      due_date,
      amount,
      category || 'Uncategorized',
      description || '',
      bill_id || null,
      (session.user as any).id || 'system'
    ]);

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Accounts payable entry created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating accounts payable:', error);
    return NextResponse.json(
      { error: 'Failed to create accounts payable', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pool = getPool();
    const tenantId = request.headers.get('x-tenant-id') || 'default-tenant';
    const body = await request.json();
    const { id, paid_amount, status, ...updateFields } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const updateFieldsArray: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (paid_amount !== undefined) {
      updateFieldsArray.push(`paid_amount = $${paramIndex++}`);
      params.push(paid_amount);
    }

    if (status) {
      updateFieldsArray.push(`status = $${paramIndex++}`);
      params.push(status);
    }

    if (updateFieldsArray.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    params.push(id, tenantId);

    const query = `
      UPDATE accounts_payable
      SET ${updateFieldsArray.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex++} AND tenant_id = $${paramIndex++}
      RETURNING *
    `;

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Accounts payable entry not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Accounts payable updated successfully'
    });
  } catch (error) {
    console.error('Error updating accounts payable:', error);
    return NextResponse.json(
      { error: 'Failed to update accounts payable', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

