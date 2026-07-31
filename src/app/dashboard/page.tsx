'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { LogOut, Clock, CheckCircle, AlertCircle, Download, User, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { useUserAuth } from '@/components/user/UserAuthProvider'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

interface Transaction {
  id: string
  amount: number
  currency: string
  status: 'pending' | 'confirmed' | 'failed'
  tier?: string
  createdAt: string
}

export default function DashboardPage() {
  const { user, loading, whitelisted, fanStatus, logout, getToken } = useUserAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [txLoading, setTxLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const loadTransactions = async () => {
      try {
        const token = await getToken()
        if (!token) {
          setTxLoading(false)
          return
        }
        const res = await fetch('/api/user/transactions', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setTransactions(Array.isArray(data) ? data : [])
        } else {
          setTransactions([])
        }
      } catch (err) {
        console.error('Failed to load transactions:', err)
        setTransactions([])
      } finally {
        setTxLoading(false)
      }
    }

    loadTransactions()
  }, [user, getToken])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm tracking-widest">LOADING...</p>
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
    <div className="min-h-screen bg-black">
      <Header variant="main" />

      <main className="pt-20 sm:pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 sm:mb-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-white text-2xl sm:text-3xl font-black tracking-widest">YOUR DASHBOARD</h1>
                <p className="text-gray-400 text-sm mt-2 break-all">{user.email}</p>
              </div>
              <button
                type="button"
                onClick={logout}
                className="flex items-center justify-center gap-2 bg-red-600/20 hover:bg-red-600/40 border border-red-600/50 text-red-400 px-4 py-2 rounded-lg text-sm w-full sm:w-auto"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </motion.div>

          {/* Account status — real only */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8"
          >
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <User size={18} className="text-red-400" />
                <p className="text-gray-400 text-xs tracking-widest">STATUS</p>
              </div>
              <p className="text-white text-xl font-black">
                {fanStatus === 'approved' ? (
                  <span className="text-green-400">Approved</span>
                ) : (
                  <span className="text-yellow-400">Pending</span>
                )}
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={18} className="text-green-400" />
                <p className="text-gray-400 text-xs tracking-widest">WHITELIST</p>
              </div>
              <p className="text-white text-xl font-black">
                {whitelisted ? (
                  <span className="text-green-400">Active</span>
                ) : (
                  <span className="text-gray-400">Inactive</span>
                )}
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={18} className="text-blue-400" />
                <p className="text-gray-400 text-xs tracking-widest">PAYMENTS</p>
              </div>
              <p className="text-white text-xl font-black">{transactions.length}</p>
            </div>
          </motion.div>

          {!whitelisted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-yellow-900/20 border border-yellow-800/50 rounded-2xl p-6 sm:p-8 mb-8 text-center"
            >
              <Clock size={36} className="text-yellow-400 mx-auto mb-3" />
              <h2 className="text-white text-lg font-bold mb-2">Pending Approval</h2>
              <p className="text-yellow-300 text-sm">
                Your account is waiting for admin verification after payment.
              </p>
            </motion.div>
          )}

          {/* Fan card actions — real */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 mb-8"
          >
            <h2 className="text-white text-lg font-black tracking-widest mb-3">YOUR FAN CARD</h2>
            {whitelisted && fanStatus === 'approved' ? (
              <>
                <p className="text-gray-400 text-sm mb-5">
                  Payment verified. Create or download your official card.
                </p>
                <Link
                  href="/fan-card"
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg font-semibold text-sm"
                >
                  <Download size={18} />
                  Open Fan Card
                </Link>
              </>
            ) : (
              <>
                <p className="text-gray-400 text-sm mb-5">
                  Apply and complete payment to unlock your official fan card.
                </p>
                <Link
                  href="/fan-card"
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-lg font-semibold text-sm"
                >
                  Apply for Fan Card
                </Link>
              </>
            )}
          </motion.div>

          {/* Payments — real data only, no dummy rewards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8"
          >
            <h2 className="text-white text-lg font-black tracking-widest mb-6">YOUR PAYMENTS</h2>

            {txLoading ? (
              <div className="h-20 bg-white/5 animate-pulse rounded-lg" />
            ) : transactions.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <p className="text-sm">No payments yet</p>
                <Link href="/fan-card" className="text-red-400 text-sm underline mt-3 inline-block">
                  Go to Fan Card
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
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
                      <p className="text-white font-bold">${Number(tx.amount).toFixed(2)}</p>
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
        </div>
      </main>

      <Footer />
    </div>
  )
}
