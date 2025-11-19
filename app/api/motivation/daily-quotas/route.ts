import { NextResponse } from 'next/server';

// Daily quotas API endpoint
export async function GET() {
  try {
    // Mock daily quotas data - in production this would come from database
    const dailyQuotas = [
      {
        id: 'sales-calls',
        category: 'sales',
        title: 'Sales Calls Made',
        titleAr: 'المكالمات المبيعية المنجزة',
        target: 50,
        current: 37,
        unit: 'calls',
        motivationalMessage: "You're on fire! Only 13 more calls to crush your daily goal! 🔥",
        motivationalMessageAr: "أنت في أحسن حال! 13 مكالمة فقط لتحقيق هدفك اليومي! 🔥",
        streak: 5
      },
      {
        id: 'crm-contacts',
        category: 'crm',
        title: 'New CRM Contacts',
        titleAr: 'جهات اتصال جديدة في إدارة العملاء',
        target: 20,
        current: 18,
        unit: 'contacts',
        motivationalMessage: "Almost there! 2 more contacts and you're a champion! 👑",
        motivationalMessageAr: "تقريباً هناك! اتصالان آخران وأنت بطل! 👑",
        streak: 8
      },
      {
        id: 'revenue-target',
        category: 'sales',
        title: 'Revenue Target',
        titleAr: 'هدف الإيرادات',
        target: 15000,
        current: 12750,
        unit: 'SAR',
        motivationalMessage: "Outstanding progress! Just 2,250 SAR to reach your target! 💰",
        motivationalMessageAr: "تقدم رائع! 2,250 ريال فقط لتحقيق هدفك! 💰",
        streak: 3
      },
      {
        id: 'hr-reviews',
        category: 'hr',
        title: 'Performance Reviews',
        titleAr: 'مراجعات الأداء',
        target: 5,
        current: 3,
        unit: 'reviews',
        motivationalMessage: "Great work! Complete 2 more reviews to finish strong! 📈",
        motivationalMessageAr: "عمل رائع! أكمل مراجعتين أخريين لتنتهي بقوة! 📈",
        streak: 12
      }
    ];

    return NextResponse.json({
      success: true,
      quotas: dailyQuotas,
      summary: {
        totalQuotas: dailyQuotas.length,
        completedQuotas: dailyQuotas.filter(q => q.current >= q.target).length,
        averageProgress: Math.round(dailyQuotas.reduce((sum, q) => sum + (q.current / q.target * 100), 0) / dailyQuotas.length),
        totalStreak: dailyQuotas.reduce((sum, q) => sum + q.streak, 0)
      }
    });
  } catch (error) {
    console.error('Daily quotas API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch daily quotas' },
      { status: 500 }
    );
  }
}
