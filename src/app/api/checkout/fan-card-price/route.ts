import { getDb } from '@/lib/firestore'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const db = getDb()

    const doc = await db.collection('pageSettings').doc('fanCard').get()

    if (!doc.exists) {
      return NextResponse.json({ price: 2999 })
    }

    const data = doc.data() || {}
    const price = data.price || 2999

    return NextResponse.json({
      price: typeof price === 'number' ? Math.round(price * 100) : price,
    })
  } catch (error: any) {
    console.error('Failed to fetch fan card price:', error)
    return NextResponse.json(
      { error: 'Failed to fetch fan card price', price: 2999 },
      { status: 200 }
    )
  }
}
