import { NextResponse } from 'next/server'
import { getFanCardSettings } from '@/lib/firestore'

export const dynamic = 'force-dynamic'

/** Admin-only price. No hardcoded fallbacks. */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const tier = (url.searchParams.get('tier') || 'regular') as 'regular' | 'gold' | 'diamond'
    const s = await getFanCardSettings()
    const raw =
      s.tiers?.[tier]?.price ??
      (tier === 'regular' ? s.price : undefined)

    if (raw === undefined || raw === null || !Number.isFinite(Number(raw))) {
      return NextResponse.json(
        { error: 'Price not configured in admin', price: null, tier },
        { status: 404 }
      )
    }

    const price = Math.round(Number(raw) * 100) / 100
    return NextResponse.json({
      price,
      tier,
      label: s.tiers?.[tier]?.label || tier,
    })
  } catch (error: any) {
    console.error('Failed to fetch fan card price:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed', price: null },
      { status: 500 }
    )
  }
}
