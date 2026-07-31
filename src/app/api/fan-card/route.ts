import { NextResponse } from 'next/server'
import { getFanCardSettings } from '@/lib/firestore'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const settings = await getFanCardSettings()
    return NextResponse.json(settings)
  } catch (error: any) {
    console.error('Failed to fetch fan card settings:', error)
    return NextResponse.json({
      price: 5000,
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
      accentColor: '#FF0000',
      logoUrl: '/images/jvcd-avatar.jpg',
      footerText: 'OFFICIAL JONATHAN ROUMIE WORLD FAN CARD',
      antiScreenshot: true,
    })
  }
}
