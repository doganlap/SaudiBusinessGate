import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, tenantId, email, name } = body

    if (!token || !tenantId) {
      return NextResponse.json(
        { success: false, message: 'Token and tenantId are required' },
        { status: 400 }
      )
    }

    // Verify activation token
    let decoded: any
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!)
    } catch (err) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired activation token' },
        { status: 400 }
      )
    }

    if (decoded.type !== 'activation' || decoded.tenantId !== tenantId) {
      return NextResponse.json(
        { success: false, message: 'Invalid activation token' },
        { status: 400 }
      )
    }

    // In a real app, you would:
    // 1. Update user/tenant status in database
    // 2. Create Stripe customer if needed
    // 3. Set up initial subscription state
    // 4. Send welcome email

    // Generate auth token for the activated user
    const authToken = jwt.sign(
      {
        userId: `user_${tenantId}`,
        email: email || decoded.email,
        name: name || 'User',
        tenantId,
        activated: true,
        role: 'user'
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    const userData = {
      id: `user_${tenantId}`,
      email: email || decoded.email,
      name: name || 'User',
      tenantId,
      activated: true,
      currentPlan: null,
      role: 'user'
    }

    return NextResponse.json({
      success: true,
      message: 'Account activated successfully',
      data: {
        user: userData,
        authToken
      }
    })
  } catch (error) {
    console.error('Error activating account:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to activate account' },
      { status: 500 }
    )
  }
}
