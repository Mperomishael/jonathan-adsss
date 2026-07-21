import { getDb } from '@/lib/firestore'
import { verifyUserToken } from '@/lib/auth-utils'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export interface RewardProfile {
  userId: string
  email: string
  totalPoints: number
  totalRewards: number
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  joinedAt: string
  lastActivityAt: string
  rewards: {
    id: string
    type: string
    points: number
    description: string
    claimedAt: string
  }[]
  milestones: {
    firstPurchase: boolean
    referralBonus: boolean
    loyaltyMilestone: boolean
  }
}

// GET reward profile
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1]
    const verified = await verifyUserToken(token || '')

    if (!verified) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = getDb()
    const doc = await db.collection('rewards').doc(verified.uid).get()

    if (doc.exists) {
      return NextResponse.json(doc.data())
    }

    return NextResponse.json({ message: 'Reward profile not found' }, { status: 404 })
  } catch (error: any) {
    console.error('[Rewards] GET error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch reward profile' },
      { status: 500 }
    )
  }
}

// CREATE reward profile
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1]
    const verified = await verifyUserToken(token || '')

    if (!verified) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const db = getDb()

    const existing = await db.collection('rewards').doc(verified.uid).get()
    if (existing.exists) {
      return NextResponse.json({ message: 'Reward profile already exists' }, { status: 409 })
    }

    const newProfile: RewardProfile = {
      userId: verified.uid,
      email: email.toLowerCase(),
      totalPoints: 0,
      totalRewards: 0,
      tier: 'bronze',
      joinedAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
      rewards: [],
      milestones: {
        firstPurchase: false,
        referralBonus: false,
        loyaltyMilestone: false,
      },
    }

    await db.collection('rewards').doc(verified.uid).set(newProfile)

    return NextResponse.json({
      success: true,
      message: 'Reward profile initialized',
      profile: newProfile,
    })
  } catch (error: any) {
    console.error('[Rewards] POST error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create reward profile' },
      { status: 500 }
    )
  }
}

// UPDATE reward profile
export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1]
    const verified = await verifyUserToken(token || '')

    if (!verified) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, points, reward } = await request.json()

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 })
    }

    const db = getDb()
    const docRef = db.collection('rewards').doc(verified.uid)
    const doc = await docRef.get()

    if (!doc.exists) {
      return NextResponse.json({ message: 'Reward profile not found' }, { status: 404 })
    }

    const profile = doc.data() as RewardProfile

    // ---- ACTIONS ----

    if (action === 'addPoints' && points) {
      profile.totalPoints += points
      profile.lastActivityAt = new Date().toISOString()

      if (profile.totalPoints >= 5000) profile.tier = 'platinum'
      else if (profile.totalPoints >= 2000) profile.tier = 'gold'
      else if (profile.totalPoints >= 500) profile.tier = 'silver'
      else profile.tier = 'bronze'
    }

    if (action === 'claimReward' && reward) {
      profile.rewards.push({
        ...reward,
        claimedAt: new Date().toISOString(),
      })

      profile.totalRewards += 1
      profile.lastActivityAt = new Date().toISOString()
    }

    if (action === 'markMilestone' && reward?.milestone) {
      profile.milestones[reward.milestone as keyof typeof profile.milestones] = true
      profile.lastActivityAt = new Date().toISOString()
    }

    // ✅ FIX: Firestore-safe update (IMPORTANT CHANGE)
    await docRef.set(profile, { merge: true })

    return NextResponse.json({
      success: true,
      message: 'Reward profile updated',
      profile,
    })
  } catch (error: any) {
    console.error('[Rewards] PUT error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update reward profile' },
      { status: 500 }
    )
  }
}
