import { NextRequest, NextResponse } from 'next/server'
import { verifyUserToken } from '@/lib/auth-utils'
import {
  getDb,
  getUserByEmail,
  createUser,
  updateUser,
  createPayment,
} from '@/lib/firestore'

export const dynamic = 'force-dynamic'

/**
 * Fan-card flow: user uploads payment screenshot after paying.
 * Creates a pending payment with proofUrl for admin review.
 * Body: { paymentProofUrl, currency?, amount?, tier?, name? }
 */
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1]
    const verified = await verifyUserToken(token || '')
    if (!verified) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      paymentProofUrl,
      currency = 'BTC',
      amount,
      tier,
      name,
    } = body as {
      paymentProofUrl?: string
      currency?: string
      amount?: number
      tier?: string
      name?: string
    }

    if (!paymentProofUrl || typeof paymentProofUrl !== 'string' || paymentProofUrl.length < 20) {
      return NextResponse.json(
        { error: 'Please upload a valid payment screenshot.' },
        { status: 400 }
      )
    }

    // Cap oversized base64 (~1.5MB)
    if (paymentProofUrl.length > 1_800_000) {
      return NextResponse.json(
        { error: 'Proof image is too large. Use a smaller screenshot.' },
        { status: 400 }
      )
    }

    const email = (verified.email || '').toLowerCase().trim()
    if (!email) {
      return NextResponse.json({ error: 'User email is required' }, { status: 400 })
    }

    // Resolve / create user without writing undefined googleId
    let user = await getUserByEmail(email)
    if (!user) {
      // Pass verified.uid as googleId only when present (non-empty)
      user = await createUser(email, verified.uid || undefined)
    } else if (verified.uid && !user.googleId) {
      await updateUser(user.id, { googleId: verified.uid })
    }

    await updateUser(user.id, { paymentStatus: 'pending' })

    // Default amount if client didn't send one
    let payAmount = Number(amount)
    if (!Number.isFinite(payAmount) || payAmount <= 0) {
      try {
        const db = getDb()
        const fan = await db.collection('pageSettings').doc('fanCard').get()
        const data = fan.exists ? fan.data() : null
        const tierKey = (tier || 'regular') as string
        payAmount =
          Number(data?.tiers?.[tierKey]?.price) ||
          Number(data?.price) ||
          0
      } catch {
        payAmount = 0
      }
    }

    const payment = await createPayment({
      userId: user.id,
      email,
      name: (name || '').trim(),
      amount: payAmount,
      currency: currency as any,
      status: 'pending',
      tier: (tier as any) || 'regular',
      proofUrl: paymentProofUrl,
      waybill: false,
      shippingAddress: '',
    })

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      paymentProofUrl,
      message: 'Proof received. Admin will verify your payment within 24 hours.',
    })
  } catch (error: any) {
    console.error('[submit-payment]', error)
    return NextResponse.json(
      { error: error.message || 'Failed to submit payment' },
      { status: 500 }
    )
  }
}
