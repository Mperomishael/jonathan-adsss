import { getCryptoWallets } from '@/lib/firestore'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const wallets = await getCryptoWallets()

    return Response.json({
      btc: wallets.btc ? { address: wallets.btc.address } : null,
      usdt: wallets.usdt ? { address: wallets.usdt.address } : null,
    })
  } catch (error: any) {
    console.error('Get wallets error:', error)
    return Response.json({ error: error.message || 'Failed to get wallets' }, { status: 500 })
  }
}
