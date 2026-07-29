import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRequest, getDecodedToken, adminDb } from '@/lib/firebase-admin'

export async function POST(req: NextRequest) {
  try {
    if (!await verifyAdminRequest(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = await getDecodedToken(req)
    const adminEmail = decoded?.email || 'admin@admin'

    const { email, uid } = await req.json()

    if (!email || !uid) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log('[Admin API] Rejecting application:', email)

    // Update application record
    await adminDb.collection('cardApplications').doc(email).update({
      status: 'rejected',
      reviewedAt: new Date().toISOString(),
      reviewedBy: adminEmail,
    })

    // Update user record
    await adminDb.collection('users').doc(uid).update({
      status: 'rejected',
      approved: false,
    })

    console.log('[Admin API] Application rejected')

    return NextResponse.json(
      { success: true, message: 'Application rejected' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('[Admin API] Reject error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to reject application' },
      { status: 500 }
    )
  }
}
