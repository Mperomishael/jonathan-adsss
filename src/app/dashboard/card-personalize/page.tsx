'use client'

import { useState, useEffect } from 'react'
import { useUserAuth } from '@/components/user/UserAuthProvider'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, Type } from 'lucide-react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function CardPersonalizePage() {
  const { user, loading } = useUserAuth()
  const router = useRouter()
  const [cardName, setCardName] = useState('')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, router])

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

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header variant="main" />
      
      <main className="flex-1 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            {/* Card Preview */}
            <div className="order-2 lg:order-1">
              <motion.div
                className="relative w-full max-w-sm mx-auto rounded-2xl overflow-hidden bg-white/5 border border-white/10 shadow-2xl space-y-4"
                animate={{
                  boxShadow: cardName ? '0 20px 60px rgba(59, 130, 246, 0.5)' : '0 10px 30px rgba(0, 0, 0, 0.5)',
                }}
              >
                {/* Card Image at Top */}
                <div className="w-full h-64 overflow-hidden">
                  <img
                    src="https://i.ibb.co/m5Xz2Vy2/image.png"
                    alt="Card Banner"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Card Content */}
                <div className="relative z-10 p-8 space-y-6">
                  <div>
                    <h3 className="text-white text-sm font-bold tracking-widest">JONATHAN ROUMIE</h3>
                    <h3 className="text-white text-sm font-bold tracking-widest">FAN CARD</h3>
                  </div>

                  <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-lg p-6 space-y-4">
                    <p className="text-white/70 text-xs tracking-wide">YOUR NAME</p>
                    <motion.p
                      key={cardName}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-white text-3xl font-black tracking-wider min-h-12 break-words"
                    >
                      {cardName || 'ENTER YOUR NAME'}
                    </motion.p>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-white text-xs font-bold tracking-widest">VERIFIED MEMBER</span>
                    <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
                      ✓
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Input Section */}
            <div className="order-1 lg:order-2">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h1 className="text-4xl md:text-5xl font-black tracking-widest mb-2">PERSONALIZE YOUR CARD</h1>
                  <p className="text-gray-400 text-lg">Watch your name appear on your exclusive Jonathan Roumie Fan Card as you type</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">
                  <div>
                    <label className="text-gray-400 text-xs tracking-widest block mb-3">YOUR NAME</label>
                    <div className="relative">
                      <Type size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value.toUpperCase().slice(0, 30))}
                        placeholder="TYPE YOUR NAME"
                        maxLength={30}
                        className="w-full bg-white/5 border border-white/10 text-white pl-10 pr-4 py-4 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-lg font-bold tracking-wide"
                      />
                    </div>
                    <p className="text-gray-500 text-xs mt-2">{cardName.length}/30 characters</p>
                  </div>

                  <div className="pt-4 border-t border-white/10 space-y-3">
                    <p className="text-gray-400 text-sm">
                      ✓ Exclusive Jonathan Roumie design<br/>
                      ✓ Personalized with your name<br/>
                      ✓ Available in Silver, Gold, or Diamond<br/>
                      ✓ Official membership verification
                    </p>
                  </div>

                  <Link
                    href="/dashboard/card-payment"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold tracking-widest transition-colors flex items-center justify-center gap-3 group disabled:opacity-50"
                  >
                    PROCEED TO PAYMENT
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer variant="main" />
    </div>
  )
}
