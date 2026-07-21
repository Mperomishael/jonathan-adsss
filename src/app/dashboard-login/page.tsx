'use client'

import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { Mail, Lock, AlertCircle, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function DashboardLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!auth) throw new Error('Firebase not initialized')
      
      console.log('[Dashboard Login] Attempting login:', email)
      const result = await signInWithEmailAndPassword(auth, email, password)
      console.log('[Dashboard Login] Success:', result.user.uid)
      
      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err: any) {
      console.error('[Dashboard Login] Error:', err.message)
      const errorMsg = 
        err.code === 'auth/user-not-found' ? 'Email not found. Please apply first.' :
        err.code === 'auth/wrong-password' ? 'Incorrect password' :
        err.code === 'auth/invalid-email' ? 'Invalid email address' :
        err.code === 'auth/user-disabled' ? 'Account has been disabled' :
        err.message || 'Login failed'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10 py-4 px-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-black tracking-widest">JONATHAN ROUMIE WORLD</h1>
          <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={18} />
            Back
          </Link>
        </div>
      </header>

      <main className="pt-32 pb-16 px-4">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="w-16 h-16 rounded-full bg-blue-900/30 flex items-center justify-center mx-auto mb-6">
              <Lock size={32} className="text-blue-400" />
            </div>
            <h2 className="text-3xl font-black tracking-widest mb-2">FAN DASHBOARD</h2>
            <p className="text-gray-400">Access your card status and profile</p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleLogin}
            className="bg-white/3 border border-white/10 rounded-2xl p-8 space-y-6"
          >
            {error && (
              <div className="flex items-center gap-3 bg-red-900/20 border border-red-800/50 rounded-lg p-4 text-red-300">
                <AlertCircle size={18} className="flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div>
              <label className="text-gray-400 text-xs tracking-widest block mb-2">EMAIL ADDRESS</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-white/5 border border-white/10 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="text-gray-400 text-xs tracking-widest block mb-2">PASSWORD</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  required
                  disabled={loading}
                />
              </div>
              <p className="text-gray-500 text-xs mt-2">
                Check your email for your temporary password sent after application
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-lg font-semibold tracking-widest transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  SIGNING IN...
                </>
              ) : (
                'SIGN IN'
              )}
            </button>

            <div className="text-center pt-4 border-t border-white/10">
              <p className="text-gray-400 text-sm mb-3">Don&apos;t have an account?</p>
              <Link
                href="/apply-card"
                className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
              >
                Apply for Card →
              </Link>
            </div>
          </motion.form>
        </div>
      </main>
    </div>
  )
}
