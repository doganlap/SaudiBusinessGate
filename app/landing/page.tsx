'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SaudiBusinessGateInfographic } from '@/components/infographic/SaudiBusinessGateBlock';

function DiagnosticsBlock() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch('/api/platform/status')
      .then((r) => r.json())
      .then((json) => {
        if (!mounted) return;
        setData(json);
        setLoading(false);
      })
      .catch((e) => {
        if (!mounted) return;
        setError('فشل جلب حالة المنصة');
        setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1,2,3].map(i => (
          <div key={i} className="bg-gray-100 h-24 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800">
        {error}
      </div>
    );
  }

  const diag = data?.problems_and_diagnostics || {};
  const errors: string[] = diag?.errors || [];
  const integrations: any[] = diag?.integrations || [];
  const services: any[] = diag?.services || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-3">الأخطاء</h3>
        {errors.length === 0 ? (
          <p className="text-gray-600">لا توجد أخطاء مسجلة</p>
        ) : (
          <ul className="space-y-2">
            {errors.slice(0,5).map((e: string, idx: number) => (
              <li key={idx} className="text-sm text-red-700">{e}</li>
            ))}
          </ul>
        )}
      </div>
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-3">الخدمات</h3>
        {services.length === 0 ? (
          <p className="text-gray-600">لا توجد خدمات حرجة</p>
        ) : (
          <ul className="space-y-2">
            {services.slice(0,5).map((s: any, idx: number) => (
              <li key={idx} className="text-sm text-gray-700">
                <span className="font-semibold">{s.name}</span>: {s.status}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-3">التكاملات</h3>
        {integrations.length === 0 ? (
          <p className="text-gray-600">التكاملات جاهزة</p>
        ) : (
          <ul className="space-y-2">
            {integrations.slice(0,5).map((i: any, idx: number) => (
              <li key={idx} className="text-sm text-gray-700">
                <span className="font-semibold">{i.name}</span>: {i.status}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
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
              <a href="#value" className="text-gray-700 hover:text-green-600 transition-colors font-medium">القيمة</a>
              <a href="#roadmap" className="text-gray-700 hover:text-green-600 transition-colors font-medium">الخارطة الزمنية</a>
              <a href="#impact" className="text-gray-700 hover:text-green-600 transition-colors font-medium">التأثير</a>
              <a href="#enterprise" className="text-gray-700 hover:text-green-600 transition-colors font-medium">الدعم المؤسسي</a>
              <button
                onClick={() => router.push('/ar/dashboard')}
                className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-medium"
              >
                دخول المنصة
              </button>
            </div>
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
                onClick={() => router.push('/ar/dashboard')}
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

      {/* Agents Infographic Section */}
      <section id="agents" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white to-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">عوامل ومنصات ذاتية بالذكاء الاصطناعي</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">كروت إنفوجرافيك مختصرة للمشاريع الرئيسية: Shahin، SBG، DoganHub</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900">Shahin Vision</h3>
                <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">L2 الآن • L3 خلال 12 شهر</span>
              </div>
              <p className="text-gray-600 mb-6">لوحة حوكمة سيبرية وامتثال تساعد القادة على رسم الضوابط، مراقبتها، وفرضها عبر رؤى وأتمتة مدعومة بالذكاء.</p>
              <div className="space-y-3 mb-6">
                <div className="flex items-start"><span className="mr-2">🚀</span><p className="text-gray-700">قرارات أسرع عبر تحليلات فورية</p></div>
                <div className="flex items-start"><span className="mr-2">🛡</span><p className="text-gray-700">ضوابط أقوى وتتبّع أدق</p></div>
                <div className="flex items-start"><span className="mr-2">📊</span><p className="text-gray-700">لوحات مؤشرات لحظية قابلة للتنفيذ</p></div>
                <div className="flex items-start"><span className="mr-2">🤖</span><p className="text-gray-700">توصيات وتنفيذ ذكي مع اعتماد</p></div>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-slate-50 rounded-xl p-3 text-center"><div className="font-semibold">الآن</div><div className="text-sm text-gray-600">مساعد ذكي + رؤى</div></div>
                <div className="bg-slate-50 rounded-xl p-3 text-center"><div className="font-semibold">3–6 أشهر</div><div className="text-sm text-gray-600">مهام ذاتية + اعتماد</div></div>
                <div className="bg-slate-50 rounded-xl p-3 text-center"><div className="font-semibold">6–12 شهر</div><div className="text-sm text-gray-600">حوكمة ذاتية</div></div>
              </div>
              <div className="mb-6">
                <div className="font-semibold mb-2">من وضع حالي → إلى امتثال مستمر</div>
                <p className="text-gray-700">قبل: تقارير يدوية متأخرة وفجوات ضوابط.</p>
                <p className="text-gray-700">مع Shahin: خرائط ضوابط آلية، مراقبة مستمرة، إجراءات مع اعتماد.</p>
              </div>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">−40% وقت التقارير</span>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">−30% متابعات يدوية</span>
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">+50% وضوح مخاطر</span>
                <span className="bg-slate-100 text-slate-800 px-3 py-1 rounded-full text-sm">100% تتبع قرارات</span>
              </div>
              <div className="text-sm text-gray-600">التزام: ترقية إلى L3 تحكم ذاتي وامتثال مستمر خلال 12 شهرًا</div>
            </div>

            <SaudiBusinessGateInfographic />

            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900">DoganHub Commerce</h3>
                <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">L1 الآن • L2 خلال 12 شهر</span>
              </div>
              <p className="text-gray-600 mb-6">مركز تكامل تجاري ينسّق الكتالوج والطلبات ورحلات العملاء مع رؤى وأتمتة مدفوعة بالذكاء.</p>
              <div className="space-y-3 mb-6">
                <div className="flex items-start"><span className="mr-2">🚀</span><p className="text-gray-700">رؤى الطلبات والمخزون في لحظة</p></div>
                <div className="flex items-start"><span className="mr-2">🛡</span><p className="text-gray-700">سياسات دفع وبيانات آمنة</p></div>
                <div className="flex items-start"><span className="mr-2">📊</span><p className="text-gray-700">مسارات العملاء وأداء المبيعات</p></div>
                <div className="flex items-start"><span className="mr-2">🤖</span><p className="text-gray-700">حملات وعمليات مدفوعة بالذكاء</p></div>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-slate-50 rounded-xl p-3 text-center"><div className="font-semibold">الآن</div><div className="text-sm text-gray-600">رؤى + دمج القنوات</div></div>
                <div className="bg-slate-50 rounded-xl p-3 text-center"><div className="font-semibold">3–6 أشهر</div><div className="text-sm text-gray-600">تدفقات شبه ذاتية</div></div>
                <div className="bg-slate-50 rounded-xl p-3 text-center"><div className="font-semibold">6–12 شهر</div><div className="text-sm text-gray-600">أتمتة المخزون والحملات</div></div>
              </div>
              <div className="mb-6">
                <div className="font-semibold mb-2">من إدارة يدوية → إلى تجارة ذكية</div>
                <p className="text-gray-700">قبل: تحديثات مخزون يدوية ورؤية مجزأة.</p>
                <p className="text-gray-700">مع DoganHub: تكامل المنصّات، توصيات AI، تدفقات أوتوماتيكية.</p>
              </div>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">−30% زمن الطلبات</span>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">−25% أخطاء المخزون</span>
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">+40% دقّة الاستهداف</span>
                <span className="bg-slate-100 text-slate-800 px-3 py-1 rounded-full text-sm">+20% التحويل</span>
              </div>
              <div className="text-sm text-gray-600">التزام: ترقية إلى L2 Co-Pilot خلال 9–12 شهرًا</div>
            </div>
          </div>
        </div>
      </section>

      {/* Problems & Diagnostics */}
      <section id="problems_and_diagnostics" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">المشكلات والتشخيص</h2>
            <p className="text-gray-600">حالة المنصة والاعتمادات وفق تقرير التشغيل</p>
          </div>
          <DiagnosticsBlock />
        </div>
      </section>

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
                        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          phase.status === 'completed' ? 'bg-green-100 text-green-800' :
                          phase.status === 'current' ? 'bg-blue-100 text-blue-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {phase.phase}
                        </div>
                        <div className="text-sm text-gray-500">{phase.period}</div>
                      </div>

                      <h3 className="text-2xl font-bold text-gray-900 mb-3">{phase.title}</h3>
                      <p className="text-gray-600 mb-4">{phase.description}</p>

                      <div className="grid grid-cols-2 gap-2">
                        {phase.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center text-sm text-gray-700">
                            <span className={`w-2 h-2 rounded-full mr-2 ${
                              phase.status === 'completed' ? 'bg-green-500' :
                              phase.status === 'current' ? 'bg-blue-500' :
                              'bg-purple-500'
                            }`}></span>
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
                  company: 'شركة النور للطاقة',
                  result: 'توفير 200 ساعة عمل شهرياً',
                  quote: '"بوابة الأعمال السعودية غيرت طريقة عملنا تماماً. الآن نركز على النمو بدلاً من الإدارة اليومية."',
                  person: 'أحمد الزهراني، المدير التنفيذي'
                },
                {
                  company: 'مجموعة الأمل التجارية',
                  result: 'زيادة الإيرادات بنسبة 35%',
                  quote: '"الامتثال التلقائي والتقارير الذكية ساهمت في تحسين قراراتنا الاستراتيجية بشكل كبير."',
                  person: 'فاطمة المحمد، مديرة المالية'
                }
              ].map((story, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center mr-4">
                      <span className="text-white font-bold">{story.company.charAt(0)}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{story.company}</h4>
                      <p className="text-green-600 font-semibold">{story.result}</p>
                    </div>
                  </div>
                  <blockquote className="text-gray-600 mb-4 italic">"{story.quote}"</blockquote>
                  <p className="text-sm text-gray-500">- {story.person}</p>
                </div>
              ))}
            </div>
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
                onClick={() => router.push('/ar/dashboard')}
                className="bg-white text-green-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                ابدأ الرحلة مجاناً
              </button>
              <button
                onClick={() => router.push('/ar/support')}
                className="border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white/10 transition-all duration-300"
              >
                تواصل مع الدعم
              </button>
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
                <li><a href="#value" className="hover:text-white transition-colors">القيمة</a></li>
                <li><a href="#roadmap" className="hover:text-white transition-colors">الخارطة الزمنية</a></li>
                <li><a href="#impact" className="hover:text-white transition-colors">التأثير</a></li>
                <li><a href="#enterprise" className="hover:text-white transition-colors">الدعم المؤسسي</a></li>
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
