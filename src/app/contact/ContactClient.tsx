'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertCircle, Send } from 'lucide-react'
import Image from 'next/image'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function ContactClient() {
  const [form, setForm] = useState({ name: '', company: '', telephone: '', email: '', message: '' })
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus('success')
        setForm({ name: '', company: '', telephone: '', email: '', message: '' })
      } else {
        setStatus('error')
        setErrorMsg(data.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setStatus('error')
      setErrorMsg('Network error. Please check your connection.')
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <Header variant="main" />

      <main className="pt-16">
        {/* Hero */}
        <section className="relative h-[40vh]">
          <Image src="/images/contact/contact-bg.jpg" alt="Contact" fill className="object-cover" />
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-white text-3xl tracking-[0.4em]"
            >
              CONTACT
            </motion.h1>
          </div>
        </section>

        {/* Form */}
        <section className="bg-black py-12 px-4">
          <div className="max-w-md mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-[#111] p-6 rounded-2xl border border-white/5"
            >
              <h2 className="text-white text-xl tracking-[0.4em] text-center mb-2">
                BUSINESS &amp; ENQUIRIES
              </h2>
              <p className="text-jcvd-gray text-sm text-center mb-8">
                Fan enquiries for autographs and posters sent through the following form will be{' '}
                <span className="text-white font-semibold">REJECTED</span>. This is for business use only.
              </p>

              {/* Success banner */}
              <AnimatePresence>
                {status === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-3 bg-green-900/30 border border-green-700/40 rounded-xl px-4 py-3 mb-6"
                  >
                    <CheckCircle size={18} className="text-green-400 shrink-0" />
                    <p className="text-green-300 text-sm">
                      Message sent! We&apos;ll be in touch shortly.
                    </p>
                  </motion.div>
                )}
                {status === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-3 bg-red-900/30 border border-red-700/40 rounded-xl px-4 py-3 mb-6"
                  >
                    <AlertCircle size={18} className="text-red-400 shrink-0" />
                    <p className="text-red-300 text-sm">{errorMsg}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-4">
                {[
                  { label: 'NAME', name: 'name', type: 'text', required: true },
                  { label: 'COMPANY', name: 'company', type: 'text', required: false },
                  { label: 'TELEPHONE', name: 'telephone', type: 'tel', required: false },
                  { label: 'EMAIL', name: 'email', type: 'email', required: true },
                ].map(({ label, name, type, required }) => (
                  <div key={name}>
                    <label className="text-white text-xs tracking-widest block mb-2">{label}</label>
                    <input
                      type={type}
                      name={name}
                      value={(form as any)[name]}
                      onChange={handleChange}
                      required={required}
                      className="w-full bg-jcvd-input text-white px-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-jcvd-red transition-all"
                    />
                  </div>
                ))}

                <div>
                  <label className="text-white text-xs tracking-widest block mb-2">MESSAGE</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={5}
                    required
                    minLength={10}
                    className="w-full bg-jcvd-input text-white px-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-jcvd-red resize-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full flex items-center justify-center gap-2 bg-jcvd-input text-white py-3 tracking-[0.4em] hover:bg-jcvd-red transition-colors rounded-lg disabled:opacity-50 font-bold"
                >
                  <Send size={14} />
                  {status === 'loading' ? 'SENDING...' : 'SEND'}
                </button>
              </form>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer variant="main" />
    </div>
  )
}
