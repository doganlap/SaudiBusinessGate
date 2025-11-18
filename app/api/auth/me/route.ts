import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Mock user data for testing
    const mockUserData = {
      success: true,
      data: {
        id: 'test-user-123',
        name: 'Test User',
        email: 'test@doganhub.com',
        tenantId: 'test-tenant-123',
        role: 'admin',
        avatar: null
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
