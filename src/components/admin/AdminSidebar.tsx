'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, Image, CreditCard, Settings, LogOut, Shield, Menu, X } from 'lucide-react'
import { useAdminAuth } from './AdminAuthProvider'

const nav = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/gallery', label: 'Gallery', icon: Image },
  { href: '/admin/fan-card', label: 'Fan Card', icon: CreditCard },
  { href: '/admin/users', label: 'Users & Whitelist', icon: Shield },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard },
  { href: '/admin/wallets', label: 'Crypto Wallets', icon: Package },
  { href: '/admin/rewards', label: 'Rewards', icon: Package },
  { href: '/admin/admins', label: 'Admin Users', icon: Shield },
  { href: '/admin/catalog', label: 'Catalog Content', icon: Image },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAdminAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-4 sm:p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-jcvd-red rounded-lg flex items-center justify-center flex-shrink-0">
            <Shield size={16} className="text-white" />
          </div>
          <div>
            <p className="text-white font-black text-sm tracking-widest">JR</p>
            <p className="text-jcvd-gray text-[10px] tracking-widest">ADMIN PANEL</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 sm:p-4 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 sm:py-2.5 rounded-lg transition-colors text-sm ${
                active
                  ? 'bg-jcvd-red/10 text-jcvd-red border border-jcvd-red/20'
                  : 'text-jcvd-gray hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={16} className="flex-shrink-0" />
              <span className="tracking-wide hidden sm:inline">{label}</span>
              <span className="tracking-wide sm:hidden text-xs">{label.split(' ')[0]}</span>
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="p-3 sm:p-4 border-t border-white/5 space-y-3">
        {user && (
          <div className="px-3 hidden sm:block">
            <p className="text-white text-xs font-medium truncate">{user.email}</p>
            <p className="text-jcvd-gray text-[10px] mt-1">Admin Account</p>
          </div>
        )}
        <button
          onClick={() => {
            logout()
            setMobileOpen(false)
          }}
          className="flex items-center gap-3 px-3 py-2 sm:py-2.5 rounded-lg text-jcvd-gray hover:text-white hover:bg-white/5 transition-colors text-sm w-full"
        >
          <LogOut size={16} className="flex-shrink-0" />
          <span className="tracking-wide hidden sm:inline">Sign Out</span>
          <span className="tracking-wide sm:hidden text-xs">Logout</span>
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile menu button */}
      <div className="sm:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-jcvd-red/10 text-jcvd-red border border-jcvd-red/20 hover:bg-jcvd-red/20 transition-colors"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="sm:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop sidebar */}
      <aside className="hidden sm:flex w-64 min-h-screen bg-[#0a0a0a] border-r border-white/5 flex-col">
      <SidebarContent />
      </aside>

      {/* Mobile sidebar drawer */}
      <aside
        className={`sm:hidden fixed top-0 left-0 h-screen w-64 bg-[#0a0a0a] border-r border-white/5 flex flex-col z-40 transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </aside>
    </>
  )
}
