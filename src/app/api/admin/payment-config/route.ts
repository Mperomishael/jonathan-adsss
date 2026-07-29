import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  return NextResponse.json({
    fanCardAmount: 50,
  })
}

export async function POST(req: NextRequest) {
  const { fanCardAmount } = await req.json()
  return NextResponse.json({ success: true, fanCardAmount })
}
