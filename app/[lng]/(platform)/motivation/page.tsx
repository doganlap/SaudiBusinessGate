'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Target,
  TrendingUp,
  Award,
  Flame,
  Star,
  Trophy,
  Calendar,
  CheckCircle,
  Clock,
  Zap,
  BarChart3,
  Users,
  DollarSign,
  Activity,
  Phone,
  Crown,
  TrendingDown,
  Brain,
  Rocket,
  Sparkles
} from 'lucide-react';

interface DailyQuota {
  id: string;
  category: 'sales' | 'crm' | 'hr' | 'procurement';
  title: string;
  titleAr: string;
  target: number;
  current: number;
  unit: string;
  motivationalMessage: string;
  motivationalMessageAr: string;
  icon: React.ReactNode;
  color: string;
  streak: number;
}

interface AdvancedAgent {
  id: string;
  name: string;
  nameAr: string;
  type: 'predictive' | 'automated' | 'intelligent' | 'adaptive';
  capabilities: string[];
  capabilitiesAr: string[];
  status: 'active' | 'learning' | 'optimizing';
  performance: number;
  lastAction: string;
  lastActionAr: string;
  avatar: React.ReactNode;
}

export default function MotivationDashboard() {
  const params = useParams();
  const lng = params.lng as string || 'en';
  const [quotas, setQuotas] = useState<DailyQuota[]>([]);
  const [agents, setAgents] = useState<AdvancedAgent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDailyQuotas();
    fetchAdvancedAgents();
  }, []);

  const fetchDailyQuotas = async () => {
    try {
      // Try to fetch from API, fallback to demo data
      const response = await fetch('/api/motivation/daily-quotas').catch(() => null);

      if (response?.ok) {
        const data = await response.json();
        setQuotas(data.quotas || getDemoQuotas());
      } else {
        setQuotas(getDemoQuotas());
      }
    } catch (error) {
      console.error('Failed to fetch daily quotas:', error);
      setQuotas(getDemoQuotas());
    }
  };

  const fetchAdvancedAgents = async () => {
    try {
      const response = await fetch('/api/agents/advanced').catch(() => null);

      if (response?.ok) {
        const data = await response.json();
        setAgents(data.agents || getDemoAgents());
      } else {
        setAgents(getDemoAgents());
      }
    } catch (error) {
      console.error('Failed to fetch advanced agents:', error);
      setAgents(getDemoAgents());
    } finally {
      setLoading(false);
    }
  };

  const getDemoQuotas = (): DailyQuota[] => [
    {
      id: 'sales-calls',
      category: 'sales',
      title: 'Sales Calls Made',
      titleAr: 'المكالمات المبيعية المنجزة',
      target: 50,
      current: 37,
      unit: 'calls',
      motivationalMessage: "You're on fire! Only 13 more calls to crush your daily goal!",
      motivationalMessageAr: "أنت في أحسن حال! 13 مكالمة فقط لتحقيق هدفك اليومي!",
      icon: <Phone className="h-5 w-5" />,
      color: 'bg-blue-500',
      streak: 5
    },
    {
      id: 'crm-contacts',
      category: 'crm',
      title: 'New CRM Contacts',
      titleAr: 'جهات اتصال جديدة في إدارة العملاء',
      target: 20,
      current: 18,
      unit: 'contacts',
      motivationalMessage: "Almost there! 2 more contacts and you're a champion!",
      motivationalMessageAr: "تقريباً هناك! اتصالان آخران وأنت بطل!",
      icon: <Users className="h-5 w-5" />,
      color: 'bg-green-500',
      streak: 8
    },
    {
      id: 'revenue-target',
      category: 'sales',
      title: 'Revenue Target',
      titleAr: 'هدف الإيرادات',
      target: 15000,
      current: 12750,
      unit: 'SAR',
      motivationalMessage: "Outstanding progress! Just 2,250 SAR to reach your target!",
      motivationalMessageAr: "تقدم رائع! 2,250 ريال فقط لتحقيق هدفك!",
      icon: <DollarSign className="h-5 w-5" />,
      color: 'bg-yellow-500',
      streak: 3
    },
    {
      id: 'hr-reviews',
      category: 'hr',
      title: 'Performance Reviews',
      titleAr: 'مراجعات الأداء',
      target: 5,
      current: 3,
      unit: 'reviews',
      motivationalMessage: "Great work! Complete 2 more reviews to finish strong!",
      motivationalMessageAr: "عمل رائع! أكمل مراجعتين أخريين لتنتهي بقوة!",
      icon: <Star className="h-5 w-5" />,
      color: 'bg-purple-500',
      streak: 12
    }
  ];

  const getDemoAgents = (): AdvancedAgent[] => [
    {
      id: 'predictive-sales',
      name: 'Predictive Sales Agent',
      nameAr: 'وكيل المبيعات التنبؤي',
      type: 'predictive',
      capabilities: [
        'Predicts customer buying patterns',
        'Identifies high-value leads',
        'Optimizes sales strategies',
        'Forecasts revenue trends'
      ],
      capabilitiesAr: [
        'يتنبأ بأنماط شراء العملاء',
        'يحدد العملاء المحتملين ذوي القيمة العالية',
        'يحسن استراتيجيات المبيعات',
        'يتنبأ باتجاهات الإيرادات'
      ],
      status: 'active',
      performance: 94.2,
      lastAction: 'Predicted 15 high-value leads with 87% accuracy',
      lastActionAr: 'تنبأ بـ 15 عميل محتمل ذو قيمة عالية بدقة 87%',
      avatar: <Target className="h-6 w-6" />
    },
    {
      id: 'automated-workflow',
      name: 'Automated Workflow Agent',
      nameAr: 'وكيل سير العمل التلقائي',
      type: 'automated',
      capabilities: [
        'Automates repetitive tasks',
        'Manages approval workflows',
        'Sends automated notifications',
        'Handles document processing'
      ],
      capabilitiesAr: [
        'يؤتمت المهام المتكررة',
        'يدير سير عمل الموافقات',
        'يرسل إشعارات تلقائية',
        'يتعامل مع معالجة المستندات'
      ],
      status: 'active',
      performance: 98.1,
      lastAction: 'Processed 45 invoices and sent 23 notifications',
      lastActionAr: 'معالجة 45 فاتورة وإرسال 23 إشعار',
      avatar: <Zap className="h-6 w-6" />
    },
    {
      id: 'intelligent-crm',
      name: 'Intelligent CRM Agent',
      nameAr: 'وكيل إدارة العلاقات الذكي',
      type: 'intelligent',
      capabilities: [
        'Analyzes customer sentiment',
        'Suggests optimal contact times',
        'Predicts churn risk',
        'Personalizes communication'
      ],
      capabilitiesAr: [
        'يحلل مشاعر العملاء',
        'يحدد أوقات التواصل المثلى',
        'يتنبأ بمخاطر الاستنزاف',
        'يخص شخصية التواصل'
      ],
      status: 'learning',
      performance: 89.7,
      lastAction: 'Analyzed 120 customer interactions, improved response time by 34%',
      lastActionAr: 'حلل 120 تفاعل عميل، حسّن وقت الاستجابة بنسبة 34%',
      avatar: <Brain className="h-6 w-6" />
    },
    {
      id: 'adaptive-analytics',
      name: 'Adaptive Analytics Agent',
      nameAr: 'وكيل التحليلات التكيفي',
      type: 'adaptive',
      capabilities: [
        'Learns from user behavior',
        'Adapts dashboards dynamically',
        'Generates custom insights',
        'Predicts user needs'
      ],
      capabilitiesAr: [
        'يتعلم من سلوك المستخدم',
        'يعدل لوحات التحكم ديناميكياً',
        'يولد رؤى مخصصة',
        'يتنبأ باحتياجات المستخدم'
      ],
      status: 'optimizing',
      performance: 91.5,
      lastAction: 'Generated 8 custom reports and optimized 3 dashboards',
      lastActionAr: 'أنشأ 8 تقارير مخصصة وحسن 3 لوحات تحكم',
      avatar: <BarChart3 className="h-6 w-6" />
    }
  ];

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getMotivationalIcon = (percentage: number, streak: number) => {
    if (percentage >= 100) return <Trophy className="h-5 w-5" />;
    if (percentage >= 80) return <Flame className="h-5 w-5" />;
    if (streak >= 7) return <Star className="h-5 w-5" />;
    if (streak >= 3) return <Award className="h-5 w-5" />;
    return <Rocket className="h-5 w-5" />;
  };

  const getAgentStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'learning': return 'text-blue-600 bg-blue-100';
      case 'optimizing': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getAgentTypeIcon = (type: string) => {
    switch (type) {
      case 'predictive': return <Target className="h-5 w-5" />;
      case 'automated': return <Zap className="h-5 w-5" />;
      case 'intelligent': return <Brain className="h-5 w-5" />;
      case 'adaptive': return <BarChart3 className="h-5 w-5" />;
      default: return <Zap className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{lng === 'ar' ? 'جاري تحميل لوحة التحفيز...' : 'Loading motivation dashboard...'}</p>
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
                {lng === 'ar' ? 'التحفيز والذكاء الاصطناعي المؤسسي' : 'Enterprise AI Motivation & Intelligence'}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {lng === 'ar' ? 'اكتشف الوكلاء الذكيين ذاتيي التشغيل في أول بوابة أعمال مؤسسية في المنطقة' : 'Discover autonomous intelligent agents in the 1st enterprise business platform in the region'}
              </p>
              {/* Pioneering Badge */}
              <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg">
                <Rocket className="h-4 w-4 mr-2" />
                {lng === 'ar' ? 'المنصة الرائدة في المنطقة' : 'Pioneering Platform in the Region'}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <Target className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Daily Quotas Section */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <Target className="h-6 w-6 text-blue-600 ml-2" />
            <h2 className="text-2xl font-bold text-gray-900">
              {lng === 'ar' ? 'الحصص اليومية' : 'Daily Quotas'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quotas.map((quota) => {
              const percentage = getProgressPercentage(quota.current, quota.target);
              const icon = getMotivationalIcon(percentage, quota.streak);

              return (
                <div key={quota.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg ${quota.color} text-white mr-3 rtl:mr-0 rtl:ml-3`}>
                        {quota.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {lng === 'ar' ? quota.titleAr : quota.title}
                        </h3>
                        <div className="flex items-center text-sm text-gray-600">
                          <Flame className="h-4 w-4 text-orange-500 ml-1" />
                          <span>{lng === 'ar' ? 'سلسلة' : 'Streak'}: {quota.streak} {lng === 'ar' ? 'أيام' : 'days'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {quota.current}/{quota.target}
                      </div>
                      <div className="text-sm text-gray-600">{quota.unit}</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${percentage >= 100 ? 'bg-green-500' : quota.color}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-600 mt-1">
                      <span>{percentage.toFixed(1)}%</span>
                      <span className="flex items-center">{icon}</span>
                    </div>
                  </div>

                  {/* Motivational Message */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      {lng === 'ar' ? quota.motivationalMessageAr : quota.motivationalMessage}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Advanced Agents Section */}
        <div>
          <div className="flex items-center mb-6">
            <Zap className="h-6 w-6 text-purple-600 ml-2" />
            <h2 className="text-2xl font-bold text-gray-900">
              {lng === 'ar' ? 'الوكلاء المتقدمون' : 'Advanced Agents'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {agents.map((agent) => (
              <div key={agent.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="mr-3 rtl:mr-0 rtl:ml-3 flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-pink-100">
                      {agent.avatar}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {lng === 'ar' ? agent.nameAr : agent.name}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="text-xs">{getAgentTypeIcon(agent.type)}</span>
                        <span className="ml-1 capitalize">{agent.type}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getAgentStatusColor(agent.status)}`}>
                    {agent.status}
                  </div>
                </div>

                {/* Performance */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>{lng === 'ar' ? 'الأداء' : 'Performance'}</span>
                    <span>{agent.performance}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${agent.performance}%` }}
                    />
                  </div>
                </div>

                {/* Capabilities */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    {lng === 'ar' ? 'القدرات' : 'Capabilities'}
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {(lng === 'ar' ? agent.capabilitiesAr : agent.capabilities).slice(0, 3).map((capability, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        {capability}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Last Action */}
                <div className="text-sm text-gray-600">
                  <strong>{lng === 'ar' ? 'آخر إجراء:' : 'Last Action:'}</strong>
                  <br />
                  {lng === 'ar' ? agent.lastActionAr : agent.lastAction}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievement Summary */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">
                {lng === 'ar' ? 'ملخص الإنجازات اليوم' : 'Daily Achievement Summary'}
              </h3>
              <p className="text-blue-100">
                {lng === 'ar' ? 'أنت تقوم بعمل رائع! استمر في هذا المسار الرائع.' : 'You\'re doing amazing! Keep up the excellent work.'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold mb-1">
                {quotas.filter(q => getProgressPercentage(q.current, q.target) >= 80).length}/{quotas.length}
              </div>
              <div className="text-sm text-blue-100">
                {lng === 'ar' ? 'الأهداف المكتملة' : 'Goals Completed'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
