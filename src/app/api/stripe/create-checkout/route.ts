import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getFanCardSettings } from '@/lib/store'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getFanCardSettings } from '@/lib/firestore'

export const dynamic = 'force-dynamic'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
})

export async function POST(req: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    const { product, tier } = await req.json()
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    if (product === 'fan-card') {
      const settings = await getFanCardSettings()
      const tierKey = (tier || 'regular') as 'regular' | 'gold' | 'diamond'
      const unitAmount =
        settings.tiers?.[tierKey]?.price ?? settings.price ?? 5000

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Jonathan Roumie Official Fan Card (${tierKey})`,
                description:
                  'Personalized digital fan card with PDF download. One-time purchase.',
                images: [`${baseUrl}/images/jvcd-avatar.jpg`],
              },
              unit_amount: unitAmount, // cents
            },
            quantity: 1,
          },
        ],
        success_url: `${baseUrl}/fan-card?success=1`,
        cancel_url: `${baseUrl}/fan-card?canceled=1`,
        metadata: { product: 'fan-card', tier: tierKey },
      })
      return NextResponse.json({ url: session.url })
    }

    return NextResponse.json({ error: 'Unknown product' }, { status: 400 })
  } catch (error) {
    console.error('Stripe error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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
