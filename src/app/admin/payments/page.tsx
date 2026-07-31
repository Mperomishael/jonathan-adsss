'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, Check, X, Clock, ExternalLink } from 'lucide-react'
import { useAdminAuth } from '@/components/admin/AdminAuthProvider'

interface Payment {
  id: string
  userId?: string
  email?: string
  name?: string
  amount: number
  currency: string
  status: 'pending' | 'confirmed' | 'failed'
  transactionId?: string
  proofUrl?: string
  tier?: string
  waybill?: boolean
  shippingAddress?: string
  createdAt: string
  updatedAt?: string
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadPayments = async () => {
    try {
      const token = await getToken()
      const res = await fetch('/api/admin/payments', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setPayments(Array.isArray(data) ? data : [])
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
        body: JSON.stringify({ paymentId, transactionId: txId.trim() }),
      })

      if (res.ok) {
        setPayments((prev) =>
          prev.map((p) =>
            p.id === paymentId
              ? { ...p, status: 'confirmed', transactionId: txId.trim() }
              : p
          )
        )
        setMessage({ type: 'success', text: 'Payment confirmed — user can be whitelisted' })
        setSelectedPayment(null)
        setTxId('')
        setTimeout(() => setMessage(null), 3000)
      } else {
        const err = await res.json().catch(() => ({}))
        setMessage({ type: 'error', text: err.error || 'Failed to confirm payment' })
      }
    } catch {
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
        return <span className="text-green-500 font-bold">₮</span>
      case 'Venmo':
        return <span className="text-blue-500 font-bold">V</span>
      case 'CashApp':
        return <span className="text-green-400 font-bold">$</span>
      case 'ChipperCash':
        return <span className="text-purple-400 font-bold">C</span>
      default:
        return <span className="text-gray-400">$</span>
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-white text-2xl font-black tracking-widest">PAYMENTS & PROOFS</h1>
        <p className="text-gray-500 text-sm mt-1">
          Review payment screenshots and confirm transactions
        </p>
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-4 flex items-center gap-3 px-4 py-3 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-green-900/20 border border-green-800/50 text-green-300'
              : 'bg-red-900/20 border border-red-800/50 text-red-300'
          }`}
        >
          {message.type === 'success' ? <Check size={18} /> : <X size={18} />}
          <span>{message.text}</span>
        </motion.div>
      )}

      <div className="flex flex-wrap gap-2 mb-6">
        {(['all', 'pending', 'confirmed', 'failed'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold ${
              filter === f
                ? 'bg-red-600 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/5'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white/5 rounded-lg h-24 animate-pulse" />
          ))}
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <DollarSign size={32} className="mx-auto mb-2 opacity-50" />
          <p>No payments found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPayments.map((payment) => (
            <motion.div
              key={payment.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-xl p-4"
            >
              <button
                type="button"
                className="w-full text-left"
                onClick={() =>
                  setSelectedPayment(selectedPayment === payment.id ? null : payment.id)
                }
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-black/40 rounded-lg flex items-center justify-center flex-shrink-0">
                    {getCurrencyIcon(payment.currency)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-white font-semibold">
                        ${Number(payment.amount).toFixed(2)} {payment.currency}
                      </p>
                      {payment.tier && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-300 uppercase tracking-wider">
                          {payment.tier}
                        </span>
                      )}
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          payment.status === 'confirmed'
                            ? 'bg-green-900/30 text-green-400'
                            : payment.status === 'pending'
                              ? 'bg-yellow-900/30 text-yellow-400'
                              : 'bg-red-900/30 text-red-400'
                        }`}
                      >
                        {payment.status}
                      </span>
                      {payment.proofUrl && (
                        <span className="text-[10px] text-blue-400">Has proof</span>
                      )}
                    </div>
                    {payment.email && (
                      <p className="text-gray-400 text-xs font-mono truncate mt-0.5">
                        {payment.email}
                      </p>
                    )}
                    {payment.name && (
                      <p className="text-gray-500 text-xs">Name on card: {payment.name}</p>
                    )}
                    <p className="text-gray-600 text-xs mt-1">
                      {payment.createdAt
                        ? new Date(payment.createdAt).toLocaleString()
                        : '—'}
                    </p>
                  </div>
                </div>
              </button>

              {selectedPayment === payment.id && (
                <div className="mt-4 pt-4 border-t border-white/10 space-y-4">
                  {payment.proofUrl ? (
                    <div>
                      <p className="text-gray-400 text-xs tracking-widest mb-2">PAYMENT PROOF</p>
                      <a
                        href={payment.proofUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={payment.proofUrl}
                          alt="Payment proof"
                          className="max-h-56 max-w-full rounded-lg border border-white/10 object-contain bg-black/40"
                        />
                        <span className="flex items-center gap-1 text-blue-400 text-xs mt-2">
                          <ExternalLink size={12} /> Open full size
                        </span>
                      </a>
                    </div>
                  ) : (
                    <p className="text-yellow-500/80 text-sm">No proof uploaded</p>
                  )}

                  {payment.waybill && payment.shippingAddress && (
                    <p className="text-gray-400 text-xs">
                      Shipping: <span className="text-white">{payment.shippingAddress}</span>
                    </p>
                  )}

                  {payment.transactionId && (
                    <p className="text-gray-400 text-xs font-mono">TX: {payment.transactionId}</p>
                  )}

                  {payment.status === 'pending' && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-400">
                        Confirm after verifying the proof:
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={txId}
                          onChange={(e) => setTxId(e.target.value)}
                          placeholder="Transaction / reference ID"
                          className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30"
                        />
                        <button
                          type="button"
                          onClick={() => handleConfirmPayment(payment.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                        >
                          Confirm payment
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <p className="text-gray-500 text-xs tracking-widest mb-1">TOTAL</p>
          <p className="text-white text-2xl font-black">{payments.length}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <p className="text-gray-500 text-xs tracking-widest mb-1">PENDING</p>
          <p className="text-yellow-400 text-2xl font-black">
            {payments.filter((p) => p.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <p className="text-gray-500 text-xs tracking-widest mb-1">CONFIRMED</p>
          <p className="text-green-400 text-2xl font-black">
            {payments.filter((p) => p.status === 'confirmed').length}
          </p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <p className="text-gray-500 text-xs tracking-widest mb-1">VALUE</p>
          <p className="text-blue-400 text-xl font-black">
            ${payments.reduce((sum, p) => sum + Number(p.amount || 0), 0).toFixed(0)}
          </p>
        </div>
      </div>
    </div>
  )
}
