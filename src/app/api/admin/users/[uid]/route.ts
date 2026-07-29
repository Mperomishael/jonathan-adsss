import { NextRequest, NextResponse } from 'next/server'
import * as admin from 'firebase-admin'

export async function GET(
  req: NextRequest,
  { params }: { params: { uid: string } }
) {
  try {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await admin.auth().verifyIdToken(token)

    const { uid } = params

    const userDoc = await admin.firestore().collection('users').doc(uid).get()

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const userData = userDoc.data()

    return NextResponse.json(userData, { status: 200 })
  } catch (error: any) {
    console.error('[Admin API] Get user error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get user' },
      { status: 500 }
    )
  }
}
