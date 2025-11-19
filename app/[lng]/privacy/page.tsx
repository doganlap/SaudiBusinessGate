import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'سياسة الخصوصية | بوابة الأعمال السعودية',
  description: 'سياسة الخصوصية لبوابة الأعمال السعودية - Privacy Policy for Saudi Business Gate',
}

interface PrivacyPageProps {
  params: {
    lng: string
  }
}

export default async function PrivacyPage({ params: { lng } }: PrivacyPageProps) {
  const isArabic = lng === 'ar'

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {isArabic ? 'سياسة الخصوصية' : 'Privacy Policy'}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {isArabic
              ? 'بوابة الأعمال السعودية - نحن ملتزمون بحماية خصوصيتك'
              : 'Saudi Business Gate - We are committed to protecting your privacy'
            }
          </p>
        </div>

        {/* Privacy Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            {isArabic ? (
              <div className="space-y-6" dir="rtl">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    1. جمع المعلومات
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300">
                    نجمع معلومات شخصية عند التسجيل في خدماتنا، بما في ذلك الاسم، البريد الإلكتروني، ومعلومات الشركة.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    2. استخدام المعلومات
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    نستخدم معلوماتك لـ:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
                    <li>تقديم خدماتنا</li>
                    <li>تحسين تجربة المستخدم</li>
                    <li>إرسال التحديثات والإشعارات</li>
                    <li>ضمان أمان المنصة</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    3. مشاركة المعلومات
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300">
                    لا نبيع أو نؤجر معلوماتك الشخصية لأطراف ثالثة. قد نشارك المعلومات فقط عند الحاجة لتقديم الخدمة أو عند طلب السلطات المختصة.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    4. أمان البيانات
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300">
                    نتخذ تدابير أمنية متقدمة لحماية بياناتك، بما في ذلك التشفير والتحكم في الوصول.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    5. حقوقك
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    لديك الحق في:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
                    <li>الوصول إلى بياناتك الشخصية</li>
                    <li>تصحيح المعلومات غير الصحيحة</li>
                    <li>حذف بياناتك</li>
                    <li>الاعتراض على معالجة البيانات</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    1. Information Collection
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300">
                    We collect personal information when you register for our services, including name, email, and company information.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    2. Information Use
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    We use your information to:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
                    <li>Provide our services</li>
                    <li>Improve user experience</li>
                    <li>Send updates and notifications</li>
                    <li>Ensure platform security</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    3. Information Sharing
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300">
                    We do not sell or rent your personal information to third parties. We may share information only when necessary to provide the service or when requested by competent authorities.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    4. Data Security
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300">
                    We take advanced security measures to protect your data, including encryption and access controls.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    5. Your Rights
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    You have the right to:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
                    <li>Access your personal data</li>
                    <li>Correct inaccurate information</li>
                    <li>Delete your data</li>
                    <li>Object to data processing</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isArabic ? 'آخر تحديث:' : 'Last updated:'} January 19, 2025
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 sm:mt-0">
                Version 2.0.0
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="text-center mt-8">
          <a
            href={`/${lng}/dashboard`}
            className="inline-block bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {isArabic ? 'العودة إلى لوحة التحكم' : 'Back to Dashboard'}
          </a>
        </div>
      </div>
    </div>
  )
}
