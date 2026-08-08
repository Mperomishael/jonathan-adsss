import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST() {
  return NextResponse.json(
    {
      error:
        'Server disk upload is disabled on Vercel. Use the admin image picker — images are embedded and saved with the product.',
    },
    { status: 410 }
  )
}
