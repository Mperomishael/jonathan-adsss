'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Image as ImageIcon, Save, AlertCircle, Check, Upload } from 'lucide-react'
import { useAdminAuth } from '@/components/admin/AdminAuthProvider'

interface CatalogContent {
  section: string
  content: string
  image?: string
}

export default function CatalogPage() {
  const { user, getToken } = useAdminAuth()
  const [catalog, setCatalog] = useState<CatalogContent[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [formData, setFormData] = useState<CatalogContent>({ section: '', content: '', image: '' })

  useEffect(() => {
    loadCatalog()
  }, [getToken])

  const loadCatalog = async () => {
    try {
      const token = await getToken()
      const res = await fetch('/api/admin/catalog', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setCatalog(data)
      }
    } catch (err) {
      console.error('Failed to load catalog:', err)
      setMessage({ type: 'error', text: 'Failed to load catalog' })
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (item: CatalogContent) => {
    setEditingSection(item.section)
    setFormData(item)
  }

  const handleSave = async () => {
    if (!formData.section.trim() || !formData.content.trim()) {
      setMessage({ type: 'error', text: 'Section and content are required' })
      return
    }

    setSaving(true)
    try {
      const token = await getToken()
      const res = await fetch('/api/admin/catalog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        const newItem = await res.json()
        setCatalog((prev) => {
          const index = prev.findIndex((c) => c.section === formData.section)
          if (index > -1) {
            const updated = [...prev]
            updated[index] = newItem
            return updated
          }
          return [...prev, newItem]
        })
        setMessage({ type: 'success', text: 'Catalog updated successfully' })
        setEditingSection(null)
        setFormData({ section: '', content: '', image: '' })
        setTimeout(() => setMessage(null), 3000)
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save catalog' })
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      setFormData((prev) => ({
        ...prev,
        image: event.target?.result as string,
      }))
    }
    reader.readAsDataURL(file)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-white text-2xl font-black tracking-widest">CATALOG CONTENT</h1>
        <p className="text-gray-500 text-sm mt-1">Manage website catalog images and content</p>
      </div>

      {/* Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-4 flex items-center gap-3 px-4 py-3 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-900/20 border border-green-800/50 text-green-300'
              : 'bg-red-900/20 border border-red-800/50 text-red-300'
          }`}
        >
          {message.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </motion.div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white/3 border border-white/5 rounded-2xl p-6 animate-pulse h-40" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Catalog List */}
          <div className="space-y-4">
            <h2 className="text-white font-bold tracking-widest text-sm mb-4">CATALOG SECTIONS</h2>
            {catalog.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <ImageIcon size={32} className="mx-auto mb-2 opacity-50" />
                <p>No catalog items yet</p>
              </div>
            ) : (
              catalog.map((item) => (
                <motion.div
                  key={item.section}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => startEdit(item)}
                  className="bg-white/3 border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors cursor-pointer"
                >
                  <p className="text-white font-semibold text-sm">{item.section}</p>
                  <p className="text-gray-400 text-xs mt-1 line-clamp-2">{item.content}</p>
                  {item.image && <p className="text-gray-500 text-xs mt-2">📷 Image attached</p>}
                </motion.div>
              ))
            )}
          </div>

          {/* Edit Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/3 border border-white/5 rounded-2xl p-6 space-y-4"
          >
            <h2 className="text-white font-bold tracking-widest text-sm">
              {editingSection ? 'EDIT SECTION' : 'ADD NEW SECTION'}
            </h2>

            <input
              type="text"
              value={formData.section}
              onChange={(e) => setFormData({ ...formData, section: e.target.value })}
              placeholder="Section name (e.g., 'Hero Banner', 'Features')"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-red-500 transition-colors text-sm"
            />

            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Content or description"
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-red-500 transition-colors text-sm resize-none"
            />

            <div className="border-2 border-dashed border-white/10 rounded-lg p-4 text-center hover:border-white/20 transition-colors">
              <label className="cursor-pointer flex flex-col items-center gap-2">
                <Upload size={24} className="text-gray-400" />
                <span className="text-sm text-gray-400">Click to upload image</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>

            {formData.image && (
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <img src={formData.image} alt="preview" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save size={18} />
                {saving ? 'Saving...' : 'Save'}
              </button>
              {editingSection && (
                <button
                  onClick={() => {
                    setEditingSection(null)
                    setFormData({ section: '', content: '', image: '' })
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2.5 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
