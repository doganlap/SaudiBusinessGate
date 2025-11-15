import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, tenantId } = body

    if (!email || !tenantId) {
      return NextResponse.json(
        { success: false, message: 'Email and tenantId are required' },
        { status: 400 }
      )
    }

    // Generate activation token
    const activationToken = jwt.sign(
      { 
        email, 
        tenantId, 
        type: 'activation',
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
      },
      process.env.JWT_SECRET!
    )

    // In a real app, you would:
    // 1. Save the token to database
    // 2. Send email with activation link
    // 3. Use a proper email service like SendGrid, AWS SES, etc.
    
    const activationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/billing/activate?token=${activationToken}&tenantId=${tenantId}`
    
    console.log('Activation email would be sent to:', email)
    console.log('Activation URL:', activationUrl)

    // Simulate email sending
    // await emailService.sendActivationEmail(email, activationUrl)

    return NextResponse.json({
      success: true,
      message: 'Activation email sent successfully',
      data: {
        email,
        tenantId,
        // In development, return the token for testing
        ...(process.env.NODE_ENV === 'development' && { 
          activationToken,
          activationUrl 
        })
      }
    })
  } catch (error) {
    console.error('Error sending activation email:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to send activation email' },
      { status: 500 }
    )
  }
}
