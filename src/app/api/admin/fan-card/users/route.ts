import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/firebase-admin'
import { getDb } from '@/lib/firestore'

export const dynamic = 'force-dynamic'

/**
 * GET — list PAID/approved fans along with their saved card personalization
 * (cardName, cardMemberId, fanTier) so an admin can generate/download the fan card
 * PDF on their behalf. Only fans with a confirmed payment are eligible — being
 * "whitelisted" alone is not enough, since a fan can be whitelisted through other
 * admin actions that don't involve payment (e.g. manual approval).
 */
export async function GET(req: NextRequest) {
  if (!(await verifyAdminRequest(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const db = getDb()
    const snap = await db
      .collection('users')
      .where('paymentStatus', '==', 'confirmed')
      .limit(200)
      .get()

    const users = snap.docs
      .map((d) => {
        const data = d.data() as any
        return {
          id: d.id,
          email: data.email || '',
          cardName: data.cardName || '',
          cardMemberId: data.cardMemberId || '',
          fanTier: data.fanTier || 'regular',
          paymentStatus: data.paymentStatus || 'unpaid',
          cardUpdatedAt: data.cardUpdatedAt || null,
        }
      })
      // Only fans who have actually personalized a card have anything to render
      .filter((u) => u.cardName)
      .sort((a, b) => (b.cardUpdatedAt || '').localeCompare(a.cardUpdatedAt || ''))

    return NextResponse.json({ users })
  } catch (err: any) {
    console.error('[admin/fan-card/users] GET error:', err)
    return NextResponse.json({ error: err.message || 'Failed to load fan cards' }, { status: 500 })
  }
}
