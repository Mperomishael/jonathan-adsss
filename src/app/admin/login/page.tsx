'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, AlertCircle, Loader2, Chrome } from 'lucide-react'
import { useAdminAuth } from '@/components/admin/AdminAuthProvider'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const { loginWithGoogle, loginWithEmailPassword, loading, error, clearError, user, adminRole } = useAdminAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // If already authenticated, redirect immediately
  useEffect(() => {
    if (user && adminRole) router.replace('/admin')
  }, [user, adminRole, router])

  const handleGoogleLogin = async () => {
    setIsSubmitting(true)
    try {
      await loginWithGoogle()
    } catch (e) {
      console.error('[Admin Login] Google login failed:', e)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEmailLogin = async () => {
    setIsSubmitting(true)
    try {
      await loginWithEmailPassword(email.trim(), password)
    } catch (e) {
      console.error('[Admin Login] Email login failed:', e)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isLoading = loading || isSubmitting

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, #1a0000 0%, #000 60%)' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-red-950/40 border border-red-800/40 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ boxShadow: '0 0 40px #ff000040' }}>
            <Shield size={36} className="text-red-500" />
          </div>
          <h1 className="text-white text-3xl font-black tracking-[0.3em]">ADMIN</h1>
          <p className="text-gray-500 text-xs tracking-[0.3em] mt-1">JONATHAN ROUMIE CONTROL PANEL</p>
        </div>

        {/* Card */}
        <div className="bg-white/3 border border-white/8 rounded-2xl p-8 space-y-6">

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-950/40 border border-red-800/60 rounded-xl p-4 flex gap-3"
            >
              <AlertCircle className="text-red-400 flex-shrink-0 w-5 h-5 mt-0.5" />
              <div>
                <p className="text-red-300 text-sm font-semibold mb-1">Authentication Failed</p>
                <p className="text-red-400/80 text-xs leading-relaxed font-mono break-words">{error}</p>
                <button onClick={clearError} className="text-red-400 text-xs underline mt-2 hover:text-red-300">Dismiss</button>
              </div>
            </motion.div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <Loader2 size={28} className="text-red-500 animate-spin" />
              <p className="text-gray-400 text-sm text-center">Authenticating...</p>
            </div>
          ) : (
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full bg-white text-black py-3 rounded-lg font-bold tracking-wide hover:bg-gray-100 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              <Chrome size={20} />
              Sign In with Google
            </button>
          )}

          <div className="relative py-4">
            <div className="absolute inset-x-0 top-1/2 border-t border-white/10" />
            <div className="relative bg-black px-4 text-center text-gray-400 text-xs uppercase tracking-[0.35em]">
              or sign in with email
            </div>
          </div>

          <div className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Admin email"
              className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:border-white focus:outline-none"
            />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:border-white focus:outline-none"
            />
            <button
              onClick={handleEmailLogin}
              disabled={isLoading || !email.trim() || !password}
              className="w-full bg-red-600 text-white py-3 rounded-lg font-bold tracking-wide hover:bg-red-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sign In with Email
            </button>
          </div>

          <p className="text-center text-gray-600 text-xs">
            Authorized admin emails only.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
