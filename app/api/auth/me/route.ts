import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Mock user data for testing - Arabic name for Saudi market
    const mockUserData = {
      success: true,
      data: {
        id: 'test-user-123',
        name: 'أحمد محمد', // Ahmed Mohammed in Arabic
        nameEn: 'Ahmed Mohammed',
        email: 'ahmed@doganhub.com',
        tenantId: 'saudi-business-123',
        organization: 'بوابة الأعمال السعودية',
        organizationEn: 'Saudi Business Gate',
        role: 'admin',
        avatar: null,
        locale: 'ar',
        timezone: 'Asia/Riyadh'
      }
    };

    return NextResponse.json(mockUserData);
  } catch (error) {
    console.error('Auth API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    );
  }
}
