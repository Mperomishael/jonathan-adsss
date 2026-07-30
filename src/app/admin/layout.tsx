'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { AdminAuthProvider, useAdminAuth } from '@/components/admin/AdminAuthProvider'

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, adminRole, loading } = useAdminAuth()
  const router = useRouter()
  const pathname = usePathname()
  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    if (loading) return
    if (isLoginPage) return
    if (!user || !adminRole) {
      router.replace('/admin/login')
    }
  }, [user, adminRole, loading, isLoginPage, router])

  if (isLoginPage) return <>{children}</>

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 size={32} className="text-red-600 animate-spin mx-auto" />
          <p className="text-gray-500 text-xs tracking-[0.3em]">LOADING...</p>
        </div>
      </div>
    )
  }

  if (!user || !adminRole) return null

  return (
    <main className="min-h-screen bg-black text-white">
      {children}
    </main>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AuthGuard>{children}</AuthGuard>
    </AdminAuthProvider>
  )
}
