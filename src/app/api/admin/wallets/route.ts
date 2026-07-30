import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRequest, getDecodedToken } from '@/lib/firebase-admin'
import { getCryptoWallets, setCryptoWallet } from '@/lib/firestore'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  if (!await verifyAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const wallets = await getCryptoWallets()
    return NextResponse.json({
      btc: wallets.btc || null,
      usdt: wallets.usdt || null,
    })
  } catch (error: any) {
    console.error('Get wallets error:', error)
    return NextResponse.json({ error: error.message || 'Failed to get wallets' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!await verifyAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const decoded = await getDecodedToken(req)
    const updatedBy = decoded?.email || 'admin'
    const payload = await req.json()

    const updates: Array<{ type: 'BTC' | 'USDT'; address: string }> = []
    if (typeof payload.type === 'string' && payload.address) {
      updates.push({ type: payload.type, address: payload.address })
    }
    if (typeof payload.btc === 'string' && payload.btc.trim()) {
      updates.push({ type: 'BTC', address: payload.btc.trim() })
    }
    if (typeof payload.usdt === 'string' && payload.usdt.trim()) {
      updates.push({ type: 'USDT', address: payload.usdt.trim() })
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No wallet addresses provided' }, { status: 400 })
    }

    for (const update of updates) {
      await setCryptoWallet(update.type, update.address, updatedBy)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Set wallet error:', error)
    return NextResponse.json({ error: error.message || 'Failed to set wallet' }, { status: 500 })
  }
}
