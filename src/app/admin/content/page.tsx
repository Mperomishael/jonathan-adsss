'use client'

import { useState, useEffect } from 'react'
import { useAdminAuth } from '@/components/admin/AdminAuthProvider'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Upload, Edit2, Save, X, Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface ContentData {
  hero: any
  welcome: any
  sections: any
}

export default function AdminContentPage() {
  const { user, isAdmin, loading } = useAdminAuth()
  const router = useRouter()
  const [content, setContent] = useState<ContentData | null>(null)
  const [loadingContent, setLoadingContent] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('hero')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editData, setEditData] = useState<any>(null)

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/admin/login')
    }
  }, [user, isAdmin, loading, router])

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      const res = await fetch('/api/admin/content')
      if (res.ok) {
        const data = await res.json()
        setContent(data)
        setEditData(data)
      }
    } catch (err) {
      setError('Failed to load content')
    } finally {
      setLoadingContent(false)
    }
  }

  const handleSaveContent = async () => {
    setSaving(true)
    setError('')

    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      })

      if (res.ok) {
        setContent(editData)
        setEditing(false)
      } else {
        setError('Failed to save content')
      }
    } catch (err) {
      setError('Error saving content')
    } finally {
      setSaving(false)
    }
  }

  if (loading || loadingContent) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || !isAdmin || !content) return null

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="bg-red-900/20 border-b border-red-800/50 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-3xl font-black tracking-widest">CONTENT MANAGEMENT</h1>
          <Link href="/admin" className="text-gray-400 hover:text-white">Back</Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {error && (
          <div className="flex items-center gap-3 bg-red-900/20 border border-red-800/50 rounded-lg p-4 text-red-300 mb-6">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className="flex gap-2 mb-8 bg-white/5 border border-white/10 rounded-lg p-2">
          {['hero', 'welcome', 'sections'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded font-bold tracking-widest transition-colors ${
                activeTab === tab
                  ? 'bg-red-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {activeTab === 'hero' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black tracking-widest">HERO SLIDER</h2>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-bold flex items-center gap-2"
                >
                  <Edit2 size={18} />
                  EDIT
                </button>
              )}
            </div>

            {editing ? (
              <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
                {editData?.hero?.slides?.map((slide: any, idx: number) => (
                  <div key={idx} className="bg-black/50 border border-white/10 rounded-lg p-4 space-y-3">
                    <div>
                      <label className="text-sm font-bold block mb-2">TITLE {idx + 1}</label>
                      <input
                        type="text"
                        value={slide.title}
                        onChange={(e) => {
                          const newSlides = [...editData.hero.slides]
                          newSlides[idx].title = e.target.value
                          setEditData({ ...editData, hero: { ...editData.hero, slides: newSlides } })
                        }}
                        className="w-full bg-white/5 border border-white/10 text-white px-4 py-2 rounded focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>
                ))}

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleSaveContent}
                    disabled={saving}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 px-4 py-3 rounded font-bold flex items-center justify-center gap-2"
                  >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    SAVE
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false)
                      setEditData(content)
                    }}
                    className="flex-1 bg-white/10 px-4 py-3 rounded font-bold"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {content.hero?.slides?.map((slide: any, idx: number) => (
                  <div key={idx} className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                    <div className="aspect-video bg-black/50 overflow-hidden">
                      <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4">
                      <p className="font-bold tracking-widest">{slide.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'welcome' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
            <h2 className="text-2xl font-black tracking-widest">WELCOME MESSAGE</h2>
            <div>
              <p className="text-gray-400">{content.welcome?.message}</p>
              <p className="text-blue-400 mt-2">{content.welcome?.linkText}</p>
            </div>
          </motion.div>
        )}

        {activeTab === 'sections' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {Object.entries(content.sections || {}).map(([key, section]: [string, any]) => (
              <div key={key} className="bg-white/5 border border-white/10 rounded-lg p-6">
                <h3 className="text-xl font-black tracking-widest mb-4 capitalize">{key}</h3>
                <p><strong>Title:</strong> {section.title}</p>
                <p className="text-gray-400"><strong>Description:</strong> {section.description}</p>
              </div>
            ))}
          </motion.div>
        )}
      </main>
    </div>
  )
}
