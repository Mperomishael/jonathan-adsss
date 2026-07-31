import { NextResponse } from 'next/server'
import { getGallery } from '@/lib/firestore'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const images = await getGallery()
    return NextResponse.json(images)
  } catch (error: any) {
    console.error('Failed to fetch gallery:', error)
    return NextResponse.json([])
  }
}
