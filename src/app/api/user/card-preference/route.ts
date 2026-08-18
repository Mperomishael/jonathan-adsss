import { NextRequest, NextResponse } from 'next/server'
import { verifyUserToken } from '@/lib/auth-utils'
import { getUser, updateUser } from '@/lib/firestore'

export const dynamic = 'force-dynamic'

function computeMemberId(name: string): string {
  const hash = Math.abs(
    name.split('').reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0x12345)
  )
  return `JR-${hash.toString().padStart(6, '0').slice(0, 6)}`
}

/**
 * GET — fetch the current user's saved card personalization (name/memberId).
 */
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1]
    const verified = await verifyUserToken(token || '')
    if (!verified) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUser(verified.uid)
    return NextResponse.json({
      cardName: user?.cardName || '',
      cardMemberId: user?.cardMemberId || '',
      fanTier: user?.fanTier || 'regular',
    })
  } catch (err: any) {
    console.error('[user/card-preference] GET error:', err)
    return NextResponse.json({ error: err.message || 'Failed to load card preference' }, { status: 500 })
  }
}

/**
 * POST — save the fan's chosen card name (and tier) so it's available to the
 * admin dashboard for generating/downloading the fan card PDF on the fan's behalf.
 * Body: { cardName: string, fanLevel?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1]
    const verified = await verifyUserToken(token || '')
    if (!verified) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { cardName, fanLevel } = await req.json()
    const trimmedName = String(cardName || '').trim()
    if (!trimmedName) {
      return NextResponse.json({ error: 'cardName is required' }, { status: 400 })
    }

    const memberId = computeMemberId(trimmedName)

    await updateUser(verified.uid, {
      cardName: trimmedName,
      cardMemberId: memberId,
      cardUpdatedAt: new Date().toISOString(),
      ...(fanLevel ? { fanTier: fanLevel } : {}),
    } as any)

    return NextResponse.json({ success: true, cardName: trimmedName, cardMemberId: memberId })
  } catch (err: any) {
    console.error('[user/card-preference] POST error:', err)
    return NextResponse.json({ error: err.message || 'Failed to save card preference' }, { status: 500 })
  }
}
