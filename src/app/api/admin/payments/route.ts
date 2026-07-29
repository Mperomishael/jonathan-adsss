import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/firebase-admin'
import { getPayments } from '@/lib/firestore'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  if (!await verifyAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const payments = await getPayments()
    return NextResponse.json(payments)
  } catch (error: any) {
    console.error('Get payments error:', error)
    return NextResponse.json({ error: error.message || 'Failed to get payments' }, { status: 500 })
  }
}
