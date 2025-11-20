'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';

interface LangHomePageProps {
  params: Promise<{
    lng: string;
  }>;
}

export default function LangHomePage({ params }: LangHomePageProps) {
  const { lng } = use(params);
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<any>(null);

  // Auto-close sidebar when clicking outside or navigating
  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  const handleNavigation = (path: string) => {
    router.push(`/${lng}${path}`);
    handleSidebarClose();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Collapsible Sidebar */}
      <div className={`fixed inset-y-0 right-0 z-50 w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">🇸🇦</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Saudi Business Gate</span>
            </div>
            <button
              onClick={handleSidebarClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-6 py-8">
            <div className="space-y-2">
              <button
                onClick={() => handleNavigation('/dashboard')}
                className="w-full flex items-center space-x-3 px-4 py-3 text-right rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v4H8V5z" />
                </svg>
                <span className="font-medium">لوحة التحكم</span>
              </button>

              <button
                onClick={() => handleNavigation('/finance')}
                className="w-full flex items-center space-x-3 px-4 py-3 text-right rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <span className="font-medium">المالية</span>
              </button>

              <button
                onClick={() => handleNavigation('/crm')}
                className="w-full flex items-center space-x-3 px-4 py-3 text-right rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="font-medium">إدارة العملاء</span>
              </button>

              <button
                onClick={() => handleNavigation('/sales')}
                className="w-full flex items-center space-x-3 px-4 py-3 text-right rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span className="font-medium">المبيعات</span>
              </button>

              <button
                onClick={() => handleNavigation('/hr')}
                className="w-full flex items-center space-x-3 px-4 py-3 text-right rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <span className="font-medium">الموارد البشرية</span>
              </button>

              <button
                onClick={() => handleNavigation('/analytics')}
                className="w-full flex items-center space-x-3 px-4 py-3 text-right rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="font-medium">التحليلات</span>
              </button>

              <button
                onClick={() => handleNavigation('/settings')}
                className="w-full flex items-center space-x-3 px-4 py-3 text-right rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-medium">الإعدادات</span>
              </button>
            </div>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-6 border-t border-gray-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🤖</span>
              </div>
              <p className="text-sm text-gray-600">AI-Powered Enterprise</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={handleSidebarClose}
        />
      )}

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">🇸🇦</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-gray-900">Saudi Business Gate</span>
                <p className="text-xs text-gray-600">من السعودية إلى العالم</p>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#modules" className="text-gray-700 hover:text-green-600 transition-colors font-medium">الوحدات</a>
              <a href="#value" className="text-gray-700 hover:text-green-600 transition-colors font-medium">القيمة</a>
              <a href="#benefits" className="text-gray-700 hover:text-green-600 transition-colors font-medium">الفوائد</a>
              <a href="#customization" className="text-gray-700 hover:text-green-600 transition-colors font-medium">التخصيص</a>
              <a href="#roadmap" className="text-gray-700 hover:text-green-600 transition-colors font-medium">الخارطة الزمنية</a>
              <a href="#impact" className="text-gray-700 hover:text-green-600 transition-colors font-medium">التأثير</a>
              <a href="#enterprise" className="text-gray-700 hover:text-green-600 transition-colors font-medium">الدعم المؤسسي</a>
              <a href="#profile" className="text-gray-700 hover:text-green-600 transition-colors font-medium">استكشف الملف</a>
              <a href="#partner" className="text-gray-700 hover:text-green-600 transition-colors font-medium">الشراكة</a>
              <button
                onClick={() => router.push(`/${lng}/dashboard`)}
                className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-medium"
              >
                دخول المنصة
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Modern Infographic Style */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Main Hero Content */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              المنصة الأولى في الشرق الأوسط لإدارة الأعمال الذكية
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              بوابة الأعمال
              <span className="block bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                السعودية الذكية
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              منصة متكاملة تجمع بين التكنولوجيا المتقدمة والامتثال التنظيمي،
              مصممة خصيصاً للشركات السعودية لتحقيق التميز التشغيلي والنمو المستدام
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button
                onClick={() => router.push(`/${lng}/dashboard`)}
                className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-2xl"
              >
                ابدأ الرحلة مجاناً
              </button>
              <button
                onClick={() => document.getElementById('value')?.scrollIntoView({ behavior: 'smooth' })}
                className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold hover:border-green-500 hover:text-green-600 transition-all duration-300"
              >
                تعرف على القيمة
              </button>
            </div>
          </div>

          {/* Key Metrics Infographic */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {[
              { number: '99.9%', label: 'معدل التوفر', icon: '⚡', color: 'from-blue-500 to-blue-600' },
              { number: '500+', label: 'عميل سعودي', icon: '🏢', color: 'from-green-500 to-green-600' },
              { number: '152+', label: 'نقطة API', icon: '🔗', color: 'from-purple-500 to-purple-600' },
              { number: '24/7', label: 'دعم فني', icon: '🛠️', color: 'from-orange-500 to-orange-600' }
            ].map((metric, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className={`w-12 h-12 bg-gradient-to-r ${metric.color} rounded-xl flex items-center justify-center mb-4 mx-auto`}>
                  <span className="text-2xl">{metric.icon}</span>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{metric.number}</div>
                  <div className="text-gray-600 font-medium">{metric.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Have - Platform Modules Section */}
      <section id="modules" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              ما نقدمه في المنصة
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              17 وحدة عمل شاملة تجمع كل ما تحتاجه لإدارة أعمالك في مكان واحد
            </p>
          </div>

          {/* Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[
              { 
                icon: '📊', 
                title: 'لوحة التحكم', 
                titleEn: 'Dashboard', 
                desc: 'نظرة عامة فورية مع مؤشرات الأداء', 
                category: 'core',
                pages: ['لوحة التحكم الرئيسية', 'تسجيل عميل', 'تسجيل الدخول'],
                features: ['مؤشرات الأداء الرئيسية', 'نظرة عامة على الأعمال', 'إحصائيات فورية', 'إشعارات'],
                path: '/dashboard'
              },
              { 
                icon: '👥', 
                title: 'إدارة العملاء', 
                titleEn: 'CRM', 
                desc: 'إدارة شاملة لعلاقات العملاء', 
                category: 'core',
                pages: ['لوحة CRM', 'قاعدة بيانات العملاء', 'إدارة جهات الاتصال', 'تتبع الأنشطة'],
                features: ['قاعدة بيانات العملاء', 'إدارة جهات الاتصال', 'تتبع الأنشطة', 'سجل التفاعلات'],
                path: '/crm'
              },
              { 
                icon: '📈', 
                title: 'المبيعات', 
                titleEn: 'Sales', 
                desc: 'إدارة خطوط المبيعات والعقود', 
                category: 'business',
                pages: ['لوحة المبيعات', 'تحليلات المبيعات', 'إدارة العملاء المحتملين', 'إدارة الصفقات', 'خط المبيعات', 'إدارة العروض', 'إدارة الطلبات', 'إدارة العقود'],
                features: ['تحليلات المبيعات (KPIs)', 'إدارة العملاء المحتملين', 'تتبع الصفقات', 'خط المبيعات المرئي', 'إنشاء العروض', 'إدارة الطلبات', 'إدارة العقود'],
                path: '/sales'
              },
              { 
                icon: '🛒', 
                title: 'المشتريات', 
                titleEn: 'Procurement', 
                desc: 'إدارة المشتريات المتكاملة مع ميزات متقدمة', 
                category: 'business',
                pages: ['لوحة المشتريات', 'تحليلات المشتريات', 'أوامر الشراء', 'إدارة الموردين', 'إدارة المخزون'],
                features: ['تحليلات المشتريات (KPIs)', 'إدارة أوامر الشراء', 'إدارة الموردين', 'تتبع المخزون', 'تصدير/استيراد (Excel, PDF, CSV)', 'إشعارات', 'مرفقات المستندات', 'عمليات مجمعة', 'بحث متقدم', 'قوالب وأوامر متكررة', 'مسح الباركود', 'مراجعات أداء الموردين', 'سجل حركة المخزون', 'سجل التدقيق', 'دعم العملات المتعددة'],
                path: '/procurement'
              },
              { 
                icon: '💰', 
                title: 'المالية', 
                titleEn: 'Finance', 
                desc: 'إدارة مالية شاملة ومحاسبة', 
                category: 'finance',
                pages: ['لوحة المالية', 'تحليلات مالية', 'المعاملات', 'دليل الحسابات', 'الميزانيات', 'الفواتير', 'الفواتير المستحقة', 'الضرائب', 'المصرفية', 'مراكز التكلفة', 'سجل القيود', 'تدفق النقد', 'التقارير المالية'],
                features: ['تحليلات مالية (KPIs)', 'إدارة المعاملات', 'دليل الحسابات', 'تتبع الميزانيات', 'إدارة الفواتير', 'امتثال زاتكا', 'دعم العملات المتعددة', 'المصرفية والمصالحة', 'التقارير المالية'],
                path: '/finance'
              },
              { 
                icon: '👔', 
                title: 'الموارد البشرية', 
                titleEn: 'HR', 
                desc: 'إدارة شاملة للموارد البشرية', 
                category: 'finance',
                pages: ['لوحة الموارد البشرية', 'تحليلات الموارد البشرية', 'إدارة الموظفين', 'تتبع الحضور', 'معالجة الرواتب'],
                features: ['تحليلات الموارد البشرية (KPIs)', 'قاعدة بيانات الموظفين', 'تتبع الحضور', 'معالجة الرواتب', 'إدارة الإجازات', 'مراجعات الأداء'],
                path: '/hr'
              },
              { 
                icon: '📊', 
                title: 'التحليلات', 
                titleEn: 'Analytics', 
                desc: '50+ مؤشر أداء مع لوحات تحكم فورية', 
                category: 'advanced',
                pages: ['لوحة التحليلات', 'تحليلات العملاء', 'التحليلات المالية', 'تحليلات الأعمال', 'رؤى AI'],
                features: ['50+ مؤشر أداء', 'لوحات تحكم مخصصة', 'تصور البيانات', 'تحليل تفصيلي', 'تحديثات فورية', 'تقارير تفاعلية'],
                path: '/analytics'
              },
              { 
                icon: '📋', 
                title: 'التقارير', 
                titleEn: 'Reports', 
                desc: '100+ قالب تقرير مع تسليم تلقائي', 
                category: 'advanced',
                pages: ['منشئ التقارير', 'قوالب التقارير', 'التقارير المجدولة', 'مكتبة التقارير'],
                features: ['100+ قالب تقرير', 'تسليم تلقائي', 'تقارير مخصصة', 'تصدير متعدد (PDF, Excel, CSV)', 'جدولة التقارير'],
                path: '/reports'
              },
              { 
                icon: '🤖', 
                title: 'وكلاء الذكاء الاصطناعي', 
                titleEn: 'AI Agents', 
                desc: 'أتمتة ذكية للعمليات التجارية', 
                category: 'ai',
                pages: ['إدارة وكلاء AI', 'وكلاء المبيعات', 'وكلاء المالية', 'وكلاء الموارد البشرية'],
                features: ['ذكاء المستندات (OCR)', 'تحليلات تنبؤية', 'معالجة اللغة الطبيعية', 'رؤية الكمبيوتر', 'بحث مدعوم بالذكاء الاصطناعي'],
                path: '/ai-agents'
              },
              { 
                icon: '⚙️', 
                title: 'سير العمل', 
                titleEn: 'Workflows', 
                desc: 'أتمتة العمليات وإدارة المهام', 
                category: 'ai',
                pages: ['مصمم سير العمل', 'قوالب سير العمل', 'المهام المؤتمتة'],
                features: ['أتمتة سير العمل', 'أتمتة المهام المتكررة', 'إشعارات البريد الإلكتروني', 'حسابات تلقائية', 'تذكيرات'],
                path: '/workflows'
              },
              { 
                icon: '🔌', 
                title: 'التكاملات', 
                titleEn: 'Integrations', 
                desc: 'الاتصال مع 100+ خدمة خارجية', 
                category: 'integration',
                pages: ['قائمة التكاملات', 'إدارة Webhooks', 'إعدادات التكامل'],
                features: ['100+ خدمة خارجية', 'تكاملات مخصصة', 'دعم Webhooks', 'مزامنة البيانات'],
                path: '/integrations'
              },
              { 
                icon: '🔗', 
                title: 'لوحة API', 
                titleEn: 'API Dashboard', 
                desc: 'إدارة ومراقبة APIs كاملة', 
                category: 'integration',
                pages: ['حالة API', 'إدارة نقاط النهاية', 'حالة التكامل'],
                features: ['مراقبة حالة API', 'إدارة نقاط النهاية', 'توثيق API', 'دعم المطورين'],
                path: '/platform/api-status'
              },
              { 
                icon: '🛡️', 
                title: 'الحوكمة والمخاطر', 
                titleEn: 'GRC', 
                desc: 'إدارة الحوكمة والمخاطر والامتثال', 
                category: 'enterprise',
                pages: ['لوحة GRC', 'إدارة الأطر', 'إدارة الضوابط', 'الاختبار والتحقق', 'تقارير GRC'],
                features: ['امتثال ISO 27001, NIST, SOC 2', 'إدارة المخاطر', 'اختبار الضوابط', 'تتبع الامتثال', 'تحليل الفجوات', 'إدارة الأدلة'],
                path: '/grc'
              },
              { 
                icon: '🏢', 
                title: 'إدارة المنصة', 
                titleEn: 'Platform Management', 
                desc: 'إدارة متعددة المستأجرين', 
                category: 'enterprise',
                pages: ['لوحة إدارة المنصة', 'المستخدمون', 'المؤسسات', 'الإعدادات', 'حالة API', 'سجلات التدقيق'],
                features: ['إدارة متعددة المستأجرين', 'إحصائيات المنصة', 'صحة النظام', 'مراقبة API'],
                path: '/platform'
              },
              { 
                icon: '👤', 
                title: 'إدارة المستخدمين', 
                titleEn: 'User Management', 
                desc: 'تحكم متقدم في الوصول', 
                category: 'enterprise',
                pages: ['إدارة المستخدمين', 'الأدوار والصلاحيات', 'إعدادات الوصول'],
                features: ['إدارة المستخدمين', 'أدوار مخصصة', 'مجموعات الصلاحيات', 'تحكم في الوصول'],
                path: '/platform/users'
              },
              { 
                icon: '🏛️', 
                title: 'إدارة المؤسسات', 
                titleEn: 'Tenant Management', 
                desc: 'إدارة المنظمات', 
                category: 'enterprise',
                pages: ['إدارة المؤسسات', 'الإشتراكات', 'مراقبة الاستخدام'],
                features: ['إدارة المؤسسات', 'إدارة الاشتراكات', 'مراقبة الاستخدام', 'الفواتير'],
                path: '/platform/tenants'
              },
              { 
                icon: '⚙️', 
                title: 'الإعدادات', 
                titleEn: 'Settings', 
                desc: 'تكوين المنصة الكامل', 
                category: 'enterprise',
                pages: ['الإعدادات العامة', 'إعدادات الأمان', 'إعدادات البريد الإلكتروني', 'إعدادات الإشعارات'],
                features: ['تكوين المنصة', 'إعدادات الأمان', 'تكوين البريد', 'تفضيلات الإشعارات'],
                path: '/platform/settings'
              }
            ].map((module, index) => (
              <div 
                key={index} 
                onClick={() => setSelectedModule(module)}
                className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
              >
                <div className="flex items-start space-x-4 rtl:space-x-reverse mb-4">
                  <div className="text-4xl">{module.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{module.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{module.titleEn}</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{module.desc}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    module.category === 'core' ? 'bg-green-100 text-green-800' :
                    module.category === 'business' ? 'bg-blue-100 text-blue-800' :
                    module.category === 'finance' ? 'bg-purple-100 text-purple-800' :
                    module.category === 'advanced' ? 'bg-orange-100 text-orange-800' :
                    module.category === 'ai' ? 'bg-pink-100 text-pink-800' :
                    module.category === 'integration' ? 'bg-cyan-100 text-cyan-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {module.category === 'core' ? 'أساسي' :
                     module.category === 'business' ? 'أعمال' :
                     module.category === 'finance' ? 'مالي' :
                     module.category === 'advanced' ? 'متقدم' :
                     module.category === 'ai' ? 'ذكاء اصطناعي' :
                     module.category === 'integration' ? 'تكامل' :
                     'مؤسسي'}
                  </span>
                  <span className="text-xs text-gray-500">اضغط لعرض التفاصيل</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <div className="inline-block bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
              <div className="text-4xl font-bold mb-2">17</div>
              <div className="text-xl font-semibold">وحدة عمل شاملة</div>
              <div className="text-sm opacity-90 mt-2">جميع ما تحتاجه في مكان واحد</div>
            </div>
          </div>
        </div>
      </section>

      {/* Module Details Modal */}
      {selectedModule && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedModule(null)}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={`bg-gradient-to-r ${
              selectedModule.category === 'core' ? 'from-green-500 to-green-600' :
              selectedModule.category === 'business' ? 'from-blue-500 to-blue-600' :
              selectedModule.category === 'finance' ? 'from-purple-500 to-purple-600' :
              selectedModule.category === 'advanced' ? 'from-orange-500 to-orange-600' :
              selectedModule.category === 'ai' ? 'from-pink-500 to-pink-600' :
              selectedModule.category === 'integration' ? 'from-cyan-500 to-cyan-600' :
              'from-gray-500 to-gray-600'
            } text-white p-6 rounded-t-3xl`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                  <div className="text-5xl">{selectedModule.icon}</div>
                  <div>
                    <h2 className="text-3xl font-bold">{selectedModule.title}</h2>
                    <p className="text-lg opacity-90">{selectedModule.titleEn}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedModule(null)}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
                  aria-label={lng === 'ar' ? 'إغلاق' : 'Close'}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="mt-4 text-lg opacity-90">{selectedModule.desc}</p>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Pages Section */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>📄</span>
                  {lng === 'ar' ? 'الصفحات المتاحة' : 'Available Pages'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedModule.pages?.map((page: string, idx: number) => (
                    <div key={idx} className="bg-gray-50 rounded-xl p-4 border border-gray-200 flex items-center gap-3 hover:bg-gray-100 transition-colors">
                      <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                      <span className="text-gray-700 font-medium">{page}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features Section */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>✨</span>
                  {lng === 'ar' ? 'الميزات والوظائف' : 'Features & Capabilities'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedModule.features?.map((feature: string, idx: number) => (
                    <div key={idx} className="bg-blue-50 rounded-xl p-4 border border-blue-200 flex items-start gap-3 hover:bg-blue-100 transition-colors">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    router.push(`/${lng}${selectedModule.path}`);
                    setSelectedModule(null);
                  }}
                  className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-4 rounded-xl text-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  {lng === 'ar' ? 'تجربة الوحدة الآن' : 'Try Module Now'}
                </button>
                <button
                  onClick={() => setSelectedModule(null)}
                  className="flex-1 border-2 border-gray-300 text-gray-700 px-6 py-4 rounded-xl text-lg font-semibold hover:border-gray-400 transition-all duration-300"
                >
                  {lng === 'ar' ? 'إغلاق' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Value Proposition Section */}
      <section id="value" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              لماذا بوابة الأعمال السعودية؟
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              منصة مصممة خصيصاً لمتطلبات السوق السعودي، تجمع بين التكنولوجيا المتقدمة والامتثال الكامل
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            {/* Value Points */}
            <div className="space-y-8">
              {[
                {
                  icon: '🇸🇦',
                  title: 'مصمم للسوق السعودي',
                  description: 'منصة تفهم احتياجات الشركات السعودية والتحديات التنظيمية المحلية',
                  color: 'from-green-500 to-green-600'
                },
                {
                  icon: '🔒',
                  title: 'أمان مصرفي',
                  description: 'تشفير متقدم وحماية البيانات بمعايير مصرفية عالية',
                  color: 'from-blue-500 to-blue-600'
                },
                {
                  icon: '🤖',
                  title: 'ذكاء اصطناعي متقدم',
                  description: 'أتمتة ذكية للعمليات التجارية واتخاذ القرارات الاستراتيجية',
                  color: 'from-purple-500 to-purple-600'
                },
                {
                  icon: '📊',
                  title: 'تحليلات في الوقت الفعلي',
                  description: 'رؤى عميقة لأداء الأعمال واتجاهات السوق',
                  color: 'from-orange-500 to-orange-600'
                }
              ].map((value, index) => (
                <div key={index} className="flex items-start space-x-4 rtl:space-x-reverse">
                  <div className={`flex-shrink-0 w-16 h-16 bg-gradient-to-r ${value.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                    <span className="text-2xl">{value.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{value.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{value.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Central Infographic */}
            <div className="relative">
              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-3xl p-8 shadow-2xl">
                <div className="text-center mb-8">
                  <div className="w-24 h-24 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <span className="text-4xl">🚀</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">التأثير المتوقع</h3>
                  <p className="text-gray-600">على الشركات السعودية</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { metric: '60%', label: 'توفير في التكاليف' },
                    { metric: '80%', label: 'تسريع العمليات' },
                    { metric: '95%', label: 'دقة البيانات' },
                    { metric: '24/7', label: 'العمل المستمر' }
                  ].map((item, index) => (
                    <div key={index} className="bg-white rounded-xl p-4 text-center shadow-md">
                      <div className="text-2xl font-bold text-green-600 mb-1">{item.metric}</div>
                      <div className="text-sm text-gray-600">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section id="roadmap" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              خارطة طريق التطوير
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              رحلة التحول الرقمي للشركات السعودية نحو المستقبل
            </p>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute right-1/2 transform translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-green-500 via-blue-500 to-purple-500"></div>

            <div className="space-y-12">
              {[
                {
                  phase: 'Phase 1',
                  title: 'الأساس المتين',
                  period: '2024 - الآن',
                  description: 'إطلاق المنصة الأساسية مع إدارة المالية والموارد البشرية والامتثال',
                  features: ['إدارة المالية المتكاملة', 'نظام الموارد البشرية', 'امتثال تنظيمي', 'أمان متقدم'],
                  status: 'completed',
                  color: 'from-green-500 to-green-600'
                },
                {
                  phase: 'Phase 2',
                  title: 'التوسع الذكي',
                  period: '2025',
                  description: 'إضافة الذكاء الاصطناعي الأساسي وتحسين تجربة المستخدم',
                  features: ['تحليلات ذكية', 'أتمتة العمليات', 'تجربة مستخدم محسنة', 'تكاملات متقدمة'],
                  status: 'current',
                  color: 'from-blue-500 to-blue-600'
                },
                {
                  phase: 'Phase 3',
                  title: 'الأتمتة الذكية',
                  period: '2025 - 2026',
                  description: 'الانتقال الكامل إلى المنصة الذاتية التشغيل بالذكاء الاصطناعي',
                  features: ['ذكاء اصطناعي متقدم', 'أتمتة كاملة', 'تعلم آلي', 'قرارات مستقلة'],
                  status: 'upcoming',
                  color: 'from-purple-500 to-purple-600'
                }
              ].map((phase, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                    <div className={`bg-white rounded-2xl p-8 shadow-xl border-l-4 border-gradient-to-r ${phase.color.split(' ')[0].replace('from-', 'border-')}-500`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${phase.status === 'completed' ? 'bg-green-100 text-green-800' : phase.status === 'current' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                          {phase.phase}
                        </div>
                        <div className="text-sm text-gray-500">{phase.period}</div>
                      </div>

                      <h3 className="text-2xl font-bold text-gray-900 mb-3">{phase.title}</h3>
                      <p className="text-gray-600 mb-4">{phase.description}</p>

                      <div className="grid grid-cols-2 gap-2">
                        {phase.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center text-sm text-gray-700">
                            <span className={`w-2 h-2 rounded-full mr-2 ${phase.status === 'completed' ? 'bg-green-500' : phase.status === 'current' ? 'bg-blue-500' : 'bg-purple-500'}`}></span>
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="relative flex-shrink-0">
                    <div className={`w-16 h-16 bg-gradient-to-r ${phase.color} rounded-full flex items-center justify-center shadow-lg border-4 border-white`}>
                      <span className="text-white font-bold">{index + 1}</span>
                    </div>
                  </div>

                  <div className="w-1/2"></div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Automation Highlight */}
          <div className="mt-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-8 text-white text-center">
            <div className="max-w-4xl mx-auto">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🤖</span>
              </div>
              <h3 className="text-3xl font-bold mb-4">المرحلة الثالثة: الأتمتة الذكية قادمة قريباً</h3>
              <p className="text-xl opacity-90 mb-6">
                سنكون أول منصة في المنطقة تقدم أتمتة كاملة للأعمال بالذكاء الاصطناعي،
                حيث تتولى المنصة تشغيل أعمالك بشكل مستقل واتخاذ القرارات الاستراتيجية
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                {[
                  'اتخاذ قرارات مالية ذكية',
                  'إدارة المخاطر التلقائية',
                  'تحسين الأداء المستمر',
                  'نمو مستقل'
                ].map((feature, index) => (
                  <div key={index} className="bg-white/10 rounded-full px-4 py-2 text-sm">
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section id="impact" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              التأثير الفعلي على الشركات
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              نتائج ملموسة ومؤثرة للشركات التي اعتمدت بوابة الأعمال السعودية
            </p>
          </div>

          {/* Impact Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              {
                number: '75%',
                label: 'توفير في الوقت التشغيلي',
                description: 'تقليل الوقت المستغل في المهام الإدارية الروتينية',
                icon: '⏱️',
                color: 'from-blue-500 to-blue-600'
              },
              {
                number: '40%',
                label: 'زيادة في الكفاءة التشغيلية',
                description: 'تحسين الأداء والإنتاجية عبر الأتمتة الذكية',
                icon: '📈',
                color: 'from-green-500 to-green-600'
              },
              {
                number: '90%',
                label: 'دقة في الامتثال التنظيمي',
                description: 'ضمان الامتثال الكامل للمتطلبات التنظيمية السعودية',
                icon: '✅',
                color: 'from-purple-500 to-purple-600'
              }
            ].map((impact, index) => (
              <div key={index} className="text-center">
                <div className={`w-20 h-20 bg-gradient-to-r ${impact.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                  <span className="text-3xl">{impact.icon}</span>
                </div>
                <div className="text-5xl font-bold text-gray-900 mb-2">{impact.number}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{impact.label}</h3>
                <p className="text-gray-600">{impact.description}</p>
              </div>
            ))}
          </div>

          {/* Success Stories */}
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">قصص نجاح عملائنا</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  result: 'توفير 200 ساعة عمل شهرياً',
                  quote: '"بوابة الأعمال السعودية غيرت طريقة عملنا تماماً. الآن نركز على النمو بدلاً من الإدارة اليومية."',
                  role: 'مدير تنفيذي'
                },
                {
                  result: 'زيادة الإيرادات بنسبة 35%',
                  quote: '"الامتثال التلقائي والتقارير الذكية ساهمت في تحسين قراراتنا الاستراتيجية بشكل كبير."',
                  role: 'مديرة مالية'
                }
              ].map((story, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center mr-4">
                      <span className="text-white font-bold">✓</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">عميل راضٍ</h4>
                      <p className="text-green-600 font-semibold">{story.result}</p>
                    </div>
                  </div>
                  <blockquote className="text-gray-600 mb-4 italic">"{story.quote}"</blockquote>
                  <p className="text-sm text-gray-500">- {story.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              كيف تستفيد من المنصة؟
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              فوائد ملموسة للشركات الصغيرة والمتوسطة والمؤسسات
            </p>
          </div>

          {/* Benefits Tabs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              {
                title: 'الشركات الصغيرة والمتوسطة',
                titleEn: 'Small & Medium Businesses',
                icon: '🏪',
                benefits: [
                  { icon: '💰', text: 'توفير 70% على تكاليف البرمجيات', desc: 'منصة شاملة بدلاً من 10+ اشتراكات منفصلة' },
                  { icon: '⏱️', text: 'توفير 20+ ساعة أسبوعياً', desc: 'أتمتة المهام الروتينية' },
                  { icon: '📊', text: 'قرارات أفضل', desc: 'تحليلات فورية ورؤى عميقة' },
                  { icon: '🔒', text: 'أمان وامتثال', desc: 'تشفير متقدم وسجلات تدقيق كاملة' }
                ],
                color: 'from-green-500 to-green-600'
              },
              {
                title: 'المؤسسات',
                titleEn: 'Enterprises',
                icon: '🏢',
                benefits: [
                  { icon: '🌐', text: 'معمارية متعددة المستأجرين', desc: 'إدارة عدة منظمات من مكان واحد' },
                  { icon: '⚡', text: 'أداء عالي', desc: '60% أسرع مع التخزين المؤقت' },
                  { icon: '🛡️', text: 'الحوكمة والامتثال', desc: 'وحدة GRC كاملة وسجلات تدقيق' },
                  { icon: '🎨', text: 'خيارات White-Label', desc: 'العلامة التجارية الخاصة بك' }
                ],
                color: 'from-blue-500 to-blue-600'
              },
              {
                title: 'الموزعين وMSPs',
                titleEn: 'Resellers & MSPs',
                icon: '🤝',
                benefits: [
                  { icon: '💼', text: 'دخل متكرر', desc: 'اشتراكات شهرية/سنوية' },
                  { icon: '🎯', text: 'تتبع العمولات', desc: 'حساب تلقائي للعمولات' },
                  { icon: '🏢', text: 'إدارة متعددة', desc: 'إدارة جميع عملائك' },
                  { icon: '🌟', text: 'بوابات مخصصة', desc: 'بوابات مخصصة لكل عميل' }
                ],
                color: 'from-purple-500 to-purple-600'
              }
            ].map((type, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 shadow-xl border border-gray-200">
                <div className={`w-20 h-20 bg-gradient-to-r ${type.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                  <span className="text-4xl">{type.icon}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">{type.title}</h3>
                <h4 className="text-sm font-semibold text-gray-600 mb-6 text-center">{type.titleEn}</h4>
                <div className="space-y-4">
                  {type.benefits.map((benefit, benefitIndex) => (
                    <div key={benefitIndex} className="bg-white rounded-xl p-4 shadow-md">
                      <div className="flex items-start space-x-3 rtl:space-x-reverse">
                        <span className="text-2xl">{benefit.icon}</span>
                        <div className="flex-1">
                          <h5 className="font-bold text-gray-900 mb-1">{benefit.text}</h5>
                          <p className="text-sm text-gray-600">{benefit.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customization Section */}
      <section id="customization" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              ماذا يمكننا تخصيصه لك؟
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              تخصيص شامل لتناسب احتياجات أعمالك بالضبط
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[
              { icon: '🎨', title: 'العلامة التجارية', desc: 'شعارك وألوانك ونطاقك المخصص', items: ['الشعار والألوان', 'نطاق مخصص', 'علامة تجارية للبريد', 'ثيمات مخصصة'] },
              { icon: '📦', title: 'تكوين الوحدات', desc: 'اختر الوحدات التي تحتاجها فقط', items: ['تمكين/تعطيل الوحدات', 'حقول مخصصة', 'سير عمل مخصص', 'لوحات مخصصة'] },
              { icon: '🔄', title: 'عمليات الأعمال', desc: 'خصص عملياتك التجارية', items: ['مراحل المبيعات', 'سلسلة الموافقة', 'قواعد الجرد', 'قوالب التقارير'] },
              { icon: '🔌', title: 'التكاملات', desc: 'اتصل بأدواتك الحالية', items: ['100+ خدمة خارجية', 'تطوير مخصص', 'Webhooks', 'مزامنة البيانات'] },
              { icon: '🔐', title: 'الأمان والوصول', desc: 'تحكم كامل في الوصول', items: ['أدوار مخصصة', 'مجموعات الصلاحيات', 'أمان على مستوى الحقل', '2FA'] },
              { icon: '📊', title: 'التقارير والتحليلات', desc: 'تقارير وتحليلات مخصصة', items: ['لوحات مخصصة', '100+ قالب', 'تسليم تلقائي', 'تصدير متعدد'] }
            ].map((custom, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                <div className="text-4xl mb-4">{custom.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{custom.title}</h3>
                <p className="text-gray-600 mb-4">{custom.desc}</p>
                <ul className="space-y-2">
                  {custom.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-center text-sm text-gray-700">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-3xl p-8 md:p-12 text-white text-center">
            <h3 className="text-3xl font-bold mb-4">لنبني منصة تعمل بالضبط كما تعمل أعمالك!</h3>
            <p className="text-xl opacity-90 mb-6">
              فريقنا جاهز لتخصيص المنصة حسب احتياجاتك المحددة
            </p>
            <button
              onClick={() => router.push(`/${lng}/contact`)}
              className="bg-white text-green-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              تواصل معنا للتخصيص
            </button>
          </div>
        </div>
      </section>

      {/* Enterprise Support Section */}
      <section id="enterprise" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              كيف ندعم المؤسسات عملياً؟
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              دعم شامل ومتكامل للشركات السعودية في رحلتها نحو التحول الرقمي
            </p>
          </div>

          {/* Practical Support Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: '🎯',
                title: 'استراتيجية التحول الرقمي',
                description: 'خطة شاملة مخصصة لاحتياجات شركتك مع جدول زمني واضح',
                features: ['تحليل الوضع الحالي', 'خارطة طريق مخصصة', 'مؤشرات الأداء', 'جدول التنفيذ']
              },
              {
                icon: '👥',
                title: 'تدريب وتطوير الفرق',
                description: 'برامج تدريبية شاملة لضمان نجاح التحول الرقمي',
                features: ['تدريب المدراء', 'ورش عمل عملية', 'دعم فني مستمر', 'مواد تعليمية']
              },
              {
                icon: '🔧',
                title: 'الدعم الفني المتخصص',
                description: 'فريق دعم فني سعودي متخصص في المنصة والسوق المحلي',
                features: ['دعم 24/7', 'استجابة سريعة', 'خبراء محليين', 'حلول مخصصة']
              },
              {
                icon: '📋',
                title: 'الامتثال والتراخيص',
                description: 'ضمان الامتثال الكامل للمتطلبات التنظيمية السعودية',
                features: ['امتثال زاتكا', 'تراخيص الأعمال', 'تقارير تنظيمية', 'تدقيق مستمر']
              },
              {
                icon: '🤝',
                title: 'الشراكات الاستراتيجية',
                description: 'شبكة شراكات مع البنوك والجهات الحكومية السعودية',
                features: ['تكامل مصرفي', 'شراكات حكومية', 'اتفاقيات تجارية', 'دعم الأعمال']
              },
              {
                icon: '📊',
                title: 'التقارير والتحليلات',
                description: 'تقارير مفصلة ورؤى عميقة لاتخاذ القرارات الاستراتيجية',
                features: ['تقارير شهرية', 'تحليلات الأداء', 'مؤشرات النمو', 'توصيات ذكية']
              }
            ].map((support, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6">
                  <span className="text-3xl">{support.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{support.title}</h3>
                <p className="text-gray-600 mb-4">{support.description}</p>
                <ul className="space-y-2">
                  {support.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm text-gray-700">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-3xl p-8 text-white text-center">
            <h3 className="text-3xl font-bold mb-4">ابدأ رحلتك نحو المستقبل اليوم</h3>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              انضم إلى مئات الشركات السعودية التي نجحت في تحويل أعمالها مع بوابة الأعمال السعودية
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => router.push(`/${lng}/dashboard`)}
                className="bg-white text-green-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                ابدأ الرحلة مجاناً
              </button>
              <button
                onClick={() => router.push(`/${lng}/support`)}
                className="border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white/10 transition-all duration-300"
              >
                تواصل مع الدعم
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Profile Section */}
      <section id="profile" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              استكشف ملفنا التعريفي
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              تعرف على رؤيتنا، مهمتنا، وفريقنا المتميز الذي يقف خلف بوابة الأعمال السعودية
            </p>
          </div>

          {/* Profile Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: '🎯',
                title: 'رؤيتنا',
                titleEn: 'Our Vision',
                description: 'أن نكون المنصة الأولى في الشرق الأوسط لإدارة الأعمال الذكية والامتثال التنظيمي',
                descriptionEn: 'To be the leading platform in the Middle East for smart business management and regulatory compliance',
                color: 'from-blue-500 to-blue-600'
              },
              {
                icon: '🚀',
                title: 'مهمتنا',
                titleEn: 'Our Mission',
                description: 'تمكين الشركات السعودية من تحقيق التميز التشغيلي والنمو المستدام من خلال التكنولوجيا المتقدمة',
                descriptionEn: 'Empower Saudi businesses to achieve operational excellence and sustainable growth through advanced technology',
                color: 'from-green-500 to-green-600'
              },
              {
                icon: '💎',
                title: 'قيمنا',
                titleEn: 'Our Values',
                description: 'الشفافية، الابتكار، الامتثال، والتميز في كل ما نقوم به لخدمة عملائنا',
                descriptionEn: 'Transparency, innovation, compliance, and excellence in everything we do to serve our clients',
                color: 'from-purple-500 to-purple-600'
              },
              {
                icon: '👥',
                title: 'فريقنا',
                titleEn: 'Our Team',
                description: 'فريق من الخبراء السعوديين والعالميين يجمعون بين الخبرة التقنية والمعرفة بالسوق المحلي',
                descriptionEn: 'A team of Saudi and international experts combining technical expertise with local market knowledge',
                color: 'from-orange-500 to-orange-600'
              },
              {
                icon: '🏆',
                title: 'إنجازاتنا',
                titleEn: 'Our Achievements',
                description: '500+ عميل راضٍ، 99.9% معدل توفر، و152+ نقطة API متكاملة',
                descriptionEn: '500+ satisfied clients, 99.9% uptime, and 152+ integrated API endpoints',
                color: 'from-red-500 to-red-600'
              },
              {
                icon: '🌟',
                title: 'التعرف علينا',
                titleEn: 'Get to Know Us',
                description: 'اكتشف المزيد عن قصتنا، فريقنا، وكيف بدأنا رحلتنا في خدمة السوق السعودي',
                descriptionEn: 'Discover more about our story, team, and how we started our journey serving the Saudi market',
                color: 'from-cyan-500 to-cyan-600'
              }
            ].map((profile, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className={`w-16 h-16 bg-gradient-to-r ${profile.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                  <span className="text-3xl">{profile.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{profile.title}</h3>
                <h4 className="text-sm font-semibold text-gray-600 mb-3">{profile.titleEn}</h4>
                <p className="text-gray-700 mb-2 leading-relaxed">{profile.description}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{profile.descriptionEn}</p>
              </div>
            ))}
          </div>

          {/* Company Profile Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-3xl p-8 shadow-xl">
              <div className="flex items-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-4xl">🇸🇦</span>
                </div>
                <div className="mr-4">
                  <h3 className="text-2xl font-bold text-gray-900">Saudi Business Gate</h3>
                  <p className="text-gray-600">منصة الأعمال الذكية</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-md">
                  <span className="text-gray-700 font-medium">المقر الرئيسي</span>
                  <span className="text-gray-900 font-bold">الرياض، المملكة العربية السعودية</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-md">
                  <span className="text-gray-700 font-medium">سنة التأسيس</span>
                  <span className="text-gray-900 font-bold">2024</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-md">
                  <span className="text-gray-700 font-medium">عدد العملاء</span>
                  <span className="text-gray-900 font-bold">500+</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-md">
                  <span className="text-gray-700 font-medium">الخدمات</span>
                  <span className="text-gray-900 font-bold">17+ وحدة عمل</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">لماذا نحن مختلفون؟</h3>
              <div className="space-y-4">
                {[
                  { icon: '🇸🇦', text: 'مصمم خصيصاً للسوق السعودي' },
                  { icon: '🔒', text: 'أمان مصرفي متقدم' },
                  { icon: '🤖', text: 'ذكاء اصطناعي متكامل' },
                  { icon: '📊', text: 'تحليلات في الوقت الفعلي' },
                  { icon: '✅', text: 'امتثال كامل للمتطلبات المحلية' },
                  { icon: '🚀', text: 'أول منصة أتمتة ذكية في المنطقة' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3 rtl:space-x-reverse p-3 bg-gray-50 rounded-xl">
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-gray-700 font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <button
              onClick={() => router.push(`/${lng}/about`)}
              className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              تعرف على المزيد عنا
            </button>
          </div>
        </div>
      </section>

      {/* Partner Section */}
      <section id="partner" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              كن شريكنا
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              انضم إلى شبكة شركائنا المتميزين وكن جزءاً من ثورة التحول الرقمي في السعودية
            </p>
          </div>

          {/* Partner Types */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: '🤝',
                title: 'شركاء التكنولوجيا',
                titleEn: 'Technology Partners',
                description: 'شراكات استراتيجية مع مزودي التكنولوجيا والحلول المتقدمة',
                benefits: ['تكامل تقني', 'دعم متخصص', 'فرص تسويقية', 'تدريب شامل'],
                color: 'from-blue-500 to-blue-600'
              },
              {
                icon: '💼',
                title: 'شركاء الأعمال',
                titleEn: 'Business Partners',
                description: 'شراكات تجارية مع الاستشاريين والموزعين المحليين',
                benefits: ['عمولات تنافسية', 'دعم مبيعات', 'تدريب متخصص', 'موارد تسويقية'],
                color: 'from-green-500 to-green-600'
              },
              {
                icon: '🏦',
                title: 'شركاء المؤسسات',
                titleEn: 'Enterprise Partners',
                description: 'شراكات مع البنوك والجهات الحكومية والمؤسسات الكبرى',
                benefits: ['حلول مخصصة', 'دعم أولوية', 'تكامل متقدم', 'شراكات استراتيجية'],
                color: 'from-purple-500 to-purple-600'
              }
            ].map((partner, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className={`w-20 h-20 bg-gradient-to-r ${partner.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg mx-auto`}>
                  <span className="text-4xl">{partner.icon}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">{partner.title}</h3>
                <h4 className="text-sm font-semibold text-gray-600 mb-4 text-center">{partner.titleEn}</h4>
                <p className="text-gray-700 mb-6 text-center leading-relaxed">{partner.description}</p>
                <div className="space-y-2">
                  {partner.benefits.map((benefit, benefitIndex) => (
                    <div key={benefitIndex} className="flex items-center text-sm text-gray-700 bg-gray-50 p-2 rounded-lg">
                      <span className={`w-2 h-2 rounded-full mr-2 bg-gradient-to-r ${partner.color}`}></span>
                      {benefit}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Partner Benefits */}
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-3xl p-8 md:p-12 text-white mb-16">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-3xl font-bold mb-8 text-center">مزايا الشراكة معنا</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { icon: '💰', title: 'دخل متكرر', desc: 'عمولات شهرية وفرص نمو مستمرة' },
                  { icon: '📈', title: 'دعم التسويق', desc: 'موارد تسويقية وحملات مشتركة' },
                  { icon: '🎓', title: 'تدريب شامل', desc: 'برامج تدريبية متخصصة لفريقك' },
                  { icon: '🚀', title: 'فرص النمو', desc: 'الوصول إلى السوق السعودي المتنامي' },
                  { icon: '🤝', title: 'دعم مخصص', desc: 'فريق دعم مخصص لشركائنا' },
                  { icon: '🏆', title: 'برنامج مزايا', desc: 'مكافآت وحوافز للشركاء المتميزين' }
                ].map((benefit, index) => (
                  <div key={index} className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                    <div className="flex items-start space-x-4 rtl:space-x-reverse">
                      <span className="text-3xl">{benefit.icon}</span>
                      <div>
                        <h4 className="text-xl font-bold mb-2">{benefit.title}</h4>
                        <p className="text-white/90">{benefit.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Current Partners Showcase */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">شركاؤنا الحاليون</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { logo: '🏦' },
                { logo: '💼' },
                { logo: '🏢' },
                { logo: '🔗' }
              ].map((partner, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-md border border-gray-200 hover:shadow-lg transition-shadow text-center">
                  <div className="text-4xl mb-3">{partner.logo}</div>
                  <p className="text-gray-700 font-medium">شريك موثوق</p>
                </div>
              ))}
            </div>
          </div>

          {/* Partner Application CTA */}
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl">
            <div className="max-w-3xl mx-auto text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-4xl">🤝</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">هل تريد أن تصبح شريكنا؟</h3>
              <p className="text-xl text-gray-600 mb-8">
                انضم إلى شبكة شركائنا المتنامية وساعدنا في تحويل الأعمال السعودية
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push(`/${lng}/contact`)}
                  className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  تقديم طلب شراكة
                </button>
                <button
                  onClick={() => router.push(`/${lng}/about`)}
                  className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold hover:border-green-500 hover:text-green-600 transition-all duration-300"
                >
                  تعرف على المزيد
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">🇸🇦</span>
                </div>
                <div>
                  <span className="text-2xl font-bold">Saudi Business Gate</span>
                  <p className="text-xs text-gray-400">من السعودية إلى العالم</p>
                </div>
              </div>
              <p className="text-gray-400 mb-4">
                المنصة الأولى في الشرق الأوسط لإدارة الأعمال الذكية والامتثال التنظيمي
              </p>
              <div className="flex space-x-4 rtl:space-x-reverse">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">المنتج</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#modules" className="hover:text-white transition-colors">الوحدات</a></li>
                <li><a href="#value" className="hover:text-white transition-colors">القيمة</a></li>
                <li><a href="#benefits" className="hover:text-white transition-colors">الفوائد</a></li>
                <li><a href="#customization" className="hover:text-white transition-colors">التخصيص</a></li>
                <li><a href="#roadmap" className="hover:text-white transition-colors">الخارطة الزمنية</a></li>
                <li><a href="#impact" className="hover:text-white transition-colors">التأثير</a></li>
                <li><a href="#enterprise" className="hover:text-white transition-colors">الدعم المؤسسي</a></li>
                <li><a href="#profile" className="hover:text-white transition-colors">استكشف الملف</a></li>
                <li><a href="#partner" className="hover:text-white transition-colors">الشراكة</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">الشركة</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/ar/about" className="hover:text-white transition-colors">من نحن</a></li>
                <li><a href="/ar/careers" className="hover:text-white transition-colors">الوظائف</a></li>
                <li><a href="/ar/contact" className="hover:text-white transition-colors">تواصل معنا</a></li>
                <li><a href="/ar/press" className="hover:text-white transition-colors">الإعلام</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">الدعم</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/ar/support" className="hover:text-white transition-colors">الدعم الفني</a></li>
                <li><a href="/ar/docs" className="hover:text-white transition-colors">التوثيق</a></li>
                <li><a href="/ar/privacy" className="hover:text-white transition-colors">سياسة الخصوصية</a></li>
                <li><a href="/ar/terms" className="hover:text-white transition-colors">الشروط والأحكام</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2025 بوابة الأعمال السعودية. جميع الحقوق محفوظة.</p>
            <p className="text-sm mt-2">صنع بحب في السعودية 🇸🇦</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
