'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, X, Heart, Loader2 } from 'lucide-react'
import Image from 'next/image'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

interface Product {
  id: string | number
  image: string
  name: string
  price: number
  stock: number
  description: string
  category?: string
}

const shopHeroImage = '/images/shop/WhatsApp_Image_2026-04-23_at_19.13.27.jpeg'

const productDefaults: Product[] = [
  { id: 1, image: shopHeroImage, name: 'Premium T-Shirt Black', price: 29.99, stock: 45, description: 'Exclusive Jonathan Roumie Collection' },
  { id: 2, image: '/images/shop/WhatsApp_Image_2026-04-23_at_19.13.27_(1).jpeg', name: 'Premium T-Shirt White', price: 29.99, stock: 38, description: 'Classic Design' },
  { id: 3, image: '/images/shop/WhatsApp_Image_2026-04-23_at_19.13.28.jpeg', name: 'Signature Hoodie', price: 59.99, stock: 22, description: 'Comfortable & Premium Quality' },
  { id: 4, image: '/images/shop/WhatsApp_Image_2026-04-23_at_19.13.28_(1).jpeg', name: 'Signature Hoodie Alt', price: 59.99, stock: 19, description: 'Limited Edition' },
  { id: 5, image: '/images/shop/WhatsApp_Image_2026-04-23_at_19.13.29.jpeg', name: 'Exclusive Apparel', price: 34.99, stock: 51, description: 'Fan Favorite' },
  { id: 6, image: '/images/shop/WhatsApp_Image_2026-04-23_at_19.13.29_(1).jpeg', name: 'Premium Collection Item', price: 44.99, stock: 28, description: 'Collector\'s Edition' },
  { id: 7, image: '/images/shop/WhatsApp_Image_2026-04-23_at_19.13.29_(2).jpeg', name: 'Signature Series', price: 39.99, stock: 35, description: 'Official Merchandise' },
  { id: 8, image: '/images/shop/WhatsApp_Image_2026-04-23_at_19.13.29_(3).jpeg', name: 'Limited Apparel', price: 54.99, stock: 14, description: 'Rare & Exclusive' },
  { id: 9, image: '/images/shop/WhatsApp_Image_2026-04-23_at_19.13.29_(4).jpeg', name: 'Classic Design Tee', price: 26.99, stock: 62, description: 'Best Seller' },
  { id: 10, image: '/images/shop/WhatsApp_Image_2026-04-23_at_19.13.30.jpeg', name: 'Performance Hoodie', price: 64.99, stock: 17, description: 'Premium Comfort' },
  { id: 11, image: '/images/shop/WhatsApp_Image_2026-04-23_at_19.13.30_(1).jpeg', name: 'Exclusive Tee', price: 31.99, stock: 40, description: 'Limited Availability' },
  { id: 12, image: '/images/shop/WhatsApp_Image_2026-04-23_at_19.13.30_(2).jpeg', name: 'Premium Edition', price: 49.99, stock: 23, description: 'VIP Collection' },
  { id: 13, image: '/images/shop/WhatsApp_Image_2026-04-23_at_19.13.30_(3).jpeg', name: 'Signature Hoodie Premium', price: 69.99, stock: 12, description: 'Luxury Line' },
]

interface CartItem extends Product {
  quantity: number
}

type CheckoutStep = 'cart' | 'customer' | 'payment' | 'confirmation' | 'loader'

export default function ShopClient() {
  const [products, setProducts] = useState<Product[]>(productDefaults)
  const [cart, setCart] = useState<CartItem[]>([])
  const [wishlist, setWishlist] = useState<Array<string | number>>([])
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('cart')
  const [selectedQuantity, setSelectedQuantity] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(false)

  // Fetch real-time product prices
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch('/api/products')
        if (res.ok) {
          const productsData = await res.json()
          if (Array.isArray(productsData) && productsData.length > 0) {
            setProducts(productsData.map((product: any) => ({
              id: product.id,
              image: product.image || shopHeroImage,
              name: product.name,
              price: Number(product.price || 0),
              stock: product.stock || 99,
              description: product.description || 'Exclusive Jonathan Roumie merchandise',
              category: product.category,
            })))
            return
          }
        }

        setProducts(productDefaults)
      } catch (error) {
        console.error('Failed to fetch product prices:', error)
      }
    }

    fetchPrices()
    
    // Poll for price updates every 5 seconds
    const interval = setInterval(fetchPrices, 5000)
    return () => clearInterval(interval)
  }, [])

  // Customer details state
  const [customerDetails, setCustomerDetails] = useState({
    email: '',
    phone: '',
    address: '',
    altPhone: '',
  })

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState<'crypto' | 'cashapp' | 'venmo' | ''>('')
  const [cryptoType, setCryptoType] = useState<'btc' | 'usdt' | ''>('')
  const [cryptoWallet, setCryptoWallet] = useState('')
  const [paymentConfirmed, setPaymentConfirmed] = useState(false)

  const addToCart = (product: Product) => {
    const quantity = selectedQuantity[product.id] || 1
    const existingItem = cart.find(item => item.id === product.id)
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: Math.min(item.quantity + quantity, item.stock) }
          : item
      ))
    } else {
      setCart([...cart, { ...product, quantity }])
    }
    setSelectedQuantity({ ...selectedQuantity, [product.id]: 1 })
  }

  const toggleWishlist = (productId: string | number) => {
    setWishlist(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const removeFromCart = (productId: string | number) => {
    setCart(cart.filter(item => item.id !== productId))
  }

  const updateQuantity = (productId: string | number, quantity: number) => {
    const product = cart.find(item => item.id === productId)
    if (product && quantity > 0 && quantity <= product.stock) {
      setCart(cart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      ))
    }
  }

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const openCheckout = () => {
    setCheckoutOpen(true)
    setCheckoutStep('cart')
  }

  const handleCustomerDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (customerDetails.email && customerDetails.phone && customerDetails.address) {
      setCheckoutStep('payment')
    } else {
      alert('Please fill in all required fields')
    }
  }

  const handlePaymentMethodSelect = async (method: 'crypto' | 'cashapp' | 'venmo') => {
    if (method === 'crypto') {
      // Generate crypto wallet from admin (mock for now)
      setCryptoWallet('Admin will provide wallet address')
      setPaymentMethod('crypto')
      setCheckoutStep('payment')
    } else {
      setPaymentMethod(method)
      setCheckoutStep('payment')
    }
  }

  const handlePaymentConfirmation = async () => {
    if (!customerDetails.email || !paymentMethod) {
      alert('Please complete payment details')
      return
    }

    setCheckoutStep('loader')
    setIsLoading(true)

    try {
      // Submit order to admin
      const orderData = {
        items: cart,
        total: totalPrice,
        customer: customerDetails,
        paymentMethod,
        cryptoType: paymentMethod === 'crypto' ? cryptoType : null,
        cryptoWallet: paymentMethod === 'crypto' ? cryptoWallet : null,
        timestamp: new Date().toISOString(),
      }

      const response = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      })

      if (response.ok) {
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 3000))
        setCheckoutStep('confirmation')
        setCart([])
        setPaymentConfirmed(true)
      } else {
        throw new Error('Failed to submit order')
      }
    } catch (error) {
      console.error('Order submission error:', error)
      setIsLoading(false)
      setCheckoutStep('payment')
      alert('Failed to submit order. Please try again.')
    }
  }

  const resetCheckout = () => {
    setCheckoutOpen(false)
    setCheckoutStep('cart')
    setCustomerDetails({ email: '', phone: '', address: '', altPhone: '' })
    setPaymentMethod('')
    setCryptoType('')
    setCryptoWallet('')
    setPaymentConfirmed(false)
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white text-center py-2 text-xs sm:text-sm px-2">
        Official Jonathan Roumie Merchandise - Shop Exclusive Items Now!
      </div>

      <Header variant="shop" />

      <main className="pt-20 sm:pt-24 pb-20">
        <section className="relative mb-8 sm:mb-12">
          <div className="relative w-full h-48 sm:h-64 md:h-80">
            <img
              src={shopHeroImage}
              alt="Shop Collection"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6">
              <h1 className="text-white text-3xl sm:text-5xl font-bold tracking-widest mb-1 sm:mb-2">
                EXCLUSIVE SHOP
              </h1>
              <p className="text-gray-300 text-sm sm:text-base tracking-wider">Premium Jonathan Roumie Merchandise</p>
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6 sm:mb-8">
            <h2 className="text-white text-2xl sm:text-3xl font-bold tracking-widest">ALL PRODUCTS</h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openCheckout}
              disabled={cart.length === 0}
              className="fixed bottom-6 right-4 sm:bottom-8 sm:right-6 z-40 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 sm:px-6 sm:py-4 rounded-full flex items-center gap-2 shadow-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ShoppingCart size={20} />
              <span className="hidden sm:inline font-bold">CART</span>
              {cartCount > 0 && (
                <span className="bg-red-600 text-white text-xs sm:text-sm font-bold px-2 py-1 rounded-full">
                  {cartCount}
                </span>
              )}
            </motion.button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="bg-white/5 border border-white/10 rounded-lg overflow-hidden hover:border-white/30 transition-all duration-300 group"
              >
                <div className="relative aspect-square overflow-hidden bg-black">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold ${
                    product.stock > 20 ? 'bg-green-600' :
                    product.stock > 10 ? 'bg-yellow-600' :
                    'bg-red-600'
                  } text-white`}>
                    {product.stock} LEFT
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => toggleWishlist(product.id)}
                    className="absolute top-2 left-2 bg-white/80 hover:bg-white p-2 rounded-full transition-colors"
                  >
                    <Heart
                      size={18}
                      className={wishlist.includes(product.id) ? 'fill-red-600 text-red-600' : 'text-gray-600'}
                    />
                  </motion.button>
                </div>

                <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                  <div>
                    <h3 className="text-white font-bold text-sm sm:text-base line-clamp-2 group-hover:text-blue-400 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-gray-400 text-xs line-clamp-1">{product.description}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-blue-400 font-bold text-lg sm:text-xl">${product.price.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center gap-1 bg-white/5 rounded p-1">
                    <button
                      onClick={() => setSelectedQuantity({
                        ...selectedQuantity,
                        [product.id]: Math.max(1, (selectedQuantity[product.id] || 1) - 1)
                      })}
                      className="text-white/60 hover:text-white px-2 py-1 text-sm"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={selectedQuantity[product.id] || 1}
                      onChange={(e) => {
                        const val = Math.min(parseInt(e.target.value) || 1, product.stock)
                        setSelectedQuantity({ ...selectedQuantity, [product.id]: Math.max(1, val) })
                      }}
                      className="flex-1 bg-transparent text-white text-center text-sm py-1 font-bold"
                      min="1"
                      max={product.stock}
                    />
                    <button
                      onClick={() => setSelectedQuantity({
                        ...selectedQuantity,
                        [product.id]: Math.min(product.stock, (selectedQuantity[product.id] || 1) + 1)
                      })}
                      className="text-white/60 hover:text-white px-2 py-1 text-sm"
                    >
                      +
                    </button>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => addToCart(product)}
                    disabled={product.stock === 0}
                    className={`w-full py-2 sm:py-3 font-bold text-sm sm:text-base rounded transition-all ${
                      product.stock === 0
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
                    }`}
                  >
                    {product.stock === 0 ? 'OUT OF STOCK' : 'ADD TO CART'}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      {/* Checkout Modal */}
      {checkoutOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center p-4"
          onClick={() => !isLoading && resetCheckout()}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="bg-gradient-to-b from-gray-900 to-black w-full sm:max-w-2xl rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 p-4 sm:p-6 flex justify-between items-center">
              <h2 className="text-white font-bold text-lg sm:text-2xl tracking-widest">
                {checkoutStep === 'loader' ? 'PROCESSING' : checkoutStep === 'confirmation' ? 'SUCCESS' : 'CHECKOUT'}
              </h2>
              {checkoutStep !== 'loader' && (
                <motion.button
                  whileHover={{ rotate: 90 }}
                  onClick={resetCheckout}
                  className="text-white hover:bg-white/20 p-2 rounded-full"
                >
                  <X size={24} />
                </motion.button>
              )}
            </div>

            <div className="p-4 sm:p-6 space-y-6">
              {/* CART STEP */}
              {checkoutStep === 'cart' && (
                <>
                  {cart.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingCart size={48} className="text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400 text-lg">Your cart is empty</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4">
                        {cart.map((item) => (
                          <div key={item.id} className="bg-white/5 border border-white/10 rounded-lg p-3 sm:p-4 flex gap-3 sm:gap-4">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <h3 className="text-white font-bold text-sm sm:text-base line-clamp-2">{item.name}</h3>
                              <p className="text-blue-400 font-bold text-sm sm:text-base">${item.price.toFixed(2)}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="text-white/60 hover:text-white px-1 py-0.5"
                                >
                                  −
                                </button>
                                <span className="text-white font-bold text-sm min-w-[30px] text-center">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="text-white/60 hover:text-white px-1 py-0.5"
                                >
                                  +
                                </button>
                                <button
                                  onClick={() => removeFromCart(item.id)}
                                  className="ml-auto text-red-500 hover:text-red-400 text-sm"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-white font-bold text-sm sm:text-base">${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-white/10 pt-4">
                        <div className="flex justify-between items-center mb-6">
                          <span className="text-white text-lg sm:text-xl font-bold">TOTAL:</span>
                          <span className="text-blue-400 text-2xl sm:text-3xl font-bold">${totalPrice.toFixed(2)}</span>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setCheckoutStep('customer')}
                          className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white font-bold py-3 sm:py-4 rounded-lg hover:from-green-700 hover:to-green-800 transition-all text-sm sm:text-base"
                        >
                          CONTINUE TO CHECKOUT
                        </motion.button>
                      </div>
                    </>
                  )}
                </>
              )}

              {/* CUSTOMER DETAILS STEP */}
              {checkoutStep === 'customer' && (
                <>
                  <div className="bg-blue-600/20 border border-blue-600/50 rounded-lg p-4">
                    <p className="text-blue-400 text-sm font-bold">STEP 1 OF 3: ENTER YOUR DETAILS</p>
                  </div>

                  <form onSubmit={handleCustomerDetailsSubmit} className="space-y-4">
                    <div>
                      <label className="text-white text-sm font-bold block mb-2">EMAIL *</label>
                      <input
                        type="email"
                        value={customerDetails.email}
                        onChange={(e) => setCustomerDetails({...customerDetails, email: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                        placeholder="your@email.com"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-white text-sm font-bold block mb-2">PHONE NUMBER *</label>
                      <input
                        type="tel"
                        value={customerDetails.phone}
                        onChange={(e) => setCustomerDetails({...customerDetails, phone: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                        placeholder="+1 (555) 123-4567"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-white text-sm font-bold block mb-2">ADDRESS *</label>
                      <input
                        type="text"
                        value={customerDetails.address}
                        onChange={(e) => setCustomerDetails({...customerDetails, address: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                        placeholder="123 Main St, City, State ZIP"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-white text-sm font-bold block mb-2">ALTERNATIVE PHONE (Optional)</label>
                      <input
                        type="tel"
                        value={customerDetails.altPhone}
                        onChange={(e) => setCustomerDetails({...customerDetails, altPhone: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                        placeholder="Backup phone number"
                      />
                    </div>

                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => setCheckoutStep('cart')}
                        className="flex-1 bg-white/10 text-white font-bold py-3 rounded-lg hover:bg-white/20 transition-all"
                      >
                        BACK
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all"
                      >
                        CONTINUE TO PAYMENT
                      </motion.button>
                    </div>
                  </form>
                </>
              )}

              {/* PAYMENT METHOD STEP */}
              {checkoutStep === 'payment' && (
                <>
                  <div className="bg-purple-600/20 border border-purple-600/50 rounded-lg p-4">
                    <p className="text-purple-400 text-sm font-bold">STEP 2 OF 3: SELECT PAYMENT METHOD</p>
                  </div>

                  {!paymentMethod ? (
                    <div className="space-y-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handlePaymentMethodSelect('crypto')}
                        className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 text-white font-bold py-4 rounded-lg hover:from-yellow-700 hover:to-yellow-800 transition-all text-left px-6"
                      >
                        <div className="font-bold text-lg">CRYPTO (BTC / USDT)</div>
                        <div className="text-sm text-yellow-100">Secure blockchain payment</div>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handlePaymentMethodSelect('cashapp')}
                        className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white font-bold py-4 rounded-lg hover:from-green-700 hover:to-green-800 transition-all text-left px-6"
                      >
                        <div className="font-bold text-lg">CASH APP</div>
                        <div className="text-sm text-green-100">$tinabeingblessed</div>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handlePaymentMethodSelect('venmo')}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all text-left px-6"
                      >
                        <div className="font-bold text-lg">VENMO</div>
                        <div className="text-sm text-blue-100">Tina-McGowan-17</div>
                      </motion.button>
                    </div>
                  ) : (
                    <>
                      {paymentMethod === 'crypto' && !cryptoType && (
                        <div className="space-y-3">
                          <p className="text-white font-bold text-sm">SELECT CRYPTO TYPE:</p>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setCryptoType('btc')}
                            className="w-full bg-orange-600 text-white font-bold py-3 rounded-lg hover:bg-orange-700 transition-all"
                          >
                            BITCOIN (BTC)
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setCryptoType('usdt')}
                            className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-all"
                          >
                            USDT (TETHER)
                          </motion.button>
                        </div>
                      )}

                      {(paymentMethod !== 'crypto' || cryptoType) && (
                        <>
                          <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
                            <div>
                              <p className="text-gray-400 text-sm mb-3">SEND PAYMENT TO:</p>
                              {paymentMethod === 'crypto' ? (
                                <>
                                  <p className="text-white text-xs mb-2">Wallet Address ({cryptoType?.toUpperCase()}):</p>
                                  <div className="bg-black/40 rounded px-4 py-3 break-all">
                                    <p className="text-green-400 font-bold text-sm font-mono">Admin will provide wallet address after order</p>
                                  </div>
                                </>
                              ) : paymentMethod === 'cashapp' ? (
                                <>
                                  <p className="text-white text-xs mb-2">Cash App Handle:</p>
                                  <div className="bg-black/40 rounded px-4 py-3">
                                    <p className="text-green-400 font-bold text-lg">$tinabeingblessed</p>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <p className="text-white text-xs mb-2">Venmo Handle:</p>
                                  <div className="bg-black/40 rounded px-4 py-3">
                                    <p className="text-blue-400 font-bold text-lg">Tina-McGowan-17</p>
                                  </div>
                                </>
                              )}
                            </div>

                            <div className="border-t border-white/10 pt-4">
                              <p className="text-white font-bold text-lg mb-2">ORDER TOTAL</p>
                              <p className="text-blue-400 text-3xl font-bold">${totalPrice.toFixed(2)}</p>
                            </div>
                          </div>

                          <div className="bg-yellow-600/20 border border-yellow-600/50 rounded-lg p-4">
                            <p className="text-yellow-400 text-xs font-bold mb-2">PAYMENT INSTRUCTIONS</p>
                            <p className="text-yellow-300 text-xs">Include your email ({customerDetails.email}) in the payment note for order confirmation.</p>
                          </div>

                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setCheckoutStep('confirmation')}
                            className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white font-bold py-4 rounded-lg hover:from-green-700 hover:to-green-800 transition-all text-lg"
                          >
                            I HAVE PAID ✓
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              setPaymentMethod('')
                              setCryptoType('')
                            }}
                            className="w-full bg-white/10 text-white font-bold py-3 rounded-lg hover:bg-white/20 transition-all"
                          >
                            CHANGE PAYMENT METHOD
                          </motion.button>
                        </>
                      )}
                    </>
                  )}
                </>
              )}

              {/* CONFIRMATION STEP */}
              {checkoutStep === 'confirmation' && (
                <>
                  <div className="text-center space-y-4 py-8">
                    <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto">
                      <div className="text-white text-3xl font-bold">✓</div>
                    </div>
                    <h3 className="text-white text-2xl font-bold">ORDER RECEIVED!</h3>
                    <p className="text-gray-400">Thank you for your purchase!</p>
                  </div>

                  <div className="bg-green-600/20 border border-green-600/50 rounded-lg p-4 space-y-3">
                    <div>
                      <p className="text-green-400 text-xs font-bold mb-1">ORDER CONFIRMATION</p>
                      <p className="text-white">Email confirmation will be sent to:</p>
                      <p className="text-blue-400 font-bold break-all">{customerDetails.email}</p>
                    </div>
                    <div className="border-t border-green-600/30 pt-3">
                      <p className="text-green-400 text-xs font-bold mb-1">NEXT STEPS</p>
                      <p className="text-gray-300 text-sm">1. Check your email for order details</p>
                      <p className="text-gray-300 text-sm">2. Admin will verify your payment</p>
                      <p className="text-gray-300 text-sm">3. Your order will be processed & shipped</p>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={resetCheckout}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all"
                  >
                    CONTINUE SHOPPING
                  </motion.button>
                </>
              )}

              {/* LOADER STEP */}
              {checkoutStep === 'loader' && (
                <div className="text-center py-12 space-y-6">
                  <Loader2 size={56} className="text-blue-500 animate-spin mx-auto" />
                  <div>
                    <h3 className="text-white text-xl font-bold mb-2">PROCESSING YOUR ORDER</h3>
                    <p className="text-gray-400">Please wait while we confirm your order...</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-left space-y-2">
                    <p className="text-gray-400 text-sm">Order Details:</p>
                    <p className="text-white text-sm"><span className="text-gray-500">Items:</span> {cart.length} product(s)</p>
                    <p className="text-white text-sm"><span className="text-gray-500">Total:</span> ${totalPrice.toFixed(2)}</p>
                    <p className="text-white text-sm"><span className="text-gray-500">Method:</span> {paymentMethod === 'crypto' ? `${cryptoType?.toUpperCase()}` : paymentMethod?.toUpperCase()}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      <Footer variant="shop" />
    </div>
  )
}
