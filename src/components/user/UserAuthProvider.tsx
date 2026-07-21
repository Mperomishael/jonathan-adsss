'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react'
import { User } from 'firebase/auth'
import {
  auth,
  loginWithGoogleRedirect,
  userSignOut,
  onAuthChange,
} from '@/lib/firebase'
import { getIdToken, getUserMetadata, isUserAuthenticated } from '@/lib/firebase-auth-utils'
import { useRouter, usePathname } from 'next/navigation'

interface UserAuthCtx {
  user: User | null
  userMetadata: any | null
  loading: boolean
  whitelisted: boolean | null
  fanStatus: 'pending' | 'approved' | 'rejected' | null
  isAuthenticated: boolean
  login: () => Promise<void>
  logout: () => Promise<void>
  getToken: () => Promise<string | null>
}

const Ctx = createContext<UserAuthCtx>({} as UserAuthCtx)

export function UserAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userMetadata, setUserMetadata] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [whitelisted, setWhitelisted] = useState<boolean | null>(null)
  const [fanStatus, setFanStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null)

  const router = useRouter()
  const pathname = usePathname()
  const hasInitialized = useRef(false) // 🔥 prevents double execution

  // 🚫 Admin routes are handled entirely by AdminAuthProvider.
  // UserAuthProvider must NOT run auth logic or redirect on any /admin path.
  const isAdminRoute = pathname?.startsWith('/admin')

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }

    const unsub = onAuthChange(async (u: User | null) => {
      // 🚫 Skip ALL user auth logic when on admin routes.
      // Admins are authenticated separately via AdminAuthProvider.
      if (isAdminRoute) {
        setLoading(false)
        return
      }

      setUser(u)

      if (!u) {
        // 🔻 Logged out state
        setUserMetadata(null)
        setWhitelisted(null)
        setFanStatus(null)
        setLoading(false)
        return
      }

      // 🔥 Prevent duplicate calls (VERY IMPORTANT)
      if (hasInitialized.current) return
      hasInitialized.current = true

      try {
        setLoading(true)

        const metadata = getUserMetadata(u)
        setUserMetadata(metadata)

        const token = await getIdToken(u)
        if (!token) throw new Error('No token')

        // 🔥 SINGLE SOURCE OF TRUTH (register + fetch status)
        const res = await fetch('/api/user/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: u.email || '',
            googleId: u.uid,
          }),
        })

        if (!res.ok) throw new Error('User sync failed')

        const userData = await res.json()

        setWhitelisted(userData.whitelisted)
        setFanStatus(userData.fanStatus)

        // User is authenticated - stay on current page or redirect to dashboard based on pathname
        if (!pathname?.startsWith('/dashboard') && !pathname?.startsWith('/fan-card')) {
          router.push('/dashboard')
        }

      } catch (err) {
        console.error('[Auth Flow Error]', err)
      } finally {
        setLoading(false)
      }
    })

    return unsub
  }, [isAdminRoute])

  // 🔥 CLEAN LOGIN (no logic here)
  const login = async () => {
    await loginWithGoogleRedirect()
  }

  const logout = async () => {
    await userSignOut()
    hasInitialized.current = false
    router.push('/')
  }

  const getToken = async () => {
    if (!user) return null
    return getIdToken(user)
  }

  const isAuthenticated = isUserAuthenticated(user)

  return (
    <Ctx.Provider
      value={{
        user,
        userMetadata,
        loading,
        whitelisted,
        fanStatus,
        isAuthenticated,
        login,
        logout,
        getToken,
      }}
    >
      {children}
    </Ctx.Provider>
  )
}

export const useUserAuth = () => useContext(Ctx)
