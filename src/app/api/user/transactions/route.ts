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

    if (!adminDb) {
      return Response.json({ error: 'Database not initialized' }, { status: 500 })
    }

    // Get user ID first
    const userSnap = await adminDb
      .collection('users')
      .where('email', '==', verified.email)
      .limit(1)
      .get()

    if (userSnap.docs.length === 0) {
      return Response.json([])
    }

    const userId = userSnap.docs[0].id

    // Get user's transactions
    const paymentSnap = await adminDb
      .collection('payments')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get()

    const transactions = paymentSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    return Response.json(transactions)
  } catch (error: any) {
    console.error('Get transactions error:', error)
    return Response.json({ error: error.message || 'Failed to get transactions' }, { status: 500 })
  }
}
