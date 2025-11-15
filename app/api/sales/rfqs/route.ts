import { NextRequest, NextResponse } from 'next/server';
import { QuotesService } from '@/lib/services/quotes.service';

export async function GET(req: NextRequest) {
  const tenantId = req.headers.get('tenant-id');
  if (!tenantId) {
    return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 });
  }

  try {
    const rfqs = await QuotesService.getRfqs(tenantId);
    return NextResponse.json({ rfqs });
  } catch (error) {
    console.error('Error fetching RFQs:', error);
    return NextResponse.json({ error: 'Failed to fetch RFQs' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const tenantId = req.headers.get('tenant-id');
  if (!tenantId) {
    return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const newRfq = await QuotesService.createRfq(tenantId, body);
    return NextResponse.json({ rfq: newRfq });
  } catch (error) {
    console.error('Error creating RFQ:', error);
    return NextResponse.json({ error: 'Failed to create RFQ' }, { status: 500 });
  }
}