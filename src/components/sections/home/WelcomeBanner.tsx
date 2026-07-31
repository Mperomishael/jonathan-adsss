'use client'
import { motion } from 'framer-motion'
export function WelcomeBanner() {
  return (
    <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.5 }} viewport={{ once: true }} className="bg-black py-6 px-4">
      <p className="text-white text-center text-sm tracking-widest uppercase">
        WELCOME TO MY OFFICIAL WEBSITE.{' '}
      </p>
    </motion.section>
  )
}
