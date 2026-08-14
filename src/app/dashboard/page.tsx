'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  LogOut,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  DollarSign,
  Gift,
  Star,
  ShoppingBag,
  RefreshCw,
} from 'lucide-react'
import Link from 'next/link'
import { useUserAuth } from '@/components/user/UserAuthProvider'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import SkeletonLoader, { CardGridSkeleton, ListSkeleton } from '@/components/ui/SkeletonLoader'

interface Transaction {
  id: string
  amount: number
  currency: string
  status: 'pending' | 'confirmed' | 'failed'
  tier?: string
  createdAt: string
}

interface RewardProfile {
  totalPoints: number
  totalRewards: number
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  rewards: {
    id: string
    type: string
    points: number
    description: string
    claimedAt: string
  }[]
}

interface StoreOrder {
  id: string
  productName: string
  quantity: number
  total: number
  status: string
  pointsAwarded?: number
  createdAt: string
}

const tierColor: Record<string, string> = {
  bronze: 'text-amber-600',
  silver: 'text-gray-300',
  gold: 'text-yellow-400',
  platinum: 'text-cyan-300',
}

export default function DashboardPage() {
  const { user, loading, whitelisted, fanStatus, logout, getToken } = useUserAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [reward, setReward] = useState<RewardProfile | null>(null)
  const [orders, setOrders] = useState<StoreOrder[]>([])
  const [dataLoading, setDataLoading] = useState(true)

  const loadAll = async () => {
    if (!user) return
    setDataLoading(true)
    try {
      const token = await getToken()
      if (!token) {
        setDataLoading(false)
        return
      }
      const headers = { Authorization: `Bearer ${token}` }

      const [txRes, rewardRes, ordersRes] = await Promise.all([
        fetch('/api/user/transactions', { headers }),
        fetch('/api/user/reward-profile', { headers }),
        fetch('/api/store/orders', { headers }),
      ])

      if (txRes.ok) {
        const data = await txRes.json()
        setTransactions(Array.isArray(data) ? data : [])
      }

      if (rewardRes.ok) {
        const data = await rewardRes.json()
        if (data && !data.message) setReward(data)
      } else if (rewardRes.status === 404) {
        // Auto-create empty profile
        try {
          await fetch('/api/user/reward-profile', {
            method: 'POST',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email }),
          })
          setReward({
            totalPoints: 0,
            totalRewards: 0,
            tier: 'bronze',
            rewards: [],
          })
        } catch {
          /* ignore */
        }
      }

      if (ordersRes.ok) {
        const data = await ordersRes.json()
        setOrders(data.orders || [])
      }
    } catch (err) {
      console.error('Dashboard load error:', err)
    } finally {
      setDataLoading(false)
    }
  }

  useEffect(() => {
    if (user) loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, getToken])

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Header variant="main" />
        <div className="max-w-5xl mx-auto px-4 py-10">
          <SkeletonLoader loading minDuration={2000}>
            <div />
          </SkeletonLoader>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <AlertCircle size={40} className="text-red-600 mx-auto mb-4" />
          <h1 className="text-white text-2xl font-black mb-2">Not Signed In</h1>
          <p className="text-gray-400 mb-6">Please sign in to access your dashboard.</p>
          <Link
            href="/fan-login"
            className="inline-block bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header variant="main" />

      <main className="flex-1 px-4 py-8 sm:py-12">
        <div className="max-w-5xl mx-auto">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-widest">DASHBOARD</h1>
              <p className="text-gray-400 text-sm mt-1 truncate max-w-[280px] sm:max-w-none">
                {user.email}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={loadAll}
                className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-lg text-sm"
              >
                <RefreshCw size={14} /> Refresh
              </button>
              <button
                onClick={() => logout()}
                className="flex items-center justify-center gap-2 bg-red-600/20 hover:bg-red-600/40 border border-red-600/50 text-red-400 px-4 py-2 rounded-lg text-sm"
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          </div>

          <SkeletonLoader loading={dataLoading} minDuration={2000} skeleton={<CardGridSkeleton count={4} />}>
            {/* Status + Points cards */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8"
            >
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-2">
                  <User size={16} className="text-red-400" />
                  <p className="text-gray-400 text-[10px] sm:text-xs tracking-widest">STATUS</p>
                </div>
                <p className="text-white text-lg sm:text-xl font-black">
                  {fanStatus === 'approved' ? (
                    <span className="text-green-400">Approved</span>
                  ) : (
                    <span className="text-yellow-400">Pending</span>
                  )}
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle size={16} className="text-green-400" />
                  <p className="text-gray-400 text-[10px] sm:text-xs tracking-widest">WHITELIST</p>
                </div>
                <p className="text-white text-lg sm:text-xl font-black">
                  {whitelisted ? (
                    <span className="text-green-400">Active</span>
                  ) : (
                    <span className="text-gray-400">Inactive</span>
                  )}
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-900/40 to-purple-600/10 border border-purple-500/30 rounded-xl p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Gift size={16} className="text-purple-300" />
                  <p className="text-purple-200/70 text-[10px] sm:text-xs tracking-widest">POINTS</p>
                </div>
                <p className="text-white text-lg sm:text-xl font-black">
                  {reward?.totalPoints ?? 0}
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Star size={16} className="text-yellow-400" />
                  <p className="text-gray-400 text-[10px] sm:text-xs tracking-widest">TIER</p>
                </div>
                <p
                  className={`text-lg sm:text-xl font-black capitalize ${
                    tierColor[reward?.tier || 'bronze']
                  }`}
                >
                  {reward?.tier || 'bronze'}
                </p>
              </div>
            </motion.div>

            {/* Fan card CTA */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-2xl p-5 sm:p-8 mb-6 sm:mb-8"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-white text-lg sm:text-2xl font-black mb-1">GET YOUR FAN CARD</h2>
                  <p className="text-gray-400 text-xs sm:text-sm">
                    Personalize your exclusive Jonathan Roumie Fan Card
                  </p>
                </div>
                <Link
                  href="/dashboard/card-personalize"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-bold text-sm text-center whitespace-nowrap"
                >
                  Start Now
                </Link>
              </div>
            </motion.div>

            {!whitelisted && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-yellow-900/20 border border-yellow-800/50 rounded-2xl p-5 sm:p-8 mb-6 sm:mb-8 text-center"
              >
                <Clock size={32} className="text-yellow-400 mx-auto mb-3" />
                <h2 className="text-white text-lg font-bold mb-2">Pending Approval</h2>
                <p className="text-yellow-300 text-sm mb-3">
                  Your account is awaiting admin approval.
                </p>
                <Link
                  href="/apply-card"
                  className="inline-block bg-yellow-600 hover:bg-yellow-700 text-black px-5 py-2.5 rounded-lg font-bold text-sm"
                >
                  Apply for Fan Card
                </Link>
              </motion.div>
            )}

            {/* Reward history */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-8 mb-6 sm:mb-8"
            >
              <div className="flex items-center gap-2 mb-5">
                <Gift size={18} className="text-purple-400" />
                <h2 className="text-white text-base sm:text-lg font-black tracking-widest">
                  REWARD POINTS
                </h2>
              </div>
              {!reward || !reward.rewards?.length ? (
                <p className="text-gray-500 text-sm text-center py-6">
                  No points yet. Shop the store — admin awards points when your order is approved.
                </p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {reward.rewards.slice(0, 20).map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between gap-3 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="text-white text-sm truncate">{r.description}</p>
                        <p className="text-gray-500 text-[10px]">
                          {r.claimedAt ? new Date(r.claimedAt).toLocaleString() : ''}
                        </p>
                      </div>
                      <p className="text-purple-300 font-bold text-sm whitespace-nowrap">
                        +{r.points}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Store orders */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-8 mb-6 sm:mb-8"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <ShoppingBag size={18} className="text-red-400" />
                  <h2 className="text-white text-base sm:text-lg font-black tracking-widest">
                    YOUR ORDERS
                  </h2>
                </div>
                <Link href="/store" className="text-red-400 text-xs sm:text-sm underline">
                  Shop
                </Link>
              </div>
              {orders.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-6">No store orders yet</p>
              ) : (
                <div className="space-y-2">
                  {orders.map((o) => (
                    <div
                      key={o.id}
                      className="bg-white/5 border border-white/10 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                    >
                      <div>
                        <p className="text-white font-semibold text-sm">{o.productName}</p>
                        <p className="text-gray-500 text-xs">
                          Qty {o.quantity} · {o.createdAt ? new Date(o.createdAt).toLocaleString() : ''}
                        </p>
                      </div>
                      <div className="sm:text-right">
                        <p className="text-white font-bold text-sm">${Number(o.total).toFixed(2)}</p>
                        <p
                          className={`text-xs capitalize ${
                            o.status === 'approved'
                              ? 'text-green-400'
                              : o.status === 'rejected'
                                ? 'text-red-400'
                                : 'text-yellow-400'
                          }`}
                        >
                          {o.status}
                          {o.pointsAwarded ? ` · +${o.pointsAwarded} pts` : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Payments */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-8"
            >
              <div className="flex items-center gap-2 mb-5">
                <DollarSign size={18} className="text-blue-400" />
                <h2 className="text-white text-base sm:text-lg font-black tracking-widest">
                  YOUR PAYMENTS
                </h2>
              </div>
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No payments yet</p>
                  <Link href="/fan-card" className="text-red-400 text-sm underline mt-3 inline-block">
                    Go to Fan Card
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="bg-white/5 border border-white/10 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                    >
                      <div>
                        <p className="text-white font-semibold text-sm">
                          {tx.currency}
                          {tx.tier ? ` · ${tx.tier}` : ''}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : '—'}
                        </p>
                      </div>
                      <div className="sm:text-right">
                        <p className="text-white font-bold text-sm">
                          ${Number(tx.amount).toFixed(2)}
                        </p>
                        <p
                          className={`text-xs capitalize ${
                            tx.status === 'confirmed'
                              ? 'text-green-400'
                              : tx.status === 'failed'
                                ? 'text-red-400'
                                : 'text-yellow-400'
                          }`}
                        >
                          {tx.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </SkeletonLoader>
        </div>
      </main>

      <Footer />
    </div>
  )
}
