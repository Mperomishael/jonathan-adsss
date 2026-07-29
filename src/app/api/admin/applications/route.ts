import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRequest, getDecodedToken, adminDb } from '@/lib/firebase-admin'

export async function GET(req: NextRequest) {
  try {
    if (!await verifyAdminRequest(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decodedToken = await getDecodedToken(req)
    const adminEmail = decodedToken?.email || 'admin@admin'

    console.log('[Admin API] Loading applications for:', adminEmail)

    if (!adminDb) {
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 })
    }

    // Get all card applications
    const snapshot = await adminDb.collection('cardApplications').get()
    const applications = snapshot.docs.map((doc) => ({
      ...doc.data(),
    }))

    return NextResponse.json({ applications }, { status: 200 })
  } catch (error: any) {
    console.error('[Admin API] Error loading applications:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to load applications' },
      { status: 500 }
    )
  }
}
