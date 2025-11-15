import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

export async function GET(request: NextRequest) {
  try {
    // For development mode, return a demo user without requiring authentication
    if (process.env.NODE_ENV === 'development') {
      const demoUser = {
        id: 'demo-user-123',
        email: 'demo@doganhubstore.com',
        name: 'Demo User',
        tenantId: 'demo-tenant-123',
        activated: true,
        currentPlan: 'pro',
        stripeCustomerId: 'cus_demo123',
        role: 'admin'
      }

      return NextResponse.json({
        success: true,
        data: demoUser
      })
    }

    // Production authentication logic
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value || 
                  request.headers.get('Authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No authentication token provided' },
        { status: 401 }
      )
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any

    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      )
    }

    const userData = {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      tenantId: decoded.tenantId,
      activated: decoded.activated || true,
      currentPlan: decoded.currentPlan,
      stripeCustomerId: decoded.stripeCustomerId,
      role: decoded.role || 'user'
    }

    return NextResponse.json({
      success: true,
      data: userData
    })
  } catch (error) {
    console.error('Auth verification error:', error)
    return NextResponse.json(
      { success: false, message: 'Authentication failed' },
      { status: 401 }
    )
  }
}
