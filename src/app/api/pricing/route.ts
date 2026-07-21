import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// In-memory pricing store (in production, use a database)
let pricing = {
  fanCard: {
    price: 25.00,
    lastUpdated: new Date(),
  },
  products: {
    1: { name: 'Premium T-Shirt Black', price: 29.99 },
    2: { name: 'Premium T-Shirt White', price: 29.99 },
    3: { name: 'Signature Hoodie', price: 59.99 },
    4: { name: 'Signature Hoodie Alt', price: 59.99 },
    5: { name: 'Exclusive Apparel', price: 34.99 },
    6: { name: 'Premium Collection Item', price: 44.99 },
    7: { name: 'Signature Series', price: 39.99 },
    8: { name: 'Limited Apparel', price: 54.99 },
    9: { name: 'Classic Design Tee', price: 26.99 },
    10: { name: 'Performance Hoodie', price: 64.99 },
    11: { name: 'Exclusive Tee', price: 31.99 },
    12: { name: 'Premium Edition', price: 49.99 },
    13: { name: 'Signature Hoodie Premium', price: 69.99 },
  },
}

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get('type')

  if (type === 'fancard') {
    return NextResponse.json(pricing.fanCard)
  }

  if (type === 'products') {
    return NextResponse.json(pricing.products)
  }

  if (type === 'product') {
    const productId = req.nextUrl.searchParams.get('id')
    if (productId) {
      const productIdNum = parseInt(productId, 10) as keyof typeof pricing.products
      if (productIdNum in pricing.products) {
        return NextResponse.json(pricing.products[productIdNum])
      }
    }
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  return NextResponse.json(pricing)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, productId, price } = body

    // In production, verify admin authentication here
    if (type === 'fancard' && typeof price === 'number') {
      pricing.fanCard.price = price
      pricing.fanCard.lastUpdated = new Date()
      return NextResponse.json({
        success: true,
        fanCard: pricing.fanCard,
      })
    }

    if (type === 'product' && productId && typeof price === 'number') {
      const productIdNum = parseInt(productId, 10) as keyof typeof pricing.products
      if (productIdNum in pricing.products) {
        pricing.products[productIdNum].price = price
        return NextResponse.json({
          success: true,
          product: pricing.products[productIdNum],
        })
      }
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  } catch (error) {
    console.error('Pricing update error:', error)
    return NextResponse.json({ error: 'Failed to update pricing' }, { status: 500 })
  }
}
