import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { verifyAdminRequest } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export async function GET(req: NextRequest) {
  if (!await verifyAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const sessions = await stripe.checkout.sessions.list({
      limit: 100,
      expand: ['data.payment_intent'],
    })

    const orders = sessions.data
      .filter((s) => s.payment_status === 'paid')
      .map((s) => {
        const pi = s.payment_intent as Stripe.PaymentIntent | null
        return {
          id: s.id,
          amount: s.amount_total ?? 0,
          currency: s.currency ?? 'usd',
          status: pi?.status ?? s.payment_status,
          customer_email: s.customer_details?.email ?? null,
          product: s.metadata?.product ?? 'fan-card',
          created: s.created,
        }
      })

    const totalRevenue = orders.reduce((sum, o) => sum + o.amount, 0)

    return NextResponse.json({ orders, totalRevenue })
  } catch (error) {
    console.error('Stripe orders error:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}
