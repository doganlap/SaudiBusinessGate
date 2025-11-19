'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Building, Users, Target, Award, TrendingUp } from 'lucide-react';

interface AboutPageProps {
  params: {
    lng: string;
  };
}

export default function AboutPage({ params: { lng } }: AboutPageProps) {
  const [activeTab, setActiveTab] = useState('story');

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

            <Link
              href={`/${lng}`}
              className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>العودة للرئيسية</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            من نحن
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            نحن نفخر بأننا المنصة الأولى في الشرق الأوسط التي تجمع بين التكنولوجيا المتقدمة والامتثال التنظيمي
          </p>
        </div>
      </section>

      {/* Content Tabs */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex justify-center mb-12">
            <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-100">
              {[
                { id: 'story', label: 'قصتنا', icon: '📖' },
                { id: 'mission', label: 'رسالتنا', icon: '🎯' },
                { id: 'team', label: 'فريقنا', icon: '👥' },
                { id: 'impact', label: 'تأثيرنا', icon: '📊' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
            {activeTab === 'story' && (
              <div className="space-y-8">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">قصة تأسيس المنصة</h2>
                  <p className="text-lg text-gray-600 max-w-4xl mx-auto">
                    بدأت رحلتنا في عام 2024 عندما لاحظنا التحديات التي تواجه الشركات السعودية في إدارة أعمالها
                    بالطرق التقليدية. قررنا إنشاء منصة تجمع بين أحدث التقنيات والمعرفة المحلية العميقة.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🚀</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">الرؤية</h3>
                    <p className="text-gray-600">
                      أن نكون المنصة الأولى في المنطقة للتحول الرقمي الشامل للشركات السعودية
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">💡</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">الابتكار</h3>
                    <p className="text-gray-600">
                      دمج الذكاء الاصطناعي مع الامتثال التنظيمي لأول مرة في المنطقة
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🇸🇦</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">الهوية السعودية</h3>
                    <p className="text-gray-600">
                      فهم عميق لاحتياجات السوق السعودي والتحديات التنظيمية المحلية
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'mission' && (
              <div className="space-y-8">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">رسالتنا ورؤيتنا</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl flex items-center justify-center mr-4">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">الرسالة</h3>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      تمكين الشركات السعودية من تحقيق التميز التشغيلي والنمو المستدام من خلال منصة
                      متكاملة تجمع بين التكنولوجيا المتقدمة والامتثال التنظيمي الكامل.
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mr-4">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">الرؤية</h3>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      أن نكون المنصة الأولى في الشرق الأوسط التي تقدم حلولاً ذاتية التشغيل
                      بالذكاء الاصطناعي، مما يساعد الشركات السعودية على المنافسة عالمياً.
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">القيم الأساسية</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <h4 className="font-semibold text-gray-900 mb-2">الابتكار</h4>
                      <p className="text-sm text-gray-600">نسعى للريادة في التقنيات الجديدة</p>
                    </div>
                    <div className="text-center">
                      <h4 className="font-semibold text-gray-900 mb-2">الثقة</h4>
                      <p className="text-sm text-gray-600">نبني الثقة من خلال الشفافية والأمان</p>
                    </div>
                    <div className="text-center">
                      <h4 className="font-semibold text-gray-900 mb-2">التأثير</h4>
                      <p className="text-sm text-gray-600">نساهم في نمو الاقتصاد السعودي</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'team' && (
              <div className="space-y-8">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">فريق العمل</h2>
                  <p className="text-lg text-gray-600">
                    فريق من الخبراء السعوديين والعالميين يجمع بين الخبرة التقنية والمعرفة المحلية
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl p-6 text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">👨‍💼</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">أحمد الزهراني</h3>
                    <p className="text-green-600 font-semibold mb-2">الرئيس التنفيذي</p>
                    <p className="text-sm text-gray-600">خبير في التحول الرقمي للشركات السعودية</p>
                  </div>

                  <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl p-6 text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">👩‍💻</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">فاطمة المحمد</h3>
                    <p className="text-blue-600 font-semibold mb-2">مديرة التكنولوجيا</p>
                    <p className="text-sm text-gray-600">خبيرة في الذكاء الاصطناعي والحلول السحابية</p>
                  </div>

                  <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl p-6 text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">👨‍⚖️</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">محمد العبدالله</h3>
                    <p className="text-purple-600 font-semibold mb-2">مدير الامتثال</p>
                    <p className="text-sm text-gray-600">خبير في اللوائح المالية والتنظيمية السعودية</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white text-center">
                  <h3 className="text-2xl font-bold mb-4">انضم إلينا</h3>
                  <p className="text-green-100 mb-6">
                    نحن نبحث عن المواهب السعودية للانضمام إلى فريقنا ومساعدتنا في بناء المستقبل
                  </p>
                  <Link
                    href={`/${lng}/careers`}
                    className="bg-white text-green-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors inline-block"
                  >
                    عرض فرص العمل
                  </Link>
                </div>
              </div>
            )}

            {activeTab === 'impact' && (
              <div className="space-y-8">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">تأثيرنا على الاقتصاد السعودي</h2>
                  <p className="text-lg text-gray-600">
                    نساهم في نمو الاقتصاد الرقمي السعودي من خلال تمكين الشركات والمؤسسات
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { number: '500+', label: 'عميل سعودي', icon: '🏢' },
                    { number: '75%', label: 'توفير في التكاليف', icon: '💰' },
                    { number: '40%', label: 'زيادة الكفاءة', icon: '⚡' },
                    { number: '99.9%', label: 'معدل رضا العملاء', icon: '⭐' }
                  ].map((stat, index) => (
                    <div key={index} className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-6 text-center">
                      <div className="text-3xl mb-2">{stat.icon}</div>
                      <div className="text-3xl font-bold text-gray-900 mb-1">{stat.number}</div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </div>
                  ))}
                </div>

                <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8">
                  <h3 className="text-2xl font-bold text-gray-900 text-center mb-6">مساهمتنا في رؤية 2030</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <Building className="w-12 h-12 text-green-600 mx-auto mb-3" />
                      <h4 className="font-semibold text-gray-900 mb-2">الاقتصاد الرقمي</h4>
                      <p className="text-sm text-gray-600">نساهم في تحقيق هدف 10% من الناتج المحلي الرقمي</p>
                    </div>
                    <div className="text-center">
                      <Users className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                      <h4 className="font-semibold text-gray-900 mb-2">التوظيف</h4>
                      <p className="text-sm text-gray-600">نخلق فرص عمل في مجال التكنولوجيا والتحول الرقمي</p>
                    </div>
                    <div className="text-center">
                      <Award className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                      <h4 className="font-semibold text-gray-900 mb-2">الابتكار</h4>
                      <p className="text-sm text-gray-600">نطور حلولاً مبتكرة للتحديات المحلية والعالمية</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
