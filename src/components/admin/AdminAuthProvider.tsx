'use client'

import { createContext, useContext, ReactNode, useState, useEffect } from 'react'

const ADMIN_STORAGE_KEY = 'adminSessionToken'
const ADMIN_TOKEN = 'admin-session-token-v1'

type AdminRole = 'super-admin' | 'admin' | 'moderator' | null

interface AdminAuthCtx {
  user: { username: string; email: string } | null
  adminRole: AdminRole
  loading: boolean
  error: string | null
  loginWithEmailPassword: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
  getToken: () => Promise<string | null>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  isAdmin: boolean
}

const Ctx = createContext<AdminAuthCtx>({
  user: null,
  adminRole: null,
  loading: false,
  error: null,
  loginWithEmailPassword: async () => {},
  logout: async () => {},
  clearError: () => {},
  getToken: async () => null,
  changePassword: async () => {},
  isAdmin: false,
})

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ username: string; email: string } | null>(null)
  const [adminRole, setAdminRole] = useState<AdminRole>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const storedToken =
      typeof window !== 'undefined' ? localStorage.getItem(ADMIN_STORAGE_KEY) : null
    if (storedToken === ADMIN_TOKEN) {
      setUser({ username: 'admin', email: 'admin@admin' })
      setAdminRole('super-admin')
      setToken(ADMIN_TOKEN)
    }
    setLoading(false)
  }, [])

  const loginWithEmailPassword = async (username: string, password: string) => {
    setError(null)

    // THIS is the line that must call /api/admin/login (not /admin/login)
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      const msg = data.error || 'Invalid credentials'
      setError(msg)
      throw new Error(msg)
    }

    setUser(data.user)
    setAdminRole(data.role || 'super-admin')
    setToken(data.token)
    if (typeof window !== 'undefined') {
      localStorage.setItem(ADMIN_STORAGE_KEY, data.token)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      if (typeof window !== 'undefined') localStorage.removeItem(ADMIN_STORAGE_KEY)
      setUser(null)
      setAdminRole(null)
      setToken(null)
      setError(null)
    } finally {
      setLoading(false)
    }
  }

  const getToken = async () => token

  const changePassword = async () => {
    throw new Error('Password change is not supported in this admin mode')
  }

  return (
    <Ctx.Provider
      value={{
        user,
        adminRole,
        loading,
        error,
        loginWithEmailPassword,
        logout,
        clearError: () => setError(null),
        getToken,
        changePassword,
        isAdmin: adminRole !== null,
      }}
    >
      {children}
    </Ctx.Provider>
  )
}

export const useAdminAuth = () => useContext(Ctx)
