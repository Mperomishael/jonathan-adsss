'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { LogOut, Clock, CheckCircle, AlertCircle, Download, QrCode, User, DollarSign, CreditCard, Gift } from 'lucide-react'
import Link from 'next/link'
import { useUserAuth } from '@/components/user/UserAuthProvider'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

interface Transaction {
  id: string
  amount: number
  currency: string
  status: 'pending' | 'confirmed' | 'failed'
  qrCode?: string
  transactionId?: string
  createdAt: string
}

export default function DashboardPage() {
  const { user, loading, whitelisted, fanStatus, logout, getToken } = useUserAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [txLoading, setTxLoading] = useState(true)
  const [showQr, setShowQr] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    const loadTransactions = async () => {
      try {
        const token = await getToken()
        if (!token) return
        const res = await fetch('/api/user/transactions', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setTransactions(data)
        }
      } catch (err) {
        console.error('Failed to load transactions:', err)
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
            href="/"
            className="inline-block bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <Header variant="main" />

      <main className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-white text-3xl font-black tracking-widest">YOUR DASHBOARD</h1>
                <p className="text-gray-400 text-sm mt-2">{user.email}</p>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 bg-red-600/20 hover:bg-red-600/40 border border-red-600/50 text-red-400 px-4 py-2 rounded-lg transition-colors text-sm"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </motion.div>

          {/* Card Application Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-2xl p-8 mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-white text-2xl font-black mb-2">GET YOUR FAN CARD</h2>
                <p className="text-gray-400 text-sm">Personalize your exclusive Jonathan Roumie Fan Card</p>
              </div>
              <Link
                href="/dashboard/card-personalize"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold whitespace-nowrap transition-colors"
              >
                Start Now
              </Link>
            </div>
          </motion.div>

          {/* Status Section */}
          {!whitelisted ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-yellow-900/20 border border-yellow-800/50 rounded-2xl p-8 mb-8 text-center"
            >
              <Clock size={40} className="text-yellow-400 mx-auto mb-4" />
              <h2 className="text-white text-xl font-bold mb-2">Pending Approval</h2>
              <p className="text-yellow-300 text-sm mb-4">
                Your account is awaiting admin approval. You&apos;ll be able to access all features once approved.
              </p>
              <p className="text-yellow-400 text-xs">Please check back soon or contact support for more information.</p>
            </motion.div>
          ) : (
            <>
              {/* Status Cards */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white/3 border border-white/5 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <User size={20} className="text-red-400" />
                    <p className="text-gray-400 text-xs tracking-widest">STATUS</p>
                  </div>
                  <p className="text-white text-2xl font-black">
                    {fanStatus === 'approved' ? (
                      <span className="text-green-400">Approved</span>
                    ) : (
                      <span className="text-yellow-400">Pending</span>
                    )}
                  </p>
                </div>

                <div className="bg-white/3 border border-white/5 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle size={20} className="text-green-400" />
                    <p className="text-gray-400 text-xs tracking-widest">WHITELIST</p>
                  </div>
                  <p className="text-white text-2xl font-black">
                    {whitelisted ? (
                      <span className="text-green-400">Active</span>
                    ) : (
                      <span className="text-gray-400">Inactive</span>
                    )}
                  </p>
                </div>

                <div className="bg-white/3 border border-white/5 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <DollarSign size={20} className="text-blue-400" />
                    <p className="text-gray-400 text-xs tracking-widest">TRANSACTIONS</p>
                  </div>
                  <p className="text-white text-2xl font-black">{transactions.length}</p>
                </div>
              </motion.div>

              {/* Download Card Section */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/3 border border-white/5 rounded-2xl p-8 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white text-lg font-black tracking-widest">YOUR FAN CARD</h2>
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                    whitelisted && fanStatus === 'approved'
                      ? 'bg-green-900/30 text-green-400'
                      : 'bg-yellow-900/30 text-yellow-400'
                  }`}>
                    {whitelisted && fanStatus === 'approved' ? 'ACTIVE' : 'PENDING'}
                  </span>
                </div>
                
                {whitelisted && fanStatus === 'approved' ? (
                  <>
                    <p className="text-gray-400 text-sm mb-6">Download your personalized Jonathan Roumie fan card.</p>
                    <Link
                      href="/fan-card"
                      className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                    >
                      <Download size={18} />
                      Create & Download Card
                    </Link>
                  </>
                ) : (
                  <>
                    <p className="text-yellow-300 text-sm mb-6">Your account is pending approval. Once verified by our admin, you'll be able to create and download your card.</p>
                    <div className="flex items-center gap-2 text-yellow-400 text-sm">
                      <Clock size={16} />
                      Estimated processing time: 24-48 hours
                    </div>
                  </>
                )}
              </motion.div>

              {/* Upgrade Membership Section */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-red-900/20 to-purple-900/20 border border-red-800/30 rounded-2xl p-8">
                <h2 className="text-white text-lg font-black tracking-widest mb-4">UPGRADE MEMBERSHIP</h2>
                <p className="text-gray-400 text-sm mb-6">Unlock premium features and exclusive benefits.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white text-sm font-semibold">Multiple Cards</p>
                      <p className="text-gray-500 text-xs">Create more than one card</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white text-sm font-semibold">Premium Designs</p>
                      <p className="text-gray-500 text-xs">Access exclusive card templates</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white text-sm font-semibold">Priority Support</p>
                      <p className="text-gray-500 text-xs">Get help faster from our team</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white text-sm font-semibold">VIP Badge</p>
                      <p className="text-gray-500 text-xs">Display on your public profile</p>
                    </div>
                  </div>
                </div>
                <Link
                  href="/checkout"
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  <DollarSign size={18} />
                  Upgrade Now
                </Link>
              </motion.div>

              {/* Reward Activity */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/3 border border-white/5 rounded-2xl p-8 mb-8">
                <h2 className="text-white text-lg font-black tracking-widest mb-6">REWARD ACTIVITY</h2>

                {txLoading ? (
                  <div className="space-y-3">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="bg-white/3 rounded-lg h-20 animate-pulse" />
                    ))}
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Gift size={32} className="mx-auto mb-2 opacity-50" />
                    <p>No reward activity yet</p>
                    <p className="text-gray-400 text-sm">Make a purchase or complete a review to earn points.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions.map((tx) => (
                      <motion.div key={tx.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-white/20 transition-colors">
                        <div className="flex items-center justify-between gap-4 mb-3">
                          <div>
                            <p className="text-white font-semibold text-sm">Fan Card Payment</p>
                            <p className="text-gray-400 text-xs">{tx.currency} payment received</p>
                          </div>
                          <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                            tx.status === 'confirmed'
                              ? 'bg-green-900/30 text-green-400'
                              : tx.status === 'pending'
                                ? 'bg-yellow-900/30 text-yellow-400'
                                : 'bg-red-900/30 text-red-400'
                          }`}>
                            {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-gray-300 text-sm">{new Date(tx.createdAt).toLocaleDateString()}</p>
                          <p className="text-green-400 font-bold">{tx.status === 'confirmed' ? '+50 pts' : '+0 pts'}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Transactions */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/3 border border-white/5 rounded-2xl p-8">
                <h2 className="text-white text-lg font-black tracking-widest mb-6">TRANSACTION HISTORY</h2>

                {txLoading ? (
                  <div className="space-y-3">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="bg-white/3 rounded-lg h-20 animate-pulse" />
                    ))}
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <QrCode size={32} className="mx-auto mb-2 opacity-50" />
                    <p>No transactions yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions.map((tx) => (
                      <motion.div key={tx.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-white/20 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-sm font-bold">
                                {tx.currency === 'BTC' ? '₿' : tx.currency === 'USDT' ? 'U$' : '$'}
                              </div>
                              <div>
                                <p className="text-white font-semibold text-sm">{tx.amount} {tx.currency}</p>
                                <p className="text-gray-500 text-xs">{new Date(tx.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs px-3 py-1 rounded-full font-semibold ${
                                tx.status === 'confirmed'
                                  ? 'bg-green-900/30 text-green-400'
                                  : tx.status === 'pending'
                                    ? 'bg-yellow-900/30 text-yellow-400'
                                    : 'bg-red-900/30 text-red-400'
                              }`}
                            >
                              {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                            </span>
                            {tx.qrCode && (
                              <button
                                onClick={() => setShowQr(tx.id)}
                                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                                title="Show QR Code"
                              >
                                <QrCode size={16} className="text-gray-400" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* QR Code Modal */}
                        {showQr === tx.id && tx.qrCode && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 pt-3 border-t border-white/10"
                          >
                            <div className="bg-white/5 rounded-lg p-4 text-center">
                              <img src={tx.qrCode} alt="QR Code" className="w-40 h-40 mx-auto" />
                              {tx.transactionId && <p className="text-gray-400 text-xs mt-2 font-mono">TX: {tx.transactionId}</p>}
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </>
          )}
        </div>
      </main>

      <Footer variant="main" />
    </div>
  )
}
