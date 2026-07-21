import { NextRequest, NextResponse } from 'next/server'

// Simple rate limiting store (in production use Redis)
const requestCounts = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 100 // requests per minute
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute

// Suspicious request patterns to block
const SUSPICIOUS_PATTERNS = [
  /union|select|insert|delete|drop|exec/i,
  /\.\.\/|\.\.\\|\/etc\/|\/sys\//i,
  /<script|javascript:|onerror=|onclick=/i,
]

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    request.ip ||
    'unknown'
  )
}

function isSuspiciousRequest(request: NextRequest): boolean {
  try {
    const url = new URL(request.url)
    const pathname = url.pathname + url.search

    for (const pattern of SUSPICIOUS_PATTERNS) {
      if (pattern.test(pathname)) {
        return true
      }
    }

    const contentLength = request.headers.get('content-length')
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
      return true
    }

    return false
  } catch (e) {
    return false
  }
}

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const record = requestCounts.get(ip)

  if (!record) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return false
  }

  if (now > record.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return false
  }

  record.count++
  return record.count > RATE_LIMIT
}

export function middleware(request: NextRequest) {
  const clientIp = getClientIp(request)
  const pathname = new URL(request.url).pathname

  // Skip for static assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/static') ||
    pathname.match(/\.(jpg|jpeg|png|gif|svg|ico|webp)$/)
  ) {
    return NextResponse.next()
  }

  // Block suspicious requests
  if (isSuspiciousRequest(request)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  // Check rate limiting
  if (isRateLimited(clientIp)) {
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: { 'Retry-After': '60' },
    })
  }

  // Add security headers
  const response = NextResponse.next()

  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
