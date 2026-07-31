'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import {
  Download, CheckCircle, Copy, Check,
  Bitcoin, Clock, AlertCircle, Loader2, LogIn, Mail, User as UserIcon, Truck, MapPin,
} from 'lucide-react'
import Image from 'next/image'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { useUserAuth } from '@/components/user/UserAuthProvider'
import { useFirestoreListener } from '@/hooks/useFirestoreListener'

// ─── Types ────────────────────────────────────────────────────────────────────

type PayMethod = 'USDT' | 'BTC' | 'Venmo' | 'ChipperCash' | 'CashApp'

interface Wallets {
  btc?: { address: string }
  usdt?: { address: string }
}

interface PaymentMethodsConfig {
  crypto?: {
    btc?: { address?: string; enabled?: boolean }
    usdt?: { address?: string; enabled?: boolean }
  }
  cashapp?: { handle?: string; enabled?: boolean }
  venmo?: { handle?: string; enabled?: boolean }
  chipperCash?: { handle?: string; enabled?: boolean }
}

interface CryptoWalletsData {
  btc?: { address: string; verified?: boolean }
  usdt?: { address: string; verified?: boolean }
}

interface FanCardSettingsData {
  price?: number
  antiScreenshot?: boolean
  background?: string
  accentColor?: string
  logoUrl?: string
  footerText?: string
}

type PageState = 'loading' | 'apply' | 'submitted' | 'awaiting' | 'whitelisted'

// ─── Name font size (prevents cutoff on card + export) ────────────────────────

function nameFontSize(name: string): number {
  const len = name.length || 8
  if (len > 24) return 11
  if (len > 18) return 13
  if (len > 12) return 16
  return 20
}

// ─── 3D Fan Card ──────────────────────────────────────────────────────────────

function FanCard3D({
  name,
  memberId,
  cardRef,
  showUnverifiedWatermark,
  background,
  accentColor,
  logoUrl,
  footerText,
}: {
  name: string
  memberId: string
  cardRef: React.RefObject<HTMLDivElement>
  showUnverifiedWatermark: boolean
  background: string
  accentColor: string
  logoUrl: string
  footerText: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), { stiffness: 150, damping: 20 })
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), { stiffness: 150, damping: 20 })
  const glareX = useTransform(mouseX, [-0.5, 0.5], ['0%', '100%'])
  const glareY = useTransform(mouseY, [-0.5, 0.5], ['0%', '100%'])

  const [vibrating, setVibrating] = useState(false)
  const prev = useRef(name)
  useEffect(() => {
    if (name !== prev.current) {
      setVibrating(true)
      const t = setTimeout(() => setVibrating(false), 300)
      prev.current = name
      return () => clearTimeout(t)
    }
  }, [name])

  const display = name || 'YOUR NAME'
  const year = new Date().getFullYear()
  const fontSize = nameFontSize(display)

  return (
    <div
      ref={containerRef}
      onMouseMove={(e) => {
        const r = containerRef.current?.getBoundingClientRect()
        if (!r) return
        mouseX.set((e.clientX - r.left) / r.width - 0.5)
        mouseY.set((e.clientY - r.top) / r.height - 0.5)
      }}
      onMouseLeave={() => {
        mouseX.set(0)
        mouseY.set(0)
      }}
      onContextMenu={(e) => e.preventDefault()}
      className="flex items-center justify-center p-8 select-none"
      style={{ perspective: '1000px', WebkitUserSelect: 'none', userSelect: 'none' }}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        animate={vibrating ? { x: [-3, 3, -3, 3, 0], transition: { duration: 0.25 } } : {}}
        className="relative w-[340px] h-[210px] cursor-pointer"
      >
        {/* Capture target: flat layer, no 3D child transforms */}
        <div
          ref={cardRef}
          className="absolute inset-0 rounded-2xl overflow-hidden select-none"
          style={{
            background,
            boxShadow: `0 25px 60px ${accentColor}4D, 0 0 0 1px rgba(255,255,255,0.08)`,
            WebkitUserSelect: 'none',
            userSelect: 'none',
          }}
        >
          {/* Glare */}
          <motion.div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              background: `radial-gradient(circle at ${glareX.get()} ${glareY.get()}, rgba(255,255,255,0.4) 0%, transparent 60%)`,
            }}
          />

          {/* Top accent bar */}
          <div
            className="absolute top-0 left-0 right-0 h-1"
            style={{
              background: `linear-gradient(to right, ${accentColor}, #f87171, ${accentColor})`,
            }}
          />

          {/* Chip */}
          <div className="absolute top-5 left-5 w-10 h-7 rounded bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center">
            <div className="grid grid-cols-2 gap-0.5 opacity-60">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 bg-yellow-700 rounded-sm" />
              ))}
            </div>
          </div>

          {/* Avatar */}
          <div
            className="absolute top-4 right-4 w-12 h-12 rounded-full overflow-hidden border-2"
            style={{ borderColor: `${accentColor}99` }}
          >
            <Image src={logoUrl} alt="Jonathan Roumie" fill className="object-cover" unoptimized />
          </div>

          {/* Brand */}
          <div className="absolute top-[52px] left-5 right-16">
            <p className="text-white/40 text-[9px] tracking-[0.3em] uppercase">Official Member</p>
            <p className="text-white text-xs font-bold tracking-[0.25em]">JONATHAN ROUMIE</p>
          </div>

          {/* Name band — reserved height so text never clips */}
          <div
            className="absolute left-5 right-5 flex items-end"
            style={{ bottom: 36, height: 36 }}
          >
            <p
              className="text-white font-bold tracking-[0.12em] uppercase w-full"
              style={{
                fontSize,
                lineHeight: 1.15,
                textShadow: `0 0 20px ${accentColor}99`,
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
              }}
            >
              {display}
            </p>
          </div>

          {/* Footer row */}
          <div className="absolute bottom-3 left-5 right-5 flex justify-between items-center">
            <p className="text-white/40 text-[10px] tracking-widest font-mono">{memberId}</p>
            <p className="text-white/40 text-[10px] tracking-widest">{year}</p>
          </div>

          {/* Optional footer label */}
          {footerText && (
            <p className="absolute bottom-[1px] left-0 right-0 text-center text-[7px] tracking-widest text-white/15 px-2 truncate">
              {footerText}
            </p>
          )}

          {/* Decorative lines */}
          <svg className="absolute inset-0 w-full h-full opacity-5 pointer-events-none" viewBox="0 0 340 210">
            <line x1="0" y1="100" x2="340" y2="100" stroke="white" strokeWidth="0.5" />
            <line x1="170" y1="0" x2="170" y2="210" stroke="white" strokeWidth="0.5" />
            <circle cx="170" cy="100" r="40" stroke="white" strokeWidth="0.5" fill="none" />
          </svg>

          {/* UNVERIFIED watermark — screen only until approved download */}
          {showUnverifiedWatermark && (
            <div
              className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden"
              aria-hidden
            >
              <div
                className="absolute inset-0 opacity-[0.12]"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(-32deg, transparent, transparent 28px, rgba(255,255,255,0.15) 28px, rgba(255,255,255,0.15) 29px)',
                }}
              />
              <span
                className="text-white/25 font-black tracking-[0.35em] uppercase select-none"
                style={{
                  fontSize: 28,
                  transform: 'rotate(-28deg)',
                  whiteSpace: 'nowrap',
                  textShadow: '0 0 1px rgba(0,0,0,0.5)',
                }}
              >
                UNVERIFIED
              </span>
              <span
                className="absolute text-white/15 font-black tracking-[0.3em] uppercase select-none"
                style={{
                  fontSize: 18,
                  transform: 'rotate(-28deg) translateY(42px)',
                  whiteSpace: 'nowrap',
                }}
              >
                NOT FOR OFFICIAL USE
              </span>
            </div>
          )}
        </div>

        {/* Card thickness shadow */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            transform: 'translateZ(-4px)',
            background: '#0a0a1a',
            boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
          }}
        />
      </motion.div>
    </div>
  )
}

// ─── Copy Button ───────────────────────────────────────────────────────────────

function CopyButton({ address }: { address: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(address)
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      }}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
        copied
          ? 'bg-green-900/40 border border-green-600/50 text-green-300'
          : 'bg-white/8 border border-white/10 text-gray-300 hover:bg-white/15'
      }`}
    >
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.span key="y" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1.5">
            <Check size={14} />Copied!
          </motion.span>
        ) : (
          <motion.span key="n" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1.5">
            <Copy size={14} />Copy
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}

// ─── Payment destination ───────────────────────────────────────────────────────

function PaymentDestination({
  method,
  wallets,
  methods,
  priceUsd,
}: {
  method: PayMethod
  wallets: Wallets
  methods: PaymentMethodsConfig
  priceUsd: string
}) {
  if (method === 'BTC' || method === 'USDT') {
    const address = method === 'BTC' ? wallets.btc?.address : wallets.usdt?.address
    if (!address) return null
    const isBtc = method === 'BTC'
    const border = isBtc ? 'border-orange-800/30 bg-orange-950/20' : 'border-green-800/30 bg-green-950/20'

    return (
      <div className={`rounded-xl border p-5 space-y-4 ${border}`}>
        <div className="flex items-center gap-2">
          {isBtc ? (
            <Bitcoin size={16} className="text-orange-400" />
          ) : (
            <span className="text-green-400 font-black text-sm">₮</span>
          )}
          <p className="text-xs tracking-widest uppercase text-white/50 font-semibold">
            {isBtc ? 'Bitcoin (BTC) Address' : 'USDT — ERC-20 Ethereum'}
          </p>
        </div>
        <div className="bg-black/50 border border-white/10 rounded-lg px-4 py-3">
          <p className="font-mono text-sm text-white break-all select-all">{address}</p>
        </div>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <CopyButton address={address} />
          <div className="text-right">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Send exactly</p>
            <p className={`font-bold text-sm ${isBtc ? 'text-orange-400' : 'text-green-400'}`}>
              {isBtc ? `≈ $${priceUsd} USD in BTC` : `${priceUsd} USDT`}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const handle =
    method === 'Venmo'
      ? methods.venmo?.handle
      : method === 'CashApp'
        ? methods.cashapp?.handle
        : methods.chipperCash?.handle
  if (!handle) return null

  const label =
    method === 'Venmo' ? 'Venmo Handle' : method === 'CashApp' ? 'Cash App Handle' : 'Chipper Cash Handle'
  const accent =
    method === 'Venmo' ? 'text-blue-400' : method === 'CashApp' ? 'text-green-400' : 'text-purple-400'

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-4">
      <p className="text-xs tracking-widest uppercase text-white/50 font-semibold">{label}</p>
      <div className="bg-black/50 border border-white/10 rounded-lg px-4 py-3">
        <p className={`font-bold text-lg break-all select-all ${accent}`}>{handle}</p>
      </div>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <CopyButton address={handle} />
        <div className="text-right">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">Send exactly</p>
          <p className={`font-bold text-sm ${accent}`}>${priceUsd}</p>
        </div>
      </div>
    </div>
  )
}

function methodLabel(m: PayMethod) {
  switch (m) {
    case 'BTC':
      return '₿ BITCOIN'
    case 'USDT':
      return '₮ USDT'
    case 'Venmo':
      return 'VENMO'
    case 'CashApp':
      return 'CASH APP'
    case 'ChipperCash':
      return 'CHIPPER'
    default:
      return m
  }
}

function methodActiveClass(m: PayMethod) {
  switch (m) {
    case 'BTC':
      return 'bg-orange-900/40 border border-orange-600/60 text-orange-300'
    case 'USDT':
      return 'bg-green-900/40 border border-green-600/60 text-green-300'
    case 'Venmo':
      return 'bg-blue-900/40 border border-blue-600/60 text-blue-300'
    case 'CashApp':
      return 'bg-green-900/40 border border-green-600/60 text-green-300'
    case 'ChipperCash':
      return 'bg-purple-900/40 border border-purple-600/60 text-purple-300'
    default:
      return 'bg-white/10 border border-white/20 text-white'
  }
}

// ─── Application Form ──────────────────────────────────────────────────────────

function ApplicationForm({
  wallets,
  methods,
  price,
  onSuccess,
  name,
  onNameChange,
}: {
  wallets: Wallets
  methods: PaymentMethodsConfig
  price: number
  onSuccess: (email: string) => void
  name: string
  onNameChange: (n: string) => void
}) {
  const options: PayMethod[] = []
  if (wallets.btc?.address) options.push('BTC')
  if (wallets.usdt?.address) options.push('USDT')
  if (methods.venmo?.enabled && methods.venmo?.handle) options.push('Venmo')
  if (methods.cashapp?.enabled && methods.cashapp?.handle) options.push('CashApp')
  if (methods.chipperCash?.enabled && methods.chipperCash?.handle) options.push('ChipperCash')

  const [email, setEmail] = useState('')
  const [method, setMethod] = useState<PayMethod>(options[0] || 'USDT')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [addWaybill, setAddWaybill] = useState(false)
  const [shippingAddress, setShippingAddress] = useState('')

  useEffect(() => {
    if (options.length > 0 && !options.includes(method)) setMethod(options[0])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.join('|')])

  const waybillPrice = 23.0
  const priceUsd = (price / 100).toFixed(2)
  const totalPrice = addWaybill
    ? (parseFloat(priceUsd) + waybillPrice).toFixed(2)
    : priceUsd

  const handleSubmit = async () => {
    setError(null)
    if (!name.trim()) {
      setError('Please enter the name to engrave on your card.')
      return
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }
    if (addWaybill && !shippingAddress.trim()) {
      setError('Please enter your shipping address for waybill.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/checkout/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          name: name.trim(),
          currency: method,
          amount: parseFloat(totalPrice),
          waybill: addWaybill,
          shippingAddress: addWaybill ? shippingAddress.trim() : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Submission failed')
      onSuccess(email.toLowerCase().trim())
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (options.length === 0) {
    return (
      <div className="text-center py-10">
        <AlertCircle size={28} className="text-yellow-500 mx-auto mb-3" />
        <p className="text-white font-semibold">Payment Not Yet Configured</p>
        <p className="text-gray-400 text-sm mt-1">Please check back soon.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-5 py-4">
        <div>
          <p className="text-gray-500 text-xs tracking-widest uppercase mb-0.5">Jonathan Roumie</p>
          <p className="text-white font-bold">Official Fan Card</p>
        </div>
        <div className="text-right">
          <p className="text-white text-2xl font-black">${totalPrice}</p>
          <p className="text-gray-500 text-xs">{addWaybill ? 'Card + Waybill' : 'Digital Only'}</p>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
        <button
          type="button"
          onClick={() => setAddWaybill(!addWaybill)}
          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
        >
          <input
            type="checkbox"
            checked={addWaybill}
            onChange={() => setAddWaybill(!addWaybill)}
            className="w-5 h-5 cursor-pointer accent-jcvd-red"
          />
          <div className="flex-1 text-left">
            <div className="flex items-center gap-2 text-white font-bold">
              <Truck size={16} />
              Add Waybill Shipping
            </div>
            <p className="text-gray-400 text-xs">Physical delivery with tracking</p>
          </div>
          <span className="text-jcvd-red font-black">+${waybillPrice.toFixed(2)}</span>
        </button>
        {addWaybill && (
          <div className="mt-2 pt-3 border-t border-white/10 space-y-2">
            <label className="flex items-center gap-2 text-gray-400 text-xs tracking-widest uppercase">
              <MapPin size={12} />
              Shipping Address
            </label>
            <textarea
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="Full mailing address..."
              className="w-full bg-black/30 border border-white/10 text-white px-4 py-3 rounded-lg text-sm resize-none focus:outline-none focus:border-jcvd-red"
              rows={3}
            />
          </div>
        )}
      </div>

      <div>
        <p className="text-gray-400 text-xs tracking-widest uppercase mb-2">Choose Payment Method</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {options.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMethod(m)}
              className={`py-3 px-2 rounded-xl text-xs sm:text-sm font-bold tracking-widest transition-all ${
                method === m
                  ? methodActiveClass(m)
                  : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/8'
              }`}
            >
              {methodLabel(m)}
            </button>
          ))}
        </div>
      </div>

      <PaymentDestination method={method} wallets={wallets} methods={methods} priceUsd={totalPrice} />

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-white/8" />
        <p className="text-gray-600 text-xs tracking-widest">AFTER SENDING, FILL IN BELOW</p>
        <div className="flex-1 h-px bg-white/8" />
      </div>

      <div>
        <label className="flex items-center gap-2 text-gray-400 text-xs tracking-widest uppercase mb-2">
          <UserIcon size={12} />
          Name to Engrave on Card
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value.slice(0, 28))}
          placeholder="Your Full Name"
          className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-jcvd-red text-center tracking-widest text-lg"
          maxLength={28}
        />
        <p className="text-right text-white/20 text-xs mt-1">{name.length}/28</p>
      </div>

      <div>
        <label className="flex items-center gap-2 text-gray-400 text-xs tracking-widest uppercase mb-2">
          <Mail size={12} />
          Your Email Address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-jcvd-red"
        />
      </div>

      {error && (
        <div className="flex items-start gap-3 bg-red-900/20 border border-red-800/40 rounded-xl px-4 py-3">
          <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full bg-jcvd-red hover:bg-red-700 text-white py-4 rounded-xl font-bold tracking-widest disabled:opacity-60 flex items-center justify-center gap-3"
      >
        {submitting ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <CheckCircle size={20} />
            I HAVE SENT PAYMENT
          </>
        )}
      </button>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function FanCardPage() {
  const { user, loading: authLoading, whitelisted, login, logout, getToken } = useUserAuth()

  const { data: firestoreWallets } = useFirestoreListener<CryptoWalletsData>(
    'pageSettings',
    'cryptoWallets'
  )
  const { data: fanCardSettings } = useFirestoreListener<FanCardSettingsData>(
    'pageSettings',
    'fanCard'
  )

  const [pageState, setPageState] = useState<PageState>('loading')
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [wallets, setWallets] = useState<Wallets>({})
  const [payMethods, setPayMethods] = useState<PaymentMethodsConfig>({})
  const [price, setPrice] = useState(499)
  const [cardName, setCardName] = useState('')
  const [exporting, setExporting] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)
  /** When true, hide watermark for the export capture only */
  const [exportClean, setExportClean] = useState(false)

  const cardRef = useRef<HTMLDivElement>(null)
  const canDownload = pageState === 'whitelisted'

  const antiScreenshot = fanCardSettings?.antiScreenshot !== false
  const cardBackground =
    fanCardSettings?.background ||
    'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)'
  const accentColor = fanCardSettings?.accentColor || '#FF0000'
  const logoUrl = fanCardSettings?.logoUrl || '/images/jvcd-avatar.jpg'
  const footerText =
    fanCardSettings?.footerText || 'OFFICIAL JONATHAN ROUMIE WORLD FAN CARD'

  // Preview always watermarked until verified; clean only during approved export
  const showUnverifiedWatermark = !canDownload || !exportClean

  const memberId = `JR-${Math.abs(
    cardName.split('').reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0x12345)
  )
    .toString()
    .slice(0, 6)
    .padStart(6, '0')}`

  // ── Anti-screenshot (admin toggle) ─────────────────────────────────────────
  useEffect(() => {
    if (!antiScreenshot) return

    const blockContext = (e: Event) => e.preventDefault()
    const blockSelect = (e: Event) => e.preventDefault()
    const blockDrag = (e: Event) => e.preventDefault()
    const onKeyDown = (e: KeyboardEvent) => {
      // PrintScreen / some capture shortcuts
      if (e.key === 'PrintScreen') {
        e.preventDefault()
        navigator.clipboard?.writeText?.('').catch(() => {})
      }
      // Ctrl/Cmd + S / P common save/print
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'p')) {
        e.preventDefault()
      }
    }

    document.addEventListener('contextmenu', blockContext)
    document.addEventListener('selectstart', blockSelect)
    document.addEventListener('dragstart', blockDrag)
    document.addEventListener('keydown', onKeyDown)

    // Soft CSS lock
    const prevUserSelect = document.body.style.userSelect
    document.body.style.userSelect = 'none'

    return () => {
      document.removeEventListener('contextmenu', blockContext)
      document.removeEventListener('selectstart', blockSelect)
      document.removeEventListener('dragstart', blockDrag)
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.userSelect = prevUserSelect
    }
  }, [antiScreenshot])

  // Wallets from Firestore
  useEffect(() => {
    if (firestoreWallets) {
      const next: Wallets = {}
      if (firestoreWallets.btc?.address) next.btc = { address: firestoreWallets.btc.address }
      if (firestoreWallets.usdt?.address) next.usdt = { address: firestoreWallets.usdt.address }
      setWallets(next)
    }
  }, [firestoreWallets])

  // Price (cents)
  useEffect(() => {
    if (fanCardSettings?.price !== undefined) {
      setPrice(Number(fanCardSettings.price) || 499)
    }
  }, [fanCardSettings])

  // Payment methods API
  useEffect(() => {
    fetch('/api/checkout/payment-methods')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return
        setPayMethods(data)
        setWallets((prev) => ({
          btc: data.crypto?.btc?.address ? { address: data.crypto.btc.address } : prev.btc,
          usdt: data.crypto?.usdt?.address ? { address: data.crypto.usdt.address } : prev.usdt,
        }))
      })
      .catch(console.error)
  }, [])

  // Auth state
  useEffect(() => {
    if (authLoading) {
      setPageState('loading')
      return
    }
    if (user) {
      if (whitelisted) {
        setPageState('whitelisted')
      } else {
        ;(async () => {
          try {
            const token = await getToken()
            if (!token) {
              setPageState('apply')
              return
            }
            const res = await fetch('/api/user/status', {
              headers: { Authorization: `Bearer ${token}` },
            })
            if (!res.ok) {
              setPageState('apply')
              return
            }
            const data = await res.json()
            if (data.paymentStatus === 'pending' || data.paymentStatus === 'confirmed') {
              setPageState('awaiting')
            } else {
              setPageState('apply')
            }
          } catch {
            setPageState('apply')
          }
        })()
      }
    } else {
      setPageState((prev) => (prev === 'submitted' ? 'submitted' : 'apply'))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, whitelisted])

  const handlePaymentSuccess = async (email: string) => {
    setSubmittedEmail(email)
    setPageState('submitted')
    setTimeout(async () => {
      try {
        await login()
      } catch {
        /* manual sign-in ok */
      }
    }, 2200)
  }

  const handleGoogleSignIn = async () => {
    setLoginLoading(true)
    try {
      await login()
    } catch {
      setLoginLoading(false)
    }
  }

  /** Export verified card only — no watermark, name fully visible */
  const handleExport = async () => {
    if (!cardName.trim()) {
      alert('Enter your name to engrave on the card first.')
      return
    }
    if (pageState !== 'whitelisted') {
      alert(
        'Downloads are only available after payment is verified by admin. Your preview stays watermarked until then.'
      )
      return
    }
    if (!cardRef.current) return

    setExporting(true)
    setExportClean(true)

    // Wait for React to re-render without watermark
    await new Promise((r) => setTimeout(r, 120))

    try {
      const { default: html2canvas } = await import('html2canvas')
      const { jsPDF } = await import('jspdf')

      const node = cardRef.current
      const canvas = await html2canvas(node, {
        scale: 4,
        backgroundColor: null,
        useCORS: true,
        allowTaint: true,
        logging: false,
        // Capture exact card box — avoids clipping name/footer
        width: node.offsetWidth,
        height: node.offsetHeight,
        windowWidth: node.offsetWidth,
        windowHeight: node.offsetHeight,
      })

      const imgData = canvas.toDataURL('image/png')
      // ISO ID-1: 85.60 × 53.98 mm
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [85.6, 53.98],
      })
      pdf.addImage(imgData, 'PNG', 0, 0, 85.6, 53.98)
      pdf.save(`JonathanRoumie-Fan-Card-${cardName.replace(/\s+/g, '-')}.pdf`)
    } catch (err) {
      console.error(err)
      alert('Export failed. Please try again.')
    } finally {
      setExportClean(false)
      setExporting(false)
    }
  }

  const cardProps = {
    name: cardName,
    memberId,
    cardRef,
    showUnverifiedWatermark,
    background: cardBackground,
    accentColor,
    logoUrl,
    footerText,
  }

  return (
    <div
      className="min-h-screen bg-black"
      style={antiScreenshot ? { WebkitUserSelect: 'none', userSelect: 'none' } : undefined}
    >
      <Header variant="main" />

      <main className="pt-20 pb-16">
        <section className="text-center px-4 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-widest text-white mb-3">
              JONATHAN ROUMIE
            </h1>
            <p className="text-gray-400 mb-1 text-sm tracking-widest uppercase">Official</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-jcvd-red tracking-widest mb-6">
              FAN CARD
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-base leading-relaxed">
              Own an exclusive personalized fan card. Engrave your name, complete payment, and receive your
              digital card after verification.
            </p>
            {antiScreenshot && (
              <p className="text-yellow-600/80 text-xs mt-3 tracking-wide">
                Protected preview — screenshots discouraged · official download after approval only
              </p>
            )}
          </motion.div>
        </section>

        <div className="px-4 max-w-7xl mx-auto">
          {(pageState === 'apply' || pageState === 'whitelisted') && (
            <section className="mb-12">
              <FanCard3D {...cardProps} />
              {showUnverifiedWatermark && pageState === 'apply' && (
                <p className="text-center text-yellow-500/70 text-xs tracking-widest mt-2">
                  PREVIEW · WATERMARKED UNTIL PAYMENT IS VERIFIED
                </p>
              )}
            </section>
          )}

          {pageState === 'apply' && (
            <>
              <div className="max-w-md mx-auto space-y-4 mb-12">
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value.slice(0, 28))}
                  placeholder="Your Name Here"
                  maxLength={28}
                  className="w-full bg-white/5 border border-white/10 text-white px-6 py-3 rounded-xl text-center focus:outline-none focus:border-jcvd-red placeholder:text-white/20"
                />
                <button
                  type="button"
                  onClick={handleExport}
                  disabled
                  className="w-full bg-white/10 text-white/50 py-3 rounded-xl font-bold tracking-widest cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  Download after approval
                </button>
              </div>

              <section className="max-w-2xl mx-auto">
                <ApplicationForm
                  wallets={wallets}
                  methods={payMethods}
                  price={price}
                  onSuccess={handlePaymentSuccess}
                  name={cardName}
                  onNameChange={setCardName}
                />
              </section>
            </>
          )}

          {pageState === 'submitted' && (
            <section className="max-w-2xl mx-auto">
              <div className="bg-green-900/20 border border-green-800/50 rounded-2xl p-8 text-center space-y-6">
                <CheckCircle size={48} className="text-green-400 mx-auto" />
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Payment Submitted!</h3>
                  <p className="text-green-300 mb-4">
                    Request received for <span className="font-bold">{cardName}</span>
                  </p>
                  <p className="text-gray-400 text-sm">
                    Admin will verify shortly. Email:{' '}
                    <span className="font-mono text-white">{submittedEmail}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loginLoading}
                  className="w-full bg-jcvd-red hover:bg-red-700 text-white py-3 rounded-xl font-bold tracking-widest disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loginLoading ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
                  {loginLoading ? 'Signing In...' : 'Sign In with Google'}
                </button>
              </div>
            </section>
          )}

          {pageState === 'awaiting' && (
            <section className="max-w-2xl mx-auto">
              <div className="bg-blue-900/20 border border-blue-800/50 rounded-2xl p-8 text-center space-y-6">
                <Clock size={48} className="text-blue-400 mx-auto" />
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Payment Under Review</h3>
                  <p className="text-blue-300">
                    Your card stays watermarked until admin confirms payment.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-bold tracking-widest"
                >
                  Sign Out
                </button>
              </div>
            </section>
          )}

          {pageState === 'whitelisted' && (
            <section className="max-w-md mx-auto space-y-4">
              <div className="bg-green-900/20 border border-green-800/50 rounded-xl p-4 text-center">
                <CheckCircle size={32} className="text-green-400 mx-auto mb-2" />
                <h3 className="text-white font-bold">Payment Verified!</h3>
                <p className="text-green-300 text-sm mt-1">
                  You can download a clean official card (no watermark).
                </p>
              </div>
              <input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value.slice(0, 28))}
                placeholder="Your Name on Card"
                maxLength={28}
                className="w-full bg-white/5 border border-white/10 text-white px-6 py-3 rounded-xl text-center focus:outline-none focus:border-jcvd-red"
              />
              <button
                type="button"
                onClick={handleExport}
                disabled={!cardName || exporting}
                className="w-full bg-jcvd-red hover:bg-red-700 text-white py-3 rounded-xl font-bold tracking-widest disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Download size={18} />
                {exporting ? 'Generating clean PDF...' : 'DOWNLOAD OFFICIAL CARD'}
              </button>
              <button
                type="button"
                onClick={() => logout()}
                className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-bold tracking-widest"
              >
                Sign Out
              </button>
            </section>
          )}

          {pageState === 'loading' && (
            <div className="text-center py-12">
              <Loader2 size={32} className="text-jcvd-red mx-auto animate-spin mb-4" />
              <p className="text-gray-400">Loading...</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
