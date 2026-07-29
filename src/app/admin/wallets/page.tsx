'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Bitcoin, Save, AlertCircle, Check, Loader2, RefreshCw } from 'lucide-react'
import { useAdminAuth } from '@/components/admin/AdminAuthProvider'

interface WalletForm {
  btc: string
  usdt: string
}

export default function CryptoWalletsPage() {
  const { getToken } = useAdminAuth()
  const [form, setForm] = useState<WalletForm>({ btc: '', usdt: '' })
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const loadWallets = useCallback(async () => {
    setLoading(true)
    try {
      const token = await getToken()
      const res = await fetch('/api/admin/wallets', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed to load wallets')
      const data = await res.json()
      setForm({
        btc: data.btc?.address || '',
        usdt: data.usdt?.address || '',
      })
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to load wallet addresses' })
    } finally {
      setLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    loadWallets()
  }, [loadWallets])

  const handleSave = async () => {
    setIsSaving(true)
    setMessage(null)
    try {
      const token = await getToken()

      const saves: Promise<Response>[] = []
      if (form.btc.trim()) {
        saves.push(
          fetch('/api/admin/wallets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ type: 'BTC', address: form.btc.trim() }),
          })
        )
      }
      if (form.usdt.trim()) {
        saves.push(
          fetch('/api/admin/wallets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ type: 'USDT', address: form.usdt.trim() }),
          })
        )
      }

      const results = await Promise.all(saves)
      const failed = results.find((r) => !r.ok)
      if (failed) {
        const err = await failed.json()
        throw new Error(err.error || 'Failed to save one or more wallet addresses')
      }

      setMessage({ type: 'success', text: 'Wallet addresses saved — fans will now see these on the payment page.' })
      setTimeout(() => setMessage(null), 5000)
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save wallet addresses' })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-white text-2xl font-black tracking-widest">CRYPTO WALLETS</h1>
          <p className="text-gray-500 text-sm mt-1">Addresses fans see when paying for their fan card</p>
        </div>
        <button
          onClick={loadWallets}
          disabled={loading}
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors disabled:opacity-40"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 size={32} className="text-red-500 animate-spin mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Loading wallet addresses...</p>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/3 border border-white/5 rounded-2xl p-8 space-y-8"
          >
            {/* BTC Wallet */}
            <div>
              <label className="flex items-center gap-2 text-white font-semibold mb-2">
                <Bitcoin size={18} className="text-orange-500" />
                Bitcoin (BTC) Wallet Address
              </label>
              <p className="text-gray-400 text-sm mb-4">
                Fans choosing BTC will be shown this address. Leave blank to hide BTC as an option.
              </p>
              <input
                type="text"
                value={form.btc}
                onChange={(e) => setForm({ ...form, btc: e.target.value })}
                placeholder="bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-orange-500 transition-colors font-mono text-sm"
              />
              {form.btc && (
                <p className="mt-2 text-xs text-gray-500">{form.btc.length} characters</p>
              )}
            </div>

            {/* USDT Wallet */}
            <div>
              <label className="flex items-center gap-2 text-white font-semibold mb-2">
                <span className="w-[18px] h-[18px] rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center text-green-400 text-[10px] font-black">₮</span>
                Tether USDT Wallet Address (ERC-20)
              </label>
              <p className="text-gray-400 text-sm mb-4">
                Fans choosing USDT will send ERC-20 tokens here. Leave blank to hide USDT as an option.
              </p>
              <input
                type="text"
                value={form.usdt}
                onChange={(e) => setForm({ ...form, usdt: e.target.value })}
                placeholder="0x742d35Cc6634C0532925a3b844Bc9e7595f12345"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-green-500 transition-colors font-mono text-sm"
              />
              {form.usdt && (
                <p className="mt-2 text-xs text-gray-500">{form.usdt.length} characters</p>
              )}
            </div>

            {/* Info */}
            <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-4 flex gap-3">
              <AlertCircle size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-300">
                <p className="font-semibold mb-1">How it works:</p>
                <p>
                  Once saved, these addresses appear on the fan card payment page in real time.
                  After a fan submits their payment, confirm it under <strong>Payments</strong> to unlock their card download.
                </p>
              </div>
            </div>

            {/* Message */}
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg ${message.type === 'success'
                    ? 'bg-green-900/20 border border-green-800/50 text-green-300'
                    : 'bg-red-900/20 border border-red-800/50 text-red-300'
                  }`}
              >
                {message.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
                <span>{message.text}</span>
              </motion.div>
            )}

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={isSaving || (!form.btc.trim() && !form.usdt.trim())}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Wallet Addresses
                </>
              )}
            </button>
          </motion.div>
        </div>
      )}
    </div>
  )
}
