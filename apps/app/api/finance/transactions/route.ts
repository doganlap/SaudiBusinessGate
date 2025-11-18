import { NextRequest, NextResponse } from 'next/server';
import { FinanceService } from '@/lib/services/finance.service';
import { getServerSession } from 'next-auth';
import { getPool } from '@/lib/db/connection';
import { AuditLogger } from '@/lib/audit/audit-logger';
import { RBACService } from '@/lib/auth/rbac-service';

interface Transaction {
  id: string;
  type: 'payable' | 'receivable';
  party_name: string;
  reference: string;
  amount: number;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue';
  created_at: string;
  account_id?: string;
  description?: string;
}

// Sample transaction data - in production this would come from database
const sampleTransactions: Transaction[] = [
  {
    id: '1',
    type: 'receivable',
    party_name: 'Acme Corporation',
    reference: 'INV-2024-001',
    amount: 45000,
    due_date: '2024-11-15',
    status: 'pending',
    created_at: '2024-10-15T10:00:00Z',
    account_id: 'acc_001',
    description: 'Software licensing and support services'
  },
  {
    id: '2',
    type: 'payable',
    party_name: 'Tech Suppliers Ltd',
    reference: 'BILL-2024-089',
    amount: 12500,
    due_date: '2024-11-20',
    status: 'pending',
    created_at: '2024-10-20T14:30:00Z',
    account_id: 'acc_002',
    description: 'Hardware procurement and installation'
  },
  {
    id: '3',
    type: 'receivable',
    party_name: 'Future Systems Inc',
    reference: 'INV-2024-002',
    amount: 78000,
    due_date: '2024-12-01',
    status: 'overdue',
    created_at: '2024-09-01T09:15:00Z',
    account_id: 'acc_003',
    description: 'Enterprise platform implementation'
  },
  {
    id: '4',
    type: 'payable',
    party_name: 'Office Solutions Co',
    reference: 'BILL-2024-090',
    amount: 3200,
    due_date: '2024-11-10',
    status: 'paid',
    created_at: '2024-10-10T16:45:00Z',
    account_id: 'acc_004',
    description: 'Office supplies and equipment'
  },
  {
    id: '5',
    type: 'receivable',
    party_name: 'Global Enterprises',
    reference: 'INV-2024-003',
    amount: 92000,
    due_date: '2024-11-25',
    status: 'pending',
    created_at: '2024-10-25T11:20:00Z',
    account_id: 'acc_005',
    description: 'Consulting and professional services'
  },
  {
    id: '6',
    type: 'payable',
    party_name: 'Cloud Services Provider',
    reference: 'BILL-2024-091',
    amount: 8500,
    due_date: '2024-11-30',
    status: 'pending',
    created_at: '2024-10-30T08:00:00Z',
    account_id: 'acc_006',
    description: 'Monthly cloud infrastructure costs'
  }
];

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const pool = getPool();
    const audit = new AuditLogger(pool);
    const rbac = new RBACService(pool);
    const organizationId = (session.user as any).organizationId || 0;
    const userId = (session.user as any).id || 0;
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
    const tenantId = request.headers.get('x-tenant-id') || String(organizationId);
    const service = new FinanceService();
    const data = await service.getTransactions(tenantId, { status: status || undefined, type: type || undefined, limit, offset });
    const summary = {
      total: data.length,
      totalAmount: data.reduce((sum, t: any) => sum + Number(t.amount || 0), 0),
    };
    await audit.logDataAccess(userId, organizationId, 'transaction', 0, 'read');
    return NextResponse.json({ success: true, data, summary, pagination: { limit, offset, total: data.length, hasMore: data.length === limit }, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch transactions' },
      { status: 500 }
    );
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
    const allowed = await rbac.checkPermission(userId, 'finance.transactions.write', organizationId);
    if (!allowed) {
      await audit.logPermissionCheck(userId, organizationId, 'finance.transactions.write', false);
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const body = await request.json();
    const tenantId = request.headers.get('x-tenant-id') || String(organizationId);
    
    // Validate required fields
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
      account_id: body.account_id,
      transaction_type: body.type === 'receivable' ? 'receipt' : 'payment',
      amount: parseFloat(body.amount),
      transaction_date: new Date(body.due_date),
      reference_id: body.reference,
      transaction_number: undefined,
      description: body.description,
      status: body.status || 'pending',
      id: '', tenant_id: tenantId, created_at: new Date(), updated_at: new Date()
    } as any);
    await audit.logDataChange(userId, organizationId, 'transaction', (created as any).id, null, created);
    return NextResponse.json({ success: true, data: created, message: 'Transaction created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}
