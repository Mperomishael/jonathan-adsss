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

const ADMIN_API_TOKEN = 'admin-session-token-v1'
const ADMIN_API_EMAIL = 'admin@admin'

export async function verifyAdminRequest(req: Request): Promise<boolean> {
  const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '').trim()
  return token === ADMIN_API_TOKEN
}

export async function getDecodedToken(req: Request): Promise<any | null> {
  const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '').trim()
  if (token !== ADMIN_API_TOKEN) return null
  return { username: 'admin', email: ADMIN_API_EMAIL }
}
