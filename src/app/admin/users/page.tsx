'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { User, CheckCircle, XCircle, Shield, MoreVertical } from 'lucide-react'
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
        <p className="text-gray-500 text-sm mt-1">Manage user access and whitelist fan accounts</p>
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
    </div>
  )
}
