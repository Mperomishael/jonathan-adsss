import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const settings = {
    site: {
      name: 'Jonathan Roumie Official',
      tagline: 'Action. Drama. Adventure.',
      email: 'info@jonathanroumie.com',
    },
    social: {
      instagram: 'https://instagram.com',
      twitter: 'https://twitter.com',
      youtube: 'https://youtube.com',
      facebook: 'https://facebook.com',
    },
    payment: {
      fanCardPrice: 50,
      btcWallet: '1A1z7agoat2LWLCZFBX3xCjYjnAEoM81tS',
      usdtWallet: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    }
  }
  return NextResponse.json(settings)
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
