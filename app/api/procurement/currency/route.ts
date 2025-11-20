/**
 * Procurement Currency API
 * Currency conversion and exchange rate management
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { procurementCurrencyService } from '@/lib/services/procurement-currency.service';
import { withRateLimit } from '@/lib/middleware/rate-limit';

export const GET = withRateLimit(async (request: NextRequest) => {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'convert') {
      const amount = parseFloat(searchParams.get('amount') || '0');
      const from = searchParams.get('from') || 'SAR';
      const to = searchParams.get('to') || 'SAR';

      const converted = await procurementCurrencyService.convert(amount, from, to);
      const formatted = await procurementCurrencyService.formatCurrency(converted, to);

      return NextResponse.json({
        success: true,
        original: { amount, currency: from },
        converted: { amount: converted, currency: to, formatted },
      });
    }

    if (action === 'format') {
      const amount = parseFloat(searchParams.get('amount') || '0');
      const currency = searchParams.get('currency') || 'SAR';

      const formatted = await procurementCurrencyService.formatCurrency(amount, currency);

      return NextResponse.json({
        success: true,
        formatted,
      });
    }

    // Get all currencies
    const currencies = await procurementCurrencyService.getCurrencies();

    return NextResponse.json({
      success: true,
      currencies,
    });
  } catch (error: any) {
    console.error('Error handling currency request:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process currency request' },
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

    const body = await request.json();
    const { action, rates } = body;

    if (action === 'update_rates' && rates && Array.isArray(rates)) {
      await procurementCurrencyService.updateExchangeRates(rates);
      return NextResponse.json({
        success: true,
        message: 'Exchange rates updated successfully',
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating exchange rates:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update exchange rates' },
      { status: 500 }
    );
  }
};

