import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

function initAdmin() {
  if (getApps().length > 0) return getApps()[0]

  const projectId   = process.env.FIREBASE_ADMIN_PROJECT_ID
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
  const privateKey  = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!projectId || !clientEmail || !privateKey) {
    console.error(
      '[Firebase Admin] Missing env vars:',
      !projectId   ? 'FIREBASE_ADMIN_PROJECT_ID '   : '',
      !clientEmail ? 'FIREBASE_ADMIN_CLIENT_EMAIL '  : '',
      !privateKey  ? 'FIREBASE_ADMIN_PRIVATE_KEY'    : '',
    )
    return null
  }

  try {
    return initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) })
  } catch (e: any) {
    console.error('[Firebase Admin] initializeApp failed:', e.message)
    return null
  }
}

const adminApp = initAdmin()
export const adminAuth = adminApp ? getAuth(adminApp)      : null
export const adminDb   = adminApp ? getFirestore(adminApp) : null

// Simple token verifier — just checks the token is valid Firebase ID token
// Role/permission checking is done entirely in check-role route
export async function verifyAdminRequest(req: Request): Promise<boolean> {
  if (!adminAuth) return false
  try {
    const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '').trim()
    if (!token || token === 'null') return false
    await adminAuth.verifyIdToken(token)
    return true
  } catch {
    return false
  }
}

export async function getDecodedToken(req: Request): Promise<any | null> {
  if (!adminAuth) return null
  try {
    const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '').trim()
    if (!token) return null
    return await adminAuth.verifyIdToken(token)
  } catch {
    return null
  }
}
