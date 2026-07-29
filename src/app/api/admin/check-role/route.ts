import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    // Extract email from query params
    const email = (req.nextUrl.searchParams.get('email') || '').trim().toLowerCase()
    
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    console.log('[check-role] Verifying admin role for:', email)

    // Check Firestore admins collection
    if (!adminDb) {
      console.warn('[check-role] Firestore admin not initialized')
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 })
    }

    const adminDocRef = adminDb.collection('admins').doc(email)
    const adminDoc = await adminDocRef.get()

    if (adminDoc.exists) {
      const data = adminDoc.data()
      if (!data) {
        console.warn('[check-role] Admin document exists but has no data:', email)
        return NextResponse.json(
          { error: 'Admin data corrupted', authorized: false },
          { status: 403 }
        )
      }
      const role = data.role || 'admin'
      console.log('[check-role] Admin verified with role:', role)
      return NextResponse.json({ 
        role, 
        email,
        authorized: true,
        verified: data.verified !== false
      })
    }

    // Email not in admins collection
    console.warn('[check-role] Email not found in admins collection:', email)
    return NextResponse.json(
      { error: 'Email not authorized for admin access', authorized: false },
      { status: 403 }
    )
  } catch (e: any) {
    console.error('[check-role] Error:', e.message)
    return NextResponse.json({ error: 'Server error', details: e.message }, { status: 500 })
  }
}
