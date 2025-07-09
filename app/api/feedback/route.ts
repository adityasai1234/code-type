import { NextRequest, NextResponse } from 'next/server'

interface FeedbackData {
  type: 'feedback' | 'bug' | 'ab-test'
  title: string
  description: string
  category?: string
  severity?: 'low' | 'medium' | 'high' | 'critical'
  userAgent?: string
  timestamp: string
  userId?: string
  metadata?: Record<string, any>
}

export async function POST(request: NextRequest) {
  try {
    const body: FeedbackData = await request.json()
    
    // Validate required fields
    if (!body.type || !body.title || !body.description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Add server-side metadata
    const enrichedData = {
      ...body,
      timestamp: body.timestamp || new Date().toISOString(),
      userId: body.userId || `user-${Math.random().toString(36).substr(2, 9)}`,
      metadata: {
        ...body.metadata,
        ipAddress: request.headers.get('x-forwarded-for') || request.ip,
        userAgent: body.userAgent || request.headers.get('user-agent'),
        referer: request.headers.get('referer'),
        timestamp: new Date().toISOString()
      }
    }

    // In a real application, you would save this to a database
    // For now, we'll just log it and return success
    console.log('Feedback received:', enrichedData)

    // You could also send notifications for critical bugs
    if (body.type === 'bug' && body.severity === 'critical') {
      console.log('🚨 CRITICAL BUG REPORT:', body.title)
      // Send notification to development team
    }

    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully',
      id: `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    })

  } catch (error) {
    console.error('Error processing feedback:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // In a real application, you would fetch from database
    // For now, return mock data
    const mockFeedback: FeedbackData[] = [
      {
        type: 'feedback',
        title: 'Great typing experience',
        description: 'The interface is very intuitive and the code snippets are well-chosen.',
        category: 'ui-ux',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        userId: 'user-123'
      },
      {
        type: 'bug',
        title: 'Timer not resetting properly',
        description: 'When starting a new test, the timer sometimes doesn\'t reset to zero.',
        severity: 'medium',
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        userId: 'user-456'
      },
      {
        type: 'ab-test',
        title: 'New design variant test',
        description: 'Testing new interface layout',
        timestamp: new Date(Date.now() - 259200000).toISOString(),
        userId: 'user-789'
      }
    ]

    let filteredFeedback = mockFeedback

    if (type) {
      filteredFeedback = mockFeedback.filter(f => f.type === type)
    }

    const paginatedFeedback = filteredFeedback.slice(offset, offset + limit)

    return NextResponse.json({
      feedback: paginatedFeedback,
      total: filteredFeedback.length,
      limit,
      offset
    })

  } catch (error) {
    console.error('Error fetching feedback:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 