'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, X, Check, ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { useAdminAuth } from '@/components/admin/AdminAuthProvider'
import type { GalleryImage } from '@/lib/firestore'

const CATS = ['Events', 'Art', 'Training', 'Fans', 'Media', 'Collectibles', 'Other']

export default function AdminGalleryPage() {
  const { getToken } = useAdminAuth()
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ src: '', alt: '', category: 'Events' })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function headers() {
    const t = await getToken()
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` }
  }

  async function load() {
    const h = await headers()
    const res = await fetch('/api/admin/gallery', { headers: h })
    setImages(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function save() {
    if (!form.src || !form.alt) return
    setSaving(true)
    const h = await headers()
    await fetch('/api/admin/gallery', { method: 'POST', headers: h, body: JSON.stringify(form) })
    await load()
    setShowForm(false)
    setForm({ src: '', alt: '', category: 'Events' })
    setSaving(false)
  }

  async function remove(id: string) {
    if (!confirm('Delete this image?')) return
    setDeleting(id)
    const h = await headers()
    await fetch(`/api/admin/gallery?id=${id}`, { method: 'DELETE', headers: h })
    await load()
    setDeleting(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-white text-2xl font-black tracking-widest">GALLERY</h1>
          <p className="text-gray-500 text-sm mt-1">{images.length} images</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold tracking-wide hover:bg-red-700 transition-colors">
          <Plus size={16} /> Add Image
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => <div key={i} className="bg-white/3 aspect-square rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {images.map((img) => (
            <motion.div key={img.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative group aspect-square bg-white/3 rounded-xl overflow-hidden">
              <Image src={img.src} alt={img.alt} fill className="object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors flex items-center justify-center">
                <button onClick={() => remove(img.id)} disabled={deleting === img.id}
                  className="opacity-0 group-hover:opacity-100 bg-red-600 text-white p-2 rounded-full transition-all hover:bg-red-700 disabled:opacity-50">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 translate-y-full group-hover:translate-y-0 transition-transform">
                <p className="text-white text-xs font-medium truncate">{img.alt}</p>
                <p className="text-gray-400 text-[10px]">{img.category}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white font-black tracking-widest">ADD IMAGE</h2>
                <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white"><X size={20} /></button>
              </div>

              {/* Preview */}
              {form.src && (
                <div className="relative aspect-video mb-4 rounded-xl overflow-hidden bg-white/5">
                  <Image src={form.src} alt="preview" fill className="object-cover" onError={() => {}} />
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 text-xs tracking-widest block mb-1">IMAGE URL OR PATH</label>
                  <input type="text" placeholder="/images/gallery/..." value={form.src} onChange={(e) => setForm({ ...form, src: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-red-500 transition-colors" />
                </div>
                <div>
                  <label className="text-gray-400 text-xs tracking-widest block mb-1">ALT TEXT</label>
                  <input type="text" value={form.alt} onChange={(e) => setForm({ ...form, alt: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-red-500 transition-colors" />
                </div>
                <div>
                  <label className="text-gray-400 text-xs tracking-widest block mb-1">CATEGORY</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-red-500 transition-colors">
                    {CATS.map((c) => <option key={c} value={c} className="bg-black">{c}</option>)}
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowForm(false)} className="flex-1 bg-white/5 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-white/10 transition-colors">Cancel</button>
                  <button onClick={save} disabled={saving || !form.src || !form.alt}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50">
                    <Check size={14} /> {saving ? 'Saving...' : 'Add Image'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
