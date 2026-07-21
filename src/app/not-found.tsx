'use client'

import { motion } from 'framer-motion'
import { AlertTriangle, Home, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <motion.div
          animate={{ rotate: [0, -5, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="inline-block mb-6"
        >
          <AlertTriangle size={64} className="text-red-500" />
        </motion.div>

        <h1 className="text-white text-6xl font-black tracking-widest mb-4">404</h1>
        <p className="text-gray-400 text-xl mb-2">Page Not Found</p>
        <p className="text-gray-500 text-sm mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved. This might be a bad gateway or the link is broken.
        </p>

        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-8 rounded-lg transition-all w-full"
          >
            <Home size={20} />
            RETURN HOME
          </Link>

          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-8 rounded-lg transition-all w-full"
          >
            BROWSE SHOP
            <ArrowRight size={20} />
          </Link>
        </div>

        {/* Error Details */}
        <div className="mt-12 bg-white/5 border border-white/10 rounded-lg p-6">
          <p className="text-gray-400 text-xs tracking-widest mb-3">ERROR DETAILS</p>
          <p className="text-gray-500 font-mono text-xs break-all">
            Bad Gateway / Page Not Found
          </p>
        </div>
      </motion.div>
    </div>
  )
}
