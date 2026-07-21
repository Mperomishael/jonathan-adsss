'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Loader, LogOut, Lock, Mail, CheckCircle, AlertCircle, Gift, Star, TrendingUp } from 'lucide-react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  Auth,
  User,
  updateProfile,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

interface AuthForm {
  email: string
  password: string
  name: string
}

export default function RewardsClient() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [formData, setFormData] = useState<AuthForm>({ email: '', password: '', name: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [showResetForm, setShowResetForm] = useState(false)

  // Monitor auth state
  useEffect(() => {
    if (!auth) {
      setError('Firebase not initialized')
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!acceptedTerms) {
      setError('Please accept the terms and conditions')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setIsSubmitting(true)

    try {
      const userCred = await createUserWithEmailAndPassword(auth!, formData.email, formData.password)
      
      // Update profile with name
      if (formData.name) {
        await updateProfile(userCred.user, { displayName: formData.name })
      }

      setSuccess('Account created successfully!')
      setFormData({ email: '', password: '', name: '' })
      setAcceptedTerms(false)
      setIsSignUp(false)
    } catch (err: any) {
      setError(err.message || 'Failed to create account')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsSubmitting(true)

    try {
      await signInWithEmailAndPassword(auth!, formData.email, formData.password)
      setSuccess('Logged in successfully!')
      setFormData({ email: '', password: '', name: '' })
    } catch (err: any) {
      setError(err.message || 'Failed to sign in')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsSubmitting(true)

    try {
      await sendPasswordResetEmail(auth!, resetEmail)
      setSuccess('Password reset email sent! Check your inbox.')
      setResetEmail('')
      setShowResetForm(false)
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut(auth!)
      setUser(null)
    } catch (err: any) {
      setError('Failed to sign out')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader className="text-white animate-spin" size={48} />
      </div>
    )
  }

  // Logged In View - Rewards Dashboard
  if (user) {
    return (
      <div className="min-h-screen bg-black">
        <Header />

        <main className="pt-20 sm:pt-24 pb-12">
          <section className="px-4 sm:px-6 py-12 sm:py-16 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              {/* Header with Sign Out */}
              <div className="flex justify-between items-center mb-12">
                <div>
                  <h1 className="text-white text-4xl font-black tracking-widest">REWARDS</h1>
                  <p className="text-blue-400 text-lg">Welcome, {user.displayName || user.email?.split('@')[0] || 'Member'}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSignOut}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold transition-colors"
                >
                  <LogOut size={20} />
                  SIGN OUT
                </motion.button>
              </div>

              {/* Rewards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-blue-600/20 to-blue-900/20 border border-blue-500/50 rounded-2xl p-6"
                >
                  <p className="text-blue-300 text-xs tracking-widest mb-2">YOUR POINTS</p>
                  <h2 className="text-white text-4xl font-black">1,250</h2>
                  <p className="text-gray-400 text-sm mt-4">Earn from purchases</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-purple-600/20 to-purple-900/20 border border-purple-500/50 rounded-2xl p-6"
                >
                  <p className="text-purple-300 text-xs tracking-widest mb-2">CURRENT TIER</p>
                  <h2 className="text-white text-4xl font-black">GOLD</h2>
                  <p className="text-gray-400 text-sm mt-4">550 to Platinum</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-green-600/20 to-green-900/20 border border-green-500/50 rounded-2xl p-6"
                >
                  <p className="text-green-300 text-xs tracking-widest mb-2">BENEFIT</p>
                  <h2 className="text-white text-4xl font-black">10% OFF</h2>
                  <p className="text-gray-400 text-sm mt-4">All purchases</p>
                </motion.div>
              </div>

              {/* Activities */}
              <div className="space-y-6">
                <h3 className="text-white text-2xl font-black tracking-widest">RECENT ACTIVITY</h3>
                <div className="space-y-3">
                  {[
                    { type: 'Purchase', points: '+100', desc: 'Premium Hoodie' },
                    { type: 'Referral', points: '+50', desc: 'Invited friend' },
                    { type: 'Review', points: '+25', desc: 'Product review' },
                  ].map((activity, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white/5 border border-white/10 rounded-lg p-4 flex justify-between items-center hover:bg-white/10 transition-colors"
                    >
                      <div>
                        <p className="text-white font-bold">{activity.type}</p>
                        <p className="text-gray-400 text-sm">{activity.desc}</p>
                      </div>
                      <p className="text-green-400 font-bold text-lg">{activity.points}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </section>
        </main>

        <Footer />
      </div>
    )
  }

  // Login/Sign Up View
  return (
    <div className="min-h-screen bg-black">
      <Header />

      <main className="pt-20 sm:pt-24 pb-12 px-4 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-8 space-y-6">
            <div className="text-center mb-8">
              <Lock className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h1 className="text-white text-3xl font-black tracking-widest mb-2">REWARDS</h1>
              <p className="text-gray-400">Sign in or create account</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 flex items-center gap-2"
              >
                <AlertCircle size={20} className="text-red-400" />
                <p className="text-red-300 text-sm">{error}</p>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-900/30 border border-green-500/50 rounded-lg p-4 flex items-center gap-2"
              >
                <CheckCircle size={20} className="text-green-400" />
                <p className="text-green-300 text-sm">{success}</p>
              </motion.div>
            )}

            {/* Password Reset Form */}
            <AnimatePresence>
              {showResetForm && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handlePasswordReset}
                  className="space-y-4 pb-4 border-b border-white/10"
                >
                  <div>
                    <label className="text-gray-400 text-sm font-bold mb-2 block">EMAIL</label>
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? <Loader className="animate-spin" size={20} /> : 'SEND LINK'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowResetForm(false); setResetEmail('') }}
                      className="px-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg transition-colors"
                    >
                      CANCEL
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Auth Form */}
            <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="text-gray-400 text-sm font-bold mb-2 block">NAME</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your name"
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    required={isSignUp}
                  />
                </div>
              )}

              <div>
                <label className="text-gray-400 text-sm font-bold mb-2 block">EMAIL</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="text-gray-400 text-sm font-bold mb-2 block">PASSWORD</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="At least 6 characters"
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 pr-12 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-gray-500 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {isSignUp && (
                <div>
                  <label className="flex items-center gap-2 text-gray-400 text-sm mb-3 cursor-pointer hover:text-white transition-colors">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="rounded"
                    />
                    <span>I accept terms &amp; conditions</span>
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    PROCESSING...
                  </>
                ) : isSignUp ? (
                  'CREATE ACCOUNT'
                ) : (
                  'SIGN IN'
                )}
              </button>
            </form>

            {/* Toggle Sign Up/In */}
            <div className="text-center">
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setFormData({ email: '', password: '', name: '' })
                  setError('')
                  setSuccess('')
                }}
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                {isSignUp ? 'Already have an account? ' : "Don&apos;t have an account? "}
                <span className="text-blue-400 font-bold">{isSignUp ? 'SIGN IN' : 'CREATE ONE'}</span>
              </button>
            </div>

            {/* Password Reset Link */}
            {!isSignUp && (
              <button
                onClick={() => setShowResetForm(!showResetForm)}
                className="w-full text-center text-gray-400 hover:text-blue-400 text-sm transition-colors"
              >
                Forgot password?
              </button>
            )}
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}
