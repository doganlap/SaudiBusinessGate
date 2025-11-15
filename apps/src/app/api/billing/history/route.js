import { NextResponse } from 'next/server';
import { BillingService } from '@/lib/services/billing.service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const billingService = new BillingService();

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 10;

    const tenantId = session.user.tenantId;
    const billingHistory = await billingService.getBillingHistory(tenantId, limit);
    
    return NextResponse.json(billingHistory);
  } catch (error) {
    console.error('Error fetching billing history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch billing history' },
      { status: 500 }
    );
  }
}