import { NextRequest, NextResponse } from 'next/server';

interface Report {
  id: string;
  name: string;
  description: string;
  type: 'financial' | 'operational' | 'compliance';
  lastGenerated: string;
  frequency: string;
  status: 'available' | 'generating' | 'error';
  fileUrl?: string;
  tenantId: string;
}

const mockReports: Report[] = [
  {
    id: 'profit-loss',
    name: 'Profit & Loss Statement',
    description: 'Comprehensive income statement showing revenue, expenses, and net profit',
    type: 'financial',
    lastGenerated: '2024-01-15T10:00:00Z',
    frequency: 'Monthly',
    status: 'available',
    fileUrl: '/reports/profit-loss-2024-01.pdf',
    tenantId: 'default-tenant'
  },
  {
    id: 'balance-sheet',
    name: 'Balance Sheet',
    description: 'Statement of financial position showing assets, liabilities, and equity',
    type: 'financial',
    lastGenerated: '2024-01-15T10:00:00Z',
    frequency: 'Monthly',
    status: 'available',
    fileUrl: '/reports/balance-sheet-2024-01.pdf',
    tenantId: 'default-tenant'
  },
  {
    id: 'cash-flow',
    name: 'Cash Flow Statement',
    description: 'Analysis of cash inflows and outflows from operations, investing, and financing',
    type: 'financial',
    lastGenerated: '2024-01-15T10:00:00Z',
    frequency: 'Monthly',
    status: 'available',
    fileUrl: '/reports/cash-flow-2024-01.pdf',
    tenantId: 'default-tenant'
  },
  {
    id: 'expense-analysis',
    name: 'Expense Analysis',
    description: 'Detailed breakdown of expenses by category, department, and cost center',
    type: 'operational',
    lastGenerated: '2024-01-14T10:00:00Z',
    frequency: 'Weekly',
    status: 'available',
    fileUrl: '/reports/expense-analysis-2024-w2.pdf',
    tenantId: 'default-tenant'
  }
];

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('tenant-id') || 'default-tenant';
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type') || 'summary';
    const startDate = searchParams.get('startDate') || '2024-01-01';
    const endDate = searchParams.get('endDate') || '2024-12-31';
    const asOfDate = searchParams.get('asOfDate') || new Date().toISOString().split('T')[0];

    let reportData;

    switch (reportType) {
      case 'trial_balance':
        reportData = { type: 'trial_balance', data: mockReports.filter(r => r.type === 'financial') };
        break;
      
      case 'income_statement':
      case 'profit_loss':
        reportData = { type: 'income_statement', data: mockReports.filter(r => r.id === 'profit-loss') };
        break;
      
      case 'balance_sheet':
        reportData = { type: 'balance_sheet', data: mockReports.filter(r => r.id === 'balance-sheet') };
        break;
      
      default:
        // Summary report combining key metrics
        reportData = {
          summary: {
            totalRevenue: 1500000,
            totalExpenses: 950000,
            netProfit: 550000,
            totalAssets: 5000000,
            totalLiabilities: 2000000,
            totalEquity: 3000000,
            grossMargin: 36.7,
            operatingMargin: 36.7
          },
          reports: mockReports,
          recentTransactions: [],
          period: { startDate, endDate, asOfDate }
        };
        break;
    }

    return NextResponse.json({
      success: true,
      reports: Array.isArray(reportData) ? reportData : (reportData.reports || [reportData]),
      data: reportData, // Also include in data for compatibility
      reportType,
      period: { startDate, endDate, asOfDate },
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating financial reports:', error);
    
    // Get reportType again for fallback
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type') || 'summary';
    const startDate = searchParams.get('startDate') || '2024-01-01';
    const endDate = searchParams.get('endDate') || '2024-12-31';
    const asOfDate = searchParams.get('asOfDate') || new Date().toISOString().split('T')[0];
    
    // Fallback to sample data
    const fallbackReports = {
      summary: {
        totalRevenue: 125000,
        totalExpenses: 85000,
        netProfit: 40000,
        totalAssets: 150000,
        totalLiabilities: 37000,
        totalEquity: 113000,
        grossMargin: 32.0,
        operatingMargin: 24.5
      },
      trial_balance: [
        { account_code: '1000', account_name: 'Cash and Cash Equivalents', account_type: 'asset', debit_balance: 50000, credit_balance: 0 },
        { account_code: '1100', account_name: 'Accounts Receivable', account_type: 'asset', debit_balance: 15000, credit_balance: 0 },
        { account_code: '2000', account_name: 'Accounts Payable', account_type: 'liability', debit_balance: 0, credit_balance: 8500 },
        { account_code: '3000', account_name: 'Owner\'s Equity', account_type: 'equity', debit_balance: 0, credit_balance: 75000 },
        { account_code: '4000', account_name: 'Sales Revenue', account_type: 'revenue', debit_balance: 0, credit_balance: 100000 }
      ],
      income_statement: {
        revenues: [
          { account_name: 'Sales Revenue', account_code: '4000', amount: 100000 },
          { account_name: 'Service Revenue', account_code: '4100', amount: 25000 }
        ],
        expenses: [
          { account_name: 'Cost of Goods Sold', account_code: '5000', amount: 45000 },
          { account_name: 'Operating Expenses', account_code: '6000', amount: 25000 },
          { account_name: 'Salaries and Wages', account_code: '6100', amount: 15000 }
        ],
        totalRevenue: 125000,
        totalExpenses: 85000,
        netIncome: 40000,
        period: { startDate: '2024-01-01', endDate: '2024-12-31' }
      },
      balance_sheet: {
        assets: [
          { account_name: 'Cash and Cash Equivalents', account_code: '1000', balance: 50000 },
          { account_name: 'Accounts Receivable', account_code: '1100', balance: 15000 },
          { account_name: 'Equipment', account_code: '1500', balance: 75000 }
        ],
        liabilities: [
          { account_name: 'Accounts Payable', account_code: '2000', balance: 8500 },
          { account_name: 'Long-term Debt', account_code: '2500', balance: 25000 }
        ],
        equity: [
          { account_name: 'Owner\'s Equity', account_code: '3000', balance: 75000 },
          { account_name: 'Retained Earnings', account_code: '3100', balance: 38000 }
        ],
        totalAssets: 140000,
        totalLiabilities: 33500,
        totalEquity: 113000,
        asOfDate: '2024-12-31'
      }
    };

    const reportData = fallbackReports[reportType as keyof typeof fallbackReports] || fallbackReports.summary;

    return NextResponse.json({
      success: true,
      reports: Array.isArray(reportData) ? reportData : (reportData.reports || [reportData]),
      data: reportData, // Also include in data for compatibility
      reportType,
      period: { startDate, endDate, asOfDate },
      fallback: true,
      generatedAt: new Date().toISOString()
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = request.headers.get('tenant-id') || 'default-tenant';
    const body = await request.json();
    const { reportId, period } = body;
    
    // Find the report template
    const reportTemplate = mockReports.find(r => r.id === reportId && r.tenantId === tenantId);
    if (!reportTemplate) {
      return NextResponse.json(
        { success: false, error: 'Report template not found' },
        { status: 404 }
      );
    }
    
    // Simulate report generation
    const generatedReport: any = {
      ...reportTemplate,
      id: `${reportId}-${Date.now()}`,
      lastGenerated: new Date().toISOString(),
      status: 'generating',
      fileUrl: undefined,
      period
    };
    
    // Simulate async generation (in real app, this would be a background job)
    setTimeout(() => {
      generatedReport.status = 'available';
      generatedReport.fileUrl = `/reports/${reportId}-${period}.pdf`;
    }, 2000);
    
    return NextResponse.json({
      success: true,
      report: generatedReport,
      message: 'Report generation started'
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}
