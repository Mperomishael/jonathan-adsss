'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import Image from 'next/image'

export default function FanCardSection() {
  const [cardName, setCardName] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), { stiffness: 150, damping: 20 })
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), { stiffness: 150, damping: 20 })
  const glareX = useTransform(mouseX, [-0.5, 0.5], ['0%', '100%'])
  const glareY = useTransform(mouseY, [-0.5, 0.5], ['0%', '100%'])

  const [vibrating, setVibrating] = useState(false)
  const prev = useRef(cardName)
  useEffect(() => {
    if (cardName !== prev.current) {
      setVibrating(true)
      const t = setTimeout(() => setVibrating(false), 300)
      prev.current = cardName
      return () => clearTimeout(t)
    }
  }, [cardName])

  const display = cardName || 'YOUR NAME'
  const year = new Date().getFullYear()
  const memberId = `JR-${Math.abs(
    cardName.split('').reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0x12345)
  ).toString().slice(0, 6).padStart(6, '0')}`

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 bg-gradient-to-b from-transparent via-red-900/5 to-transparent">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* 3D Card Preview on Left */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="order-2 lg:order-1"
          >
            <div
              ref={containerRef}
              onMouseMove={(e) => {
                const r = containerRef.current?.getBoundingClientRect()
                if (!r) return
                mouseX.set((e.clientX - r.left) / r.width - 0.5)
                mouseY.set((e.clientY - r.top) / r.height - 0.5)
              }}
              onMouseLeave={() => { mouseX.set(0); mouseY.set(0) }}
              className="flex items-center justify-center p-8 select-none"
              style={{ perspective: '1000px' }}
            >
              <motion.div
                style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
                animate={vibrating ? { x: [-3, 3, -3, 3, 0], transition: { duration: 0.25 } } : {}}
                className="relative w-[340px] h-[210px] cursor-pointer"
              >
                <div
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
                      key={cardName}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-white font-bold tracking-[0.15em] uppercase truncate"
                      style={{
                        fontSize: cardName.length > 20 ? '13px' : cardName.length > 12 ? '16px' : '20px',
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
            <input
              type="text"
              value={cardName}
              onChange={(e) => setCardName(e.target.value.slice(0, 30))}
              placeholder="Type your name..."
              className="w-full max-w-sm mx-auto block mt-6 bg-white/5 border border-white/10 text-white px-4 py-2 rounded-lg text-center focus:outline-none focus:border-jcvd-red transition-colors placeholder:text-white/20 text-sm"
            />
          </motion.div>

          {/* Content on Right */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-1 lg:order-2 space-y-6 sm:space-y-8"
          >
            <div>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black mb-3 sm:mb-4 tracking-widest">
                GET YOUR FAN CARD
              </h2>
              <p className="text-gray-400 text-sm sm:text-base md:text-lg mb-3 sm:mb-4 leading-relaxed">
                Create your official Jonathan Roumie Fan Card instantly. Personalize it with your name and watch it animate on the 3D card!
              </p>
              <ul className="space-y-2 text-gray-300 text-xs sm:text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-blue-400">✓</span>
                  <span>Personalized with your name</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-400">✓</span>
                  <span>3D interactive card design with live preview</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-400">✓</span>
                  <span>Download & share instantly</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-400">✓</span>
                  <span>Crypto & traditional payment options</span>
                </li>
              </ul>
            </div>

            {/* CTA Button */}
            <Link
              href="/fans"
              className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-jcvd-red to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold tracking-widest transition-all text-sm sm:text-base group w-full sm:w-auto justify-center"
            >
              <Sparkles size={18} />
              GET YOUR CARD
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
