import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const FinancialMetricSchema = z.object({
  id: z.string(),
  name: z.string(),
  value: z.number(),
  previousValue: z.number(),
  change: z.number(),
  changePercent: z.number(),
  trend: z.enum(['up', 'down', 'stable']),
  category: z.enum(['revenue', 'expense', 'profit', 'cash']),
});

const ForecastSchema = z.object({
  period: z.string(),
  revenue: z.number(),
  expenses: z.number(),
  profit: z.number(),
  confidence: z.number(),
});

const ApiResponseSchema = z.object({
  success: z.boolean(),
  metrics: z.array(FinancialMetricSchema),
  forecasts: z.array(ForecastSchema),
  summary: z.object({
    totalRevenue: z.number(),
    totalProfit: z.number(),
    profitMargin: z.number(),
    forecastAccuracy: z.number(),
  }),
});

type FinancialMetric = z.infer<typeof FinancialMetricSchema>;
type Forecast = z.infer<typeof ForecastSchema>;
type ApiResponse = z.infer<typeof ApiResponseSchema>;

const mockForecasts: Forecast[] = [
  { period: 'Feb 2024', revenue: 132000, expenses: 87000, profit: 45000, confidence: 85 },
  { period: 'Mar 2024', revenue: 138000, expenses: 89000, profit: 49000, confidence: 78 },
  { period: 'Apr 2024', revenue: 145000, expenses: 92000, profit: 53000, confidence: 72 },
  { period: 'May 2024', revenue: 152000, expenses: 95000, profit: 57000, confidence: 68 }
];

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('tenant-id');
    if (!tenantId) {
      return NextResponse.json({ success: false, error: 'Tenant ID is required' }, { status: 400 });
    }

    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const fetchRevenue = async (startDate: Date, endDate: Date) => {
      const invoices = await stripe.invoices.list({
        created: {
          gte: Math.floor(startDate.getTime() / 1000),
          lt: Math.floor(endDate.getTime() / 1000),
        },
        status: 'paid',
        limit: 100,
      });
      return invoices.data.reduce((total, invoice) => total + (invoice.amount_paid / 100), 0);
    };

    const fetchExpenses = async (startDate: Date, endDate: Date) => {
      const payouts = await stripe.payouts.list({
        created: {
          gte: Math.floor(startDate.getTime() / 1000),
          lt: Math.floor(endDate.getTime() / 1000),
        },
        limit: 100,
      });
      return payouts.data.reduce((total, payout) => total + (payout.amount / 100), 0);
    };

    const fetchCashFlow = async (startDate: Date, endDate: Date) => {
      const balanceTransactions = await stripe.balanceTransactions.list({
        created: {
          gte: Math.floor(startDate.getTime() / 1000),
          lt: Math.floor(endDate.getTime() / 1000),
        },
        limit: 100,
      });
      return balanceTransactions.data.reduce((total, txn) => total + (txn.amount / 100), 0);
    };

    const currentMonthCashFlow = await fetchCashFlow(currentMonthStart, now);
    const previousMonthCashFlow = await fetchCashFlow(previousMonthStart, previousMonthEnd);

    const currentMonthExpenses = await fetchExpenses(currentMonthStart, now);
    const previousMonthExpenses = await fetchExpenses(previousMonthStart, previousMonthEnd);

    const currentMonthRevenue = await fetchRevenue(currentMonthStart, now);
    const previousMonthRevenue = await fetchRevenue(previousMonthStart, previousMonthEnd);

    const currentMonthProfit = currentMonthRevenue - currentMonthExpenses;
    const previousMonthProfit = previousMonthRevenue - previousMonthExpenses;

    const metrics: FinancialMetric[] = [
      {
        id: 'revenue',
        name: 'Monthly Revenue',
        value: currentMonthRevenue,
        previousValue: previousMonthRevenue,
        change: currentMonthRevenue - previousMonthRevenue,
        changePercent: previousMonthRevenue > 0 ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 : 0,
        trend: currentMonthRevenue > previousMonthRevenue ? 'up' : 'down',
        category: 'revenue'
      },
      {
        id: 'expenses',
        name: 'Monthly Expenses',
        value: currentMonthExpenses,
        previousValue: previousMonthExpenses,
        change: currentMonthExpenses - previousMonthExpenses,
        changePercent: previousMonthExpenses > 0 ? ((currentMonthExpenses - previousMonthExpenses) / previousMonthExpenses) * 100 : 0,
        trend: currentMonthExpenses > previousMonthExpenses ? 'up' : 'down',
        category: 'expense'
      },
      {
        id: 'profit',
        name: 'Net Profit',
        value: currentMonthProfit,
        previousValue: previousMonthProfit,
        change: currentMonthProfit - previousMonthProfit,
        changePercent: previousMonthProfit > 0 ? ((currentMonthProfit - previousMonthProfit) / previousMonthProfit) * 100 : 0,
        trend: currentMonthProfit > previousMonthProfit ? 'up' : 'down',
        category: 'profit'
      },
      {
        id: 'cash',
        name: 'Cash Flow',
        value: currentMonthCashFlow,
        previousValue: previousMonthCashFlow,
        change: currentMonthCashFlow - previousMonthCashFlow,
        changePercent: previousMonthCashFlow > 0 ? ((currentMonthCashFlow - previousMonthCashFlow) / previousMonthCashFlow) * 100 : 0,
        trend: currentMonthCashFlow > previousMonthCashFlow ? 'up' : 'down',
        category: 'cash'
      },
    ];

    const response: ApiResponse = {
      success: true,
      metrics: metrics,
      forecasts: mockForecasts, // Forecasts are still mocked
      summary: {
        totalRevenue: currentMonthRevenue,
        totalProfit: currentMonthProfit,
        profitMargin: currentMonthRevenue > 0 ? (currentMonthProfit / currentMonthRevenue) * 100 : 0,
        forecastAccuracy: 87 // Mocked
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching financial analytics:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { success: false, error: 'Failed to fetch financial analytics', details: errorMessage },
      { status: 500 }
    );
  }
}
