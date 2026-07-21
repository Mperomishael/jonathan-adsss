'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, DollarSign, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
}

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch('/api/products')
        if (res.ok) {
          const data = await res.json()
          setProducts(data)
        } else {
          // Fallback products
          setProducts([
            {
              id: '1',
              name: 'Jonathan Roumie Fan Card',
              description: 'Exclusive personalized fan card with your name',
              price: 50,
              image: 'https://i.ibb.co/m5Xz2Vy2/image.png',
              category: 'cards',
            },
            {
              id: '2',
              name: 'Exclusive Merchandise Bundle',
              description: 'Limited edition Jonathan Roumie merchandise',
              price: 75,
              image: 'https://i.ibb.co/m5Xz2Vy2/image.png',
              category: 'merchandise',
            },
            {
              id: '3',
              name: 'VIP Event Pass',
              description: 'Access to exclusive VIP events and meet-and-greets',
              price: 150,
              image: 'https://i.ibb.co/m5Xz2Vy2/image.png',
              category: 'events',
            },
          ])
        }
      } catch (err) {
        console.error('Failed to load products:', err)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  const categories = ['all', 'cards', 'merchandise', 'events']
  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory)

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm sm:text-base tracking-widest">LOADING STORE...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header variant="main" />

      <main className="flex-1 py-12 sm:py-16 md:py-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10 sm:mb-12 md:mb-16"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-widest mb-3 sm:mb-4">
              JONATHAN ROUMIE STORE
            </h1>
            <p className="text-gray-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-2">
              Exclusive merchandise, fan cards, and VIP experiences
            </p>
          </motion.div>

          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex gap-2 sm:gap-3 mb-10 sm:mb-12 overflow-x-auto pb-2 px-2 sm:px-0"
          >
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 sm:px-6 py-2 rounded-full font-bold tracking-widest whitespace-nowrap transition-all text-xs sm:text-sm ${
                  selectedCategory === cat
                    ? 'bg-red-600 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </motion.div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-12">
            {filteredProducts.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white/5 border border-white/10 rounded-lg sm:rounded-2xl overflow-hidden hover:border-red-500/50 transition-all duration-300 group flex flex-col h-full"
              >
                {/* Product Image */}
                <div className="relative w-full aspect-square sm:aspect-video bg-gradient-to-br from-red-600/20 to-purple-600/20 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>

                {/* Product Info */}
                <div className="p-3 sm:p-6 space-y-3 sm:space-y-4 flex-1 flex flex-col">
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold tracking-wider mb-1 sm:mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-gray-400 text-xs sm:text-sm line-clamp-2">
                      {product.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <DollarSign size={16} className="text-red-400" />
                      <span className="text-lg sm:text-2xl font-bold">{product.price}</span>
                    </div>
                    <Link
                      href={`/store/${product.id}`}
                      className="bg-red-600 hover:bg-red-700 p-2 sm:p-3 rounded-lg transition-colors"
                    >
                      <ArrowRight size={18} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 sm:py-16"
            >
              <ShoppingCart size={40} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400 text-base sm:text-lg">No products in this category</p>
            </motion.div>
          )}
        </div>
      </main>

      <Footer variant="main" />
    </div>
  )
}
