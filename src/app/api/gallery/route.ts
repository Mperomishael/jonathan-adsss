import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const images = [
    { id: 1, src: '/images/gallery/gallery-1.jpg', alt: 'Jonathan Roumie' },
    { id: 2, src: '/images/gallery/gallery-2.jpg', alt: 'Jonathan Roumie Art' },
    { id: 3, src: '/images/gallery/gallery-3.jpg', alt: 'Jonathan Roumie Gym' },
    { id: 4, src: '/images/gallery/gallery-4.jpg', alt: 'Training' },
    { id: 5, src: '/images/gallery/gallery-5.jpg', alt: 'With Fans' },
    { id: 6, src: '/images/gallery/gallery-6.jpg', alt: 'Interview' },
    { id: 7, src: '/images/gallery/gallery-7.jpg', alt: 'Collectible' },
    { id: 8, src: '/images/gallery/gallery-8.jpg', alt: 'Dramatic Pose' },
  ]
  return NextResponse.json(images)
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
