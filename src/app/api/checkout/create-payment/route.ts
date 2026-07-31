import { NextRequest, NextResponse } from 'next/server'
import {
  createPayment,
  getUserByEmail,
  createUser,
  getDb,
  getCryptoWallets,
} from '@/lib/firestore'

export const dynamic = 'force-dynamic'

const ALLOWED = ['USDT', 'BTC', 'PayPal', 'Stripe', 'Venmo', 'ChipperCash', 'CashApp'] as const

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      email,
      name,
      currency,
      amount,
      waybill,
      shippingAddress,
      tier,
    } = body

    if (!email || !currency || amount === undefined) {
      return NextResponse.json(
        { error: 'Email, currency, and amount are required' },
        { status: 400 }
      )
    }

    if (!ALLOWED.includes(currency)) {
      return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 })
    }

    const db = getDb()
    const methodsDoc = await db.collection('settings').doc('paymentMethods').get()
    const methods = methodsDoc.exists ? methodsDoc.data() : {}
    const wallets = await getCryptoWallets()

    const btcAddress =
      methods?.crypto?.btc?.address || wallets?.btc?.address || ''
    const usdtAddress =
      methods?.crypto?.usdt?.address || wallets?.usdt?.address || ''

    if (currency === 'BTC' && !btcAddress) {
      return NextResponse.json(
        { error: 'Bitcoin payment is not currently available' },
        { status: 400 }
      )
    }
    if (currency === 'USDT' && !usdtAddress) {
      return NextResponse.json(
        { error: 'USDT payment is not currently available' },
        { status: 400 }
      )
    }
    if (currency === 'Venmo' && !(methods?.venmo?.enabled && methods?.venmo?.handle)) {
      return NextResponse.json(
        { error: 'Venmo payment is not currently available' },
        { status: 400 }
      )
    }
    if (currency === 'CashApp' && !(methods?.cashapp?.enabled && methods?.cashapp?.handle)) {
      return NextResponse.json(
        { error: 'Cash App payment is not currently available' },
        { status: 400 }
      )
    }
    if (
      currency === 'ChipperCash' &&
      !(methods?.chipperCash?.enabled && methods?.chipperCash?.handle)
    ) {
      return NextResponse.json(
        { error: 'Chipper Cash payment is not currently available' },
        { status: 400 }
      )
    }
    if (currency === 'PayPal' && !(methods?.paypal?.enabled && methods?.paypal?.clientId)) {
      return NextResponse.json(
        { error: 'PayPal payment is not currently available' },
        { status: 400 }
      )
    }
    if (currency === 'Stripe' && !(methods?.stripe?.enabled && methods?.stripe?.publishableKey)) {
      return NextResponse.json(
        { error: 'Stripe payment is not currently available' },
        { status: 400 }
      )
    }

    let user = await getUserByEmail(email)
    if (!user) {
      user = await createUser(email)
    }

    const payment = await createPayment({
      userId: user.id,
      email: email.toLowerCase().trim(),
      name: name?.trim() || '',
      amount: Number(amount),
      currency,
      status: 'pending',
      waybill: !!waybill,
      shippingAddress: shippingAddress?.trim() || '',
      tier: tier || 'regular',
    } as any)

    return NextResponse.json({
      paymentId: payment.id,
      message: 'Payment submitted. Admin will verify within 24 hours.',
    })
  } catch (error: any) {
    console.error('[Create Payment] error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to submit payment' },
      { status: 500 }
    )
  }
}
