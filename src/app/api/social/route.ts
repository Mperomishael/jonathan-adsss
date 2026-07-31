import { NextResponse } from 'next/server'
import { getSiteSettings } from '@/lib/firestore'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const settings = await getSiteSettings()
    return NextResponse.json(settings.socialLinks || {
      facebook: '#',
      twitter: '#',
      instagram: '#',
      youtube: '#',
    })
  } catch (error: any) {
    console.error('Failed to fetch social links:', error)
    return NextResponse.json({
      facebook: '#',
      twitter: '#',
      instagram: '#',
      youtube: '#',
    })
  }
}
