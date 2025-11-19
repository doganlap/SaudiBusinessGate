import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth/auth-service';
import { getPool } from '@/lib/db/connection';
import { AuditLogger } from '@/lib/audit/audit-logger';
import { RBACService } from '@/lib/auth/rbac-service';
import { apiLogger } from '@/lib/logger';
import { FinanceService } from '@/lib/services/finance.service';


export async function GET(request: NextRequest) {
  try {
    const user = await authService.getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const pool = getPool();
    const audit = new AuditLogger(pool);
    const rbac = new RBACService(pool);
    const organizationId = Number(user.tenantId);
    const userId = Number(user.id);
    const allowed = await rbac.checkPermission(userId, 'finance.transactions.read', organizationId);
    if (!allowed) {
      await audit.logPermissionCheck(userId, organizationId, 'finance.transactions.read', false);
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Get tenant ID from headers
    const tenantId = request.headers.get('x-tenant-id') || String(user.tenantId);
    const service = new FinanceService();
    const data = await service.getTransactions(tenantId, {
      status: status || undefined,
      type: type || undefined,
      limit,
      offset
    });

    const summary = {
      total: data.length,
      totalAmount: data.reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0)
    };

    await audit.logDataAccess(userId, organizationId, 'transaction', 0, 'read');
    return NextResponse.json({
      success: true,
      data,
      summary,
      pagination: {
        limit,
        offset,
        total: data.length,
        hasMore: data.length === limit
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    apiLogger.error('Error fetching transactions', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json(
      { success: false, message: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await authService.getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = request.headers.get('x-tenant-id') || String(user.tenantId);
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    try {
      const pool = await getPool();
      const audit = new AuditLogger(pool);
      const deleteQuery = `DELETE FROM transactions WHERE id = $1 AND tenant_id = $2`;
      const result = await pool.query(deleteQuery, [body.id, tenantId]);

      if (result.rowCount === 0) {
        return NextResponse.json(
          { success: false, error: 'Transaction not found or already deleted' },
          { status: 404 }
        );
      }

      await audit.logSync({
        organizationId: Number(tenantId),
        userId: Number(user.id),
        actionType: 'data.delete',
        resourceType: 'transaction',
        resourceId: body.id,
        success: true
      });

      return NextResponse.json(
        { success: true, message: 'Transaction deleted successfully' },
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
          { success: false, error: 'Transactions table not found' },
          { status: 503 }
        );
      }
      throw dbError;
    }
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete transaction' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const user = await authService.getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const pool = getPool();
    const audit = new AuditLogger(pool);
    const rbac = new RBACService(pool);
    const organizationId = Number(user.tenantId);
    const userId = Number(user.id);
    const allowed = await rbac.checkPermission(userId, 'finance.transactions.write', organizationId);
    if (!allowed) {
      await audit.logPermissionCheck(userId, organizationId, 'finance.transactions.write', false);
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const tenantId = request.headers.get('x-tenant-id') || String(user.tenantId);

    const requiredFields = ['type', 'party_name', 'amount', 'due_date'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, message: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const service = new FinanceService();
    const created = await service.createTransaction(tenantId, {
      tenant_id: tenantId,
      transaction_type: body.type,
      amount: parseFloat(body.amount),
      currency: body.currency || 'SAR',
      status: body.status || 'pending',
      party_name: body.party_name,
      reference: body.reference || null,
      due_date: body.due_date,
      account_id: body.account_id || null,
      description: body.description || null
    } as any);

    await audit.logDataChange(userId, organizationId, 'transaction', (created as any).id, null, created);
    return NextResponse.json({
      success: true,
      data: created,
      message: 'Transaction created successfully'
    }, { status: 201 });
  } catch (error) {
    apiLogger.error('Error creating transaction', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json(
      { success: false, message: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}
