import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { to, subject, html } = await req.json()

    // In production, integrate with email service like SendGrid, Resend, etc.
    // For now, just log the email
    console.log('[EMAIL]', {
      to,
      subject,
      html,
      timestamp: new Date().toISOString(),
    })

    // TODO: Integrate with your email service
    // Example with Resend:
    // const res = await fetch('https://api.resend.com/emails', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
    //   },
    //   body: JSON.stringify({
    //     from: 'orders@jonathanroumie.com',
    //     to,
    //     subject,
    //     html,
    //   }),
    // })

    return NextResponse.json({
      success: true,
      message: 'Email queued for sending',
      to,
      subject,
    })
  } catch (error) {
    console.error('Email API error:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
