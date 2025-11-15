import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerId, returnUrl } = body

    if (!customerId) {
      return NextResponse.json(
        { success: false, message: 'Missing customerId' },
        { status: 400 }
      )
    }

    // Create real Stripe billing portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
    })

    return NextResponse.json({
      success: true,
      data: {
        id: portalSession.id,
        portalUrl: portalSession.url
      }
    })
  } catch (error) {
    console.error('Error creating Stripe portal session:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create portal session' },
      { status: 500 }
    )
  }
}
