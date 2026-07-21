import { getDb } from '@/lib/firestore'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const db = getDb() // ✅ FIX: never null

    const snapshot = await db.collection('products').get()

    if (snapshot.empty) {
      return NextResponse.json([])
    }

    const products = snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        name: data.name || 'Unnamed Product',
        description: data.description || '',
        price: typeof data.price === 'number' ? Number(data.price.toFixed(2)) : Number(data.price || 0),
        image: data.image || '/images/shop/WhatsApp_Image_2026-04-23_at_19.13.27.jpeg',
        category: data.category || 'general',
      }
    })

    return NextResponse.json(products)
  } catch (error: any) {
    console.error('Failed to fetch products:', error)

    return NextResponse.json([])
  }
}
