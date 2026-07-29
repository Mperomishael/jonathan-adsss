import { NextRequest, NextResponse } from 'next/server'
import * as admin from 'firebase-admin'

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decodedToken = await admin.auth().verifyIdToken(token)
    const adminEmail = decodedToken.email

    const { email, uid, cardLevel, cardNumber } = await req.json()

    if (!email || !uid || !cardLevel || !cardNumber) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log('[Admin API] Approving application:', email, 'Level:', cardLevel)

    // Update application record
    await admin.firestore().collection('cardApplications').doc(email).update({
      status: 'approved',
      reviewedAt: new Date().toISOString(),
      reviewedBy: adminEmail,
    })

    // Update user record
    const maxCardsMap: { [key: string]: number } = {
      silver: 1,
      gold: 3,
      diamond: 10,
    }

    await admin.firestore().collection('users').doc(uid).update({
      approved: true,
      whitelisted: true,
      cardLevel,
      cardNumber,
      maxCards: maxCardsMap[cardLevel as keyof typeof maxCardsMap] || 1,
      status: 'approved',
      profile: {
        verified: true,
      },
    })

    console.log('[Admin API] Application approved successfully')

    return NextResponse.json(
      { success: true, message: 'Application approved' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('[Admin API] Approve error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to approve application' },
      { status: 500 }
    )
  }
}
