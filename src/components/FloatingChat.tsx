'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, ExternalLink } from 'lucide-react'

interface ChatMsg {
  id: string
  text: string
  sender: 'user' | 'admin' | 'bot'
  createdAt: string
}

const THREAD_KEY = 'jr_chat_thread_id'
const BOT_REPLY_DELAY_MS = 3000

// ─── Site knowledge base ───────────────────────────────────────────────────
// Keyword-matched auto-replies drawn from the site's actual policies/pages.
// Add more entries as the site grows — first entry with the most keyword
// hits in the user's message wins.
interface KBEntry {
  keywords: string[]
  reply: string
  handoff?: boolean // true = also nudge toward WhatsApp (e.g. explicit "talk to agent")
}

const KNOWLEDGE_BASE: KBEntry[] = [
  {
    keywords: ['agent', 'human', 'representative', 'real person', 'someone', 'talk to'],
    reply:
      "Of course — I can connect you with a member of our team on WhatsApp for direct help. Tap 'Open WhatsApp chat' below and I'll bring this conversation over with you.",
    handoff: true,
  },
  {
    keywords: ['fan card', 'fancard', 'card price', 'regular tier', 'gold tier', 'diamond tier', 'tier'],
    reply:
      "Fan card pricing (Regular, Gold, and Diamond) is set by our team and shown live on the Fan Card page — head to /fan-card to see current pricing and pick your tier.",
  },
  {
    keywords: ['price', 'cost', 'how much', 'pricing'],
    reply:
      "Pricing depends on what you're after — fan card tiers are shown live on the Fan Card page, and store items show their price on the Shop page. Let me know which one you mean and I can point you the right way!",
  },
  {
    keywords: ['payment', 'pay', 'crypto', 'usdt', 'bitcoin', 'btc', 'paypal', 'stripe', 'venmo', 'cashapp', 'chipper'],
    reply:
      "We accept USDT, BTC, PayPal, Stripe, Venmo, and Chipper Cash — whichever are enabled will show up as options on the Checkout page.",
  },
  {
    keywords: ['refund', 'money back'],
    reply:
      "Since payments are made via cryptocurrency, refunds aren't available — so please double-check the wallet address before sending. If something went wrong, reach out with your transaction hash and we'll help.",
  },
  {
    keywords: ['verify', 'verification', 'confirm payment', 'how long', 'pending'],
    reply:
      "Payments are usually verified within 24 hours — you'll see the status update on your Dashboard once it's confirmed.",
  },
  {
    keywords: ['wrong amount', 'wrong wallet', 'wrong address', 'sent wrong'],
    reply:
      "If you sent the wrong amount or to the wrong address, please contact our support team right away with your transaction hash so we can help sort it out.",
  },
  {
    keywords: ['shipping', 'waybill', 'delivery', 'physical card', 'track my order', 'tracking'],
    reply:
      "Physical card delivery (waybill) is a $23 add-on at checkout with tracking. Digital fan cards are available instantly once your payment is verified — no shipping needed for those.",
  },
  {
    keywords: ['reward', 'points', 'loyalty', 'bronze', 'platinum'],
    reply:
      "Our Rewards program tracks points from purchases, referrals, and reviews, with Bronze, Silver, Gold, and Platinum tiers. Sign in at /rewards to see your points and benefits.",
  },
  {
    keywords: ['login', 'sign in', 'password', 'account', 'forgot password', 'log in'],
    reply:
      "Having trouble signing in? You can reset your password right from the sign-in screen. If it's still not working, let us know and we'll help directly.",
  },
  {
    keywords: ['order status', 'my order', 'where is my', 'dashboard'],
    reply:
      "You can check your order and verification status anytime on your Dashboard once you're signed in.",
  },
  {
    keywords: ['thank', 'thanks', 'appreciate'],
    reply: "You're very welcome! Anything else I can help with? 😊",
  },
  {
    keywords: ['bye', 'goodbye', 'see you', 'later'],
    reply: 'Take care! Reach out anytime you need us. 👋',
  },
]

const GREETING_RE = /^(hi+|hello+|hey+|yo|sup|howdy|good\s?(morning|afternoon|evening|day))[\s!.,]*$/i

function matchReply(raw: string): { reply: string; handoff: boolean } {
  const text = raw.trim()
  const lower = text.toLowerCase()

  if (GREETING_RE.test(lower)) {
    return {
      reply:
        "Hey there! 👋 Welcome to Jonathan Roumie World support. I can help with fan cards, pricing, payments, orders, and rewards — what do you need?",
      handoff: false,
    }
  }

  let best: KBEntry | null = null
  let bestScore = 0
  for (const entry of KNOWLEDGE_BASE) {
    const score = entry.keywords.reduce((acc, kw) => (lower.includes(kw) ? acc + 1 : acc), 0)
    if (score > bestScore) {
      bestScore = score
      best = entry
    }
  }

  if (best && bestScore > 0) {
    return { reply: best.reply, handoff: !!best.handoff }
  }

  return {
    reply:
      "I'm not fully sure about that one — let me connect you with a real member of our support team on WhatsApp so they can help directly.",
    handoff: true,
  }
}

export default function FloatingChat() {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [threadId, setThreadId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [sending, setSending] = useState(false)
  const [botTyping, setBotTyping] = useState(false)
  const [handoffPending, setHandoffPending] = useState(false)
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const endRef = useRef<HTMLDivElement>(null)
  const botTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
        setWhatsappNumber(String(data.whatsappNumber || '').replace(/\D/g, ''))
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
  }, [messages, open, botTyping])

  // Clean up any pending bot-reply timer on unmount
  useEffect(() => {
    return () => {
      if (botTimerRef.current) clearTimeout(botTimerRef.current)
    }
  }, [])

  const postMessage = async (msgText: string, sender: 'user' | 'bot', currentThreadId: string | null) => {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        threadId: currentThreadId,
        text: msgText,
        sender,
        guestName: 'Guest',
      }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Send failed')
    return data.threadId as string
  }

  const refreshMessages = async (id: string) => {
    const r = await fetch(`/api/chat?threadId=${id}`)
    if (r.ok) {
      const d = await r.json()
      setMessages(d.messages || [])
    }
  }

  // Builds the full in-app transcript so the WhatsApp agent has complete context
  const buildTranscript = () => {
    const lines = messages.map((m) => {
      const speaker = m.sender === 'user' ? 'Me' : m.sender === 'bot' ? 'Site Assistant' : 'Support'
      return `${speaker}: ${m.text}`
    })
    if (text.trim()) lines.push(`Me: ${text.trim()}`)
    let transcript = lines.join('\n')
    // Keep the WhatsApp deep link within a safe URL length — trim from the
    // oldest messages first if the conversation has gotten long.
    const MAX_CHARS = 1500
    if (transcript.length > MAX_CHARS) {
      transcript = '…\n' + transcript.slice(transcript.length - MAX_CHARS)
    }
    return transcript
  }

  const openWhatsApp = () => {
    if (!whatsappNumber) return
    const hasHistory = messages.length > 0
    const body = hasHistory
      ? `Continuing my chat from the site:\n\n${buildTranscript()}`
      : text.trim() || 'Hi, I have a question about Jonathan Roumie World.'
    const msg = encodeURIComponent(body)
    window.open(`https://wa.me/${whatsappNumber}?text=${msg}`, '_blank', 'noopener,noreferrer')
  }

  const send = async () => {
    const msg = text.trim()
    if (!msg || sending) return
    setSending(true)
    setText('')
    setHandoffPending(false)
    try {
      const id = await postMessage(msg, 'user', threadId)
      if (id && id !== threadId) {
        setThreadId(id)
        localStorage.setItem(THREAD_KEY, id)
      }
      await refreshMessages(id)
      setSending(false)

      // Show a "typing…" indicator, then answer using the site knowledge base
      setBotTyping(true)
      if (botTimerRef.current) clearTimeout(botTimerRef.current)
      botTimerRef.current = setTimeout(async () => {
        try {
          const { reply, handoff } = matchReply(msg)
          await postMessage(reply, 'bot', id)
          await refreshMessages(id)
          setHandoffPending(handoff)
        } catch (e) {
          console.error(e)
        } finally {
          setBotTyping(false)
        }
      }, BOT_REPLY_DELAY_MS)
    } catch (e) {
      console.error(e)
      alert('Could not send message. Try again.')
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
                  {botTyping
                    ? 'typing…'
                    : whatsappNumber
                      ? `WhatsApp · +${whatsappNumber}`
                      : 'Typically replies soon'}
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
              {messages.length === 0 && !botTyping && (
                <p className="text-center text-white/40 text-xs py-8 px-4">
                  Ask us anything — fan cards, orders, payments, rewards. We&apos;ll reply right here.
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
                    {m.sender === 'bot' && (
                      <p className="text-[10px] uppercase tracking-widest text-emerald-400/70 mb-1">
                        Site Assistant
                      </p>
                    )}
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

              {botTyping && (
                <div className="flex justify-start">
                  <div className="bg-[#1f2c34] rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce" />
                  </div>
                </div>
              )}

              {handoffPending && whatsappNumber && (
                <div className="flex justify-start">
                  <button
                    type="button"
                    onClick={openWhatsApp}
                    className="flex items-center gap-2 text-xs font-semibold text-[#25D366] bg-[#25D366]/10 border border-[#25D366]/40 rounded-full px-4 py-2 hover:bg-[#25D366]/20"
                  >
                    <ExternalLink size={13} />
                    Continue with an agent on WhatsApp
                  </button>
                </div>
              )}
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
