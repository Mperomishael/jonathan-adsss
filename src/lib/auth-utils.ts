import { adminAuth } from './firebase-admin'

// All authorized admin emails from environment variable
const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    if (!adminAuth) {
      console.error('Firebase admin auth is not initialized')
      return false
    }

    const decodedToken = await adminAuth.verifyIdToken(token)
    const email = decodedToken.email?.toLowerCase() || ''
    return ADMIN_EMAILS.includes(email)
  } catch (error) {
    console.error('Token verification failed:', error)
    return false
  }
}

export async function verifyUserToken(token: string): Promise<{ uid: string; email: string } | null> {
  try {
    if (!adminAuth) {
      console.error('Firebase admin auth is not initialized')
      return null
    }

    const decodedToken = await adminAuth.verifyIdToken(token)
    return {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
    }
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}
