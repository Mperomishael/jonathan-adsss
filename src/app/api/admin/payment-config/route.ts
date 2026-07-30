import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

// GET returns the paymentMethods doc as-is (admin only)
export async function GET(req: NextRequest) {
  if (!await verifyAdminRequest(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const db = (await import('@/lib/firestore')).getDb()
    const doc = await db.collection('settings').doc('paymentMethods').get()
    return NextResponse.json(doc.exists ? doc.data() : {})
  } catch (error: any) {
    console.error('Failed to load payment config:', error)
    return NextResponse.json({ error: 'Failed to load payment config' }, { status: 500 })
  }
}

// PUT updates the paymentMethods doc (admin only)
export async function PUT(req: NextRequest) {
  if (!await verifyAdminRequest(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const data = await req.json()
    const db = (await import('@/lib/firestore')).getDb()
    await db.collection('settings').doc('paymentMethods').set(data, { merge: true })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Failed to save payment config:', error)
    return NextResponse.json({ error: 'Failed to save payment config' }, { status: 500 })
  }
}

