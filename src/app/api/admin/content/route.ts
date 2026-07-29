import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  // Get all site content
  const content = {
    hero: {
      slides: [
        { id: 1, image: '/images/hero/hero-1.jpg', title: 'JONATHAN', subtitle: 'ROUMIE' },
        { id: 2, image: '/images/hero/hero-2.jpg', title: 'ACTION', subtitle: '' },
        { id: 3, image: '/images/hero/hero-3.jpg', title: 'ADVENTURE', subtitle: '' },
      ]
    },
    welcome: {
      message: 'WELCOME TO MY OFFICIAL WEBSITE.',
      linkText: 'CLICK HERE FOR WELCOME MESSAGE',
      linkUrl: '#'
    },
    sections: {
      fanCard: {
        title: 'GET YOUR FAN CARD',
        description: 'Own an official Jonathan Roumie Fan Card. Sign in to your account or apply now.',
      },
      store: {
        title: 'JONATHAN ROUMIE STORE',
        description: 'Shop exclusive merchandise, fan cards, and VIP event passes.',
      }
    }
  }
  return NextResponse.json(content)
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    // In production, save to database
    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
