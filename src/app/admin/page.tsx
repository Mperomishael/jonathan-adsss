'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ShoppingBag,
  CreditCard,
  Users,
  Gift,
  ArrowRight,
  Clock,
  Loader2,
} from 'lucide-react'
import { useAdminAuth } from '@/components/admin/AdminAuthProvider'

interface StoreOrder {
  id: string
  productName: string
  quantity: number
  total: number
  email?: string
  userId?: string | null
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

interface PaymentRow {
  id: string
  email?: string
  amount: number
  currency: string
  status: 'pending' | 'confirmed' | 'failed'
}

interface UserRow {
  id: string
  whitelisted: boolean
  paymentStatus: string
}

export default function AdminDashboardHome() {
  const { getToken, user } = useAdminAuth()
  const [loading, setLoading] = useState(true)
  const [pendingOrders, setPendingOrders] = useState<StoreOrder[]>([])
  const [pendingPaymentsCount, setPendingPaymentsCount] = useState(0)
  const [totalUsers, setTotalUsers] = useState(0)
  const [whitelistedCount, setWhitelistedCount] = useState(0)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const token = await getToken()
        const headers = { Authorization: `Bearer ${token}` }

        const [ordersRes, paymentsRes, usersRes] = await Promise.all([
          fetch('/api/admin/store-orders?status=pending', { headers }).catch(() => null),
          fetch('/api/admin/payments', { headers }).catch(() => null),
          fetch('/api/admin/users', { headers }).catch(() => null),
        ])

        if (ordersRes?.ok) {
          const data = await ordersRes.json()
          setPendingOrders((data.orders || []).slice(0, 6))
        }

        if (paymentsRes?.ok) {
          const payments: PaymentRow[] = await paymentsRes.json()
          setPendingPaymentsCount(payments.filter((p) => p.status === 'pending').length)
        }

        if (usersRes?.ok) {
          const users: UserRow[] = await usersRes.json()
          setTotalUsers(users.length)
          setWhitelistedCount(users.filter((u) => u.whitelisted).length)
        }
      } catch (err) {
        console.error('[Admin Dashboard] load error:', err)
      } finally {
        setLoading(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const stats = [
    {
      label: 'PENDING STORE ORDERS',
      value: pendingOrders.length,
      icon: ShoppingBag,
      color: 'text-yellow-400',
      href: '/admin/store-orders',
    },
    {
      label: 'PENDING PAYMENTS',
      value: pendingPaymentsCount,
      icon: CreditCard,
      color: 'text-blue-400',
      href: '/admin/payments',
    },
    {
      label: 'WHITELISTED FANS',
      value: whitelistedCount,
      icon: Users,
      color: 'text-green-400',
      href: '/admin/users',
    },
    {
      label: 'TOTAL USERS',
      value: totalUsers,
      icon: Users,
      color: 'text-gray-300',
      href: '/admin/users',
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-white text-2xl font-black tracking-widest">DASHBOARD</h1>
        <p className="text-gray-500 text-sm mt-1">
          {user?.email ? `Welcome back, ${user.email}` : 'Overview of what needs your attention'}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 size={28} className="text-red-500 animate-spin" />
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
            {stats.map((s) => (
              <Link key={s.label} href={s.href}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/3 border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors h-full"
                >
                  <s.icon size={18} className={`${s.color} mb-3`} />
                  <p className="text-white text-2xl font-black">{s.value}</p>
                  <p className="text-gray-500 text-[10px] tracking-widest mt-1">{s.label}</p>
                </motion.div>
              </Link>
            ))}
          </div>

          {/* Pending store orders preview */}
          <div className="bg-white/3 border border-white/10 rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white text-sm font-black tracking-widest flex items-center gap-2">
                <ShoppingBag size={16} className="text-yellow-400" />
                PENDING STORE ORDERS
              </h2>
              <Link
                href="/admin/store-orders"
                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-semibold"
              >
                Review all <ArrowRight size={12} />
              </Link>
            </div>

            {pendingOrders.length === 0 ? (
              <div className="text-center py-10">
                <ShoppingBag size={28} className="text-gray-600 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No pending store orders right now</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pendingOrders.map((o) => (
                  <div
                    key={o.id}
                    className="flex items-center justify-between gap-3 bg-white/3 border border-white/5 rounded-lg px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-white text-sm font-semibold truncate">{o.productName}</p>
                      <p className="text-gray-500 text-xs truncate">
                        {o.email || o.userId || 'Guest'} · Qty {o.quantity} · $
                        {Number(o.total).toFixed(2)}
                      </p>
                    </div>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-yellow-400 bg-yellow-900/30 px-2 py-1 rounded flex-shrink-0">
                      <Clock size={10} /> PENDING
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick links */}
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/admin/users"
              className="flex items-center gap-2 bg-purple-900/20 border border-purple-800/50 text-purple-300 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-purple-900/40 transition-colors"
            >
              <Gift size={14} /> Add Points to a User
            </Link>
            <Link
              href="/admin/card-downloads"
              className="flex items-center gap-2 bg-white/5 border border-white/10 text-gray-300 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-white/10 transition-colors"
            >
              <CreditCard size={14} /> Download a Fan Card
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
