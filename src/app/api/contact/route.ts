import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Basic rate limit: track IPs in memory (use Redis/Upstash in production)
const rateLimitMap = new Map<string, { count: number; ts: number }>()
const WINDOW_MS = 60_000  // 1 minute
const MAX_REQUESTS = 3

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now - entry.ts > WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, ts: now })
    return false
  }
  if (entry.count >= MAX_REQUESTS) return true
  entry.count++
  return false
}

function sanitize(str: string): string {
  return str.replace(/<[^>]*>/g, '').trim().slice(0, 1000)
}

export async function POST(req: NextRequest) {
  // Rate limiting
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many requests. Please wait a minute.' }, { status: 429 })
  }

  let body: Record<string, string>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const name = sanitize(body.name || '')
  const email = sanitize(body.email || '')
  const company = sanitize(body.company || '')
  const telephone = sanitize(body.telephone || '')
  const message = sanitize(body.message || '')

  // Validation
  if (!name || name.length < 2) {
    return NextResponse.json({ error: 'Name is required (min 2 chars)' }, { status: 400 })
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
  }
  if (!message || message.length < 10) {
    return NextResponse.json({ error: 'Message is required (min 10 chars)' }, { status: 400 })
  }

  // TODO: swap this for your email provider (Resend, SendGrid, Nodemailer, etc.)
  // Example with Resend:
  // import { Resend } from 'resend'
  // const resend = new Resend(process.env.RESEND_API_KEY)
  // await resend.emails.send({
  //   from: 'noreply@jcvdworld.com',
  //   to: process.env.CONTACT_EMAIL!,
  //   subject: `New contact from ${name}`,
  //   text: `Name: ${name}\nEmail: ${email}\nCompany: ${company}\nPhone: ${telephone}\n\n${message}`,
  // })

  console.log('CONTACT FORM SUBMISSION:', { name, email, company, telephone, message })

  return NextResponse.json({ success: true, message: 'Message received. We will be in touch.' })
}
