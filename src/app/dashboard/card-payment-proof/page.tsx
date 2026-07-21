'use client'

import { useState, useEffect } from 'react'
import { useUserAuth } from '@/components/user/UserAuthProvider'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Upload, CheckCircle, AlertCircle, Loader2, Copy, Check } from 'lucide-react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function PaymentProofPage() {
  const { user, loading, getToken } = useUserAuth()
  const router = useRouter()
  const [paymentProofUrl, setPaymentProofUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [confirmPaid, setConfirmPaid] = useState(false)
  const [copiedWallet, setCopiedWallet] = useState<'btc' | 'usdt' | 'cashapp' | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'btc' | 'usdt' | 'cashapp'>('btc')
  const [paymentConfig, setPaymentConfig] = useState<any>(null)

  // Load payment configuration from admin
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const res = await fetch('/api/admin/card-pricing')
        if (res.ok) {
          const data = await res.json()
          setPaymentConfig(data)
        }
      } catch (err) {
        console.error('Failed to load payment config')
      }
    }
    loadConfig()
  }, [])

  const copyToClipboard = (address: string, type: 'btc' | 'usdt' | 'cashapp') => {
    navigator.clipboard.writeText(address)
    setCopiedWallet(type)
    setTimeout(() => setCopiedWallet(null), 2000)
  }

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, router])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      // For now, store as data URL. In production, use a proper storage service
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setPaymentProofUrl(event.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    } catch (err) {
      setError('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async () => {
    if (!confirmPaid || !paymentProofUrl) {
      setError('Please confirm payment and upload proof')
      return
    }

    setUploading(true)
    setError('')

    try {
      const token = await getToken()
      if (!token) return

      const res = await fetch('/api/user/submit-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          paymentProofUrl,
        }),
      })

      if (res.ok) {
        setSubmitted(true)
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } else {
        setError('Failed to submit payment')
      }
    } catch (err) {
      setError('Error submitting payment')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  if (submitted) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 max-w-2xl mx-auto px-4"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <CheckCircle size={64} className="text-blue-400 mx-auto" />
          </motion.div>
          <div>
            <h2 className="text-3xl font-black tracking-widest mb-2">PAYMENT BEING VERIFIED</h2>
            <p className="text-gray-300 text-lg mb-4">
              Your payment proof has been received. Our admin team is verifying your transaction.
            </p>
          </div>

          <div className="bg-blue-900/20 border border-blue-800/50 rounded-2xl p-6 space-y-3">
            <p className="text-blue-300 font-bold">NEXT STEPS:</p>
            <ul className="space-y-2 text-gray-300 text-sm text-left">
              <li>✓ Admin will verify your payment within 24 hours</li>
              <li>✓ You&apos;ll be whitelisted once approved</li>
              <li>✓ You&apos;ll receive an email notification</li>
              <li>✓ After whitelist, you can generate your fan card</li>
            </ul>
          </div>

          <p className="text-gray-400 text-sm">Redirecting to dashboard in a moment...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header variant="main" />
      
      <main className="flex-1 py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-widest mb-4">UPLOAD PAYMENT PROOF</h1>
              <p className="text-gray-400 text-lg">Please upload screenshot or receipt of your payment transaction</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">
              {error && (
                <div className="flex items-center gap-3 bg-red-900/20 border border-red-800/50 rounded-lg p-4 text-red-300">
                  <AlertCircle size={18} />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Payment Method Selector */}
              <div className="border-b border-white/10 pb-6 space-y-4">
                <h2 className="text-xl font-black tracking-widest mb-4">SELECT PAYMENT METHOD</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {['btc', 'usdt', 'cashapp'].map((method: any) => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        paymentMethod === method
                          ? 'bg-blue-600/20 border-blue-500'
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <p className="font-bold tracking-widest text-white">
                        {method === 'btc' ? '₿ BITCOIN' : method === 'usdt' ? '◎ USDT' : '$ CASHAPP'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Address Display */}
              <div className="border-b border-white/10 pb-6 space-y-4">
                <h2 className="text-xl font-black tracking-widest">PAYMENT DETAILS</h2>
                <p className="text-gray-400 text-sm">Copy the address below and send your payment. Then upload proof.</p>

                {paymentMethod === 'btc' && (
                  <div className="bg-white/3 border border-orange-500/30 rounded-xl p-4">
                    <p className="text-gray-400 text-xs tracking-widest mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                      BITCOIN WALLET ADDRESS
                    </p>
                    <div className="flex items-center gap-2 bg-black/50 rounded-lg p-3">
                      <code className="text-white text-xs font-mono flex-1 break-all">
                        {paymentConfig?.btcAddress || '1A1z7agoat2LWLCZFBX3xCjYjnAEoM81tS'}
                      </code>
                      <button
                        onClick={() => copyToClipboard(paymentConfig?.btcAddress || '1A1z7agoat2LWLCZFBX3xCjYjnAEoM81tS', 'btc')}
                        className="flex-shrink-0 p-2 hover:bg-white/10 rounded transition-colors"
                      >
                        {copiedWallet === 'btc' ? (
                          <Check size={16} className="text-green-400" />
                        ) : (
                          <Copy size={16} className="text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {paymentMethod === 'usdt' && (
                  <div className="bg-white/3 border border-green-500/30 rounded-xl p-4">
                    <p className="text-gray-400 text-xs tracking-widest mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      USDT WALLET ADDRESS (ERC-20)
                    </p>
                    <div className="flex items-center gap-2 bg-black/50 rounded-lg p-3">
                      <code className="text-white text-xs font-mono flex-1 break-all">
                        {paymentConfig?.usdtAddress || '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'}
                      </code>
                      <button
                        onClick={() => copyToClipboard(paymentConfig?.usdtAddress || '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', 'usdt')}
                        className="flex-shrink-0 p-2 hover:bg-white/10 rounded transition-colors"
                      >
                        {copiedWallet === 'usdt' ? (
                          <Check size={16} className="text-green-400" />
                        ) : (
                          <Copy size={16} className="text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {paymentMethod === 'cashapp' && (
                  <div className="bg-white/3 border border-blue-500/30 rounded-xl p-4">
                    <p className="text-gray-400 text-xs tracking-widest mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      CASHAPP ACCOUNT
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 bg-black/50 rounded-lg p-3">
                        <code className="text-white text-xs font-mono flex-1 break-all">
                          {paymentConfig?.cashappAccount || '$jonathanroumie'}
                        </code>
                        <button
                          onClick={() => copyToClipboard(paymentConfig?.cashappAccount || '$jonathanroumie', 'cashapp')}
                          className="flex-shrink-0 p-2 hover:bg-white/10 rounded transition-colors"
                        >
                          {copiedWallet === 'cashapp' ? (
                            <Check size={16} className="text-green-400" />
                          ) : (
                            <Copy size={16} className="text-gray-400" />
                          )}
                        </button>
                      </div>
                      <p className="text-gray-400 text-xs">Account: {paymentConfig?.cashappName || 'Jonathan Roumie Fan Cards'}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* File Upload Area */}
              <div>
                <label className="text-gray-400 text-xs tracking-widest block mb-4">PAYMENT PROOF</label>
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                  <div className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                    paymentProofUrl
                      ? 'border-green-500 bg-green-900/10'
                      : 'border-white/20 hover:border-white/40 bg-white/2'
                  }`}>
                    {paymentProofUrl ? (
                      <div className="space-y-4">
                        <img
                          src={paymentProofUrl}
                          alt="Payment Proof"
                          className="w-32 h-32 object-cover rounded-lg mx-auto"
                        />
                        <p className="text-green-400 font-semibold">✓ Image uploaded</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload size={32} className="mx-auto text-gray-400" />
                        <p className="text-white font-semibold">Click to upload payment proof</p>
                        <p className="text-gray-400 text-sm">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    )}
                  </div>
                </label>
              </div>

              {/* Confirmation Checkbox */}
              <div className="border-t border-white/10 pt-6 space-y-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmPaid}
                    onChange={(e) => setConfirmPaid(e.target.checked)}
                    className="w-5 h-5 rounded mt-1 cursor-pointer"
                  />
                  <span className="text-gray-300 text-sm">
                    I confirm that I have completed the payment of <span className="font-bold">$50 USD</span> for the Jonathan Roumie Fan Card and uploaded valid proof of transaction.
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Link
                  href="/dashboard/card-payment"
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white py-4 rounded-xl font-bold tracking-widest transition-colors text-center border border-white/20"
                >
                  BACK
                </Link>
                <button
                  onClick={handleSubmit}
                  disabled={uploading || !paymentProofUrl || !confirmPaid}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-4 rounded-xl font-bold tracking-widest transition-colors flex items-center justify-center gap-3"
                >
                  {uploading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      SUBMITTING...
                    </>
                  ) : (
                    'SUBMIT PAYMENT'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer variant="main" />
    </div>
  )
}
