import { adminDb } from '@/lib/firebase-admin'
import { verifyUserToken } from '@/lib/auth-utils'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1]
    const verified = token ? await verifyUserToken(token) : null

    if (!verified) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user by email from Firestore
    if (!adminDb) {
      return Response.json({ error: 'Database not initialized' }, { status: 500 })
    }

    const snap = await adminDb
      .collection('users')
      .where('email', '==', verified.email)
      .limit(1)
      .get()

    if (snap.docs.length === 0) {
      return Response.json({
        whitelisted: false,
        fanStatus: 'pending',
        paymentStatus: 'unpaid',
      })
    }

    const userData = snap.docs[0].data()
    return Response.json({
      whitelisted: userData.whitelisted || false,
      fanStatus: userData.fanStatus || 'pending',
      paymentStatus: userData.paymentStatus || 'unpaid',
    })
  } catch (error: any) {
    console.error('Get status error:', error)
    return Response.json({ error: error.message || 'Failed to get user status' }, { status: 500 })
  }
}
