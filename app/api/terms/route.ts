import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Mock data for terms page
    const termsData = {
      success: true,
      data: {
        title: 'شروط الخدمة',
        titleEn: 'Terms of Service',
        content: {
          ar: `
# شروط الخدمة لبوابة الأعمال السعودية

## 1. قبول الشروط
باستخدامك لخدمات بوابة الأعمال السعودية، أنت توافق على الالتزام بهذه الشروط والأحكام.

## 2. الخدمات المقدمة
نقدم منصة متكاملة لإدارة الأعمال تشمل:
- إدارة المالية والمحاسبة
- إدارة علاقات العملاء (CRM)
- إدارة المبيعات والتسويق
- إدارة الموارد البشرية
- إدارة الامتثال والحوكمة

## 3. مسؤوليات المستخدم
يجب عليك:
- تقديم معلومات صحيحة ودقيقة
- الحفاظ على سرية كلمة المرور
- عدم مشاركة الحساب مع الآخرين
- استخدام المنصة لأغراض مشروعة فقط

## 4. حقوق الملكية
جميع حقوق الملكية الفكرية محفوظة لبوابة الأعمال السعودية.

## 5. الإنهاء
يحق لنا إنهاء خدماتك في أي وقت دون إشعار مسبق.

## 6. القانون المعمول به
تخضع هذه الشروط لقوانين المملكة العربية السعودية.
          `,
          en: `
# Terms of Service for Saudi Business Gate

## 1. Acceptance of Terms
By using Saudi Business Gate services, you agree to be bound by these terms and conditions.

## 2. Services Provided
We provide an integrated business management platform including:
- Financial management and accounting
- Customer relationship management (CRM)
- Sales and marketing management
- Human resources management
- Compliance and governance management

## 3. User Responsibilities
You must:
- Provide accurate and truthful information
- Maintain password confidentiality
- Not share account with others
- Use the platform for legitimate purposes only

## 4. Intellectual Property Rights
All intellectual property rights are reserved for Saudi Business Gate.

## 5. Termination
We reserve the right to terminate your services at any time without prior notice.

## 6. Governing Law
These terms are subject to the laws of the Kingdom of Saudi Arabia.
          `
        },
        lastUpdated: '2025-01-19',
        version: '2.0.0'
      }
    };

    return NextResponse.json(termsData);
  } catch (error) {
    console.error('Terms API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch terms data' },
      { status: 500 }
    );
  }
}
