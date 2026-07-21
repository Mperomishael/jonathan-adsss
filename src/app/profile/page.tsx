'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { LogOut, CheckCircle, Clock, AlertCircle, Download, CreditCard, Badge, User, Copy, Check } from 'lucide-react'
import Link from 'next/link'
import { useUserAuth } from '@/components/user/UserAuthProvider'

export default function ProfilePage() {
  const { user, logout, whitelisted, fanStatus } = useUserAuth()
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (user?.uid) {
      loadUserData()
    }
  }, [user])

  const loadUserData = async () => {
    try {
      // In a real app, fetch from /api/user endpoint
      setUserData({
        email: user?.email,
        uid: user?.uid,
        cardNumber: 'JRW-1709032400000-ABC123XYZ',
        cardLevel: 'gold',
        status: fanStatus,
        approved: whitelisted && fanStatus === 'approved',
        paymentStatus: whitelisted ? 'confirmed' : 'unpaid',
        cardsGenerated: whitelisted ? 1 : 0,
        maxCards: 3,
        joinedDate: new Date().toLocaleDateString(),
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    window.location.href = '/'
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-gray-500">Loading profile...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">You are not logged in</p>
          <Link href="/fan-login" className="text-red-400 hover:text-red-300">
            Go to login
          </Link>
        </div>
      </div>
    )
  }

  const isApproved = userData?.approved
  const canDownloadCard = isApproved && userData?.paymentStatus === 'confirmed'

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/10 py-4 px-4 sticky top-0 z-10 bg-black/80 backdrop-blur">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-black tracking-widest">YOUR PROFILE</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </header>

      <main className="pt-12 pb-16 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Account Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/3 border border-white/5 rounded-2xl p-8"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-white text-2xl font-black tracking-widest mb-2">ACCOUNT STATUS</h2>
                <p className="text-gray-400">{userData?.email}</p>
              </div>
              <span className={`text-xs px-4 py-2 rounded-full font-semibold tracking-widest ${
                isApproved
                  ? 'bg-green-900/30 text-green-300'
                  : 'bg-yellow-900/30 text-yellow-300'
              }`}>
                {isApproved ? 'APPROVED' : 'PENDING'}
              </span>
            </div>

            {!isApproved ? (
              <div className="bg-yellow-900/20 border border-yellow-800/30 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Clock size={20} className="text-yellow-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-yellow-300 font-semibold mb-1">Application Under Review</p>
                    <p className="text-yellow-200 text-sm">
                      Your application is being reviewed by our admin team. You'll be notified once approved.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-green-900/20 border border-green-800/30 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-green-300 font-semibold mb-1">Account Verified</p>
                    <p className="text-green-200 text-sm">
                      Your account has been approved. Download your verified fan card below.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-gray-400 text-xs tracking-widest mb-1">CARD LEVEL</p>
                <p className="text-white font-bold capitalize">{userData?.cardLevel || 'Silver'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs tracking-widest mb-1">CARD NUMBER</p>
                <p className="text-white font-bold text-sm">{userData?.cardNumber || 'Pending'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs tracking-widest mb-1">CARDS CREATED</p>
                <p className="text-white font-bold">
                  {userData?.cardsGenerated}/{userData?.maxCards}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs tracking-widest mb-1">MEMBER SINCE</p>
                <p className="text-white font-bold text-sm">{userData?.joinedDate}</p>
              </div>
            </div>
          </motion.div>

          {/* Card Details */}
          {isApproved && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/3 border border-white/5 rounded-2xl p-8"
            >
              <h2 className="text-white text-xl font-black tracking-widest mb-6">YOUR FAN CARD</h2>

              {/* Card Number Display */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
                <p className="text-gray-400 text-xs tracking-widest mb-3">CARD NUMBER</p>
                <div className="flex items-center justify-between">
                  <p className="text-white font-mono text-xl tracking-wider">{userData?.cardNumber}</p>
                  <button
                    onClick={() => copyToClipboard(userData?.cardNumber)}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>
              </div>

              {/* Download Section */}
              {canDownloadCard ? (
                <Link
                  href="/fan-card"
                  className="block w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold tracking-widest transition-colors flex items-center justify-center gap-3 text-center"
                >
                  <Download size={20} />
                  CREATE & DOWNLOAD CARD
                </Link>
              ) : (
                <div className="bg-yellow-900/20 border border-yellow-800/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-yellow-300 mb-2">
                    <AlertCircle size={18} />
                    <p className="font-semibold">Complete Payment to Download</p>
                  </div>
                  <p className="text-yellow-200 text-sm">
                    Your application has been approved, but payment confirmation is pending.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Membership Upgrade */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-red-900/20 to-purple-900/20 border border-red-800/30 rounded-2xl p-8"
          >
            <h2 className="text-white text-xl font-black tracking-widest mb-6">UPGRADE MEMBERSHIP</h2>
            <p className="text-gray-400 mb-6">
              You currently have a {userData?.cardLevel} fan card. Upgrade to access more features.
            </p>
            <Link
              href="/checkout"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-bold tracking-widest transition-colors"
            >
              <CreditCard size={18} />
              UPGRADE NOW
            </Link>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
