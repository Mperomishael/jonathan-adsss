import { NextResponse } from 'next/server'
import { getDb, getCryptoWallets } from '@/lib/firestore'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const db = getDb()
    const wallets = await getCryptoWallets()
    const methodsDoc = await db.collection('settings').doc('paymentMethods').get()
    const paymentData = (methodsDoc.exists ? methodsDoc.data() : {}) as Record<string, any>

    const btcAddress = wallets.btc?.address?.trim() || ''
    const usdtAddress = wallets.usdt?.address?.trim() || ''

    // enabled defaults to true when address/handle exists, unless admin set enabled: false
    const btcEnabled = paymentData.crypto?.btc?.enabled !== false
    const usdtEnabled = paymentData.crypto?.usdt?.enabled !== false

    const response: Record<string, any> = { crypto: {} }

    if (btcAddress && btcEnabled) {
      response.crypto.btc = { address: btcAddress, enabled: true }
    }
    if (usdtAddress && usdtEnabled) {
      response.crypto.usdt = { address: usdtAddress, enabled: true }
    }

    if (paymentData.paypal?.enabled && paymentData.paypal?.clientId) {
      response.paypal = { clientId: paymentData.paypal.clientId, enabled: true }
    }
    if (paymentData.stripe?.enabled && paymentData.stripe?.publishableKey) {
      response.stripe = { publishableKey: paymentData.stripe.publishableKey, enabled: true }
    }
    if (paymentData.cashapp?.enabled && paymentData.cashapp?.handle) {
      response.cashapp = { handle: paymentData.cashapp.handle, enabled: true }
    }
    if (paymentData.venmo?.enabled && paymentData.venmo?.handle) {
      response.venmo = { handle: paymentData.venmo.handle, enabled: true }
    }
    if (paymentData.chipperCash?.enabled && paymentData.chipperCash?.handle) {
      response.chipperCash = { handle: paymentData.chipperCash.handle, enabled: true }
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Failed to fetch payment methods:', error)
    return NextResponse.json({ error: 'Failed to fetch payment methods', crypto: {} }, { status: 500 })
  }
}
