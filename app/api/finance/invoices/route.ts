import { NextRequest, NextResponse } from 'next/server';
import { CompleteFinanceService } from '@/lib/services/finance-complete.service';
import { testConnection, getPool } from '@/lib/db/connection';
import { getServerSession } from 'next-auth';
import { AuditLogger } from '@/lib/audit/audit-logger';
import { RBACService } from '@/lib/auth/rbac-service';
import { apiLogger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const pool = getPool();
    const audit = new AuditLogger(pool);
    const rbac = new RBACService(pool);
    const organizationId = (session.user as any).organizationId || 0;
    const userId = (session.user as any).id || 0;
    const allowed = await rbac.checkPermission(userId, 'finance.invoices.read', organizationId);
    if (!allowed) {
      await audit.logPermissionCheck(userId, organizationId, 'finance.invoices.read', false);
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const tenantId = request.headers.get('tenant-id') || String(organizationId);
    const { searchParams } = new URL(request.url);
    
    const filters = {
      status: searchParams.get('status') || undefined,
      customerId: searchParams.get('customerId') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0
    };
    
    // Get invoices from database
    try {
        const invoices = await CompleteFinanceService.getInvoices(tenantId, filters);
        
        await audit.logDataAccess(userId, organizationId, 'invoice', 0, 'read');
        return NextResponse.json({
          success: true,
          data: invoices,
          total: invoices.length,
          source: 'database',
          filters
        });
    } catch (dbError) {
      apiLogger.error('Error fetching invoices from database', { 
        error: dbError instanceof Error ? dbError.message : String(dbError),
        tenantId 
      });
      
      await audit.logDataAccess(userId, organizationId, 'invoice', 0, 'read', false);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch invoices from database',
        message: dbError instanceof Error ? dbError.message : 'Database error',
        data: [],
        total: 0
      }, { status: 500 });
    }
  } catch (error) {
    apiLogger.error('Error fetching invoices', { error: error instanceof Error ? error.message : String(error) });
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch invoices',
      message: error instanceof Error ? error.message : 'Unknown error',
      data: [],
      total: 0
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const pool = getPool();
    const audit = new AuditLogger(pool);
    const rbac = new RBACService(pool);
    const organizationId = (session.user as any).organizationId || 0;
    const userId = (session.user as any).id || 0;
    const allowed = await rbac.checkPermission(userId, 'finance.invoices.write', organizationId);
    if (!allowed) {
      await audit.logPermissionCheck(userId, organizationId, 'finance.invoices.write', false);
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const tenantId = request.headers.get('tenant-id') || String(organizationId);
    const body = await request.json();
    
    // Validate required fields
    if (!body.customer_name || !body.invoice_date || !body.due_date || !body.lines || body.lines.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: customer_name, invoice_date, due_date, lines' },
        { status: 400 }
      );
    }
    
    // Validate line items
    for (const line of body.lines) {
      if (!line.description || !line.quantity || !line.unit_price) {
        return NextResponse.json(
          { success: false, error: 'Each line item must have description, quantity, and unit_price' },
          { status: 400 }
        );
      }
    }
    
    const invoice = await CompleteFinanceService.createInvoice(tenantId, {
      customer_name: body.customer_name,
      customer_email: body.customer_email,
      customer_id: body.customer_id,
      invoice_date: body.invoice_date,
      due_date: body.due_date,
      payment_terms: body.payment_terms,
      notes: body.notes,
      lines: body.lines,
      created_by: body.created_by || 'system'
    });
    
    await audit.logDataChange(userId, organizationId, 'invoice', (invoice as any).id, null, invoice);
    return NextResponse.json({
      success: true,
      data: invoice,
      message: 'Invoice created successfully'
    });
  } catch (error) {
    apiLogger.error('Error creating invoice', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json(
      { success: false, error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}
