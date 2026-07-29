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
    const btc = wallets.find((w) => w.type === 'BTC')
    const usdt = wallets.find((w) => w.type === 'USDT')
    return NextResponse.json({ btc: btc || null, usdt: usdt || null })
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
    const { type, address } = await req.json()

    if (!type || !address) {
      return NextResponse.json({ error: 'Type and address are required' }, { status: 400 })
    }

    await setCryptoWallet(type, address, updatedBy)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Set wallet error:', error)
    return NextResponse.json({ error: error.message || 'Failed to set wallet' }, { status: 500 })
  }
}
