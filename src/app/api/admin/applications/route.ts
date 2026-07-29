import { NextRequest, NextResponse } from 'next/server'
import * as admin from 'firebase-admin'

export async function GET(req: NextRequest) {
  try {
    // Verify admin token
    const token = req.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decodedToken = await admin.auth().verifyIdToken(token)
    const adminEmail = decodedToken.email

    console.log('[Admin API] Loading applications for:', adminEmail)

    // Get all card applications
    const snapshot = await admin.firestore().collection('cardApplications').get()
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
