import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'الدعم الفني | بوابة الأعمال السعودية',
  description: 'الدعم الفني لبوابة الأعمال السعودية - Support for Saudi Business Gate',
}

interface SupportPageProps {
  params: {
    lng: string
  }
}

export default async function SupportPage({ params: { lng } }: SupportPageProps) {
  const isArabic = lng === 'ar'

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {isArabic ? 'الدعم الفني' : 'Technical Support'}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {isArabic
              ? 'نحن هنا لمساعدتك - فريق الدعم الفني متاح 24/7'
              : 'We are here to help you - Technical support team available 24/7'
            }
          </p>
        </div>

        {/* Support Content */}
        <div className="space-y-6">
          {/* Contact Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              {isArabic ? 'معلومات التواصل' : 'Contact Information'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {isArabic ? 'البريد الإلكتروني' : 'Email'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">support@doganhub.com</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {isArabic ? 'الهاتف' : 'Phone'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">+966 50 123 4567</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {isArabic ? 'ساعات العمل' : 'Business Hours'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {isArabic ? '24/7 - متوفر دائماً' : '24/7 - Always Available'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {isArabic ? 'الدردشة الحية' : 'Live Chat'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {isArabic ? 'متوفر في لوحة التحكم' : 'Available in Dashboard'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              {isArabic ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
            </h2>

            <div className="space-y-4">
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {isArabic ? 'كيف أستطيع إعادة تعيين كلمة المرور؟' : 'How can I reset my password?'}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {isArabic
                    ? 'انقر على "نسيت كلمة المرور" في صفحة تسجيل الدخول واتبع التعليمات.'
                    : 'Click on "Forgot Password" on the login page and follow the instructions.'
                  }
                </p>
              </div>

              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {isArabic ? 'كيف أحصل على فاتورة؟' : 'How do I get an invoice?'}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {isArabic
                    ? 'يمكنك تحميل الفواتير من قسم "المالية" في لوحة التحكم.'
                    : 'You can download invoices from the "Finance" section in your dashboard.'
                  }
                </p>
              </div>

              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {isArabic ? 'كيف أقوم بترقية خطتي؟' : 'How do I upgrade my plan?'}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {isArabic
                    ? 'تواصل مع فريق المبيعات عبر البريد الإلكتروني أو الهاتف.'
                    : 'Contact our sales team via email or phone.'
                  }
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {isArabic ? 'ما هي مستويات الدعم المتاحة؟' : 'What support levels are available?'}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {isArabic
                    ? 'نقدم دعماً فنياً على مدار 24 ساعة لجميع الخطط المدفوعة.'
                    : 'We provide 24/7 technical support for all paid plans.'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={`/${lng}/dashboard`}
                className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isArabic ? 'العودة إلى لوحة التحكم' : 'Back to Dashboard'}
              </a>
              <a
                href="mailto:support@doganhub.com"
                className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isArabic ? 'إرسال بريد إلكتروني' : 'Send Email'}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
