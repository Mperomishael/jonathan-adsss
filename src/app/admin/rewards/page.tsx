'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Gift, Send, AlertCircle, Check, Loader2 } from 'lucide-react'
import { useAdminAuth } from '@/components/admin/AdminAuthProvider'

interface RewardRequest {
  userId: string
  email: string
  amount: number
  description: string
}

export default function RewardsPage() {
  const { getToken, adminRole } = useAdminAuth()
  const [form, setForm] = useState<RewardRequest>({ userId: '', email: '', amount: 100, description: 'Bonus reward' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [history, setHistory] = useState<any[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)

  // Load reward history
  useEffect(() => {
    loadRewardHistory()
  }, [])

  const loadRewardHistory = async () => {
    try {
      const token = await getToken()
      const res = await fetch('/api/admin/rewards', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setHistory(data.rewards || [])
      }
    } catch (err) {
      console.error('[v0] Failed to load reward history:', err)
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.userId && !form.email) {
      setMessage({ type: 'error', text: 'Please enter a User ID or Email' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const token = await getToken()
      const res = await fetch('/api/admin/rewards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        setMessage({ type: 'success', text: 'Reward initiated successfully!' })
        setForm({ userId: '', email: '', amount: 100, description: 'Bonus reward' })
        setTimeout(() => {
          loadRewardHistory()
          setMessage(null)
        }, 1500)
      } else {
        const err = await res.json()
        setMessage({ type: 'error', text: err.error || 'Failed to initiate reward' })
      }
    } catch (err: any) {
      console.error('[v0] Reward error:', err)
      setMessage({ type: 'error', text: err.message || 'An error occurred' })
    } finally {
      setLoading(false)
    }
  }

  if (adminRole !== 'super-admin') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Gift size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400">Only super admins can manage rewards.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2">REWARDS SYSTEM</h1>
        <p className="text-gray-400">Initiate bonus rewards and bonuses for users</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/3 border border-white/10 rounded-2xl p-8"
        >
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Gift size={24} className="text-red-500" />
            Initiate Reward
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* User Identifier */}
            <div>
              <label className="block text-gray-400 text-xs tracking-widest mb-2">User ID or Email</label>
              <div className="space-y-2">
                <input
                  type="text"
                  value={form.userId}
                  onChange={(e) => setForm({ ...form, userId: e.target.value })}
                  placeholder="User ID"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-red-500 transition"
                  disabled={loading}
                />
                <div className="text-center text-gray-500 text-xs">OR</div>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="user@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-red-500 transition"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-gray-400 text-xs tracking-widest mb-2">Reward Amount (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
                  placeholder="100.00"
                  min="0.01"
                  step="0.01"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 pl-7 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-red-500 transition"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-gray-400 text-xs tracking-widest mb-2">Description</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Bonus reward"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-red-500 transition"
                disabled={loading}
              />
            </div>

            {/* Message */}
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                  message.type === 'success'
                    ? 'bg-green-900/20 border border-green-800/50 text-green-300'
                    : 'bg-red-900/20 border border-red-800/50 text-red-300'
                }`}
              >
                {message.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
                <span className="text-sm">{message.text}</span>
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Send Reward
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* History Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/3 border border-white/10 rounded-2xl p-8"
        >
          <h2 className="text-xl font-bold text-white mb-6">Recent Rewards</h2>

          {historyLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-gray-400" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12">
              <Gift size={32} className="text-gray-600 mx-auto mb-2" />
              <p className="text-gray-400">No rewards initiated yet</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {history.map((reward, idx) => (
                <div
                  key={idx}
                  className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-white font-semibold text-sm">{reward.email || reward.userId}</p>
                    <p className="text-green-400 font-bold text-sm">${reward.amount}</p>
                  </div>
                  <p className="text-gray-400 text-xs">{reward.description}</p>
                  <p className="text-gray-500 text-xs">
                    {reward.createdAt ? new Date(reward.createdAt).toLocaleString() : 'Just now'}
                  </p>
                  {reward.status && (
                    <div className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      reward.status === 'completed' 
                        ? 'bg-green-900/30 text-green-400' 
                        : reward.status === 'pending'
                        ? 'bg-yellow-900/30 text-yellow-400'
                        : 'bg-red-900/30 text-red-400'
                    }`}>
                      {reward.status}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
