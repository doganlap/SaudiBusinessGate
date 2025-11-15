'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart2, TrendingUp, TrendingDown, Calendar,
  FileText, Percent, DollarSign, ArrowRight,
  PieChart, Filter, Download, ChevronDown
} from 'lucide-react';
import {
  EnterpriseToolbar,
  KpiCard,
  KpiGrid,
  LoadingState
} from '../components/enterprise';

interface AnalyticsData {
  kpis: {
    revenue_growth: number;
    profit_margin: number;
    cash_ratio: number;
    roi: number;
  };
  trends: {
    period: string;
    revenue: number;
    expenses: number;
    profit: number;
  }[];
  segments: {
    segment: string;
    value: number;
    percentage: number;
  }[];
}

/**
 * Financial Analytics - Advanced Financial Insights
 * Analyze financial performance metrics and trends
 */
export default function FinancialAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('year');
  const [showDetails, setShowDetails] = useState(false);

  // Sample data for demonstration
  const sampleAnalyticsData: AnalyticsData = {
    kpis: {
      revenue_growth: 8.5,
      profit_margin: 23.2,
      cash_ratio: 1.8,
      roi: 15.4
    },
    trends: [
      {
        period: 'Jan',
        revenue: 54000,
        expenses: 38000,
        profit: 16000
      },
      {
        period: 'Feb',
        revenue: 58000,
        expenses: 42000,
        profit: 16000
      },
      {
        period: 'Mar',
        revenue: 65000,
        expenses: 45000,
        profit: 20000
      },
      {
        period: 'Apr',
        revenue: 61000,
        expenses: 39000,
        profit: 22000
      },
      {
        period: 'May',
        revenue: 72000,
        expenses: 48000,
        profit: 24000
      },
      {
        period: 'Jun',
        revenue: 78000,
        expenses: 52000,
        profit: 26000
      }
    ],
    segments: [
      {
        segment: 'Product Sales',
        value: 420000,
        percentage: 45
      },
      {
        segment: 'Services',
        value: 320000,
        percentage: 35
      },
      {
        segment: 'Subscriptions',
        value: 150000,
        percentage: 15
      },
      {
        segment: 'Other',
        value: 50000,
        percentage: 5
      }
    ]
  };

  // Load analytics data
  useEffect(() => {
    const loadAnalyticsData = async () => {
      setLoading(true);
      try {
        // Try to fetch from API, fallback to sample data
        const response = await fetch(`/api/finance/analytics?timeframe=${timeframe}`);
        if (response.ok) {
          const data = await response.json();
          setAnalyticsData(data.data || null);
        } else {
          // Use sample data for demonstration
          setAnalyticsData(sampleAnalyticsData);
        }
      } catch (error) {
        console.error('Failed to load analytics data:', error);
        setAnalyticsData(sampleAnalyticsData);
      } finally {
        setLoading(false);
      }
    };

    loadAnalyticsData();
  }, [timeframe]);

  // Helper to format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Calculate max value for trends chart scaling
  const maxTrendValue = analyticsData?.trends.reduce((max, item) => {
    return Math.max(max, item.revenue);
  }, 0) || 0;

  // Get year-over-year growth
  const getGrowthIndicator = (value: number) => {
    if (value > 0) return { trend: 'up' as const, text: `+${value}% vs last year` };
    if (value < 0) return { trend: 'down' as const, text: `${value}% vs last year` };
    return { trend: 'neutral' as const, text: 'No change vs last year' };
  };

  if (loading) {
    return <LoadingState message="Loading financial analytics..." />;
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center text-muted-foreground">
              <h2 className="text-xl font-semibold mb-2">Analytics data unavailable</h2>
              <p>There was a problem loading the analytics data.</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              Financial Analytics
            </h1>
            <p className="text-muted-foreground">
              Advanced financial performance metrics and trends
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-surface text-foreground"
              aria-label="Select timeframe"
            >
              <option value="quarter">Last Quarter</option>
              <option value="6months">Last 6 Months</option>
              <option value="year">Last Year</option>
              <option value="alltime">All Time</option>
            </select>
            
            <button className="flex items-center gap-2 px-3 py-2 border border-border rounded-md hover:bg-muted">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Key Financial Metrics */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Key Financial Metrics</h2>

          <KpiGrid columns={4}>
            <KpiCard
              icon={TrendingUp}
              label="Revenue Growth"
              value={`${analyticsData.kpis.revenue_growth}%`}
              delta={getGrowthIndicator(analyticsData.kpis.revenue_growth).text}
              trend={getGrowthIndicator(analyticsData.kpis.revenue_growth).trend}
              timeframe="Annual"
            />
            <KpiCard
              icon={Percent}
              label="Profit Margin"
              value={`${analyticsData.kpis.profit_margin}%`}
              delta={getGrowthIndicator(analyticsData.kpis.profit_margin - 2.1).text}
              trend={getGrowthIndicator(analyticsData.kpis.profit_margin - 2.1).trend}
              timeframe="Overall"
            />
            <KpiCard
              icon={DollarSign}
              label="Cash Ratio"
              value={analyticsData.kpis.cash_ratio.toFixed(1)}
              delta={getGrowthIndicator(analyticsData.kpis.cash_ratio - 1.5).text}
              trend={getGrowthIndicator(analyticsData.kpis.cash_ratio - 1.5).trend}
              timeframe="Current"
            />
            <KpiCard
              icon={TrendingUp}
              label="ROI"
              value={`${analyticsData.kpis.roi}%`}
              delta={getGrowthIndicator(analyticsData.kpis.roi - 12.8).text}
              trend={getGrowthIndicator(analyticsData.kpis.roi - 12.8).trend}
              timeframe="Average"
            />
          </KpiGrid>
        </div>

        {/* Financial Trends */}
        <div className="p-6 border border-border rounded-lg bg-surface">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-foreground">Financial Trends</h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <span className="text-sm text-muted-foreground">Revenue</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-warning rounded-full"></div>
                <span className="text-sm text-muted-foreground">Expenses</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-success rounded-full"></div>
                <span className="text-sm text-muted-foreground">Profit</span>
              </div>
            </div>
          </div>
          
          {/* Chart */}
          <div className="h-64 relative mt-6">
            <div className="flex justify-between items-end absolute inset-0">
              {analyticsData.trends.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center h-full pt-8">
                  <div className="relative flex-1 w-full max-w-[50px] flex flex-col justify-end gap-1">
                    {/* Profit bar */}
                    <div 
                      className="w-full bg-success/90" 
                      style={{ height: `${(item.profit / maxTrendValue) * 100}%` }}
                      title={`Profit: ${formatCurrency(item.profit)}`}
                    ></div>
                    
                    {/* Expenses bar */}
                    <div 
                      className="w-full bg-warning/80" 
                      style={{ height: `${(item.expenses / maxTrendValue) * 100}%` }}
                      title={`Expenses: ${formatCurrency(item.expenses)}`}
                    ></div>
                    
                    {/* Revenue marker */}
                    <div 
                      className="absolute w-8 h-1 bg-primary left-1/2 transform -translate-x-1/2"
                      style={{ bottom: `${(item.revenue / maxTrendValue) * 100}%` }}
                      title={`Revenue: ${formatCurrency(item.revenue)}`}
                    ></div>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">{item.period}</div>
                </div>
              ))}
            </div>
            
            {/* Y-axis gridlines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="border-t border-muted/30 w-full h-0"></div>
              ))}
            </div>
          </div>
          
          {/* Y-axis labels */}
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <div>$0</div>
            <div>{formatCurrency(maxTrendValue / 2)}</div>
            <div>{formatCurrency(maxTrendValue)}</div>
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 border border-border rounded-lg bg-surface">
            <h2 className="text-xl font-semibold text-foreground mb-6">Revenue Breakdown</h2>
            <div className="space-y-6">
              {analyticsData.segments.map((segment, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{segment.segment}</span>
                    <span className="text-sm">
                      {formatCurrency(segment.value)} ({segment.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        index === 0 ? 'bg-primary' :
                        index === 1 ? 'bg-success' :
                        index === 2 ? 'bg-info' : 'bg-warning'
                      }`} 
                      style={{ width: `${segment.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-6 border border-border rounded-lg bg-surface">
            <h2 className="text-xl font-semibold text-foreground mb-6">Performance Insights</h2>
            <div className="space-y-4">
              <div className="p-4 bg-muted/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-success" />
                  <h3 className="font-medium">Strong Growth</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Revenue is up 8.5% compared to last year, with services growing fastest.
                </p>
              </div>
              
              <div className="p-4 bg-muted/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart2 className="h-5 w-5 text-info" />
                  <h3 className="font-medium">Profit Margin</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  23.2% profit margin exceeds the industry average of 18.5%.
                </p>
              </div>
              
              <div className="p-4 bg-muted/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <PieChart className="h-5 w-5 text-warning" />
                  <h3 className="font-medium">Diversification</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Revenue streams are well-diversified across multiple segments.
                </p>
              </div>
              
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex w-full items-center justify-between mt-4 p-2 text-sm text-primary"
              >
                <span>Advanced metrics</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showDetails ? 'transform rotate-180' : ''}`} />
              </button>
              
              {showDetails && (
                <div className="mt-2 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Debt-to-Equity Ratio</span>
                    <span className="font-medium">0.6</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quick Ratio</span>
                    <span className="font-medium">1.4</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Operating Margin</span>
                    <span className="font-medium">28.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Asset Turnover</span>
                    <span className="font-medium">2.3</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Financial Health Indicators */}
        <div className="p-6 border border-border rounded-lg bg-surface">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">Financial Health Score</h2>
            <div className="px-2 py-1 bg-success/10 text-success rounded-md text-sm font-medium">
              Strong
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="relative h-2 bg-muted rounded-full">
              <div className="absolute h-2 bg-success rounded-full" style={{ width: '85%' }}></div>
              <div className="absolute h-4 w-4 bg-white border-2 border-success rounded-full top-1/2 transform -translate-y-1/2" style={{ left: '85%' }}></div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Liquidity</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-success" style={{ width: '90%' }}></div>
                  </div>
                  <span className="text-xs font-medium">9.0</span>
                </div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground mb-1">Solvency</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-success" style={{ width: '85%' }}></div>
                  </div>
                  <span className="text-xs font-medium">8.5</span>
                </div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground mb-1">Profitability</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-info" style={{ width: '75%' }}></div>
                  </div>
                  <span className="text-xs font-medium">7.5</span>
                </div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground mb-1">Growth</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-success" style={{ width: '82%' }}></div>
                  </div>
                  <span className="text-xs font-medium">8.2</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-muted/20 rounded-lg">
            <h3 className="text-sm font-medium mb-2">Financial Health Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Your financial health score is in the <span className="text-success font-medium">top 15%</span> of similar organizations. 
              Strong liquidity and healthy profit margins contribute to your excellent financial position. 
              Consider reinvesting in growth areas while maintaining your current debt management strategy.
            </p>
          </div>
        </div>
        
        {/* Bottom CTA */}
        <div className="flex justify-end">
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
            <FileText className="h-4 w-4" />
            <span>Generate Full Report</span>
          </button>
        </div>
      </div>
    </div>
  );
}
