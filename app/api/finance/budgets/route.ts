import { NextRequest, NextResponse } from 'next/server';

interface Budget {
  id: string;
  name: string;
  category: string;
  budgetedAmount: number;
  actualAmount: number;
  period: string;
  startDate: string;
  endDate: string;
  status: 'on-track' | 'over-budget' | 'under-budget';
  variance: number;
  variancePercent: number;
  tenantId: string;
}

// Mock data for development
const mockBudgets: Budget[] = [
  {
    id: '1',
    name: 'Marketing Budget Q1 2024',
    category: 'Marketing',
    budgetedAmount: 50000,
    actualAmount: 42000,
    period: 'Q1 2024',
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    status: 'under-budget',
    variance: -8000,
    variancePercent: -16,
    tenantId: 'default-tenant'
  },
  {
    id: '2',
    name: 'Technology Infrastructure',
    category: 'Technology',
    budgetedAmount: 75000,
    actualAmount: 82000,
    period: 'Q1 2024',
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    status: 'over-budget',
    variance: 7000,
    variancePercent: 9.3,
    tenantId: 'default-tenant'
  },
  {
    id: '3',
    name: 'Office Operations',
    category: 'Operations',
    budgetedAmount: 25000,
    actualAmount: 24500,
    period: 'Q1 2024',
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    status: 'on-track',
    variance: -500,
    variancePercent: -2,
    tenantId: 'default-tenant'
  }
];

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('tenant-id') || 'default-tenant';
    
    // Filter budgets by tenant
    const tenantBudgets = mockBudgets.filter(budget => budget.tenantId === tenantId);
    
    return NextResponse.json({
      success: true,
      budgets: tenantBudgets,
      total: tenantBudgets.length,
      summary: {
        totalBudgeted: tenantBudgets.reduce((sum, b) => sum + b.budgetedAmount, 0),
        totalActual: tenantBudgets.reduce((sum, b) => sum + b.actualAmount, 0),
        overBudgetCount: tenantBudgets.filter(b => b.status === 'over-budget').length
      }
    });
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch budgets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = request.headers.get('tenant-id') || 'default-tenant';
    const body = await request.json();
    
    const newBudget: Budget = {
      id: Date.now().toString(),
      ...body,
      tenantId,
      variance: body.actualAmount - body.budgetedAmount,
      variancePercent: ((body.actualAmount - body.budgetedAmount) / body.budgetedAmount) * 100,
      status: body.actualAmount > body.budgetedAmount ? 'over-budget' : 
              body.actualAmount < body.budgetedAmount * 0.9 ? 'under-budget' : 'on-track'
    };
    
    mockBudgets.push(newBudget);
    
    return NextResponse.json({
      success: true,
      budget: newBudget,
      message: 'Budget created successfully'
    });
  } catch (error) {
    console.error('Error creating budget:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create budget' },
      { status: 500 }
    );
  }
}
