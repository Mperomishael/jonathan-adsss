import { NextResponse } from 'next/server'
import { getFanCardSettings } from '@/lib/firestore'

export const dynamic = 'force-dynamic'

function toDollars(raw: unknown, fallback: number): number {
  const n = Number(raw)
  if (!Number.isFinite(n) || n <= 0) return fallback
  if (Number.isInteger(n) && n >= 100) return Math.round(n) / 100
  return Math.round(n * 100) / 100
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const tier = (url.searchParams.get('tier') || 'regular') as 'regular' | 'gold' | 'diamond'
    const s = await getFanCardSettings()
    const raw =
      s.tiers?.[tier]?.price ??
      (tier === 'regular' ? s.price : undefined)
    const price = toDollars(
      raw,
      tier === 'gold' ? 150 : tier === 'diamond' ? 500 : 50
    )
    return NextResponse.json({
      price,
      tier,
      label: s.tiers?.[tier]?.label || tier,
    })
  } catch (error: any) {
    console.error('Failed to fetch fan card price:', error)
    return NextResponse.json({ price: 50, tier: 'regular' }, { status: 200 })
  }
}
