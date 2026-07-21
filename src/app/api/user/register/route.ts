import { getUserByEmail, createUser, getUser } from '@/lib/firestore'
import { verifyUserToken } from '@/lib/auth-utils'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1]
    const verified = token ? await verifyUserToken(token) : null

    if (!verified) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { email, googleId } = await request.json()

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 })
    }

    // Check if user already exists
    let user = await getUserByEmail(email)
    let isNewUser = false

    if (!user) {
      // Create new user with whitelisted = false by default
      user = await createUser(email, googleId)
      isNewUser = true
    } else {
      // Update google ID if not set
      if (googleId && !user.googleId) {
        user.googleId = googleId
      }
    }

    // Initialize reward profile for new users
    if (isNewUser) {
      try {
        const rewardRes = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/user/reward-profile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ email: user.email }),
        })

        if (!rewardRes.ok) {
          console.warn('[Register] Failed to initialize reward profile:', await rewardRes.text())
          // Continue anyway - reward profile creation shouldn't block user registration
        } else {
          console.log('[Register] Reward profile created for:', user.email)
        }
      } catch (err) {
        console.warn('[Register] Reward profile creation error:', err)
        // Continue anyway
      }
    }

    return Response.json({
      id: user.id,
      email: user.email,
      whitelisted: user.whitelisted,
      fanStatus: user.fanStatus,
      paymentStatus: user.paymentStatus,
      isNewUser,
    })
  } catch (error: any) {
    console.error('Register error:', error)
    return Response.json({ error: error.message || 'Failed to register user' }, { status: 500 })
  }
}
