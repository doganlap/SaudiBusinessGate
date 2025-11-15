import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function GET(request: NextRequest) {
  try {
    // Fetch real Stripe products and prices
    const products = await stripe.products.list({
      active: true,
      expand: ['data.default_price']
    })

    const plans = products.data.map(product => {
      const price = product.default_price as Stripe.Price
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: price ? price.unit_amount! / 100 : 0,
        currency: price ? price.currency.toUpperCase() : 'USD',
        interval: price?.recurring?.interval || 'month',
        features: product.metadata.features ? 
          JSON.parse(product.metadata.features) : 
          ['Contact sales for details'],
        priceId: price?.id
      }
    })

    return NextResponse.json({
      success: true,
      data: plans
    })
  } catch (error) {
    console.error('Error fetching Stripe plans:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch plans' },
      { status: 500 }
    )
  }
}
