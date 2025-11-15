'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, TrendingUp, Target, Clock,
  Users, Briefcase, Calendar, ArrowRight
} from 'lucide-react';
import { LoadingState } from '@/components/enterprise/LoadingState';

interface PipelineStage {
  id: string;
  name: string;
  deals: Deal[];
  totalValue: number;
  averageDealSize: number;
  conversionRate: number;
  color: string;
}

interface Deal {
  id: string;
  name: string;
  company: string;
  value: number;
  probability: number;
  expectedCloseDate: string;
  assignedTo: string;
  daysInStage: number;
}

export default function PipelinePage() {
  const [pipeline, setPipeline] = useState<PipelineStage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPipeline();
  }, []);

  const fetchPipeline = async () => {
    try {
      const response = await fetch('/api/sales/pipeline', {
        headers: {
          'tenant-id': 'default-tenant'
        }
      });
      const data = await response.json();
      setPipeline(data.pipeline || []);
    } catch (error) {
      console.error('Error fetching pipeline:', error);
      // Fallback data for demo
      setPipeline([
        {
          id: 'prospecting',
          name: 'Prospecting',
          color: 'bg-gray-100 border-gray-300',
          conversionRate: 25,
          deals: [
            {
              id: '1',
              name: 'New Enterprise Lead',
              company: 'Future Tech Inc',
              value: 75000,
              probability: 20,
              expectedCloseDate: '2024-03-30',
              assignedTo: 'Sarah Johnson',
              daysInStage: 5
            },
            {
              id: '2',
              name: 'SMB Opportunity',
              company: 'Local Business Co',
              value: 15000,
              probability: 15,
              expectedCloseDate: '2024-04-15',
              assignedTo: 'Mike Chen',
              daysInStage: 12
            }
          ],
          totalValue: 90000,
          averageDealSize: 45000
        },
        {
          id: 'qualification',
          name: 'Qualification',
          color: 'bg-blue-50 border-blue-200',
          conversionRate: 40,
          deals: [
            {
              id: '3',
              name: 'Startup Package',
              company: 'Startup Inc',
              value: 25000,
              probability: 40,
              expectedCloseDate: '2024-03-15',
              assignedTo: 'Alex Rodriguez',
              daysInStage: 8
            }
          ],
          totalValue: 25000,
          averageDealSize: 25000
        },
        {
          id: 'proposal',
          name: 'Proposal',
          color: 'bg-yellow-50 border-yellow-200',
          conversionRate: 60,
          deals: [
            {
              id: '4',
              name: 'Cloud Migration Project',
              company: 'Innovate.io',
              value: 85000,
              probability: 60,
              expectedCloseDate: '2024-02-28',
              assignedTo: 'Mike Chen',
              daysInStage: 15
            }
          ],
          totalValue: 85000,
          averageDealSize: 85000
        },
        {
          id: 'negotiation',
          name: 'Negotiation',
          color: 'bg-orange-50 border-orange-200',
          conversionRate: 75,
          deals: [
            {
              id: '5',
              name: 'Enterprise Software License',
              company: 'TechCorp Solutions',
              value: 150000,
              probability: 75,
              expectedCloseDate: '2024-02-15',
              assignedTo: 'Sarah Johnson',
              daysInStage: 22
            }
          ],
          totalValue: 150000,
          averageDealSize: 150000
        },
        {
          id: 'closed-won',
          name: 'Closed Won',
          color: 'bg-green-50 border-green-200',
          conversionRate: 100,
          deals: [
            {
              id: '6',
              name: 'Annual Subscription Renewal',
              company: 'Global Corp',
              value: 120000,
              probability: 100,
              expectedCloseDate: '2024-01-10',
              assignedTo: 'Sarah Johnson',
              daysInStage: 0
            }
          ],
          totalValue: 120000,
          averageDealSize: 120000
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate overall pipeline metrics
  const totalPipelineValue = pipeline.reduce((sum, stage) => sum + stage.totalValue, 0);
  const totalDeals = pipeline.reduce((sum, stage) => sum + stage.deals.length, 0);
  const weightedValue = pipeline.reduce((sum, stage) => 
    sum + stage.deals.reduce((stageSum, deal) => stageSum + (deal.value * deal.probability / 100), 0), 0
  );

  if (loading) {
    return <LoadingState message="Loading pipeline..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Pipeline</h1>
          <p className="text-gray-600">
            Visual overview of your sales opportunities by stage
          </p>
        </div>
      </div>

      {/* Pipeline Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pipeline</CardTitle>
            <Briefcase className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${totalPipelineValue.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">
              {totalDeals} opportunities
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weighted Pipeline</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              ${weightedValue.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">
              Probability adjusted
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Deal Size</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${Math.round(totalPipelineValue / totalDeals).toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">
              Average opportunity
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {Math.round(pipeline.reduce((sum, stage) => sum + stage.conversionRate, 0) / pipeline.length)}%
            </div>
            <p className="text-xs text-gray-500">
              Average across stages
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Stages */}
      <div className="grid gap-6 lg:grid-cols-5">
        {pipeline.map((stage, index) => (
          <div key={stage.id} className="space-y-4">
            {/* Stage Header */}
            <Card className={`border-2 ${stage.color}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{stage.name}</CardTitle>
                  {index < pipeline.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Value:</span>
                    <span className="font-medium">${stage.totalValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Deals:</span>
                    <span className="font-medium">{stage.deals.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Conv. Rate:</span>
                    <span className="font-medium">{stage.conversionRate}%</span>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Deals in Stage */}
            <div className="space-y-3">
              {stage.deals.map((deal) => (
                <Card key={deal.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <div className="font-medium text-sm">{deal.name}</div>
                        <div className="text-xs text-gray-500">{deal.company}</div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-green-600">
                          ${deal.value.toLocaleString()}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {deal.probability}%
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(deal.expectedCloseDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3" />
                          <span>{deal.assignedTo}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{deal.daysInStage} days in stage</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {stage.deals.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No deals in this stage
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pipeline Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Stage Performance */}
            <div>
              <h4 className="font-medium mb-4">Stage Performance</h4>
              <div className="space-y-3">
                {pipeline.map((stage) => (
                  <div key={stage.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{stage.name}</div>
                      <div className="text-sm text-gray-500">{stage.deals.length} deals</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">${stage.totalValue.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">{stage.conversionRate}% conversion</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h4 className="font-medium mb-4">Recent Activity</h4>
              <div className="space-y-3">
                {pipeline.flatMap(stage => stage.deals)
                  .sort((a, b) => new Date(b.expectedCloseDate).getTime() - new Date(a.expectedCloseDate).getTime())
                  .slice(0, 5)
                  .map((deal) => (
                    <div key={deal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-sm">{deal.name}</div>
                        <div className="text-xs text-gray-500">{deal.company}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-sm">${deal.value.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(deal.expectedCloseDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
