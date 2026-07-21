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

    return NextResponse.json({
      crypto: {
        btc: walletsData.btc || { address: '', enabled: false },
        usdt: walletsData.usdt || { address: '', enabled: false },
      },
      paypal: paymentData.paypal || { clientId: '', enabled: false },
      stripe: paymentData.stripe || { publishableKey: '', enabled: false },
      cashapp: paymentData.cashapp || { handle: '', enabled: false },
    })
  } catch (error: any) {
    console.error('Failed to fetch payment methods:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment methods' },
      { status: 500 }
    )
  }
}
