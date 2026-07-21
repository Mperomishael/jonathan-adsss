import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { fanLevel, amount } = await req.json()
  return NextResponse.json({ success: true, fanLevel, amount })
}
