import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const paramsSchema = z.object({
  tenantId: z.string(),
});

interface FormattedSubscription {
  id: string;
  status: Stripe.Subscription.Status;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  priceId?: string;
  amount: number;
  currency: string;
  interval: Stripe.Price.Recurring.Interval;
}

interface ApiResponse {
  success: boolean;
  data?: {
    tenant: { id: string; status: string };
    customer: {
      id: string;
      email: string | null;
      name: string | null;
    } | null;
    subscriptions: FormattedSubscription[];
    upcomingInvoice: {
      id: string;
      amount: number;
      currency: string;
      dueDate: string | null;
    } | null;
    availablePlans: any[];
  };
  message?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
): Promise<NextResponse<ApiResponse>> {
  const { tenantId } = await params;
  try {
    const validation = paramsSchema.safeParse({ tenantId });
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid tenantId' },
        { status: 400 }
      );
    }

    const validatedTenantId = validation.data.tenantId;

    // Fetch customer by tenant metadata
    const searchResult = await stripe.customers.search({
      query: `metadata[\'tenantId\']:'${validatedTenantId}'`,
    });

    if (searchResult.data.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          tenant: { id: validatedTenantId, status: 'inactive' },
          customer: null,
          subscriptions: [],
          upcomingInvoice: null,
          availablePlans: []
        }
      })
    }
    const foundCustomer = searchResult.data[0];

    // Fetch subscriptions for the customer
    const subscriptions = await stripe.subscriptions.list({
      customer: foundCustomer.id
    })

    // Fetch upcoming invoice if there's an active subscription
    let upcomingInvoice = null
    if (subscriptions.data.length > 0) {
      try {
        upcomingInvoice = await stripe.invoices.list({
          customer: foundCustomer.id,
          limit: 1,
          status: 'draft'
        }).then(invoices => invoices.data[0] || null)
      } catch (err) {
        // No upcoming invoice
      }
    }

    // Format subscription data
    const formattedSubscriptions = subscriptions.data.map(sub => {
      const priceData = sub.items.data[0]?.price
      return {
        id: sub.id,
        status: sub.status,
        currentPeriodStart: new Date((sub as any).current_period_start * 1000).toISOString(),
        currentPeriodEnd: new Date((sub as any).current_period_end * 1000).toISOString(),
        cancelAtPeriodEnd: (sub as any).cancel_at_period_end,
        priceId: priceData?.id,
        amount: priceData?.unit_amount || 0,
        currency: priceData?.currency || 'usd',
        interval: priceData?.recurring?.interval || 'month'
      }
    })

    // Fetch available plans
    const prices = await stripe.prices.list({
      active: true,
      expand: ['data.product'],
    });

    const availablePlans = prices.data.map((price) => {
      const product = price.product as Stripe.Product;
      return {
        id: price.id,
        name: product.name,
        description: product.description,
        amount: price.unit_amount,
        currency: price.currency,
        interval: price.recurring?.interval,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        tenant: {
          id: validatedTenantId,
          status: subscriptions.data.some(s => s.status === 'active') ? 'active' : 'inactive'
        },
        customer: {
          id: foundCustomer.id,
          email: foundCustomer.email ?? null,
          name: foundCustomer.name ?? null,
        },
        subscriptions: formattedSubscriptions,
        upcomingInvoice: upcomingInvoice ? {
          id: upcomingInvoice.id,
          amount: upcomingInvoice.amount_due,
          currency: upcomingInvoice.currency,
          dueDate: upcomingInvoice.due_date ? new Date(upcomingInvoice.due_date * 1000).toISOString() : null
        } : null,
        availablePlans: availablePlans
      }
    })
  } catch (error) {
    console.error('Error fetching subscription data:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch subscription data' },
      { status: 500 }
    )
  }
}
