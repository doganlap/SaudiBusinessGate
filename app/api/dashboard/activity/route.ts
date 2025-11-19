import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // In a real app, you would fetch this from your activity/audit log table
    const tenantId = request.headers.get('x-tenant-id') || 'default'
    
    // Mock recent activity data with Arabic support
    const activities = [
      {
        id: '1',
        type: 'user',
        message: 'مستخدم جديد مسجل: khalid@example.com',
        messageEn: 'New user registered: khalid@example.com',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        status: 'success'
      },
      {
        id: '2',
        type: 'subscription',
        message: 'تم ترقية الاشتراك إلى الخطة الاحترافية',
        messageEn: 'Subscription upgraded to Pro plan',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        status: 'success'
      },
      {
        id: '3',
        type: 'payment',
        message: 'تم استلام الدفعة: ٣٦٠ ر.س',
        messageEn: 'Payment received: 360 SAR',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        status: 'success'
      },
      {
        id: '4',
        type: 'system',
        message: 'اكتملت النسخة الاحتياطية للنظام بنجاح',
        messageEn: 'System backup completed successfully',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        status: 'info'
      },
      {
        id: '5',
        type: 'user',
        message: 'طلب إعادة تعيين كلمة المرور لـ abdullah@example.com',
        messageEn: 'Password reset requested for abdullah@example.com',
        timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        status: 'warning'
      },
      {
        id: '6',
        type: 'payment',
        message: 'فشلت عملية الدفع - يرجى التحقق من بطاقة الائتمان',
        messageEn: 'Payment failed - please check credit card',
        timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
        status: 'error'
      }
    ]

    return NextResponse.json({
      success: true,
      data: activities
    })
  } catch (error) {
    console.error('Error fetching dashboard activity:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch recent activity' },
      { status: 500 }
    )
  }
}
