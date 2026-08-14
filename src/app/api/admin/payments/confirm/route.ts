import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/firebase-admin'
import {
  confirmPayment,
  getPayment,
  getUserByEmail,
  createUser,
  updateUser,
  getDb,
  getUser,
} from '@/lib/firestore'

export const dynamic = 'force-dynamic'

type Tier = 'bronze' | 'silver' | 'gold' | 'platinum'

function computeTier(points: number): Tier {
  if (points >= 5000) return 'platinum'
  if (points >= 2000) return 'gold'
  if (points >= 500) return 'silver'
  return 'bronze'
}

/**
 * POST — Admin confirms a payment (approval) and optionally awards points manually.
 * Body: { paymentId, transactionId, points?: number, pointsDescription?: string }
 */
export async function POST(req: NextRequest) {
  if (!(await verifyAdminRequest(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const {
      paymentId,
      transactionId,
      points: rawPoints,
      pointsDescription,
    } = body as {
      paymentId: string
      transactionId: string
      points?: number | string
      pointsDescription?: string
    }

    if (!paymentId || !transactionId) {
      return NextResponse.json(
        { error: 'Payment ID and Transaction ID are required' },
        { status: 400 }
      )
    }

    const payment = await getPayment(paymentId)
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    if (payment.status === 'confirmed') {
      return NextResponse.json({ error: 'Payment already confirmed' }, { status: 400 })
    }

    // 1. Mark payment confirmed
    await confirmPayment(paymentId, transactionId)

    // 2. Whitelist / approve fan
    const email = payment.email
    const userId = payment.userId

    let user = null
    if (email) {
      user = await getUserByEmail(email)
    } else if (userId) {
      user = await getUser(userId)
    }

    if (!user && email) {
      user = await createUser(email)
    }

    if (user) {
      await updateUser(user.id, {
        whitelisted: true,
        fanStatus: 'approved',
        paymentStatus: 'confirmed',
      })
      console.log(`[Confirm] Whitelisted fan: ${user.email} (uid: ${user.id})`)
    } else {
      console.warn(`[Confirm] No user found for payment ${paymentId}`)
    }

    // 3. Manual points award (only if admin entered points > 0)
    let pointsAwarded = 0
    const points = Number(rawPoints)

    if (Number.isFinite(points) && points > 0) {
      pointsAwarded = Math.floor(points)
      const db = getDb()
      const now = new Date().toISOString()

      // Prefer Firebase Auth uid / payment userId, fallback to email
      const profileKey =
        (user && (user as any).googleId) ||
        userId ||
        user?.id ||
        (email || '').toLowerCase().trim()

      if (profileKey) {
        const rewardEntry = {
          id: `rwd-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          type: 'payment_reward',
          points: pointsAwarded,
          description:
            pointsDescription ||
            `Reward points for confirmed payment (${payment.currency} $${Number(payment.amount).toFixed(2)})`,
          claimedAt: now,
          paymentId,
        }

        const profileRef = db.collection('rewards').doc(String(profileKey))
        const profileSnap = await profileRef.get()

        if (profileSnap.exists) {
          const profile = profileSnap.data() as any
          profile.totalPoints = (profile.totalPoints || 0) + pointsAwarded
          profile.totalRewards = (profile.totalRewards || 0) + 1
          profile.tier = computeTier(profile.totalPoints)
          profile.lastActivityAt = now
          profile.rewards = Array.isArray(profile.rewards) ? profile.rewards : []
          profile.rewards.unshift(rewardEntry)
          if (profile.rewards.length > 100) profile.rewards = profile.rewards.slice(0, 100)
          profile.milestones = { ...(profile.milestones || {}), firstPurchase: true }
          await profileRef.set(profile, { merge: true })
        } else {
          await profileRef.set(
            {
              userId: userId || user?.id || profileKey,
              email: (email || user?.email || '').toLowerCase(),
              totalPoints: pointsAwarded,
              totalRewards: 1,
              tier: computeTier(pointsAwarded),
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

        // Also key by email for legacy lookups
        const emailKey = (email || user?.email || '').toLowerCase().trim()
        if (emailKey && emailKey !== String(profileKey)) {
          const byEmail = db.collection('rewards').doc(emailKey)
          const byEmailSnap = await byEmail.get()
          if (byEmailSnap.exists) {
            const p = byEmailSnap.data() as any
            p.totalPoints = (p.totalPoints || 0) + pointsAwarded
            p.totalRewards = (p.totalRewards || 0) + 1
            p.tier = computeTier(p.totalPoints)
            p.lastActivityAt = now
            p.rewards = Array.isArray(p.rewards) ? p.rewards : []
            p.rewards.unshift(rewardEntry)
            await byEmail.set(p, { merge: true })
          } else {
            // Ensure dashboard can find by email if uid path differs
            await byEmail.set(
              {
                userId: userId || user?.id || '',
                email: emailKey,
                totalPoints: pointsAwarded,
                totalRewards: 1,
                tier: computeTier(pointsAwarded),
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
        }

        await db.collection('rewardHistory').add({
          userId: userId || user?.id || null,
          email: email || user?.email || null,
          amount: pointsAwarded,
          description: rewardEntry.description,
          status: 'completed',
          paymentId,
          createdAt: now,
          updatedAt: now,
        })

        // Store points on payment record for admin visibility
        try {
          await db.collection('payments').doc(paymentId).update({
            pointsAwarded,
            pointsAwardedAt: now,
            updatedAt: now,
          })
        } catch {
          /* non-fatal */
        }
      }
    }

    const baseMsg = `Payment confirmed and fan ${email || userId || ''} has been whitelisted.`
    const pointsMsg =
      pointsAwarded > 0 ? ` Awarded ${pointsAwarded} points.` : ' No points awarded (manual).'

    return NextResponse.json({
      success: true,
      message: baseMsg + pointsMsg,
      pointsAwarded,
    })
  } catch (error: any) {
    console.error('Confirm payment error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to confirm payment' },
      { status: 500 }
    )
  }
}
