import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { priceId, tenantId, customerEmail, successUrl, cancelUrl } = body

    if (!priceId || !tenantId) {
      return NextResponse.json(
        { success: false, message: 'Missing priceId or tenantId' },
        { status: 400 }
      )
    }

    // Create real Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
      customer_email: customerEmail,
      metadata: {
        tenantId,
      },
      subscription_data: {
        metadata: {
          tenantId,
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: session.id,
        checkoutUrl: session.url,
        sessionId: session.id
      }
    })
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
