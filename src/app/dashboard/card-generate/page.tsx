'use client'

import { useState, useEffect } from 'react'
import { useUserAuth } from '@/components/user/UserAuthProvider'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Download, AlertCircle, Loader2, Lock, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

interface CardStatus {
  isWhitelisted: boolean
  generatedCards: number
  cardLimit: number
  fanLevel: string | null
  canGenerate: boolean
  cards: any[]
}

export default function CardGeneratePage() {
  const { user, loading, getToken } = useUserAuth()
  const router = useRouter()
  const [status, setStatus] = useState<CardStatus | null>(null)
  const [loadingStatus, setLoadingStatus] = useState(true)
  const [error, setError] = useState('')
  const [generating, setGenerating] = useState(false)
  const [cardName, setCardName] = useState('')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      loadCardStatus()
    }
  }, [user])

  const loadCardStatus = async () => {
    try {
      const token = await getToken()
      if (!token) return

      const res = await fetch('/api/user/card-generation', {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        const data = await res.json()
        setStatus(data)
      }
    } catch (err) {
      console.error('Failed to load status:', err)
    } finally {
      setLoadingStatus(false)
    }
  }

  const handleGenerateCard = async () => {
    if (!cardName.trim()) {
      setError('Please enter your name')
      return
    }

    setGenerating(true)
    setError('')

    try {
      const token = await getToken()
      if (!token) return

      const res = await fetch('/api/user/card-generation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cardName }),
      })

      if (res.ok) {
        const card = await res.json()
        setStatus(prev => prev ? {
          ...prev,
          generatedCards: prev.generatedCards + 1,
          cards: [...prev.cards, card]
        } : null)
        setCardName('')
      } else {
        setError('Failed to generate card')
      }
    } catch (err) {
      setError('Error generating card')
    } finally {
      setGenerating(false)
    }
  }

  if (loading || loadingStatus) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading card status...</p>
        </div>
      </div>
    )
  }

  if (!user || !status) return null

  if (!status.isWhitelisted) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <Header variant="main" />
        
        <main className="flex-1 py-16 px-4 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl w-full"
          >
            <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-2xl p-8 space-y-6 text-center">
              <Lock size={64} className="text-yellow-400 mx-auto" />
              <h1 className="text-3xl font-black tracking-widest">NOT WHITELISTED</h1>
              <p className="text-gray-300 text-lg">
                Your account has not been whitelisted yet. Complete payment first.
              </p>
              <Link
                href="/dashboard/card-payment"
                className="inline-flex bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold tracking-widest items-center gap-3"
              >
                GO TO PAYMENT
                <ArrowRight size={20} />
              </Link>
            </div>
          </motion.div>
        </main>
        <Footer variant="main" />
      </div>
    )
  }

  const canGenerateMore = status.generatedCards < status.cardLimit

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header variant="main" />
      
      <main className="flex-1 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-4">
                <p className="text-gray-400 text-xs tracking-widest">STATUS</p>
                <p className="text-blue-400 font-bold text-lg">✓ WHITELISTED</p>
              </div>
              <div className="bg-green-900/20 border border-green-800/50 rounded-lg p-4">
                <p className="text-gray-400 text-xs tracking-widest">LEVEL</p>
                <p className="text-green-400 font-bold text-lg capitalize">{status.fanLevel}</p>
              </div>
              <div className="bg-purple-900/20 border border-purple-800/50 rounded-lg p-4">
                <p className="text-gray-400 text-xs tracking-widest">CARDS GENERATED</p>
                <p className="text-purple-400 font-bold text-lg">{status.generatedCards} / {status.cardLimit}</p>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 bg-red-900/20 border border-red-800/50 rounded-lg p-4 text-red-300">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {canGenerateMore ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">
                <h2 className="text-2xl font-black tracking-widest">GENERATE YOUR CARD</h2>
                <div>
                  <label className="text-sm font-bold block mb-3">YOUR NAME</label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="Enter your name"
                    maxLength={30}
                    className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-gray-500 text-xs mt-2">{cardName.length}/30 characters</p>
                </div>
                <button
                  onClick={handleGenerateCard}
                  disabled={generating || !cardName.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-4 rounded-lg font-bold tracking-widest flex items-center justify-center gap-3 transition-colors"
                >
                  {generating ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      GENERATING...
                    </>
                  ) : (
                    'GENERATE CARD'
                  )}
                </button>
              </div>
            ) : (
              <div className="bg-orange-900/20 border border-orange-800/50 rounded-2xl p-8 text-center space-y-4">
                <h2 className="text-xl font-black tracking-widest">LIMIT REACHED</h2>
                <p className="text-gray-300">All {status.cardLimit} card generation(s) used.</p>
                <button className="inline-flex bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-bold items-center gap-2">
                  UPGRADE ACCOUNT
                  <ArrowRight size={18} />
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </main>
      <Footer variant="main" />
    </div>
  )
}
