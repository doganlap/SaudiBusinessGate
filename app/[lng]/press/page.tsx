'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, ExternalLink, Newspaper, TrendingUp, Award, Users } from 'lucide-react';

interface PressPageProps {
  params: {
    lng: string;
  };
}

export default function PressPage({ params: { lng } }: PressPageProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const pressReleases = [
    {
      id: 1,
      title: 'Saudi Business Gate تطلق أول منصة ذاتية التشغيل في الشرق الأوسط',
      date: '15 ديسمبر 2024',
      category: 'product',
      excerpt: 'أعلنت اليوم شركة Saudi Business Gate عن إطلاق منصتها المتقدمة التي تجمع بين الذكاء الاصطناعي والامتثال التنظيمي الكامل.',
      link: '#',
      featured: true
    },
    {
      id: 2,
      title: 'تعاون استراتيجي مع وزارة التجارة لدعم التحول الرقمي',
      date: '3 نوفمبر 2024',
      category: 'partnership',
      excerpt: 'وقعت Saudi Business Gate اتفاقية تعاون مع وزارة التجارة لدعم الشركات السعودية في رحلتها نحو التحول الرقمي.',
      link: '#',
      featured: false
    },
    {
      id: 3,
      title: 'حصول على شهادة الأمان العالمية ISO 27001',
      date: '20 أكتوبر 2024',
      category: 'certification',
      excerpt: 'نالت منصة Saudi Business Gate شهادة الأمان العالمية ISO 27001 لأنظمتها الأمنية المتقدمة.',
      link: '#',
      featured: false
    },
    {
      id: 4,
      title: 'إطلاق مكتب إقليمي في دبي لخدمة أسواق الخليج',
      date: '5 سبتمبر 2024',
      category: 'expansion',
      excerpt: 'أعلنت الشركة عن افتتاح مكتبها الإقليمي في دبي لتوسيع خدماتها في أسواق دول الخليج.',
      link: '#',
      featured: false
    }
  ];

  const newsArticles = [
    {
      id: 1,
      title: 'الثورة الرقمية في الأعمال السعودية: منصة جديدة تغير قواعد اللعبة',
      source: 'الاقتصادية',
      date: '16 ديسمبر 2024',
      excerpt: 'تقرير مفصل عن كيفية تغيير Saudi Business Gate طريقة إدارة الأعمال في السعودية.',
      link: '#'
    },
    {
      id: 2,
      title: 'شركات سعودية توفر ملايين من خلال الذكاء الاصطناعي',
      source: 'الرياض',
      date: '10 ديسمبر 2024',
      excerpt: 'دراسة تظهر كيف ساهمت تقنيات الذكاء الاصطناعي في توفير التكاليف للشركات المحلية.',
      link: '#'
    },
    {
      id: 3,
      title: 'رؤية 2030: التحول الرقمي يرفع مساهمة القطاع الرقمي إلى 10%',
      source: 'الشرق الأوسط',
      date: '1 ديسمبر 2024',
      excerpt: 'تحليل لدور التحول الرقمي في تحقيق أهداف رؤية المملكة 2030.',
      link: '#'
    }
  ];

  const filteredPress = selectedCategory === 'all'
    ? pressReleases
    : pressReleases.filter(item => item.category === selectedCategory);

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
            الإعلام والصحافة
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            كن على اطلاع بآخر أخبارنا وإنجازاتنا في مجال التحول الرقمي
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Newspaper className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">50+</div>
              <div className="text-sm text-gray-600">مقال صحفي</div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">2M+</div>
              <div className="text-sm text-gray-600">مشاهدة</div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">15+</div>
              <div className="text-sm text-gray-600">جائزة وتقدير</div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">500K+</div>
              <div className="text-sm text-gray-600">متابع</div>
            </div>
          </div>
        </div>
      </section>

      {/* Press Releases */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">البيانات الصحفية</h2>
            <p className="text-lg text-gray-600">آخر الأخبار والإعلانات من Saudi Business Gate</p>
          </div>

          {/* Category Filter */}
          <div className="flex justify-center mb-12">
            <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-100">
              {[
                { id: 'all', label: 'جميع البيانات' },
                { id: 'product', label: 'المنتج' },
                { id: 'partnership', label: 'الشراكات' },
                { id: 'certification', label: 'الشهادات' },
                { id: 'expansion', label: 'التوسع' }
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

          {/* Featured Press Release */}
          {filteredPress.find(item => item.featured) && (
            <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-3xl p-8 md:p-12 text-white mb-12">
              <div className="flex items-center mb-4">
                <div className="bg-white/20 rounded-full px-4 py-2 text-sm font-semibold">
                  إعلان هام
                </div>
              </div>
              <h3 className="text-3xl font-bold mb-4">
                {filteredPress.find(item => item.featured)?.title}
              </h3>
              <p className="text-xl text-green-100 mb-6">
                {filteredPress.find(item => item.featured)?.excerpt}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-green-200">
                  <Calendar className="w-5 h-5 mr-2" />
                  <span>{filteredPress.find(item => item.featured)?.date}</span>
                </div>
                <Link
                  href={filteredPress.find(item => item.featured)?.link || '#'}
                  className="bg-white text-green-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center"
                >
                  اقرأ المزيد
                  <ExternalLink className="w-4 h-4 mr-2" />
                </Link>
              </div>
            </div>
          )}

          {/* Other Press Releases */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPress.filter(item => !item.featured).map((press) => (
              <div key={press.id} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-r from-blue-100 to-green-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {press.category === 'product' && 'المنتج'}
                    {press.category === 'partnership' && 'شراكة'}
                    {press.category === 'certification' && 'شهادة'}
                    {press.category === 'expansion' && 'توسع'}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-1" />
                    {press.date}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
                  {press.title}
                </h3>

                <p className="text-gray-600 mb-4 line-clamp-3">
                  {press.excerpt}
                </p>

                <Link
                  href={press.link}
                  className="text-green-600 font-semibold hover:text-green-700 transition-colors flex items-center"
                >
                  اقرأ المزيد
                  <ExternalLink className="w-4 h-4 mr-1" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* News Articles */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">أخبارنا في الإعلام</h2>
            <p className="text-lg text-gray-600">ما يقوله الإعلام عن Saudi Business Gate</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsArticles.map((article) => (
              <div key={article.id} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {article.source}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-1" />
                    {article.date}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-3 leading-tight">
                  {article.title}
                </h3>

                <p className="text-gray-600 mb-4 line-clamp-3">
                  {article.excerpt}
                </p>

                <Link
                  href={article.link}
                  className="text-purple-600 font-semibold hover:text-purple-700 transition-colors flex items-center"
                >
                  اقرأ المقال
                  <ExternalLink className="w-4 h-4 mr-1" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Media Kit */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-3xl p-8 md:p-12 text-white text-center">
            <h2 className="text-3xl font-bold mb-6">طلب مواد إعلامية</h2>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              للصحفيين والإعلاميين: احصل على صور المنصة والبيانات الرسمية والمعلومات التفصيلية
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="bg-white text-green-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-lg">
                طلب ملف الإعلام
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all duration-300">
                تواصل معنا
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
