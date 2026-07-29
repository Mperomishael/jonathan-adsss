'use client'

import { createContext, useContext, ReactNode, useState, useEffect } from 'react'
import { 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut, 
  onAuthStateChanged,
  AuthError
} from 'firebase/auth'
import { auth } from '@/lib/firebase'

// Only these emails can access admin
const ALLOWED_ADMIN_EMAILS = [
  'empiredigitalsworldwide@gmail.com',
  'jonathanroumie0512345@gmail.com'
]

// ─── Types ────────────────────────────────────────────────────────────────────
type AdminRole = 'super-admin' | 'admin' | 'moderator' | null

interface AdminAuthCtx {
  user: any
  adminRole: AdminRole
  loading: boolean
  error: string | null
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
  getToken: () => Promise<string | null>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  isAdmin: boolean
}

const Ctx = createContext<AdminAuthCtx>({
  user: null, adminRole: null, loading: false, error: null,
  loginWithGoogle: async () => {}, logout: async () => {}, clearError: () => {},
  getToken: async () => null, changePassword: async () => {}, isAdmin: false,
})

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [adminRole, setAdminRole] = useState<AdminRole>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Firebase auth state listener - simplified, no Firestore checks
  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      try {
        if (firebaseUser && firebaseUser.email) {
          console.log('[Admin Auth] User authenticated:', firebaseUser.email)
          
          // Grant immediate admin access to authenticated users
          setUser({ 
            uid: firebaseUser.uid,
            email: firebaseUser.email 
          })
          setAdminRole('super-admin')
          setError(null)
        } else {
          console.log('[Admin Auth] User signed out')
          setUser(null)
          setAdminRole(null)
          setError(null)
        }
      } catch (e: any) {
        console.error('[Admin Auth] Auth state error:', e.message)
        setError('Authentication error occurred')
      } finally {
        setLoading(false)
      }
    })

    return unsubscribe
  }, [])

  const loginWithGoogle = async () => {
    setError(null)
    try {
      if (!auth) throw new Error('Firebase not initialized')
      
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      
      if (!result.user.email || !ALLOWED_ADMIN_EMAILS.includes(result.user.email)) {
        await signOut(auth)
        setError('This Google account is not authorized to access admin')
        throw new Error('Unauthorized email')
      }
      
      console.log('[Admin Auth] Google login successful:', result.user.email)
    } catch (e: any) {
      const errorMsg = e.message || 'Google login failed'
      console.error('[Admin Auth] Google login error:', errorMsg)
      setError(errorMsg)
      throw e
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      if (auth) {
        await signOut(auth)
      }
      console.log('[Admin Auth] User logged out')
      setUser(null)
      setAdminRole(null)
      setError(null)
    } catch (e: any) {
      console.error('[Admin Auth] Logout error:', e.message)
    } finally {
      setLoading(false)
    }
  }

  const getToken = async () => {
    if (auth?.currentUser) {
      try {
        return await auth.currentUser.getIdToken()
      } catch (e) {
        console.error('[Admin Auth] Token error:', e)
        return null
      }
    }
    return null
  }

  const changePassword = async (currentPassword: string, newPassword: string) => {
    setError(null)
    try {
      if (!user?.email) {
        throw new Error('User not authenticated')
      }

      console.log('[Admin Auth] Changing password for:', user.email)
      
      const response = await fetch('/api/admin/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          currentPassword,
          newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password')
      }

      console.log('[Admin Auth] Password changed successfully')
      setError(null)
    } catch (e: any) {
      const errorMsg = e.message || 'Failed to change password'
      console.error('[Admin Auth] Password change error:', errorMsg)
      setError(errorMsg)
      throw e
    }
  }

  return (
    <Ctx.Provider value={{
      user, adminRole, loading, error,
      loginWithGoogle, logout, clearError: () => setError(null),
      getToken, changePassword, isAdmin: adminRole !== null,
    }}>
      {children}
    </Ctx.Provider>
  )
}

// Helper function to convert Firebase errors to user-friendly messages
function getFirebaseErrorMessage(error: AuthError): string {
  const code = error.code
  
  switch (code) {
    case 'auth/invalid-email':
      return 'Invalid email address'
    case 'auth/user-not-found':
      return 'Email not found'
    case 'auth/wrong-password':
      return 'Incorrect password'
    case 'auth/user-disabled':
      return 'This account has been disabled'
    case 'auth/too-many-requests':
      return 'Too many login attempts. Try again later'
    case 'auth/invalid-credential':
      return 'Invalid email or password'
    default:
      return error.message || 'Login failed'
  }
}

export const useAdminAuth = () => useContext(Ctx)
