'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LayoutDashboard, CreditCard, Shield, Settings, Database, Image, Package, Users, Wallet, LogOut, Loader2 } from 'lucide-react'
import { useAdminAuth } from '@/components/admin/AdminAuthProvider'

const sections = [
  { href: '/admin/fan-card', label: 'Fan Card Settings', icon: CreditCard },
  { href: '/admin/wallets', label: 'Crypto Wallets', icon: Wallet },
  { href: '/admin/settings', label: 'Site Settings', icon: Settings },
  { href: '/admin/gallery', label: 'Gallery', icon: Image },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
]

export default function AdminDashboardPage() {
  const { user, logout, loading } = useAdminAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/admin/login')
    }
  }, [loading, user, router])

  const handleLogout = async () => {
    await logout()
    router.replace('/admin/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <Loader2 size={32} className="text-red-600 animate-spin mx-auto" />
          <p className="text-gray-500 text-sm tracking-[0.3em]">Loading admin...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl shadow-red-500/10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-red-400">Admin Panel</p>
              <h1 className="mt-2 text-4xl font-black">Jonathan Roumie Admin</h1>
              <p className="mt-3 text-gray-400">Settings, wallets, and pricing are grouped here for fast updates.</p>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-3 text-white font-semibold hover:bg-red-700 transition"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold text-white">Quick Access</h2>
            <div className="mt-6 grid gap-3">
              {sections.slice(0, 4).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-gray-200 transition hover:border-red-600 hover:text-white"
                >
                  <item.icon size={18} className="text-red-400" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold text-white">Settings</h2>
            <div className="mt-6 grid gap-3">
              {sections.slice(4).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-gray-200 transition hover:border-red-600 hover:text-white"
                >
                  <item.icon size={18} className="text-red-400" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl bg-black/40 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Account</p>
              <p className="mt-3 text-white font-semibold">{user?.username || 'admin'}</p>
              <p className="text-gray-400 text-sm">{user?.email || 'admin@admin'}</p>
            </div>
            <div className="rounded-3xl bg-black/40 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Credentials</p>
              <p className="mt-3 text-white font-semibold">admin</p>
              <p className="text-gray-400 text-sm">Bigadmin123</p>
            </div>
            <div className="rounded-3xl bg-black/40 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Live Updates</p>
              <p className="mt-3 text-white font-semibold">Fan card price</p>
              <p className="text-gray-400 text-sm">Crypto wallet addresses</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
