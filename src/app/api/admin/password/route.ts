import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/firebase'
import { updatePassword, signInWithEmailAndPassword } from 'firebase/auth'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { currentPassword, newPassword, email } = await req.json()

    if (!email || !currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Email, current password, and new password are required' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters' },
        { status: 400 }
      )
    }

    if (!auth) {
      return NextResponse.json(
        { error: 'Firebase not initialized' },
        { status: 500 }
      )
    }

    console.log('[password-change] Password change attempt for:', email)

    // Re-authenticate user with current password
    try {
      console.log('[password-change] Re-authenticating user...')
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        currentPassword
      )

      if (!userCredential.user) {
        return NextResponse.json(
          { error: 'Failed to verify current password' },
          { status: 401 }
        )
      }

      // Update password
      console.log('[password-change] Updating password...')
      await updatePassword(userCredential.user, newPassword)

      console.log('[password-change] Password updated successfully')
      return NextResponse.json({
        success: true,
        message: 'Password changed successfully'
      })
    } catch (authError: any) {
      console.error('[password-change] Auth error:', authError.code)
      if (authError.code === 'auth/wrong-password') {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 401 }
        )
      }
      if (authError.code === 'auth/user-not-found') {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }
  } catch (e: any) {
    console.error('[password-change] Error:', e.message)
    return NextResponse.json(
      { error: e.message || 'Failed to change password' },
      { status: 500 }
    )
  }
}
