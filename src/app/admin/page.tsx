'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ShoppingBag,
  RefreshCw,
  Check,
  X,
  Gift,
  Clock,
  Loader2,
} from 'lucide-react'
import { useAdminAuth } from '@/components/admin/AdminAuthProvider'
import { ListSkeleton } from '@/components/ui/SkeletonLoader'

interface StoreOrder {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  total: number
  currency: string
  image?: string
  userId?: string | null
  email?: string
  name?: string
  status: 'pending' | 'approved' | 'rejected'
  pointsAwarded?: number
  createdAt: string
  updatedAt?: string
}

export default function AdminStoreOrdersPage() {
  const { getToken } = useAdminAuth()
  const [orders, setOrders] = useState<StoreOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [actionId, setActionId] = useState<string | null>(null)
  const [pointsInput, setPointsInput] = useState<Record<string, string>>({})

  const load = async () => {
    setLoading(true)
    try {
      const token = await getToken()
      const res = await fetch(`/api/admin/store-orders?status=${filter}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setOrders(data.orders || [])
      }
    } catch (e) {
      console.error(e)
      setMessage({ type: 'error', text: 'Failed to load store orders' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  const handleAction = async (orderId: string, action: 'approve' | 'reject') => {
    setActionId(orderId)
    setMessage(null)
    try {
      const token = await getToken()
      const points = action === 'approve' ? Number(pointsInput[orderId] || 0) : 0
      const res = await fetch('/api/admin/store-orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId,
          action,
          points: points > 0 ? points : undefined,
          description:
            points > 0
              ? `Reward points for approved purchase`
              : undefined,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setMessage({
          type: 'success',
          text: data.message || (action === 'approve' ? 'Order approved' : 'Order rejected'),
        })
        await load()
      } else {
        setMessage({ type: 'error', text: data.error || 'Action failed' })
      }
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'Action failed' })
    } finally {
      setActionId(null)
    }
  }

  const statusColor = (s: string) =>
    ({
      pending: 'text-yellow-400 bg-yellow-900/30',
      approved: 'text-green-400 bg-green-900/30',
      rejected: 'text-red-400 bg-red-900/30',
    }[s] || 'text-gray-400 bg-white/5')

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-white text-xl sm:text-2xl font-black tracking-widest">
            STORE ORDERS
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            Approve purchases and assign reward points
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2.5 rounded-xl text-sm transition-colors w-full sm:w-auto"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {message && (
        <div
          className={`mb-4 px-4 py-3 rounded-xl text-sm ${
            message.type === 'success'
              ? 'bg-green-900/30 text-green-400 border border-green-800/50'
              : 'bg-red-900/30 text-red-400 border border-red-800/50'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(['pending', 'approved', 'rejected', 'all'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-colors ${
              filter === f
                ? 'bg-red-600 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <ListSkeleton rows={6} />
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white/3 border border-white/10 rounded-2xl">
          <ShoppingBag size={36} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No {filter === 'all' ? '' : filter} store orders</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white/3 border border-white/10 rounded-2xl p-4 sm:p-5"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${statusColor(
                        order.status
                      )}`}
                    >
                      {order.status === 'pending' && <Clock size={10} />}
                      {order.status === 'approved' && <Check size={10} />}
                      {order.status === 'rejected' && <X size={10} />}
                      {order.status.toUpperCase()}
                    </span>
                    {order.pointsAwarded ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-900/30 text-purple-300">
                        <Gift size={10} /> +{order.pointsAwarded} pts
                      </span>
                    ) : null}
                  </div>
                  <p className="text-white font-bold text-sm sm:text-base truncate">
                    {order.productName}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    Qty {order.quantity} · ${Number(order.unitPrice).toFixed(2)} each ·{' '}
                    <span className="text-white font-semibold">${Number(order.total).toFixed(2)}</span>
                  </p>
                  <p className="text-gray-500 text-xs mt-1 truncate">
                    {order.email || order.userId || 'Guest'} ·{' '}
                    {order.createdAt ? new Date(order.createdAt).toLocaleString() : '—'}
                  </p>
                </div>

                {order.status === 'pending' && (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
                    <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2">
                      <Gift size={14} className="text-purple-400 flex-shrink-0" />
                      <input
                        type="number"
                        min={0}
                        placeholder="Points"
                        value={pointsInput[order.id] || ''}
                        onChange={(e) =>
                          setPointsInput((prev) => ({ ...prev, [order.id]: e.target.value }))
                        }
                        className="bg-transparent text-white text-sm w-20 outline-none placeholder:text-gray-600"
                      />
                    </div>
                    <button
                      disabled={actionId === order.id}
                      onClick={() => handleAction(order.id, 'approve')}
                      className="flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                    >
                      {actionId === order.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Check size={14} />
                      )}
                      Approve
                    </button>
                    <button
                      disabled={actionId === order.id}
                      onClick={() => handleAction(order.id, 'reject')}
                      className="flex items-center justify-center gap-1.5 bg-white/5 hover:bg-red-900/40 border border-white/10 text-red-400 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                    >
                      <X size={14} /> Reject
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
