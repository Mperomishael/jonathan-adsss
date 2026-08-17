'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { User, CheckCircle, XCircle, Gift, Loader2, X } from 'lucide-react'
import { useAdminAuth } from '@/components/admin/AdminAuthProvider'

interface UserData {
  id: string
  email: string
  whitelisted: boolean
  fanStatus: 'pending' | 'approved' | 'rejected'
  paymentStatus: 'unpaid' | 'pending' | 'confirmed'
  registeredAt: string
}

export default function UsersPage() {
  const { getToken } = useAdminAuth()
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'whitelisted' | 'pending' | 'paid'>('all')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Add-points modal state
  const [pointsModalUser, setPointsModalUser] = useState<UserData | null>(null)
  const [pointsAmount, setPointsAmount] = useState('')
  const [pointsDescription, setPointsDescription] = useState('Bonus points from admin')
  const [awarding, setAwarding] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [getToken])

  const loadUsers = async () => {
    try {
      const token = await getToken()
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setUsers(data)
      }
    } catch (err) {
      console.error('Failed to load users:', err)
      setMessage({ type: 'error', text: 'Failed to load users' })
    } finally {
      setLoading(false)
    }
  }

  const handleWhitelist = async (userId: string, whitelisted: boolean) => {
    try {
      const token = await getToken()
      const res = await fetch('/api/admin/users/whitelist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, whitelisted }),
      })

      if (res.ok) {
        setUsers(users.map((u) => (u.id === userId ? { ...u, whitelisted } : u)))
        setMessage({
          type: 'success',
          text: whitelisted ? 'User whitelisted' : 'User removed from whitelist',
        })
        setTimeout(() => setMessage(null), 3000)
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update user' })
    }
  }

  const openPointsModal = (user: UserData) => {
    setPointsModalUser(user)
    setPointsAmount('')
    setPointsDescription('Bonus points from admin')
  }

  const closePointsModal = () => {
    if (awarding) return
    setPointsModalUser(null)
  }

  const handleAwardPoints = async () => {
    if (!pointsModalUser) return
    const amount = Number(pointsAmount)
    if (!Number.isFinite(amount) || amount <= 0) {
      setMessage({ type: 'error', text: 'Enter a valid points amount greater than 0' })
      return
    }

    setAwarding(true)
    setMessage(null)
    try {
      const token = await getToken()
      const res = await fetch('/api/admin/rewards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: pointsModalUser.id,
          email: pointsModalUser.email,
          amount,
          description: pointsDescription || 'Bonus points from admin',
          // No orderId — this is a manual award, not tied to any purchase
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setMessage({
          type: 'success',
          text: `Awarded ${amount} points to ${pointsModalUser.email}`,
        })
        setPointsModalUser(null)
        setTimeout(() => setMessage(null), 4000)
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to award points' })
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to award points' })
    } finally {
      setAwarding(false)
    }
  }

  const filteredUsers = users.filter((u) => {
    if (filter === 'whitelisted') return u.whitelisted
    if (filter === 'pending') return !u.whitelisted
    if (filter === 'paid') return u.paymentStatus === 'confirmed'
    return true
  })

  const getStatusBadge = (user: UserData) => {
    if (user.whitelisted) {
      return <span className="text-xs px-2 py-1 bg-green-900/30 text-green-400 rounded-full">Whitelisted</span>
    }
    return <span className="text-xs px-2 py-1 bg-yellow-900/30 text-yellow-400 rounded-full">Pending</span>
  }

  const getPaymentBadge = (status: string) => {
    if (status === 'confirmed') {
      return <span className="text-xs px-2 py-1 bg-green-900/30 text-green-400 rounded-full">Paid</span>
    }
    if (status === 'pending') {
      return <span className="text-xs px-2 py-1 bg-blue-900/30 text-blue-400 rounded-full">Pending</span>
    }
    return <span className="text-xs px-2 py-1 bg-gray-900/30 text-gray-400 rounded-full">Unpaid</span>
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-white text-2xl font-black tracking-widest">USERS & WHITELIST</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage user access, whitelist fan accounts, and award points manually — with or without a purchase
        </p>
      </div>

      {/* Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-4 flex items-center gap-3 px-4 py-3 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-900/20 border border-green-800/50 text-green-300'
              : 'bg-red-900/20 border border-red-800/50 text-red-300'
          }`}
        >
          {message.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
          <span>{message.text}</span>
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 sm:pb-0">
        {(['all', 'whitelisted', 'pending', 'paid'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
              filter === f
                ? 'bg-red-600 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/5'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Users List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white/3 border border-white/5 rounded-lg p-4 animate-pulse h-20" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <User size={32} className="mx-auto mb-2 opacity-50" />
              <p>No users found</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/3 border border-white/5 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between hover:border-white/10 transition-colors"
              >
                <div className="flex-1 mb-3 sm:mb-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-red-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <User size={16} className="text-red-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-semibold text-sm truncate">{user.email}</p>
                      <p className="text-gray-500 text-xs">{new Date(user.registeredAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-11 flex-wrap">
                    {getStatusBadge(user)}
                    {getPaymentBadge(user.paymentStatus)}
                  </div>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => openPointsModal(user)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-purple-900/20 text-purple-300 hover:bg-purple-900/40 border border-purple-800/50"
                  >
                    <Gift size={13} />
                    Add Points
                  </button>
                  <button
                    onClick={() => handleWhitelist(user.id, !user.whitelisted)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex-1 sm:flex-none ${
                      user.whitelisted
                        ? 'bg-red-900/20 text-red-400 hover:bg-red-900/40 border border-red-800/50'
                        : 'bg-green-900/20 text-green-400 hover:bg-green-900/40 border border-green-800/50'
                    }`}
                  >
                    {user.whitelisted ? 'Remove' : 'Whitelist'}
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Summary */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        <div className="bg-white/3 border border-white/5 rounded-lg p-3 sm:p-4">
          <p className="text-gray-400 text-xs tracking-widest mb-2">TOTAL</p>
          <p className="text-white text-xl sm:text-2xl font-black">{users.length}</p>
        </div>
        <div className="bg-white/3 border border-white/5 rounded-lg p-3 sm:p-4">
          <p className="text-gray-400 text-xs tracking-widest mb-2">APPROVED</p>
          <p className="text-green-400 text-xl sm:text-2xl font-black">{users.filter((u) => u.whitelisted).length}</p>
        </div>
        <div className="bg-white/3 border border-white/5 rounded-lg p-3 sm:p-4">
          <p className="text-gray-400 text-xs tracking-widest mb-2">PENDING</p>
          <p className="text-yellow-400 text-xl sm:text-2xl font-black">{users.filter((u) => !u.whitelisted).length}</p>
        </div>
        <div className="bg-white/3 border border-white/5 rounded-lg p-3 sm:p-4">
          <p className="text-gray-400 text-xs tracking-widest mb-2">PAID</p>
          <p className="text-blue-400 text-xl sm:text-2xl font-black">{users.filter((u) => u.paymentStatus === 'confirmed').length}</p>
        </div>
      </div>

      {/* Add Points Modal */}
      {pointsModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-black tracking-widest text-sm flex items-center gap-2">
                <Gift size={16} className="text-purple-400" />
                ADD POINTS
              </h3>
              <button onClick={closePointsModal} className="text-gray-500 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <p className="text-gray-400 text-xs mb-4 truncate">
              Manually award points to <span className="text-white">{pointsModalUser.email}</span> —
              no purchase required.
            </p>

            <label className="block text-gray-400 text-xs tracking-widest mb-2">POINTS AMOUNT</label>
            <input
              type="number"
              min={1}
              autoFocus
              value={pointsAmount}
              onChange={(e) => setPointsAmount(e.target.value)}
              placeholder="e.g. 250"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-purple-500 transition mb-4"
              disabled={awarding}
            />

            <label className="block text-gray-400 text-xs tracking-widest mb-2">REASON / DESCRIPTION</label>
            <input
              type="text"
              value={pointsDescription}
              onChange={(e) => setPointsDescription(e.target.value)}
              placeholder="Bonus points from admin"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-purple-500 transition mb-6"
              disabled={awarding}
            />

            <div className="flex gap-2">
              <button
                onClick={closePointsModal}
                disabled={awarding}
                className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAwardPoints}
                disabled={awarding}
                className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {awarding ? <Loader2 size={16} className="animate-spin" /> : <Gift size={16} />}
                Award Points
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
