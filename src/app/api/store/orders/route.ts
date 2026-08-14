import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/firestore'
import { verifyUserToken } from '@/lib/auth-utils'

export const dynamic = 'force-dynamic'

/**
 * POST — customer creates a store order (pending admin approval)
 * Body: { productId, productName, quantity, unitPrice, image?, currency? }
 * Auth optional but recommended — if token present, attaches userId/email.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      productId,
      productName,
      quantity = 1,
      unitPrice,
      image,
      currency = 'USD',
      email: bodyEmail,
      name,
      shippingAddress,
    } = body

    if (!productId || !productName || unitPrice == null) {
      return NextResponse.json(
        { error: 'productId, productName and unitPrice are required' },
        { status: 400 }
      )
    }

    const qty = Math.max(1, Number(quantity) || 1)
    const price = Number(unitPrice)
    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json({ error: 'Invalid unitPrice' }, { status: 400 })
    }

    let userId: string | null = null
    let email = (bodyEmail || '').toLowerCase().trim()

    const token = req.headers.get('Authorization')?.split(' ')[1]
    if (token) {
      const verified = await verifyUserToken(token)
      if (verified) {
        userId = verified.uid
        email = verified.email?.toLowerCase() || email
      }
    }

    if (!email && !userId) {
      return NextResponse.json(
        { error: 'Email or authenticated user is required' },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()
    const total = Math.round(price * qty * 100) / 100

    const order = {
      productId: String(productId),
      productName: String(productName),
      quantity: qty,
      unitPrice: price,
      total,
      currency,
      image: image || '',
      userId,
      email,
      name: name || '',
      shippingAddress: shippingAddress || '',
      status: 'pending' as const, // pending | approved | rejected
      pointsAwarded: 0,
      createdAt: now,
      updatedAt: now,
    }

    const db = getDb()
    const ref = await db.collection('storeOrders').add(order)

    return NextResponse.json({
      success: true,
      orderId: ref.id,
      message: 'Order submitted. Admin will review and may award reward points after approval.',
      order: { id: ref.id, ...order },
    })
  } catch (err: any) {
    console.error('[store/orders] POST error:', err)
    return NextResponse.json({ error: err.message || 'Failed to create order' }, { status: 500 })
  }
}

/**
 * GET — list current user's store orders
 */
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1]
    const verified = await verifyUserToken(token || '')
    if (!verified) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = getDb()
    let snap = await db
      .collection('storeOrders')
      .where('userId', '==', verified.uid)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get()
      .catch(() => null)

    // Fallback without composite index
    if (!snap) {
      const all = await db.collection('storeOrders').where('userId', '==', verified.uid).get()
      const docs = all.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a: any, b: any) => (b.createdAt || '').localeCompare(a.createdAt || ''))
      return NextResponse.json({ orders: docs })
    }

    const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    return NextResponse.json({ orders })
  } catch (err: any) {
    console.error('[store/orders] GET error:', err)
    return NextResponse.json({ error: err.message || 'Failed to load orders' }, { status: 500 })
  }
}
