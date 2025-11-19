import { NextResponse } from 'next/server';
import { authService } from '@/lib/auth/auth-service';

export async function GET() {
  try {
    // Get current authenticated user
    const user = await authService.getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Return user data in the expected format
    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.fullName,
        nameEn: user.fullName,
        email: user.email,
        tenantId: user.tenantId,
        role: user.role,
        avatar: user.avatar,
        locale: user.language || 'ar',
        timezone: user.timezone || 'Asia/Riyadh'
      }
    });
  } catch (error) {
    console.error('Auth API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    );
  }
}
