import { NextRequest, NextResponse } from 'next/server';
import { FinanceService } from '@/lib/services/finance.service';

interface Account {
  id: string;
  account_name: string;
  account_code: string;
  account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  balance: number;
  parent_account_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  description?: string;
}

// Fallback sample accounts if database is unavailable
const fallbackAccounts: Account[] = [
  {
    id: 'acc_001',
    account_name: 'Cash and Cash Equivalents',
    account_code: '1000',
    account_type: 'asset',
    balance: 125000,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-11-11T00:00:00Z',
    description: 'Primary operating cash account'
  },
  {
    id: 'acc_002',
    account_name: 'Accounts Receivable',
    account_code: '1200',
    account_type: 'asset',
    balance: 78000,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-11-11T00:00:00Z',
    description: 'Outstanding customer invoices'
  },
  {
    id: 'acc_003',
    account_name: 'Inventory',
    account_code: '1300',
    account_type: 'asset',
    balance: 45000,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-11-11T00:00:00Z',
    description: 'Product inventory and supplies'
  },
  {
    id: 'acc_004',
    account_name: 'Accounts Payable',
    account_code: '2000',
    account_type: 'liability',
    balance: 32000,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-11-11T00:00:00Z',
    description: 'Outstanding vendor bills'
  },
  {
    id: 'acc_005',
    account_name: 'Revenue',
    account_code: '4000',
    account_type: 'revenue',
    balance: 125000,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-11-11T00:00:00Z',
    description: 'Primary revenue account'
  },
  {
    id: 'acc_006',
    account_name: 'Operating Expenses',
    account_code: '5000',
    account_type: 'expense',
    balance: 93000,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-11-11T00:00:00Z',
    description: 'General operating expenses'
  },
  {
    id: 'acc_007',
    account_name: 'Office Equipment',
    account_code: '1500',
    account_type: 'asset',
    balance: 25000,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-11-11T00:00:00Z',
    description: 'Computer equipment and office furniture'
  },
  {
    id: 'acc_008',
    account_name: 'Software Licenses',
    account_code: '1600',
    account_type: 'asset',
    balance: 15000,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-11-11T00:00:00Z',
    description: 'Software licenses and subscriptions'
  }
];

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id') || 'default';
    
    // Get accounts from database
    const financeService = new FinanceService();
    const accounts = await financeService.getAccounts(tenantId);
    
    return NextResponse.json({
      success: true,
      data: accounts,
      source: 'database',
      total: accounts.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    
    // Return fallback data if database fails
    return NextResponse.json({
      success: true,
      data: fallbackAccounts,
      source: 'fallback',
      total: fallbackAccounts.length,
      message: 'Using fallback data - database error',
      timestamp: new Date().toISOString()
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tenantId = request.headers.get('x-tenant-id') || 'default';
    
    // Validate required fields
    const requiredFields = ['account_name', 'account_code', 'account_type'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, message: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Validate account type
    const validTypes = ['asset', 'liability', 'equity', 'revenue', 'expense'];
    if (!validTypes.includes(body.account_type)) {
      return NextResponse.json(
        { success: false, message: 'Invalid account type' },
        { status: 400 }
      );
    }
    
    // Create new account
    const newAccount: Account = {
      id: `acc_${Date.now()}`,
      account_name: body.account_name,
      account_code: body.account_code,
      account_type: body.account_type,
      balance: parseFloat(body.balance || '0'),
      parent_account_id: body.parent_account_id,
      is_active: body.is_active !== false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      description: body.description
    };
    
    // In production, save to database and validate account code uniqueness
    // For demo, just return the created account
    
    return NextResponse.json({
      success: true,
      data: newAccount,
      message: 'Account created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating account:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create account' },
      { status: 500 }
    );
  }
}
