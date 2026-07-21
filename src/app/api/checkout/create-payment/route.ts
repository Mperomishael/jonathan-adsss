import { NextRequest, NextResponse } from 'next/server'
import { createPayment, getUserByEmail, createUser } from '@/lib/firestore'
import { getDb } from '@/lib/firestore'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { email, name, currency, amount, waybill, shippingAddress } = await request.json()

    if (!email || !currency || amount === undefined) {
      return NextResponse.json({ error: 'Email, currency, and amount are required' }, { status: 400 })
    }

    if (!['USDT', 'BTC', 'PayPal', 'Stripe'].includes(currency)) {
      return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 })
    }

    // Load payment methods from Firestore
    const db = getDb()
    const methodsDoc = await db.collection('settings').doc('paymentMethods').get()
    const methods = methodsDoc.exists ? methodsDoc.data() : null

    // Verify payment method is configured
    if (!methods) {
      return NextResponse.json({ error: 'Payment methods not configured. Please try again later.' }, { status: 503 })
    }

    // Verify specific method is enabled and has required data
    if (currency === 'BTC') {
      if (!methods.crypto?.btc?.enabled || !methods.crypto?.btc?.address) {
        return NextResponse.json({ error: 'Bitcoin payment is not currently available' }, { status: 400 })
      }
    } else if (currency === 'USDT') {
      if (!methods.crypto?.usdt?.enabled || !methods.crypto?.usdt?.address) {
        return NextResponse.json({ error: 'USDT payment is not currently available' }, { status: 400 })
      }
    } else if (currency === 'PayPal') {
      if (!methods.paypal?.enabled || !methods.paypal?.clientId) {
        return NextResponse.json({ error: 'PayPal payment is not currently available' }, { status: 400 })
      }
    } else if (currency === 'Stripe') {
      if (!methods.stripe?.enabled || !methods.stripe?.publishableKey) {
        return NextResponse.json({ error: 'Stripe payment is not currently available' }, { status: 400 })
      }
    }

    // Find or create user record by email
    let user = await getUserByEmail(email)
    if (!user) {
      user = await createUser(email)
    }

    // Create the pending payment record with optional waybill info
    const payment = await createPayment({
      userId: user.id,
      email: email.toLowerCase().trim(),
      name: name?.trim() || '',
      amount,
      currency,
      status: 'pending',
       waybill: waybill || false,
      shippingAddress: shippingAddress?.trim() || '',
    })

    return NextResponse.json({
      paymentId: payment.id,
      message: 'Payment submitted. Admin will verify and whitelist you within 24 hours.',
    })
  } catch (error: any) {
    console.error('[Create Payment] error:', error)
    return NextResponse.json({ error: error.message || 'Failed to submit payment' }, { status: 500 })
  }
}
