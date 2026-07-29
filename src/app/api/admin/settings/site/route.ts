import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/firebase-admin'
import { getSiteSettings, updateSiteSettings } from '@/lib/firestore'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  if (!await verifyAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return NextResponse.json(await getSiteSettings())
}

export async function PUT(req: NextRequest) {
  if (!await verifyAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const data = await req.json()
  await updateSiteSettings(data)
  return NextResponse.json({ success: true })
}
