/**
 * Mock Real-time Analytics Engine for Next.js API routes
 * Simplified version for production build compatibility
 */

export interface KPI {
  id: string;
  name: string;
  category: string;
  value: number | string;
  change: number;
  changeType: 'increase' | 'decrease';
  trend: Array<{ timestamp: string; value: number }>;
  target?: number;
  unit?: string;
  format?: 'currency' | 'percentage' | 'number' | 'text';
}

export class RealTimeAnalyticsEngineMock {
  async getBusinessKpis(): Promise<KPI[]> {
    const now = new Date();
    const mockKpis: KPI[] = [
      {
        id: 'mrr',
        name: 'Monthly Recurring Revenue',
        category: 'Financial',
        value: 125000,
        change: 12.5,
        changeType: 'increase',
        trend: [
          { timestamp: new Date(now.getTime() - 86400000).toISOString(), value: 120000 },
          { timestamp: now.toISOString(), value: 125000 }
        ],
        format: 'currency',
        unit: 'SAR'
      },
      {
        id: 'total_customers',
        name: 'Total Customers',
        category: 'Customer Analytics',
        value: 1250,
        change: 8.3,
        changeType: 'increase',
        trend: [
          { timestamp: new Date(now.getTime() - 86400000).toISOString(), value: 1200 },
          { timestamp: now.toISOString(), value: 1250 }
        ],
        format: 'number'
      },
      {
        id: 'churn_rate_monthly',
        name: 'Monthly Churn Rate',
        category: 'Customer Analytics',
        value: '2.1%',
        change: -0.5,
        changeType: 'decrease',
        trend: [
          { timestamp: new Date(now.getTime() - 86400000).toISOString(), value: 2.6 },
          { timestamp: now.toISOString(), value: 2.1 }
        ],
        format: 'percentage'
      },
      {
        id: 'nps',
        name: 'Net Promoter Score',
        category: 'Customer Analytics',
        value: 72,
        change: 5,
        changeType: 'increase',
        trend: [
          { timestamp: new Date(now.getTime() - 86400000).toISOString(), value: 67 },
          { timestamp: now.toISOString(), value: 72 }
        ],
        format: 'number',
        target: 75
      }
    ];

    return mockKpis;
  }
}

export default RealTimeAnalyticsEngineMock;