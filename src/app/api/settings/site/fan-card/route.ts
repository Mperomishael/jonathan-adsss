import { NextResponse } from 'next/server'
import { getFanCardSettings } from '@/lib/firestore'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const settings = await getFanCardSettings()
    return NextResponse.json(settings)
  } catch (error: any) {
    console.error('[Public Fan Card Settings]', error)
    return NextResponse.json(
      { error: error.message || 'Failed to load fan card settings' },
      { status: 500 }
    )
  }
}
