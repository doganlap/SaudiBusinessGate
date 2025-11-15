'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, Zap, TrendingUp, AlertTriangle, 
  Target, Lightbulb, BarChart3, Users, DollarSign
} from 'lucide-react';
import { LoadingState } from '@/components/enterprise/LoadingState';

interface AIInsight {
  id: string;
  title: string;
  description: string;
  category: 'prediction' | 'optimization' | 'anomaly' | 'recommendation';
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  createdAt: string;
  data: any;
}

interface PredictionModel {
  id: string;
  name: string;
  accuracy: number;
  lastTrained: string;
  predictions: number;
  status: 'active' | 'training' | 'inactive';
}

export default function AIInsightsPage() {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [models, setModels] = useState<PredictionModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAIInsights();
  }, []);

  const fetchAIInsights = async () => {
    try {
      const response = await fetch('/api/analytics/ai-insights', {
        headers: { 'tenant-id': 'default-tenant' }
      });
      const data = await response.json();
      setInsights(data.insights || []);
      setModels(data.models || []);
    } catch (error) {
      console.error('Error fetching AI insights:', error);
      // Mock data
      setInsights([
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
        },
        {
          id: '4', title: 'Inventory Demand Forecast',
          description: 'Product category "Enterprise Software" will see 40% demand increase in next quarter.',
          category: 'prediction', confidence: 85, impact: 'medium', actionable: true,
          createdAt: '2024-01-14T16:20:00Z', data: { demandIncrease: 40, category: 'Enterprise Software' }
        }
      ]);

      setModels([
        { id: '1', name: 'Revenue Forecasting', accuracy: 87, lastTrained: '2024-01-10', predictions: 1250, status: 'active' },
        { id: '2', name: 'Customer Churn Prediction', accuracy: 92, lastTrained: '2024-01-12', predictions: 890, status: 'active' },
        { id: '3', name: 'Demand Forecasting', accuracy: 85, lastTrained: '2024-01-08', predictions: 2100, status: 'active' },
        { id: '4', name: 'Price Optimization', accuracy: 79, lastTrained: '2024-01-05', predictions: 450, status: 'training' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'prediction': return TrendingUp;
      case 'optimization': return Target;
      case 'anomaly': return AlertTriangle;
      case 'recommendation': return Lightbulb;
      default: return Brain;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'prediction': return 'bg-blue-100 text-blue-800';
      case 'optimization': return 'bg-green-100 text-green-800';
      case 'anomaly': return 'bg-red-100 text-red-800';
      case 'recommendation': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) return <LoadingState message="Loading AI insights..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Insights</h1>
          <p className="text-gray-600">Machine learning powered business intelligence and predictions</p>
        </div>
      </div>

      {/* AI Models Status */}
      <div className="grid gap-4 md:grid-cols-4">
        {models.map((model) => (
          <Card key={model.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{model.name}</CardTitle>
              <Brain className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{model.accuracy}%</div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">Accuracy</span>
                <Badge variant={model.status === 'active' ? 'default' : 'secondary'}>
                  {model.status}
                </Badge>
              </div>
              <div className="mt-2">
                <span className="text-xs text-gray-500">Predictions: </span>
                <span className="text-xs font-medium">{model.predictions.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Insights */}
      <div className="grid gap-6 md:grid-cols-2">
        {insights.map((insight) => {
          const IconComponent = getCategoryIcon(insight.category);
          const categoryColor = getCategoryColor(insight.category);
          const impactColor = getImpactColor(insight.impact);
          
          return (
            <Card key={insight.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <IconComponent className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{insight.title}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={categoryColor}>
                          {insight.category}
                        </Badge>
                        <Badge variant="outline" className={impactColor}>
                          {insight.impact} impact
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-purple-600">
                      {insight.confidence}% confidence
                    </div>
                    {insight.actionable && (
                      <Badge variant="secondary" className="mt-1">
                        Actionable
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{insight.description}</p>
                
                {/* Insight Data Visualization */}
                {insight.data && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {Object.entries(insight.data).map(([key, value]) => {
                        const displayValue = (() => {
                          if (typeof value === 'number') {
                            if (key.includes('Increase') || key.includes('Improvement')) {
                              return `+${value}%`;
                            }
                            if (key.includes('Loss')) {
                              return `$${value.toLocaleString()}`;
                            }
                            return value.toLocaleString();
                          }
                          return String(value || '');
                        })();

                        return (
                          <div key={key}>
                            <span className="text-gray-500 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                            </span>
                            <div className="font-medium">
                              {displayValue}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {insight.actionable && (
                  <div className="mt-4 flex space-x-2">
                    <button className="px-3 py-1 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700">
                      Take Action
                    </button>
                    <button className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50">
                      Learn More
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* AI Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>AI Performance Dashboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Zap className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">1,247</div>
              <div className="text-sm text-gray-600">Insights Generated</div>
              <div className="text-xs text-gray-500 mt-1">This month</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">89%</div>
              <div className="text-sm text-gray-600">Prediction Accuracy</div>
              <div className="text-xs text-gray-500 mt-1">Average across models</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <DollarSign className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">$127K</div>
              <div className="text-sm text-gray-600">Value Generated</div>
              <div className="text-xs text-gray-500 mt-1">From AI recommendations</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
