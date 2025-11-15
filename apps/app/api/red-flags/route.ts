import { NextRequest, NextResponse } from 'next/server';

interface RedFlag {
  id: string;
  tenantId: string;
  eventType: string;
  severity: 'low' | 'medium' | 'high';
  sourceTable: string;
  sourceId: string;
  eventData: Record<string, any>;
  status: 'pending' | 'approved' | 'rejected' | 'investigating';
  detectedAt: string;
  processedAt?: string;
  assignedTo?: string;
  notes?: string;
}

// Mock data for Red Flags
const mockRedFlags: RedFlag[] = [
  {
    id: '1',
    tenantId: 'demo-tenant',
    eventType: 'large_transaction',
    severity: 'high',
    sourceTable: 'transactions',
    sourceId: 'txn-001',
    eventData: {
      amount: 150000,
      currency: 'SAR',
      threshold: 100000,
      description: 'Large equipment purchase'
    },
    status: 'pending',
    detectedAt: '2024-01-15T10:30:00Z',
    assignedTo: 'compliance-agent'
  },
  {
    id: '2',
    tenantId: 'demo-tenant',
    eventType: 'duplicate_payment',
    severity: 'medium',
    sourceTable: 'transactions',
    sourceId: 'txn-002',
    eventData: {
      amount: 5000,
      currency: 'SAR',
      duplicateOf: 'txn-001',
      timeDifference: '2 minutes'
    },
    status: 'investigating',
    detectedAt: '2024-01-15T14:20:00Z',
    assignedTo: 'fraud-analyst'
  },
  {
    id: '3',
    tenantId: 'demo-tenant',
    eventType: 'round_amount',
    severity: 'low',
    sourceTable: 'transactions',
    sourceId: 'txn-003',
    eventData: {
      amount: 10000,
      currency: 'SAR',
      roundness: 'exact_thousands'
    },
    status: 'approved',
    detectedAt: '2024-01-14T09:15:00Z',
    processedAt: '2024-01-14T11:30:00Z',
    assignedTo: 'compliance-agent',
    notes: 'Legitimate round payment for monthly rent'
  },
  {
    id: '4',
    tenantId: 'demo-tenant',
    eventType: 'unusual_time',
    severity: 'medium',
    sourceTable: 'transactions',
    sourceId: 'txn-004',
    eventData: {
      amount: 25000,
      currency: 'SAR',
      transactionTime: '02:30:00',
      description: 'Late night transaction'
    },
    status: 'pending',
    detectedAt: '2024-01-16T02:35:00Z'
  },
  {
    id: '5',
    tenantId: 'demo-tenant',
    eventType: 'budget_overrun',
    severity: 'high',
    sourceTable: 'transactions',
    sourceId: 'txn-005',
    eventData: {
      amount: 75000,
      currency: 'SAR',
      budgetCategory: 'Marketing',
      budgetLimit: 50000,
      overrunAmount: 25000
    },
    status: 'rejected',
    detectedAt: '2024-01-16T16:45:00Z',
    processedAt: '2024-01-16T17:00:00Z',
    assignedTo: 'budget-manager',
    notes: 'Exceeds approved marketing budget for Q1'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = request.headers.get('x-tenant-id') || 'demo-tenant';
    const status = searchParams.get('status');
    const severity = searchParams.get('severity');
    const eventType = searchParams.get('eventType');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let filteredFlags = mockRedFlags.filter(flag => flag.tenantId === tenantId);

    // Apply filters
    if (status) {
      filteredFlags = filteredFlags.filter(flag => flag.status === status);
    }
    if (severity) {
      filteredFlags = filteredFlags.filter(flag => flag.severity === severity);
    }
    if (eventType) {
      filteredFlags = filteredFlags.filter(flag => flag.eventType === eventType);
    }

    // Apply pagination
    const total = filteredFlags.length;
    const paginatedFlags = filteredFlags.slice(offset, offset + limit);

    // Calculate statistics
    const stats = {
      total,
      pending: filteredFlags.filter(f => f.status === 'pending').length,
      investigating: filteredFlags.filter(f => f.status === 'investigating').length,
      approved: filteredFlags.filter(f => f.status === 'approved').length,
      rejected: filteredFlags.filter(f => f.status === 'rejected').length,
      high: filteredFlags.filter(f => f.severity === 'high').length,
      medium: filteredFlags.filter(f => f.severity === 'medium').length,
      low: filteredFlags.filter(f => f.severity === 'low').length
    };

    return NextResponse.json({
      success: true,
      data: paginatedFlags,
      stats,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id') || 'demo-tenant';
    const body = await request.json();

    const newRedFlag: RedFlag = {
      id: `rf-${Date.now()}`,
      tenantId,
      eventType: body.eventType,
      severity: body.severity || 'medium',
      sourceTable: body.sourceTable,
      sourceId: body.sourceId,
      eventData: body.eventData || {},
      status: 'pending',
      detectedAt: new Date().toISOString(),
      assignedTo: body.assignedTo
    };

    // In real implementation, save to database
    mockRedFlags.push(newRedFlag);

    return NextResponse.json({
      success: true,
      data: newRedFlag
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Red flag ID is required' },
        { status: 400 }
      );
    }

    const flagIndex = mockRedFlags.findIndex(flag => flag.id === id);
    if (flagIndex === -1) {
      return NextResponse.json(
        { error: 'Red flag not found' },
        { status: 404 }
      );
    }

    // Update the red flag
    mockRedFlags[flagIndex] = {
      ...mockRedFlags[flagIndex],
      ...body,
      processedAt: body.status !== 'pending' ? new Date().toISOString() : undefined
    };

    return NextResponse.json({
      success: true,
      data: mockRedFlags[flagIndex]
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
