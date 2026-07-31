import { getDb } from '@/lib/firestore'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const db = getDb()
    const snapshot = await db.collection('products').orderBy('createdAt', 'desc').get()

    if (snapshot.empty) {
      return NextResponse.json([])
    }

    const products = snapshot.docs.map((doc) => {
      const data = doc.data()
      const rawPrice = Number(data.price || 0)
      // Support legacy: if price looks like cents (>= 1000 and integer), convert once
      const price =
        Number.isInteger(rawPrice) && rawPrice >= 1000
          ? rawPrice / 100
          : Math.round(rawPrice * 100) / 100

      return {
        id: doc.id,
        name: data.name || 'Unnamed Product',
        description: data.description || '',
        price,
        image: data.image || '/images/shop/WhatsApp_Image_2026-04-23_at_19.13.27.jpeg',
        category: data.category || 'general',
        stock: typeof data.stock === 'number' ? data.stock : data.inStock === false ? 0 : 99,
        inStock: data.inStock !== false,
      }
    })

    return NextResponse.json(products)
  } catch (error: any) {
    console.error('Failed to fetch products:', error)
    return NextResponse.json([])
  }
}
