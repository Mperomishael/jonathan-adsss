'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, ExternalLink } from 'lucide-react'

interface ChatMsg {
  id: string
  text: string
  sender: 'user' | 'admin'
  createdAt: string
}

const THREAD_KEY = 'jr_chat_thread_id'

export default function FloatingChat() {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [threadId, setThreadId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [sending, setSending] = useState(false)
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    setThreadId(localStorage.getItem(THREAD_KEY))
  }, [])

  useEffect(() => {
    let alive = true
    fetch('/api/settings/site')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!alive || !data) return
        setWhatsappNumber(String(data.whatsappNumber || '').replace(/\\D/g, ''))
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    if (!open || !threadId) return
    let alive = true
    const load = async () => {
      try {
        const res = await fetch(`/api/chat?threadId=${threadId}`)
        if (!res.ok) return
        const data = await res.json()
        if (alive) setMessages(data.messages || [])
      } catch {
        /* ignore */
      }
    }
    load()
    const t = setInterval(load, 4000)
    return () => {
      alive = false
      clearInterval(t)
    }
  }, [open, threadId])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  const openWhatsApp = () => {
    if (!whatsappNumber) return
    const msg = encodeURIComponent(
      text.trim() || 'Hi, I have a question about Jonathan Roumie World.'
    )
    window.open(`https://wa.me/${whatsappNumber}?text=${msg}`, '_blank', 'noopener,noreferrer')
  }

  const send = async () => {
    const msg = text.trim()
    if (!msg || sending) return
    setSending(true)
    setText('')
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId,
          text: msg,
          sender: 'user',
          guestName: 'Guest',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Send failed')
      if (data.threadId) {
        setThreadId(data.threadId)
        localStorage.setItem(THREAD_KEY, data.threadId)
      }
      const r2 = await fetch(`/api/chat?threadId=${data.threadId}`)
      if (r2.ok) {
        const d2 = await r2.json()
        setMessages(d2.messages || [])
      }
    } catch (e) {
      console.error(e)
      alert('Could not send message. Try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed z-50 bottom-4 right-4 sm:bottom-6 sm:right-6 w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg flex items-center justify-center"
        style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
        aria-label="Customer care chat"
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="fixed z-50 left-2 right-2 sm:left-auto sm:right-6 bottom-20 sm:bottom-24 sm:w-[360px] max-h-[min(70vh,560px)] bg-[#0b141a] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
          >
            <div className="bg-[#075E54] px-4 py-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
                JR
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm">Management</p>
                <p className="text-emerald-100/80 text-xs">
                  {whatsappNumber ? `WhatsApp · +${whatsappNumber}` : 'Typically replies soon'}
                </p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="text-white/90 p-1">
                <X size={20} />
              </button>
            </div>

            <div
              className="flex-1 overflow-y-auto p-3 space-y-2"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 20% 20%, #1a2a32 0, transparent 40%), radial-gradient(circle at 80% 60%, #122028 0, transparent 35%)',
                backgroundColor: '#0b141a',
              }}
            >
              {messages.length === 0 && (
                <p className="text-center text-white/40 text-xs py-8 px-4">
                  Message our team — we&apos;ll reply here.
                  {whatsappNumber ? ' You can also continue on WhatsApp.' : ''}
                </p>
              )}
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-[#005c4b] text-white rounded-br-md'
                        : 'bg-[#1f2c34] text-gray-100 rounded-bl-md'
                    }`}
                  >
                    {m.text}
                    <p className="text-[10px] text-white/40 mt-1 text-right">
                      {m.createdAt
                        ? new Date(m.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : ''}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>

            {whatsappNumber && (
              <div className="px-3 pt-2 bg-[#1f2c34]">
                <button
                  type="button"
                  onClick={openWhatsApp}
                  className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-[#25D366] border border-[#25D366]/40 rounded-lg py-2 hover:bg-[#25D366]/10"
                >
                  <ExternalLink size={14} />
                  Open WhatsApp chat
                </button>
              </div>
            )}

            <div className="p-2 bg-[#1f2c34] flex gap-2 items-end">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    send()
                  }
                }}
                rows={1}
                placeholder="Type a message"
                className="flex-1 bg-[#2a3942] text-white text-sm rounded-xl px-3 py-2.5 resize-none focus:outline-none max-h-24"
              />
              <button
                type="button"
                onClick={send}
                disabled={!text.trim() || sending}
                className="w-11 h-11 rounded-full bg-[#25D366] text-white flex items-center justify-center disabled:opacity-50 flex-shrink-0"
              >
                <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
