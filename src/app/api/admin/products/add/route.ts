import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    return NextResponse.json({ id: Date.now(), success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
