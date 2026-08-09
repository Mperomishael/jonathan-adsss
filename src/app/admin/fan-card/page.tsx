'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, Loader2, AlertCircle, Check } from 'lucide-react'
import { useFirestoreListener } from '@/hooks/useFirestoreListener'
import { useAdminAuth } from '@/components/admin/AdminAuthProvider'
import type { FanCardSettings, FanTierId } from '@/lib/firestore'
import ImageUpload from '@/components/admin/ImageUpload'

const DEFAULT_TIERS = {
  regular: { enabled: true, label: 'Regular Fan' },
  gold: { enabled: true, label: 'Gold Fan' },
  diamond: { enabled: true, label: 'Diamond Fan' },
}

/** Convert legacy cents or dollars → dollars for display/edit */
function toDollars(raw: unknown): number | undefined {
  if (raw === null || raw === undefined || raw === '') return undefined
  const n = Number(raw)
  if (!Number.isFinite(n) || n < 0) return undefined
  // Exact passthrough — whatever you type is what gets stored/shown, no scale conversion.
  return Math.round(n * 100) / 100
}

const DEFAULTS: FanCardSettings = {
  background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
  accentColor: '#FF0000',
  logoUrl: '/images/jvcd-avatar.jpg',
  footerText: 'OFFICIAL JONATHAN ROUMIE WORLD FAN CARD',
  antiScreenshot: true,
  tiers: DEFAULT_TIERS,
}

const TIER_META: Record<
  FanTierId,
  { title: string; hint: string; previewBg: string; accent: string }
> = {
  regular: {
    title: 'REGULAR FAN',
    hint: 'Base membership card',
    previewBg: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
    accent: '#FF0000',
  },
  gold: {
    title: 'GOLD FAN',
    hint: 'Premium gold card',
    previewBg: 'linear-gradient(135deg, #1a1200 0%, #3d2e0a 40%, #c9a227 70%, #f5e6a3 100%)',
    accent: '#D4AF37',
  },
  diamond: {
    title: 'DIAMOND FAN',
    hint: 'Elite diamond card',
    previewBg: 'linear-gradient(135deg, #0a0f1a 0%, #1a2744 35%, #a8c0d8 65%, #e8f4ff 100%)',
    accent: '#B9F2FF',
  },
}

export default function AdminFanCardPage() {
  const { getToken } = useAdminAuth()
  const { data: firestoreSettings, loading, error: listenerError } =
    useFirestoreListener<FanCardSettings>('pageSettings', 'fanCard')

  const [settings, setSettings] = useState<FanCardSettings>(DEFAULTS)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [previewTier, setPreviewTier] = useState<FanTierId>('regular')

  useEffect(() => {
    if (!firestoreSettings) return
    setSettings({
      ...DEFAULTS,
      ...firestoreSettings,
      antiScreenshot: firestoreSettings.antiScreenshot !== false,
      tiers: {
        regular: { ...DEFAULT_TIERS.regular, ...(firestoreSettings.tiers?.regular || {}) },
        gold: { ...DEFAULT_TIERS.gold, ...(firestoreSettings.tiers?.gold || {}) },
        diamond: { ...DEFAULT_TIERS.diamond, ...(firestoreSettings.tiers?.diamond || {}) },
      },
    })
  }, [firestoreSettings])

  // Free-typing price strings (dollars) so inputs don't behave like spinners
  const [priceInputs, setPriceInputs] = useState<Record<FanTierId, string>>({
    regular: '',
    gold: '',
    diamond: '',
  })

  useEffect(() => {
    if (!firestoreSettings) return
    const r = toDollars(firestoreSettings.tiers?.regular?.price ?? firestoreSettings.price)
    const g = toDollars(firestoreSettings.tiers?.gold?.price)
    const d = toDollars(firestoreSettings.tiers?.diamond?.price)
    setPriceInputs({
      regular: r !== undefined ? r.toFixed(2) : '',
      gold: g !== undefined ? g.toFixed(2) : '',
      diamond: d !== undefined ? d.toFixed(2) : '',
    })
  }, [firestoreSettings])

  const updateTier = (
    id: FanTierId,
    patch: Partial<{ enabled: boolean; price: number; label: string }>
  ) => {
    setSettings((prev) => ({
      ...prev,
      tiers: {
        ...DEFAULT_TIERS,
        ...prev.tiers,
        [id]: {
          ...DEFAULT_TIERS[id],
          ...(prev.tiers?.[id] || {}),
          ...patch,
        },
      },
      price: id === 'regular' && patch.price !== undefined ? patch.price : prev.price,
    }))
  }

  const onPriceType = (id: FanTierId, raw: string) => {
    if (raw !== '' && !/^\d*\.?\d{0,2}$/.test(raw)) return
    setPriceInputs((prev) => ({ ...prev, [id]: raw }))
    const d = parseFloat(raw)
    if (Number.isFinite(d) && d >= 0) {
      updateTier(id, { price: Math.round(d * 100) / 100 })
    }
  }

  const onPriceBlur = (id: FanTierId) => {
    const d = parseFloat(priceInputs[id])
    if (!Number.isFinite(d) || d < 0.99) {
      setPriceInputs((prev) => ({ ...prev, [id]: '' }))
      return
    }
    const dollars = Math.round(d * 100) / 100
    updateTier(id, { price: dollars })
    setPriceInputs((prev) => ({ ...prev, [id]: dollars.toFixed(2) }))
  }

  const handleSave = async () => {
    setLocalError(null)
    setSaving(true)
    try {
      const parseDollars = (id: FanTierId) => {
        const typed = parseFloat(priceInputs[id])
        if (Number.isFinite(typed) && typed >= 0.99) return Math.round(typed * 100) / 100
        return toDollars(settings.tiers?.[id]?.price)
      }
      const prices = {
        regular: parseDollars('regular'),
        gold: parseDollars('gold'),
        diamond: parseDollars('diamond'),
      }
      if (
        prices.regular === undefined ||
        prices.gold === undefined ||
        prices.diamond === undefined
      ) {
        setLocalError('Set a price (min $0.99) for every tier before saving')
        setSaving(false)
        return
      }
      const tiers = {
        regular: {
          enabled: settings.tiers?.regular?.enabled !== false,
          price: prices.regular,
          label: settings.tiers?.regular?.label || 'Regular Fan',
        },
        gold: {
          enabled: settings.tiers?.gold?.enabled !== false,
          price: prices.gold,
          label: settings.tiers?.gold?.label || 'Gold Fan',
        },
        diamond: {
          enabled: settings.tiers?.diamond?.enabled !== false,
          price: prices.diamond,
          label: settings.tiers?.diamond?.label || 'Diamond Fan',
        },
      }

      const token = await getToken()
      if (!token) {
        throw new Error('Not authenticated. Please log in again.')
      }

      const res = await fetch('/api/admin/settings/fan-card', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          price: tiers.regular.price,
          background: settings.background,
          accentColor: settings.accentColor,
          logoUrl: settings.logoUrl,
          footerText: settings.footerText,
          antiScreenshot: settings.antiScreenshot !== false,
          tiers,
          updatedAt: new Date().toISOString(),
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || `Save failed (${res.status})`)
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (e: any) {
      console.error('[Admin Fan Card] Save failed:', e)
      setLocalError(e?.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 size={32} className="text-red-500 animate-spin" />
      </div>
    )
  }

  const meta = TIER_META[previewTier]
  const _tp = toDollars(settings.tiers?.[previewTier]?.price ?? priceInputs[previewTier])
  const tierPrice = _tp !== undefined ? _tp.toFixed(2) : '—'

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-white text-2xl font-black tracking-widest">FAN CARD SETTINGS</h1>
        <p className="text-gray-500 text-sm mt-1">
          Regular · Gold · Diamond tiers — prices and toggles sync to the public site
        </p>
      </div>

      {(listenerError || localError) && (
        <div className="flex items-center gap-3 bg-red-900/20 border border-red-800/50 rounded-lg p-4 text-red-300 mb-6 text-sm">
          <AlertCircle size={18} className="flex-shrink-0" />
          {localError || listenerError}
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-2">
        {(['regular', 'gold', 'diamond'] as FanTierId[]).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setPreviewTier(id)}
            className={`px-4 py-2 rounded-lg text-xs font-bold tracking-widest ${
              previewTier === id
                ? 'bg-red-600 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            {TIER_META[id].title}
          </button>
        ))}
      </div>

      <div className="mb-8">
        <div
          className="w-full max-w-[340px] h-[210px] rounded-2xl overflow-hidden relative border border-white/10"
          style={{
            background: meta.previewBg,
            boxShadow: `0 20px 40px ${meta.accent}33`,
          }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-1"
            style={{ background: `linear-gradient(90deg, ${meta.accent}, #fff8, ${meta.accent})` }}
          />
          <div className="absolute top-4 right-4 w-12 h-12 rounded-full overflow-hidden border-2 border-white/30 bg-black/40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={settings.logoUrl || '/images/jvcd-avatar.jpg'}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute top-[52px] left-5">
            <p className="text-white/50 text-[9px] tracking-[0.3em] uppercase">{meta.title}</p>
            <p className="text-white text-xs font-bold tracking-[0.25em]">JONATHAN ROUMIE</p>
          </div>
          <div className="absolute bottom-10 left-5">
            <p
              className="text-white font-bold tracking-widest text-lg"
              style={{ textShadow: `0 0 20px ${meta.accent}` }}
            >
              YOUR NAME
            </p>
          </div>
          <div className="absolute bottom-3 left-5 right-5 flex justify-between text-white/40 text-[10px] tracking-widest font-mono">
            <span>JR-000000</span>
            <span>${tierPrice}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <h2 className="text-white text-sm font-black tracking-widest">MEMBERSHIP TIERS</h2>
        {(['regular', 'gold', 'diamond'] as FanTierId[]).map((id) => {
          const t = settings.tiers?.[id] || DEFAULT_TIERS[id]
          return (
            <div key={id} className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-white font-bold tracking-widest text-sm">{TIER_META[id].title}</p>
                  <p className="text-gray-500 text-xs">{TIER_META[id].hint}</p>
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={t.enabled !== false}
                    onChange={(e) => updateTier(id, { enabled: e.target.checked })}
                    className="accent-red-600 w-4 h-4"
                  />
                  Enabled on site
                </label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-500 text-xs block mb-1">LABEL</label>
                  <input
                    type="text"
                    value={t.label}
                    onChange={(e) => updateTier(id, { label: e.target.value })}
                    className="w-full bg-black/30 border border-white/10 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="text-gray-500 text-xs block mb-1">PRICE (USD)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      placeholder="0.00"
                      value={priceInputs[id]}
                      onChange={(e) => onPriceType(id, e.target.value)}
                      onBlur={() => onPriceBlur(id)}
                      className="w-full bg-black/30 border border-white/10 text-white pl-7 pr-3 py-2 rounded-lg text-sm focus:outline-none focus:border-red-500 [appearance:textfield]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="space-y-5 bg-white/3 border border-white/5 rounded-2xl p-6 mb-6">
        <h2 className="text-white text-sm font-black tracking-widest">GLOBAL CARD SETTINGS</h2>
        <div>
          <label className="text-gray-400 text-xs tracking-widest block mb-2">FOOTER TEXT</label>
          <input
            type="text"
            value={settings.footerText}
            onChange={(e) => setSettings({ ...settings, footerText: e.target.value })}
            className="w-full bg-white/5 border border-white/10 text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-red-500"
          />
        </div>
        <ImageUpload
          label="LOGO IMAGE"
          folder="fan-card"
          value={settings.logoUrl}
          onChange={(url) => setSettings({ ...settings, logoUrl: url })}
        />
        <label className="flex items-center gap-3 cursor-pointer bg-white/5 border border-white/10 rounded-lg p-4">
          <input
            type="checkbox"
            checked={settings.antiScreenshot !== false}
            onChange={(e) => setSettings({ ...settings, antiScreenshot: e.target.checked })}
            className="w-4 h-4 accent-red-600"
          />
          <div>
            <p className="text-gray-300 text-sm font-medium">Anti-Screenshot Protection</p>
            <p className="text-gray-500 text-xs">Blocks right-click / selection on public page</p>
          </div>
        </label>
      </div>

      {saved && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 bg-green-900/20 border border-green-800/50 text-green-300 rounded-lg px-4 py-3 text-sm mb-4"
        >
          <Check size={16} />
          Saved — tier prices are live on the public fan card
        </motion.div>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl text-sm font-bold tracking-wide hover:bg-red-700 disabled:opacity-50"
      >
        {saving ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Saving...
          </>
        ) : (
          <>
            <Save size={16} /> Save Settings
          </>
        )}
      </button>
    </div>
  )
}
