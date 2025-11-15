"use client";
import { useEffect, useState } from 'react';
import DoganAppStoreShell from '@/components/DoganAppStoreShell';

export default function AppStorePage({ params }: { params: Promise<{ lng: string }> }) {
  const [locale, setLocale] = useState<'ar' | 'en'>('ar');

  useEffect(() => {
    params.then(p => setLocale(p.lng as 'ar' | 'en'));
  }, [params]);

  return (
    <DoganAppStoreShell locale={locale}>
      <div className="mx-auto max-w-7xl">
        {/* Custom content for AppStore page */}
        <div className="rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-xl ring-1 ring-white/10 shadow mb-6">
          <h1 className="text-2xl font-bold mb-4">
            {locale === 'ar' ? 'متجر التطبيقات' : 'App Store'}
          </h1>
          <p className="text-sm opacity-80 mb-4">
            {locale === 'ar' 
              ? 'اكتشف وقم بتثبيت التطبيقات التي تحتاجها لتطوير أعمالك'
              : 'Discover and install the apps you need to grow your business'
            }
          </p>
          
          {/* App Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            <AppCategoryCard 
              title={locale === 'ar' ? 'المالية' : 'Finance'}
              description={locale === 'ar' ? 'تطبيقات إدارة الأموال والمحاسبة' : 'Money management and accounting apps'}
              count={12}
              color="emerald"
            />
            <AppCategoryCard 
              title={locale === 'ar' ? 'المبيعات' : 'Sales'}
              description={locale === 'ar' ? 'أدوات إدارة المبيعات والعملاء' : 'Sales and customer management tools'}
              count={8}
              color="blue"
            />
            <AppCategoryCard 
              title={locale === 'ar' ? 'الموارد البشرية' : 'HR'}
              description={locale === 'ar' ? 'حلول إدارة الموظفين والرواتب' : 'Employee and payroll management solutions'}
              count={6}
              color="purple"
            />
            <AppCategoryCard 
              title={locale === 'ar' ? 'التسويق' : 'Marketing'}
              description={locale === 'ar' ? 'أدوات التسويق الرقمي والإعلان' : 'Digital marketing and advertising tools'}
              count={15}
              color="pink"
            />
            <AppCategoryCard 
              title={locale === 'ar' ? 'الإنتاجية' : 'Productivity'}
              description={locale === 'ar' ? 'تطبيقات تحسين الإنتاجية والتعاون' : 'Productivity and collaboration apps'}
              count={20}
              color="orange"
            />
            <AppCategoryCard 
              title={locale === 'ar' ? 'الأمان' : 'Security'}
              description={locale === 'ar' ? 'حلول الأمان وحماية البيانات' : 'Security and data protection solutions'}
              count={9}
              color="red"
            />
          </div>
        </div>

        {/* Featured Apps */}
        <div className="rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-xl ring-1 ring-white/10 shadow">
          <h2 className="text-xl font-semibold mb-4">
            {locale === 'ar' ? 'التطبيقات المميزة' : 'Featured Apps'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FeaturedAppCard 
              name={locale === 'ar' ? 'محاسب الذكي' : 'Smart Accountant'}
              description={locale === 'ar' ? 'نظام محاسبة متكامل مع AI' : 'Complete accounting system with AI'}
              rating={4.8}
              downloads="2.3k"
              price={locale === 'ar' ? '299 ريال/شهر' : '299 SAR/month'}
            />
            <FeaturedAppCard 
              name={locale === 'ar' ? 'مدير المبيعات' : 'Sales Manager'}
              description={locale === 'ar' ? 'إدارة شاملة للمبيعات والعملاء' : 'Comprehensive sales and customer management'}
              rating={4.6}
              downloads="1.8k"
              price={locale === 'ar' ? '199 ريال/شهر' : '199 SAR/month'}
            />
            <FeaturedAppCard 
              name={locale === 'ar' ? 'مراقب الأمان' : 'Security Monitor'}
              description={locale === 'ar' ? 'مراقبة الأمان في الوقت الفعلي' : 'Real-time security monitoring'}
              rating={4.9}
              downloads="3.1k"
              price={locale === 'ar' ? '399 ريال/شهر' : '399 SAR/month'}
            />
            <FeaturedAppCard 
              name={locale === 'ar' ? 'مساعد التسويق' : 'Marketing Assistant'}
              description={locale === 'ar' ? 'أتمتة حملات التسويق الرقمي' : 'Automate digital marketing campaigns'}
              rating={4.7}
              downloads="1.5k"
              price={locale === 'ar' ? '149 ريال/شهر' : '149 SAR/month'}
            />
          </div>
        </div>
      </div>
    </DoganAppStoreShell>
  );
}

function AppCategoryCard({ title, description, count, color }: {
  title: string;
  description: string;
  count: number;
  color: string;
}) {
  const colorClasses = {
    emerald: 'from-emerald-400/20 to-teal-400/20 border-emerald-400/30',
    blue: 'from-blue-400/20 to-cyan-400/20 border-blue-400/30',
    purple: 'from-purple-400/20 to-violet-400/20 border-purple-400/30',
    pink: 'from-pink-400/20 to-rose-400/20 border-pink-400/30',
    orange: 'from-orange-400/20 to-amber-400/20 border-orange-400/30',
    red: 'from-red-400/20 to-pink-400/20 border-red-400/30',
  }[color] || 'from-gray-400/20 to-slate-400/20 border-gray-400/30';

  return (
    <div className={`rounded-xl border bg-gradient-to-br ${colorClasses} p-4 hover:scale-105 transition-transform cursor-pointer`}>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-sm opacity-80 mb-3">{description}</p>
      <div className="text-xs opacity-70">{count} تطبيق متاح</div>
    </div>
  );
}

function FeaturedAppCard({ name, description, rating, downloads, price }: {
  name: string;
  description: string;
  rating: number;
  downloads: string;
  price: string;
}) {
  return (
    <div className="rounded-xl border border-white/20 bg-white/5 p-4 hover:bg-white/10 transition-colors">
      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-400/70 to-teal-400/70 mb-3 flex items-center justify-center">
        <span className="text-white font-bold text-lg">A</span>
      </div>
      <h3 className="font-semibold mb-2">{name}</h3>
      <p className="text-sm opacity-80 mb-3 line-clamp-2">{description}</p>
      <div className="flex items-center justify-between text-xs opacity-70 mb-2">
        <span>⭐ {rating}</span>
        <span>{downloads} تحميل</span>
      </div>
      <div className="text-sm font-medium text-emerald-400">{price}</div>
    </div>
  );
}
