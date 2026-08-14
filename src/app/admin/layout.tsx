'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { AdminAuthProvider, useAdminAuth } from '@/components/admin/AdminAuthProvider'
import AdminSidebar from '@/components/admin/AdminSidebar'

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
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <Loader2 size={32} className="text-red-600 animate-spin mx-auto" />
          <p className="text-gray-500 text-xs tracking-[0.3em]">LOADING...</p>
        </div>
      </div>
    )
  }

  if (!user || !adminRole) return null

  return (
    <div className="min-h-screen bg-black text-white flex flex-col sm:flex-row">
      <AdminSidebar />
      <main className="flex-1 min-w-0 overflow-x-hidden pt-14 sm:pt-0">
        {children}
      </main>
    </div>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AuthGuard>{children}</AuthGuard>
    </AdminAuthProvider>
  )
}
