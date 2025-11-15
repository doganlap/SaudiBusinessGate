import { NextRequest, NextResponse } from 'next/server';

interface CustomerSegment {
  id: string;
  name: string;
  count: number;
  percentage: number;
  avgValue: number;
  growth: number;
  color: string;
}

interface CustomerInsight {
  id: string;
  customerId: string;
  customerName: string;
  segment: string;
  lifetimeValue: number;
  acquisitionDate: string;
  lastPurchase: string;
  purchaseFrequency: number;
  avgOrderValue: number;
  churnRisk: 'low' | 'medium' | 'high';
  satisfaction: number;
  location: string;
}

const mockSegments: CustomerSegment[] = [
  { id: 'vip', name: 'VIP Customers', count: 45, percentage: 15, avgValue: 25000, growth: 12, color: 'bg-purple-100 text-purple-800' },
  { id: 'loyal', name: 'Loyal Customers', count: 120, percentage: 40, avgValue: 8500, growth: 8, color: 'bg-green-100 text-green-800' },
  { id: 'new', name: 'New Customers', count: 85, percentage: 28, avgValue: 2500, growth: 25, color: 'bg-blue-100 text-blue-800' },
  { id: 'at-risk', name: 'At Risk', count: 50, percentage: 17, avgValue: 1200, growth: -15, color: 'bg-red-100 text-red-800' }
];

const mockInsights: CustomerInsight[] = [
  {
    id: '1', customerId: 'C001', customerName: 'TechCorp Solutions', segment: 'VIP',
    lifetimeValue: 125000, acquisitionDate: '2023-01-15', lastPurchase: '2024-01-10',
    purchaseFrequency: 12, avgOrderValue: 8500, churnRisk: 'low', satisfaction: 95,
    location: 'San Francisco, CA'
  },
  {
    id: '2', customerId: 'C002', customerName: 'Innovate.io', segment: 'Loyal',
    lifetimeValue: 45000, acquisitionDate: '2023-06-20', lastPurchase: '2024-01-08',
    purchaseFrequency: 8, avgOrderValue: 3200, churnRisk: 'low', satisfaction: 88,
    location: 'Austin, TX'
  }
];

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('tenant-id') || 'default-tenant';
    
    return NextResponse.json({
      success: true,
      segments: mockSegments,
      insights: mockInsights,
      summary: {
        totalCustomers: mockSegments.reduce((sum, s) => sum + s.count, 0),
        avgLifetimeValue: mockInsights.reduce((sum, i) => sum + i.lifetimeValue, 0) / mockInsights.length,
        churnRisk: mockInsights.filter(i => i.churnRisk === 'high').length
      }
    });
  } catch (error) {
    console.error('Error fetching customer analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customer analytics' },
      { status: 500 }
    );
  }
}
