'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, Loader2, AlertCircle, Check } from 'lucide-react'
import { useFirestoreListener } from '@/hooks/useFirestoreListener'
import { useFirestoreSync } from '@/hooks/useFirestoreSync'
import type { FanCardSettings } from '@/lib/firestore'

const DEFAULTS: FanCardSettings = {
  price: 5000, // cents → $50.00
  background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
  accentColor: '#FF0000',
  logoUrl: '/images/jvcd-avatar.jpg',
  footerText: 'OFFICIAL JONATHAN ROUMIE WORLD FAN CARD',
  antiScreenshot: true,
}

export default function AdminFanCardPage() {
  const { data: firestoreSettings, loading, error: listenerError } =
    useFirestoreListener<FanCardSettings>('pageSettings', 'fanCard')
  const { sync, isSyncing, error: syncError } = useFirestoreSync('pageSettings')

  const [settings, setSettings] = useState<FanCardSettings>(DEFAULTS)
  const [saved, setSaved] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  // Sync Firestore → local form (including antiScreenshot)
  useEffect(() => {
    if (firestoreSettings) {
      setSettings({
        ...DEFAULTS,
        ...firestoreSettings,
        antiScreenshot: firestoreSettings.antiScreenshot !== false,
      })
    }
  }, [firestoreSettings])

  const handleSave = async () => {
    setLocalError(null)
    try {
      const price = Number(settings.price)
      if (!Number.isFinite(price) || price < 99) {
        setLocalError('Price must be at least $0.99')
        return
      }

      await sync('fanCard', {
        price: Math.round(price),
        background: settings.background,
        accentColor: settings.accentColor,
        logoUrl: settings.logoUrl,
        footerText: settings.footerText,
        antiScreenshot: settings.antiScreenshot !== false,
        updatedAt: new Date().toISOString(),
      })

      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (e: any) {
      console.error('[Admin Fan Card] Save failed:', e)
      setLocalError(e?.message || 'Failed to save settings')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 size={32} className="text-red-500 animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading fan card settings...</p>
        </div>
      </div>
    )
  }

  const priceDollars = (Number(settings.price) / 100).toFixed(2)

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-white text-2xl font-black tracking-widest">FAN CARD SETTINGS</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage pricing, design, and protection — changes sync live to the public site
        </p>
      </div>

      {(listenerError || syncError || localError) && (
        <div className="flex items-center gap-3 bg-red-900/20 border border-red-800/50 rounded-lg p-4 text-red-300 mb-6">
          <AlertCircle size={18} className="flex-shrink-0" />
          <span className="text-sm">{localError || syncError || listenerError}</span>
        </div>
      )}

      {/* Live preview */}
      <div className="mb-8">
        <p className="text-gray-400 text-xs tracking-widest mb-3">LIVE PREVIEW</p>
        <div
          className="w-[340px] h-[210px] rounded-2xl overflow-hidden relative border border-white/10"
          style={{
            background: settings.background,
            boxShadow: `0 20px 40px ${settings.accentColor}33`,
          }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-1"
            style={{
              background: `linear-gradient(90deg, ${settings.accentColor}, ${settings.accentColor}88, ${settings.accentColor})`,
            }}
          />
          <div className="absolute top-4 right-4 w-12 h-12 rounded-full overflow-hidden border-2 border-white/30 bg-black/40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={settings.logoUrl || '/images/jvcd-avatar.jpg'}
              alt="Logo"
              className="w-full h-full object-cover"
              onError={(e) => {
                ;(e.target as HTMLImageElement).src = '/images/jvcd-avatar.jpg'
              }}
            />
          </div>
          <div className="absolute top-[52px] left-5">
            <p className="text-white/40 text-[9px] tracking-[0.3em] uppercase">Official Member</p>
            <p className="text-white text-xs font-bold tracking-[0.25em]">JONATHAN ROUMIE</p>
          </div>
          <div className="absolute bottom-10 left-5">
            <p
              className="text-white font-bold tracking-widest text-lg uppercase"
              style={{ textShadow: `0 0 20px ${settings.accentColor}99` }}
            >
              YOUR NAME
            </p>
          </div>
          <div className="absolute bottom-3 left-5 right-5 flex justify-between items-center">
            <p className="text-white/40 text-[10px] tracking-widest font-mono">JR-000000</p>
            <p className="text-white/40 text-[10px] tracking-widest">
              {new Date().getFullYear()}
            </p>
          </div>
          <p className="absolute bottom-[-2px] left-0 right-0 text-center text-[8px] tracking-widest text-white/20 pb-1">
            {settings.footerText}
          </p>
        </div>
        <p className="text-gray-500 text-xs mt-2">
          Display price: <span className="text-white font-semibold">${priceDollars}</span>
          {settings.antiScreenshot !== false && (
            <span className="ml-3 text-green-500/80">· Anti-screenshot ON</span>
          )}
        </p>
      </div>

      <div className="space-y-5 bg-white/3 border border-white/5 rounded-2xl p-6">
        {/* Price */}
        <div>
          <label className="text-gray-400 text-xs tracking-widest block mb-2">PRICE (USD)</label>
          <div className="relative w-40">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
            <input
              type="number"
              step="0.01"
              min="0.99"
              value={priceDollars}
              onChange={(e) => {
                const dollars = parseFloat(e.target.value)
                if (!Number.isFinite(dollars)) return
                setSettings({
                  ...settings,
                  price: Math.round(dollars * 100),
                })
              }}
              className="w-full bg-white/5 border border-white/10 text-white pl-7 pr-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>
          <p className="text-gray-600 text-xs mt-1.5">
            Stored as cents in Firestore ({settings.price}). Public page shows ${priceDollars}.
          </p>
        </div>

        {/* Accent color */}
        <div>
          <label className="text-gray-400 text-xs tracking-widest block mb-2">ACCENT COLOR</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={settings.accentColor}
              onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
              className="w-12 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer"
            />
            <input
              type="text"
              value={settings.accentColor}
              onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
              className="bg-white/5 border border-white/10 text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-red-500 transition-colors w-32 font-mono"
            />
          </div>
        </div>

        {/* Background */}
        <div>
          <label className="text-gray-400 text-xs tracking-widest block mb-2">
            BACKGROUND (CSS gradient or color)
          </label>
          <textarea
            value={settings.background}
            onChange={(e) => setSettings({ ...settings, background: e.target.value })}
            rows={2}
            className="w-full bg-white/5 border border-white/10 text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-red-500 transition-colors resize-none font-mono"
          />
        </div>

        {/* Footer text */}
        <div>
          <label className="text-gray-400 text-xs tracking-widest block mb-2">FOOTER TEXT</label>
          <input
            type="text"
            value={settings.footerText}
            onChange={(e) => setSettings({ ...settings, footerText: e.target.value })}
            className="w-full bg-white/5 border border-white/10 text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-red-500 transition-colors"
          />
        </div>

        {/* Logo URL */}
        <div>
          <label className="text-gray-400 text-xs tracking-widest block mb-2">LOGO IMAGE URL</label>
          <input
            type="text"
            value={settings.logoUrl}
            onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
            placeholder="/images/jvcd-avatar.jpg"
            className="w-full bg-white/5 border border-white/10 text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-red-500 transition-colors"
          />
        </div>

        {/* Anti-screenshot — saved to Firestore */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.antiScreenshot !== false}
              onChange={(e) =>
                setSettings({ ...settings, antiScreenshot: e.target.checked })
              }
              className="w-4 h-4 rounded border-white/20 bg-white/5 accent-red-600"
            />
            <div>
              <p className="text-gray-300 text-sm font-medium">Anti-Screenshot Protection</p>
              <p className="text-gray-500 text-xs mt-0.5">
                Blocks right-click / selection on the public fan card page (browser deterrent only)
              </p>
            </div>
          </label>
        </div>

        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 bg-green-900/20 border border-green-800/50 text-green-300 rounded-lg px-4 py-3 text-sm"
          >
            <Check size={16} />
            Saved to Firestore — public page will update in real time
          </motion.div>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={isSyncing}
          className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl text-sm font-bold tracking-wide hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {isSyncing ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Saving...
            </>
          ) : saved ? (
            <>
              <Check size={16} />
              Saved!
            </>
          ) : (
            <>
              <Save size={16} />
              Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  )
}
