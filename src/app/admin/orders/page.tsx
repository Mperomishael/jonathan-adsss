'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingBag, CreditCard, RefreshCw } from 'lucide-react'
import { useAdminAuth } from '@/components/admin/AdminAuthProvider'

interface Order {
  id: string
  amount: number
  currency: string
  status: string
  customer_email: string | null
  product: string
  created: number
}

export default function AdminOrdersPage() {
  const { getToken } = useAdminAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [totalRevenue, setTotalRevenue] = useState(0)

  async function load() {
    setLoading(true)
    try {
      const token = await getToken()
      const res = await fetch('/api/admin/orders', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setOrders(data.orders || [])
        setTotalRevenue(data.totalRevenue || 0)
      }
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const statusColor = (s: string) => ({
    succeeded: 'text-green-400 bg-green-900/30',
    pending: 'text-yellow-400 bg-yellow-900/30',
    failed: 'text-red-400 bg-red-900/30',
  }[s] || 'text-gray-400 bg-white/5')

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-white text-2xl font-black tracking-widest">ORDERS</h1>
          <p className="text-gray-500 text-sm mt-1">Fan card purchases via Stripe</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2.5 rounded-xl text-sm transition-colors">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white/3 border border-white/5 rounded-2xl p-6">
          <ShoppingBag size={20} className="text-red-400 mb-2" />
          <p className="text-white text-2xl font-black">{orders.length}</p>
          <p className="text-gray-500 text-xs tracking-widest mt-1">TOTAL ORDERS</p>
        </div>
        <div className="bg-white/3 border border-white/5 rounded-2xl p-6">
          <CreditCard size={20} className="text-green-400 mb-2" />
          <p className="text-white text-2xl font-black">${(totalRevenue / 100).toFixed(2)}</p>
          <p className="text-gray-500 text-xs tracking-widest mt-1">TOTAL REVENUE</p>
        </div>
      </div>

      {/* Orders table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white/3 rounded-xl h-16 animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 text-gray-600">
          <ShoppingBag size={40} className="mx-auto mb-4 opacity-30" />
          <p className="tracking-widest text-sm">No orders yet</p>
        </div>
      ) : (
        <div className="bg-white/3 border border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-gray-500 text-xs tracking-widest">
                <th className="text-left px-4 py-3">ORDER ID</th>
                <th className="text-left px-4 py-3">EMAIL</th>
                <th className="text-left px-4 py-3">PRODUCT</th>
                <th className="text-left px-4 py-3">AMOUNT</th>
                <th className="text-left px-4 py-3">STATUS</th>
                <th className="text-left px-4 py-3">DATE</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-white/5 hover:bg-white/3 transition-colors"
                >
                  <td className="px-4 py-3 text-white font-mono text-xs">{order.id.slice(-8)}</td>
                  <td className="px-4 py-3 text-gray-400">{order.customer_email || '—'}</td>
                  <td className="px-4 py-3 text-gray-300">{order.product}</td>
                  <td className="px-4 py-3 text-white font-bold">
                    ${(order.amount / 100).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${statusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(order.created * 1000).toLocaleDateString()}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
