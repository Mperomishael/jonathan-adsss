import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/firebase-admin'
import { getUsers } from '@/lib/firestore'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  if (!await verifyAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const users = await getUsers()
    return NextResponse.json(users)
  } catch (error: any) {
    console.error('Get users error:', error)
    return NextResponse.json({ error: error.message || 'Failed to get users' }, { status: 500 })
  }
}
