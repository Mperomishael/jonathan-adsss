import { NextResponse } from 'next/server'
import { getFanCardSettings } from '@/lib/firestore'

export const dynamic = 'force-dynamic'

/**
 * Public fan-card settings — prices are ADMIN ONLY (USD dollars).
 * No hardcoded tier prices. Missing price → null.
 */
export async function GET() {
  try {
    const s = await getFanCardSettings()
    const tiers = {
      regular: {
        enabled: s.tiers?.regular?.enabled !== false,
        price: s.tiers?.regular?.price ?? s.price ?? null,
        label: s.tiers?.regular?.label || 'Regular Fan',
      },
      gold: {
        enabled: s.tiers?.gold?.enabled !== false,
        price: s.tiers?.gold?.price ?? null,
        label: s.tiers?.gold?.label || 'Gold Fan',
      },
      diamond: {
        enabled: s.tiers?.diamond?.enabled !== false,
        price: s.tiers?.diamond?.price ?? null,
        label: s.tiers?.diamond?.label || 'Diamond Fan',
      },
    }
    return NextResponse.json({
      price: tiers.regular.price,
      logoUrl: s.logoUrl || null,
      footerText: s.footerText || null,
      antiScreenshot: s.antiScreenshot !== false,
      background: s.background || null,
      accentColor: s.accentColor || null,
      tiers,
      updatedAt: s.updatedAt || null,
    })
  } catch (e: any) {
    console.error('[api/settings/fan-card]', e)
    return NextResponse.json({ error: e?.message || 'Failed' }, { status: 500 })
  }
}
