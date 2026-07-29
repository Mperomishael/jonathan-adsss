import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/firebase-admin'
import { confirmPayment, getPayment, getUserByEmail, createUser, updateUser } from '@/lib/firestore'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  if (!await verifyAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { paymentId, transactionId } = await req.json()

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

    // 1. Mark the payment as confirmed
    await confirmPayment(paymentId, transactionId)

    // 2. Whitelist the fan by email — this is the key step
    //    Find user by email (created at payment submission time) or userId
    const email = payment.email
    const userId = payment.userId

    let user = null
    if (email) {
      user = await getUserByEmail(email)
    } else if (userId) {
      const { getUser } = await import('@/lib/firestore')
      user = await getUser(userId)
    }

    if (!user && email) {
      // Create user record if it doesn't exist yet
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
      console.warn(`[Confirm] No user found for payment ${paymentId} — could not whitelist`)
    }

    return NextResponse.json({
      success: true,
      message: `Payment confirmed and fan ${email || userId} has been whitelisted.`,
    })
  } catch (error: any) {
    console.error('Confirm payment error:', error)
    return NextResponse.json({ error: error.message || 'Failed to confirm payment' }, { status: 500 })
  }
}