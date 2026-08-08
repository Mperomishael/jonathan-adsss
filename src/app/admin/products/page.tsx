use client'

import { useState, useEffect, useCallback } from 'react'
import { useAdminAuth } from '@/components/admin/AdminAuthProvider'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, Loader2, AlertCircle, X, Save } from 'lucide-react'
import ImageUpload from '@/components/admin/ImageUpload'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  stock?: number
  inStock?: boolean
}

const emptyForm = {
  name: '',
  description: '',
  price: '',
  category: 'merchandise',
  image: '',
  stock: '99',
  inStock: true,
}

export default function AdminProductsPage() {
  const { user, isAdmin, loading, getToken } = useAdminAuth()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/admin/login')
    }
  }, [user, isAdmin, loading, router])

  const authHeaders = useCallback(async () => {
    const t = await getToken()
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${t}`,
    }
  }, [getToken])

  const loadProducts = useCallback(async () => {
    try {
      const h = await authHeaders()
      // Prefer admin route (auth); fall back to public
      let res = await fetch('/api/admin/products', { headers: h })
      if (!res.ok) res = await fetch('/api/products')
      if (res.ok) {
        const data = await res.json()
        setProducts(Array.isArray(data) ? data : [])
      }
    } catch {
      setError('Failed to load products')
    } finally {
      setLoadingProducts(false)
    }
  }, [authHeaders])

  useEffect(() => {
    if (user && isAdmin) loadProducts()
  }, [user, isAdmin, loadProducts])

  const openCreate = () => {
    setEditingId(null)
    setFormData(emptyForm)
    setShowForm(true)
    setError('')
  }

  const openEdit = (p: Product) => {
    setEditingId(p.id)
    setFormData({
      name: p.name,
      description: p.description || '',
      price: String(p.price ?? ''),
      category: p.category || 'merchandise',
      image: p.image || '',
      stock: String(p.stock ?? 99),
      inStock: p.inStock !== false,
    })
    setShowForm(true)
    setError('')
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const price = parseFloat(formData.price)
      if (!formData.name.trim()) throw new Error('Name is required')
      if (!(price > 0)) throw new Error('Price must be greater than 0')

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price,
        category: formData.category,
        image:
          formData.image.trim() ||
          '/images/shop/WhatsApp_Image_2026-04-23_at_19.13.27.jpeg',
        stock: parseInt(formData.stock, 10) || 0,
        inStock: formData.inStock && (parseInt(formData.stock, 10) || 0) > 0,
      }

      const h = await authHeaders()

      if (editingId) {
        const res = await fetch(`/api/admin/products?id=${editingId}`, {
          method: 'PUT',
          headers: h,
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.error || 'Failed to update product')
        }
        setSuccess('Product updated — shop will show the new price.')
      } else {
        const res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: h,
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.error || 'Failed to add product')
        }
        setSuccess('Product added — it will appear in the shop.')
      }

      setShowForm(false)
      setEditingId(null)
      setFormData(emptyForm)
      await loadProducts()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return
    try {
      const h = await authHeaders()
      const res = await fetch(`/api/admin/products?id=${id}`, {
        method: 'DELETE',
        headers: h,
      })
      if (!res.ok) throw new Error('Delete failed')
      await loadProducts()
    } catch {
      setError('Failed to delete product')
    }
  }

  if (loading || loadingProducts) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="text-red-500 animate-spin" size={32} />
      </div>
    )
  }

  if (!user || !isAdmin) return null

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-white text-2xl font-black tracking-widest">PRODUCTS</h1>
          <p className="text-gray-500 text-sm mt-1">Add, edit prices, and manage shop inventory</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 text-sm"
        >
          <Plus size={18} />
          ADD PRODUCT
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-900/20 border border-red-800/50 rounded-lg p-4 text-red-300 mb-6">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="bg-green-900/20 border border-green-800/50 rounded-lg p-4 text-green-300 mb-6">
          {success}
        </div>
      )}

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white text-lg font-black tracking-widest">
              {editingId ? 'EDIT PRODUCT' : 'NEW PRODUCT'}
            </h2>
            <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-gray-400 text-xs tracking-widest block mb-2">NAME</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-red-500"
                required
              />
            </div>

            <div>
              <label className="text-gray-400 text-xs tracking-widest block mb-2">DESCRIPTION</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-red-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-gray-400 text-xs tracking-widest block mb-2">PRICE (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-red-500"
                  required
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs tracking-widest block mb-2">STOCK</label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs tracking-widest block mb-2">CATEGORY</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-red-500"
                >
                  <option value="merchandise">Merchandise</option>
                  <option value="apparel">Apparel</option>
                  <option value="cards">Cards</option>
                  <option value="events">Events</option>
                </select>
              </div>
            </div>

            <ImageUpload
              label="PRODUCT IMAGE"
              folder="products"
              value={formData.image}
              onChange={(url) => setFormData({ ...formData, image: url })}
            />

            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.inStock}
                onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                className="accent-red-600"
              />
              In stock
            </label>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {editingId ? 'SAVE CHANGES' : 'ADD PRODUCT'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 bg-white/10 text-white py-3 rounded-xl font-bold text-sm"
              >
                CANCEL
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
          >
            <div className="h-40 bg-black/40 overflow-hidden">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-4 space-y-3">
              <div>
                <h3 className="text-white font-bold tracking-wide">{product.name}</h3>
                <p className="text-blue-400 font-bold">${Number(product.price).toFixed(2)}</p>
                <p className="text-gray-500 text-xs mt-1">
                  Stock: {product.stock ?? '—'} · {product.category}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(product)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2"
                >
                  <Edit2 size={14} />
                  EDIT
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(product.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-bold"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {products.length === 0 && !showForm && (
        <p className="text-center text-gray-500 py-16">No products yet. Add your first product.</p>
      )}
    </div>
  )
}
