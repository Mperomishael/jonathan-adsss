import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/firebase-admin'
import { getGallery, addGalleryImage, deleteGalleryImage } from '@/lib/firestore'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  if (!await verifyAdminRequest(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(await getGallery())
}

export async function POST(req: NextRequest) {
  if (!await verifyAdminRequest(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const data = await req.json()
  return NextResponse.json(await addGalleryImage(data), { status: 201 })
}

export async function DELETE(req: NextRequest) {
  if (!await verifyAdminRequest(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  await deleteGalleryImage(id)
  return NextResponse.json({ success: true })
}
