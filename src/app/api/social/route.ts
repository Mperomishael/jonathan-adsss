import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const social = {
    instagram: 'https://instagram.com/jonathanroumie',
    twitter: 'https://twitter.com/jonathanroumie',
    youtube: 'https://youtube.com/@jonathanroumie',
    facebook: 'https://facebook.com/jonathanroumie'
  }
  return NextResponse.json(social)
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
