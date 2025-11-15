/**
 * API Route: Get Dynamic Navigation
 * Returns navigation menu based on user's permissions and subscription
 * 
 * GET /api/navigation
 */

import { NextRequest, NextResponse } from 'next/server';
import { loadUserContext } from '@/lib/routing/DynamicRouter';
import { NavigationGenerator } from '@/lib/routing/NavigationGenerator';
import { verifyJWT } from '@/lib/auth/jwt';

export async function GET(request: NextRequest) {
  try {
    // 1. Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          success: false,
          message: 'Authentication required',
          message_ar: 'المصادقة مطلوبة',
        },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = await verifyJWT(token);

    if (!decoded) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid token',
          message_ar: 'رمز غير صالح',
        },
        { status: 401 }
      );
    }

    // 2. Load user context
    const userContext = await loadUserContext(
      decoded.userId as string,
      decoded.tenantId as string
    );

    // 3. Generate navigation
    const generator = new NavigationGenerator(userContext);
    const navigation = generator.generateNavigation();
    const flatNav = generator.generateFlatNavigation();
    const userMenu = generator.generateUserMenu();
    const quickActions = generator.generateQuickActions();

    // 4. Return response
    return NextResponse.json(
      {
        success: true,
        data: {
          navigation, // Grouped navigation
          flatNavigation: flatNav, // Flat list for mobile
          userMenu, // User dropdown menu
          quickActions, // Quick action menu
          metadata: {
            tenantId: userContext.tenantId,
            tenantSlug: userContext.tenantSlug,
            userId: userContext.id,
            role: userContext.role,
            roleLevel: userContext.roleLevel,
            subscriptionTier: userContext.subscriptionTier,
            isWhiteLabel: userContext.isWhiteLabel,
            isReseller: userContext.isReseller,
            enabledModules: userContext.enabledModules,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Navigation API Error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to generate navigation',
        message_ar: 'فشل في إنشاء القائمة',
        error:
          error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
