import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getFanCardSettings } from '@/lib/store'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export async function POST(req: NextRequest) {
  try {
    const { product } = await req.json()
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    if (product === 'fan-card') {
      const settings = getFanCardSettings()
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Jonathan Roumie Official Fan Card',
                description: 'Personalized digital fan card with PDF download. One-time purchase.',
                images: [`${baseUrl}/images/jvcd-avatar.jpg`],
              },
              unit_amount: settings.price,
            },
            quantity: 1,
          },
        ],
        success_url: `${baseUrl}/fan-card?success=1`,
        cancel_url: `${baseUrl}/fan-card?canceled=1`,
        metadata: { product: 'fan-card' },
      })
      return NextResponse.json({ url: session.url })
    }

    return NextResponse.json({ error: 'Unknown product' }, { status: 400 })
  } catch (error) {
    console.error('Stripe error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
