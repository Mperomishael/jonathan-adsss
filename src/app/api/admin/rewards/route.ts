import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/firebase-admin'
import { getDb, getUserByEmail, getUser } from '@/lib/firestore'

export const dynamic = 'force-dynamic'

type Tier = 'bronze' | 'silver' | 'gold' | 'platinum'

function computeTier(points: number): Tier {
  if (points >= 5000) return 'platinum'
  if (points >= 2000) return 'gold'
  if (points >= 500) return 'silver'
  return 'bronze'
}

/**
 * GET — list recent reward history from Firestore (admin only)
 */
export async function GET(req: NextRequest) {
  if (!(await verifyAdminRequest(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const db = getDb()
    const snap = await db
      .collection('rewardHistory')
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get()

    const rewards = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    return NextResponse.json({ rewards })
  } catch (e: any) {
    console.error('[admin/rewards] GET error:', e)
    return NextResponse.json({ rewards: [], warning: e.message })
  }
}

/**
 * POST — award points to a user.
 * Updates the user's rewards/{uid} profile so the customer dashboard reflects points immediately.
 * Also writes an entry to rewardHistory for the admin UI.
 *
 * Body: { userId?: string, email?: string, amount: number, description?: string, orderId?: string }
 * amount = points to add (not dollars).
 */
export async function POST(req: NextRequest) {
  if (!(await verifyAdminRequest(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const {
      userId,
      email: userEmail,
      amount,
      description,
      orderId,
    } = body as {
      userId?: string
      email?: string
      amount: number
      description?: string
      orderId?: string
    }

    if (!userId && !userEmail) {
      return NextResponse.json(
        { error: 'User ID or Email is required' },
        { status: 400 }
      )
    }

    const points = Number(amount)
    if (!Number.isFinite(points) || points <= 0) {
      return NextResponse.json(
        { error: 'Points amount must be greater than 0' },
        { status: 400 }
      )
    }

    const db = getDb()

    // Resolve to the user's real Firebase Auth UID (stored as `googleId` on the
    // user doc — the `users` collection's own document ID is auto-generated and
    // is NOT the Auth UID). The dashboard looks up rewards by the real Auth UID
    // first, so writing anywhere else means points silently never show up.
    let resolvedUid = ''
    let resolvedEmail = (userEmail || '').toLowerCase().trim()

    if (userId) {
      const user = await getUser(userId)
      if (user) {
        resolvedUid = (user as any).googleId || user.id
        resolvedEmail = user.email || resolvedEmail
      } else {
        resolvedUid = userId
      }
    } else if (resolvedEmail) {
      const user = await getUserByEmail(resolvedEmail)
      if (user) {
        resolvedUid = (user as any).googleId || user.id
        resolvedEmail = user.email || resolvedEmail
      }
    }

    if (resolvedUid && !resolvedEmail) {
      const user = await getUser(resolvedUid)
      if (user) resolvedEmail = user.email || ''
    }

    const profileKey = resolvedUid || resolvedEmail
    if (!profileKey) {
      return NextResponse.json(
        { error: 'Could not resolve user. Provide a valid userId or email.' },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()
    const rewardEntry = {
      id: `rwd-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      type: orderId ? 'purchase_reward' : 'admin_bonus',
      points,
      description: description || (orderId ? `Points for order ${orderId}` : 'Bonus reward from admin'),
      claimedAt: now,
      orderId: orderId || null,
    }

    const profileRef = db.collection('rewards').doc(profileKey)
    const profileSnap = await profileRef.get()

    let profile: any
    if (profileSnap.exists) {
      profile = profileSnap.data()
      profile.totalPoints = (profile.totalPoints || 0) + points
      profile.totalRewards = (profile.totalRewards || 0) + 1
      profile.tier = computeTier(profile.totalPoints)
      profile.lastActivityAt = now
      profile.rewards = Array.isArray(profile.rewards) ? profile.rewards : []
      profile.rewards.unshift(rewardEntry)
      if (profile.rewards.length > 100) profile.rewards = profile.rewards.slice(0, 100)
      if (orderId) {
        profile.milestones = profile.milestones || {}
        profile.milestones.firstPurchase = true
      }
    } else {
      profile = {
        userId: resolvedUid || profileKey,
        email: resolvedEmail,
        totalPoints: points,
        totalRewards: 1,
        tier: computeTier(points),
        joinedAt: now,
        lastActivityAt: now,
        rewards: [rewardEntry],
        milestones: {
          firstPurchase: !!orderId,
          referralBonus: false,
          loyaltyMilestone: false,
        },
      }
    }

    await profileRef.set(profile, { merge: true })

    if (resolvedEmail && resolvedEmail !== profileKey) {
      const byEmail = db.collection('rewards').doc(resolvedEmail)
      const byEmailSnap = await byEmail.get()
      if (byEmailSnap.exists) {
        const p = byEmailSnap.data() as any
        p.totalPoints = (p.totalPoints || 0) + points
        p.totalRewards = (p.totalRewards || 0) + 1
        p.tier = computeTier(p.totalPoints)
        p.lastActivityAt = now
        p.rewards = Array.isArray(p.rewards) ? p.rewards : []
        p.rewards.unshift(rewardEntry)
        await byEmail.set(p, { merge: true })
      }
    }

    const historyDoc = {
      userId: resolvedUid || null,
      email: resolvedEmail || null,
      amount: points,
      description: rewardEntry.description,
      status: 'completed',
      orderId: orderId || null,
      createdAt: now,
      updatedAt: now,
    }
    await db.collection('rewardHistory').add(historyDoc)

    if (orderId) {
      try {
        await db.collection('storeOrders').doc(orderId).update({
          pointsAwarded: points,
          pointsAwardedAt: now,
          status: 'approved',
          updatedAt: now,
        })
      } catch {
        // non-fatal
      }
    }

    return NextResponse.json({
      success: true,
      message: `Awarded ${points} points to ${resolvedEmail || resolvedUid}`,
      profile: {
        userId: profile.userId,
        email: profile.email,
        totalPoints: profile.totalPoints,
        tier: profile.tier,
      },
      reward: rewardEntry,
    })
  } catch (e: any) {
    console.error('[admin/rewards] POST error:', e)
    return NextResponse.json(
      { error: e.message || 'Server error' },
      { status: 500 }
    )
  }
}
