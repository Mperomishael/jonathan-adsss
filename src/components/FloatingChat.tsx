'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Loader, LogOut } from 'lucide-react'

interface Message {
  id: string
  type: 'user' | 'bot' | 'system'
  text: string
  timestamp: Date
}

const WHATSAPP_NUMBER = '252697996987'

const siteKnowledge = {
  shop: {
    keywords: ['shop', 'product', 'buy', 'purchase', 'merchandise', 'apparel', 'store', 'item'],
    response: 'Our shop features 13 exclusive products including premium t-shirts, signature hoodies, and limited edition merchandise. All prices are updated in real-time! Prices range from $26.99 to $69.99. What are you looking for?'
  },
  fancard: {
    keywords: ['fan card', 'card', 'personalize', 'customize', 'create card'],
    response: 'The Fan Card page lets you create a personalized card instantly! Just enter your name and watch it appear on the card in real-time. Price updates automatically, and you can copy or download your card. No signup needed!'
  },
  rewards: {
    keywords: ['reward', 'points', 'tier', 'bronze', 'silver', 'gold', 'platinum', 'member'],
    response: 'Our rewards program offers points for purchases, referrals, social shares, and reviews. Bronze, Silver, Gold, and Platinum tiers unlock exclusive benefits. You need to sign in with email and password to access the rewards dashboard.'
  },
  payment: {
    keywords: ['payment', 'pay', 'cash app', 'venmo', 'crypto', 'btc', 'usdt', 'bitcoin'],
    response: 'We accept multiple payment methods:\n• Cash App: $tinabeingblessed\n• Venmo: Tina-McGowan-17\n• Crypto: BTC or USDT (wallet address provided at checkout)'
  },
  orders: {
    keywords: ['order', 'track', 'status', 'delivery', 'shipping', 'confirmation'],
    response: 'All orders require you to provide your email, phone, and address. After payment, you\'ll receive an email confirmation. Admin tracks all orders in real-time. Contact support for specific order details.'
  },
  pricing: {
    keywords: ['price', 'cost', 'how much', 'expensive', 'discount', 'sale'],
    response: 'Shop products range from $26.99 to $69.99. Fan card pricing updates in real-time on the fan card page. Check individual product pages for current prices.'
  },
  gallery: {
    keywords: ['gallery', 'photo', 'image', 'picture'],
    response: 'Our gallery showcases beautiful moments! You can browse our collection on the home page with smooth animations and high-quality images.'
  },
  news: {
    keywords: ['news', 'update', 'announcement', 'latest'],
    response: 'Check our Latest News section for the newest updates about Jonathan Roumie! We post regular announcements and exciting updates.'
  },
  contact: {
    keywords: ['contact', 'help', 'support', 'agent', 'human', 'whatsapp'],
    response: 'Our admin team is always online! You can connect directly via WhatsApp for instant support. Let me know if you want to talk to a human agent!'
  }
}

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      text: 'Hi! 👋 Welcome to Jonathan Roumie\'s official support. I can help with questions about our Shop, Fan Cards, Rewards, Payments, Orders, and more. What can I help you with?',
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [scrollY, setScrollY] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [showHumanOption, setShowHumanOption] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Animate button based on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Intelligent bot response generator
  const generateBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase()
    
    // Check each knowledge category
    for (const [category, data] of Object.entries(siteKnowledge)) {
      const keywords = data.keywords as string[]
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        setShowHumanOption(category === 'contact')
        return (data as any).response
      }
    }

    // Default response if no keywords match
    setShowHumanOption(true)
    return 'I couldn\'t find a specific answer to that. Would you like to speak with our human support team? They\'re always online on WhatsApp and can help with anything!'
  }

  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputValue.trim()
    
    if (!messageText) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: messageText,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)
    setShowHumanOption(false)

    // Simulate bot thinking
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: generateBotResponse(messageText),
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botResponse])
      setIsLoading(false)
    }, 500)
  }

  const handleConnectWhatsApp = () => {
    const systemMessage: Message = {
      id: Date.now().toString(),
      type: 'system',
      text: 'Connecting to WhatsApp support...',
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, systemMessage])

    setTimeout(() => {
      const message = encodeURIComponent('hello, J.R support, I need help')
      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`
      window.open(whatsappUrl, '_blank')

      const confirmMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: 'bot',
        text: 'WhatsApp opened! Our admin is always online and will respond right away. Thank you for reaching out!',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, confirmMessage])
    }, 800)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Animate chat button based on scroll
  const chatButtonY = Math.min(scrollY * 0.3, 100)

  return (
    <>
      {/* Floating Chat Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        style={{ y: chatButtonY }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white p-4 rounded-full shadow-lg flex items-center justify-center transition-all"
        aria-label="Open chat"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
        {!isOpen && (
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"
          />
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed bottom-20 right-6 z-40 w-full max-w-sm bg-black border border-white/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            style={{ maxHeight: '600px' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 flex justify-between items-center">
              <div>
                <h3 className="text-white font-bold text-sm tracking-widest">SUPPORT</h3>
                <p className="text-blue-100 text-xs">Admin online 24/7</p>
              </div>
              <motion.button
                whileHover={{ rotate: 90 }}
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </motion.button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/50">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                      msg.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : msg.type === 'system'
                        ? 'bg-gray-700/50 text-gray-300 italic text-xs'
                        : 'bg-white/10 text-gray-100'
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/10 text-gray-100 px-4 py-2 rounded-lg flex items-center gap-2">
                    <Loader size={16} className="animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              )}

              {showHumanOption && !isLoading && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleConnectWhatsApp}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <LogOut size={16} />
                  TALK TO HUMAN AGENT
                </motion.button>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-white/10 p-4 bg-black/50">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg disabled:opacity-50 transition-colors"
                >
                  <Send size={20} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
