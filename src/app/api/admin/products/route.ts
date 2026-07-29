import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/firebase-admin'
import { getProducts, createProduct, updateProduct, deleteProduct } from '@/lib/firestore'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  if (!await verifyAdminRequest(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(await getProducts())
}

export async function POST(req: NextRequest) {
  if (!await verifyAdminRequest(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const data = await req.json()
  const product = await createProduct(data)
  return NextResponse.json(product, { status: 201 })
}

export async function PUT(req: NextRequest) {
  if (!await verifyAdminRequest(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const data = await req.json()
  await updateProduct(id, data)
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  if (!await verifyAdminRequest(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  await deleteProduct(id)
  return NextResponse.json({ success: true })
}
