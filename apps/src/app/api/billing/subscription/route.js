import { NextResponse } from 'next/server';
import { BillingService } from '@/lib/services/billing.service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const billingService = new BillingService();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = session.user.tenantId;
    const subscription = await billingService.getCurrentSubscription(tenantId);
    
    if (!subscription) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
    }

    return NextResponse.json(subscription);
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { planId, billingPeriod, paymentMethodId } = body;

    if (!planId || !billingPeriod) {
      return NextResponse.json(
        { error: 'Plan ID and billing period are required' },
        { status: 400 }
      );
    }

    const tenantId = session.user.tenantId;
    const subscription = await billingService.createSubscription(
      tenantId,
      planId,
      billingPeriod,
      paymentMethodId
    );

    return NextResponse.json(subscription);
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create subscription' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { planId, billingPeriod } = body;

    if (!planId || !billingPeriod) {
      return NextResponse.json(
        { error: 'Plan ID and billing period are required' },
        { status: 400 }
      );
    }

    const tenantId = session.user.tenantId;
    const currentSubscription = await billingService.getCurrentSubscription(tenantId);
    
    if (!currentSubscription) {
      return NextResponse.json(
        { error: 'No active subscription to update' },
        { status: 404 }
      );
    }

    const updatedSubscription = await billingService.updateSubscription(
      currentSubscription.id,
      planId,
      billingPeriod
    );

    return NextResponse.json(updatedSubscription);
  } catch (error) {
    console.error('Error updating subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update subscription' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { immediately = false } = body;

    const tenantId = session.user.tenantId;
    const currentSubscription = await billingService.getCurrentSubscription(tenantId);
    
    if (!currentSubscription) {
      return NextResponse.json(
        { error: 'No active subscription to cancel' },
        { status: 404 }
      );
    }

    const canceledSubscription = await billingService.cancelSubscription(
      currentSubscription.id,
      immediately
    );

    return NextResponse.json(canceledSubscription);
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}