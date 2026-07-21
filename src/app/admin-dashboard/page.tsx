'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, DollarSign, CreditCard, Shield, RefreshCw, CheckCircle, Lock, Unlock, LogOut, Key } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function AdminDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  const [price, setPrice] = useState<number>(25)
  const [btcEnabled, setBtcEnabled] = useState(true)
  const [btcAddress, setBtcAddress] = useState('')
  const [usdtEnabled, setUsdtEnabled] = useState(true)
  const [usdtAddress, setUsdtAddress] = useState('')
  const [cashappEnabled, setCashappEnabled] = useState(true)
  const [cashappTag, setCashappTag] = useState('')
  
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passError, setPassError] = useState('')
  const [passSuccess, setPassSuccess] = useState('')
  const [passSaving, setPassSaving] = useState(false)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const session = localStorage.getItem('admin_session')
    if (session === 'authorized') {
      setIsAuthenticated(true)
      loadSettings()
    } else {
      setLoading(false)
    }
  }, [])

  async function loadSettings() {
    try {
      const res = await fetch('/api/admin-dashboard/settings')
      if (res.ok) {
        const data = await res.json()
        setPrice(data.price)
        if (data.paymentMethods) {
          setBtcEnabled(data.paymentMethods.btc?.enabled ?? true)
          setBtcAddress(data.paymentMethods.btc?.address ?? '')
          setUsdtEnabled(data.paymentMethods.usdt?.enabled ?? true)
          setUsdtAddress(data.paymentMethods.usdt?.address ?? '')
          setCashappEnabled(data.paymentMethods.cashapp?.enabled ?? true)
          setCashappTag(data.paymentMethods.cashapp?.tag ?? '')
        }
      }
    } catch (err) {
      console.error('Failed to load settings:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    try {
      const res = await fetch('/api/admin-dashboard/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', username, password })
      })
      if (res.ok) {
        localStorage.setItem('admin_session', 'authorized')
        setIsAuthenticated(true)
        setLoading(true)
        loadSettings()
      } else {
        const errData = await res.json()
        setLoginError(errData.error || 'Invalid credentials')
      }
    } catch (err) {
      setLoginError('Error authenticating with backend')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_session')
    setIsAuthenticated(false)
    setUsername('')
    setPassword('')
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    setSuccess(false)
    try {
      const payload = {
        price,
        paymentMethods: {
          btc: { enabled: btcEnabled, address: btcAddress },
          usdt: { enabled: usdtEnabled, address: usdtAddress },
          cashapp: { enabled: cashappEnabled, tag: cashappTag }
        }
      }
      const res = await fetch('/api/admin-dashboard/settings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer session_token_admin_authorized'
        },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (err) {
      console.error('Failed to save settings:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPassError('')
    setPassSuccess('')
    setPassSaving(true)

    try {
      const res = await fetch('/api/admin-dashboard/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer session_token_admin_authorized'
        },
        body: JSON.stringify({
          action: 'change_password',
          currentPassword,
          newPassword
        })
      })

      const data = await res.json()
      if (res.ok) {
        setPassSuccess('Password updated successfully!')
        setCurrentPassword('')
        setNewPassword('')
      } else {
        setPassError(data.error || 'Failed to update password')
      }
    } catch (err) {
      setPassError('Server connection error')
    } finally {
      setPassSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm tracking-widest">SECURE BOOT...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col justify-between">
        <Header variant="main" />
        <div className="flex-1 flex items-center justify-center px-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-2xl space-y-6"
          >
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-red-600/10 border border-red-600/30 rounded-full flex items-center justify-center mx-auto mb-2">
                <Lock className="text-red-500" size={24} />
              </div>
              <h2 className="text-2xl font-black tracking-widest">ADMIN SIGN IN</h2>
              <p className="text-xs text-gray-400">Enter secure local database credentials</p>
            </div>

            {loginError && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm text-center">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400">USERNAME</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-black border border-white/20 rounded-xl py-3 px-4 text-white focus:border-red-600 focus:outline-none transition-colors text-sm"
                  placeholder="admin"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400">PASSWORD</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black border border-white/20 rounded-xl py-3 px-4 text-white focus:border-red-600 focus:outline-none transition-colors text-sm"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-all cursor-pointer tracking-widest text-sm flex items-center justify-center gap-2"
              >
                <Unlock size={16} />
                AUTHORIZE ACCESS
              </button>
            </form>
          </motion.div>
        </div>
        <Footer variant="main" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header variant="main" />

      <main className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <h1 className="text-3xl font-black tracking-widest flex items-center gap-3">
                <Shield className="text-red-600" />
                ADMIN PANEL
              </h1>
              <p className="text-gray-400 text-sm mt-1">Manage dynamically synced database variables</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer text-sm"
              >
                {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                {saving ? 'SAVING...' : 'SAVE CHANGES'}
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer text-sm border border-white/10"
              >
                <LogOut size={16} />
                LOGOUT
              </button>
            </div>
          </div>

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-900/20 border border-green-500/30 rounded-xl p-4 flex items-center gap-3 text-green-400"
            >
              <CheckCircle size={20} />
              <span>Settings updated successfully! Changes reflect across the application in real time.</span>
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-black tracking-wide flex items-center gap-2 border-b border-white/10 pb-3 mb-6">
                  <DollarSign size={20} className="text-red-500" />
                  FAN CARD PRICING
                </h2>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400 font-bold block">Current Price (USD)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full bg-black/50 border border-white/20 rounded-xl py-3 pl-8 pr-4 text-white font-bold focus:border-red-600 focus:outline-none transition-colors"
                    />
                  </div>
                  <p className="text-xs text-gray-500">This price updates the client-side checkout price and calculations in real time.</p>
                </div>
              </div>

              <div className="border-t border-white/10 pt-6 mt-6 space-y-4">
                <h3 className="text-lg font-black tracking-wide flex items-center gap-2 text-white">
                  <Key size={18} className="text-red-500" />
                  UPDATE PASSWORD
                </h3>

                {passError && <div className="text-red-400 text-xs bg-red-900/10 p-2.5 rounded-lg border border-red-500/20">{passError}</div>}
                {passSuccess && <div className="text-green-400 text-xs bg-green-900/10 p-2.5 rounded-lg border border-green-500/20">{passSuccess}</div>}

                <form onSubmit={handleChangePassword} className="space-y-3">
                  <input
                    type="password"
                    required
                    placeholder="Current Password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-black/50 border border-white/20 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-red-600"
                  />
                  <input
                    type="password"
                    required
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-black/50 border border-white/20 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-red-600"
                  />
                  <button
                    type="submit"
                    disabled={passSaving}
                    className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-2 rounded-xl text-xs transition-colors border border-white/10"
                  >
                    {passSaving ? 'UPDATING...' : 'CONFIRM PASSWORD CHANGE'}
                  </button>
                </form>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
              <h2 className="text-xl font-black tracking-wide flex items-center gap-2 border-b border-white/10 pb-3">
                <CreditCard size={20} className="text-red-500" />
                ACTIVE PAYMENT METHODS
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">Bitcoin (BTC)</span>
                  <input
                    type="checkbox"
                    checked={btcEnabled}
                    onChange={(e) => setBtcEnabled(e.target.checked)}
                    className="accent-red-600 w-4 h-4"
                  />
                </div>
                <input
                  type="text"
                  placeholder="BTC Wallet Address"
                  value={btcAddress}
                  onChange={(e) => setBtcAddress(e.target.value)}
                  disabled={!btcEnabled}
                  className="w-full bg-black/50 border border-white/20 disabled:opacity-40 rounded-xl py-2 px-4 text-sm text-white focus:border-red-600 focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-3 border-t border-white/5 pt-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">USDT (ERC20)</span>
                  <input
                    type="checkbox"
                    checked={usdtEnabled}
                    onChange={(e) => setUsdtEnabled(e.target.checked)}
                    className="accent-red-600 w-4 h-4"
                  />
                </div>
                <input
                  type="text"
                  placeholder="USDT Wallet Address"
                  value={usdtAddress}
                  onChange={(e) => setUsdtAddress(e.target.value)}
                  disabled={!usdtEnabled}
                  className="w-full bg-black/50 border border-white/20 disabled:opacity-40 rounded-xl py-2 px-4 text-sm text-white focus:border-red-600 focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-3 border-t border-white/5 pt-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">Cash App</span>
                  <input
                    type="checkbox"
                    checked={cashappEnabled}
                    onChange={(e) => setCashappEnabled(e.target.checked)}
                    className="accent-red-600 w-4 h-4"
                  />
                </div>
                <input
                  type="text"
                  placeholder="CashTag (e.g. $MyTag)"
                  value={cashappTag}
                  onChange={(e) => setCashappTag(e.target.value)}
                  disabled={!cashappEnabled}
                  className="w-full bg-black/50 border border-white/20 disabled:opacity-40 rounded-xl py-2 px-4 text-sm text-white focus:border-red-600 focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer variant="main" />
    </div>
  )
}
