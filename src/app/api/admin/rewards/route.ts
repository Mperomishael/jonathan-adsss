import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Authorized Super Admin Emails
const SUPER_ADMIN_EMAILS = [
  'empiredigitalsworldwide@gmail.com',
  'empiredigitalsceo@gmail.com',
]

// In-memory reward storage (in production, use a real database)
const rewardHistory: any[] = []

export async function GET(req: NextRequest) {
  try {
    // Get email from Authorization header or query
    const email = req.nextUrl.searchParams.get('admin_email') || 'admin@example.com'

    // Check if super admin
    if (!SUPER_ADMIN_EMAILS.includes(email)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Return reward history
    return NextResponse.json({
      rewards: rewardHistory.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ).slice(0, 50) // Return last 50
    })
  } catch (e: any) {
    console.error('[rewards] GET error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    // Get email from Authorization header or query
    const email = req.nextUrl.searchParams.get('admin_email') || 'admin@example.com'

    // Check if super admin
    if (!SUPER_ADMIN_EMAILS.includes(email)) {
      return NextResponse.json(
        { error: 'Unauthorized. Only super admins can initiate rewards.' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { userId, email: userEmail, amount, description } = body

    if (!userId && !userEmail) {
      return NextResponse.json(
        { error: 'User ID or Email is required' },
        { status: 400 }
      )
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      )
    }

    // Create reward record
    const reward = {
      id: `reward-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: userId || null,
      email: userEmail || null,
      amount,
      description: description || 'Bonus reward',
      status: 'pending',
      initiatedBy: email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Store in memory (in production, save to database)
    rewardHistory.push(reward)

    console.log('[rewards] Reward initiated:', reward)

    return NextResponse.json({
      success: true,
      message: 'Reward initiated successfully',
      reward,
    })
  } catch (e: any) {
    console.error('[rewards] POST error:', e)
    return NextResponse.json(
      { error: e.message || 'Server error' },
      { status: 500 }
    )
  }
}
