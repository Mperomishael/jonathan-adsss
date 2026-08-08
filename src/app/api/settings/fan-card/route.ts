import { NextResponse } from 'next/server'
import { getFanCardSettings } from '@/lib/firestore'

export const dynamic = 'force-dynamic'

/**
 * Public fan-card settings.
 * Prices are always returned in USD dollars (e.g. 49.99).
 * Legacy cents values (>= 100 integer) are converted once.
 */
function toDollars(raw: unknown, fallback: number): number {
  const n = Number(raw)
  if (!Number.isFinite(n) || n <= 0) return fallback
  // Legacy cents (5000 = $50)
  if (Number.isInteger(n) && n >= 100) return Math.round(n) / 100
  return Math.round(n * 100) / 100
}

export async function GET() {
  try {
    const s = await getFanCardSettings()
    const tiers = {
      regular: {
        enabled: s.tiers?.regular?.enabled !== false,
        price: toDollars(s.tiers?.regular?.price ?? s.price, 50),
        label: s.tiers?.regular?.label || 'Regular Fan',
      },
      gold: {
        enabled: s.tiers?.gold?.enabled !== false,
        price: toDollars(s.tiers?.gold?.price, 150),
        label: s.tiers?.gold?.label || 'Gold Fan',
      },
      diamond: {
        enabled: s.tiers?.diamond?.enabled !== false,
        price: toDollars(s.tiers?.diamond?.price, 500),
        label: s.tiers?.diamond?.label || 'Diamond Fan',
      },
    }
    return NextResponse.json({
      price: tiers.regular.price,
      logoUrl: s.logoUrl,
      footerText: s.footerText,
      antiScreenshot: s.antiScreenshot !== false,
      background: s.background,
      accentColor: s.accentColor,
      tiers,
      updatedAt: s.updatedAt || null,
    })
  } catch (e: any) {
    console.error('[api/settings/fan-card]', e)
    return NextResponse.json({ error: e?.message || 'Failed' }, { status: 500 })
  }
}
