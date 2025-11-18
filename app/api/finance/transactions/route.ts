import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getPool } from '@/lib/db/connection';
import { AuditLogger } from '@/lib/audit/audit-logger';
import { RBACService } from '@/lib/auth/rbac-service';
import { apiLogger } from '@/lib/logger';

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
    
    
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { success: false, message: 'Service unavailable' },
        { status: 503 }
      );
    }

    // Filter transactions based on query parameters
    let filteredTransactions = [...sampleTransactions];
    
    if (status && status !== 'all') {
      filteredTransactions = filteredTransactions.filter(t => t.status === status);
    }
    
    if (type && type !== 'all') {
      filteredTransactions = filteredTransactions.filter(t => t.type === type);
    }
    
    // Apply pagination
    const paginatedTransactions = filteredTransactions.slice(offset, offset + limit);
    
    // Calculate summary statistics
    const summary = {
      total: filteredTransactions.length,
      totalAmount: filteredTransactions.reduce((sum, t) => sum + t.amount, 0),
      byStatus: {
        pending: filteredTransactions.filter(t => t.status === 'pending').length,
        paid: filteredTransactions.filter(t => t.status === 'paid').length,
        overdue: filteredTransactions.filter(t => t.status === 'overdue').length
      },
      byType: {
        receivable: filteredTransactions.filter(t => t.type === 'receivable').length,
        payable: filteredTransactions.filter(t => t.type === 'payable').length
      }
    };

    await audit.logDataAccess(userId, organizationId, 'transaction', 0, 'read');
    return NextResponse.json({
      success: true,
      data: paginatedTransactions,
      summary,
      pagination: {
        limit,
        offset,
        total: filteredTransactions.length,
        hasMore: offset + limit < filteredTransactions.length
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
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
    
    
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ success: false, message: 'Service unavailable' }, { status: 503 });
    }

    // Create new transaction
    const newTransaction: Transaction = {
      id: `txn_${Date.now()}`,
      type: body.type,
      party_name: body.party_name,
      reference: body.reference || `REF-${Date.now()}`,
      amount: parseFloat(body.amount),
      due_date: body.due_date,
      status: body.status || 'pending',
      created_at: new Date().toISOString(),
      account_id: body.account_id,
      description: body.description
    };
    
    // In production, save to database
    // For demo, just return the created transaction
    
    await audit.logDataChange(userId, Number(organizationId), 'transaction', Date.now(), null, newTransaction);
    return NextResponse.json({
      success: true,
      data: newTransaction,
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
