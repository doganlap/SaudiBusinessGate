'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Clock, DollarSign, Users, Coffee, Code, Shield, TrendingUp } from 'lucide-react';

interface CareersPageProps {
  params: {
    lng: string;
  };
}

export default function CareersPage({ params: { lng } }: CareersPageProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const jobs = [
    {
      id: 1,
      title: 'مطور Full Stack',
      category: 'technical',
      type: 'دوام كامل',
      location: 'الرياض',
      salary: '15,000 - 25,000 ريال',
      description: 'نبحث عن مطور Full Stack للانضمام إلى فريقنا في تطوير منصة Saudi Business Gate',
      requirements: ['خبرة في React/Next.js', 'خبرة في Node.js', 'معرفة بقواعد البيانات', 'إجادة اللغة العربية'],
      benefits: ['راتب تنافسي', 'تأمين صحي شامل', 'عمل عن بعد جزئي', 'تدريب مستمر']
    },
    {
      id: 2,
      title: 'خبير أمن سيبراني',
      category: 'technical',
      type: 'دوام كامل',
      location: 'جدة',
      salary: '20,000 - 35,000 ريال',
      description: 'مسؤول عن أمن المنصة وحماية بيانات العملاء من التهديدات السيبرانية',
      requirements: ['شهادات أمن سيبراني', 'خبرة في AWS/Azure', 'معرفة بالامتثال', 'مهارات تحليل التهديدات'],
      benefits: ['راتب عالي التنافسية', 'تأمين صحي VIP', 'مكافآت أداء', 'مشاركة في المؤتمرات']
    },
    {
      id: 3,
      title: 'مستشار أعمال',
      category: 'business',
      type: 'دوام كامل',
      location: 'الرياض',
      salary: '18,000 - 30,000 ريال',
      description: 'مساعدة العملاء في تحقيق أقصى استفادة من منصة Saudi Business Gate',
      requirements: ['خبرة في الاستشارات', 'فهم الأعمال السعودية', 'مهارات تواصل ممتازة', 'معرفة بالتحول الرقمي'],
      benefits: ['عمولة على المبيعات', 'سيارة شركة', 'هاتف وإنترنت', 'برامج تدريبية']
    },
    {
      id: 4,
      title: 'مصمم UX/UI',
      category: 'design',
      type: 'دوام كامل',
      location: 'الرياض',
      salary: '12,000 - 20,000 ريال',
      description: 'تصميم واجهات مستخدم حديثة وسهلة الاستخدام للمنصة',
      requirements: ['خبرة في Figma/Adobe XD', 'فهم UX principles', 'portfolio قوي', 'مهارات prototyping'],
      benefits: ['بيئة إبداعية', 'أدوات تصميم متقدمة', 'مشاركة في المعارض', 'مرونة في العمل']
    },
    {
      id: 5,
      title: 'محلل بيانات',
      category: 'technical',
      type: 'دوام كامل',
      location: 'الدمام',
      salary: '16,000 - 28,000 ريال',
      description: 'تحليل بيانات العملاء وإنشاء تقارير وتوصيات لتحسين الأداء',
      requirements: ['خبرة في Python/R', 'معرفة SQL', 'مهارات visualization', 'فهم الإحصاء'],
      benefits: ['عمل مع بيانات كبيرة', 'شهادات مهنية', 'مشاركة في البحث', 'راتب تنافسي']
    }
  ];

  const filteredJobs = selectedCategory === 'all'
    ? jobs
    : jobs.filter(job => job.category === selectedCategory);

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
            انضم إلى فريقنا
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            كن جزءاً من الثورة الرقمية في السعودية ومساهماً في بناء مستقبل الأعمال
          </p>

          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
              <Users className="w-5 h-5" />
              <span>فريق شاب وديناميكي</span>
            </div>
            <div className="flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full">
              <Coffee className="w-5 h-5" />
              <span>بيئة عمل مريحة</span>
            </div>
            <div className="flex items-center space-x-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-full">
              <TrendingUp className="w-5 h-5" />
              <span>نمو وتطوير مستمر</span>
            </div>
          </div>
        </div>
      </section>

      {/* Why Join Us */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">لماذا تنضم إلينا؟</h2>
            <p className="text-lg text-gray-600">فرصة للعمل في مشروع وطني رائد</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Code className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">تقنيات حديثة</h3>
              <p className="text-gray-600">
                نعمل بأحدث التقنيات في الذكاء الاصطناعي والحوسبة السحابية
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">أمان وحماية</h3>
              <p className="text-gray-600">
                نحمي بيانات ملايين العملاء بأعلى معايير الأمان العالمية
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">تأثير وطني</h3>
              <p className="text-gray-600">
                نساهم في تحقيق رؤية 2030 ونمو الاقتصاد الرقمي السعودي
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Job Listings */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">الوظائف المتاحة</h2>
            <p className="text-lg text-gray-600">انضم إلى فريقنا المتميز</p>
          </div>

          {/* Category Filter */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-100">
              {[
                { id: 'all', label: 'جميع الوظائف' },
                { id: 'technical', label: 'تقنية' },
                { id: 'business', label: 'أعمال' },
                { id: 'design', label: 'تصميم' }
              ].map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* Job Cards */}
          <div className="space-y-6">
            {filteredJobs.map((job) => (
              <div key={job.id} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
                  <div className="mb-4 lg:mb-0">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {job.location}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {job.type}
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        {job.salary}
                      </div>
                    </div>
                  </div>
                  <button className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-300">
                    تقدم الآن
                  </button>
                </div>

                <p className="text-gray-700 mb-6">{job.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">المتطلبات:</h4>
                    <ul className="space-y-1">
                      {job.requirements.map((req, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">المزايا:</h4>
                    <ul className="space-y-1">
                      {job.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredJobs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">لا توجد وظائف متاحة في هذه الفئة حالياً</p>
            </div>
          )}
        </div>
      </section>

      {/* Culture Section */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">ثقافة الشركة</h2>
            <p className="text-lg text-gray-600">نحن نؤمن بالتوازن بين العمل والحياة الشخصية</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">الابتكار</h3>
              <p className="text-sm text-gray-600">نشجع على الأفكار الجديدة والحلول المبتكرة</p>
            </div>

            <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">التعاون</h3>
              <p className="text-sm text-gray-600">نعمل معاً كفريق واحد نحو الأهداف المشتركة</p>
            </div>

            <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">النمو</h3>
              <p className="text-sm text-gray-600">نستثمر في تطوير مهارات فريقنا باستمرار</p>
            </div>

            <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">❤️</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">الاهتمام</h3>
              <p className="text-sm text-gray-600">نهتم بصحة وسعادة موظفينا وأسرهم</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
