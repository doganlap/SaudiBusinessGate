import { NextRequest, NextResponse } from 'next/server';

interface AIInsight {
  id: string;
  title: string;
  description: string;
  category: 'prediction' | 'optimization' | 'anomaly' | 'recommendation';
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  createdAt: string;
  data: Record<string, any>;
}

interface PredictionModel {
  id: string;
  name: string;
  accuracy: number;
  lastTrained: string;
  predictions: number;
  status: 'active' | 'training' | 'inactive';
}

const mockInsights: AIInsight[] = [
  {
    id: '1', title: 'Revenue Spike Predicted', 
    description: 'ML model predicts 23% revenue increase next month based on current sales patterns and seasonal trends.',
    category: 'prediction', confidence: 87, impact: 'high', actionable: true,
    createdAt: '2024-01-15T10:00:00Z', data: { predictedIncrease: 23, timeframe: '30 days' }
  },
  {
    id: '2', title: 'Customer Churn Risk Detected',
    description: '12 high-value customers showing early churn indicators. Immediate retention actions recommended.',
    category: 'anomaly', confidence: 92, impact: 'high', actionable: true,
    createdAt: '2024-01-15T09:30:00Z', data: { customersAtRisk: 12, potentialLoss: 45000 }
  },
  {
    id: '3', title: 'Marketing Channel Optimization',
    description: 'Reallocating 15% of marketing budget from social media to email campaigns could improve ROI by 34%.',
    category: 'optimization', confidence: 78, impact: 'medium', actionable: true,
    createdAt: '2024-01-15T08:45:00Z', data: { roiImprovement: 34, budgetReallocation: 15 }
  }
];

const mockModels: PredictionModel[] = [
  { id: '1', name: 'Revenue Forecasting', accuracy: 87, lastTrained: '2024-01-10', predictions: 1250, status: 'active' },
  { id: '2', name: 'Customer Churn Prediction', accuracy: 92, lastTrained: '2024-01-12', predictions: 890, status: 'active' },
  { id: '3', name: 'Demand Forecasting', accuracy: 85, lastTrained: '2024-01-08', predictions: 2100, status: 'active' },
  { id: '4', name: 'Price Optimization', accuracy: 79, lastTrained: '2024-01-05', predictions: 450, status: 'training' }
];

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('tenant-id') || 'default-tenant';
    
    return NextResponse.json({
      success: true,
      insights: mockInsights,
      models: mockModels,
      summary: {
        totalInsights: mockInsights.length,
        actionableInsights: mockInsights.filter(i => i.actionable).length,
        avgConfidence: mockInsights.reduce((sum, i) => sum + i.confidence, 0) / mockInsights.length,
        activeModels: mockModels.filter(m => m.status === 'active').length
      }
    });
  } catch (error) {
    console.error('Error fetching AI insights:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch AI insights' },
      { status: 500 }
    );
  }
}
