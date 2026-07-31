import { NextRequest, NextResponse } from 'next/server'
import { createPayment, getUserByEmail, createUser, getDb, getCryptoWallets } from '@/lib/firestore'

export const dynamic = 'force-dynamic'

const ALLOWED = ['USDT', 'BTC', 'PayPal', 'Stripe', 'Venmo', 'ChipperCash', 'CashApp'] as const

export async function POST(request: NextRequest) {
  try {
    const { email, name, currency, amount, waybill, shippingAddress } = await request.json()

    if (!email || !currency || amount === undefined) {
      return NextResponse.json({ error: 'Email, currency, and amount are required' }, { status: 400 })
    }

    if (!ALLOWED.includes(currency)) {
      return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 })
    }

    const db = getDb()
    const methodsDoc = await db.collection('settings').doc('paymentMethods').get()
    const methods = methodsDoc.exists ? methodsDoc.data() : null
    const wallets = await getCryptoWallets()

    if (currency === 'BTC') {
      const addr = wallets.btc?.address?.trim()
      if (!addr || methods?.crypto?.btc?.enabled === false) {
        return NextResponse.json({ error: 'Bitcoin payment is not currently available' }, { status: 400 })
      }
    } else if (currency === 'USDT') {
      const addr = wallets.usdt?.address?.trim()
      if (!addr || methods?.crypto?.usdt?.enabled === false) {
        return NextResponse.json({ error: 'USDT payment is not currently available' }, { status: 400 })
      }
    } else if (currency === 'PayPal') {
      if (!methods?.paypal?.enabled || !methods?.paypal?.clientId) {
        return NextResponse.json({ error: 'PayPal payment is not currently available' }, { status: 400 })
      }
    } else if (currency === 'Stripe') {
      if (!methods?.stripe?.enabled || !methods?.stripe?.publishableKey) {
        return NextResponse.json({ error: 'Stripe payment is not currently available' }, { status: 400 })
      }
    } else if (currency === 'Venmo') {
      if (!methods?.venmo?.enabled || !methods?.venmo?.handle) {
        return NextResponse.json({ error: 'Venmo payment is not currently available' }, { status: 400 })
      }
    } else if (currency === 'ChipperCash') {
      if (!methods?.chipperCash?.enabled || !methods?.chipperCash?.handle) {
        return NextResponse.json({ error: 'Chipper Cash payment is not currently available' }, { status: 400 })
      }
    } else if (currency === 'CashApp') {
      if (!methods?.cashapp?.enabled || !methods?.cashapp?.handle) {
        return NextResponse.json({ error: 'Cash App payment is not currently available' }, { status: 400 })
      }
    }

    let user = await getUserByEmail(email)
    if (!user) user = await createUser(email)

    const payment = await createPayment({
      userId: user.id,
      email: email.toLowerCase().trim(),
      name: name?.trim() || '',
      amount,
      currency: currency as any,
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
