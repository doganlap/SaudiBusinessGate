import { NextRequest, NextResponse } from 'next/server';
import { QuotesService } from '@/lib/services/quotes.service';

export async function GET(req: NextRequest) {
  const tenantId = req.headers.get('tenant-id');
  if (!tenantId) {
    return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 });
  }

  try {
    const quotes = await QuotesService.getQuotes(tenantId);
    return NextResponse.json({ quotes });
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const tenantId = req.headers.get('tenant-id');
  if (!tenantId) {
    return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const newQuote = await QuotesService.createQuote(tenantId, body);
    return NextResponse.json({ quote: newQuote });
  } catch (error) {
    console.error('Error creating quote:', error);
    return NextResponse.json({ error: 'Failed to create quote' }, { status: 500 });
  }
}