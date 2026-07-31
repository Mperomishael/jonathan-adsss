'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, X, Heart, Loader2, Copy, Check } from 'lucide-react'
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

interface PayConfig {
  crypto?: {
    btc?: { address?: string; enabled?: boolean }
    usdt?: { address?: string; enabled?: boolean }
  }
  cashapp?: { handle?: string; enabled?: boolean }
  venmo?: { handle?: string; enabled?: boolean }
  chipperCash?: { handle?: string; enabled?: boolean }
}

type ShopPayMethod = 'crypto' | 'cashapp' | 'venmo' | 'chipper' | ''
type CheckoutStep = 'cart' | 'customer' | 'payment' | 'confirmation' | 'loader'

interface CartItem extends Product {
  quantity: number
}

const shopHeroImage = '/images/shop/WhatsApp_Image_2026-04-23_at_19.13.27.jpeg'

const productDefaults: Product[] = [
  { id: 1, image: shopHeroImage, name: 'Premium T-Shirt Black', price: 29.99, stock: 45, description: 'Exclusive Jonathan Roumie Collection' },
  { id: 2, image: '/images/shop/WhatsApp_Image_2026-04-23_at_19.13.27_(1).jpeg', name: 'Premium T-Shirt White', price: 29.99, stock: 38, description: 'Classic Design' },
  { id: 3, image: '/images/shop/WhatsApp_Image_2026-04-23_at_19.13.28.jpeg', name: 'Signature Hoodie', price: 59.99, stock: 22, description: 'Comfortable & Premium Quality' },
  { id: 4, image: '/images/shop/WhatsApp_Image_2026-04-23_at_19.13.28_(1).jpeg', name: 'Signature Hoodie Alt', price: 59.99, stock: 19, description: 'Limited Edition' },
  { id: 5, image: '/images/shop/WhatsApp_Image_2026-04-23_at_19.13.29.jpeg', name: 'Exclusive Apparel', price: 34.99, stock: 51, description: 'Fan Favorite' },
  { id: 6, image: '/images/shop/WhatsApp_Image_2026-04-23_at_19.13.29_(1).jpeg', name: 'Premium Collection Item', price: 44.99, stock: 28, description: "Collector's Edition" },
  { id: 7, image: '/images/shop/WhatsApp_Image_2026-04-23_at_19.13.29_(2).jpeg', name: 'Signature Series', price: 39.99, stock: 35, description: 'Official Merchandise' },
  { id: 8, image: '/images/shop/WhatsApp_Image_2026-04-23_at_19.13.29_(3).jpeg', name: 'Limited Apparel', price: 54.99, stock: 14, description: 'Rare & Exclusive' },
  { id: 9, image: '/images/shop/WhatsApp_Image_2026-04-23_at_19.13.29_(4).jpeg', name: 'Classic Design Tee', price: 26.99, stock: 62, description: 'Best Seller' },
  { id: 10, image: '/images/shop/WhatsApp_Image_2026-04-23_at_19.13.30.jpeg', name: 'Performance Hoodie', price: 64.99, stock: 17, description: 'Premium Comfort' },
  { id: 11, image: '/images/shop/WhatsApp_Image_2026-04-23_at_19.13.30_(1).jpeg', name: 'Exclusive Tee', price: 31.99, stock: 40, description: 'Limited Availability' },
  { id: 12, image: '/images/shop/WhatsApp_Image_2026-04-23_at_19.13.30_(2).jpeg', name: 'Premium Edition', price: 49.99, stock: 23, description: 'VIP Collection' },
  { id: 13, image: '/images/shop/WhatsApp_Image_2026-04-23_at_19.13.30_(3).jpeg', name: 'Signature Hoodie Premium', price: 69.99, stock: 12, description: 'Luxury Line' },
]

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.left = '-9999px'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  } catch {
    return false
  }
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)

  const onCopy = async () => {
    const ok = await copyToClipboard(value)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } else {
      alert('Copy failed — long-press the text and copy manually.')
    }
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
        copied
          ? 'bg-green-900/40 border border-green-600/50 text-green-300'
          : 'bg-white/10 border border-white/15 text-gray-200 hover:bg-white/15'
      }`}
    >
      {copied ? (
        <>
          <Check size={14} /> Copied!
        </>
      ) : (
        <>
          <Copy size={14} /> Copy
        </>
      )}
    </button>
  )
}

export default function ShopClient() {
  const [products, setProducts] = useState<Product[]>(productDefaults)
  const [cart, setCart] = useState<CartItem[]>([])
  const [wishlist, setWishlist] = useState<Array<string | number>>([])
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('cart')
  const [selectedQuantity, setSelectedQuantity] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(false)

  const [payConfig, setPayConfig] = useState<PayConfig>({})
  const [payConfigLoaded, setPayConfigLoaded] = useState(false)

  const [customerDetails, setCustomerDetails] = useState({
    email: '',
    phone: '',
    address: '',
    altPhone: '',
  })

  const [paymentMethod, setPaymentMethod] = useState<ShopPayMethod>('')
  const [cryptoType, setCryptoType] = useState<'btc' | 'usdt' | ''>('')

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products')
        if (res.ok) {
          const productsData = await res.json()
          if (Array.isArray(productsData) && productsData.length > 0) {
            setProducts(
              productsData.map((product: any) => ({
                id: product.id,
                image: product.image || shopHeroImage,
                name: product.name,
                price: Number(product.price || 0),
                stock:
                  typeof product.stock === 'number'
                    ? product.stock
                    : product.inStock === false
                      ? 0
                      : 99,
                description: product.description || 'Exclusive Jonathan Roumie merchandise',
                category: product.category,
              }))
            )
            return
          }
        }
        setProducts(productDefaults)
      } catch (error) {
        console.error('Failed to fetch products:', error)
      }
    }

    fetchProducts()
    const interval = setInterval(fetchProducts, 15000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const loadPayConfig = async () => {
      try {
        const res = await fetch('/api/checkout/payment-methods')
        if (res.ok) {
          const data = await res.json()
          setPayConfig(data || {})
        }
      } catch (error) {
        console.error('Failed to fetch payment methods:', error)
      } finally {
        setPayConfigLoaded(true)
      }
    }
    loadPayConfig()
  }, [])

  const hasBtc = !!payConfig.crypto?.btc?.address
  const hasUsdt = !!payConfig.crypto?.usdt?.address
  const hasCrypto = hasBtc || hasUsdt
  const hasCashapp = !!(payConfig.cashapp?.enabled && payConfig.cashapp?.handle)
  const hasVenmo = !!(payConfig.venmo?.enabled && payConfig.venmo?.handle)
  const hasChipper = !!(payConfig.chipperCash?.enabled && payConfig.chipperCash?.handle)
  const hasAnyPayment = hasCrypto || hasCashapp || hasVenmo || hasChipper

  const activeCryptoAddress =
    cryptoType === 'btc'
      ? payConfig.crypto?.btc?.address || ''
      : cryptoType === 'usdt'
        ? payConfig.crypto?.usdt?.address || ''
        : ''

  const activeHandle =
    paymentMethod === 'cashapp'
      ? payConfig.cashapp?.handle || ''
      : paymentMethod === 'venmo'
        ? payConfig.venmo?.handle || ''
        : paymentMethod === 'chipper'
          ? payConfig.chipperCash?.handle || ''
          : ''

  const addToCart = (product: Product) => {
    const quantity = selectedQuantity[product.id] || 1
    const existingItem = cart.find((item) => item.id === product.id)
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, item.stock) }
            : item
        )
      )
    } else {
      setCart([...cart, { ...product, quantity }])
    }
    setSelectedQuantity({ ...selectedQuantity, [product.id]: 1 })
  }

  const toggleWishlist = (productId: string | number) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    )
  }

  const removeFromCart = (productId: string | number) => {
    setCart(cart.filter((item) => item.id !== productId))
  }

  const updateQuantity = (productId: string | number, quantity: number) => {
    const product = cart.find((item) => item.id === productId)
    if (product && quantity > 0 && quantity <= product.stock) {
      setCart(cart.map((item) => (item.id === productId ? { ...item, quantity } : item)))
    } else if (quantity <= 0) {
      removeFromCart(productId)
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

  const handlePaymentMethodSelect = (method: ShopPayMethod) => {
    setPaymentMethod(method)
    setCryptoType('')
  }

  const handlePaymentConfirmation = async () => {
    if (!customerDetails.email || !paymentMethod) {
      alert('Please complete payment details')
      return
    }
    if (paymentMethod === 'crypto' && !cryptoType) {
      alert('Please select BTC or USDT')
      return
    }

    setCheckoutStep('loader')
    setIsLoading(true)

    try {
      const orderData = {
        items: cart,
        total: totalPrice,
        customer: customerDetails,
        paymentMethod,
        cryptoType: paymentMethod === 'crypto' ? cryptoType : null,
        cryptoWallet: paymentMethod === 'crypto' ? activeCryptoAddress : null,
        paymentHandle: paymentMethod !== 'crypto' ? activeHandle : null,
        timestamp: new Date().toISOString(),
      }

      const response = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      })

      if (response.ok) {
        await new Promise((resolve) => setTimeout(resolve, 1500))
        setCheckoutStep('confirmation')
        setCart([])
      } else {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to submit order')
      }
    } catch (error: any) {
      console.error('Order submission error:', error)
      setCheckoutStep('payment')
      alert(error.message || 'Failed to submit order. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const resetCheckout = () => {
    setCheckoutOpen(false)
    setCheckoutStep('cart')
    setCustomerDetails({ email: '', phone: '', address: '', altPhone: '' })
    setPaymentMethod('')
    setCryptoType('')
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={shopHeroImage} alt="Shop Collection" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6">
              <h1 className="text-white text-3xl sm:text-5xl font-bold tracking-widest mb-1 sm:mb-2">
                EXCLUSIVE SHOP
              </h1>
              <p className="text-gray-300 text-sm sm:text-base tracking-wider">
                Premium Jonathan Roumie Merchandise
              </p>
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
              className="fixed bottom-6 right-4 sm:bottom-8 sm:right-6 z-40 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 sm:px-6 sm:py-4 rounded-full flex items-center gap-2 shadow-lg disabled:opacity-50"
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
                className="bg-white/5 border border-white/10 rounded-lg overflow-hidden hover:border-white/30 transition-all group"
              >
                <div className="relative aspect-square overflow-hidden bg-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div
                    className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold text-white ${
                      product.stock > 20
                        ? 'bg-green-600'
                        : product.stock > 10
                          ? 'bg-yellow-600'
                          : 'bg-red-600'
                    }`}
                  >
                    {product.stock} LEFT
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    onClick={() => toggleWishlist(product.id)}
                    className="absolute top-2 left-2 bg-white/80 hover:bg-white p-2 rounded-full"
                  >
                    <Heart
                      size={18}
                      className={
                        wishlist.includes(product.id) ? 'fill-red-600 text-red-600' : 'text-gray-600'
                      }
                    />
                  </motion.button>
                </div>

                <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                  <div>
                    <h3 className="text-white font-bold text-sm sm:text-base line-clamp-2 group-hover:text-blue-400">
                      {product.name}
                    </h3>
                    <p className="text-gray-400 text-xs line-clamp-1">{product.description}</p>
                  </div>
                  <span className="text-blue-400 font-bold text-lg sm:text-xl">
                    ${Number(product.price).toFixed(2)}
                  </span>

                  <div className="flex items-center gap-1 bg-white/5 rounded p-1">
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedQuantity({
                          ...selectedQuantity,
                          [product.id]: Math.max(1, (selectedQuantity[product.id] || 1) - 1),
                        })
                      }
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
                      min={1}
                      max={product.stock}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedQuantity({
                          ...selectedQuantity,
                          [product.id]: Math.min(
                            product.stock,
                            (selectedQuantity[product.id] || 1) + 1
                          ),
                        })
                      }
                      className="text-white/60 hover:text-white px-2 py-1 text-sm"
                    >
                      +
                    </button>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => addToCart(product)}
                    disabled={product.stock === 0}
                    className={`w-full py-2 sm:py-3 font-bold text-sm sm:text-base rounded transition-all ${
                      product.stock === 0
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
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

      {checkoutOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center p-4"
          onClick={() => !isLoading && resetCheckout()}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            className="bg-gradient-to-b from-gray-900 to-black w-full sm:max-w-2xl rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 p-4 sm:p-6 flex justify-between items-center z-10">
              <h2 className="text-white font-bold text-lg sm:text-2xl tracking-widest">
                {checkoutStep === 'loader'
                  ? 'PROCESSING'
                  : checkoutStep === 'confirmation'
                    ? 'SUCCESS'
                    : 'CHECKOUT'}
              </h2>
              {checkoutStep !== 'loader' && (
                <button type="button" onClick={resetCheckout} className="text-white hover:bg-white/20 p-2 rounded-full">
                  <X size={24} />
                </button>
              )}
            </div>

            <div className="p-4 sm:p-6 space-y-6">
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
                          <div
                            key={item.id}
                            className="bg-white/5 border border-white/10 rounded-lg p-3 sm:p-4 flex gap-3 sm:gap-4"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <h3 className="text-white font-bold text-sm sm:text-base line-clamp-2">
                                {item.name}
                              </h3>
                              <p className="text-blue-400 font-bold text-sm">${item.price.toFixed(2)}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-white/60 hover:text-white px-1">
                                  −
                                </button>
                                <span className="text-white font-bold text-sm min-w-[30px] text-center">
                                  {item.quantity}
                                </span>
                                <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-white/60 hover:text-white px-1">
                                  +
                                </button>
                                <button type="button" onClick={() => removeFromCart(item.id)} className="ml-auto text-red-500 text-sm">
                                  Remove
                                </button>
                              </div>
                            </div>
                            <p className="text-white font-bold text-sm">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-white/10 pt-4">
                        <div className="flex justify-between items-center mb-6">
                          <span className="text-white text-lg font-bold">TOTAL:</span>
                          <span className="text-blue-400 text-2xl font-bold">${totalPrice.toFixed(2)}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCheckoutStep('customer')}
                          className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white font-bold py-3 sm:py-4 rounded-lg"
                        >
                          CONTINUE TO CHECKOUT
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}

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
                        onChange={(e) => setCustomerDetails({ ...customerDetails, email: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-white text-sm font-bold block mb-2">PHONE *</label>
                      <input
                        type="tel"
                        value={customerDetails.phone}
                        onChange={(e) => setCustomerDetails({ ...customerDetails, phone: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-white text-sm font-bold block mb-2">ADDRESS *</label>
                      <input
                        type="text"
                        value={customerDetails.address}
                        onChange={(e) => setCustomerDetails({ ...customerDetails, address: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-white text-sm font-bold block mb-2">ALT PHONE (Optional)</label>
                      <input
                        type="tel"
                        value={customerDetails.altPhone}
                        onChange={(e) => setCustomerDetails({ ...customerDetails, altPhone: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button type="button" onClick={() => setCheckoutStep('cart')} className="flex-1 bg-white/10 text-white font-bold py-3 rounded-lg">
                        BACK
                      </button>
                      <button type="submit" className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-3 rounded-lg">
                        CONTINUE TO PAYMENT
                      </button>
                    </div>
                  </form>
                </>
              )}

              {checkoutStep === 'payment' && (
                <>
                  <div className="bg-purple-600/20 border border-purple-600/50 rounded-lg p-4">
                    <p className="text-purple-400 text-sm font-bold">STEP 2 OF 3: SELECT PAYMENT METHOD</p>
                  </div>

                  {!payConfigLoaded ? (
                    <div className="flex justify-center py-10">
                      <Loader2 size={28} className="text-blue-400 animate-spin" />
                    </div>
                  ) : !paymentMethod ? (
                    <div className="space-y-3">
                      {hasCrypto && (
                        <button
                          type="button"
                          onClick={() => handlePaymentMethodSelect('crypto')}
                          className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 text-white font-bold py-4 rounded-lg text-left px-6"
                        >
                          <div className="font-bold text-lg">CRYPTO (BTC / USDT)</div>
                          <div className="text-sm text-yellow-100">Secure blockchain payment</div>
                        </button>
                      )}
                      {hasCashapp && (
                        <button
                          type="button"
                          onClick={() => handlePaymentMethodSelect('cashapp')}
                          className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white font-bold py-4 rounded-lg text-left px-6"
                        >
                          <div className="font-bold text-lg">CASH APP</div>
                          <div className="text-sm text-green-100">{payConfig.cashapp?.handle}</div>
                        </button>
                      )}
                      {hasVenmo && (
                        <button
                          type="button"
                          onClick={() => handlePaymentMethodSelect('venmo')}
                          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 rounded-lg text-left px-6"
                        >
                          <div className="font-bold text-lg">VENMO</div>
                          <div className="text-sm text-blue-100">{payConfig.venmo?.handle}</div>
                        </button>
                      )}
                      {hasChipper && (
                        <button
                          type="button"
                          onClick={() => handlePaymentMethodSelect('chipper')}
                          className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold py-4 rounded-lg text-left px-6"
                        >
                          <div className="font-bold text-lg">CHIPPER CASH</div>
                          <div className="text-sm text-purple-100">{payConfig.chipperCash?.handle}</div>
                        </button>
                      )}
                      {!hasAnyPayment && (
                        <p className="text-gray-400 text-sm text-center py-8">
                          No payment methods configured yet.
                        </p>
                      )}
                      <button type="button" onClick={() => setCheckoutStep('customer')} className="w-full bg-white/10 text-white font-bold py-3 rounded-lg">
                        BACK
                      </button>
                    </div>
                  ) : (
                    <>
                      {paymentMethod === 'crypto' && !cryptoType && (
                        <div className="space-y-3">
                          <p className="text-white font-bold text-sm">SELECT CRYPTO TYPE:</p>
                          {hasBtc && (
                            <button type="button" onClick={() => setCryptoType('btc')} className="w-full bg-orange-600 text-white font-bold py-3 rounded-lg">
                              BITCOIN (BTC)
                            </button>
                          )}
                          {hasUsdt && (
                            <button type="button" onClick={() => setCryptoType('usdt')} className="w-full bg-green-600 text-white font-bold py-3 rounded-lg">
                              USDT (TETHER)
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setPaymentMethod('')
                              setCryptoType('')
                            }}
                            className="w-full bg-white/10 text-white font-bold py-3 rounded-lg"
                          >
                            CHANGE PAYMENT METHOD
                          </button>
                        </div>
                      )}

                      {(paymentMethod !== 'crypto' || cryptoType) && (
                        <>
                          <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
                            <p className="text-gray-400 text-sm mb-1">SEND PAYMENT TO:</p>

                            {paymentMethod === 'crypto' ? (
                              <>
                                <p className="text-white text-xs mb-2">
                                  Wallet Address ({cryptoType?.toUpperCase()}):
                                </p>
                                <div className="bg-black/40 rounded px-4 py-3 break-all">
                                  <p
                                    className="text-green-400 font-bold text-sm font-mono select-all"
                                    style={{ userSelect: 'all' }}
                                  >
                                    {activeCryptoAddress || 'Address not available'}
                                  </p>
                                </div>
                                {activeCryptoAddress && <CopyButton value={activeCryptoAddress} />}
                              </>
                            ) : (
                              <>
                                <p className="text-white text-xs mb-2">
                                  {paymentMethod === 'cashapp'
                                    ? 'Cash App Handle'
                                    : paymentMethod === 'venmo'
                                      ? 'Venmo Handle'
                                      : 'Chipper Cash Handle'}
                                  :
                                </p>
                                <div className="bg-black/40 rounded px-4 py-3">
                                  <p
                                    className={`font-bold text-lg select-all ${
                                      paymentMethod === 'cashapp'
                                        ? 'text-green-400'
                                        : paymentMethod === 'venmo'
                                          ? 'text-blue-400'
                                          : 'text-purple-400'
                                    }`}
                                    style={{ userSelect: 'all' }}
                                  >
                                    {activeHandle}
                                  </p>
                                </div>
                                {activeHandle && <CopyButton value={activeHandle} />}
                              </>
                            )}

                            <div className="border-t border-white/10 pt-4">
                              <p className="text-white font-bold text-lg mb-2">ORDER TOTAL</p>
                              <p className="text-blue-400 text-3xl font-bold">${totalPrice.toFixed(2)}</p>
                            </div>
                          </div>

                          <div className="bg-yellow-600/20 border border-yellow-600/50 rounded-lg p-4">
                            <p className="text-yellow-400 text-xs font-bold mb-2">PAYMENT INSTRUCTIONS</p>
                            <p className="text-yellow-300 text-xs">
                              Include your email ({customerDetails.email}) in the payment note.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={handlePaymentConfirmation}
                            className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white font-bold py-4 rounded-lg text-lg"
                          >
                            I HAVE PAID ✓
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setPaymentMethod('')
                              setCryptoType('')
                            }}
                            className="w-full bg-white/10 text-white font-bold py-3 rounded-lg"
                          >
                            CHANGE PAYMENT METHOD
                          </button>
                        </>
                      )}
                    </>
                  )}
                </>
              )}

              {checkoutStep === 'confirmation' && (
                <>
                  <div className="text-center space-y-4 py-8">
                    <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto text-white text-3xl font-bold">
                      ✓
                    </div>
                    <h3 className="text-white text-2xl font-bold">ORDER RECEIVED!</h3>
                    <p className="text-gray-400">Thank you for your purchase.</p>
                  </div>
                  <div className="bg-green-600/20 border border-green-600/50 rounded-lg p-4 space-y-2">
                    <p className="text-green-400 text-xs font-bold">CONFIRMATION</p>
                    <p className="text-white text-sm">
                      We&apos;ll email <span className="text-blue-400 font-bold break-all">{customerDetails.email}</span> after payment is verified.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={resetCheckout}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 rounded-lg"
                  >
                    CONTINUE SHOPPING
                  </button>
                </>
              )}

              {checkoutStep === 'loader' && (
                <div className="text-center py-12 space-y-6">
                  <Loader2 size={56} className="text-blue-500 animate-spin mx-auto" />
                  <h3 className="text-white text-xl font-bold">PROCESSING YOUR ORDER</h3>
                  <p className="text-gray-400 text-sm">Please wait...</p>
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
