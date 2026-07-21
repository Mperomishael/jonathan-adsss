'use client'

import { useState, useEffect } from 'react'
import { useUserAuth } from '@/components/user/UserAuthProvider'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { CreditCard, ArrowRight, Check } from 'lucide-react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function CardPaymentPage() {
  const { user, loading, getToken } = useUserAuth()
  const router = useRouter()
  const [fanLevel, setFanLevel] = useState<'silver' | 'gold' | 'diamond'>('silver')
  const [amount, setAmount] = useState(50)
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, router])

  useEffect(() => {
    const loadPaymentAmount = async () => {
      try {
        const token = await getToken()
        if (!token) return
        const res = await fetch('/api/admin/payment-config', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setAmount(data.fanCardAmount || 50)
        }
      } catch (err) {
        console.error('Failed to load payment config:', err)
      } finally {
        setLoadingData(false)
      }
    }

    if (user) {
      loadPaymentAmount()
    }
  }, [user, getToken])

  const fanLevels = [
    { id: 'silver', name: 'Silver', desc: 'Basic membership', perks: ['1 Card Per Year', 'Email Support', 'Basic Profile'] },
    { id: 'gold', name: 'Gold', desc: 'Premium membership', perks: ['3 Cards Per Year', 'Priority Support', 'Premium Badge'] },
    { id: 'diamond', name: 'Diamond', desc: 'Elite membership', perks: ['Unlimited Cards', 'VIP Support', 'Exclusive Events'] },
  ]

  const handleProceed = async () => {
    try {
      const token = await getToken()
      if (!token) return

      // Save fan level choice
      const res = await fetch('/api/user/card-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fanLevel,
          amount,
        }),
      })

      if (res.ok) {
        router.push('/dashboard/card-payment-proof')
      }
    } catch (err) {
      console.error('Failed to save preference:', err)
    }
  }

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading payment options...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header variant="main" />
      
      <main className="flex-1 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-widest mb-4">SELECT YOUR MEMBERSHIP</h1>
              <p className="text-gray-400 text-lg">Choose your fan level and complete payment</p>
            </div>

            {/* Fan Levels */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {fanLevels.map((level, idx) => (
                <motion.button
                  key={level.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => setFanLevel(level.id as any)}
                  className={`relative p-8 rounded-2xl transition-all duration-300 ${
                    fanLevel === level.id
                      ? 'bg-blue-600 border border-blue-400 ring-2 ring-blue-500'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="absolute top-4 right-4">
                    {fanLevel === level.id && <Check size={24} className="text-white" />}
                  </div>

                  <h3 className="text-xl font-black tracking-wider mb-1">{level.name}</h3>
                  <p className="text-sm text-gray-300 mb-6">{level.desc}</p>

                  <ul className="space-y-2 mb-6 text-left">
                    {level.perks.map((perk) => (
                      <li key={perk} className="text-sm text-gray-300 flex items-center gap-2">
                        <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                        {perk}
                      </li>
                    ))}
                  </ul>
                </motion.button>
              ))}
            </div>

            {/* Payment Amount */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-black tracking-wider flex items-center gap-3">
                    <CreditCard size={28} className="text-blue-400" />
                    PAYMENT AMOUNT
                  </h2>
                  <p className="text-gray-400 text-sm mt-2">Amount set by admin • {fanLevel.toUpperCase()} membership</p>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-black text-blue-400">${amount}</p>
                  <p className="text-gray-400 text-xs mt-1">USD</p>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 space-y-3">
                <p className="text-gray-400 text-sm">
                  ✓ Secure payment processing<br/>
                  ✓ Instant membership activation<br/>
                  ✓ Lifetime card access
                </p>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex gap-4"
            >
              <Link
                href="/dashboard/card-personalize"
                className="flex-1 bg-white/10 hover:bg-white/20 text-white py-4 rounded-xl font-bold tracking-widest transition-colors text-center border border-white/20"
              >
                BACK
              </Link>
              <button
                onClick={handleProceed}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold tracking-widest transition-colors flex items-center justify-center gap-3 group"
              >
                CONTINUE
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </motion.div>
        </div>
      </main>

      <Footer variant="main" />
    </div>
  )
}
