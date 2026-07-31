import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/firebase-admin'
import { createProduct } from '@/lib/firestore'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  if (!(await verifyAdminRequest(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const contentType = req.headers.get('content-type') || ''
    let name = ''
    let description = ''
    let price = 0
    let category = 'merchandise'
    let image = '/images/shop/WhatsApp_Image_2026-04-23_at_19.13.27.jpeg'
    let stock = 99
    let inStock = true

    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData()
      name = String(form.get('name') || '').trim()
      description = String(form.get('description') || '').trim()
      price = Number(form.get('price') || 0)
      category = String(form.get('category') || 'merchandise')
      stock = Number(form.get('stock') || 99)
      inStock = form.get('inStock') !== 'false'
      const imageUrl = form.get('imageUrl')
      if (typeof imageUrl === 'string' && imageUrl.trim()) {
        image = imageUrl.trim()
      }
      // Optional: if a file is sent as base64 data URL field
      const imageData = form.get('imageData')
      if (typeof imageData === 'string' && imageData.startsWith('data:image')) {
        image = imageData
      }
    } else {
      const body = await req.json()
      name = String(body.name || '').trim()
      description = String(body.description || '').trim()
      price = Number(body.price || 0)
      category = String(body.category || 'merchandise')
      image = String(body.image || image)
      stock = Number(body.stock ?? 99)
      inStock = body.inStock !== false
    }

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }
    if (!(price > 0)) {
      return NextResponse.json({ error: 'Price must be greater than 0' }, { status: 400 })
    }

    // Price stored in DOLLARS (same as shop UI)
    const product = await createProduct({
      name,
      description,
      price: Math.round(price * 100) / 100,
      image,
      category,
      inStock,
      stock,
    } as any)

    return NextResponse.json(product, { status: 201 })
  } catch (err: any) {
    console.error('Add product error:', err)
    return NextResponse.json({ error: err.message || 'Failed to add product' }, { status: 500 })
  }
}
