'use client'

import { useEffect, useState } from 'react'
import { Save, Eye, EyeOff, AlertCircle, Check, Loader2 } from 'lucide-react'
import { useAdminAuth } from '@/components/admin/AdminAuthProvider'
import type { SiteSettings } from '@/lib/firestore'

const DEFAULTS: SiteSettings = {
  announcementBar: 'Officially Licensed Jean-Claude Van Damme Merchandise',
  contactEmail: 'contact@jcvdworld.com',
  socialLinks: { facebook: '#', twitter: '#', instagram: '#', youtube: '#' },
  whatsappNumber: '',
  cashappHandle: '',
  venmoHandle: '',
}

export default function AdminSettingsPage() {
  const { getToken, user, changePassword, error: authError, clearError } = useAdminAuth()
  const [settings, setSettings] = useState<SiteSettings>(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [paymentConfig, setPaymentConfig] = useState<any>(null)
  const [savingPayments, setSavingPayments] = useState(false)
  
  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function hdr() {
    const t = await getToken()
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` }
  }

  useEffect(() => {
    async function load() {
      const h = await hdr()
      const res = await fetch('/api/admin/settings/site', { headers: h })
      if (res.ok) setSettings(await res.json())
      // load payment config too
      const payRes = await fetch('/api/admin/payment-config', { headers: h })
      if (payRes.ok) setPaymentConfig(await payRes.json())
      setLoading(false)
    }
    load()
  }, [])

  async function save() {
    setSaving(true)
    const h = await hdr()
    await fetch('/api/admin/settings/site', { method: 'PUT', headers: h, body: JSON.stringify(settings) })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordMessage(null)

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Passwords do not match' })
      return
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters' })
      return
    }

    setPasswordLoading(true)
    try {
      await changePassword(currentPassword, newPassword)
      setPasswordMessage({ type: 'success', text: 'Password changed successfully' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setShowPasswordForm(false), 2000)
    } catch (e: any) {
      setPasswordMessage({ type: 'error', text: e.message || 'Failed to change password' })
    } finally {
      setPasswordLoading(false)
    }
  }

  if (loading) return <div className="text-gray-500 text-sm">Loading...</div>

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-white text-2xl font-black tracking-widest">SITE SETTING</h1>
        <p className="text-gray-500 text-sm mt-1">General configuration for the Jonathan Roumie website</p>
      </div>

      <div className="space-y-6">
        {/* General */}
        <section className="bg-white/3 border border-white/5 rounded-2xl p-6 space-y-4">
          <h2 className="text-white text-sm font-bold tracking-widest border-b border-white/5 pb-3">GENERAL</h2>

          <div>
            <label className="text-gray-400 text-xs tracking-widest block mb-2">ANNOUNCEMENT BAR TEXT</label>
            <input type="text" value={settings.announcementBar}
              onChange={(e) => setSettings({ ...settings, announcementBar: e.target.value })}
              className="w-full bg-white/5 border border-white/10 text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-red-500 transition-colors" />
          </div>

          <div>
            <label className="text-gray-400 text-xs tracking-widest block mb-2">CONTACT EMAIL</label>
            <input type="email" value={settings.contactEmail}
              onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
              className="w-full bg-white/5 border border-white/10 text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-red-500 transition-colors" />
          </div>

          <div>
            <label className="text-gray-400 text-xs tracking-widest block mb-2">AGENT WHATSAPP NUMBER (CHAT SUPPORT)</label>
            <input
              type="text"
              value={settings.whatsappNumber || ''}
              onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
              placeholder="e.g. 15551234567 (country code, no + or spaces)"
              className="w-full bg-white/5 border border-white/10 text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-red-500 transition-colors"
            />
            <p className="text-gray-500 text-xs mt-1">
              Used by the floating chat button. Digits only with country code (e.g. 2348012345678). Leave empty to keep in-app chat only.
            </p>
          </div>
        </section>

          {/* Payment Methods */}
          <section className="bg-white/3 border border-white/5 rounded-2xl p-6 space-y-4">
            <h2 className="text-white text-sm font-bold tracking-widest border-b border-white/5 pb-3">PAYMENT METHODS</h2>
            {!paymentConfig ? (
              <p className="text-gray-400 text-sm">Loading payment configuration...</p>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-xs tracking-widest block mb-2">PayPal Client ID</label>
                    <input value={paymentConfig.paypal?.clientId || ''}
                      onChange={(e) => setPaymentConfig({ ...paymentConfig, paypal: { ...(paymentConfig.paypal || {}), clientId: e.target.value } })}
                      className="w-full bg-white/5 border border-white/10 text-white px-3 py-2.5 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs tracking-widest block mb-2">Enable PayPal</label>
                    <input type="checkbox" checked={!!paymentConfig.paypal?.enabled}
                      onChange={(e) => setPaymentConfig({ ...paymentConfig, paypal: { ...(paymentConfig.paypal || {}), enabled: e.target.checked } })} />
                  </div>

                  <div>
                    <label className="text-gray-400 text-xs tracking-widest block mb-2">Stripe Publishable Key</label>
                    <input value={paymentConfig.stripe?.publishableKey || ''}
                      onChange={(e) => setPaymentConfig({ ...paymentConfig, stripe: { ...(paymentConfig.stripe || {}), publishableKey: e.target.value } })}
                      className="w-full bg-white/5 border border-white/10 text-white px-3 py-2.5 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs tracking-widest block mb-2">Enable Stripe</label>
                    <input type="checkbox" checked={!!paymentConfig.stripe?.enabled}
                      onChange={(e) => setPaymentConfig({ ...paymentConfig, stripe: { ...(paymentConfig.stripe || {}), enabled: e.target.checked } })} />
                  </div>

                  <div>
                    <label className="text-gray-400 text-xs tracking-widest block mb-2">Cash App Handle</label>
                    <input value={paymentConfig.cashapp?.handle || ''}
                      onChange={(e) => setPaymentConfig({ ...paymentConfig, cashapp: { ...(paymentConfig.cashapp || {}), handle: e.target.value } })}
                      className="w-full bg-white/5 border border-white/10 text-white px-3 py-2.5 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs tracking-widest block mb-2">Enable Cash App</label>
                    <input type="checkbox" checked={!!paymentConfig.cashapp?.enabled}
                      onChange={(e) => setPaymentConfig({ ...paymentConfig, cashapp: { ...(paymentConfig.cashapp || {}), enabled: e.target.checked } })} />
                  </div>

                  <div>
                    <label className="text-gray-400 text-xs tracking-widest block mb-2">Venmo Handle</label>
                    <input value={paymentConfig.venmo?.handle || ''}
                      onChange={(e) => setPaymentConfig({ ...paymentConfig, venmo: { ...(paymentConfig.venmo || {}), handle: e.target.value } })}
                      className="w-full bg-white/5 border border-white/10 text-white px-3 py-2.5 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs tracking-widest block mb-2">Enable Venmo</label>
                    <input type="checkbox" checked={!!paymentConfig.venmo?.enabled}
                      onChange={(e) => setPaymentConfig({ ...paymentConfig, venmo: { ...(paymentConfig.venmo || {}), enabled: e.target.checked } })} />
                  </div>

                  <div>
                    <label className="text-gray-400 text-xs tracking-widest block mb-2">Chipper Cash Handle</label>
                    <input value={paymentConfig.chipperCash?.handle || ''}
                      onChange={(e) => setPaymentConfig({ ...paymentConfig, chipperCash: { ...(paymentConfig.chipperCash || {}), handle: e.target.value } })}
                      className="w-full bg-white/5 border border-white/10 text-white px-3 py-2.5 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs tracking-widest block mb-2">Enable Chipper Cash</label>
                    <input type="checkbox" checked={!!paymentConfig.chipperCash?.enabled}
                      onChange={(e) => setPaymentConfig({ ...paymentConfig, chipperCash: { ...(paymentConfig.chipperCash || {}), enabled: e.target.checked } })} />
                  </div>

                  <div>
                    <label className="text-gray-400 text-xs tracking-widest block mb-2">Enable BTC</label>
                    <input type="checkbox" checked={!!paymentConfig.crypto?.btc?.enabled}
                      onChange={(e) => setPaymentConfig({ ...paymentConfig, crypto: { ...(paymentConfig.crypto || {}), btc: { ...(paymentConfig.crypto?.btc || {}), enabled: e.target.checked } } })} />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs tracking-widest block mb-2">Enable USDT</label>
                    <input type="checkbox" checked={!!paymentConfig.crypto?.usdt?.enabled}
                      onChange={(e) => setPaymentConfig({ ...paymentConfig, crypto: { ...(paymentConfig.crypto || {}), usdt: { ...(paymentConfig.crypto?.usdt || {}), enabled: e.target.checked } } })} />
                  </div>
                </div>

                <div className="pt-3">
                  <button onClick={async () => {
                    setSavingPayments(true)
                    const h = await hdr()
                    await fetch('/api/admin/payment-config', { method: 'PUT', headers: h, body: JSON.stringify(paymentConfig) })
                    setSavingPayments(false)
                  }}
                    disabled={savingPayments}
                    className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-xl text-sm font-bold tracking-wide hover:bg-purple-700 transition-colors disabled:opacity-50">
                    {savingPayments ? 'Saving...' : 'Save Payment Methods'}
                  </button>
                </div>
              </div>
            )}
          </section>

        {/* Social links */}
        <section className="bg-white/3 border border-white/5 rounded-2xl p-6 space-y-4">
          <h2 className="text-white text-sm font-bold tracking-widest border-b border-white/5 pb-3">SOCIAL LINKS</h2>
          {(['facebook', 'twitter', 'instagram', 'youtube'] as const).map((platform) => (
            <div key={platform}>
              <label className="text-gray-400 text-xs tracking-widest block mb-2">{platform.toUpperCase()}</label>
              <input type="url" value={settings.socialLinks[platform]}
                onChange={(e) => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, [platform]: e.target.value } })}
                placeholder={`https://${platform}.com/jcvdworld`}
                className="w-full bg-white/5 border border-white/10 text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-red-500 transition-colors" />
            </div>
          ))}
        </section>

        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl text-sm font-bold tracking-wide hover:bg-red-700 transition-colors disabled:opacity-50">
          <Save size={16} />
          {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save Settings'}
        </button>

        {/* Password Management */}
        <section className="bg-white/3 border border-white/5 rounded-2xl p-6 space-y-4 mt-8">
          <h2 className="text-white text-sm font-bold tracking-widest border-b border-white/5 pb-3">ACCOUNT SECURITY</h2>
          
          {user && (
            <div className="mb-4">
              <p className="text-gray-400 text-xs">Current Account</p>
              <p className="text-white text-sm font-medium">{user.email}</p>
            </div>
          )}

          {!showPasswordForm ? (
            <button
              onClick={() => setShowPasswordForm(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold tracking-wide hover:bg-blue-700 transition-colors"
            >
              Change Password
            </button>
          ) : (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              {passwordMessage && (
                <div className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                  passwordMessage.type === 'success'
                    ? 'bg-green-900/20 border border-green-800/50 text-green-300'
                    : 'bg-red-900/20 border border-red-800/50 text-red-300'
                }`}>
                  {passwordMessage.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                  <span className="text-sm">{passwordMessage.text}</span>
                </div>
              )}

              <div>
                <label className="text-gray-400 text-xs tracking-widest block mb-2">CURRENT PASSWORD</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white px-3 py-2.5 pr-10 rounded-lg text-sm focus:outline-none focus:border-red-500 transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    tabIndex={-1}
                  >
                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-gray-400 text-xs tracking-widest block mb-2">NEW PASSWORD</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white px-3 py-2.5 pr-10 rounded-lg text-sm focus:outline-none focus:border-red-500 transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    tabIndex={-1}
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-gray-400 text-xs tracking-widest block mb-2">CONFIRM NEW PASSWORD</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-red-500 transition-colors"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold tracking-wide hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {passwordLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(false)
                    setCurrentPassword('')
                    setNewPassword('')
                    setConfirmPassword('')
                    setPasswordMessage(null)
                  }}
                  className="text-gray-400 hover:text-gray-300 px-6 py-2.5 text-sm font-semibold tracking-wide transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  )
}
