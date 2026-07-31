import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/firestore'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { items, total, customer, paymentMethod, cryptoType, cryptoWallet, paymentHandle } =
      body

    if (!customer?.email || !items?.length) {
      return NextResponse.json(
        { error: 'Customer email and items are required' },
        { status: 400 }
      )
    }

    const db = getDb()
    const now = new Date().toISOString()
    const ref = await db.collection('shopOrders').add({
      items,
      total: Number(total) || 0,
      customer: {
        email: String(customer.email).toLowerCase().trim(),
        phone: customer.phone || '',
        address: customer.address || '',
        altPhone: customer.altPhone || '',
      },
      paymentMethod: paymentMethod || '',
      cryptoType: cryptoType || null,
      cryptoWallet: cryptoWallet || null,
      paymentHandle: paymentHandle || null,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    })

    return NextResponse.json({
      orderId: ref.id,
      success: true,
      message: 'Order submitted. We will confirm after payment verification.',
    })
  } catch (error: any) {
    console.error('[Create Order]', error)
    return NextResponse.json(
      { error: error.message || 'Failed to submit order' },
      { status: 500 }
    )
  }
}
