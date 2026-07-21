'use client'

import { useState } from 'react'
import { Mail, CheckCircle, AlertCircle, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function ApplyCardPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      // Call API to register user and create Firebase auth
      const response = await fetch('/api/card-application/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to submit application')
        return
      }

      setSuccessMessage(data.message)
      setSubmitted(true)
      setEmail('')

      // Redirect to auth page after 3 seconds
      setTimeout(() => {
        window.location.href = '/auth'
      }, 3000)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
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
            <div className="w-16 h-16 rounded-full bg-red-900/30 flex items-center justify-center mx-auto mb-6">
              <Mail size={32} className="text-red-400" />
            </div>
            <h2 className="text-3xl font-black tracking-widest mb-2">APPLY FOR FAN CARD</h2>
            <p className="text-gray-400">Join the official Jonathan Roumie fan community</p>
          </motion.div>

          {!submitted ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/3 border border-white/10 rounded-2xl p-8 space-y-6"
            >
              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-900/20 border border-red-800/50 rounded-lg text-red-300">
                  <AlertCircle size={18} />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-300 text-sm font-semibold mb-3 tracking-widest">
                    EMAIL ADDRESS
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-lg placeholder-gray-600 focus:outline-none focus:border-red-500 transition-colors"
                  />
                  <p className="text-gray-500 text-xs mt-2">
                    We'll create your account and send you login details
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-3 rounded-lg font-bold tracking-widest transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      REGISTERING...
                    </>
                  ) : (
                    'APPLY NOW'
                  )}
                </button>
              </form>

              <div className="space-y-3 pt-6 border-t border-white/10">
                <h3 className="text-white font-semibold tracking-wide text-sm">WHAT YOU GET:</h3>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
                    Automatic account creation
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
                    Admin review & approval
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
                    Card level assignment
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
                    Payment gateway access
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
                    Download verified card
                  </li>
                </ul>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-900/20 border border-green-800/50 rounded-2xl p-8 text-center space-y-6"
            >
              <div className="w-16 h-16 rounded-full bg-green-900/30 flex items-center justify-center mx-auto">
                <CheckCircle size={32} className="text-green-400" />
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-widest mb-2 text-green-300">SUCCESS!</h3>
                <p className="text-green-200">{successMessage}</p>
              </div>
              <div className="text-sm text-green-300 pt-4 border-t border-green-800/50">
                <p>Redirecting to your dashboard...</p>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-4 mt-16">
        <div className="max-w-2xl mx-auto text-center text-gray-500 text-sm">
          <p>© 2024 Jonathan Roumie World. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
