'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Book, Video, Download, Search, FileText, Play, ChevronRight, Lightbulb, Settings, Shield } from 'lucide-react';

interface DocsPageProps {
  params: {
    lng: string;
  };
}

export default function DocsPage({ params: { lng } }: DocsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('getting-started');

  const docCategories = [
    { id: 'getting-started', label: 'البدء', icon: '🚀', count: 8 },
    { id: 'user-guide', label: 'دليل المستخدم', icon: '👤', count: 15 },
    { id: 'admin-guide', label: 'دليل المدير', icon: '⚙️', count: 12 },
    { id: 'api-docs', label: 'وثائق API', icon: '🔗', count: 25 },
    { id: 'security', label: 'الأمان', icon: '🛡️', count: 6 },
    { id: 'troubleshooting', label: 'حل المشاكل', icon: '🔧', count: 10 }
  ];

  const featuredDocs = [
    {
      title: 'دليل البدء السريع',
      description: 'ابدأ استخدام Saudi Business Gate في 10 دقائق',
      type: 'guide',
      readTime: '10 دقائق',
      category: 'getting-started',
      featured: true
    },
    {
      title: 'إعداد المنصة للشركات',
      description: 'خطوات إعداد المنصة للمؤسسات والشركات الكبيرة',
      type: 'tutorial',
      readTime: '15 دقائق',
      category: 'admin-guide',
      featured: true
    },
    {
      title: 'واجهة برمجة التطبيقات (API)',
      description: 'دليل شامل لواجهة برمجة التطبيقات والتكامل',
      type: 'documentation',
      readTime: '30 دقيقة',
      category: 'api-docs',
      featured: true
    }
  ];

  const recentUpdates = [
    {
      title: 'تحديث الامتثال التنظيمي - ديسمبر 2024',
      date: '15 ديسمبر 2024',
      type: 'update'
    },
    {
      title: 'ميزة الذكاء الاصطناعي الجديدة',
      date: '10 ديسمبر 2024',
      type: 'feature'
    },
    {
      title: 'تحسينات الأمان والخصوصية',
      date: '5 ديسمبر 2024',
      type: 'security'
    }
  ];

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
                <p className="text-xs text-gray-600">التوثيق والدليل</p>
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
            مركز التوثيق
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            كل ما تحتاجه للبدء واستخدام Saudi Business Gate بكفاءة
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="البحث في التوثيق..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-12 pl-6 py-4 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent text-right"
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-4 shadow-lg">
              <div className="text-2xl font-bold text-green-600">75+</div>
              <div className="text-sm text-gray-600">دليل وتوثيق</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-lg">
              <div className="text-2xl font-bold text-blue-600">25+</div>
              <div className="text-sm text-gray-600">فيديو تعليمي</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-lg">
              <div className="text-2xl font-bold text-purple-600">152</div>
              <div className="text-sm text-gray-600">نقطة API</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-lg">
              <div className="text-2xl font-bold text-orange-600">24/7</div>
              <div className="text-sm text-gray-600">دعم فني</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">تصفح حسب الفئة</h2>
            <p className="text-lg text-gray-600">اختر الفئة التي تحتاجها</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-16">
            {docCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-center ${
                  selectedCategory === category.id ? 'ring-2 ring-green-500 bg-green-50' : ''
                }`}
              >
                <div className="text-3xl mb-3">{category.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{category.label}</h3>
                <div className="text-sm text-gray-500">{category.count} وثيقة</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Content */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">الأكثر قراءة</h2>
            <p className="text-lg text-gray-600">أهم الوثائق والأدلة</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {featuredDocs.map((doc, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-r from-green-100 to-blue-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {doc.category === 'getting-started' && 'البدء'}
                    {doc.category === 'admin-guide' && 'المدير'}
                    {doc.category === 'api-docs' && 'API'}
                  </div>
                  <div className="text-sm text-gray-500">{doc.readTime}</div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3">{doc.title}</h3>
                <p className="text-gray-600 mb-6">{doc.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    {doc.type === 'guide' && <Book className="w-4 h-4 mr-1" />}
                    {doc.type === 'tutorial' && <Play className="w-4 h-4 mr-1" />}
                    {doc.type === 'documentation' && <FileText className="w-4 h-4 mr-1" />}
                    <span>
                      {doc.type === 'guide' && 'دليل'}
                      {doc.type === 'tutorial' && 'درس'}
                      {doc.type === 'documentation' && 'توثيق'}
                    </span>
                  </div>

                  <Link
                    href="#"
                    className="text-green-600 font-semibold hover:text-green-700 transition-colors flex items-center"
                  >
                    اقرأ الآن
                    <ChevronRight className="w-4 h-4 mr-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Resources */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">موارد التعلم</h2>
            <p className="text-lg text-gray-600">تعلم بالطريقة التي تناسبك</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Book className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">الأدلة المكتوبة</h3>
              <p className="text-gray-600 mb-6">
                أدلة مفصلة خطوة بخطوة لجميع ميزات المنصة
              </p>
              <button className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-green-700 transition-colors">
                تصفح الأدلة
              </button>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Video className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">الفيديوهات التعليمية</h3>
              <p className="text-gray-600 mb-6">
                فيديوهات توضيحية تفاعلية للمبتدئين والمحترفين
              </p>
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-colors">
                شاهد الفيديوهات
              </button>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Download className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">تحميل الموارد</h3>
              <p className="text-gray-600 mb-6">
                تحميل الأدلة والنماذج والأدوات المساعدة
              </p>
              <button className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-700 hover:to-red-700 transition-colors">
                تحميل الموارد
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Updates */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">آخر التحديثات</h2>
            <p className="text-lg text-gray-600">كن على اطلاع بأحدث الميزات والتحديثات</p>
          </div>

          <div className="space-y-4 max-w-4xl mx-auto">
            {recentUpdates.map((update, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${
                      update.type === 'update' ? 'bg-blue-500' :
                      update.type === 'feature' ? 'bg-green-500' :
                      'bg-orange-500'
                    }`}></div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{update.title}</h3>
                      <p className="text-sm text-gray-500">{update.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      update.type === 'update' ? 'bg-blue-100 text-blue-800' :
                      update.type === 'feature' ? 'bg-green-100 text-green-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {update.type === 'update' && 'تحديث'}
                      {update.type === 'feature' && 'ميزة جديدة'}
                      {update.type === 'security' && 'أمان'}
                    </span>
                    <button className="text-gray-400 hover:text-gray-600">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Help & Support */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-3xl p-8 md:p-12 text-white text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lightbulb className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4">تحتاج مساعدة؟</h2>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              فريق الدعم الفني لدينا جاهز لمساعدتك في أي وقت. تواصل معنا للحصول على الدعم الفوري
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href={`/${lng}/support`}
                className="bg-white text-green-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                تواصل مع الدعم
              </Link>
              <Link
                href={`/${lng}/contact`}
                className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all duration-300"
              >
                أرسل استفسار
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
