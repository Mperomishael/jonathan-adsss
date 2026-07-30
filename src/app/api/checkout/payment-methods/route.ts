import { NextResponse } from 'next/server'
import { getDb } from '@/lib/firestore'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const db = getDb()
    
    // Get crypto wallets from the centralized location
    const walletsDoc = await db.collection('pageSettings').doc('cryptoWallets').get()
    const walletsData = (walletsDoc.exists ? walletsDoc.data() : {}) as Record<string, any>

    // Combine with any other payment methods if needed
    const paymentMethodsDoc = await db.collection('settings').doc('paymentMethods').get()
    const paymentData = (paymentMethodsDoc.exists ? paymentMethodsDoc.data() : {}) as Record<string, any>

    const btcAddress = typeof walletsData.btc === 'object' && walletsData.btc?.address ? walletsData.btc.address : ''
    const usdtAddress = typeof walletsData.usdt === 'object' && walletsData.usdt?.address ? walletsData.usdt.address : ''

    // Only return configured/enabled methods (no dummy fallbacks)
    const response: Record<string, any> = { crypto: {} }

    if (btcAddress) response.crypto.btc = { address: btcAddress, enabled: !!paymentData.crypto?.btc?.enabled }
    if (usdtAddress) response.crypto.usdt = { address: usdtAddress, enabled: !!paymentData.crypto?.usdt?.enabled }

    if (paymentData.paypal?.enabled) response.paypal = { clientId: paymentData.paypal.clientId, enabled: true }
    if (paymentData.stripe?.enabled) response.stripe = { publishableKey: paymentData.stripe.publishableKey, enabled: true }
    if (paymentData.cashapp?.enabled) response.cashapp = { handle: paymentData.cashapp.handle, enabled: true }
    if (paymentData.venmo?.enabled) response.venmo = { handle: paymentData.venmo.handle, enabled: true }
    if (paymentData.chipperCash?.enabled) response.chipperCash = { handle: paymentData.chipperCash.handle, enabled: true }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Failed to fetch payment methods:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment methods' },
      { status: 500 }
    )
  }
}
