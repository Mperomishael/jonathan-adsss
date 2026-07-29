'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, Check, X, Clock, QrCode } from 'lucide-react'
import { useAdminAuth } from '@/components/admin/AdminAuthProvider'

interface Payment {
  id: string
  userId?: string
  email?: string
  name?: string
  amount: number
  currency: 'USDT' | 'BTC' | 'PayPal' | 'Stripe'
  status: 'pending' | 'confirmed' | 'failed'
  qrCode?: string
  transactionId?: string
  createdAt: string
  updatedAt: string
}

export default function PaymentsPage() {
  const { getToken } = useAdminAuth()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'failed'>('all')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null)
  const [txId, setTxId] = useState('')

  useEffect(() => {
    loadPayments()
  }, [getToken])

  const loadPayments = async () => {
    try {
      const token = await getToken()
      const res = await fetch('/api/admin/payments', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setPayments(data)
      }
    } catch (err) {
      console.error('Failed to load payments:', err)
      setMessage({ type: 'error', text: 'Failed to load payments' })
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmPayment = async (paymentId: string) => {
    if (!txId.trim()) {
      setMessage({ type: 'error', text: 'Transaction ID is required' })
      return
    }

    try {
      const token = await getToken()
      const res = await fetch('/api/admin/payments/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ paymentId, transactionId: txId }),
      })

      if (res.ok) {
        setPayments(
          payments.map((p) =>
            p.id === paymentId
              ? { ...p, status: 'confirmed', transactionId: txId }
              : p
          )
        )
        setMessage({ type: 'success', text: 'Payment confirmed' })
        setSelectedPayment(null)
        setTxId('')
        setTimeout(() => setMessage(null), 3000)
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to confirm payment' })
    }
  }

  const filteredPayments = payments.filter((p) => {
    if (filter === 'pending') return p.status === 'pending'
    if (filter === 'confirmed') return p.status === 'confirmed'
    if (filter === 'failed') return p.status === 'failed'
    return true
  })

  const getCurrencyIcon = (currency: string) => {
    switch (currency) {
      case 'BTC':
        return <span className="text-orange-500 font-bold">₿</span>
      case 'USDT':
        return <span className="text-green-500 font-bold">U$</span>
      case 'PayPal':
        return <span className="text-blue-500 font-bold">PP</span>
      case 'Stripe':
        return <span className="text-indigo-500 font-bold">💳</span>
      default:
        return <span>$</span>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Check size={16} className="text-green-400" />
      case 'pending':
        return <Clock size={16} className="text-yellow-400" />
      case 'failed':
        return <X size={16} className="text-red-400" />
      default:
        return null
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-white text-2xl font-black tracking-widest">PAYMENTS</h1>
        <p className="text-gray-500 text-sm mt-1">Manage and confirm payment transactions</p>
      </div>

      {/* Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-4 flex items-center gap-3 px-4 py-3 rounded-lg ${message.type === 'success'
              ? 'bg-green-900/20 border border-green-800/50 text-green-300'
              : 'bg-red-900/20 border border-red-800/50 text-red-300'
            }`}
        >
          {message.type === 'success' ? <Check size={18} /> : <X size={18} />}
          <span>{message.text}</span>
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {(['all', 'pending', 'confirmed', 'failed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${filter === f
                ? 'bg-red-600 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/5'
              }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Payments Table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white/3 border border-white/5 rounded-lg p-4 animate-pulse h-24" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPayments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <DollarSign size={32} className="mx-auto mb-2 opacity-50" />
              <p>No payments found</p>
            </div>
          ) : (
            filteredPayments.map((payment) => (
              <motion.div key={payment.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div
                  className="bg-white/3 border border-white/5 rounded-lg p-4 hover:border-white/10 transition-colors cursor-pointer"
                  onClick={() => selectedPayment === payment.id ? setSelectedPayment(null) : setSelectedPayment(payment.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-lg">
                          {getCurrencyIcon(payment.currency)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-white font-semibold">{payment.amount} {payment.currency}</p>
                            {getStatusIcon(payment.status)}
                          </div>
                          {payment.email && (
                            <p className="text-gray-300 text-xs font-mono truncate">{payment.email}</p>
                          )}
                          {payment.name && (
                            <p className="text-gray-500 text-xs">Card name: {payment.name}</p>
                          )}
                          <p className="text-gray-600 text-xs">{new Date(payment.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                      {payment.transactionId && (
                        <p className="text-gray-400 text-xs ml-14 font-mono">TX: {payment.transactionId}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-semibold ${payment.status === 'confirmed'
                            ? 'bg-green-900/30 text-green-400'
                            : payment.status === 'pending'
                              ? 'bg-yellow-900/30 text-yellow-400'
                              : 'bg-red-900/30 text-red-400'
                          }`}
                      >
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {selectedPayment === payment.id && payment.status === 'pending' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-white/10 space-y-3"
                    >
                      <p className="text-sm text-gray-400">Confirm this payment by entering the transaction ID:</p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={txId}
                          onChange={(e) => setTxId(e.target.value)}
                          placeholder="Enter transaction ID"
                          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30"
                        />
                        <button
                          onClick={() => handleConfirmPayment(payment.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                        >
                          Confirm
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Summary */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/3 border border-white/5 rounded-lg p-4">
          <p className="text-gray-400 text-xs tracking-widest mb-2">TOTAL PAYMENTS</p>
          <p className="text-white text-2xl font-black">{payments.length}</p>
        </div>
        <div className="bg-white/3 border border-white/5 rounded-lg p-4">
          <p className="text-gray-400 text-xs tracking-widest mb-2">PENDING</p>
          <p className="text-yellow-400 text-2xl font-black">{payments.filter((p) => p.status === 'pending').length}</p>
        </div>
        <div className="bg-white/3 border border-white/5 rounded-lg p-4">
          <p className="text-gray-400 text-xs tracking-widest mb-2">CONFIRMED</p>
          <p className="text-green-400 text-2xl font-black">{payments.filter((p) => p.status === 'confirmed').length}</p>
        </div>
        <div className="bg-white/3 border border-white/5 rounded-lg p-4">
          <p className="text-gray-400 text-xs tracking-widest mb-2">TOTAL VALUE</p>
          <p className="text-blue-400 text-xl font-black">${payments.reduce((sum, p) => sum + p.amount, 0)}</p>
        </div>
      </div>
    </div>
  )
}
