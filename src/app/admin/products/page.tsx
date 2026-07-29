'use client'

import { useState, useEffect } from 'react'
import { useAdminAuth } from '@/components/admin/AdminAuthProvider'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, Upload, Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
}

export default function AdminProductsPage() {
  const { user, isAdmin, loading } = useAdminAuth()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'cards',
    image: null as File | null,
  })
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/admin/login')
    }
  }, [user, isAdmin, loading, router])

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const res = await fetch('/api/products')
      if (res.ok) {
        const data = await res.json()
        setProducts(data)
      }
    } catch (err) {
      setError('Failed to load products')
    } finally {
      setLoadingProducts(false)
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, image: file })
    }
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)
    setError('')

    try {
      const form = new FormData()
      form.append('name', formData.name)
      form.append('description', formData.description)
      form.append('price', formData.price)
      form.append('category', formData.category)
      if (formData.image) {
        form.append('image', formData.image)
      }

      const res = await fetch('/api/admin/products/add', {
        method: 'POST',
        body: form,
      })

      if (res.ok) {
        setFormData({ name: '', description: '', price: '', category: 'cards', image: null })
        setShowForm(false)
        loadProducts()
      } else {
        setError('Failed to add product')
      }
    } catch (err) {
      setError('Error adding product')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return

    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
      if (res.ok) {
        loadProducts()
      }
    } catch (err) {
      setError('Failed to delete product')
    }
  }

  if (loading || loadingProducts) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || !isAdmin) return null

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-black tracking-widest">PRODUCT MANAGEMENT</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            ADD PRODUCT
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-3 bg-red-900/20 border border-red-800/50 rounded-lg p-4 text-red-300 mb-8">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Add Product Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8"
          >
            <h2 className="text-2xl font-black tracking-widest mb-6">NEW PRODUCT</h2>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="text-sm font-bold block mb-2">PRODUCT NAME</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-bold block mb-2">DESCRIPTION</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-red-500"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold block mb-2">PRICE ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-red-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-bold block mb-2">CATEGORY</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-red-500"
                  >
                    <option value="cards">Cards</option>
                    <option value="merchandise">Merchandise</option>
                    <option value="events">Events</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-bold block mb-2">PRODUCT IMAGE</label>
                <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center cursor-pointer hover:border-red-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="image-input"
                  />
                  <label htmlFor="image-input" className="cursor-pointer flex flex-col items-center">
                    <Upload size={32} className="text-gray-400 mb-2" />
                    <p className="text-gray-400">{formData.image ? formData.image.name : 'Click to upload image'}</p>
                  </label>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      ADDING...
                    </>
                  ) : (
                    'ADD PRODUCT'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-white/10 text-white py-3 rounded-lg font-bold"
                >
                  CANCEL
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Products List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
            >
              <div className="h-48 bg-gradient-to-br from-blue-600/20 to-purple-600/20 overflow-hidden">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-bold tracking-wider">{product.name}</h3>
                  <p className="text-gray-400 text-sm">${product.price}</p>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm font-bold flex items-center justify-center gap-2">
                    <Edit2 size={16} />
                    EDIT
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded text-sm font-bold flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">No products yet. Add your first product!</p>
          </div>
        )}
      </div>
    </div>
  )
}
