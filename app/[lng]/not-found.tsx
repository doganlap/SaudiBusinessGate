'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Home, ArrowLeft, Search, HelpCircle } from 'lucide-react';

export default function NotFound() {
  const params = useParams();
  const lng = (params.lng as string) || 'ar';
  const isRTL = lng === 'ar';

  const content = {
    ar: {
      title: 'الصفحة غير موجودة',
      code: '٤٠٤',
      message: 'عذراً، الصفحة التي تبحث عنها غير موجودة',
      description: 'قد تكون الصفحة قد تم نقلها أو حذفها، أو ربما قمت بإدخال عنوان خاطئ',
      homeButton: 'العودة إلى الصفحة الرئيسية',
      dashboardButton: 'لوحة التحكم',
      suggestions: 'اقتراحات مفيدة:',
      suggestionsList: [
        'تحقق من صحة عنوان URL',
        'استخدم شريط البحث للعثور على ما تبحث عنه',
        'تصفح القائمة الجانبية للوصول إلى الصفحات',
        'اتصل بالدعم الفني إذا كنت بحاجة إلى مساعدة'
      ]
    },
    en: {
      title: 'Page Not Found',
      code: '404',
      message: 'Sorry, the page you are looking for does not exist',
      description: 'The page may have been moved or deleted, or you may have entered an incorrect address',
      homeButton: 'Go to Homepage',
      dashboardButton: 'Dashboard',
      suggestions: 'Helpful suggestions:',
      suggestionsList: [
        'Check the URL for accuracy',
        'Use the search bar to find what you\'re looking for',
        'Browse the sidebar menu to access pages',
        'Contact technical support if you need assistance'
      ]
    }
  };

  const t = content[lng as keyof typeof content] || content.en;

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 flex items-center justify-center p-4 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-2xl w-full">
        {/* Error Code */}
        <div className="text-center mb-8">
          <div className="inline-block">
            <h1 className="text-9xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-pulse">
              {t.code}
            </h1>
          </div>
        </div>

        {/* Error Card */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 p-8 mb-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
              {t.title}
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-2">
              {t.message}
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-500">
              {t.description}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Link
              href={`/${lng}/dashboard`}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Home className="h-5 w-5" />
              <span>{t.dashboardButton}</span>
            </Link>
            <Link
              href={`/${lng}`}
              className="flex-1 flex items-center justify-center gap-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
            >
              <ArrowLeft className={`h-5 w-5 ${isRTL ? 'rotate-180' : ''}`} />
              <span>{t.homeButton}</span>
            </Link>
          </div>

          {/* Suggestions */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-lg p-6 border border-blue-100 dark:border-blue-900/30">
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold text-neutral-900 dark:text-white">
                {t.suggestions}
              </h3>
            </div>
            <ul className={`space-y-2 ${isRTL ? 'text-right' : 'text-left'}`}>
              {t.suggestionsList.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">{isRTL ? '←' : '→'}</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Branding */}
        <div className="text-center">
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
            {isRTL ? 'بوابة الأعمال السعودية المؤسسية' : 'Saudi Business Gate Enterprise'}
          </p>
          <p className="text-xs text-neutral-400 dark:text-neutral-500">
            {isRTL ? 'أول بوابة أعمال ذاتية التشغيل في المنطقة' : 'The 1st Autonomous Business Gate in the Region'}
          </p>
        </div>
      </div>
    </div>
  );
}
