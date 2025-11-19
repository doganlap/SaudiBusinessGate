'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  BarChart3, TrendingUp, Users, DollarSign, Activity,
  Brain, Target, Zap, ChevronRight, Eye, Settings,
  FileText, CheckCircle, Clock, XCircle, AlertTriangle,
  Filter, Download, RefreshCw, Search, Calendar,
  Globe, Award, Shield, Database, Cpu
} from 'lucide-react';

// Dynamically import Plotly components to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { 
  ssr: false,
  loading: () => (
    <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-sm text-gray-600">Loading chart...</p>
      </div>
    </div>
  )
});

const PlotWrapper = (props: { data: any[]; layout?: any; config?: any }) => {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Plot data={props.data} layout={props.layout} config={props.config} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

interface RFPLifecycleStage {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  count: number;
  value: number;
  color: string;
  status: 'active' | 'completed' | 'pending' | 'lost';
}

type KpiCard = {
  title: string;
  titleAr: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  description: string;
};

interface PivotTableData {
  [key: string]: any;
}

interface AnalyticsMetrics {
  totalRevenue: number;
  totalDeals: number;
  conversionRate: number;
  avgDealSize: number;
  customerLifetimeValue: number;
  churnRate: number;
  growthRate: number;
  roi: number;
  activeUsers: number;
  systemUptime: number;
  aiAccuracy: number;
  responseTime: number;
}

export default function AnalyticsPage() {
  const params = useParams();
  const lng = params.lng as string;
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [rfpLifecycleData, setRfpLifecycleData] = useState<RFPLifecycleStage[]>([]);
  const [pivotData, setPivotData] = useState<PivotTableData[]>([]);
  const [analyticsMetrics, setAnalyticsMetrics] = useState<AnalyticsMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [globalSearch, setGlobalSearch] = useState('');
  const [selectedColumns, setSelectedColumns] = useState(['region', 'product', 'revenue', 'quantity', 'count']);
  const [sortColumn, setSortColumn] = useState('revenue');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const kpiCards: KpiCard[] = [
    {
      title: lng === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenue',
      titleAr: 'إجمالي الإيرادات',
      value: '2,850,000 ر.س',
      change: '+24.7%',
      trend: 'up',
      icon: <DollarSign className="h-6 w-6" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: lng === 'ar' ? 'إيرادات هذا الشهر' : 'Monthly revenue'
    },
    {
      title: lng === 'ar' ? 'المستخدمون النشطون' : 'Active Users',
      titleAr: 'المستخدمون النشطون',
      value: '12,450',
      change: '+18.2%',
      trend: 'up',
      icon: <Users className="h-6 w-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: lng === 'ar' ? 'مستخدمون نشطون' : 'Active users'
    },
    {
      title: lng === 'ar' ? 'معدل التحويل' : 'Conversion Rate',
      titleAr: 'معدل التحويل',
      value: '32.5%',
      change: '+5.1%',
      trend: 'up',
      icon: <Target className="h-6 w-6" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: lng === 'ar' ? 'معدل تحويل العملاء' : 'Lead conversion rate'
    },
    {
      title: lng === 'ar' ? 'قيمة العميل مدى الحياة' : 'Customer LTV',
      titleAr: 'قيمة العميل مدى الحياة',
      value: '45,250 ر.س',
      change: '+12.8%',
      trend: 'up',
      icon: <Award className="h-6 w-6" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      description: lng === 'ar' ? 'متوسط قيمة العميل' : 'Average customer lifetime value'
    },
    {
      title: lng === 'ar' ? 'العائد على الاستثمار' : 'ROI',
      titleAr: 'العائد على الاستثمار',
      value: '185.3%',
      change: '+22.4%',
      trend: 'up',
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100',
      description: lng === 'ar' ? 'العائد على الاستثمارات' : 'Return on investment'
    },
    {
      title: lng === 'ar' ? 'دقة الذكاء الاصطناعي' : 'AI Accuracy',
      titleAr: 'دقة الذكاء الاصطناعي',
      value: '94.7%',
      change: '+3.2%',
      trend: 'up' as const,
      icon: <Brain className="h-6 w-6" />,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      description: lng === 'ar' ? 'دقة نماذج الذكاء الاصطناعي' : 'AI model accuracy rate'
    }
  ];

  const rfpStages: RFPLifecycleStage[] = [
    { id: 'rfp1', name: 'Leads', nameAr: 'فرص', description: 'New leads', descriptionAr: 'فرص جديدة', count: 45, value: 120000, color: '#3B82F6', status: 'active' },
    { id: 'rfp2', name: 'Qualified', nameAr: 'مؤهل', description: 'Qualified leads', descriptionAr: 'فرص مؤهلة', count: 32, value: 98000, color: '#10B981', status: 'active' },
    { id: 'rfp3', name: 'Proposal', nameAr: 'عرض', description: 'Proposal sent', descriptionAr: 'تم إرسال العرض', count: 24, value: 82000, color: '#F59E0B', status: 'active' },
    { id: 'rfp4', name: 'Negotiation', nameAr: 'تفاوض', description: 'Negotiation phase', descriptionAr: 'مرحلة التفاوض', count: 15, value: 60000, color: '#8B5CF6', status: 'active' },
    { id: 'rfp5', name: 'Won', nameAr: 'فوز', description: 'Deals won', descriptionAr: 'صفقات فائزة', count: 9, value: 54000, color: '#22C55E', status: 'completed' },
    { id: 'rfp6', name: 'Lost', nameAr: 'خسارة', description: 'Deals lost', descriptionAr: 'صفقات خاسرة', count: 5, value: 15000, color: '#EF4444', status: 'lost' },
  ];

  // Enhanced Animated Plotly Charts - 4 Advanced Charts
  const animatedRevenueChart = {
    data: [{
      type: 'scatter',
      mode: 'lines+markers',
      x: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      y: [120000, 135000, 118000, 142000, 158000, 165000, 172000, 185000, 195000, 210000, 225000, 235000],
      line: { 
        color: '#3B82F6', 
        width: 4,
        shape: 'spline'
      },
      marker: { 
        color: '#3B82F6', 
        size: 8,
        symbol: 'circle'
      },
      name: lng === 'ar' ? 'الإيرادات الشهرية' : 'Monthly Revenue'
    }],
    layout: {
      title: {
        text: lng === 'ar' ? 'اتجاهات الإيرادات الشهرية المتحركة' : 'Animated Monthly Revenue Trends',
        font: { size: 16 }
      },
      xaxis: { 
        title: lng === 'ar' ? 'الشهر' : 'Month',
        showgrid: false
      },
      yaxis: { 
        title: lng === 'ar' ? 'الإيرادات (ر.س)' : 'Revenue (SAR)',
        showgrid: true,
        gridcolor: '#f0f0f0'
      },
      font: { family: 'Inter, sans-serif' },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      margin: { l: 60, r: 30, t: 60, b: 50 },
      showlegend: false,
      updatemenus: [{
        type: 'buttons',
        buttons: [{
          label: lng === 'ar' ? 'تشغيل' : 'Play',
          method: 'animate',
          args: [null, {
            mode: 'immediate',
            frame: { duration: 500, redraw: true },
            fromcurrent: true,
            transition: { duration: 300 }
          }]
        }, {
          label: lng === 'ar' ? 'إيقاف' : 'Pause',
          method: 'animate',
          args: [[null], {
            mode: 'immediate',
            frame: { duration: 0, redraw: false },
            transition: { duration: 0 }
          }]
        }]
      }]
    },
    frames: Array.from({ length: 12 }, (_, i) => ({
      data: [{
        type: 'scatter',
        mode: 'lines+markers',
        x: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].slice(0, i + 1),
        y: [120000, 135000, 118000, 142000, 158000, 165000, 172000, 185000, 195000, 210000, 225000, 235000].slice(0, i + 1),
        line: { color: '#3B82F6', width: 4, shape: 'spline' },
        marker: { color: '#3B82F6', size: 8 }
      }]
    })),
    config: { 
      responsive: true,
      displayModeBar: true,
      displaylogo: false,
      modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'autoScale2d']
    }
  };

  const animatedCustomerChart = {
    data: [{
      type: 'bar',
      x: ['Enterprise', 'SMB', 'Startup', 'Government', 'Education'],
      y: [35, 28, 18, 12, 7],
      marker: {
        color: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'],
        opacity: 0.8
      },
      name: lng === 'ar' ? 'العملاء' : 'Customers'
    }],
    layout: {
      title: {
        text: lng === 'ar' ? 'توزيع العملاء حسب القطاع (متحرك)' : 'Animated Customer Distribution by Segment',
        font: { size: 16 }
      },
      xaxis: { 
        title: lng === 'ar' ? 'القطاع' : 'Segment',
        showgrid: false
      },
      yaxis: { 
        title: lng === 'ar' ? 'النسبة المئوية (%)' : 'Percentage (%)',
        showgrid: true,
        gridcolor: '#f0f0f0'
      },
      font: { family: 'Inter, sans-serif' },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      margin: { l: 60, r: 30, t: 60, b: 80 },
      showlegend: false,
      updatemenus: [{
        type: 'buttons',
        x: 0.1,
        y: 1.1,
        buttons: [{
          label: lng === 'ar' ? 'شريط' : 'Bar',
          method: 'restyle',
          args: ['type', 'bar']
        }, {
          label: lng === 'ar' ? 'دائري' : 'Pie',
          method: 'restyle',
          args: ['type', 'pie']
        }]
      }]
    },
    config: { 
      responsive: true,
      displayModeBar: true,
      displaylogo: false
    }
  };

  const animatedPerformanceChart = {
    data: [{
      type: 'heatmap',
      z: [
        [0.8, 0.9, 0.7, 0.85, 0.92, 0.88],
        [0.75, 0.82, 0.88, 0.91, 0.85, 0.94],
        [0.9, 0.85, 0.78, 0.92, 0.87, 0.91],
        [0.88, 0.94, 0.86, 0.89, 0.93, 0.96],
        [0.92, 0.87, 0.91, 0.94, 0.89, 0.98],
        [0.85, 0.91, 0.94, 0.87, 0.92, 0.95]
      ],
      x: ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6'],
      y: ['Revenue', 'Conversion', 'Retention', 'Satisfaction', 'Efficiency', 'Growth'],
      colorscale: [
        [0, '#EF4444'], [0.2, '#F97316'], [0.4, '#F59E0B'], 
        [0.6, '#EAB308'], [0.8, '#84CC16'], [1, '#22C55E']
      ],
      showscale: true
    }],
    layout: {
      title: {
        text: lng === 'ar' ? 'خريطة الأداء الحرارية المتحركة' : 'Animated Performance Heatmap',
        font: { size: 16 }
      },
      font: { family: 'Inter, sans-serif' },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      margin: { l: 100, r: 50, t: 60, b: 50 },
      updatemenus: [{
        type: 'buttons',
        x: 0.05,
        y: 1.1,
        buttons: [{
          label: lng === 'ar' ? 'تشغيل' : 'Animate',
          method: 'animate',
          args: [null, {
            mode: 'immediate',
            frame: { duration: 800, redraw: true },
            fromcurrent: true,
            transition: { duration: 500 }
          }]
        }]
      }]
    },
    frames: Array.from({ length: 6 }, (_, i) => ({
      data: [{
        type: 'heatmap',
        z: [
          [0.8, 0.9, 0.7, 0.85, 0.92, 0.88].slice(0, i + 1),
          [0.75, 0.82, 0.88, 0.91, 0.85, 0.94].slice(0, i + 1),
          [0.9, 0.85, 0.78, 0.92, 0.87, 0.91].slice(0, i + 1),
          [0.88, 0.94, 0.86, 0.89, 0.93, 0.96].slice(0, i + 1),
          [0.92, 0.87, 0.91, 0.94, 0.89, 0.98].slice(0, i + 1),
          [0.85, 0.91, 0.94, 0.87, 0.92, 0.95].slice(0, i + 1)
        ],
        x: ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6'].slice(0, i + 1),
        y: ['Revenue', 'Conversion', 'Retention', 'Satisfaction', 'Efficiency', 'Growth'],
        colorscale: [
          [0, '#EF4444'], [0.2, '#F97316'], [0.4, '#F59E0B'], 
          [0.6, '#EAB308'], [0.8, '#84CC16'], [1, '#22C55E']
        ]
      }]
    })),
    config: { 
      responsive: true,
      displayModeBar: true,
      displaylogo: false
    }
  };

  const animatedConversionChart = {
    data: [{
      type: 'waterfall',
      x: rfpLifecycleData.map(stage => lng === 'ar' ? stage.nameAr : stage.name),
      y: rfpLifecycleData.map(stage => stage.count),
      measure: rfpLifecycleData.map(stage => stage.status === 'completed' ? 'relative' : 'relative'),
      decreasing: { marker: { color: '#EF4444' } },
      increasing: { marker: { color: '#22C55E' } },
      totals: { marker: { color: '#3B82F6' } }
    }],
    layout: {
      title: {
        text: lng === 'ar' ? 'مخطط شلال التحويل المتحرك' : 'Animated Conversion Waterfall',
        font: { size: 16 }
      },
      xaxis: { 
        title: lng === 'ar' ? 'مراحل دورة الحياة' : 'Lifecycle Stages',
        tickangle: -45
      },
      yaxis: { 
        title: lng === 'ar' ? 'العدد' : 'Count',
        showgrid: true,
        gridcolor: '#f0f0f0'
      },
      font: { family: 'Inter, sans-serif' },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      margin: { l: 60, r: 30, t: 60, b: 120 },
      showlegend: false
    },
    config: { 
      responsive: true,
      displayModeBar: true,
      displaylogo: false
    }
  };

  // Sample pivot table data
  const generatePivotData = () => {
    const data: PivotTableData[] = [];
    const products = ['Software License', 'Cloud Services', 'Consulting', 'Training', 'Support'];
    const regions = ['Riyadh', 'Jeddah', 'Dammam', 'Medina', 'Mecca'];
    const quarters = ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024'];

    for (let i = 0; i < 100; i++) {
      data.push({
        id: `deal-${i + 1}`,
        product: products[Math.floor(Math.random() * products.length)],
        region: regions[Math.floor(Math.random() * regions.length)],
        quarter: quarters[Math.floor(Math.random() * quarters.length)],
        revenue: Math.floor(Math.random() * 50000) + 10000,
        quantity: Math.floor(Math.random() * 10) + 1,
        customerType: Math.random() > 0.5 ? 'Enterprise' : 'SMB',
        dealSize: Math.random() > 0.7 ? 'Large' : Math.random() > 0.4 ? 'Medium' : 'Small'
      });
    }
    return data;
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Simulate API calls
        await new Promise(resolve => setTimeout(resolve, 1000));

        setRfpLifecycleData(rfpStages);
        setPivotData(generatePivotData());
        setAnalyticsMetrics({
          totalRevenue: 2850000,
          totalDeals: 158,
          conversionRate: 32.5,
          avgDealSize: 18037,
          customerLifetimeValue: 45250,
          churnRate: 8.2,
          growthRate: 24.7,
          roi: 185.3,
          activeUsers: 12450,
          systemUptime: 99.9,
          aiAccuracy: 94.7,
          responseTime: 45
        });
      } catch (error) {
        console.error('Error loading analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedTimeframe]);

  // Filtered and sorted pivot data
  const filteredPivotData = useMemo(() => {
    let data = pivotData;

    // Apply global search
    if (globalSearch) {
      data = data.filter(item =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(globalSearch.toLowerCase())
        )
      );
    }

    // Sort data
    data.sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      return sortDirection === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });

    return data;
  }, [pivotData, globalSearch, sortColumn, sortDirection]);

  // Handle column sorting
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  // Plotly chart configurations
  const rfpFunnelChart = {
    data: [{
      type: 'funnel',
      y: rfpLifecycleData.map(stage => lng === 'ar' ? stage.nameAr : stage.name),
      x: rfpLifecycleData.map(stage => stage.count),
      textinfo: 'value+percent initial',
      textposition: 'inside',
      marker: {
        color: rfpLifecycleData.map(stage => stage.color),
        line: { width: 2, color: 'white' }
      },
      connector: { line: { color: 'silver', dash: 'dot', width: 2 } }
    }],
    layout: {
      title: lng === 'ar' ? 'دورة حياة طلبات عروض الأسعار' : 'RFP Lifecycle Funnel',
      font: { family: 'Arial, sans-serif' },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      margin: { l: 150, r: 50, t: 80, b: 50 }
    },
    config: { responsive: true }
  };

  const revenueTrendChart = {
    data: [{
      type: 'scatter',
      mode: 'lines+markers',
      x: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      y: [120000, 135000, 118000, 142000, 158000, 165000, 172000, 185000, 195000, 210000, 225000, 235000],
      line: { color: '#3B82F6', width: 3 },
      marker: { color: '#3B82F6', size: 8 }
    }],
    layout: {
      title: lng === 'ar' ? 'اتجاهات الإيرادات الشهرية' : 'Monthly Revenue Trends',
      xaxis: { title: lng === 'ar' ? 'الشهر' : 'Month' },
      yaxis: { title: lng === 'ar' ? 'الإيرادات ($)' : 'Revenue ($)' },
      font: { family: 'Arial, sans-serif' },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)'
    },
    config: { responsive: true }
  };

  const customerSegmentChart = {
    data: [{
      type: 'pie',
      labels: ['Enterprise', 'SMB', 'Startup', 'Government', 'Education'],
      values: [35, 28, 18, 12, 7],
      marker: {
        colors: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444']
      },
      textinfo: 'label+percent',
      textposition: 'outside'
    }],
    layout: {
      title: lng === 'ar' ? 'توزيع العملاء حسب القطاع' : 'Customer Distribution by Segment',
      font: { family: 'Arial, sans-serif' },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      showlegend: true
    },
    config: { responsive: true }
  };

  const performanceHeatmap = {
    data: [{
      type: 'heatmap',
      z: [
        [0.8, 0.9, 0.7, 0.85],
        [0.75, 0.82, 0.88, 0.91],
        [0.9, 0.85, 0.78, 0.92],
        [0.88, 0.94, 0.86, 0.89]
      ],
      x: ['Q1', 'Q2', 'Q3', 'Q4'],
      y: ['Revenue', 'Conversion', 'Retention', 'Satisfaction'],
      colorscale: 'Viridis'
    }],
    layout: {
      title: lng === 'ar' ? 'خريطة حرارية للأداء' : 'Performance Heatmap',
      font: { family: 'Arial, sans-serif' },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)'
    },
    config: { responsive: true }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{lng === 'ar' ? 'جاري تحميل لوحة التحليلات المتقدمة...' : 'Loading advanced analytics dashboard...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {lng === 'ar' ? 'التحليلات المتقدمة والرؤى' : 'Advanced Analytics & Insights'}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {lng === 'ar' ? 'لوحة تحكم تحليلية متقدمة مع مخططات تفاعلية ورؤى ذكية' : 'Advanced analytics dashboard with interactive charts and intelligent insights'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Global Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder={lng === 'ar' ? 'البحث العام...' : 'Global Search...'}
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="7d">{lng === 'ar' ? 'آخر 7 أيام' : 'Last 7 days'}</option>
                <option value="30d">{lng === 'ar' ? 'آخر 30 يوم' : 'Last 30 days'}</option>
                <option value="90d">{lng === 'ar' ? 'آخر 90 يوم' : 'Last 90 days'}</option>
                <option value="1y">{lng === 'ar' ? 'آخر سنة' : 'Last year'}</option>
              </select>
              <button className="p-2 text-gray-400 hover:text-gray-600" title="Refresh Data">
                <RefreshCw className="h-6 w-6" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600" title="Export Data">
                <Download className="h-6 w-6" />
              </button>
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Brain className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced KPI Cards - 6 Cards */}
        {analyticsMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {kpiCards.map((card, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${card.bgColor}`}>
                    <div className={card.color}>
                      {card.icon}
                    </div>
                  </div>
                  <div className={`flex items-center ${card.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    <TrendingUp className={`h-4 w-4 ${card.trend === 'down' && 'transform rotate-180'}`} />
                    <span className="text-sm font-medium ml-1">{card.change}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{card.title}</h3>
                  <p className="text-2xl font-bold text-gray-900 mb-2">{card.value}</p>
                  <p className="text-sm text-gray-600">{card.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* RFP Lifecycle Section */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {lng === 'ar' ? 'دورة حياة طلبات عروض الأسعار (RFP)' : 'Request for Proposal (RFP) Lifecycle'}
            </h2>
            <p className="text-sm text-gray-600">
              {lng === 'ar' ? 'تتبع كامل لعملية طلبات عروض الأسعار من الاستلام إلى التنفيذ' : 'Complete tracking of RFP process from receipt to implementation'}
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* RFP Funnel Chart */}
              <div>
                <h3 className="text-md font-semibold text-gray-900 mb-4">
                  {lng === 'ar' ? 'مخطط قمع دورة الحياة' : 'Lifecycle Funnel Chart'}
                </h3>
                <div className="h-96">
                  <PlotWrapper {...rfpFunnelChart} />
                </div>
              </div>

              {/* RFP Stages Details */}
              <div>
                <h3 className="text-md font-semibold text-gray-900 mb-4">
                  {lng === 'ar' ? 'مراحل دورة الحياة' : 'Lifecycle Stages'}
                </h3>
                <div className="space-y-4">
                  {rfpLifecycleData.map((stage) => (
                    <div key={stage.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <div
                          className="w-4 h-4 rounded-full mr-3"
                          style={{ backgroundColor: stage.color }}
                        ></div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {lng === 'ar' ? stage.nameAr : stage.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {lng === 'ar' ? stage.descriptionAr : stage.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{stage.count}</p>
                        <p className="text-sm text-gray-600">{stage.value.toLocaleString()} ر.س</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Animated Charts - 4 Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Animated Revenue Chart */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {lng === 'ar' ? 'اتجاهات الإيرادات المتحركة' : 'Animated Revenue Trends'}
              </h3>
            </div>
            <div className="p-6">
              <div className="h-80">
                <PlotWrapper {...animatedRevenueChart} />
              </div>
            </div>
          </div>

          {/* Animated Customer Chart */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {lng === 'ar' ? 'توزيع العملاء المتحرك' : 'Animated Customer Distribution'}
              </h3>
            </div>
            <div className="p-6">
              <div className="h-80">
                <PlotWrapper {...animatedCustomerChart} />
              </div>
            </div>
          </div>

          {/* Animated Performance Chart */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {lng === 'ar' ? 'خريطة الأداء الحرارية المتحركة' : 'Animated Performance Heatmap'}
              </h3>
            </div>
            <div className="p-6">
              <div className="h-80">
                <PlotWrapper {...animatedPerformanceChart} />
              </div>
            </div>
          </div>

          {/* Animated Conversion Chart */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {lng === 'ar' ? 'مخطط شلال التحويل المتحرك' : 'Animated Conversion Waterfall'}
              </h3>
            </div>
            <div className="p-6">
              <div className="h-80">
                <PlotWrapper {...animatedConversionChart} />
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Pivot Table Section */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {lng === 'ar' ? 'جدول محوري تفاعلي' : 'Interactive Pivot Table'}
                </h2>
                <p className="text-sm text-gray-600">
                  {lng === 'ar' ? 'تحليل البيانات التفاعلي حسب المناطق والمنتجات' : 'Interactive data analysis by regions and products'}
                </p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm">
                  <Filter className="h-4 w-4 inline mr-2" />
                  {lng === 'ar' ? 'تصفية' : 'Filter'}
                </button>
                <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm">
                  <Download className="h-4 w-4 inline mr-2" />
                  {lng === 'ar' ? 'تصدير' : 'Export'}
                </button>
              </div>
            </div>
          </div>
          <div className="p-6">
            {/* Column Selection */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                {lng === 'ar' ? 'اختيار الأعمدة' : 'Column Selection'}
              </h4>
              <div className="flex flex-wrap gap-2">
                {['region', 'product', 'revenue', 'quantity', 'count', 'customerType', 'dealSize', 'quarter'].map((column) => (
                  <label key={column} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedColumns.includes(column)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedColumns([...selectedColumns, column]);
                        } else {
                          setSelectedColumns(selectedColumns.filter(col => col !== column));
                        }
                      }}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700 capitalize">
                      {lng === 'ar' ? {
                        region: 'المنطقة',
                        product: 'المنتج',
                        revenue: 'الإيرادات (ر.س)',
                        quantity: 'الكمية',
                        count: 'العدد',
                        customerType: 'نوع العميل',
                        dealSize: 'حجم الصفقة',
                        quarter: 'الربع'
                      }[column] : column === 'revenue' ? 'Revenue (SAR)' : column}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Interactive Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {selectedColumns.map((column) => (
                      <th
                        key={column}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort(column)}
                      >
                        <div className="flex items-center">
                          <span>
                            {lng === 'ar' ? {
                              region: 'المنطقة',
                              product: 'المنتج',
                              revenue: 'الإيرادات (ر.س)',
                              quantity: 'الكمية',
                              count: 'العدد',
                              customerType: 'نوع العميل',
                              dealSize: 'حجم الصفقة',
                              quarter: 'الربع'
                            }[column] : column === 'revenue' ? 'Revenue (SAR)' : column}
                          </span>
                          {sortColumn === column && (
                            <span className="ml-1">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPivotData.slice(0, 25).map((row: any, index: number) => (
                    <tr key={index} className="hover:bg-gray-50">
                      {selectedColumns.map((column) => (
                        <td key={column} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {column === 'revenue' ? `${row[column]?.toLocaleString() || 0} ر.س` : row[column] || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
              <span>
                {lng === 'ar' 
                  ? `عرض ${Math.min(filteredPivotData.length, 25)} من أصل ${filteredPivotData.length} صف` 
                  : `Showing ${Math.min(filteredPivotData.length, 25)} of ${filteredPivotData.length} rows`
                }
              </span>
              <div className="flex gap-2">
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
                  {lng === 'ar' ? 'السابق' : 'Previous'}
                </button>
                <button className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                  {lng === 'ar' ? 'التالي' : 'Next'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* AI Insights Section */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow text-white mb-8">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold mb-2">
                  {lng === 'ar' ? 'رؤى الذكاء الاصطناعي المتقدمة' : 'Advanced AI Insights Engine'}
                </h2>
                <p className="text-blue-100">
                  {lng === 'ar' ? 'محرك تحليلي ذكي يعالج 50+ نموذجاً و15 مؤشراً أداء رئيسياً' : 'Intelligent analytics engine processing 50+ models and 15 key performance indicators'}
                </p>
                <div className="flex items-center mt-4 space-x-6">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                    <span className="text-sm">{lng === 'ar' ? 'النماذج نشطة' : 'Models Active'}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></div>
                    <span className="text-sm">{lng === 'ar' ? 'معالجة البيانات' : 'Processing Data'}</span>
                  </div>
                  <div className="flex items-center">
                    <Zap className="h-4 w-4 mr-1" />
                    <span className="text-sm">{lng === 'ar' ? 'تحديث فوري' : 'Real-time Updates'}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">50+</div>
                <div className="text-blue-100">{lng === 'ar' ? 'نموذج ذكي نشط' : 'Active AI Models'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
