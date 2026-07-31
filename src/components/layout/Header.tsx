'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface HeaderProps {
  variant?: 'main' | 'shop'
}

const navLinks = [
  { name: 'HOME', path: '/' },
  { name: 'SHOP', path: '/shop' },
  { name: 'FAN CARD', path: '/fan-card' },
  { name: 'REWARDS', path: '/rewards' },
  { name: 'FANS', path: '/fans' },
]

export default function Header({ variant = 'main' }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md border-b border-white/10"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="flex items-center justify-between px-3 sm:px-4 h-14 sm:h-16 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-2 min-w-0 flex-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo.png"
              alt="Jonathan Roumie"
              className="h-9 sm:h-11 w-auto object-contain flex-shrink-0"
            />
            <span className="text-white text-[10px] sm:text-xs tracking-wide truncate hidden xs:block sm:block">
              {variant === 'shop' ? 'SHOP' : 'Jonathan Roumie'}
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                className={`text-xs tracking-[0.2em] hover:text-red-500 transition-colors ${
                  pathname === link.path ? 'text-red-500' : 'text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            className="md:hidden border border-white/30 p-2 rounded-lg hover:bg-white/10 flex-shrink-0"
            aria-label="Open menu"
          >
            <Menu size={22} className="text-white" />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-50 md:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.25 }}
              className="fixed top-0 right-0 bottom-0 w-[min(100%,20rem)] bg-black z-50 flex flex-col border-l border-white/10 md:hidden"
              style={{ paddingTop: 'env(safe-area-inset-top)' }}
            >
              <div className="flex justify-between items-center p-4 border-b border-white/10">
                <span className="text-white text-sm tracking-widest font-bold">MENU</span>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  className="border border-white/30 p-2 rounded-lg"
                  aria-label="Close menu"
                >
                  <X size={22} className="text-white" />
                </button>
              </div>
              <nav className="flex flex-col py-6 px-4 gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`py-3.5 px-4 rounded-xl text-sm tracking-[0.25em] ${
                      pathname === link.path
                        ? 'bg-red-600/20 text-red-400'
                        : 'text-white hover:bg-white/5'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
