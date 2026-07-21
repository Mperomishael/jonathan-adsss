import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  // Get user's card generation status and limits
  const status = {
    isWhitelisted: false,
    generatedCards: 0,
    cardLimit: 1,
    fanLevel: null,
    canGenerate: false,
    upgradeAvailable: true
  }
  return NextResponse.json(status)
}

export async function POST(req: NextRequest) {
  try {
    const { cardName, cardImage } = await req.json()
    
    // Generate and save card
    const card = {
      id: 'card_' + Date.now(),
      name: cardName,
      image: cardImage,
      createdAt: new Date().toISOString(),
      downloadUrl: '/api/user/card-download'
    }
    
    return NextResponse.json(card)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
