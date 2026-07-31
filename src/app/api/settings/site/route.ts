import { NextResponse } from 'next/server'
import { getSiteSettings } from '@/lib/firestore'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const settings = await getSiteSettings()
    return NextResponse.json(settings)
  } catch (error: any) {
    console.error('Failed to fetch site settings:', error)
    return NextResponse.json({
      announcementBar: 'Officially Licensed Jonathan Roumie Merchandise',
      contactEmail: 'contact@jonathanroumieworld.com',
      socialLinks: { facebook: '#', twitter: '#', instagram: '#', youtube: '#' },
      whatsappNumber: '',
      cashappHandle: '',
      venmoHandle: '',
    })
  }
}
