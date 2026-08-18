'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, Download, Loader2, RefreshCw, User } from 'lucide-react'
import { useAdminAuth } from '@/components/admin/AdminAuthProvider'

type FanTierId = 'regular' | 'gold' | 'diamond'

interface FanCardUser {
  id: string
  email: string
  cardName: string
  cardMemberId: string
  fanTier: FanTierId
  paymentStatus: string
}

interface FanCardSettingsData {
  logoUrl?: string | null
  footerText?: string | null
}

const TIER_STYLE: Record<FanTierId, { background: string; accent: string; badge: string }> = {
  regular: {
    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
    accent: '#FF0000',
    badge: 'REGULAR FAN',
  },
  gold: {
    background: 'linear-gradient(135deg, #1a1200 0%, #3d2e0a 35%, #c9a227 70%, #f5e6a3 100%)',
    accent: '#D4AF37',
    badge: 'GOLD FAN',
  },
  diamond: {
    background: 'linear-gradient(135deg, #0a0f1a 0%, #1a2744 35%, #a8c0d8 65%, #e8f4ff 100%)',
    accent: '#B9F2FF',
    badge: 'DIAMOND FAN',
  },
}

export default function AdminCardDownloadsPage() {
  const { getToken } = useAdminAuth()
  const [users, setUsers] = useState<FanCardUser[]>([])
  const [loading, setLoading] = useState(true)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [settings, setSettings] = useState<FanCardSettingsData>({})
  const cardRef = useRef<HTMLDivElement>(null)
  const [renderTarget, setRenderTarget] = useState<FanCardUser | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const token = await getToken()
      const res = await fetch('/api/admin/fan-card/users', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users || [])
      } else {
        setMessage({ type: 'error', text: 'Failed to load fan cards' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to load fan cards' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    fetch('/api/settings/fan-card')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data && setSettings(data))
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleDownload = async (fan: FanCardUser) => {
    setDownloadingId(fan.id)
    setMessage(null)
    setRenderTarget(fan)
    // Let the off-screen card render with this fan's data before capturing it
    await new Promise((r) => setTimeout(r, 150))
    try {
      if (!cardRef.current) throw new Error('Card failed to render')
      const { default: html2canvas } = await import('html2canvas')
      const { jsPDF } = await import('jspdf')
      const node = cardRef.current
      const canvas = await html2canvas(node, {
        scale: 4,
        backgroundColor: null,
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: node.offsetWidth,
        height: node.offsetHeight,
        windowWidth: node.offsetWidth,
        windowHeight: node.offsetHeight,
      })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [85.6, 53.98] })
      pdf.addImage(imgData, 'PNG', 0, 0, 85.6, 53.98)
      pdf.save(`JonathanRoumie-${fan.fanTier}-Fan-Card-${fan.cardName.replace(/\s+/g, '-')}.pdf`)
      setMessage({ type: 'success', text: `Downloaded card for ${fan.cardName}` })
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Download failed' })
    } finally {
      setDownloadingId(null)
      setRenderTarget(null)
    }
  }

  const meta = renderTarget ? TIER_STYLE[renderTarget.fanTier] || TIER_STYLE.regular : TIER_STYLE.regular

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-white text-2xl font-black tracking-widest">CARD DOWNLOADS</h1>
          <p className="text-gray-500 text-sm mt-1">
            Generate and download any fan&apos;s personalized fan card as a PDF
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors disabled:opacity-40"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {message && (
        <div
          className={`mb-4 px-4 py-3 rounded-xl text-sm ${
            message.type === 'success'
              ? 'bg-green-900/30 text-green-400 border border-green-800/50'
              : 'bg-red-900/30 text-red-400 border border-red-800/50'
          }`}
        >
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white/3 border border-white/5 rounded-lg p-4 animate-pulse h-20" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-16 bg-white/3 border border-white/10 rounded-2xl">
          <CreditCard size={36} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">
            No personalized fan cards yet. Cards appear here once a whitelisted fan
            enters their name on the public Fan Card page.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((fan, i) => (
            <motion.div
              key={fan.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-white/3 border border-white/5 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 bg-red-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <User size={16} className="text-red-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{fan.cardName}</p>
                  <p className="text-gray-500 text-xs truncate">
                    {fan.email} · {fan.cardMemberId} ·{' '}
                    <span className="uppercase">{fan.fanTier}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDownload(fan)}
                disabled={downloadingId === fan.id}
                className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex-shrink-0"
              >
                {downloadingId === fan.id ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Download size={14} />
                )}
                Download PDF
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Off-screen render target used to rasterize the card for PDF export */}
      <div className="fixed -left-[9999px] top-0 pointer-events-none">
        {renderTarget && (
          <div
            ref={cardRef}
            className="w-[340px] h-[210px] rounded-2xl overflow-hidden relative"
            style={{ background: meta.background }}
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
                crossOrigin="anonymous"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute top-[52px] left-5">
              <p className="text-white/50 text-[9px] tracking-[0.3em] uppercase">{meta.badge}</p>
              <p className="text-white text-xs font-bold tracking-[0.25em]">JONATHAN ROUMIE</p>
            </div>
            <div className="absolute bottom-10 left-5">
              <p
                className="text-white font-bold tracking-widest text-lg"
                style={{ textShadow: `0 0 20px ${meta.accent}` }}
              >
                {renderTarget.cardName.toUpperCase()}
              </p>
            </div>
            <div className="absolute bottom-3 left-5 right-5 flex justify-between text-white/40 text-[10px] tracking-widest font-mono">
              <span>{renderTarget.cardMemberId}</span>
              <span>{settings.footerText || 'OFFICIAL JONATHAN ROUMIE WORLD FAN CARD'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

