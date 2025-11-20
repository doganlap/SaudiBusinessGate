/**
 * Procurement Vendor Reviews API
 * Manage vendor performance reviews
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { procurementVendorReviewsService } from '@/lib/services/procurement-vendor-reviews.service';
import { withRateLimit } from '@/lib/middleware/rate-limit';

export const GET = withRateLimit(async (request: NextRequest) => {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId =
      request.headers.get('x-tenant-id') ||
      (session.user as any).tenantId ||
      'default-tenant';

    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendorId');
    const action = searchParams.get('action');

    if (!vendorId) {
      return NextResponse.json(
        { error: 'vendorId is required' },
        { status: 400 }
      );
    }

    if (action === 'summary') {
      const summary = await procurementVendorReviewsService.getReviewSummary(
        tenantId,
        vendorId
      );
      return NextResponse.json({
        success: true,
        summary,
      });
    }

    // Get reviews
    const status = searchParams.get('status');
    const minRating = searchParams.get('minRating')
      ? parseFloat(searchParams.get('minRating')!)
      : undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

    const reviews = await procurementVendorReviewsService.getReviews(tenantId, vendorId, {
      status: status || undefined,
      minRating,
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      reviews,
      total: reviews.length,
    });
  } catch (error: any) {
    console.error('Error fetching vendor reviews:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch vendor reviews' },
      { status: 500 }
    );
  }
}, { windowMs: 60000, maxRequests: 100 });

export const POST = async (request: NextRequest) => {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId =
      request.headers.get('x-tenant-id') ||
      (session.user as any).tenantId ||
      'default-tenant';

    const body = await request.json();
    const reviewerId = (session.user as any).id || (session.user as any).email || 'system';

    if (!body.vendorId || !body.categories) {
      return NextResponse.json(
        { error: 'vendorId and categories are required' },
        { status: 400 }
      );
    }

    const review = await procurementVendorReviewsService.createReview(tenantId, {
      ...body,
      reviewerId,
    });

    return NextResponse.json({
      success: true,
      review,
      message: 'Review submitted successfully',
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating vendor review:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create review' },
      { status: 500 }
    );
  }
};

