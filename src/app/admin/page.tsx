'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Package, Image, CreditCard, TrendingUp, Users, DollarSign, Settings, Shield, Database, Activity, BarChart3, Globe, FileText } from 'lucide-react'
import Link from 'next/link'
import { useAdminAuth } from '@/components/admin/AdminAuthProvider'

interface Stats {
  products: number
  gallery: number
  fanCardPrice: number
  totalOrders: number
  totalUsers: number
  totalPayments: number
  pendingUsers: number
  systemStatus: 'healthy' | 'warning' | 'error'
}

export default function AdminDashboardPage() {
  const { user, getToken } = useAdminAuth()
  const [stats, setStats] = useState<Stats>({
    products: 0,
    gallery: 0,
    fanCardPrice: 499,
    totalOrders: 0,
    totalUsers: 0,
    totalPayments: 0,
    pendingUsers: 0,
    systemStatus: 'healthy'
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const token = await getToken()
      const [
        prodRes,
        galRes,
        fcRes,
        usersRes,
        paymentsRes,
        ordersRes
      ] = await Promise.all([
        fetch('/api/admin/products', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/gallery', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/settings/fan-card', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/payments', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/orders', { headers: { Authorization: `Bearer ${token}` } }),
      ])

      const [products, gallery, fc, users, payments, orders] = await Promise.all([
        prodRes.json(),
        galRes.json(),
        fcRes.json(),
        usersRes.json(),
        paymentsRes.json(),
        ordersRes.json()
      ])

      const pendingUsers = users.filter((u: any) => u.fanStatus === 'pending').length

      setStats({
        products: products.length || 0,
        gallery: gallery.length || 0,
        fanCardPrice: fc.price || 499,
        totalOrders: orders.length || 0,
        totalUsers: users.length || 0,
        totalPayments: payments.length || 0,
        pendingUsers,
        systemStatus: 'healthy', // Could be enhanced with actual system checks
      })
      setLoading(false)
    }
    load()
  }, [getToken])

  const cards = [
    { label: 'Products', value: stats.products, icon: Package, color: 'text-blue-400', href: '/admin/products' },
    { label: 'Gallery Images', value: stats.gallery, icon: Image, color: 'text-purple-400', href: '/admin/gallery' },
    { label: 'Fan Card Price', value: `$${(stats.fanCardPrice / 100).toFixed(2)}`, icon: CreditCard, color: 'text-red-400', href: '/admin/fan-card' },
    { label: 'Orders', value: stats.totalOrders, icon: TrendingUp, color: 'text-green-400', href: '/admin/orders' },
    { label: 'Users', value: stats.totalUsers, icon: Users, color: 'text-cyan-400', href: '/admin/users' },
    { label: 'Payments', value: stats.totalPayments, icon: DollarSign, color: 'text-yellow-400', href: '/admin/payments' },
  ]

  const adminControls = [
    { label: 'Content Management', icon: FileText, href: '/admin/content', description: 'Edit hero, banners, sections' },
    { label: 'Site Settings', icon: Settings, href: '/admin/settings', description: 'Global site configuration' },
    { label: 'Crypto Wallets', icon: Database, href: '/admin/wallets', description: 'Manage payment addresses' },
    { label: 'System Status', icon: Shield, href: '/admin/system', description: 'Monitor system health' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2">ADMIN DASHBOARD</h1>
        <p className="text-gray-400">Welcome back, {user?.email}</p>
      </div>

      {/* System Status & Alerts */}
      <div className="mb-8 space-y-4">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
          stats.systemStatus === 'healthy' ? 'bg-green-900/30 text-green-400 border border-green-800/50' :
          stats.systemStatus === 'warning' ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-800/50' :
          'bg-red-900/30 text-red-400 border border-red-800/50'
        }`}>
          <Activity size={16} />
          System Status: {stats.systemStatus.toUpperCase()}
        </div>

        {stats.pendingUsers > 0 && (
          <div className="bg-yellow-900/30 border border-yellow-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-yellow-400">
              <BarChart3 size={16} />
              <span className="font-semibold">{stats.pendingUsers} users pending approval</span>
            </div>
            <Link href="/admin/users" className="text-yellow-300 hover:text-yellow-200 text-sm mt-1 inline-block">
              Review pending users →
            </Link>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {cards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors"
          >
            <Link href={card.href} className="block">
              <div className="flex items-center justify-between mb-4">
                <card.icon size={24} className={card.color} />
                <span className="text-2xl font-bold text-white">{card.value}</span>
              </div>
              <h3 className="text-gray-300 font-semibold">{card.label}</h3>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Admin Controls */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">ADMIN CONTROLS</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {adminControls.map((control, index) => (
            <motion.div
              key={control.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors"
            >
              <Link href={control.href} className="block">
                <div className="flex items-center gap-3 mb-2">
                  <control.icon size={20} className="text-red-400" />
                  <h3 className="text-white font-semibold">{control.label}</h3>
                </div>
                <p className="text-gray-400 text-sm">{control.description}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">QUICK ACTIONS</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/products"
            className="bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-semibold text-center transition-colors"
          >
            Add Product
          </Link>
          <Link
            href="/admin/gallery"
            className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-semibold text-center transition-colors"
          >
            Upload Image
          </Link>
          <Link
            href="/admin/users"
            className="bg-cyan-600 hover:bg-cyan-700 text-white py-3 px-4 rounded-lg font-semibold text-center transition-colors"
          >
            Manage Users
          </Link>
          <Link
            href="/admin/settings"
            className="bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-semibold text-center transition-colors"
          >
            Site Config
          </Link>
        </div>
      </div>
    </div>
  )
}
