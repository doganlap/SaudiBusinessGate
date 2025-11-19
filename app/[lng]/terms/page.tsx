import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { notFound } from 'next/navigation'

export const metadata: Metadata = {
  title: 'شروط الخدمة | بوابة الأعمال السعودية',
  description: 'شروط الخدمة لبوابة الأعمال السعودية - Terms of Service for Saudi Business Gate',
}

interface TermsPageProps {
  params: {
    lng: string
  }
}

export default async function TermsPage({ params: { lng } }: TermsPageProps) {
  // Check if user is authenticated (optional for terms page)
  const session = await getServerSession()

  const isArabic = lng === 'ar'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {isArabic ? 'شروط الخدمة' : 'Terms of Service'}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {isArabic
              ? 'بوابة الأعمال السعودية - المنصة الأولى لإدارة الأعمال في المنطقة'
              : 'Saudi Business Gate - The 1st Business Management Platform in the Region'
            }
          </p>
        </div>

        {/* Terms Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            {isArabic ? (
              <div className="space-y-6" dir="rtl">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    1. قبول الشروط
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300">
                    باستخدامك لخدمات بوابة الأعمال السعودية، أنت توافق على الالتزام بهذه الشروط والأحكام.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    2. الخدمات المقدمة
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    نقدم منصة متكاملة لإدارة الأعمال تشمل:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
                    <li>إدارة المالية والمحاسبة</li>
                    <li>إدارة علاقات العملاء (CRM)</li>
                    <li>إدارة المبيعات والتسويق</li>
                    <li>إدارة الموارد البشرية</li>
                    <li>إدارة الامتثال والحوكمة</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    3. مسؤوليات المستخدم
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    يجب عليك:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
                    <li>تقديم معلومات صحيحة ودقيقة</li>
                    <li>الحفاظ على سرية كلمة المرور</li>
                    <li>عدم مشاركة الحساب مع الآخرين</li>
                    <li>استخدام المنصة لأغراض مشروعة فقط</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    4. حقوق الملكية
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300">
                    جميع حقوق الملكية الفكرية محفوظة لبوابة الأعمال السعودية.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    5. الإنهاء
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300">
                    يحق لنا إنهاء خدماتك في أي وقت دون إشعار مسبق.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    6. القانون المعمول به
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300">
                    تخضع هذه الشروط لقوانين المملكة العربية السعودية.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    1. Acceptance of Terms
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300">
                    By using Saudi Business Gate services, you agree to be bound by these terms and conditions.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    2. Services Provided
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    We provide an integrated business management platform including:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
                    <li>Financial management and accounting</li>
                    <li>Customer relationship management (CRM)</li>
                    <li>Sales and marketing management</li>
                    <li>Human resources management</li>
                    <li>Compliance and governance management</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    3. User Responsibilities
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    You must:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
                    <li>Provide accurate and truthful information</li>
                    <li>Maintain password confidentiality</li>
                    <li>Not share account with others</li>
                    <li>Use the platform for legitimate purposes only</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    4. Intellectual Property Rights
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300">
                    All intellectual property rights are reserved for Saudi Business Gate.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    5. Termination
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300">
                    We reserve the right to terminate your services at any time without prior notice.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    6. Governing Law
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300">
                    These terms are subject to the laws of the Kingdom of Saudi Arabia.
                  </p>
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
            className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {isArabic ? 'العودة إلى لوحة التحكم' : 'Back to Dashboard'}
          </a>
        </div>
      </div>
    </div>
  )
}
