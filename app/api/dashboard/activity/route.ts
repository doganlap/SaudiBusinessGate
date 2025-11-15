import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // In a real app, you would fetch this from your activity/audit log table
    const tenantId = request.headers.get('x-tenant-id') || 'default'
    
    // Mock recent activity data
    const activities = [
      {
        id: '1',
        type: 'user',
        message: 'New user registered: john.doe@example.com',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        status: 'success'
      },
      {
        id: '2',
        type: 'subscription',
        message: 'Subscription upgraded to Pro plan',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        status: 'success'
      },
      {
        id: '3',
        type: 'payment',
        message: 'Payment received: $99.00',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        status: 'success'
      },
      {
        id: '4',
        type: 'system',
        message: 'System backup completed successfully',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        status: 'info'
      },
      {
        id: '5',
        type: 'user',
        message: 'Password reset requested for user@example.com',
        timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        status: 'warning'
      }
    ]

    return NextResponse.json({
      success: true,
      data: activities
    })
  } catch (error) {
    console.error('Error fetching dashboard activity:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch recent activity' },
      { status: 500 }
    )
  }
}
