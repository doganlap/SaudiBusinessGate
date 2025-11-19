'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  TrendingUp,
  DollarSign,
  Users,
  FileText,
  Target,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  ChevronRight,
  Plus,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle
} from 'lucide-react';

interface SalesLifecycleStage {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  count: number;
  value: number;
  color: string;
  status: 'active' | 'completed' | 'pending' | 'lost';
  icon: React.ReactNode;
  conversionRate: number;
}

interface SalesStats {
  totalRevenue: number;
  totalQuotes: number;
  activeQuotes: number;
  conversionRate: number;
  totalCustomers: number;
  monthlyGrowth: number;
}

export default function SalesPage() {
  const params = useParams();
  const lng = params.lng as string || 'en';
  const [stats, setStats] = useState<SalesStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStage, setSelectedStage] = useState<string>('all');

  // Complete Sales Lifecycle Stages
  const salesLifecycleStages: SalesLifecycleStage[] = [
    {
      id: 'lead-generation',
      name: 'Lead Generation',
      nameAr: 'توليد العملاء المحتملين',
      description: 'Identify and capture potential customers',
      descriptionAr: 'تحديد والتقاط العملاء المحتملين',
      count: 250,
      value: 12500000,
      color: '#3B82F6',
      status: 'active',
      icon: <Users className="h-5 w-5" />,
      conversionRate: 100
    },
    {
      id: 'lead-qualification',
      name: 'Lead Qualification',
      nameAr: 'تأهيل العملاء المحتملين',
      description: 'Assess lead quality and buying potential',
      descriptionAr: 'تقييم جودة العميل المحتمل وإمكانية الشراء',
      count: 180,
      value: 9000000,
      color: '#F59E0B',
      status: 'active',
      icon: <Target className="h-5 w-5" />,
      conversionRate: 72
    },
    {
      id: 'proposal-creation',
      name: 'Proposal Creation',
      nameAr: 'إنشاء العرض',
      description: 'Develop customized proposals and quotes',
      descriptionAr: 'تطوير عروض وأسعار مخصصة',
      count: 120,
      value: 6000000,
      color: '#8B5CF6',
      status: 'active',
      icon: <FileText className="h-5 w-5" />,
      conversionRate: 67
    },
    {
      id: 'negotiation',
      name: 'Negotiation',
      nameAr: 'التفاوض',
      description: 'Price and terms negotiation process',
      descriptionAr: 'عملية التفاوض على السعر والشروط',
      count: 85,
      value: 4250000,
      color: '#10B981',
      status: 'active',
      icon: <TrendingUp className="h-5 w-5" />,
      conversionRate: 71
    },
    {
      id: 'closing-won',
      name: 'Closing - Won',
      nameAr: 'الإغلاق - فوز',
      description: 'Successful deal closure and contract signing',
      descriptionAr: 'إغلاق الصفقة بنجاح وتوقيع العقد',
      count: 58,
      value: 2900000,
      color: '#06B6D4',
      status: 'completed',
      icon: <CheckCircle className="h-5 w-5" />,
      conversionRate: 68
    },
    {
      id: 'implementation',
      name: 'Implementation & Delivery',
      nameAr: 'التنفيذ والتسليم',
      description: 'Project delivery and customer onboarding',
      descriptionAr: 'تسليم المشروع وإعداد العميل',
      count: 42,
      value: 2100000,
      color: '#84CC16',
      status: 'completed',
      icon: <Clock className="h-5 w-5" />,
      conversionRate: 72
    },
    {
      id: 'post-sale-support',
      name: 'Post-Sale Support',
      nameAr: 'الدعم بعد البيع',
      description: 'Ongoing customer success and support',
      descriptionAr: 'النجاح المستمر للعميل والدعم',
      count: 35,
      value: 1750000,
      color: '#6366F1',
      status: 'active',
      icon: <Activity className="h-5 w-5" />,
      conversionRate: 83
    },
    {
      id: 'lost-deals',
      name: 'Lost Deals',
      nameAr: 'الصفقات المفقودة',
      description: 'Analysis of lost opportunities',
      descriptionAr: 'تحليل الفرص المفقودة',
      count: 27,
      value: 0,
      color: '#EF4444',
      status: 'lost',
      icon: <XCircle className="h-5 w-5" />,
      conversionRate: 0
    }
  ];

  const filteredStages = selectedStage === 'all' 
    ? salesLifecycleStages 
    : salesLifecycleStages.filter(stage => stage.status === selectedStage);

  const totalPipelineValue = salesLifecycleStages
    .filter(stage => stage.status !== 'lost')
    .reduce((sum, stage) => sum + stage.value, 0);

  const wonDealsValue = salesLifecycleStages
    .filter(stage => stage.status === 'completed')
    .reduce((sum, stage) => sum + stage.value, 0);

  const conversionFunnel = salesLifecycleStages.map((stage, index) => ({
    stage: lng === 'ar' ? stage.nameAr : stage.name,
    count: stage.count,
    value: stage.value,
    conversion: stage.conversionRate
  }));

  useEffect(() => {
    fetchSalesStats();
  }, []);

  const fetchSalesStats = async () => {
    try {
      setLoading(true);
      // Try to fetch from API, fallback to demo data
      const response = await fetch('/api/sales/stats').catch(() => null);

      if (response?.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        // Fallback demo data
        setStats({
          totalRevenue: 285000,
          totalQuotes: 47,
          activeQuotes: 23,
          conversionRate: 68.5,
          totalCustomers: 156,
          monthlyGrowth: 12.3
        });
      }
    } catch (error) {
      console.error('Failed to fetch sales stats:', error);
      setStats({
        totalRevenue: 285000,
        totalQuotes: 47,
        activeQuotes: 23,
        conversionRate: 68.5,
        totalCustomers: 156,
        monthlyGrowth: 12.3
      });
    } finally {
      setLoading(false);
    }
  };

  const salesModules = [
    {
      key: 'quotes',
      name: lng === 'ar' ? 'إدارة عروض الأسعار' : 'Quote Management',
      href: '/(platform)/sales/quotes',
      icon: FileText,
      description: lng === 'ar' ? 'إنشاء وإدارة عروض الأسعار والمقترحات' : 'Create and manage sales quotes and proposals',
      color: 'bg-blue-50 border-blue-200 text-blue-700',
      bgColor: 'bg-blue-500',
      stats: stats?.totalQuotes || 47
    },
    {
      key: 'leads',
      name: lng === 'ar' ? 'إدارة العملاء المحتملين' : 'Lead Management',
      href: '/(platform)/sales/leads',
      icon: Users,
      description: lng === 'ar' ? 'تتبع وإدارة العملاء المحتملين والفرص' : 'Track and manage leads and opportunities',
      color: 'bg-green-50 border-green-200 text-green-700',
      bgColor: 'bg-green-500',
      stats: stats?.totalCustomers || 156
    },
    {
      key: 'deals',
      name: lng === 'ar' ? 'إدارة الصفقات' : 'Deal Management',
      href: '/(platform)/sales/deals',
      icon: Target,
      description: lng === 'ar' ? 'مراقبة تقدم الصفقات ومعدلات التحويل' : 'Monitor deal progress and conversion rates',
      color: 'bg-purple-50 border-purple-200 text-purple-700',
      bgColor: 'bg-purple-500',
      stats: `${stats?.conversionRate || 68.5}%`
    },
    {
      key: 'pipeline',
      name: lng === 'ar' ? 'خط الأنابيب' : 'Sales Pipeline',
      href: '/(platform)/sales/pipeline',
      icon: BarChart3,
      description: lng === 'ar' ? 'نظرة عامة على خط أنابيب المبيعات' : 'Sales pipeline overview and analytics',
      color: 'bg-orange-50 border-orange-200 text-orange-700',
      bgColor: 'bg-orange-500',
      stats: stats?.activeQuotes || 23
    },
    {
      key: 'analytics',
      name: lng === 'ar' ? 'تحليلات المبيعات' : 'Sales Analytics',
      href: '/(platform)/sales/analytics',
      icon: PieChart,
      description: lng === 'ar' ? 'تقارير وتحليلات أداء المبيعات' : 'Sales performance reports and analytics',
      color: 'bg-red-50 border-red-200 text-red-700',
      bgColor: 'bg-red-500',
      stats: `+${stats?.monthlyGrowth || 12.3}%`
    },
    {
      key: 'forecasting',
      name: lng === 'ar' ? 'التنبؤ بالمبيعات' : 'Sales Forecasting',
      href: '/(platform)/sales/forecasting',
      icon: TrendingUp,
      description: lng === 'ar' ? 'التنبؤ بالمبيعات المستقبلية والتخطيط' : 'Predict future sales and planning',
      color: 'bg-cyan-50 border-cyan-200 text-cyan-700',
      bgColor: 'bg-cyan-500',
      stats: lng === 'ar' ? 'قريباً' : 'Coming Soon'
    }
  ];

  const quickActions = [
    {
      title: lng === 'ar' ? 'عرض أسعار جديد' : 'New Quote',
      description: lng === 'ar' ? 'إنشاء عرض أسعار لعميل جديد' : 'Create a quote for a new customer',
      icon: Plus,
      href: '/(platform)/sales/quotes/create',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: lng === 'ar' ? 'إضافة عميل محتمل' : 'Add Lead',
      description: lng === 'ar' ? 'تسجيل عميل محتمل جديد' : 'Register a new potential customer',
      icon: Users,
      href: '/(platform)/sales/leads/create',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: lng === 'ar' ? 'عرض التقارير' : 'View Reports',
      description: lng === 'ar' ? 'مراجعة تقارير أداء المبيعات' : 'Review sales performance reports',
      icon: BarChart3,
      href: '/(platform)/sales/analytics',
      color: 'bg-purple-500 hover:bg-purple-600'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{lng === 'ar' ? 'جاري تحميل بيانات المبيعات...' : 'Loading sales data...'}</p>
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
                {lng === 'ar' ? 'إدارة دورة حياة المبيعات' : 'Sales Lifecycle Management'}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {lng === 'ar' ? 'نظرة شاملة على عملية المبيعات الكاملة من العميل المحتمل إلى الدعم بعد البيع' : 'Complete overview of the sales process from lead to post-sale support'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">{lng === 'ar' ? 'جميع المراحل' : 'All Stages'}</option>
                <option value="active">{lng === 'ar' ? 'نشط' : 'Active'}</option>
                <option value="completed">{lng === 'ar' ? 'مكتمل' : 'Completed'}</option>
                <option value="lost">{lng === 'ar' ? 'مفقود' : 'Lost'}</option>
              </select>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{lng === 'ar' ? 'قيمة خط الأنابيب' : 'Pipeline Value'}</p>
                <p className="text-2xl font-bold text-gray-900">${totalPipelineValue.toLocaleString()}</p>
                <p className="text-sm text-blue-600">Active Pipeline</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{lng === 'ar' ? 'الصفقات المكتملة' : 'Won Deals'}</p>
                <p className="text-2xl font-bold text-gray-900">${wonDealsValue.toLocaleString()}</p>
                <p className="text-sm text-green-600">+{((wonDealsValue / totalPipelineValue) * 100).toFixed(1)}% of pipeline</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{lng === 'ar' ? 'معدل التحويل الإجمالي' : 'Overall Conversion'}</p>
                <p className="text-2xl font-bold text-gray-900">{((wonDealsValue / totalPipelineValue) * 100).toFixed(1)}%</p>
                <p className="text-sm text-purple-600">Lead to Close</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Activity className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{lng === 'ar' ? 'الصفقات النشطة' : 'Active Deals'}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {salesLifecycleStages.filter(s => s.status === 'active').reduce((sum, s) => sum + s.count, 0)}
                </p>
                <p className="text-sm text-orange-600">In Progress</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sales Lifecycle Visualization */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {lng === 'ar' ? 'دورة حياة المبيعات الكاملة' : 'Complete Sales Lifecycle'}
            </h2>
            <p className="text-sm text-gray-600">
              {lng === 'ar' ? 'تتبع كامل لعملية المبيعات من البداية إلى النهاية' : 'Complete tracking of the sales process from start to finish'}
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredStages.map((stage) => (
                <div key={stage.id} className="relative">
                  {/* Connection Line */}
                  {stage.id !== 'lead-generation' && (
                    <div className="absolute -left-2 top-1/2 w-4 h-0.5 bg-gray-300 -translate-y-1/2"></div>
                  )}
                  
                  <div className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                    stage.status === 'completed' ? 'border-green-200 bg-green-50' :
                    stage.status === 'lost' ? 'border-red-200 bg-red-50' :
                    'border-blue-200 bg-blue-50'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2 rounded-lg ${stage.status === 'completed' ? 'bg-green-500' : stage.status === 'lost' ? 'bg-red-500' : 'bg-blue-500'} text-white`}>
                        {stage.icon}
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        stage.status === 'completed' ? 'bg-green-100 text-green-800' :
                        stage.status === 'lost' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {stage.count}
                      </span>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {lng === 'ar' ? stage.nameAr : stage.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {lng === 'ar' ? stage.descriptionAr : stage.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">{lng === 'ar' ? 'القيمة' : 'Value'}:</span>
                        <span className="font-medium">${stage.value.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">{lng === 'ar' ? 'معدل التحويل' : 'Conversion'}:</span>
                        <span className="font-medium">{stage.conversionRate}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {lng === 'ar' ? 'مخطط قمع التحويل' : 'Conversion Funnel'}
            </h2>
            <p className="text-sm text-gray-600">
              {lng === 'ar' ? 'معدلات التحويل عبر مراحل دورة الحياة' : 'Conversion rates across lifecycle stages'}
            </p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {conversionFunnel.map((stage, index) => (
                <div key={index} className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{stage.stage}</span>
                    <span className="text-sm text-gray-600">{stage.conversion}% conversion</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${stage.conversion}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{stage.count} {lng === 'ar' ? 'صفقة' : 'deals'}</span>
                    <span>${stage.value.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {lng === 'ar' ? 'الإجراءات السريعة' : 'Quick Actions'}
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                      <Plus className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">{lng === 'ar' ? 'إضافة عميل محتمل جديد' : 'Add New Lead'}</p>
                      <p className="text-sm text-gray-600">{lng === 'ar' ? 'ابدأ عملية المبيعات الجديدة' : 'Start a new sales process'}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </button>

                <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg mr-3">
                      <FileText className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">{lng === 'ar' ? 'إنشاء عرض أسعار' : 'Create Quote'}</p>
                      <p className="text-sm text-gray-600">{lng === 'ar' ? 'أعد عرض أسعار للعميل' : 'Prepare a quote for the customer'}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </button>

                <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg mr-3">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">{lng === 'ar' ? 'مراجعة خط الأنابيب' : 'Review Pipeline'}</p>
                      <p className="text-sm text-gray-600">{lng === 'ar' ? 'تحليل حالة الصفقات الحالية' : 'Analyze current deal statuses'}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {lng === 'ar' ? 'النشاط الأخير' : 'Recent Activity'}
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {[
                  {
                    icon: Users,
                    color: 'text-blue-600',
                    bgColor: 'bg-blue-100',
                    title: lng === 'ar' ? 'عميل محتمل جديد' : 'New Lead Added',
                    description: lng === 'ar' ? 'تم إضافة عميل محتمل من LinkedIn' : 'New lead added from LinkedIn',
                    time: lng === 'ar' ? 'منذ 2 دقيقة' : '2 min ago',
                    status: 'active'
                  },
                  {
                    icon: FileText,
                    color: 'text-green-600',
                    bgColor: 'bg-green-100',
                    title: lng === 'ar' ? 'عرض أسعار مرسل' : 'Quote Sent',
                    description: lng === 'ar' ? 'تم إرسال عرض أسعار لشركة ABC' : 'Quote sent to ABC Company',
                    time: lng === 'ar' ? 'منذ 15 دقيقة' : '15 min ago',
                    status: 'active'
                  },
                  {
                    icon: CheckCircle,
                    color: 'text-green-600',
                    bgColor: 'bg-green-100',
                    title: lng === 'ar' ? 'صفقة مكتملة' : 'Deal Closed',
                    description: lng === 'ar' ? 'تم إغلاق صفقة بقيمة $50,000' : 'Deal closed worth $50,000',
                    time: lng === 'ar' ? 'منذ ساعة' : '1 hour ago',
                    status: 'completed'
                  },
                  {
                    icon: XCircle,
                    color: 'text-red-600',
                    bgColor: 'bg-red-100',
                    title: lng === 'ar' ? 'صفقة مفقودة' : 'Deal Lost',
                    description: lng === 'ar' ? 'تم فقدان الصفقة لصالح المنافس' : 'Deal lost to competitor',
                    time: lng === 'ar' ? 'منذ 3 ساعات' : '3 hours ago',
                    status: 'lost'
                  }
                ].map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${activity.bgColor}`}>
                      <activity.icon className={`h-4 w-4 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
