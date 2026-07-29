import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/firebase-admin'
import { updateUser, getUser } from '@/lib/firestore'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  if (!await verifyAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { userId, whitelisted } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const user = await getUser(userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    await updateUser(userId, {
      ...user,
      whitelisted,
      fanStatus: whitelisted ? 'approved' : 'pending',
    })

    return NextResponse.json({
      success: true,
      message: whitelisted ? 'User whitelisted' : 'User removed from whitelist',
    })
  } catch (error: any) {
    console.error('Whitelist error:', error)
    return NextResponse.json({ error: error.message || 'Failed to update user' }, { status: 500 })
  }
}
