import { NextRequest, NextResponse } from 'next/server';
import { stripePayment } from '@/lib/payment/stripe-service';
import { zatcaService } from '@/lib/zatca/zatca-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'plans':
        // Get subscription plans
        const plans = stripePayment.getSubscriptionPlans();
        return NextResponse.json({
          success: true,
          data: plans
        });

      case 'plan':
        // Get specific plan
        const planId = searchParams.get('planId');
        if (!planId) {
          return NextResponse.json(
            { error: 'Plan ID is required' },
            { status: 400 }
          );
        }
        
        const plan = stripePayment.getPlanById(planId);
        if (!plan) {
          return NextResponse.json(
            { error: 'Plan not found' },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          data: plan
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('❌ Payment GET error:', error);
    return NextResponse.json(
      { error: (error instanceof Error ? error.message : String(error)) || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'create-customer':
        // Create Stripe customer
        const { email, name, tenantId, metadata = {} } = body;
        
        if (!email || !name || !tenantId) {
          return NextResponse.json(
            { error: 'Email, name, and tenantId are required' },
            { status: 400 }
          );
        }

        const customer = await stripePayment.createCustomer(
          email,
          name,
          tenantId,
          metadata
        );

        return NextResponse.json({
          success: true,
          data: {
            customerId: customer.id,
            email: customer.email,
            name: customer.name
          }
        });

      case 'create-payment-intent':
        // Create payment intent
        const { amount, currency = 'SAR', customerId, paymentMetadata = {} } = body;
        
        if (!amount) {
          return NextResponse.json(
            { error: 'Amount is required' },
            { status: 400 }
          );
        }

        const paymentIntent = await stripePayment.createPaymentIntent(
          amount,
          currency,
          customerId,
          paymentMetadata
        );

        return NextResponse.json({
          success: true,
          data: paymentIntent
        });

      case 'create-checkout-session':
        // Create checkout session for subscription
        const { 
          priceId, 
          customerId: checkoutCustomerId, 
          successUrl, 
          cancelUrl, 
          checkoutMetadata = {} 
        } = body;
        
        if (!priceId || !checkoutCustomerId || !successUrl || !cancelUrl) {
          return NextResponse.json(
            { error: 'priceId, customerId, successUrl, and cancelUrl are required' },
            { status: 400 }
          );
        }

        const session = await stripePayment.createCheckoutSession(
          priceId,
          checkoutCustomerId,
          successUrl,
          cancelUrl,
          checkoutMetadata
        );

        return NextResponse.json({
          success: true,
          data: {
            sessionId: session.id,
            url: session.url
          }
        });

      case 'create-subscription':
        // Create subscription
        const { 
          customerId: subCustomerId, 
          priceId: subPriceId, 
          subscriptionMetadata = {} 
        } = body;
        
        if (!subCustomerId || !subPriceId) {
          return NextResponse.json(
            { error: 'customerId and priceId are required' },
            { status: 400 }
          );
        }

        const subscription = await stripePayment.createSubscription(
          subCustomerId,
          subPriceId,
          subscriptionMetadata
        );

        // Get client secret from payment intent if available
        let clientSecret = null;
        if (subscription.latest_invoice && typeof subscription.latest_invoice === 'object') {
          const invoice = subscription.latest_invoice as any;
          if (invoice.payment_intent && typeof invoice.payment_intent === 'object') {
            clientSecret = invoice.payment_intent.client_secret;
          }
        }

        return NextResponse.json({
          success: true,
          data: {
            subscriptionId: subscription.id,
            status: subscription.status,
            clientSecret
          }
        });

      case 'create-portal-session':
        // Create customer portal session
        const { customerId: portalCustomerId, returnUrl } = body;
        
        if (!portalCustomerId || !returnUrl) {
          return NextResponse.json(
            { error: 'customerId and returnUrl are required' },
            { status: 400 }
          );
        }

        const portalSession = await stripePayment.createPortalSession(
          portalCustomerId,
          returnUrl
        );

        return NextResponse.json({
          success: true,
          data: {
            url: portalSession.url
          }
        });

      case 'create-zatca-invoice':
        // Create ZATCA compliant invoice
        const { invoiceData } = body;
        
        if (!invoiceData) {
          return NextResponse.json(
            { error: 'Invoice data is required' },
            { status: 400 }
          );
        }

        const zatcaInvoice = await zatcaService.createInvoice(invoiceData);

        return NextResponse.json({
          success: true,
          data: zatcaInvoice
        });

      case 'submit-zatca-invoice':
        // Submit invoice to ZATCA
        const { invoice } = body;
        
        if (!invoice) {
          return NextResponse.json(
            { error: 'Invoice is required' },
            { status: 400 }
          );
        }

        const submissionResult = await zatcaService.submitInvoice(invoice);

        return NextResponse.json({
          success: submissionResult.success,
          data: submissionResult
        });

      case 'zatca-compliance-report':
        // Generate ZATCA compliance report
        const { startDate, endDate } = body;
        
        if (!startDate || !endDate) {
          return NextResponse.json(
            { error: 'startDate and endDate are required' },
            { status: 400 }
          );
        }

        const complianceReport = await zatcaService.generateComplianceReport(
          startDate,
          endDate
        );

        return NextResponse.json({
          success: true,
          data: complianceReport
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('❌ Payment POST error:', error);
    return NextResponse.json(
      { error: (error instanceof Error ? error.message : String(error)) || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const subscriptionId = searchParams.get('subscriptionId');

    switch (action) {
      case 'cancel-subscription':
        if (!subscriptionId) {
          return NextResponse.json(
            { error: 'Subscription ID is required' },
            { status: 400 }
          );
        }

        const cancelledSubscription = await stripePayment.cancelSubscription(subscriptionId);

        return NextResponse.json({
          success: true,
          data: {
            subscriptionId: cancelledSubscription.id,
            status: cancelledSubscription.status,
            cancelledAt: cancelledSubscription.canceled_at
          }
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('❌ Payment DELETE error:', error);
    return NextResponse.json(
      { error: (error instanceof Error ? error.message : String(error)) || 'Internal server error' },
      { status: 500 }
    );
  }
}
