import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/firestore'
import { verifyUserToken } from '@/lib/auth-utils'

export const dynamic = 'force-dynamic'

/**
 * POST — add product to cart by creating a pending store order.
 * This makes the purchase visible in admin immediately for approval + points.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      productId,
      quantity = 1,
      productName,
      unitPrice,
      image,
      email,
      name,
    } = body

    if (!productId) {
      return NextResponse.json({ error: 'productId is required' }, { status: 400 })
    }

    const db = getDb()

    // Resolve product details if not provided
    let name_ = productName
    let price_ = unitPrice
    let image_ = image || ''

    if (name_ == null || price_ == null) {
      try {
        const prod = await db.collection('products').doc(String(productId)).get()
        if (prod.exists) {
          const data = prod.data() as any
          name_ = name_ || data.name
          price_ = price_ ?? data.price
          image_ = image_ || data.image || ''
        }
      } catch {
        // continue with provided values
      }
    }

    if (!name_ || price_ == null) {
      return NextResponse.json(
        { error: 'Could not resolve product. Provide productName and unitPrice.' },
        { status: 400 }
      )
    }

    let userId: string | null = null
    let userEmail = (email || '').toLowerCase().trim()

    const token = req.headers.get('Authorization')?.split(' ')[1]
    if (token) {
      const verified = await verifyUserToken(token)
      if (verified) {
        userId = verified.uid
        userEmail = verified.email?.toLowerCase() || userEmail
      }
    }

    const qty = Math.max(1, Number(quantity) || 1)
    const price = Number(price_)
    const now = new Date().toISOString()
    const total = Math.round(price * qty * 100) / 100

    const order = {
      productId: String(productId),
      productName: String(name_),
      quantity: qty,
      unitPrice: price,
      total,
      currency: 'USD',
      image: image_,
      userId,
      email: userEmail,
      name: name || '',
      shippingAddress: '',
      status: 'pending',
      pointsAwarded: 0,
      createdAt: now,
      updatedAt: now,
    }

    const ref = await db.collection('storeOrders').add(order)

    return NextResponse.json({
      success: true,
      orderId: ref.id,
      message: 'Order placed. It will appear in admin for approval and reward points.',
      order: { id: ref.id, ...order },
    })
  } catch (err: any) {
    console.error('[cart/add] error:', err)
    return NextResponse.json({ error: err.message || 'Failed to add to cart' }, { status: 500 })
  }
}
