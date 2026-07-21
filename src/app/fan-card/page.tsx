'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import {
  Download, CreditCard, Sparkles, CheckCircle, Copy, Check,
  Bitcoin, Clock, AlertCircle, Loader2, LogIn, Mail, User as UserIcon, Truck, MapPin,
} from 'lucide-react'
import Image from 'next/image'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { useUserAuth } from '@/components/user/UserAuthProvider'
import { useFirestoreListener } from '@/hooks/useFirestoreListener'

// ─── 3D Fan Card ──────────────────────────────────────────────────────────────

function FanCard3D({
  name,
  memberId,
  cardRef,
}: {
  name: string
  memberId: string
  cardRef: React.RefObject<HTMLDivElement>
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

  return (
    <div
      ref={containerRef}
      onMouseMove={(e) => {
        const r = containerRef.current?.getBoundingClientRect()
        if (!r) return
        mouseX.set((e.clientX - r.left) / r.width - 0.5)
        mouseY.set((e.clientY - r.top) / r.height - 0.5)
      }}
      onMouseLeave={() => { mouseX.set(0); mouseY.set(0) }}
      onContextMenu={(e) => e.preventDefault()}
      className="flex items-center justify-center p-8 select-none"
      style={{ perspective: '1000px', WebkitUserSelect: 'none' }}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        animate={vibrating ? { x: [-3, 3, -3, 3, 0], transition: { duration: 0.25 } } : {}}
        className="relative w-[340px] h-[210px] cursor-pointer"
      >
        <div
          ref={cardRef}
          className="absolute inset-0 rounded-2xl overflow-hidden select-none"
          style={{
            background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
            boxShadow: '0 25px 60px rgba(255,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.08)',
          }}
        >
          <motion.div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{ background: `radial-gradient(circle at ${glareX.get()} ${glareY.get()}, rgba(255,255,255,0.4) 0%, transparent 60%)` }}
          />
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-jcvd-red via-red-400 to-jcvd-red" />
          <div className="absolute top-5 left-5 w-10 h-7 rounded bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center">
            <div className="grid grid-cols-2 gap-0.5 opacity-60">
              {[...Array(4)].map((_, i) => <div key={i} className="w-1.5 h-1.5 bg-yellow-700 rounded-sm" />)}
            </div>
          </div>
          <div className="absolute top-4 right-4 w-12 h-12 rounded-full overflow-hidden border-2 border-jcvd-red/60">
            <Image src="/images/jvcd-avatar.jpg" alt="Jonathan Roumie" fill className="object-cover" />
          </div>
          <div className="absolute top-[52px] left-5">
            <p className="text-white/40 text-[9px] tracking-[0.3em] uppercase">Official Member</p>
            <p className="text-white text-xs font-bold tracking-[0.25em]">JONATHAN ROUMIE</p>
          </div>
          <div className="absolute bottom-10 left-5 right-5">
            <motion.p
              key={name}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="text-white font-bold tracking-[0.15em] uppercase truncate"
              style={{
                fontSize: name.length > 20 ? '13px' : name.length > 12 ? '16px' : '20px',
                textShadow: '0 0 20px rgba(255,0,0,0.6)',
              }}
            >
              {display}
            </motion.p>
          </div>
          <div className="absolute bottom-3 left-5 right-5 flex justify-between">
            <p className="text-white/40 text-[10px] tracking-widest font-mono">{memberId}</p>
            <p className="text-white/40 text-[10px] tracking-widest">{year}</p>
          </div>
          <svg className="absolute inset-0 w-full h-full opacity-5 pointer-events-none" viewBox="0 0 340 210">
            <line x1="0" y1="100" x2="340" y2="100" stroke="white" strokeWidth="0.5" />
            <line x1="170" y1="0" x2="170" y2="210" stroke="white" strokeWidth="0.5" />
            <circle cx="170" cy="100" r="40" stroke="white" strokeWidth="0.5" fill="none" />
          </svg>
        </div>
        <div className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ transform: 'translateZ(-4px)', background: '#0a0a1a', boxShadow: '0 30px 60px rgba(0,0,0,0.6)' }} />
      </motion.div>
    </div>
  )
}

// ─── Copy Button ───────────────────────────────────────────────────────────────

function CopyButton({ address }: { address: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(address)
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      }}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${copied
          ? 'bg-green-900/40 border border-green-600/50 text-green-300'
          : 'bg-white/8 border border-white/10 text-gray-300 hover:bg-white/15'
        }`}
    >
      <AnimatePresence mode="wait">
        {copied
          ? <motion.span key="y" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1.5"><Check size={14} />Copied!</motion.span>
          : <motion.span key="n" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1.5"><Copy size={14} />Copy Address</motion.span>
        }
      </AnimatePresence>
    </button>
  )
}

// ─── Wallet Display ────────────────────────────────────────────────────────────

type PayMethod = 'USDT' | 'BTC'

interface Wallets {
  btc?: { address: string }
  usdt?: { address: string }
}

function WalletDisplay({
  method, wallets, priceUsd,
}: {
  method: PayMethod
  wallets: Wallets
  priceUsd: string
}) {
  const address = method === 'BTC' ? wallets.btc?.address : wallets.usdt?.address
  if (!address) return null

  const isBtc = method === 'BTC'
  const color = isBtc ? 'orange' : 'green'
  const border = isBtc ? 'border-orange-800/30 bg-orange-950/20' : 'border-green-800/30 bg-green-950/20'

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={method}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
        className={`rounded-xl border p-5 space-y-4 ${border}`}
      >
        <div className="flex items-center gap-2">
          {isBtc
            ? <Bitcoin size={16} className="text-orange-400" />
            : <span className="text-green-400 font-black text-sm">₮</span>
          }
          <p className="text-xs tracking-widest uppercase text-white/50 font-semibold">
            {isBtc ? 'Bitcoin (BTC) Address' : 'USDT — ERC-20 Ethereum'}
          </p>
        </div>

        <div className="bg-black/50 border border-white/10 rounded-lg px-4 py-3">
          <p className="font-mono text-sm text-white break-all leading-relaxed select-all">{address}</p>
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

        <div className="space-y-2 pt-1">
          {[
            isBtc ? 'Convert $' + priceUsd + ' to BTC at current market rate' : 'Send via ERC-20 network (Ethereum)',
            'Copy the address above — double-check before sending',
            'After sending, fill in your details below and submit',
          ].map((txt, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className={`w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center text-[9px] font-bold mt-0.5 ${isBtc ? 'bg-orange-900/60 text-orange-300' : 'bg-green-900/60 text-green-300'
                }`}>{i + 1}</span>
              <p className="text-gray-400 text-xs leading-relaxed">{txt}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Application Form ──────────────────────────────────────────────────────────

function ApplicationForm({
  wallets,
  price,
  onSuccess,
  name,
  onNameChange,
}: {
  wallets: Wallets
  price: number
  onSuccess: (email: string) => void
  name: string
  onNameChange: (n: string) => void
}) {
  const hasBtc = !!wallets.btc?.address
  const hasUsdt = !!wallets.usdt?.address
  const [email, setEmail] = useState('')
  const [method, setMethod] = useState<PayMethod>(hasUsdt ? 'USDT' : 'BTC')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [addWaybill, setAddWaybill] = useState(false)
  const [shippingAddress, setShippingAddress] = useState('')

  const waybillPrice = 23.00
  const priceUsd = (price / 100).toFixed(2)
  const totalPrice = addWaybill 
    ? (parseFloat(priceUsd) + waybillPrice).toFixed(2)
    : priceUsd

  const handleSubmit = async () => {
    setError(null)
    if (!name.trim()) { setError('Please enter the name to engrave on your card.'); return }
    if (!email.trim() || !email.includes('@')) { setError('Please enter a valid email address.'); return }
    if (addWaybill && !shippingAddress.trim()) { setError('Please enter your shipping address for waybill.'); return }
    const addr = method === 'BTC' ? wallets.btc?.address : wallets.usdt?.address
    if (!addr) { setError('Payment method not available. Please try the other option.'); return }

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

  if (!hasBtc && !hasUsdt) {
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
      {/* Price header */}
      <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-5 py-4">
        <div>
          <p className="text-gray-500 text-xs tracking-widest uppercase mb-0.5">Jonathan Roumie</p>
          <p className="text-white font-bold">Official Fan Card</p>
        </div>
        <div className="text-right">
          <p className="text-white text-2xl font-black">${totalPrice}</p>
          <p className="text-gray-500 text-xs">{addWaybill ? `Card + Waybill` : 'Digital Only'}</p>
        </div>
      </div>

      {/* Waybill Option */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
        <button
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
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 pt-4 border-t border-white/10 space-y-3"
          >
            <label className="flex items-center gap-2 text-gray-400 text-xs tracking-widest uppercase mb-2">
              <MapPin size={12} />
              Shipping Address
            </label>
            <textarea
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="Enter your full mailing address..."
              className="w-full bg-black/30 border border-white/10 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-jcvd-red transition-colors placeholder:text-white/20 text-sm resize-none"
              rows={4}
            />
            <p className="text-gray-500 text-xs">Include street address, city, state, ZIP, and country</p>
          </motion.div>
        )}
      </div>

      {/* Payment method */}
      {hasBtc && hasUsdt && (
        <div>
          <p className="text-gray-400 text-xs tracking-widest uppercase mb-2">Choose Payment Method</p>
          <div className="flex gap-2">
            {(['USDT', 'BTC'] as PayMethod[]).map((m) => (
              <button
                key={m}
                onClick={() => setMethod(m)}
                className={`flex-1 py-3 rounded-xl text-sm font-bold tracking-widest transition-all ${method === m
                    ? m === 'USDT'
                      ? 'bg-green-900/40 border border-green-600/60 text-green-300'
                      : 'bg-orange-900/40 border border-orange-600/60 text-orange-300'
                    : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/8'
                  }`}
              >
                {m === 'BTC' ? '₿ BITCOIN' : '₮ USDT'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Wallet address */}
      <WalletDisplay method={method} wallets={wallets} priceUsd={priceUsd} />

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-white/8" />
        <p className="text-gray-600 text-xs tracking-widest">AFTER SENDING, FILL IN BELOW</p>
        <div className="flex-1 h-px bg-white/8" />
      </div>

      {/* Name field */}
      <div>
        <label className="flex items-center gap-2 text-gray-400 text-xs tracking-widest uppercase mb-2">
          <UserIcon size={12} />
          Name to Engrave on Card
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value.slice(0, 30))}
          placeholder="Your Full Name"
          className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-jcvd-red transition-colors placeholder:text-white/20 text-lg tracking-widest text-center"
        />
        <p className="text-right text-white/20 text-xs mt-1">{name.length}/30</p>
      </div>

      {/* Email field */}
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
          className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-jcvd-red transition-colors placeholder:text-white/20"
        />
        <p className="text-gray-600 text-xs mt-1.5">
          Used to link your payment. Sign in with this Google account later to download.
        </p>
      </div>

      {/* Error */}
      {error && (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 bg-red-900/20 border border-red-800/40 rounded-xl px-4 py-3"
        >
          <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-300 text-sm">{error}</p>
        </motion.div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full bg-jcvd-red hover:bg-red-700 active:bg-red-800 text-white py-4 rounded-xl font-bold tracking-widest transition-all disabled:opacity-60 flex items-center justify-center gap-3"
      >
        {submitting
          ? <><Loader2 size={20} className="animate-spin" />Submitting...</>
          : <><CheckCircle size={20} />I HAVE SENT PAYMENT</>
        }
      </button>

      <p className="text-center text-gray-600 text-xs">
        Only submit after you have actually sent the crypto. Admin verifies every payment manually.
      </p>
    </div>
  )
}

type PageState = 'loading' | 'apply' | 'submitted' | 'awaiting' | 'whitelisted'

interface CryptoWalletsData {
  btc?: { address: string; verified?: boolean }
  usdt?: { address: string; verified?: boolean }
  updatedAt?: string
  updatedBy?: string
}

export default function FanCardPage() {
  const { user, loading: authLoading, whitelisted, login, logout, getToken } = useUserAuth()
  
  // Real-time listener for crypto wallets
  const { data: firestoreWallets, loading: walletsLoading } = useFirestoreListener<CryptoWalletsData>('pageSettings', 'cryptoWallets')
  const { data: fanCardSettings, loading: priceLoadingFirestore } = useFirestoreListener<{ price?: number }>('pageSettings', 'fanCard')

  const [pageState, setPageState] = useState<PageState>('loading')
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [wallets, setWallets] = useState<Wallets>({})
  const [price, setPrice] = useState(499)
  const [cardName, setCardName] = useState('')
  const [exporting, setExporting] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)

  const cardRef = useRef<HTMLDivElement>(null)
  const canDownload = pageState === 'whitelisted'

  const memberId = `JR-${Math.abs(
    cardName.split('').reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0x12345)
  ).toString().slice(0, 6).padStart(6, '0')}`

  // Sync Firestore wallet data to local state
  useEffect(() => {
    if (firestoreWallets) {
      console.log('[Fan Card] Syncing Firestore wallet data:', firestoreWallets)
      const walletsData: Wallets = {}
      
      if (firestoreWallets.btc?.address) {
        walletsData.btc = { address: firestoreWallets.btc.address }
      }
      
      if (firestoreWallets.usdt?.address) {
        walletsData.usdt = { address: firestoreWallets.usdt.address }
      }
      
      setWallets(walletsData)
    }
  }, [firestoreWallets])

  // Sync the fan-card price directly from admin-controlled Firestore settings.
  useEffect(() => {
    if (fanCardSettings?.price !== undefined) {
      setPrice(Number(fanCardSettings.price) || 499)
      return
    }

    setPrice(499)
  }, [fanCardSettings])
  // Determine page state based on auth + whitelist status
  useEffect(() => {
    if (authLoading) { setPageState('loading'); return }

    if (user) {
      // Signed in — check whitelisted field from UserAuthProvider
      if (whitelisted) {
        setPageState('whitelisted')
      } else {
        // Also check paymentStatus via API to distinguish apply vs awaiting
        const checkStatus = async () => {
          try {
            const token = await getToken()
            if (!token) { setPageState('apply'); return }
            const res = await fetch('/api/user/status', { headers: { Authorization: `Bearer ${token}` } })
            if (!res.ok) { setPageState('apply'); return }
            const data = await res.json()
            if (data.paymentStatus === 'pending' || data.paymentStatus === 'confirmed') {
              setPageState('awaiting')
            } else {
              setPageState('apply')
            }
          } catch { setPageState('apply') }
        }
        checkStatus()
      }
    } else {
      // Not signed in
      setPageState(pageState === 'submitted' ? 'submitted' : 'apply')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, whitelisted])

  const handlePaymentSuccess = async (email: string) => {
    setSubmittedEmail(email)
    setPageState('submitted')
    // Auto-trigger Google sign-in after a short delay so user can see the success message
    setTimeout(async () => {
      try {
        await login()
      } catch {
        // Silent — user can manually sign in from the submitted state UI
      }
    }, 2200)
  }

  const handleGoogleSignIn = async () => {
    setLoginLoading(true)
    try {
      await login() // triggers Google redirect
    } catch { setLoginLoading(false) }
  }

  const handleExport = async () => {
    if (!cardName.trim()) {
      alert('Enter your name to engrave on the card first.')
      return
    }

    if (pageState !== 'whitelisted') {
      alert('Downloads are only available after payment is verified and approved by admin. Please complete payment and wait for approval before downloading your Fan Card.')
      return
    }

    setExporting(true)
    try {
      const { default: html2canvas } = await import('html2canvas')
      const { jsPDF } = await import('jspdf')
      if (!cardRef.current) return
      const canvas = await html2canvas(cardRef.current, { scale: 3, backgroundColor: null, useCORS: true })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [85.6, 53.98] })
      pdf.addImage(imgData, 'PNG', 0, 0, 85.6, 53.98)
      pdf.save(`JonathanRoumie-Fan-Card-${cardName.replace(/\s+/g, '-')}.pdf`)
    } catch (err) {
      console.error(err)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <Header variant="main" />

      <main className="pt-20 pb-16">
        {/* ── Hero ── */}
        <section className="text-center px-4 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-widest text-white mb-3">
              JONATHAN ROUMIE
            </h1>
            <p className="text-gray-400 mb-1 text-sm tracking-widest uppercase">Official</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-jcvd-red tracking-widest mb-6">
              FAN CARD
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-base leading-relaxed">
              Own an exclusive personalized fan card. Engrave your name, complete payment, and receive your digital/physical card.
            </p>
          </motion.div>
        </section>

        <div className="px-4 max-w-7xl mx-auto">
          {/* ── Card Preview Section ── */}
          {pageState === 'apply' && (
            <section className="mb-16">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
                <FanCard3D name={cardName} memberId={memberId} cardRef={cardRef} />
              </motion.div>

              {/* Name input below card */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="max-w-md mx-auto space-y-4">
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value.slice(0, 30))}
                  placeholder="Your Name Here"
                  autoFocus
                  className="w-full bg-white/5 border border-white/10 text-white px-6 py-3 rounded-xl text-center focus:outline-none focus:border-jcvd-red transition-colors placeholder:text-white/20"
                />

                <div className="flex gap-2 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleExport}
                    disabled={!cardName || exporting || !canDownload}
                    className="flex-1 bg-jcvd-red hover:bg-red-700 text-white py-3 rounded-xl font-bold tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Download size={18} />
                    {exporting
                      ? 'Exporting...'
                      : canDownload
                        ? 'Download Card'
                        : 'Download after approval'
                    }
                  </motion.button>
                </div>
              </motion.div>
            </section>
          )}

          {/* ── Form Section ── */}
          {pageState === 'apply' && (
            <section className="max-w-2xl mx-auto">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <ApplicationForm
                  wallets={wallets}
                  price={price}
                  onSuccess={handlePaymentSuccess}
                  name={cardName}
                  onNameChange={setCardName}
                />
              </motion.div>
            </section>
          )}

          {/* ── Submitted State ── */}
          {pageState === 'submitted' && (
            <section className="max-w-2xl mx-auto">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-green-900/20 border border-green-800/50 rounded-2xl p-8 text-center space-y-6">
                <CheckCircle size={48} className="text-green-400 mx-auto" />
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Payment Submitted!</h3>
                  <p className="text-green-300 mb-4">
                    We&apos;ve received your payment request for <span className="font-bold">{cardName}</span>
                  </p>
                  <p className="text-gray-400 text-sm">
                    Admin will verify your payment shortly. Watch for an email at <span className="font-mono text-white">{submittedEmail}</span>
                  </p>
                </div>

                <button
                  onClick={handleGoogleSignIn}
                  disabled={loginLoading}
                  className="w-full bg-jcvd-red hover:bg-red-700 text-white py-3 rounded-xl font-bold tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loginLoading ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
                  {loginLoading ? 'Signing In...' : 'Sign In with Google'}
                </button>

                <p className="text-gray-500 text-xs">
                  Use the same Google account email you provided above.
                </p>
              </motion.div>
            </section>
          )}

          {/* ── Awaiting Verification ── */}
          {pageState === 'awaiting' && (
            <section className="max-w-2xl mx-auto">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-blue-900/20 border border-blue-800/50 rounded-2xl p-8 text-center space-y-6">
                <Clock size={48} className="text-blue-400 mx-auto animate-spin" />
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Payment Under Review</h3>
                  <p className="text-blue-300">
                    Your payment is being verified. You&apos;ll receive an email confirmation soon.
                  </p>
                </div>

                <button
                  onClick={() => logout()}
                  className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-bold tracking-widest transition-all"
                >
                  Sign Out
                </button>
              </motion.div>
            </section>
          )}

          {/* ── Whitelisted ── */}
          {pageState === 'whitelisted' && (
            <section className="mb-16">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
                <FanCard3D name={cardName} memberId={memberId} cardRef={cardRef} />
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="max-w-md mx-auto space-y-4">
                <div className="bg-green-900/20 border border-green-800/50 rounded-xl p-4 text-center mb-4">
                  <CheckCircle size={32} className="text-green-400 mx-auto mb-2" />
                  <h3 className="text-white font-bold">Payment Verified!</h3>
                  <p className="text-green-300 text-sm mt-1">Your card is now ready for download.</p>
                </div>

                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value.slice(0, 30))}
                  placeholder="Your Name on Card"
                  className="w-full bg-white/5 border border-white/10 text-white px-6 py-3 rounded-xl text-center focus:outline-none focus:border-jcvd-red transition-colors placeholder:text-white/20"
                />

                <div className="flex gap-2 flex-col">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleExport}
                    disabled={!cardName || exporting}
                    className="w-full bg-jcvd-red hover:bg-red-700 text-white py-3 rounded-xl font-bold tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Download size={18} />
                    {exporting ? 'Downloading...' : 'DOWNLOAD CARD'}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => logout()}
                    className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-bold tracking-widest transition-all"
                  >
                    Sign Out
                  </motion.button>
                </div>
              </motion.div>
            </section>
          )}

          {/* ── Loading ── */}
          {pageState === 'loading' && (
            <section className="max-w-2xl mx-auto">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                <Loader2 size={32} className="text-jcvd-red mx-auto animate-spin mb-4" />
                <p className="text-gray-400">Loading...</p>
              </motion.div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
