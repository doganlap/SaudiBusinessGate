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

    const plans = await billingService.getLicensePlans();
    return NextResponse.json(plans);
  } catch (error) {
    console.error('Error fetching license plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch license plans' },
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
    const { name, type, features, price, limits, stripePriceIds } = body;

    // This would be for creating custom plans (admin only)
    if (session.user.role !== 'platform_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Implementation for creating custom plans
    const plan = {
      id: `custom_${Date.now()}`,
      name,
      type,
      features,
      price,
      limits,
      stripePriceIds
    };

    return NextResponse.json(plan);
  } catch (error) {
    console.error('Error creating license plan:', error);
    return NextResponse.json(
      { error: 'Failed to create license plan' },
      { status: 500 }
    );
  }
}