'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  details?: string
}

export default function ProductDetailPage() {
  const params = useParams()
  const productId = params.id as string
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const res = await fetch(`/api/products/${productId}`)
        if (res.ok) {
          const data = await res.json()
          setProduct(data)
        }
      } catch (err) {
        console.error('Failed to load product:', err)
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [productId])

  const handleAddToCart = async () => {
    setAdding(true)
    try {
      const res = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity }),
      })
      if (res.ok) {
        alert('Added to cart!')
      }
    } catch (err) {
      alert('Failed to add to cart')
    } finally {
      setAdding(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading product...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-red-400" />
          <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
          <Link href="/store" className="text-blue-400 hover:text-blue-300">
            Back to Store
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header variant="main" />

      <main className="flex-1 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link href="/store" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8">
            <ArrowLeft size={20} />
            Back to Store
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-12"
          >
            {/* Product Image */}
            <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl overflow-hidden h-96 md:h-full min-h-96">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Product Details */}
            <div className="space-y-8">
              <div>
                <p className="text-blue-400 text-sm font-bold tracking-widest mb-2">
                  {product.category.toUpperCase()}
                </p>
                <h1 className="text-4xl font-black tracking-widest mb-4">{product.name}</h1>
                <p className="text-gray-400 text-lg">{product.description}</p>
              </div>

              {/* Price */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                <p className="text-gray-400 text-sm mb-2">Price</p>
                <div className="text-5xl font-black text-blue-400">${product.price}</div>
              </div>

              {/* Details */}
              {product.details && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                  <h3 className="font-bold tracking-widest mb-3">DETAILS</h3>
                  <p className="text-gray-400 text-sm whitespace-pre-line">{product.details}</p>
                </div>
              )}

              {/* Quantity & Action */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-bold tracking-widest">QUANTITY</label>
                  <div className="flex items-center border border-white/10 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 hover:bg-white/10 transition-colors"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 bg-transparent text-center border-0 focus:outline-none"
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-4 py-2 hover:bg-white/10 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={adding}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-4 rounded-xl font-bold tracking-widest transition-colors flex items-center justify-center gap-3"
                >
                  {adding ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      ADDING...
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={20} />
                      ADD TO CART
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer variant="main" />
    </div>
  )
}
