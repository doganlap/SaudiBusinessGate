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
    const paymentMethods = await billingService.getPaymentMethods(tenantId);
    
    return NextResponse.json(paymentMethods);
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment methods' },
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
    const { paymentMethodId, setAsDefault = false } = body;

    if (!paymentMethodId) {
      return NextResponse.json(
        { error: 'Payment method ID is required' },
        { status: 400 }
      );
    }

    const tenantId = session.user.tenantId;
    const paymentMethod = await billingService.addPaymentMethod(
      tenantId,
      paymentMethodId,
      setAsDefault
    );

    return NextResponse.json(paymentMethod);
  } catch (error) {
    console.error('Error adding payment method:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add payment method' },
      { status: 500 }
    );
  }
}