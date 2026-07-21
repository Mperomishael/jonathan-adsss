'use client'
import { motion } from 'framer-motion'
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react'
import Image from 'next/image'

export default function SocialSection() {
  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Youtube, href: '#', label: 'YouTube' },
  ]
  return (
    <section className="relative py-16 px-4">
      <div className="absolute inset-0">
        <Image src="/images/social/social-bg.jpg" alt="Jonathan Roumie" fill className="object-cover" />
        <div className="absolute inset-0 bg-black/50" />
      </div>
      <div className="relative z-10 flex flex-col items-center">
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }} className="text-white text-center text-lg tracking-[0.4em] mb-8">
          @JONATHAN ROUMIE SOCIAL
        </motion.h2>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} viewport={{ once: true }} className="flex gap-6">
          {socialLinks.map((social, index) => (
            <motion.a key={social.label} href={social.href} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }} viewport={{ once: true }} className="w-14 h-14 rounded-full border-2 border-white flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors duration-300" aria-label={social.label}>
              <social.icon size={24} />
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
