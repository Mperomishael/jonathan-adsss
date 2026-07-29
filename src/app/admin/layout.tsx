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

  // Always show login page immediately
  if (isLoginPage) return <>{children}</>

  // Show spinner while loading
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

  // Not authenticated — redirect
  if (!user || !adminRole) return null

  // Authenticated — show dashboard
  return (
    <div className="min-h-screen bg-black flex flex-col sm:flex-row">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-4 sm:p-8 mt-14 sm:mt-0">{children}</div>
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
