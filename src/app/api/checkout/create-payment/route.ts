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
      proofUrl, // base64 data URL or https URL of screenshot
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

    if (!proofUrl || typeof proofUrl !== 'string' || proofUrl.length < 20) {
      return NextResponse.json(
        { error: 'Please upload proof of payment (screenshot) before submitting.' },
        { status: 400 }
      )
    }

    // Cap huge base64 payloads (~1.5MB text)
    if (proofUrl.length > 1_800_000) {
      return NextResponse.json(
        { error: 'Proof image is too large. Use a smaller screenshot.' },
        { status: 400 }
      )
    }

    const db = getDb()
    const methodsDoc = await db.collection('settings').doc('paymentMethods').get()
    const methods = methodsDoc.exists ? methodsDoc.data() || {} : {}
    const wallets = await getCryptoWallets()

    const btcAddress = methods?.crypto?.btc?.address || wallets?.btc?.address || ''
    const usdtAddress = methods?.crypto?.usdt?.address || wallets?.usdt?.address || ''

    if (currency === 'BTC' && !btcAddress) {
      return NextResponse.json({ error: 'Bitcoin is not available' }, { status: 400 })
    }
    if (currency === 'USDT' && !usdtAddress) {
      return NextResponse.json({ error: 'USDT is not available' }, { status: 400 })
    }
    if (currency === 'Venmo' && !(methods?.venmo?.enabled && methods?.venmo?.handle)) {
      return NextResponse.json({ error: 'Venmo is not available' }, { status: 400 })
    }
    if (currency === 'CashApp' && !(methods?.cashapp?.enabled && methods?.cashapp?.handle)) {
      return NextResponse.json({ error: 'Cash App is not available' }, { status: 400 })
    }
    if (currency === 'ChipperCash' && !(methods?.chipperCash?.enabled && methods?.chipperCash?.handle)) {
      return NextResponse.json({ error: 'Chipper Cash is not available' }, { status: 400 })
    }

    let user = await getUserByEmail(String(email).toLowerCase().trim())
    if (!user) {
      user = await createUser(String(email).toLowerCase().trim()) // no googleId → no undefined
    }

    await getDb().collection('users').doc(user.id).update({
      paymentStatus: 'pending',
    })

    const payment = await createPayment({
      userId: user.id,
      email: String(email).toLowerCase().trim(),
      name: name?.trim() || '',
      amount: Number(amount),
      currency,
      status: 'pending',
      waybill: !!waybill,
      shippingAddress: shippingAddress?.trim() || '',
      tier: tier || 'regular',
      proofUrl,
    } as any)

    return NextResponse.json({
      paymentId: payment.id,
      message: 'Proof received. Admin will verify your payment within 24 hours.',
    })
  } catch (error: any) {
    console.error('[Create Payment]', error)
    return NextResponse.json(
      { error: error.message || 'Failed to submit payment' },
      { status: 500 }
    )
  }
}
