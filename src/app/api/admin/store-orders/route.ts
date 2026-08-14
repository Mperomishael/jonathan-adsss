import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/firebase-admin'
import { getDb } from '@/lib/firestore'

export const dynamic = 'force-dynamic'

/**
 * GET — all store orders for admin review
 */
export async function GET(req: NextRequest) {
  if (!(await verifyAdminRequest(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const db = getDb()
    const status = req.nextUrl.searchParams.get('status') // pending | approved | rejected | all

    let snap
    try {
      snap = await db.collection('storeOrders').orderBy('createdAt', 'desc').limit(100).get()
    } catch {
      snap = await db.collection('storeOrders').limit(100).get()
    }

    let orders = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[]
    if (status && status !== 'all') {
      orders = orders.filter((o) => o.status === status)
    }
    orders.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))

    return NextResponse.json({ orders })
  } catch (err: any) {
    console.error('[admin/store-orders] GET error:', err)
    return NextResponse.json({ error: err.message || 'Failed to load orders' }, { status: 500 })
  }
}

/**
 * PATCH — approve / reject order. Optionally award points in same request.
 * Body: { orderId, action: 'approve' | 'reject', points?: number, description?: string }
 */
export async function PATCH(req: NextRequest) {
  if (!(await verifyAdminRequest(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { orderId, action, points, description } = body as {
      orderId: string
      action: 'approve' | 'reject'
      points?: number
      description?: string
    }

    if (!orderId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'orderId and action (approve|reject) are required' },
        { status: 400 }
      )
    }

    const db = getDb()
    const ref = db.collection('storeOrders').doc(orderId)
    const doc = await ref.get()
    if (!doc.exists) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const order = doc.data() as any
    const now = new Date().toISOString()

    if (action === 'reject') {
      await ref.update({ status: 'rejected', updatedAt: now })
      return NextResponse.json({ success: true, message: 'Order rejected' })
    }

    // approve
    const updates: Record<string, unknown> = {
      status: 'approved',
      updatedAt: now,
    }

    let awardedPoints = 0
    if (points != null && Number(points) > 0) {
      awardedPoints = Number(points)
      updates.pointsAwarded = awardedPoints
      updates.pointsAwardedAt = now

      // Award points via same logic as admin/rewards
      const profileKey = order.userId || order.email
      if (profileKey) {
        const profileRef = db.collection('rewards').doc(profileKey)
        const profileSnap = await profileRef.get()
        const rewardEntry = {
          id: `rwd-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          type: 'purchase_reward',
          points: awardedPoints,
          description: description || `Points for order ${orderId} — ${order.productName}`,
          claimedAt: now,
          orderId,
        }

        const computeTier = (p: number) => {
          if (p >= 5000) return 'platinum'
          if (p >= 2000) return 'gold'
          if (p >= 500) return 'silver'
          return 'bronze'
        }

        if (profileSnap.exists) {
          const profile = profileSnap.data() as any
          profile.totalPoints = (profile.totalPoints || 0) + awardedPoints
          profile.totalRewards = (profile.totalRewards || 0) + 1
          profile.tier = computeTier(profile.totalPoints)
          profile.lastActivityAt = now
          profile.rewards = Array.isArray(profile.rewards) ? profile.rewards : []
          profile.rewards.unshift(rewardEntry)
          profile.milestones = { ...(profile.milestones || {}), firstPurchase: true }
          await profileRef.set(profile, { merge: true })
        } else {
          await profileRef.set(
            {
              userId: order.userId || profileKey,
              email: order.email || '',
              totalPoints: awardedPoints,
              totalRewards: 1,
              tier: computeTier(awardedPoints),
              joinedAt: now,
              lastActivityAt: now,
              rewards: [rewardEntry],
              milestones: {
                firstPurchase: true,
                referralBonus: false,
                loyaltyMilestone: false,
              },
            },
            { merge: true }
          )
        }

        await db.collection('rewardHistory').add({
          userId: order.userId || null,
          email: order.email || null,
          amount: awardedPoints,
          description: rewardEntry.description,
          status: 'completed',
          orderId,
          createdAt: now,
          updatedAt: now,
        })
      }
    }

    await ref.update(updates)

    return NextResponse.json({
      success: true,
      message:
        awardedPoints > 0
          ? `Order approved and ${awardedPoints} points awarded`
          : 'Order approved',
      pointsAwarded: awardedPoints,
    })
  } catch (err: any) {
    console.error('[admin/store-orders] PATCH error:', err)
    return NextResponse.json({ error: err.message || 'Failed to update order' }, { status: 500 })
  }
}
