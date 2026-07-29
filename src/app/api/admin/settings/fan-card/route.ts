import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/firebase-admin'
import { getFanCardSettings, updateFanCardSettings } from '@/lib/firestore'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  if (!await verifyAdminRequest(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(await getFanCardSettings())
}

export async function PUT(req: NextRequest) {
  if (!await verifyAdminRequest(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const data = await req.json()
  await updateFanCardSettings(data)
  return NextResponse.json({ success: true })
}
