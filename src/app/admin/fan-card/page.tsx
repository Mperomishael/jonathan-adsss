'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, Loader2 } from 'lucide-react'
import { useFirestoreListener } from '@/hooks/useFirestoreListener'
import { useFirestoreSync } from '@/hooks/useFirestoreSync'
import type { FanCardSettings } from '@/lib/firestore'

export default function AdminFanCardPage() {
  const { data: firestoreSettings, loading, error: listenerError } = useFirestoreListener<FanCardSettings>('pageSettings', 'fanCard')
  const { sync, isSyncing, error: syncError } = useFirestoreSync('pageSettings')
  
  const [settings, setSettings] = useState<FanCardSettings>({
    price: 5000, 
    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
    accentColor: '#FF0000', 
    logoUrl: '/images/jvcd-avatar.jpg', 
    footerText: 'OFFICIAL JONATHAN ROUMIE WORLD FAN CARD',
  })
  const [antiScreenshot, setAntiScreenshot] = useState(true)
  const [saved, setSaved] = useState(false)

  // Sync Firestore data to local state
  useEffect(() => {
    if (firestoreSettings) {
      console.log('[v0] Syncing Firestore fan card settings to state:', firestoreSettings)
      setSettings(firestoreSettings)
    }
  }, [firestoreSettings])

  const handleSave = async () => {
    try {
      console.log('[v0] Saving fan card settings:', settings)
      await sync('fanCard', settings)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      console.error('[v0] Save failed:', e)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <Loader2 size={32} className="text-red-500 animate-spin mx-auto mb-3" />
        <p className="text-gray-400 text-sm">Loading fan card settings...</p>
      </div>
    </div>
  )

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-white text-2xl font-black tracking-widest">FAN CARD SETTINGS</h1>
        <p className="text-gray-500 text-sm mt-1">Manage pricing and design of the fan card</p>
      </div>

      {/* Live preview */}
      <div className="mb-8">
        <p className="text-gray-400 text-xs tracking-widest mb-3">LIVE PREVIEW</p>
        <div className="w-[340px] h-[210px] rounded-2xl overflow-hidden relative border border-white/10"
          style={{ background: settings.background, boxShadow: `0 20px 40px ${settings.accentColor}33` }}>
          <div className="absolute top-0 left-0 right-0 h-1" style={{ background: `linear-gradient(90deg, ${settings.accentColor}, ${settings.accentColor}88, ${settings.accentColor})` }} />
          <div className="absolute bottom-3 left-5 right-5 flex justify-between items-center">
            <p className="text-white/40 text-[10px] tracking-widest font-mono">JCVD-000000</p>
            <p className="text-white/40 text-[10px] tracking-widest">2026</p>
          </div>
          <div className="absolute bottom-10 left-5">
            <p className="text-white font-bold tracking-widest text-lg uppercase" style={{ textShadow: `0 0 20px ${settings.accentColor}99` }}>
              YOUR NAME
            </p>
          </div>
          <p className="absolute bottom-[-2px] left-0 right-0 text-center text-[8px] tracking-widest text-white/20">{settings.footerText}</p>
        </div>
      </div>

      <div className="space-y-5 bg-white/3 border border-white/5 rounded-2xl p-6">
        <div>
          <label className="text-gray-400 text-xs tracking-widest block mb-2">PRICE (USD)</label>
          <div className="relative w-40">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
            <input type="number" step="0.01" min="0.99" value={(settings.price / 100).toFixed(2)}
              onChange={(e) => setSettings({ ...settings, price: Math.round(parseFloat(e.target.value) * 100) })}
              className="w-full bg-white/5 border border-white/10 text-white pl-7 pr-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-red-500 transition-colors" />
          </div>
        </div>

        <div>
          <label className="text-gray-400 text-xs tracking-widest block mb-2">ACCENT COLOR</label>
          <div className="flex items-center gap-3">
            <input type="color" value={settings.accentColor} onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
              className="w-12 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer" />
            <input type="text" value={settings.accentColor} onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
              className="bg-white/5 border border-white/10 text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-red-500 transition-colors w-32" />
          </div>
        </div>

        <div>
          <label className="text-gray-400 text-xs tracking-widest block mb-2">BACKGROUND (CSS gradient or color)</label>
          <textarea value={settings.background} onChange={(e) => setSettings({ ...settings, background: e.target.value })} rows={2}
            className="w-full bg-white/5 border border-white/10 text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-red-500 transition-colors resize-none font-mono" />
        </div>

        <div>
          <label className="text-gray-400 text-xs tracking-widest block mb-2">FOOTER TEXT</label>
          <input type="text" value={settings.footerText} onChange={(e) => setSettings({ ...settings, footerText: e.target.value })}
            className="w-full bg-white/5 border border-white/10 text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-red-500 transition-colors" />
        </div>

        <div>
          <label className="text-gray-400 text-xs tracking-widest block mb-2">LOGO IMAGE URL</label>
          <input type="text" value={settings.logoUrl} onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
            className="w-full bg-white/5 border border-white/10 text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-red-500 transition-colors" />
        </div>

        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox" 
              checked={antiScreenshot} 
              onChange={(e) => setAntiScreenshot(e.target.checked)}
              className="w-4 h-4 rounded border-white/20 bg-white/5 accent-red-600" 
            />
            <div>
              <p className="text-gray-300 text-sm font-medium">Anti-Screenshot Protection</p>
              <p className="text-gray-500 text-xs mt-0.5">Prevent right-click menu and selection on fan cards</p>
            </div>
          </label>
        </div>

        {syncError && (
          <div className="bg-red-950/40 border border-red-800/60 rounded-lg p-3 mb-4">
            <p className="text-red-400 text-sm">{syncError}</p>
          </div>
        )}
        
        <button onClick={handleSave} disabled={isSyncing}
          className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl text-sm font-bold tracking-wide hover:bg-red-700 transition-colors disabled:opacity-50">
          {isSyncing ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Saving...
            </>
          ) : saved ? (
            <>
              <span>✓ Saved to Firestore!</span>
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
