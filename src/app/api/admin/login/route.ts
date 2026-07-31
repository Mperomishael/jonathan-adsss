import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const ADMIN_TOKEN = 'admin-session-token-v1'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const username = String(body.username || '').trim()
    const password = String(body.password || '')

    const expectedUser = process.env.ADMIN_USERNAME || 'admin'
    const expectedPass = process.env.ADMIN_PASSWORD || ''

    if (!expectedPass) {
      console.error('[Admin Login] ADMIN_PASSWORD env is not set')
      return NextResponse.json({ error: 'Server auth not configured' }, { status: 500 })
    }

    if (username !== expectedUser || password !== expectedPass) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })
    }

    return NextResponse.json({
      token: ADMIN_TOKEN,
      user: { username: expectedUser, email: 'admin@admin' },
      role: 'super-admin',
    })
  } catch {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
